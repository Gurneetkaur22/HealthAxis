import { useState, useEffect } from 'react';
import API from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import {
  HiOutlineShieldExclamation, HiOutlineExclamationCircle,
  HiOutlineCheckCircle, HiOutlineChevronDown, HiOutlineChevronUp,
  HiOutlinePhone, HiOutlineMail, HiOutlineInformationCircle,
  HiOutlineEye,
} from 'react-icons/hi';

// ─────────────────────────────────────────────────────────────
// Anomaly detector — runs on patient's own bills, no API needed
// ─────────────────────────────────────────────────────────────
function detectPatientAnomalies(billings) {
  const alerts = [];

  // 1. Duplicate: same amount on same day
  const dayMap = {};
  billings.forEach(b => {
    const day  = new Date(b.date).toDateString();
    const key  = `${day}__${Number(b.totalAmount)}`;
    if (!dayMap[key]) dayMap[key] = [];
    dayMap[key].push(b);
  });
  Object.values(dayMap).forEach(group => {
    if (group.length < 2) return;
    group.forEach(b => {
      alerts.push({
        billingId: b._id || b.id,
        type: 'duplicate',
        severity: 'high',
        title: 'Possible Duplicate Charge',
        message: `You were charged ₹${Number(b.totalAmount).toLocaleString('en-IN')} multiple times on ${new Date(b.date).toLocaleDateString('en-IN')}. This may be a duplicate charge.`,
        action: 'Contact the billing desk or HealthAxis admin immediately with this bill ID.',
        bill: b,
      });
    });
  });

  // 2. Unusually high amount (>3x average, min ₹5000)
  if (billings.length >= 3) {
    const amounts = billings.map(b => Number(b.totalAmount)).filter(a => a > 0);
    const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    billings.forEach(b => {
      const amt = Number(b.totalAmount);
      if (amt > avg * 3 && amt > 5000) {
        alerts.push({
          billingId: b._id || b.id,
          type: 'high_amount',
          severity: 'medium',
          title: 'Unusually High Charge',
          message: `Bill of ₹${amt.toLocaleString('en-IN')} on ${new Date(b.date).toLocaleDateString('en-IN')} is much higher than your usual charges (avg ₹${Math.round(avg).toLocaleString('en-IN')}).`,
          action: 'Request an itemised bill from HealthAxis billing desk to verify all charges.',
          bill: b,
        });
      }
    });
  }

  // 3. Payment status mismatch
  billings.forEach(b => {
    if (b.paymentMethod && b.paymentMethod !== 'cash' && b.paymentStatus === 'unpaid') {
      alerts.push({
        billingId: b._id || b.id,
        type: 'status_mismatch',
        severity: 'medium',
        title: 'Payment Status Mismatch',
        message: `Bill of ₹${Number(b.totalAmount).toLocaleString('en-IN')} shows payment via ${b.paymentMethod} but is still marked "Unpaid".`,
        action: 'Contact billing desk with your payment receipt to update status.',
        bill: b,
      });
    }
  });

  // De-duplicate
  const seen = new Set();
  return alerts.filter(a => {
    const k = `${a.billingId}__${a.type}`;
    if (seen.has(k)) return false;
    seen.add(k); return true;
  });
}

// ─────────────────────────────────────────────────────────────
// Alert Banner
// ─────────────────────────────────────────────────────────────
const severityStyle = {
  high:   { bar: 'bg-red-500',   border: 'border-red-300',   bg: 'bg-red-50',   left: 'border-l-red-500',   icon: 'text-red-500',   badge: 'bg-red-100 text-red-700',   label: 'Urgent'  },
  medium: { bar: 'bg-amber-500', border: 'border-amber-300', bg: 'bg-amber-50', left: 'border-l-amber-500', icon: 'text-amber-500', badge: 'bg-amber-100 text-amber-700', label: 'Review'  },
};

