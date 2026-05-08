import { mockDoctors } from '@/data/mockData';
import { Search, Mail } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

export default function Doctors() {
  const [search, setSearch] = useState('');
  const filtered = mockDoctors.filter(d =>
    d.fullName.toLowerCase().includes(search.toLowerCase()) ||
    (d.specialization || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Doctors</h1>
        <p className="text-sm text-muted-foreground mt-1">Medical staff directory</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search doctors..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((d, i) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border p-5 shadow-card hover:shadow-card-hover transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary-foreground">{d.fullName.split(' ').map(n => n[0]).join('')}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-semibold text-foreground">{d.fullName}</h3>
                <p className="text-sm text-primary font-medium">{d.specialization}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Mail className="w-3 h-3" /> {d.email}</p>
              </div>
              <div className="px-3 py-1.5 rounded-full bg-success/10 text-success text-xs font-semibold">
                Available
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
