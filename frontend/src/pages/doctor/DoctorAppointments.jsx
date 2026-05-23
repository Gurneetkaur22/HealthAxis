import { useState, useEffect } from 'react';
import API from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import { useNavigate } from 'react-router-dom';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/appointments', { params: { page, limit: 10 } })
      .then((r) => { setAppointments(r.data.appointments); setTotalPages(r.data.totalPages); })
      .catch(console.error).finally(() => setLoading(false));
  }, [page]);

  const columns = [
    { header: 'Patient', render: (r) => r.patient?.user?.name || '—' },
    { header: 'Date', render: (r) => new Date(r.date).toLocaleDateString() },
    { header: 'Time', accessor: 'timeSlot' },
    { header: 'Reason', render: (r) => <span className="text-sm truncate max-w-[200px] block">{r.reason || '—'}</span> },
    { header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { header: 'Actions', render: (r) => <button onClick={() => navigate(`/doctor/appointments/${r._id}`)} className="text-xs btn-primary py-1 px-3">View Details</button> },
  ];

  return (
    <div>
      <h1 className="page-title mb-6">My Appointments</h1>
      <DataTable columns={columns} data={appointments} loading={loading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
};

export default DoctorAppointments;
