import { useState } from 'react';
import API from '../../api/axios';
import FormInput, { FormSelect, FormTextarea } from '../../components/common/FormInput';
import toast from 'react-hot-toast';

const RegisterPatient = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', age: '', gender: '', bloodGroup: '', phone: '', medicalHistory: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return toast.error('Name and email are required');
    setLoading(true);
    try {
      await API.post('/patients', { ...form, password: form.password || 'patient123' });
      toast.success('Patient registered successfully!');
      setForm({ name: '', email: '', password: '', age: '', gender: '', bloodGroup: '', phone: '', medicalHistory: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="page-title mb-6">Register New Patient</h1>
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Full Name *" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
            <FormInput label="Email *" type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required />
          </div>
          <FormInput label="Password" type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} placeholder="Default: patient123" />
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
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Registering...' : 'Register Patient'}</button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPatient;
