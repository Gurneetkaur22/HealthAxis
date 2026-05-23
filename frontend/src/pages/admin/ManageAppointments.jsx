import { useState, useEffect } from 'react';
import API from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import SearchFilter from '../../components/common/SearchFilter';
import StatusBadge from '../../components/common/StatusBadge';
import toast from 'react-hot-toast';

const ManageAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ status: '' });

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await API.get('/appointments', { params: { page, limit: 10, ...filters } });
      setAppointments(res.data.appointments);
      setTotalPages(res.data.totalPages);
    } catch { toast.error('Failed to load'); }
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [page, filters]);

  const updateStatus = async (id, status) => {
    try { await API.put(`/appointments/${id}`, { status }); toast.success('Status updated'); fetch(); }
    catch { toast.error('Failed'); }
  };

  const columns = [
    { header: 'Patient', render: (r) => r.patient?.user?.name || '—' },
    { header: 'Doctor', render: (r) => r.doctor?.user?.name || '—' },
    { header: 'Date', render: (r) => new Date(r.date).toLocaleDateString() },
    { header: 'Time', accessor: 'timeSlot' },
    { header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { header: 'Actions', render: (r) => (
      <select value={r.status} onChange={(e) => updateStatus(r._id, e.target.value)} className="text-xs border rounded px-2 py-1">
        <option value="pending">Pending</option><option value="confirmed">Confirmed</option>
        <option value="completed">Completed</option><option value="cancelled">Cancelled</option>
      </select>
    )},
  ];

  return (
    <div>
      <h1 className="page-title mb-6">Manage Appointments</h1>
      <SearchFilter searchValue="" onSearchChange={() => {}} placeholder="Search..."
        filters={[{ key: 'status', label: 'All Status', options: [{value:'pending',label:'Pending'},{value:'confirmed',label:'Confirmed'},{value:'completed',label:'Completed'},{value:'cancelled',label:'Cancelled'}] }]}
        filterValues={filters} onFilterChange={(k, v) => { setFilters({...filters, [k]: v}); setPage(1); }}
      />
      <DataTable columns={columns} data={appointments} loading={loading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
};

export default ManageAppointments;
