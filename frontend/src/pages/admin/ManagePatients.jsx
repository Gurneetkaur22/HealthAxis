import { useState, useEffect } from 'react';
import API from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import SearchFilter from '../../components/common/SearchFilter';
import Modal from '../../components/common/Modal';
import FormInput, { FormSelect, FormTextarea } from '../../components/common/FormInput';
import toast from 'react-hot-toast';

const ManagePatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', age: '', gender: '', bloodGroup: '', phone: '', medicalHistory: '' });

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await API.get('/patients', { params: { page, limit: 10, search } });
      setPatients(res.data.patients);
      setTotalPages(res.data.totalPages);
    } catch { toast.error('Failed to fetch patients'); }
    setLoading(false);
  };

  useEffect(() => { fetchPatients(); }, [page, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await API.put(`/patients/${editing._id}`, form);
        toast.success('Patient updated');
      } else {
        await API.post('/patients', { ...form, password: form.password || 'patient123' });
        toast.success('Patient created');
      }
      setModalOpen(false); setEditing(null); fetchPatients();
    } catch (error) { toast.error(error.response?.data?.message || 'Operation failed'); }
  };

  const handleEdit = (pat) => {
    setEditing(pat);
    setForm({ name: pat.user?.name || '', email: pat.user?.email || '', password: '', age: pat.age || '', gender: pat.gender || '', bloodGroup: pat.bloodGroup || '', phone: pat.phone || '', medicalHistory: pat.medicalHistory || '' });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    try { await API.delete(`/patients/${id}`); toast.success('Patient deleted'); fetchPatients(); }
    catch { toast.error('Failed to delete'); }
  };

  const columns = [
    { header: 'Name', render: (r) => <div><p className="font-medium text-dark-800">{r.user?.name}</p><p className="text-xs text-dark-400">{r.user?.email}</p></div> },
    { header: 'Age', render: (r) => r.age || '—' },
    { header: 'Gender', render: (r) => r.gender || '—' },
    { header: 'Blood Group', render: (r) => r.bloodGroup || '—' },
    { header: 'Phone', render: (r) => r.phone || '—' },
    { header: 'Actions', render: (r) => (
      <div className="flex gap-2">
        <button onClick={() => handleEdit(r)} className="text-xs btn-secondary py-1 px-3">Edit</button>
        <button onClick={() => handleDelete(r._id)} className="text-xs btn-danger py-1 px-3">Delete</button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">Manage Patients</h1>
        <button onClick={() => { setEditing(null); setForm({ name: '', email: '', password: '', age: '', gender: '', bloodGroup: '', phone: '', medicalHistory: '' }); setModalOpen(true); }} className="btn-primary">+ Add Patient</button>
      </div>
      <SearchFilter searchValue={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search patients..." />
      <DataTable columns={columns} data={patients} loading={loading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Patient' : 'Add Patient'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Full Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
            <FormInput label="Email" type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required />
          </div>
          {!editing && <FormInput label="Password" type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} placeholder="Default: patient123" />}
          <div className="grid grid-cols-3 gap-4">
            <FormInput label="Age" type="number" value={form.age} onChange={(e) => setForm({...form, age: e.target.value})} />
            <FormSelect label="Gender" value={form.gender} onChange={(e) => setForm({...form, gender: e.target.value})}>
              <option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
            </FormSelect>
            <FormSelect label="Blood Group" value={form.bloodGroup} onChange={(e) => setForm({...form, bloodGroup: e.target.value})}>
              <option value="">Select</option>{['A+','A-','B+','B-','AB+','AB-','O+','O-'].map((bg) => <option key={bg} value={bg}>{bg}</option>)}
            </FormSelect>
          </div>
          <FormInput label="Phone" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
          <FormTextarea label="Medical History" value={form.medicalHistory} onChange={(e) => setForm({...form, medicalHistory: e.target.value})} />
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'} Patient</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManagePatients;
