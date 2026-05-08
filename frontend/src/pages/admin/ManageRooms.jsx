import { useState, useEffect } from 'react';
import API from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import FormInput, { FormSelect } from '../../components/common/FormInput';
import StatusBadge from '../../components/common/StatusBadge';
import toast from 'react-hot-toast';

const ManageRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ roomNumber: '', type: 'General', floor: 1, pricePerDay: 0, bedCount: 2 });

  const fetch = async () => { setLoading(true); try { const r = await API.get('/rooms'); setRooms(r.data); } catch {} setLoading(false); };
  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const beds = Array.from({ length: parseInt(form.bedCount) || 1 }, (_, i) => ({ bedNumber: `${form.roomNumber}-${String.fromCharCode(65 + i)}`, isOccupied: false }));
      if (editing) { await API.put(`/rooms/${editing._id}`, { ...form, beds: editing.beds }); toast.success('Updated'); }
      else { await API.post('/rooms', { ...form, beds }); toast.success('Created'); }
      setModalOpen(false); setEditing(null); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleEdit = (r) => { setEditing(r); setForm({ roomNumber: r.roomNumber, type: r.type, floor: r.floor, pricePerDay: r.pricePerDay, bedCount: r.beds?.length || 1 }); setModalOpen(true); };
  const handleDelete = async (id) => { if (!confirm('Delete?')) return; try { await API.delete(`/rooms/${id}`); toast.success('Deleted'); fetch(); } catch (err) { toast.error(err.response?.data?.message || 'Failed'); } };

  const columns = [
    { header: 'Room', render: (r) => <span className="font-semibold">{r.roomNumber}</span> },
    { header: 'Type', accessor: 'type' },
    { header: 'Floor', accessor: 'floor' },
    { header: 'Price/Day', render: (r) => `₹${r.pricePerDay}` },
    { header: 'Beds', render: (r) => {
      const occupied = r.beds?.filter(b => b.isOccupied).length || 0;
      const total = r.beds?.length || 0;
      return <span className="text-sm">{occupied}/{total} occupied</span>;
    }},
    { header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { header: 'Actions', render: (r) => <div className="flex gap-2"><button onClick={() => handleEdit(r)} className="text-xs btn-secondary py-1 px-3">Edit</button><button onClick={() => handleDelete(r._id)} className="text-xs btn-danger py-1 px-3">Delete</button></div> },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">Manage Rooms & Beds</h1>
        <button onClick={() => { setEditing(null); setForm({ roomNumber: '', type: 'General', floor: 1, pricePerDay: 0, bedCount: 2 }); setModalOpen(true); }} className="btn-primary">+ Add Room</button>
      </div>
      <DataTable columns={columns} data={rooms} loading={loading} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Room' : 'Add Room'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Room Number" value={form.roomNumber} onChange={(e) => setForm({...form, roomNumber: e.target.value})} required />
            <FormSelect label="Type" value={form.type} onChange={(e) => setForm({...form, type: e.target.value})} options={[{value:'General',label:'General'},{value:'Semi-Private',label:'Semi-Private'},{value:'Private',label:'Private'},{value:'ICU',label:'ICU'},{value:'Emergency',label:'Emergency'}]} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormInput label="Floor" type="number" value={form.floor} onChange={(e) => setForm({...form, floor: e.target.value})} />
            <FormInput label="Price/Day (₹)" type="number" value={form.pricePerDay} onChange={(e) => setForm({...form, pricePerDay: e.target.value})} />
            {!editing && <FormInput label="Number of Beds" type="number" value={form.bedCount} onChange={(e) => setForm({...form, bedCount: e.target.value})} min="1" max="10" />}
          </div>
          <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button></div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageRooms;
