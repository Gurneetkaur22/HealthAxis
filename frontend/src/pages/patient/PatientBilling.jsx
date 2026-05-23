import { useState, useEffect } from 'react';
import API from '../../api/axios';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import {
  HiOutlineExclamationCircle, HiOutlineShieldExclamation,
  HiOutlineCheckCircle, HiOutlineChevronDown, HiOutlineChevronUp,
  HiOutlinePhone, HiOutlineMail, HiOutlineInformationCircle
} from 'react-icons/hi';

// ─────────────────────────────────────────────────────────────
// Duplicate / anomaly detector (runs on patient's own bills)
// ─────────────────────────────────────────────────────────────
function detectPatientAnomalies(billings) {
  const alerts = [];

  // 1. Duplicate: same amount on same day
  const dayMap = {};
  billings.forEach(b => {
    const day = new Date(b.date).toDateString();
    const key = `${day}__${Number(b.totalAmount)}`;
    if (!dayMap[key]) dayMap[key] = [];
    dayMap[key].push(b);
  });
  Object.values(dayMap).forEach(group => {
    if (group.length >= 2) {
      group.forEach(b => {
        alerts.push({
          billingId: b._id || b.id,
          type: 'duplicate',
          severity: 'high',
          message: `You were charged ₹${Number(b.totalAmount).toLocaleString('en-IN')} multiple times on ${new Date(b.date).toLocaleDateString('en-IN')}. This may be a duplicate charge.`,
          action: 'Please contact the billing desk or hospital admin immediately.',
          bill: b,
        });
      });
    }
  });

  // 2. Unusually high amount (>3x average)
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
          message: `Bill of ₹${amt.toLocaleString('en-IN')} on ${new Date(b.date).toLocaleDateString('en-IN')} is significantly higher than your usual charges (avg ₹${Math.round(avg).toLocaleString('en-IN')}).`,
          action: 'Request an itemised bill from the hospital to verify all charges.',
          bill: b,
        });
      }
    });
  }

  // 3. Paid but status still unpaid (data inconsistency)
  billings.forEach(b => {
    if (b.paymentMethod !== 'cash' && b.paymentStatus === 'unpaid') {
      alerts.push({
        billingId: b._id || b.id,
        type: 'status_mismatch',
        severity: 'medium',
        message: `Bill of ₹${Number(b.totalAmount).toLocaleString('en-IN')} shows payment via ${b.paymentMethod} but status is still "Unpaid".`,
        action: 'Contact billing desk with your payment receipt to update status.',
        bill: b,
      });
    }
  });

  // De-duplicate by billingId+type
  const seen = new Set();
  return alerts.filter(a => {
    const k = `${a.billingId}__${a.type}`;
    if (seen.has(k)) return false;
    seen.add(k); return true;
  });
}

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────
const severityStyle = {
  high:   { banner: 'bg-red-50 border-red-300',   icon: 'text-red-500',   badge: 'bg-red-100 text-red-700',   label: 'Urgent' },
  medium: { banner: 'bg-amber-50 border-amber-300', icon: 'text-amber-500', badge: 'bg-amber-100 text-amber-700', label: 'Review' },
};

