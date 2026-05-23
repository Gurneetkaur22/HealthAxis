import { useState, useRef, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import {
  HiOutlineMicrophone, HiOutlineStop, HiOutlineLightningBolt,
  HiOutlineClipboardCheck, HiOutlineSave, HiOutlineRefresh
} from 'react-icons/hi';

// ─────────────────────────────────────────────────────────────
// NLP Parser — no API key, runs entirely in the browser
// ─────────────────────────────────────────────────────────────

const MEDICINE_KEYWORDS = [
  'paracetamol','ibuprofen','amoxicillin','azithromycin','cetirizine',
  'omeprazole','metformin','atorvastatin','amlodipine','losartan',
  'aspirin','clopidogrel','pantoprazole','ranitidine','domperidone',
  'ondansetron','metronidazole','ciprofloxacin','doxycycline','cefixime',
  'montelukast','salbutamol','levocetrizine','fexofenadine','betahistine',
  'diclofenac','tramadol','gabapentin','pregabalin','sertraline',
  'tab','tablet','capsule','syrup','injection','drops','cream','gel',
  'mg','ml','mcg',
];

const SYMPTOM_MAP = {
  fever:       { diagnosis:'Febrile illness — likely viral/bacterial infection', notes:'Monitor temperature. Hydration advised.' },
  cough:       { diagnosis:'Acute cough — rule out URTI/LRTI', notes:'Steam inhalation, avoid cold exposure.' },
  'chest pain':{ diagnosis:'Chest pain — rule out cardiac/musculoskeletal cause', notes:'ECG advised. Monitor vitals.' },
  headache:    { diagnosis:'Cephalgia — tension/migraine type', notes:'Rest, hydration. Avoid bright light.' },
  vomiting:    { diagnosis:'Nausea and vomiting — possible gastritis/infection', notes:'ORS, light diet, avoid spicy food.' },
  diarrhea:    { diagnosis:'Acute diarrhea — likely infective/dietary', notes:'ORS, probiotics. Monitor hydration.' },
  cold:        { diagnosis:'Acute rhinitis/URTI', notes:'Steam inhalation, warm fluids.' },
  diabetes:    { diagnosis:'Diabetes mellitus — glycaemic assessment needed', notes:'Blood sugar monitoring, diet control.' },
  hypertension:{ diagnosis:'Hypertension — BP monitoring required', notes:'Salt restriction, lifestyle modification.' },
  pain:        { diagnosis:'Pain — site-specific evaluation needed', notes:'Analgesics, rest, physiotherapy if musculoskeletal.' },
  rash:        { diagnosis:'Skin rash — allergic/infective aetiology', notes:'Avoid allergens. Topical treatment.' },
  fatigue:     { diagnosis:'Fatigue — rule out anaemia/thyroid/infection', notes:'CBC, TFT advised.' },
  breathlessness:{ diagnosis:'Dyspnoea — rule out respiratory/cardiac cause', notes:'SpO2 monitoring, CXR advised.' },
  infection:   { diagnosis:'Suspected infection — site-specific workup needed', notes:'Culture sensitivity if bacterial suspected.' },
  allergy:     { diagnosis:'Allergic reaction', notes:'Identify and avoid trigger. Antihistamines.' },
  injury:      { diagnosis:'Traumatic injury', notes:'RICE protocol. X-ray if fracture suspected.' },
  fracture:    { diagnosis:'Suspected fracture', notes:'Immobilise. X-ray mandatory.' },
  wound:       { diagnosis:'Open wound/laceration', notes:'Clean, dress wound. Tetanus prophylaxis.' },
};

const DOSAGE_PATTERNS = [
  /(\d+\s*mg)/gi, /(\d+\s*ml)/gi, /(\d+\s*mcg)/gi,
  /(twice|thrice|once|two times|three times)/gi,
  /(daily|day|night|morning|evening|afternoon)/gi,
];

const DURATION_PATTERN = /(\d+)\s*(day|days|week|weeks|month|months)/gi;
const FOLLOWUP_PATTERN = /follow[- ]?up\s*(after|in)?\s*(\d+\s*(day|days|week|weeks))/gi;

function extractDuration(text) {
  const m = [...text.matchAll(DURATION_PATTERN)];
  return m.length ? m[0][0] : '5 days';
}

function extractFollowUp(text) {
  const m = [...text.matchAll(FOLLOWUP_PATTERN)];
  return m.length ? `Review ${m[0][0]}` : '';
}

function extractMedicines(text) {
  const lower = text.toLowerCase();
  const found = [];
  const words = lower.split(/\s+/);

  MEDICINE_KEYWORDS.forEach(kw => {
    const idx = words.findIndex(w => w.includes(kw));
    if (idx === -1) return;
    const context = words.slice(Math.max(0, idx - 2), idx + 8).join(' ');
    const dosageMatch = context.match(/\d+\s*mg|\d+\s*ml|\d+\s*mcg/i);
    const freqMatch   = context.match(/once|twice|thrice|od|bd|tds|qid|daily|morning|night|evening/i);
    const durMatch    = context.match(/\d+\s*(day|days|week|weeks)/i);

    // Skip pure unit tokens
    if (['mg','ml','mcg','tab','tablet','capsule'].includes(kw) && !dosageMatch) return;

    const name = kw.charAt(0).toUpperCase() + kw.slice(1);
    if (!found.find(f => f.name.toLowerCase() === name.toLowerCase())) {
      found.push({
        name,
        dosage:       dosageMatch ? dosageMatch[0] : '500mg',
        duration:     durMatch    ? durMatch[0]    : '5 days',
        instructions: freqMatch   ? freqMatch[0]   : 'As directed',
      });
    }
  });

  return found.slice(0, 6); // cap at 6 medicines
}

function extractDiagnosis(text) {
  const lower = text.toLowerCase();
  const matches = [];
  for (const [keyword, data] of Object.entries(SYMPTOM_MAP)) {
    if (lower.includes(keyword)) matches.push(data);
  }
  if (matches.length === 0) {
    return {
      diagnosis: 'General consultation — further evaluation needed',
      notes: 'Clinical assessment in progress.',
    };
  }
  return {
    diagnosis: matches.map(m => m.diagnosis).join('; '),
    notes: matches.map(m => m.notes).join(' '),
  };
}

function extractPatientNotes(text) {
  // Grab sentences that mention symptoms/duration
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const relevant = sentences.filter(s =>
    /patient|complain|suffer|since|day|week|month|pain|fever|cough|nausea|vomit|hurt|feel/i.test(s)
  );
  return (relevant.length ? relevant : sentences.slice(0, 3)).join('. ').trim();
}

function parseTranscript(text) {
  const { diagnosis, notes: treatmentNotes } = extractDiagnosis(text);
  return {
    patientNotes:  extractPatientNotes(text) || text.slice(0, 300),
    diagnosis,
    treatmentNotes,
    prescriptions: extractMedicines(text),
    followUp:      extractFollowUp(text),
  };
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
const VoiceEMR = () => {
  const [isRecording, setIsRecording]     = useState(false);
  const [transcript, setTranscript]       = useState('');
  const [processing, setProcessing]       = useState(false);
  const [emr, setEmr]                     = useState(null);
  const [patients, setPatients]           = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [saving, setSaving]               = useState(false);

  const recognitionRef = useRef(null);

  useEffect(() => {
    API.get('/patients?limit=200')
      .then(r => setPatients(r.data.patients || []))
      .catch(() => {});
  }, []);

  const startRecording = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast.error('Speech recognition requires Chrome or Edge browser.'); return; }

    const rec = new SR();
    rec.continuous      = true;
    rec.interimResults  = true;
    rec.lang            = 'en-IN';

    let finalText = '';
    setTranscript('');
    setEmr(null);

    rec.onresult = (e) => {
      let interim = '';
      finalText = '';
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalText += e.results[i][0].transcript + ' ';
        else interim += e.results[i][0].transcript;
      }
      setTranscript(finalText + interim);
    };
    rec.onerror = (e) => { toast.error('Mic error: ' + e.error); setIsRecording(false); };
    rec.onend   = ()  => setIsRecording(false);

    rec.start();
    recognitionRef.current = rec;
    setIsRecording(true);
    toast.success('Recording… speak your clinical notes');
  };

  const stopRecording = () => { recognitionRef.current?.stop(); setIsRecording(false); };

  const processWithNLP = () => {
    const text = transcript.trim();
    if (!text) { toast.error('No speech recorded yet.'); return; }
    setProcessing(true);
    setTimeout(() => {                       // tiny delay so spinner shows
      try {
        const result = parseTranscript(text);
        setEmr(result);
        toast.success('EMR form filled automatically ✓');
      } catch {
        toast.error('Parsing failed. Please check the transcript.');
      } finally {
        setProcessing(false);
      }
    }, 400);
  };

  const saveEMR = async () => {
    if (!emr) return;
    if (!selectedPatient) { toast.error('Please select a patient first.'); return; }
    setSaving(true);
    try {
      await API.post('/medical-records', {
        patient: selectedPatient,
        diagnosis: emr.diagnosis,
        treatmentNotes: [emr.patientNotes, emr.treatmentNotes, emr.followUp ? 'Follow-up: ' + emr.followUp : '']
          .filter(Boolean).join('\n\n'),
      });

      if (emr.prescriptions?.length > 0) {
        await API.post('/prescriptions', {
          patient: selectedPatient,
          medicines: emr.prescriptions,
          notes: emr.followUp || '',
        });
      }

      toast.success('EMR & prescriptions saved successfully!');
      setEmr(null); setTranscript(''); setSelectedPatient('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const updateEmrField = (field, val) => setEmr(p => ({ ...p, [field]: val }));
  const updateMed = (i, field, val) => {
    const meds = [...emr.prescriptions]; meds[i][field] = val;
    setEmr(p => ({ ...p, prescriptions: meds }));
  };
  const addMed    = () => setEmr(p => ({ ...p, prescriptions: [...(p.prescriptions||[]), { name:'', dosage:'', duration:'', instructions:'' }] }));
  const removeMed = (i) => setEmr(p => ({ ...p, prescriptions: p.prescriptions.filter((_,idx)=>idx!==i) }));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
          <HiOutlineMicrophone className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-dark-900">AI Voice-to-EMR</h1>
          <p className="text-sm text-dark-400">Speak clinical notes — auto-fills patient notes, diagnosis &amp; prescriptions</p>
        </div>
      </div>

      {/* Patient */}
      <div className="card">
        <label className="block text-sm font-medium text-dark-700 mb-1">Select Patient</label>
        <select value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}
          className="w-full border border-dark-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none">
          <option value="">— Choose patient —</option>
          {patients.map(p => (
            <option key={p.id||p._id} value={p.id||p._id}>
              {p.user?.name}{p.bloodGroup ? ` (${p.bloodGroup})` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Recording */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-dark-800">Step 1 — Record Voice</h2>
        <div className={`relative rounded-xl border-2 border-dashed p-6 text-center transition-colors
          ${isRecording ? 'border-red-400 bg-red-50' : 'border-dark-200 bg-gray-50'}`}>
          {isRecording && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"/>
              <span className="text-xs font-medium text-red-600">LIVE</span>
            </div>
          )}
          <div className="flex justify-center mb-4">
            {isRecording
              ? <button onClick={stopRecording}  className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"><HiOutlineStop className="w-7 h-7"/></button>
              : <button onClick={startRecording} className="w-16 h-16 rounded-full bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"><HiOutlineMicrophone className="w-7 h-7"/></button>
            }
          </div>
          <p className="text-sm text-dark-500">{isRecording ? 'Speak now… click stop when done' : 'Click mic to start recording'}</p>
        </div>

        {transcript && (
          <div>
            <label className="block text-xs font-medium text-dark-500 mb-1 uppercase tracking-wider">Live Transcript (editable)</label>
            <textarea value={transcript} onChange={e => setTranscript(e.target.value)}
              rows={4} className="w-full border border-dark-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none"/>
          </div>
        )}

        <div className="flex gap-3 flex-wrap">
          <button onClick={processWithNLP} disabled={!transcript.trim()||processing}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors">
            <HiOutlineLightningBolt className="w-4 h-4"/>
            {processing ? 'Processing…' : 'Auto-Fill EMR'}
          </button>
          {(transcript||emr) && (
            <button onClick={()=>{ setTranscript(''); setEmr(null); }}
              className="flex items-center gap-2 px-4 py-2.5 border border-dark-200 hover:bg-gray-50 text-dark-600 rounded-lg text-sm transition-colors">
              <HiOutlineRefresh className="w-4 h-4"/> Reset
            </button>
          )}
        </div>
      </div>

      {/* EMR Form */}
      {emr && (
        <div className="card space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b">
            <HiOutlineClipboardCheck className="w-5 h-5 text-green-600"/>
            <h2 className="font-semibold text-dark-800">Step 2 — Auto-Generated EMR (editable)</h2>
            <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">NLP Filled</span>
          </div>

          {[
            { label:'Patient Notes',    field:'patientNotes',    rows:3 },
            { label:'Diagnosis',        field:'diagnosis',       rows:2 },
            { label:'Treatment Notes',  field:'treatmentNotes',  rows:3 },
          ].map(({ label, field, rows }) => (
            <div key={field}>
              <label className="block text-xs font-semibold text-dark-500 uppercase tracking-wider mb-1">{label}</label>
              <textarea value={emr[field]} onChange={e => updateEmrField(field, e.target.value)}
                rows={rows} className="w-full border border-dark-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"/>
            </div>
          ))}

          {/* Prescriptions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-dark-500 uppercase tracking-wider">Prescriptions</label>
              <button onClick={addMed} className="text-xs text-primary-600 hover:underline">+ Add Medicine</button>
            </div>
            {(emr.prescriptions||[]).map((med, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg mb-2 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-dark-600">Medicine {i+1}</span>
                  <button onClick={()=>removeMed(i)} className="text-xs text-red-500 hover:underline">Remove</button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {['name','dosage','duration','instructions'].map(f => (
                    <input key={f} placeholder={f.charAt(0).toUpperCase()+f.slice(1)}
                      value={med[f]} onChange={e => updateMed(i, f, e.target.value)}
                      className="border border-dark-200 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-primary-500 focus:outline-none"/>
                  ))}
                </div>
              </div>
            ))}
            {!(emr.prescriptions?.length) && (
              <p className="text-xs text-dark-400 italic">No medicines detected — add manually if needed</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-dark-500 uppercase tracking-wider mb-1">Follow-up</label>
            <input value={emr.followUp} onChange={e => updateEmrField('followUp', e.target.value)}
              className="w-full border border-dark-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
              placeholder="e.g. Review after 7 days"/>
          </div>

          <button onClick={saveEMR} disabled={saving||!selectedPatient}
            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors">
            <HiOutlineSave className="w-4 h-4"/>
            {saving ? 'Saving…' : 'Save EMR & Prescriptions'}
          </button>
          {!selectedPatient && <p className="text-xs text-red-500">Select a patient above before saving</p>}
        </div>
      )}

      {/* Info */}
      <div className="rounded-xl bg-primary-50 border border-primary-100 p-4">
        <p className="text-xs font-semibold text-primary-700 mb-2">How it works — 100% offline, no API key</p>
        <ol className="text-xs text-primary-600 space-y-1 list-decimal list-inside">
          <li>Select the patient from the dropdown</li>
          <li>Click the microphone and speak naturally: symptoms, duration, medicines</li>
          <li>Click "Auto-Fill EMR" — NLP parser extracts all fields instantly</li>
          <li>Review and edit the auto-filled form as needed</li>
          <li>Click Save to write to Medical Records &amp; Prescriptions</li>
        </ol>
        <p className="text-xs text-primary-500 mt-2">Tip: mention medicine names, dosages &amp; durations clearly for best results. Works in Chrome/Edge.</p>
      </div>
    </div>
  );
};

export default VoiceEMR;
