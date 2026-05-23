import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import FormInput, { FormSelect, FormTextarea } from '../../components/common/FormInput';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const AppointmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [apt, setApt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('details');
  const [diagForm, setDiagForm] = useState({ diagnosis: '', treatmentNotes: '' });
  const [presForm, setPresForm] = useState({ medicines: [{ name: '', dosage: '', duration: '', instructions: '' }], notes: '' });

  useEffect(() => {
    API.get(`/appointments/${id}`).then((r) => setApt(r.data)).catch(() => toast.error('Not found')).finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (status) => {
    try { await API.put(`/appointments/${id}`, { status }); setApt({ ...apt, status }); toast.success('Status updated'); }
    catch { toast.error('Failed'); }
  };

  const addDiagnosis = async (e) => {
    e.preventDefault();
    try {
      await API.post('/medical-records', { patient: apt.patient._id, appointment: apt._id, ...diagForm });
      toast.success('Medical record created');
      setDiagForm({ diagnosis: '', treatmentNotes: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const addPrescription = async (e) => {
    e.preventDefault();
    try {
      await API.post('/prescriptions', { patient: apt.patient._id, appointment: apt._id, medicines: presForm.medicines, notes: presForm.notes });
      toast.success('Prescription created');
      setPresForm({ medicines: [{ name: '', dosage: '', duration: '', instructions: '' }], notes: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const addMedicine = () => setPresForm({ ...presForm, medicines: [...presForm.medicines, { name: '', dosage: '', duration: '', instructions: '' }] });
  const updateMedicine = (i, field, val) => { const m = [...presForm.medicines]; m[i][field] = val; setPresForm({ ...presForm, medicines: m }); };
  const removeMedicine = (i) => setPresForm({ ...presForm, medicines: presForm.medicines.filter((_, idx) => idx !== i) });

  if (loading) return <LoadingSpinner />;
  if (!apt) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="text-sm text-primary-600 hover:underline">← Back</button>
      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-dark-900">Appointment Details</h1>
            <p className="text-sm text-dark-400">Date: {new Date(apt.date).toLocaleDateString()} • {apt.timeSlot}</p>
          </div>
          <StatusBadge status={apt.status} />
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="font-medium text-dark-500">Patient:</span> <span className="text-dark-800">{apt.patient?.user?.name}</span></div>
          <div><span className="font-medium text-dark-500">Department:</span> <span className="text-dark-800">{apt.department?.name || '—'}</span></div>
          <div className="col-span-2"><span className="font-medium text-dark-500">Reason:</span> <span className="text-dark-800">{apt.reason || '—'}</span></div>
        </div>
        {apt.status !== 'completed' && apt.status !== 'cancelled' && (
          <div className="flex gap-2 mt-4 pt-4 border-t">
            {apt.status === 'pending' && <button onClick={() => updateStatus('confirmed')} className="btn-primary text-sm">Confirm</button>}
            <button onClick={() => updateStatus('completed')} className="btn-success text-sm">Mark Completed</button>
            <button onClick={() => updateStatus('cancelled')} className="btn-danger text-sm">Cancel</button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {['details', 'diagnosis', 'prescription'].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 text-sm font-medium rounded-md capitalize transition-colors ${tab === t ? 'bg-white shadow-sm text-dark-800' : 'text-dark-500 hover:text-dark-700'}`}>{t}</button>
        ))}
      </div>

      {tab === 'diagnosis' && (
        <div className="card">
          <h3 className="font-semibold mb-4">Add Diagnosis & Treatment Notes</h3>
          <form onSubmit={addDiagnosis} className="space-y-4">
            <FormInput label="Diagnosis" value={diagForm.diagnosis} onChange={(e) => setDiagForm({...diagForm, diagnosis: e.target.value})} required />
            <FormTextarea label="Treatment Notes" value={diagForm.treatmentNotes} onChange={(e) => setDiagForm({...diagForm, treatmentNotes: e.target.value})} />
            <button type="submit" className="btn-primary">Save Medical Record</button>
          </form>
        </div>
      )}

      {tab === 'prescription' && (
        <div className="card">
          <h3 className="font-semibold mb-4">Add Prescription</h3>
          <form onSubmit={addPrescription} className="space-y-4">
            {presForm.medicines.map((med, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg space-y-3">
                <div className="flex justify-between items-center"><span className="text-sm font-medium">Medicine {i + 1}</span>{i > 0 && <button type="button" onClick={() => removeMedicine(i)} className="text-xs text-red-500">Remove</button>}</div>
                <div className="grid grid-cols-2 gap-3">
                  <FormInput placeholder="Medicine Name" value={med.name} onChange={(e) => updateMedicine(i, 'name', e.target.value)} required />
                  <FormInput placeholder="Dosage" value={med.dosage} onChange={(e) => updateMedicine(i, 'dosage', e.target.value)} required />
                  <FormInput placeholder="Duration" value={med.duration} onChange={(e) => updateMedicine(i, 'duration', e.target.value)} required />
                  <FormInput placeholder="Instructions" value={med.instructions} onChange={(e) => updateMedicine(i, 'instructions', e.target.value)} />
                </div>
              </div>
            ))}
            <button type="button" onClick={addMedicine} className="btn-secondary text-sm">+ Add Medicine</button>
            <FormTextarea label="Additional Notes" value={presForm.notes} onChange={(e) => setPresForm({...presForm, notes: e.target.value})} />
            <button type="submit" className="btn-primary">Save Prescription</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AppointmentDetail;
