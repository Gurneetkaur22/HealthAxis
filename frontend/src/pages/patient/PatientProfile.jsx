import { useState, useEffect } from 'react';
import API from '../../api/axios';
import FormInput, { FormSelect, FormTextarea } from '../../components/common/FormInput';
import FileUpload from '../../components/common/FileUpload';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const PatientProfile = () => {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({});

  useEffect(() => {
    API.get('/patients/my/profile').then((r) => {
      setPatient(r.data);
      setForm({ age: r.data.age || '', gender: r.data.gender || '', bloodGroup: r.data.bloodGroup || '', phone: r.data.phone || '', medicalHistory: r.data.medicalHistory || '' });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try { await API.put(`/patients/${patient._id}`, form); toast.success('Profile updated'); }
    catch { toast.error('Failed'); }
  };

  const handleAvatar = async (file) => {
    const fd = new FormData(); fd.append('avatar', file);
    try { await API.post(`/patients/${patient._id}/avatar`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }); toast.success('Avatar updated'); }
    catch { toast.error('Upload failed'); }
  };

  if (loading) return <LoadingSpinner />;
  if (!patient) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="page-title mb-6">My Profile</h1>
      <div className="card space-y-6">
        <FileUpload onUpload={handleAvatar} currentImage={patient.user?.avatar} label="Profile Photo" />
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Name</label><p className="font-medium">{patient.user?.name}</p></div>
          <div><label className="label">Email</label><p>{patient.user?.email}</p></div>
        </div>
        <form onSubmit={handleUpdate} className="space-y-4">
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
          <button type="submit" className="btn-primary">Update Profile</button>
        </form>
      </div>
    </div>
  );
};

export default PatientProfile;
