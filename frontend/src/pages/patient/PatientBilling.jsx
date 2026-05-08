import { useState, useEffect } from 'react';
import API from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';

const PatientBilling = () => {
  const [billings, setBillings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    API.get('/billing', { params: { page, limit: 10 } })
      .then((r) => { setBillings(r.data.billings); setTotalPages(r.data.totalPages); })
      .catch(() => {}).finally(() => setLoading(false));
  }, [page]);

  const columns = [
    { header: 'Date', render: (r) => new Date(r.date).toLocaleDateString() },
    { header: 'Items', render: (r) => <span className="text-sm">{r.items?.length || 0} items</span> },
    { header: 'Total', render: (r) => <span className="font-semibold">₹{r.totalAmount?.toLocaleString()}</span> },
    { header: 'Method', render: (r) => r.paymentMethod || '—' },
    { header: 'Status', render: (r) => <StatusBadge status={r.paymentStatus} /> },
  ];

  return (
    <div>
      <h1 className="page-title mb-6">My Bills</h1>
      <DataTable columns={columns} data={billings} loading={loading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
};

export default PatientBilling;