const AlertBanner = ({ alerts, onViewBill }) => {
  const [expanded, setExpanded] = useState(true);
  const highCount = alerts.filter(a => a.severity === 'high').length;

  return (
    <div className={`rounded-xl border-2 overflow-hidden ${highCount > 0 ? 'border-red-300' : 'border-amber-300'}`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className={`w-full flex items-center justify-between px-5 py-4 text-left ${highCount > 0 ? 'bg-red-500' : 'bg-amber-500'}`}
      >
        <div className="flex items-center gap-3">
          <HiOutlineShieldExclamation className="w-6 h-6 text-white flex-shrink-0" />
          <div>
            <p className="font-bold text-white text-sm">
              ⚠️ {alerts.length} Billing Alert{alerts.length > 1 ? 's' : ''} Detected
            </p>
            <p className="text-xs text-white/80">
              {highCount > 0 ? `${highCount} urgent issue${highCount > 1 ? 's' : ''} require your attention` : 'Please review your billing charges'}
            </p>
          </div>
        </div>
        {expanded
          ? <HiOutlineChevronUp className="w-5 h-5 text-white" />
          : <HiOutlineChevronDown className="w-5 h-5 text-white" />
        }
      </button>

      {/* Alerts list */}
      {expanded && (
        <div className="divide-y divide-gray-100 bg-white">
          {alerts.map((alert, i) => {
            const s = severityStyle[alert.severity] || severityStyle.medium;
            return (
              <div key={i} className={`p-4 ${s.banner} border-l-4 ${alert.severity === 'high' ? 'border-l-red-500' : 'border-l-amber-500'}`}>
                <div className="flex items-start gap-3">
                  <HiOutlineExclamationCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${s.icon}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.badge}`}>{s.label}</span>
                      <span className="text-xs text-gray-500 capitalize">{alert.type.replace(/_/g, ' ')}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-800 mb-1">{alert.message}</p>
                    <p className="text-xs text-gray-600 mb-2">👉 {alert.action}</p>
                    <button
                      onClick={() => onViewBill(alert.bill)}
                      className="text-xs font-medium text-primary-600 hover:underline"
                    >
                      View this bill →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Contact info */}
          <div className="px-4 py-3 bg-gray-50 flex items-center gap-6 flex-wrap">
            <p className="text-xs font-semibold text-gray-600 flex items-center gap-1">
              <HiOutlineInformationCircle className="w-4 h-4" /> Contact Billing Desk:
            </p>
            <a href="tel:+911800000000" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
              <HiOutlinePhone className="w-3.5 h-3.5" /> 1800-000-0000
            </a>
            <a href="mailto:billing@hospital.com" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
              <HiOutlineMail className="w-3.5 h-3.5" /> billing@hospital.com
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

const BillDetailModal = ({ bill, onClose }) => {
  if (!bill) return null;
  return (
    <Modal isOpen={!!bill} onClose={onClose} title="Bill Details" size="md">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-gray-500">Date:</span> <span className="font-medium">{new Date(bill.date).toLocaleDateString('en-IN')}</span></div>
          <div><span className="text-gray-500">Status:</span> <StatusBadge status={bill.paymentStatus} /></div>
          <div><span className="text-gray-500">Method:</span> <span className="font-medium capitalize">{bill.paymentMethod}</span></div>
          <div><span className="text-gray-500">Total:</span> <span className="font-bold text-lg text-primary-600">₹{Number(bill.totalAmount).toLocaleString('en-IN')}</span></div>
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
          <p className="text-xs text-blue-700 font-medium mb-1">🏥 Dispute this charge?</p>
          <p className="text-xs text-blue-600">If you believe this charge is incorrect, please visit the billing desk with this bill ID: <strong>{String(bill._id || bill.id).slice(-8).toUpperCase()}</strong> or call <strong>1800-000-0000</strong>.</p>
        </div>
      </div>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────
const PatientBilling = () => {
  const [billings, setBillings]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [alerts, setAlerts]         = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [allBillings, setAllBillings]   = useState([]); // for anomaly detection across all pages

  // Fetch paginated for display
  useEffect(() => {
    setLoading(true);
    API.get('/billing', { params: { page, limit: 10 } })
      .then(r => {
        setBillings(r.data.billings || []);
        setTotalPages(r.data.totalPages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  // Fetch ALL bills once for anomaly detection
  useEffect(() => {
    API.get('/billing', { params: { page: 1, limit: 200 } })
      .then(r => {
        const all = r.data.billings || [];
        setAllBillings(all);
        setAlerts(detectPatientAnomalies(all));
      })
      .catch(() => {});
  }, []);

  const totalSpend = allBillings.reduce((s, b) => s + Number(b.totalAmount || 0), 0);
  const unpaidAmt  = allBillings.filter(b => b.paymentStatus === 'unpaid').reduce((s, b) => s + Number(b.totalAmount || 0), 0);
  const paidCount  = allBillings.filter(b => b.paymentStatus === 'paid').length;

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
            <p className="text-xs text-green-600">No duplicate or suspicious billing detected across your {allBillings.length} bill{allBillings.length > 1 ? 's' : ''}.</p>
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
        {loading ? (
          <div className="text-center py-10 text-dark-400">Loading…</div>
        ) : billings.length === 0 ? (
          <div className="text-center py-10 text-dark-400">No billing records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-dark-500 text-xs uppercase tracking-wider">
                  {['Date', 'Items', 'Total', 'Method', 'Status', ''].map(h => (
                    <th key={h} className="text-left pb-2 font-medium pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {billings.map(b => {
                  const hasAlert = alerts.some(a => a.billingId === (b._id || b.id));
                  return (
                    <tr key={b._id || b.id} className={`hover:bg-gray-50 ${hasAlert ? 'bg-red-50' : ''}`}>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          {hasAlert && <span title="Alert detected" className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />}
                          {new Date(b.date).toLocaleDateString('en-IN')}
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-dark-500">{b.items?.length || 0} item{b.items?.length !== 1 ? 's' : ''}</td>
                      <td className="py-3 pr-4 font-semibold text-dark-800">₹{Number(b.totalAmount).toLocaleString('en-IN')}</td>
                      <td className="py-3 pr-4 capitalize text-dark-500">{b.paymentMethod}</td>
                      <td className="py-3 pr-4"><StatusBadge status={b.paymentStatus} /></td>
                      <td className="py-3">
                        <button
                          onClick={() => setSelectedBill(b)}
                          className="text-xs text-primary-600 hover:underline font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Info box */}
      <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
        <p className="text-xs font-semibold text-blue-700 mb-1">🔒 Your billing is automatically monitored</p>
        <p className="text-xs text-blue-600">
          Our system automatically checks your bills for duplicate charges, unusually high amounts,
          and payment status mismatches every time you visit this page. If anything looks wrong, you'll see an alert above.
        </p>
      </div>

      {/* Bill detail modal */}
      <BillDetailModal bill={selectedBill} onClose={() => setSelectedBill(null)} />
    </div>
  );
};

export default PatientBilling;
