import { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import {
  HiOutlineShieldCheck, HiOutlineExclamation, HiOutlineRefresh,
  HiOutlineLightningBolt, HiOutlineBan, HiOutlineCheckCircle,
  HiOutlineInformationCircle, HiOutlineChartBar
} from 'react-icons/hi';

// ─────────────────────────────────────────────────────────────
// Pure algorithmic fraud detection — no API, no key
// ─────────────────────────────────────────────────────────────

const KNOWN_MEDICINES = new Set([
  'paracetamol','ibuprofen','amoxicillin','azithromycin','cetirizine','omeprazole',
  'metformin','atorvastatin','amlodipine','losartan','aspirin','clopidogrel',
  'pantoprazole','ranitidine','domperidone','ondansetron','metronidazole',
  'ciprofloxacin','doxycycline','cefixime','montelukast','salbutamol',
  'levocetrizine','fexofenadine','betahistine','diclofenac','tramadol',
  'gabapentin','pregabalin','sertraline','fluoxetine','terbinafine',
  'clonazepam','alprazolam','atenolol','ramipril','hydrochlorothiazide',
  'insulin','glibenclamide','glimepiride','acarbose','sitagliptin',
  'vitamin','calcium','iron','zinc','folic acid','b12','d3',
]);

function isSuspectMedicineName(name) {
  if (!name) return false;
  const lower = name.toLowerCase().trim();
  if (lower.length < 3) return false;
  // Known medicine → fine
  if ([...KNOWN_MEDICINES].some(m => lower.includes(m))) return false;
  // All digits or random chars
  if (/^\d+$/.test(lower)) return true;
  // Very short or looks like gibberish (no vowels in >5 char string)
  if (lower.length > 5 && !/[aeiou]/.test(lower)) return true;
  return false;
}

function detectDuplicates(billings) {
  const flags = [];
  const map = {}; // key: patientId+date → array of billings

  billings.forEach(b => {
    const pid = b.patientId || b.patient?._id || b.patient?.id || 'unknown';
    const day = b.date ? new Date(b.date).toDateString() : 'unknown';
    const key = `${pid}__${day}`;
    if (!map[key]) map[key] = [];
    map[key].push(b);
  });

  Object.values(map).forEach(group => {
    if (group.length < 2) return;
    // Check if amounts are same (duplicate)
    const amounts = group.map(b => Number(b.totalAmount));
    const uniqueAmounts = new Set(amounts);
    if (uniqueAmounts.size < group.length) {
      group.forEach(b => {
        flags.push({
          billingId: b._id || b.id,
          patientName: b.patient?.user?.name || 'Unknown',
          amount: b.totalAmount,
          type: 'duplicate_billing',
          severity: 'high',
          reason: `Patient billed ${group.length} times on the same day (${new Date(b.date).toLocaleDateString('en-IN')}) with same amount ₹${b.totalAmount}`,
        });
      });
    }
  });

  return flags;
}

function detectSuspiciousAmounts(billings) {
  const flags = [];
  if (billings.length < 3) return flags;

  const amounts = billings.map(b => Number(b.totalAmount)).filter(a => a > 0);
  const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const variance = amounts.reduce((acc, a) => acc + Math.pow(a - mean, 2), 0) / amounts.length;
  const std = Math.sqrt(variance);

  billings.forEach(b => {
    const amt = Number(b.totalAmount);
    if (amt <= 0) {
      flags.push({
        billingId: b._id || b.id,
        patientName: b.patient?.user?.name || 'Unknown',
        amount: amt,
        type: 'suspicious_amount',
        severity: 'high',
        reason: `Billing amount is zero or negative (₹${amt}) — possible fraudulent entry`,
      });
    } else if (std > 0 && (amt - mean) > 3 * std) {
      flags.push({
        billingId: b._id || b.id,
        patientName: b.patient?.user?.name || 'Unknown',
        amount: amt,
        type: 'suspicious_amount',
        severity: 'medium',
        reason: `Amount ₹${amt.toLocaleString('en-IN')} is ${((amt - mean) / std).toFixed(1)}σ above average (avg ₹${Math.round(mean).toLocaleString('en-IN')}) — unusually high`,
      });
    } else if (amt > 0 && amt < 10) {
      flags.push({
        billingId: b._id || b.id,
        patientName: b.patient?.user?.name || 'Unknown',
        amount: amt,
        type: 'suspicious_amount',
        severity: 'low',
        reason: `Billing amount ₹${amt} is unusually low — may be a test or erroneous entry`,
      });
    }
  });

  return flags;
}

function detectFakeMedicines(billings) {
  const flags = [];
  billings.forEach(b => {
    const items = b.items || [];
    const suspicious = items.filter(it => {
      const desc = (it.description || it.name || '').toLowerCase();
      return isSuspectMedicineName(desc);
    });
    if (suspicious.length > 0) {
      flags.push({
        billingId: b._id || b.id,
        patientName: b.patient?.user?.name || 'Unknown',
        amount: b.totalAmount,
        type: 'fake_medicine',
        severity: 'medium',
        reason: `Unrecognised medicine/item names: ${suspicious.map(s => `"${s.description || s.name}"`).join(', ')} — verify against formulary`,
      });
    }
  });
  return flags;
}

function detectInsuranceFraud(billings) {
  const flags = [];
  const insuranceBills = billings.filter(b => b.paymentMethod === 'insurance');
  if (insuranceBills.length === 0) return flags;

  const insuranceAmounts = insuranceBills.map(b => Number(b.totalAmount));
  const allAmounts = billings.map(b => Number(b.totalAmount));
  const overallMean = allAmounts.reduce((a, b) => a + b, 0) / allAmounts.length;

  insuranceBills.forEach(b => {
    const amt = Number(b.totalAmount);
    // Insurance bills significantly above average
    if (amt > overallMean * 2.5) {
      flags.push({
        billingId: b._id || b.id,
        patientName: b.patient?.user?.name || 'Unknown',
        amount: amt,
        type: 'insurance_fraud',
        severity: 'high',
        reason: `Insurance claim ₹${amt.toLocaleString('en-IN')} is ${(amt / overallMean).toFixed(1)}x the average billing amount — possible inflated insurance claim`,
      });
    }
  });

  // Check if insurance % of total billings is unusually high
  const pct = (insuranceBills.length / billings.length) * 100;
  if (pct > 60 && billings.length > 10) {
    flags.push({
      billingId: 'N/A',
      patientName: 'Multiple patients',
      amount: insuranceAmounts.reduce((a, b) => a + b, 0),
      type: 'insurance_fraud',
      severity: 'medium',
      reason: `${pct.toFixed(0)}% of all bills are insurance-based — unusually high proportion, warrants audit`,
    });
  }

  return flags;
}

function runFraudDetection(billings) {
  const allFlags = [
    ...detectDuplicates(billings),
    ...detectSuspiciousAmounts(billings),
    ...detectFakeMedicines(billings),
    ...detectInsuranceFraud(billings),
  ];

  // De-duplicate by billingId+type
  const seen = new Set();
  const flags = allFlags.filter(f => {
    const key = `${f.billingId}__${f.type}`;
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });

  // Risk score
  const highCount   = flags.filter(f => f.severity === 'high').length;
  const medCount    = flags.filter(f => f.severity === 'medium').length;
  const lowCount    = flags.filter(f => f.severity === 'low').length;
  const rawScore    = Math.min(100, highCount * 25 + medCount * 10 + lowCount * 3);
  const riskScore   = rawScore;

  const summary =
    flags.length === 0
      ? `All ${billings.length} billing records appear clean. No duplicate charges, suspicious amounts, or unrecognised medicines detected.`
      : `Detected ${flags.length} anomal${flags.length === 1 ? 'y' : 'ies'} across ${billings.length} billing records — ${highCount} high, ${medCount} medium, ${lowCount} low severity. Immediate review recommended for high-severity items.`;

  const insights = [];
  if (highCount > 0) insights.push(`${highCount} high-severity flag${highCount>1?'s':''} require immediate investigation`);
  const totalAmt = billings.reduce((s, b) => s + Number(b.totalAmount||0), 0);
  insights.push(`Total billing volume analysed: ₹${totalAmt.toLocaleString('en-IN')} across ${billings.length} records`);
  const unpaidCount = billings.filter(b => b.paymentStatus === 'unpaid').length;
  if (unpaidCount > 0) insights.push(`${unpaidCount} unpaid bill${unpaidCount>1?'s':''} (₹${billings.filter(b=>b.paymentStatus==='unpaid').reduce((s,b)=>s+Number(b.totalAmount||0),0).toLocaleString('en-IN')}) pending collection`);
  const methods = [...new Set(billings.map(b => b.paymentMethod))];
  insights.push(`Payment methods in use: ${methods.join(', ')}`);

  return { summary, riskScore, flags, insights };
}

// ─────────────────────────────────────────────────────────────
// UI helpers
// ─────────────────────────────────────────────────────────────
const severityStyle = {
  high:   'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low:    'bg-yellow-50 text-yellow-700 border-yellow-200',
};
const typeLabel = {
  duplicate_billing:  'Duplicate Billing',
  suspicious_amount:  'Suspicious Amount',
  fake_medicine:      'Fake Medicine',
  insurance_fraud:    'Insurance Fraud',
  unusual_pattern:    'Unusual Pattern',
};

const RiskGauge = ({ score }) => {
  const color = score >= 70 ? '#ef4444' : score >= 40 ? '#f59e0b' : '#22c55e';
  const label = score >= 70 ? 'HIGH RISK' : score >= 40 ? 'MEDIUM RISK' : 'LOW RISK';
  const arc   = (score / 100) * 157;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="120" height="72" viewBox="0 0 120 72">
        <path d="M10,62 A50,50 0 0,1 110,62" stroke="#e2e8f0" strokeWidth="12" fill="none" strokeLinecap="round"/>
        <path d="M10,62 A50,50 0 0,1 110,62" stroke={color} strokeWidth="12" fill="none"
          strokeLinecap="round" strokeDasharray={`${arc} 157`}/>
        <text x="60" y="57" textAnchor="middle" fontSize="22" fontWeight="bold" fill={color}>{score}</text>
      </svg>
      <span className="text-xs font-bold tracking-wider" style={{ color }}>{label}</span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
const FraudDetection = () => {
  const [billings, setBillings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult]       = useState(null);
  const [lastScanned, setLastScanned] = useState(null);

  useEffect(() => { fetchBillings(); }, []);

  const fetchBillings = async () => {
    setLoading(true);
    try {
      const r = await API.get('/billing?limit=200');
      setBillings(r.data.billings || []);
    } catch {
      toast.error('Failed to load billing records');
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = () => {
    if (billings.length === 0) { toast.error('No billing records to analyse'); return; }
    setAnalyzing(true);
    setResult(null);
    setTimeout(() => {
      try {
        const res = runFraudDetection(billings);
        setResult(res);
        setLastScanned(new Date());
        if (res.riskScore >= 70)      toast.error(`⚠️ HIGH RISK — Score ${res.riskScore}/100`);
        else if (res.riskScore >= 40) toast(`⚠️ Medium risk — Score ${res.riskScore}/100`, { icon:'🔶' });
        else                          toast.success(`✓ Low risk — Score ${res.riskScore}/100`);
      } catch {
        toast.error('Analysis failed. Please refresh and retry.');
      } finally {
        setAnalyzing(false);
      }
    }, 600);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center">
            <HiOutlineShieldCheck className="w-5 h-5 text-white"/>
          </div>
          <div>
            <h1 className="text-xl font-bold text-dark-900">AI Fraud Detection</h1>
            <p className="text-sm text-dark-400">Scans all billing records for duplicate charges, fake medicines &amp; suspicious claims</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchBillings} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 border border-dark-200 hover:bg-gray-50 rounded-lg text-sm text-dark-600 transition-colors">
            <HiOutlineRefresh className={`w-4 h-4 ${loading?'animate-spin':''}`}/> Refresh
          </button>
          <button onClick={runAnalysis} disabled={analyzing||loading||billings.length===0}
            className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors">
            <HiOutlineLightningBolt className="w-4 h-4"/>
            {analyzing ? 'Analysing…' : 'Run Fraud Scan'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-dark-800">{billings.length}</p>
          <p className="text-xs text-dark-400 mt-1">Records Loaded</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-amber-600">{result?.flags?.length ?? '—'}</p>
          <p className="text-xs text-dark-400 mt-1">Anomalies Found</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-red-600">{result?.flags?.filter(f=>f.severity==='high').length ?? '—'}</p>
          <p className="text-xs text-dark-400 mt-1">High Severity</p>
        </div>
      </div>

      {/* Spinner */}
      {analyzing && (
        <div className="card flex flex-col items-center gap-4 py-12">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"/>
          <div className="text-center">
            <p className="font-semibold text-dark-700">Analysing {billings.length} billing records…</p>
            <p className="text-sm text-dark-400 mt-1">Checking duplicates, amounts, medicines &amp; insurance patterns</p>
          </div>
        </div>
      )}

      {/* Results */}
      {result && !analyzing && (
        <>
          {/* Risk summary */}
          <div className={`card border-2 ${result.riskScore>=70?'border-red-300 bg-red-50':result.riskScore>=40?'border-amber-300 bg-amber-50':'border-green-300 bg-green-50'}`}>
            <div className="flex items-start gap-6 flex-wrap">
              <RiskGauge score={result.riskScore}/>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-dark-800 mb-1">Analysis Summary</h3>
                <p className="text-sm text-dark-600">{result.summary}</p>
                {lastScanned && <p className="text-xs text-dark-400 mt-2">Scanned at {lastScanned.toLocaleTimeString()}</p>}
              </div>
            </div>
          </div>

          {/* Insights */}
          {result.insights?.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <HiOutlineInformationCircle className="w-4 h-4 text-primary-600"/>
                <h3 className="font-semibold text-dark-800">Key Insights</h3>
              </div>
              <ul className="space-y-2">
                {result.insights.map((ins, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-dark-600">
                    <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold flex-shrink-0">{i+1}</span>
                    {ins}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Flags */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              {result.flags?.length > 0
                ? <HiOutlineExclamation className="w-5 h-5 text-red-600"/>
                : <HiOutlineCheckCircle className="w-5 h-5 text-green-600"/>
              }
              <h3 className="font-semibold text-dark-800">
                {result.flags?.length > 0 ? `${result.flags.length} Anomalies Detected` : 'No Anomalies Detected'}
              </h3>
            </div>

            {result.flags?.length === 0 && (
              <div className="text-center py-10 text-dark-400">
                <HiOutlineCheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3"/>
                <p className="font-medium text-dark-600">All records look clean</p>
                <p className="text-sm">No duplicate billing, suspicious amounts, or fake entries detected.</p>
              </div>
            )}

            <div className="space-y-3">
              {(result.flags||[]).map((flag, i) => (
                <div key={i} className={`rounded-lg border p-4 ${severityStyle[flag.severity]}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <HiOutlineBan className="w-5 h-5 flex-shrink-0 mt-0.5"/>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-sm">{flag.patientName}</span>
                          <span className="text-xs opacity-60">#{String(flag.billingId).slice(-6)}</span>
                          <span className="text-xs font-bold bg-white/60 px-1.5 py-0.5 rounded">
                            {typeLabel[flag.type]||flag.type}
                          </span>
                        </div>
                        <p className="text-sm">{flag.reason}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-sm font-bold">₹{Number(flag.amount||0).toLocaleString('en-IN')}</span>
                      <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full border ${severityStyle[flag.severity]}`}>
                        {flag.severity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Billing preview (before scan) */}
      {!result && !analyzing && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-dark-800">Billing Records ({billings.length})</h3>
            <span className="text-xs text-dark-400">Click "Run Fraud Scan" to analyse all records</span>
          </div>
          {loading ? (
            <div className="text-center py-8 text-dark-400">Loading…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-dark-500 text-xs uppercase tracking-wider">
                    {['Patient','Amount','Method','Status','Date'].map(h => (
                      <th key={h} className="text-left pb-2 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {billings.slice(0,15).map(b => (
                    <tr key={b._id||b.id} className="hover:bg-gray-50">
                      <td className="py-2 font-medium text-dark-800">{b.patient?.user?.name||'Unknown'}</td>
                      <td className="py-2 text-dark-700">₹{Number(b.totalAmount).toLocaleString('en-IN')}</td>
                      <td className="py-2 capitalize text-dark-500">{b.paymentMethod}</td>
                      <td className="py-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                          ${b.paymentStatus==='paid'?'bg-green-100 text-green-700':b.paymentStatus==='partial'?'bg-amber-100 text-amber-700':'bg-red-100 text-red-700'}`}>
                          {b.paymentStatus}
                        </span>
                      </td>
                      <td className="py-2 text-dark-400">{b.date?new Date(b.date).toLocaleDateString('en-IN'):'—'}</td>
                    </tr>
                  ))}
                  {billings.length===0 && (
                    <tr><td colSpan={5} className="py-8 text-center text-dark-400">No billing records found</td></tr>
                  )}
                </tbody>
              </table>
              {billings.length>15 && (
                <p className="text-xs text-dark-400 mt-2 text-right">Showing 15 of {billings.length} — all {billings.length} will be scanned</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="rounded-xl bg-dark-800 text-white p-5">
        <p className="text-sm font-semibold mb-3 flex items-center gap-2">
          <HiOutlineShieldCheck className="w-4 h-4"/> What the Fraud Scanner Detects
        </p>
        <div className="grid grid-cols-2 gap-3 text-xs text-dark-300">
          <div className="flex items-start gap-2"><span className="text-red-400 mt-0.5">●</span><span><strong className="text-white">Duplicate Billing</strong> — same patient billed multiple times on same day with same amount</span></div>
          <div className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">●</span><span><strong className="text-white">Suspicious Amounts</strong> — outliers &gt;3σ above mean or zero/negative values</span></div>
          <div className="flex items-start gap-2"><span className="text-yellow-400 mt-0.5">●</span><span><strong className="text-white">Fake Medicines</strong> — item names not matching recognised drug formulary</span></div>
          <div className="flex items-start gap-2"><span className="text-orange-400 mt-0.5">●</span><span><strong className="text-white">Insurance Fraud</strong> — inflated insurance claims or disproportionate insurance billing ratio</span></div>
        </div>
      </div>
    </div>
  );
};

export default FraudDetection;
