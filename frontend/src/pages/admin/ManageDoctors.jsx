import { useState, useEffect } from 'react';
import API from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import SearchFilter from '../../components/common/SearchFilter';
import Modal from '../../components/common/Modal';
import FormInput, { FormSelect, FormTextarea } from '../../components/common/FormInput';
import toast from 'react-hot-toast';

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', specialization: '', department: '', qualification: '', experience: '', phone: '', consultationFee: '' });

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await API.get('/doctors', { params: { page, limit: 10, search } });
      setDoctors(res.data.doctors);
      setTotalPages(res.data.totalPages);
    } catch { toast.error('Failed to fetch doctors'); }
    setLoading(false);
  };

  useEffect(() => { fetchDoctors(); }, [page, search]);
  useEffect(() => { API.get('/departments').then((r) => setDepartments(r.data)).catch(() => {}); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await API.put(`/doctors/${editing._id}`, form);
        toast.success('Doctor updated');
      } else {
        await API.post('/doctors', { ...form, password: form.password || 'doctor123' });
        toast.success('Doctor created');
      }
      setModalOpen(false);
      setEditing(null);
      setForm({ name: '', email: '', password: '', specialization: '', department: '', qualification: '', experience: '', phone: '', consultationFee: '' });
      fetchDoctors();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (doc) => {
    setEditing(doc);
    setForm({ name: doc.user?.name || '', email: doc.user?.email || '', password: '', specialization: doc.specialization, department: doc.department?._id || '', qualification: doc.qualification || '', experience: doc.experience || '', phone: doc.phone || '', consultationFee: doc.consultationFee || '' });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      await API.delete(`/doctors/${id}`);
      toast.success('Doctor deleted');
      fetchDoctors();
    } catch { toast.error('Failed to delete'); }
  };

  const columns = [
    { header: 'Name', render: (r) => <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-semibold">{r.user?.name?.charAt(0)}</div><div><p className="font-medium text-dark-800">{r.user?.name}</p><p className="text-xs text-dark-400">{r.user?.email}</p></div></div> },
    { header: 'Specialization', accessor: 'specialization' },
    { header: 'Department', render: (r) => r.department?.name || '—' },
    { header: 'Experience', render: (r) => `${r.experience} yrs` },
    { header: 'Fee', render: (r) => `₹${r.consultationFee}` },
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
        <h1 className="page-title">Manage Doctors</h1>
        <button onClick={() => { setEditing(null); setForm({ name: '', email: '', password: '', specialization: '', department: '', qualification: '', experience: '', phone: '', consultationFee: '' }); setModalOpen(true); }} className="btn-primary" id="add-doctor-btn">+ Add Doctor</button>
      </div>
      <SearchFilter searchValue={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search doctors..." />
      <DataTable columns={columns} data={doctors} loading={loading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Doctor' : 'Add Doctor'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Full Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
            <FormInput label="Email" type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required />
          </div>
          {!editing && <FormInput label="Password" type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} placeholder="Default: doctor123" />}
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Specialization" value={form.specialization} onChange={(e) => setForm({...form, specialization: e.target.value})} required />
            <FormSelect label="Department" value={form.department} onChange={(e) => setForm({...form, department: e.target.value})}>
              <option value="">Select Department</option>
              {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </FormSelect>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormInput label="Qualification" value={form.qualification} onChange={(e) => setForm({...form, qualification: e.target.value})} />
            <FormInput label="Experience (years)" type="number" value={form.experience} onChange={(e) => setForm({...form, experience: e.target.value})} />
            <FormInput label="Consultation Fee" type="number" value={form.consultationFee} onChange={(e) => setForm({...form, consultationFee: e.target.value})} />
          </div>
          <FormInput label="Phone" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'} Doctor</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageDoctors;
