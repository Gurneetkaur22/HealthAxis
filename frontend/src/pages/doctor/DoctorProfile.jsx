import { useState, useEffect } from 'react';
import API from '../../api/axios';
import FormInput from '../../components/common/FormInput';
import FileUpload from '../../components/common/FileUpload';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const DoctorProfile = () => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({});

  useEffect(() => {
    API.get('/doctors/my/profile').then((r) => { setDoctor(r.data); setForm({ specialization: r.data.specialization, qualification: r.data.qualification, phone: r.data.phone, consultationFee: r.data.consultationFee }); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try { await API.put(`/doctors/${doctor._id}`, form); toast.success('Profile updated'); } catch { toast.error('Failed'); }
  };

  const handleAvatar = async (file) => {
    const fd = new FormData(); fd.append('avatar', file);
    try { const r = await API.post(`/doctors/${doctor._id}/avatar`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }); toast.success('Avatar updated'); } catch { toast.error('Upload failed'); }
  };

  if (loading) return <LoadingSpinner />;
  if (!doctor) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="page-title mb-6">My Profile</h1>
      <div className="card space-y-6">
        <FileUpload onUpload={handleAvatar} currentImage={doctor.user?.avatar} label="Profile Photo" />
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Name</label><p className="text-dark-800 font-medium">{doctor.user?.name}</p></div>
            <div><label className="label">Email</label><p className="text-dark-800">{doctor.user?.email}</p></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Specialization" value={form.specialization || ''} onChange={(e) => setForm({...form, specialization: e.target.value})} />
            <FormInput label="Qualification" value={form.qualification || ''} onChange={(e) => setForm({...form, qualification: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Phone" value={form.phone || ''} onChange={(e) => setForm({...form, phone: e.target.value})} />
            <FormInput label="Consultation Fee" type="number" value={form.consultationFee || ''} onChange={(e) => setForm({...form, consultationFee: e.target.value})} />
          </div>
          <button type="submit" className="btn-primary">Update Profile</button>
        </form>
      </div>
    </div>
  );
};

export default DoctorProfile;
