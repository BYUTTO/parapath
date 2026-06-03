'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useStore, getPendingSignoffs, SUPERVISOR_NAME } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ChevronLeft, ClipboardCheck, CheckCircle, Clock, Unlock, X, Inbox } from 'lucide-react';

export default function SupervisorPage() {
  const { paras, moduleMap, getParaCurriculum, signOff } = useStore();
  const [reviewing, setReviewing] = useState<{ paraId: string; moduleId: string } | null>(null);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [justApproved, setJustApproved] = useState<string | null>(null);

  const pending = getPendingSignoffs(paras);

  const startReview = (paraId: string, moduleId: string) => {
    setReviewing({ paraId, moduleId });
    setChecked(new Set());
  };

  const approve = () => {
    if (!reviewing) return;
    const mod = moduleMap[reviewing.moduleId];
    signOff(reviewing.paraId, reviewing.moduleId, SUPERVISOR_NAME);
    setJustApproved(mod?.title ?? 'Module');
    setReviewing(null);
    setChecked(new Set());
    setTimeout(() => setJustApproved(null), 5000);
  };

  const reviewPara = reviewing ? paras.find(p => p.id === reviewing.paraId) : null;
  const reviewMod = reviewing ? moduleMap[reviewing.moduleId] : null;
  const allChecked = reviewMod ? checked.size === reviewMod.competencies.length : false;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b bg-white px-6 py-3 flex items-center gap-3">
        <Link href="/" className="text-slate-400 hover:text-slate-700 transition-colors"><ChevronLeft className="h-4 w-4" /></Link>
        <BookOpen className="h-4 w-4 text-indigo-600" />
        <span className="font-semibold text-sm">ParaPath</span>
        <span className="text-slate-300">/</span>
        <span className="text-sm text-slate-500">Supervisor</span>
        <div className="ml-auto flex items-center gap-2">
          <ClipboardCheck className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-sm text-slate-600">{SUPERVISOR_NAME}</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Sign-off Queue</h1>
          <p className="text-sm text-slate-500 mt-0.5">Confirm demonstrated competency before duties unlock. {pending.length} awaiting review.</p>
        </div>

        {justApproved && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
            <Unlock className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-emerald-800 text-sm">Signed off — duties unlocked</p>
              <p className="text-sm text-emerald-700 mt-0.5">&ldquo;{justApproved}&rdquo; competency confirmed. The para is now cleared for the associated duties.</p>
            </div>
          </div>
        )}

        {pending.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center">
            <Inbox className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No pending sign-offs. You&apos;re all caught up.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map(({ para, moduleId, submittedDate }) => {
              const mod = moduleMap[moduleId];
              const cur = getParaCurriculum(para);
              if (!mod) return null;
              return (
                <button key={`${para.id}-${moduleId}`} onClick={() => startReview(para.id, moduleId)} className="w-full text-left rounded-xl border border-slate-200 bg-white p-4 hover:border-indigo-300 transition-colors flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0">{para.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-slate-900">{para.name}</div>
                    <div className="text-xs text-slate-500">{mod.title} · {cur?.name}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge className="bg-blue-100 text-blue-700 text-xs flex items-center gap-1"><Clock className="h-3 w-3" />Awaiting</Badge>
                    {submittedDate && <p className="text-xs text-slate-400 mt-1">Submitted {submittedDate}</p>}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Review modal */}
      {reviewing && reviewPara && reviewMod && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={() => setReviewing(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <div>
                <h3 className="font-semibold text-sm">Competency review</h3>
                <p className="text-xs text-slate-500">{reviewPara.name} · {reviewMod.title}</p>
              </div>
              <button onClick={() => setReviewing(null)} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
            </div>

            <div className="px-5 py-4">
              <p className="text-sm text-slate-600 mb-3">Confirm each observed competency before approving. All items must be checked to sign off.</p>
              <div className="space-y-2 mb-4">
                {reviewMod.competencies.map((c, i) => {
                  const isChecked = checked.has(i);
                  return (
                    <label key={i} className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${isChecked ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => setChecked(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; })}
                        className="mt-0.5"
                      />
                      <span className="text-sm text-slate-700">{c}</span>
                    </label>
                  );
                })}
              </div>

              <div className="bg-slate-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-slate-500 mb-1.5">Duties unlocked on sign-off:</p>
                <div className="flex flex-wrap gap-1.5">
                  {reviewMod.duties.map(d => <Badge key={d} variant="outline" className="text-xs bg-white">{d}</Badge>)}
                </div>
              </div>

              <Button onClick={approve} disabled={!allChecked} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-slate-200">
                <CheckCircle className="h-4 w-4 mr-1.5" />
                {allChecked ? 'Sign off & unlock duties' : `Check all ${reviewMod.competencies.length} competencies to sign off`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
