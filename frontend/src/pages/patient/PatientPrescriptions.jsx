import { useState, useEffect } from 'react';
import API from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const PatientPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/prescriptions').then((r) => setPrescriptions(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="page-title mb-6">My Prescriptions</h1>
      {prescriptions.length === 0 ? <EmptyState icon="💊" title="No prescriptions" message="You don't have any prescriptions yet." /> : (
        <div className="space-y-4">
          {prescriptions.map((p) => (
            <div key={p._id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-dark-800">Dr. {p.doctor?.user?.name}</h3>
                  <p className="text-xs text-dark-400">{new Date(p.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="space-y-2">
                {p.medicines?.map((med, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg text-sm">
                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-semibold text-xs">{i + 1}</div>
                    <div className="flex-1">
                      <p className="font-medium text-dark-800">{med.name}</p>
                      <p className="text-dark-400">{med.dosage} • {med.duration} {med.instructions && `• ${med.instructions}`}</p>
                    </div>
                  </div>
                ))}
              </div>
              {p.notes && <p className="mt-3 text-sm text-dark-500 italic">Note: {p.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientPrescriptions;