const AlertBanner = ({ alerts, onViewBill }) => {
  const [expanded, setExpanded] = useState(true);
  const highCount = alerts.filter(a => a.severity === 'high').length;
  const barColor  = highCount > 0 ? 'bg-red-500' : 'bg-amber-500';
  const borderColor = highCount > 0 ? 'border-red-300' : 'border-amber-300';

  return (
    <div className={`rounded-xl border-2 overflow-hidden ${borderColor}`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className={`w-full flex items-center justify-between px-5 py-4 text-left ${barColor}`}
      >
        <div className="flex items-center gap-3">
          <HiOutlineShieldExclamation className="w-6 h-6 text-white flex-shrink-0" />
          <div>
            <p className="font-bold text-white text-sm">
              ⚠️ {alerts.length} Billing Alert{alerts.length > 1 ? 's' : ''} Found on Your Account
            </p>
            <p className="text-xs text-white/80">
              {highCount > 0
                ? `${highCount} urgent issue${highCount > 1 ? 's' : ''} require your immediate attention`
                : 'Please review your billing charges'}
            </p>
          </div>
        </div>
        {expanded
          ? <HiOutlineChevronUp className="w-5 h-5 text-white" />
          : <HiOutlineChevronDown className="w-5 h-5 text-white" />}
      </button>

      {/* Alert list */}
      {expanded && (
        <div className="divide-y divide-gray-100 bg-white">
          {alerts.map((alert, i) => {
            const s = severityStyle[alert.severity] || severityStyle.medium;
            return (
              <div key={i} className={`p-4 ${s.bg} border-l-4 ${s.left}`}>
                <div className="flex items-start gap-3">
                  <HiOutlineExclamationCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${s.icon}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.badge}`}>{s.label}</span>
                      <span className="text-xs font-semibold text-gray-700">{alert.title}</span>
                    </div>
                    <p className="text-sm text-gray-800 mb-1">{alert.message}</p>
                    <p className="text-xs text-gray-500 mb-2">👉 {alert.action}</p>
                    <button
                      onClick={() => onViewBill(alert.bill)}
                      className="text-xs font-semibold text-primary-600 hover:underline flex items-center gap-1"
                    >
                      <HiOutlineEye className="w-3.5 h-3.5" /> View this bill →
                    </button>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm font-bold text-gray-800">₹{Number(alert.bill.totalAmount).toLocaleString('en-IN')}</p>
                    <p className="text-xs text-gray-400">{new Date(alert.bill.date).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Contact bar */}
          <div className="px-5 py-3 bg-gray-50 flex items-center gap-6 flex-wrap">
            <p className="text-xs font-semibold text-gray-600 flex items-center gap-1">
              <HiOutlineInformationCircle className="w-4 h-4" /> Contact HealthAxis Billing Desk:
            </p>
            <a href="tel:+911800000000" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
              <HiOutlinePhone className="w-3.5 h-3.5" /> 1800-000-0000
            </a>
            <a href="mailto:billing@healthaxis.com" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
              <HiOutlineMail className="w-3.5 h-3.5" /> billing@healthaxis.com
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Bill Detail Modal
// ─────────────────────────────────────────────────────────────
const BillDetailModal = ({ bill, onClose }) => {
  if (!bill) return null;
  return (
    <Modal isOpen={!!bill} onClose={onClose} title="Bill Details" size="md">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-gray-500">Date: </span><span className="font-medium">{new Date(bill.date).toLocaleDateString('en-IN')}</span></div>
          <div className="flex items-center gap-2"><span className="text-gray-500">Status: </span><StatusBadge status={bill.paymentStatus} /></div>
          <div><span className="text-gray-500">Method: </span><span className="font-medium capitalize">{bill.paymentMethod || '—'}</span></div>
          <div><span className="text-gray-500">Total: </span><span className="font-bold text-lg text-primary-600">₹{Number(bill.totalAmount).toLocaleString('en-IN')}</span></div>
        </div>

        {bill.items?.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Itemised Charges</p>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Item</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Category</th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {bill.items.map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-800">{item.description || item.name || '—'}</td>
                      <td className="px-3 py-2 text-gray-500 capitalize">{item.category || '—'}</td>
                      <td className="px-3 py-2 text-right font-medium">₹{Number(item.amount || 0).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={2} className="px-3 py-2 font-bold text-gray-700 text-right">Total</td>
                    <td className="px-3 py-2 text-right font-bold text-primary-600">₹{Number(bill.totalAmount).toLocaleString('en-IN')}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
          <p className="text-xs text-blue-700 font-semibold mb-1">🏥 Dispute this charge?</p>
          <p className="text-xs text-blue-600">
            If you believe this charge is incorrect, visit the billing desk with Bill ID:{' '}
            <strong className="font-mono">{String(bill._id || bill.id).slice(-8).toUpperCase()}</strong>
            {' '}or call <strong>1800-000-0000</strong>.
          </p>
        </div>
      </div>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────
const PatientBilling = () => {
  const [billings, setBillings]         = useState([]);
  const [allBillings, setAllBillings]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [page, setPage]                 = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const [alerts, setAlerts]             = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);

  // Paginated bills for table
  useEffect(() => {
    setLoading(true);
    API.get('/billing', { params: { page, limit: 10 } })
      .then(r => { setBillings(r.data.billings || []); setTotalPages(r.data.totalPages || 1); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  // All bills for anomaly detection
  useEffect(() => {
    API.get('/billing', { params: { page: 1, limit: 500 } })
      .then(r => {
        const all = r.data.billings || [];
        setAllBillings(all);
        setAlerts(detectPatientAnomalies(all));
      })
      .catch(() => {});
  }, []);

  const totalSpend  = allBillings.reduce((s, b) => s + Number(b.totalAmount || 0), 0);
  const unpaidAmt   = allBillings.filter(b => b.paymentStatus === 'unpaid').reduce((s, b) => s + Number(b.totalAmount || 0), 0);
  const paidCount   = allBillings.filter(b => b.paymentStatus === 'paid').length;

  const columns = [
    {
      header: 'Date',
      render: (r) => {
        const hasAlert = alerts.some(a => a.billingId === (r._id || r.id));
        return (
          <div className="flex items-center gap-2">
            {hasAlert && (
              <span title="Billing alert detected" className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 animate-pulse" />
            )}
            <span>{new Date(r.date).toLocaleDateString('en-IN')}</span>
          </div>
        );
      },
    },
    { header: 'Items',  render: (r) => <span className="text-sm text-dark-500">{r.items?.length || 0} item{r.items?.length !== 1 ? 's' : ''}</span> },
    { header: 'Total',  render: (r) => <span className="font-semibold text-dark-800">₹{Number(r.totalAmount).toLocaleString('en-IN')}</span> },
    { header: 'Method', render: (r) => <span className="capitalize text-dark-500">{r.paymentMethod || '—'}</span> },
    { header: 'Status', render: (r) => <StatusBadge status={r.paymentStatus} /> },
    {
      header: '',
      render: (r) => (
        <button onClick={() => setSelectedBill(r)} className="text-xs text-primary-600 hover:underline font-medium flex items-center gap-1">
          <HiOutlineEye className="w-3.5 h-3.5" /> View
        </button>
      ),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="page-title">My Bills</h1>

      {/* Fraud / anomaly alerts */}
      {alerts.length > 0 && (
        <AlertBanner alerts={alerts} onViewBill={setSelectedBill} />
      )}

      {/* All clear */}
      {!loading && alerts.length === 0 && allBillings.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 border border-green-200">
          <HiOutlineCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-700">All charges look normal</p>
            <p className="text-xs text-green-600">No duplicate or suspicious billing detected across your {allBillings.length} bill{allBillings.length !== 1 ? 's' : ''}.</p>
          </div>
        </div>
      )}

      {/* Summary cards */}
      {allBillings.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="card text-center">
            <p className="text-xl font-bold text-dark-800">₹{totalSpend.toLocaleString('en-IN')}</p>
            <p className="text-xs text-dark-400 mt-1">Total Billed</p>
          </div>
          <div className="card text-center">
            <p className="text-xl font-bold text-red-600">₹{unpaidAmt.toLocaleString('en-IN')}</p>
            <p className="text-xs text-dark-400 mt-1">Pending Payment</p>
          </div>
          <div className="card text-center">
            <p className="text-xl font-bold text-green-600">{paidCount}</p>
            <p className="text-xs text-dark-400 mt-1">Bills Paid</p>
          </div>
        </div>
      )}

      {/* Bills table */}
      <div className="card">
        <h2 className="font-semibold text-dark-800 mb-4">Billing History</h2>
        <DataTable columns={columns} data={billings} loading={loading} />
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Info footer */}
      <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
        <p className="text-xs font-semibold text-blue-700 mb-1">🔒 Your billing is automatically monitored by HealthAxis</p>
        <p className="text-xs text-blue-600">
          Every time you open this page, HealthAxis automatically checks your bills for duplicate charges,
          unusually high amounts, and payment status mismatches. If anything looks wrong, you'll see a red alert at the top.
        </p>
      </div>

      {/* Bill detail modal */}
      <BillDetailModal bill={selectedBill} onClose={() => setSelectedBill(null)} />
    </div>
  );
};

export default PatientBilling;
