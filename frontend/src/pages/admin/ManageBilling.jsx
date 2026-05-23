import { useState, useEffect } from 'react';
import API from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import toast from 'react-hot-toast';

const ManageBilling = () => {
  const [billings, setBillings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('');

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await API.get('/billing', { params: { page, limit: 10, paymentStatus: filter } });
      setBillings(res.data.billings);
      setTotalPages(res.data.totalPages);
    } catch {} setLoading(false);
  };
  useEffect(() => { fetch(); }, [page, filter]);

  const updatePayment = async (id, paymentStatus) => {
    try { await API.put(`/billing/${id}`, { paymentStatus }); toast.success('Updated'); fetch(); }
    catch { toast.error('Failed'); }
  };

  const columns = [
    { header: 'Patient', render: (r) => r.patient?.user?.name || '—' },
    { header: 'Amount', render: (r) => <span className="font-semibold">₹{r.totalAmount?.toLocaleString()}</span> },
    { header: 'Date', render: (r) => new Date(r.date).toLocaleDateString() },
    { header: 'Status', render: (r) => <StatusBadge status={r.paymentStatus} /> },
    { header: 'Method', render: (r) => r.paymentMethod || '—' },
    { header: 'Actions', render: (r) => r.paymentStatus !== 'paid' ? (
      <button onClick={() => updatePayment(r._id, 'paid')} className="text-xs btn-success py-1 px-3">Mark Paid</button>
    ) : <span className="text-xs text-dark-400">Paid ✓</span> },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">Manage Billing</h1>
        <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} className="input-field w-44">
          <option value="">All Status</option><option value="paid">Paid</option><option value="unpaid">Unpaid</option>
        </select>
      </div>
      <DataTable columns={columns} data={billings} loading={loading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
};

export default ManageBilling;
