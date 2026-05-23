import { useState, useEffect } from 'react';
import API from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import FormInput, { FormSelect } from '../../components/common/FormInput';
import toast from 'react-hot-toast';

const ManageReceptionists = () => {
  const [receptionists, setReceptionists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', shift: 'Morning' });

  const fetch = async () => { setLoading(true); try { const r = await API.get('/receptionists'); setReceptionists(r.data); } catch {} setLoading(false); };
  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await API.put(`/receptionists/${editing._id}`, form); toast.success('Updated'); }
      else { await API.post('/receptionists', { ...form, password: form.password || 'reception123' }); toast.success('Created'); }
      setModalOpen(false); setEditing(null); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleEdit = (r) => { setEditing(r); setForm({ name: r.user?.name || '', email: r.user?.email || '', password: '', phone: r.phone || '', shift: r.shift || 'Morning' }); setModalOpen(true); };
  const handleDelete = async (id) => { if (!confirm('Delete?')) return; try { await API.delete(`/receptionists/${id}`); toast.success('Deleted'); fetch(); } catch { toast.error('Failed'); } };

  const columns = [
    { header: 'Name', render: (r) => <div><p className="font-medium">{r.user?.name}</p><p className="text-xs text-dark-400">{r.user?.email}</p></div> },
    { header: 'Phone', render: (r) => r.phone || '—' },
    { header: 'Shift', accessor: 'shift' },
    { header: 'Actions', render: (r) => <div className="flex gap-2"><button onClick={() => handleEdit(r)} className="text-xs btn-secondary py-1 px-3">Edit</button><button onClick={() => handleDelete(r._id)} className="text-xs btn-danger py-1 px-3">Delete</button></div> },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">Manage Receptionists</h1>
        <button onClick={() => { setEditing(null); setForm({ name: '', email: '', password: '', phone: '', shift: 'Morning' }); setModalOpen(true); }} className="btn-primary">+ Add Receptionist</button>
      </div>
      <DataTable columns={columns} data={receptionists} loading={loading} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Receptionist' : 'Add Receptionist'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput label="Full Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
          <FormInput label="Email" type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required />
          {!editing && <FormInput label="Password" type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} placeholder="Default: reception123" />}
          <FormInput label="Phone" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
          <FormSelect label="Shift" value={form.shift} onChange={(e) => setForm({...form, shift: e.target.value})} options={[{value:'Morning',label:'Morning'},{value:'Afternoon',label:'Afternoon'},{value:'Night',label:'Night'}]} />
          <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button></div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageReceptionists;
