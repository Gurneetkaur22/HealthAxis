import { useState, useEffect } from 'react';
import API from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import toast from 'react-hot-toast';

const ManageAdmissions = () => {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => { setLoading(true); try { const r = await API.get('/admissions'); setAdmissions(r.data); } catch {} setLoading(false); };
  useEffect(() => { fetch(); }, []);

  const discharge = async (id) => {
    if (!confirm('Discharge this patient?')) return;
    try { await API.put(`/admissions/${id}/discharge`); toast.success('Patient discharged'); fetch(); }
    catch { toast.error('Failed'); }
  };

  const columns = [
    { header: 'Patient', render: (r) => r.patient?.user?.name || '—' },
    { header: 'Room', render: (r) => r.room?.roomNumber || '—' },
    { header: 'Bed', accessor: 'bedNumber' },
    { header: 'Doctor', render: (r) => r.doctor?.user?.name || '—' },
    { header: 'Admit Date', render: (r) => new Date(r.admitDate).toLocaleDateString() },
    { header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { header: 'Actions', render: (r) => r.status === 'admitted' ? (
      <button onClick={() => discharge(r._id)} className="text-xs btn-primary py-1 px-3">Discharge</button>
    ) : <span className="text-xs text-dark-400">{new Date(r.dischargeDate).toLocaleDateString()}</span> },
  ];

  return (
    <div>
      <h1 className="page-title mb-6">Manage Admissions</h1>
      <DataTable columns={columns} data={admissions} loading={loading} />
    </div>
  );
};

export default ManageAdmissions;
