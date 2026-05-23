import { useState, useEffect } from 'react';
import API from '../../api/axios';
import FormInput, { FormSelect } from '../../components/common/FormInput';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const ReceptionistBilling = () => {
  const [billings, setBillings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({ patient: '', items: [{ description: '', category: 'consultation', amount: '' }], paymentMethod: 'cash' });

  const fetch = async () => { setLoading(true); try { const r = await API.get('/billing', { params: { page, limit: 10 } }); setBillings(r.data.billings); setTotalPages(r.data.totalPages); } catch {} setLoading(false); };
  useEffect(() => { fetch(); }, [page]);
  useEffect(() => { API.get('/patients', { params: { limit: 100 } }).then((r) => setPatients(r.data.patients)).catch(() => {}); }, []);

  const addItem = () => setForm({ ...form, items: [...form.items, { description: '', category: 'other', amount: '' }] });
  const updateItem = (i, field, val) => { const items = [...form.items]; items[i][field] = val; setForm({ ...form, items }); };
  const removeItem = (i) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });
  const total = form.items.reduce((sum, it) => sum + (parseFloat(it.amount) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patient || form.items.length === 0) return toast.error('Fill required fields');
    try {
      await API.post('/billing', { ...form, totalAmount: total });
      toast.success('Bill created');
      setModalOpen(false);
      setForm({ patient: '', items: [{ description: '', category: 'consultation', amount: '' }], paymentMethod: 'cash' });
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const columns = [
    { header: 'Patient', render: (r) => r.patient?.user?.name || '—' },
    { header: 'Amount', render: (r) => <span className="font-semibold">₹{r.totalAmount?.toLocaleString()}</span> },
    { header: 'Date', render: (r) => new Date(r.date).toLocaleDateString() },
    { header: 'Status', render: (r) => <StatusBadge status={r.paymentStatus} /> },
    { header: 'Actions', render: (r) => r.paymentStatus !== 'paid' ? <button onClick={async () => { await API.put(`/billing/${r._id}`, { paymentStatus: 'paid' }); toast.success('Marked paid'); fetch(); }} className="text-xs btn-success py-1 px-3">Mark Paid</button> : '✓' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">Billing</h1>
        <button onClick={() => setModalOpen(true)} className="btn-primary">+ Create Bill</button>
      </div>
      <DataTable columns={columns} data={billings} loading={loading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Bill" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormSelect label="Patient *" value={form.patient} onChange={(e) => setForm({...form, patient: e.target.value})} required>
            <option value="">Select Patient</option>
            {patients.map((p) => <option key={p._id} value={p._id}>{p.user?.name}</option>)}
          </FormSelect>
          <div className="space-y-3">
            <label className="label">Bill Items</label>
            {form.items.map((item, i) => (
              <div key={i} className="flex gap-2 items-end">
                <FormInput placeholder="Description" value={item.description} onChange={(e) => updateItem(i, 'description', e.target.value)} required />
                <FormSelect value={item.category} onChange={(e) => updateItem(i, 'category', e.target.value)} options={[{value:'consultation',label:'Consultation'},{value:'room',label:'Room'},{value:'medicine',label:'Medicine'},{value:'test',label:'Test'},{value:'other',label:'Other'}]} />
                <FormInput type="number" placeholder="Amount" value={item.amount} onChange={(e) => updateItem(i, 'amount', e.target.value)} required />
                {i > 0 && <button type="button" onClick={() => removeItem(i)} className="text-red-500 text-sm pb-1">✕</button>}
              </div>
            ))}
            <button type="button" onClick={addItem} className="text-sm text-primary-600 hover:underline">+ Add Item</button>
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <span className="font-semibold">Total:</span>
            <span className="text-xl font-bold text-primary-600">₹{total.toLocaleString()}</span>
          </div>
          <FormSelect label="Payment Method" value={form.paymentMethod} onChange={(e) => setForm({...form, paymentMethod: e.target.value})} options={[{value:'cash',label:'Cash'},{value:'card',label:'Card'},{value:'upi',label:'UPI'},{value:'insurance',label:'Insurance'}]} />
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">Create Bill</button></div>
        </form>
      </Modal>
    </div>
  );
};

export default ReceptionistBilling;
