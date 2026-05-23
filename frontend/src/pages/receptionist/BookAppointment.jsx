import { useState, useEffect } from 'react';
import API from '../../api/axios';
import FormInput, { FormSelect, FormTextarea } from '../../components/common/FormInput';
import toast from 'react-hot-toast';

const BookAppointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ patient: '', doctor: '', department: '', date: '', timeSlot: '', reason: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get('/doctors/all').then((r) => setDoctors(r.data)).catch(() => {});
    API.get('/patients', { params: { limit: 100 } }).then((r) => setPatients(r.data.patients)).catch(() => {});
    API.get('/departments').then((r) => setDepartments(r.data)).catch(() => {});
  }, []);

  const timeSlots = ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM','04:30 PM'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patient || !form.doctor || !form.date || !form.timeSlot) return toast.error('Fill required fields');
    setLoading(true);
    try {
      await API.post('/appointments', form);
      toast.success('Appointment booked!');
      setForm({ patient: '', doctor: '', department: '', date: '', timeSlot: '', reason: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="page-title mb-6">Book Appointment</h1>
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormSelect label="Patient *" value={form.patient} onChange={(e) => setForm({...form, patient: e.target.value})} required>
            <option value="">Select Patient</option>
            {patients.map((p) => <option key={p._id} value={p._id}>{p.user?.name} ({p.user?.email})</option>)}
          </FormSelect>
          <div className="grid grid-cols-2 gap-4">
            <FormSelect label="Department" value={form.department} onChange={(e) => setForm({...form, department: e.target.value})}>
              <option value="">Select Department</option>
              {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </FormSelect>
            <FormSelect label="Doctor *" value={form.doctor} onChange={(e) => setForm({...form, doctor: e.target.value})} required>
              <option value="">Select Doctor</option>
              {doctors.filter((d) => !form.department || String(d.department?._id) === String(form.department)).map((d) => <option key={d._id} value={d._id}>{d.user?.name} - {d.specialization}</option>)}
            </FormSelect>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Date *" type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} min={new Date().toISOString().split('T')[0]} required />
            <FormSelect label="Time Slot *" value={form.timeSlot} onChange={(e) => setForm({...form, timeSlot: e.target.value})} required>
              <option value="">Select Time</option>
              {timeSlots.map((t) => <option key={t} value={t}>{t}</option>)}
            </FormSelect>
          </div>
          <FormTextarea label="Reason for Visit" value={form.reason} onChange={(e) => setForm({...form, reason: e.target.value})} />
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Booking...' : 'Book Appointment'}</button>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment;
