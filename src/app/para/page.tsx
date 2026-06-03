'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MODULES, PARAS, type Module } from '@/lib/demo-data';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, ChevronLeft, CheckCircle, Lock, Unlock, Play, X, Clock } from 'lucide-react';

// Para view uses Camille Torres (p5) — mid-track, good demo state
const ME = PARAS.find(p => p.id === 'p5')!;

export default function ParaPage() {
  // Local completion state seeded from demo data, mutable in-session
  const [completed, setCompleted] = useState<Set<string>>(
    new Set(ME.progress.filter(p => p.completed).map(p => p.moduleId))
  );
  const [activeModule, setActiveModule] = useState<Module | null>(null);
  const [watchedEnough, setWatchedEnough] = useState(false);
  const [justUnlocked, setJustUnlocked] = useState<string[]>([]);

  const completeModule = (mod: Module) => {
    setCompleted(prev => new Set([...prev, mod.id]));
    setJustUnlocked(mod.duties);
    setActiveModule(null);
    setWatchedEnough(false);
    setTimeout(() => setJustUnlocked([]), 5000);
  };

  // A module is locked if it's on a later track and earlier tracks aren't done
  const isLocked = (mod: Module): boolean => {
    if (mod.day === 30) return false;
    const day30Done = MODULES.filter(m => m.day === 30).every(m => completed.has(m.id));
    if (mod.day === 60) return !day30Done;
    const day60Done = MODULES.filter(m => m.day <= 60).every(m => completed.has(m.id));
    return !day60Done;
  };

  const unlockedDuties = MODULES
    .filter(m => completed.has(m.id))
    .flatMap(m => m.duties);

  const pct = Math.round((completed.size / MODULES.length) * 100);

  const tracks = [30, 60, 90] as const;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b bg-white px-6 py-3 flex items-center gap-3">
        <Link href="/" className="text-slate-400 hover:text-slate-700 transition-colors"><ChevronLeft className="h-4 w-4" /></Link>
        <BookOpen className="h-4 w-4 text-indigo-600" />
        <span className="font-semibold text-sm">ParaPath</span>
        <div className="ml-auto flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">{ME.avatar}</div>
          <span className="text-sm text-slate-600">{ME.name}</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Progress header */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="font-semibold text-slate-900">My Training Path</h1>
              <p className="text-sm text-slate-500">{ME.role} · Started {new Date(ME.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-indigo-600">{pct}%</p>
              <p className="text-xs text-slate-400">{completed.size} of {MODULES.length} modules</p>
            </div>
          </div>
          <Progress value={pct} className="h-2" />
          <div className="flex items-center gap-1.5 mt-3 text-sm text-emerald-700">
            <Unlock className="h-3.5 w-3.5" />
            <span className="font-medium">{unlockedDuties.length} duties cleared</span>
          </div>
        </div>

        {/* Just unlocked toast */}
        {justUnlocked.length > 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <Unlock className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-emerald-800 text-sm">New duties unlocked!</p>
              <p className="text-sm text-emerald-700 mt-0.5">You&apos;re now cleared for: {justUnlocked.join(', ')}</p>
            </div>
          </div>
        )}

        {/* Tracks */}
        {tracks.map(day => {
          const mods = MODULES.filter(m => m.day === day);
          const trackDone = mods.every(m => completed.has(m.id));
          return (
            <div key={day}>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="font-semibold text-slate-900">{day}-Day Track</h2>
                {trackDone && <Badge className="bg-emerald-100 text-emerald-700 text-xs">Complete</Badge>}
              </div>
              <div className="space-y-3">
                {mods.map(mod => {
                  const done = completed.has(mod.id);
                  const locked = isLocked(mod);
                  return (
                    <div key={mod.id} className={`rounded-xl border p-4 ${done ? 'border-emerald-200 bg-emerald-50/50' : locked ? 'border-slate-200 bg-slate-50 opacity-60' : 'border-slate-200 bg-white'}`}>
                      <div className="flex items-start gap-3">
                        <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${done ? 'bg-emerald-500' : locked ? 'bg-slate-200' : 'bg-indigo-100'}`}>
                          {done ? <CheckCircle className="h-4 w-4 text-white" /> : locked ? <Lock className="h-4 w-4 text-slate-400" /> : <Play className="h-4 w-4 text-indigo-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium text-sm text-slate-900">{mod.title}</h3>
                            <span className="flex items-center gap-1 text-xs text-slate-400"><Clock className="h-3 w-3" />{mod.duration}</span>
                          </div>
                          <p className="text-sm text-slate-600 mt-1">{mod.description}</p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {mod.duties.map(d => (
                              <span key={d} className="text-xs text-slate-400 flex items-center gap-1">
                                <Unlock className="h-2.5 w-2.5" />{d}
                              </span>
                            ))}
                          </div>
                          {!done && !locked && (
                            <Button onClick={() => { setActiveModule(mod); setWatchedEnough(false); }} size="sm" className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white">
                              <Play className="h-3.5 w-3.5 mr-1" /> Start module
                            </Button>
                          )}
                          {locked && (
                            <p className="text-xs text-slate-400 mt-2 italic">Complete the previous track to unlock</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Video modal */}
      {activeModule && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={() => setActiveModule(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <h3 className="font-semibold text-sm">{activeModule.title}</h3>
              <button onClick={() => setActiveModule(null)} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
            </div>
            <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center text-center px-8">
              <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
                <Play className="h-7 w-7 text-white ml-1" />
              </div>
              <p className="text-white font-medium">{activeModule.title}</p>
              <p className="text-slate-400 text-sm mt-1">{activeModule.duration} branching scenario video</p>
              <p className="text-slate-500 text-xs mt-4 max-w-sm">
                Production modules are SME-produced branching scenario videos. This placeholder represents the {activeModule.duration} module a paraprofessional would watch here.
              </p>
            </div>
            <div className="px-5 py-4">
              <label className="flex items-center gap-2 mb-3 cursor-pointer">
                <input type="checkbox" checked={watchedEnough} onChange={e => setWatchedEnough(e.target.checked)} className="rounded" />
                <span className="text-sm text-slate-700">I have watched this module and understand the protocol</span>
              </label>
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 mb-4">
                <p className="text-xs text-amber-700">
                  <span className="font-semibold">Supervisor sign-off required:</span> In production, a supervisor confirms demonstrated competency via tablet checklist before duties unlock. For this demo, marking complete unlocks duties directly.
                </p>
              </div>
              <Button onClick={() => completeModule(activeModule)} disabled={!watchedEnough} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-slate-200">
                <CheckCircle className="h-4 w-4 mr-1.5" /> Mark complete & unlock duties
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
