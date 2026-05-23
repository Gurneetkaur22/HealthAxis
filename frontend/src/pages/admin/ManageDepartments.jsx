import { useState, useEffect } from 'react';
import API from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import FormInput, { FormTextarea } from '../../components/common/FormInput';
import StatusBadge from '../../components/common/StatusBadge';
import toast from 'react-hot-toast';

const ManageDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });

  const fetch = async () => { setLoading(true); try { const r = await API.get('/departments'); setDepartments(r.data); } catch {} setLoading(false); };
  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await API.put(`/departments/${editing._id}`, form); toast.success('Updated'); }
      else { await API.post('/departments', form); toast.success('Created'); }
      setModalOpen(false); setEditing(null); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleEdit = (d) => { setEditing(d); setForm({ name: d.name, description: d.description || '' }); setModalOpen(true); };
  const handleDelete = async (id) => { if (!confirm('Delete?')) return; try { await API.delete(`/departments/${id}`); toast.success('Deleted'); fetch(); } catch { toast.error('Failed'); } };

  const columns = [
    { header: 'Name', render: (r) => <span className="font-medium text-dark-800">{r.name}</span> },
    { header: 'Description', render: (r) => <span className="text-sm text-dark-500">{r.description || '—'}</span> },
    { header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { header: 'Actions', render: (r) => <div className="flex gap-2"><button onClick={() => handleEdit(r)} className="text-xs btn-secondary py-1 px-3">Edit</button><button onClick={() => handleDelete(r._id)} className="text-xs btn-danger py-1 px-3">Delete</button></div> },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">Manage Departments</h1>
        <button onClick={() => { setEditing(null); setForm({ name: '', description: '' }); setModalOpen(true); }} className="btn-primary">+ Add Department</button>
      </div>
      <DataTable columns={columns} data={departments} loading={loading} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Department' : 'Add Department'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput label="Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
          <FormTextarea label="Description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
          <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button></div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageDepartments;
