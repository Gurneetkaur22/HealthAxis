import { useState, useEffect } from 'react';
import API from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const PatientMedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/medical-records').then((r) => setRecords(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="page-title mb-6">My Medical Records</h1>
      {records.length === 0 ? <EmptyState icon="📋" title="No medical records" message="You don't have any medical records yet." /> : (
        <div className="space-y-4">
          {records.map((r) => (
            <div key={r._id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-dark-800">Dr. {r.doctor?.user?.name}</h3>
                  <p className="text-xs text-dark-400">{new Date(r.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium text-dark-600">Diagnosis:</span> <span className="text-dark-800">{r.diagnosis}</span></div>
                {r.treatmentNotes && <div><span className="font-medium text-dark-600">Treatment:</span> <span className="text-dark-800">{r.treatmentNotes}</span></div>}
                {r.followUpDate && <div><span className="font-medium text-dark-600">Follow-up:</span> <span className="text-dark-800">{new Date(r.followUpDate).toLocaleDateString()}</span></div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientMedicalRecords;
