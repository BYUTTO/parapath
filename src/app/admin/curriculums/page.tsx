'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { Curriculum, CurriculumModule, Module, TrackDay, PARA_ROLES } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ChevronLeft, Plus, Pencil, Trash2, Users, Clock, RotateCcw, X } from 'lucide-react';

export default function CurriculumsPage() {
  const { curriculums, paras, modules, saveCurriculum, deleteCurriculum, resetDemo } = useStore();
  const [editing, setEditing] = useState<Curriculum | null>(null);
  const [creating, setCreating] = useState(false);

  const blank = (): Curriculum => ({
    id: `cur_${Math.abs(hashStr(JSON.stringify(curriculums.map(c => c.id)) + curriculums.length))}`,
    name: '',
    description: '',
    appliesToRoles: [],
    modules: [],
  });

  if (editing || creating) {
    return (
      <CurriculumEditor
        initial={editing ?? blank()}
        onCancel={() => { setEditing(null); setCreating(false); }}
        onSave={(c) => { saveCurriculum(c); setEditing(null); setCreating(false); }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <nav className="border-b bg-card px-6 py-3 flex items-center gap-3">
        <Link href="/admin" className="text-inkfaint hover:text-ink transition-colors"><ChevronLeft className="h-4 w-4" /></Link>
        <BookOpen className="h-4 w-4 text-accent" />
        <span className="font-display font-semibold text-[15px] tracking-tight">ParaPath</span>
        <span className="text-inkfaint">/</span>
        <span className="text-sm text-inkmute">Curriculums</span>
        <button onClick={resetDemo} className="ml-auto flex items-center gap-1.5 text-xs text-inkfaint hover:text-ink transition-colors" title="Reset demo data">
          <RotateCcw className="h-3.5 w-3.5" /> Reset demo
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-ink">Curriculums</h1>
            <p className="text-sm text-inkmute mt-0.5">Build training paths from the module library and assign them to roles.</p>
          </div>
          <Button onClick={() => setCreating(true)} className="bg-accent hover:bg-accent-hover text-white gap-1.5">
            <Plus className="h-4 w-4" /> New curriculum
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {curriculums.map(c => {
            const assigned = paras.filter(p => p.curriculumId === c.id).length;
            const totalMin = c.modules.reduce((sum, cm) => sum + parseInt(modules.find(m => m.id === cm.moduleId)?.duration ?? '0'), 0);
            return (
              <div key={c.id} className="bg-card rounded-xl border border-line p-5 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-ink">{c.name}</h3>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => setEditing(c)} className="text-inkfaint hover:text-accent p-1"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => { if (confirm(`Delete "${c.name}"?`)) deleteCurriculum(c.id); }} className="text-inkfaint hover:text-fail p-1"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                <p className="text-sm text-inkmute mb-3 flex-1">{c.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {c.appliesToRoles.map(r => <Badge key={r} variant="outline" className="text-xs bg-accent/10 text-accent border-accent/30">{r}</Badge>)}
                  {c.appliesToRoles.length === 0 && <span className="text-xs text-inkfaint italic">No roles assigned</span>}
                </div>
                <div className="flex items-center gap-4 text-xs text-inkmute border-t pt-3">
                  <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{c.modules.length} modules</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{totalMin} min</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{assigned} paras</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CurriculumEditor({ initial, onCancel, onSave }: { initial: Curriculum; onCancel: () => void; onSave: (c: Curriculum) => void }) {
  const { modules, addModule } = useStore();
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description);
  const [roles, setRoles] = useState<string[]>(initial.appliesToRoles);
  const [picked, setPicked] = useState<CurriculumModule[]>(initial.modules);
  const [showNewModule, setShowNewModule] = useState(false);

  const isIncluded = (id: string) => picked.some(p => p.moduleId === id);
  const dayOf = (id: string) => picked.find(p => p.moduleId === id)?.day ?? 30;

  const toggleModule = (id: string) => {
    setPicked(prev => isIncluded(id) ? prev.filter(p => p.moduleId !== id) : [...prev, { moduleId: id, day: 30 }]);
  };
  const setDay = (id: string, day: TrackDay) => {
    setPicked(prev => prev.map(p => p.moduleId === id ? { ...p, day } : p));
  };
  const toggleRole = (r: string) => {
    setRoles(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);
  };

  const canSave = name.trim().length > 0 && picked.length > 0;

  return (
    <div className="min-h-screen bg-paper">
      <nav className="border-b bg-card px-6 py-3 flex items-center gap-3">
        <button onClick={onCancel} className="text-inkfaint hover:text-ink transition-colors"><ChevronLeft className="h-4 w-4" /></button>
        <BookOpen className="h-4 w-4 text-accent" />
        <span className="font-display font-semibold text-[15px] tracking-tight">ParaPath</span>
        <span className="text-inkfaint">/</span>
        <span className="text-sm text-inkmute">{initial.name ? 'Edit Curriculum' : 'New Curriculum'}</span>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Basics */}
        <div className="bg-card rounded-xl border border-line p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-inkmute mb-1">Curriculum name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Health Aide Track" className="w-full border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-xs font-medium text-inkmute mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Who is this path for and what does it cover?" className="w-full border border-line rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-xs font-medium text-inkmute mb-2">Auto-assign to roles</label>
            <div className="flex flex-wrap gap-2">
              {PARA_ROLES.map(r => (
                <button key={r} onClick={() => toggleRole(r)} className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${roles.includes(r) ? 'bg-accent text-white border-accent' : 'bg-card text-inkmute border-line hover:border-accent/40'}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Module picker */}
        <div className="bg-card rounded-xl border border-line p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-ink">Modules</h2>
            <span className="text-xs text-inkfaint">{picked.length} selected</span>
          </div>
          <p className="text-sm text-inkmute mb-4">Toggle modules into this curriculum and set which track day each belongs to.</p>

          {showNewModule
            ? <NewModuleForm onCancel={() => setShowNewModule(false)} onCreate={(m) => { addModule(m); setPicked(prev => [...prev, { moduleId: m.id, day: 30 }]); setShowNewModule(false); }} />
            : <button onClick={() => setShowNewModule(true)} className="w-full mb-3 flex items-center justify-center gap-1.5 text-sm text-accent border border-dashed border-accent/30 rounded-lg py-2 hover:bg-accent/10 transition-colors">
                <Plus className="h-3.5 w-3.5" /> Create a custom module
              </button>
          }

          <div className="space-y-2">
            {modules.map(mod => {
              const included = isIncluded(mod.id);
              return (
                <div key={mod.id} className={`rounded-lg border p-3 transition-colors ${included ? 'border-accent/30 bg-accent/8' : 'border-line'}`}>
                  <div className="flex items-start gap-3">
                    <button onClick={() => toggleModule(mod.id)} className={`mt-0.5 h-5 w-5 rounded border flex items-center justify-center shrink-0 ${included ? 'bg-accent border-accent' : 'border-line bg-card'}`}>
                      {included && <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-ink">{mod.title}</span>
                        <span className="flex items-center gap-1 text-xs text-inkfaint"><Clock className="h-3 w-3" />{mod.duration}</span>
                      </div>
                      <p className="text-xs text-inkmute mt-0.5 line-clamp-1">{mod.description}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {mod.duties.map(d => <span key={d} className="text-xs text-inkfaint">· {d}</span>)}
                      </div>
                    </div>
                    {included && (
                      <div className="shrink-0">
                        <label className="text-xs text-inkfaint block mb-0.5">Track</label>
                        <select value={dayOf(mod.id)} onChange={e => setDay(mod.id, Number(e.target.value) as TrackDay)} className="text-xs border border-line rounded px-1.5 py-1 bg-card">
                          <option value={30}>30-day</option>
                          <option value={60}>60-day</option>
                          <option value={90}>90-day</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Track preview */}
        {picked.length > 0 && (
          <div className="bg-card rounded-xl border border-line p-5">
            <h2 className="font-semibold text-ink mb-3">Track preview</h2>
            <div className="space-y-3">
              {([30, 60, 90] as TrackDay[]).map(day => {
                const inDay = picked.filter(p => p.day === day);
                if (inDay.length === 0) return null;
                return (
                  <div key={day}>
                    <p className="text-xs font-semibold text-inkmute uppercase tracking-wide mb-1.5">{day}-Day Track</p>
                    <div className="flex flex-wrap gap-1.5">
                      {inDay.map(p => {
                        const mod = modules.find(m => m.id === p.moduleId);
                        return <Badge key={p.moduleId} variant="outline" className="text-xs">{mod?.title}</Badge>;
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button onClick={() => onSave({ ...initial, name: name.trim(), description: description.trim(), appliesToRoles: roles, modules: picked })} disabled={!canSave} className="bg-accent hover:bg-accent-hover text-white">
            Save curriculum
          </Button>
          <Button onClick={onCancel} variant="outline">Cancel</Button>
          {!canSave && <span className="text-xs text-inkfaint">Name and at least one module required</span>}
        </div>
      </div>
    </div>
  );
}

function NewModuleForm({ onCancel, onCreate }: { onCancel: () => void; onCreate: (m: Module) => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [duties, setDuties] = useState('');
  const [competencies, setCompetencies] = useState('');

  const splitLines = (s: string) => s.split(/[\n,]/).map(x => x.trim()).filter(Boolean);
  const canCreate = title.trim() && splitLines(duties).length > 0 && splitLines(competencies).length > 0;

  const create = () => {
    const id = `m_${Math.abs(hashStr(title + duties + competencies))}`;
    onCreate({
      id,
      title: title.trim(),
      description: description.trim() || title.trim(),
      duration: duration.trim() || '5 min',
      duties: splitLines(duties),
      competencies: splitLines(competencies),
    });
  };

  return (
    <div className="border border-accent/30 bg-accent/8 rounded-lg p-4 mb-3 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm text-ink">New custom module</h3>
        <button onClick={onCancel} className="text-inkfaint hover:text-inkmute"><X className="h-4 w-4" /></button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Module title" className="text-sm border border-line rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent" />
        <input value={duration} onChange={e => setDuration(e.target.value)} placeholder="Duration (e.g. 6 min)" className="text-sm border border-line rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent" />
      </div>
      <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description" className="w-full text-sm border border-line rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent" />
      <div>
        <label className="text-xs text-inkmute block mb-1">Duties unlocked (comma or line separated)</label>
        <textarea value={duties} onChange={e => setDuties(e.target.value)} rows={2} placeholder="e.g. Bus loading support, Hallway transition support" className="w-full text-sm border border-line rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-accent" />
      </div>
      <div>
        <label className="text-xs text-inkmute block mb-1">Observable competencies (comma or line separated)</label>
        <textarea value={competencies} onChange={e => setCompetencies(e.target.value)} rows={2} placeholder="e.g. Demonstrates safe lifting technique, States district policy" className="w-full text-sm border border-line rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-accent" />
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={create} disabled={!canCreate} size="sm" className="bg-accent hover:bg-accent-hover text-white">Add to library</Button>
        <Button onClick={onCancel} variant="outline" size="sm">Cancel</Button>
      </div>
    </div>
  );
}

// Stable pseudo-id without Date.now()/Math.random() (avoids hydration drift)
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = (h << 5) - h + s.charCodeAt(i); h |= 0; }
  return h;
}
