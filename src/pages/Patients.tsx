import { mockPatients } from '@/data/mockData';
import { Search, Phone, Mail } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

export default function Patients() {
  const [search, setSearch] = useState('');
  const filtered = mockPatients.filter(p =>
    p.fullName.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Patients</h1>
        <p className="text-sm text-muted-foreground mt-1">Patient records and information</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search patients..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border p-5 shadow-card hover:shadow-card-hover transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">{p.fullName.split(' ').map(n => n[0]).join('')}</span>
              </div>
              <div>
                <h3 className="font-heading font-semibold text-foreground">{p.fullName}</h3>
                <p className="text-xs text-muted-foreground">{p.age} yrs · {p.gender} · {p.bloodGroup}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {p.email}</div>
              <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {p.phone || 'N/A'}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
