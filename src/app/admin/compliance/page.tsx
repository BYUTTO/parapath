'use client';

import Link from 'next/link';
import { useStore, getParaTrackStatus, getCompletionPct, getUnlockedDuties } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ChevronLeft, Printer, Download } from 'lucide-react';

const STATUS_LABEL: Record<string, string> = {
  complete: 'Complete', in_progress: 'In Progress', overdue: 'Overdue', not_started: 'Not Started',
};

export default function CompliancePage() {
  const { paras, curriculums, getParaCurriculum, moduleMap } = useStore();

  const rows = paras.map(p => {
    const curriculum = getParaCurriculum(p);
    const signedOff = p.progress.filter(pr => pr.completed);
    return {
      para: p,
      curriculum,
      status: getParaTrackStatus(p, curriculum),
      pct: getCompletionPct(p, curriculum),
      duties: getUnlockedDuties(p, curriculum),
      signedOff,
    };
  });

  const downloadCsv = () => {
    const header = ['Paraprofessional', 'Role', 'Curriculum', 'Status', 'Completion %', 'Modules Signed Off', 'Total Modules', 'Cleared Duties', 'Last Sign-off Date'];
    const lines = rows.map(r => {
      const lastDate = r.signedOff.map(s => s.completedDate).filter(Boolean).sort().slice(-1)[0] ?? '';
      return [
        r.para.name,
        r.para.role,
        r.curriculum?.name ?? '',
        STATUS_LABEL[r.status],
        String(r.pct),
        String(r.signedOff.length),
        String(r.curriculum?.modules.length ?? 0),
        r.duties.join('; '),
        lastDate,
      ].map(csvCell).join(',');
    });
    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'parapath-compliance-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-paper">
      <nav className="border-b bg-card px-6 py-3 flex items-center gap-3 print:hidden">
        <Link href="/admin" className="text-inkfaint hover:text-ink transition-colors"><ChevronLeft className="h-4 w-4" /></Link>
        <BookOpen className="h-4 w-4 text-accent" />
        <span className="font-display font-semibold text-[15px] tracking-tight">ParaPath</span>
        <span className="text-inkfaint">/</span>
        <span className="text-sm text-inkmute">Compliance Report</span>
        <div className="ml-auto flex items-center gap-2">
          <Button onClick={downloadCsv} variant="outline" size="sm" className="gap-1.5"><Download className="h-3.5 w-3.5" /> CSV</Button>
          <Button onClick={() => window.print()} size="sm" className="bg-ink hover:bg-ink/90 text-paper gap-1.5"><Printer className="h-3.5 w-3.5" /> Print</Button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Report header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-ink">Paraprofessional Training Compliance Report</h1>
          <p className="text-sm text-inkmute mt-1">Riverside Unified School District · Generated {today}</p>
          <div className="flex gap-6 mt-3 text-sm">
            <span><span className="font-semibold text-ink">{rows.length}</span> <span className="text-inkmute">paras</span></span>
            <span><span className="font-semibold text-pass">{rows.filter(r => r.status === 'complete').length}</span> <span className="text-inkmute">fully compliant</span></span>
            <span><span className="font-semibold text-fail">{rows.filter(r => r.status === 'overdue').length}</span> <span className="text-inkmute">overdue</span></span>
          </div>
        </div>

        {/* Report table */}
        <div className="bg-card rounded-xl border border-line overflow-hidden print:border-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-paper print:bg-card">
                <th className="text-left px-4 py-2.5 font-semibold text-ink">Paraprofessional</th>
                <th className="text-left px-4 py-2.5 font-semibold text-ink">Curriculum</th>
                <th className="text-left px-4 py-2.5 font-semibold text-ink">Status</th>
                <th className="text-right px-4 py-2.5 font-semibold text-ink">Modules</th>
                <th className="text-right px-4 py-2.5 font-semibold text-ink">Last Sign-off</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const lastDate = r.signedOff.map(s => s.completedDate).filter(Boolean).sort().slice(-1)[0] ?? '—';
                return (
                  <tr key={r.para.id} className="border-b border-line align-top">
                    <td className="px-4 py-3">
                      <div className="font-medium text-ink">{r.para.name}</div>
                      <div className="text-xs text-inkmute">{r.para.role}</div>
                    </td>
                    <td className="px-4 py-3 text-inkmute">{r.curriculum?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${r.status === 'complete' ? 'text-pass' : r.status === 'overdue' ? 'text-fail' : r.status === 'in_progress' ? 'text-info' : 'text-inkmute'}`}>
                        {STATUS_LABEL[r.status]} ({r.pct}%)
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-ink">{r.signedOff.length}/{r.curriculum?.modules.length ?? 0}</td>
                    <td className="px-4 py-3 text-right text-inkmute">{lastDate}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Cleared duties detail */}
        <div className="mt-6 bg-card rounded-xl border border-line p-5 print:border-0">
          <h2 className="font-semibold text-ink mb-3">Duty Clearance Detail</h2>
          <div className="space-y-3">
            {rows.map(r => (
              <div key={r.para.id} className="border-b border-line pb-3 last:border-0">
                <div className="text-sm font-medium text-ink mb-1">{r.para.name} <span className="text-inkfaint font-normal">— {r.duties.length} duties cleared</span></div>
                <div className="flex flex-wrap gap-1.5">
                  {r.duties.length > 0
                    ? r.duties.map(d => <Badge key={d} variant="outline" className="text-xs bg-passbg text-pass border-pass/30">{d}</Badge>)
                    : <span className="text-xs text-inkfaint italic">None cleared</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-inkfaint mt-4 print:mt-8">
          This report reflects supervisor-verified competency sign-offs. Duties are cleared only after a supervisor confirms demonstrated competency via observation checklist. Generated by ParaPath.
        </p>
      </div>
    </div>
  );
}

function csvCell(v: string): string {
  if (v.includes(',') || v.includes('"') || v.includes('\n')) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}
