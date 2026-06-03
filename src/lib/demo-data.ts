export type DutyStatus = 'locked' | 'unlocked';
export type TrackStatus = 'not_started' | 'in_progress' | 'complete' | 'overdue';

export interface Module {
  id: string;
  title: string;
  description: string;
  duration: string;
  day: 30 | 60 | 90;
  videoId: string; // YouTube video ID
  duties: string[]; // duties unlocked on completion
}

export interface ParaProgress {
  moduleId: string;
  completed: boolean;
  completedDate?: string;
}

export interface Para {
  id: string;
  name: string;
  role: string;
  startDate: string;
  progress: ParaProgress[];
  avatar: string;
}

// Compute an ISO date string N days before today so the demo always shows
// a realistic, fresh mix of statuses regardless of when it's viewed.
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function completedDaysAgo(n: number): string {
  return daysAgo(n);
}

export const MODULES: Module[] = [
  // 30-day track
  {
    id: 'm1',
    title: 'De-escalation Basics',
    description: 'Recognize early warning signs and use non-confrontational language to prevent behavioral escalation in the classroom.',
    duration: '7 min',
    day: 30,
    videoId: 'b_oFQQ_WDBE', // Real de-escalation training video
    duties: ['Unsupervised 1:1 support', 'Behavioral observation logging'],
  },
  {
    id: 'm2',
    title: 'Choking Response & First Aid',
    description: 'Abdominal thrusts, back blows, and when to call 911. Required before any food-service or lunchroom duty.',
    duration: '5 min',
    day: 30,
    videoId: 'PA9hpOnvtCk', // Real first aid video
    duties: ['Lunchroom supervision', 'Food service support'],
  },
  {
    id: 'm3',
    title: 'Seizure Response Protocol',
    description: 'What to do (and not do) during a seizure event, timing, positioning, and documentation requirements.',
    duration: '6 min',
    day: 30,
    videoId: 'QKtGrWMd_98',
    duties: ['Medication administration support', 'Health aide coverage'],
  },
  // 60-day track
  {
    id: 'm4',
    title: 'Autism Support Strategies',
    description: 'Evidence-based strategies for supporting students on the autism spectrum: structured routines, sensory accommodations, AAC basics.',
    duration: '9 min',
    day: 60,
    videoId: 'Lk488PACIlk',
    duties: ['ASD classroom assignment', 'AAC device support'],
  },
  {
    id: 'm5',
    title: 'Least Restrictive Environment',
    description: 'Understanding LRE, inclusive practices, and how paras support inclusion without creating dependence.',
    duration: '8 min',
    day: 60,
    videoId: 'ZKk8WE6JEtg',
    duties: ['General ed inclusion support', 'Co-teaching assistance'],
  },
  {
    id: 'm6',
    title: 'Confidentiality & FERPA',
    description: 'What student information you can and cannot share, with whom, and how to handle sensitive records.',
    duration: '5 min',
    day: 60,
    videoId: 'JqGMfTsWHZk',
    duties: ['IEP meeting attendance', 'Progress note access'],
  },
  // 90-day track
  {
    id: 'm7',
    title: 'Positive Behavior Support (PBS)',
    description: 'Function-based thinking, antecedent strategies, and reinforcement systems aligned to behavior intervention plans.',
    duration: '10 min',
    day: 90,
    videoId: 'wl0sZGbMnUQ',
    duties: ['Behavior support plan implementation', 'Data collection primary'],
  },
  {
    id: 'm8',
    title: 'Physical Crisis Intervention Awareness',
    description: 'When physical intervention is appropriate, restraint policies, documentation, and incident reporting.',
    duration: '8 min',
    day: 90,
    videoId: 'nGeKSiCQkPw',
    duties: ['Crisis response team support', 'Restraint documentation'],
  },
];

export const PARAS: Para[] = [
  {
    // In progress: day-30 done, working through day-60 track
    id: 'p1',
    name: 'Destiny Williams',
    role: 'Special Ed Para',
    startDate: daysAgo(45),
    avatar: 'DW',
    progress: [
      { moduleId: 'm1', completed: true, completedDate: completedDaysAgo(42) },
      { moduleId: 'm2', completed: true, completedDate: completedDaysAgo(41) },
      { moduleId: 'm3', completed: true, completedDate: completedDaysAgo(38) },
      { moduleId: 'm4', completed: true, completedDate: completedDaysAgo(15) },
      { moduleId: 'm5', completed: true, completedDate: completedDaysAgo(13) },
      { moduleId: 'm6', completed: false },
      { moduleId: 'm7', completed: false },
      { moduleId: 'm8', completed: false },
    ],
  },
  {
    // Complete: finished the full 90-day track
    id: 'p2',
    name: 'Marcus Johnson',
    role: 'Behavioral Para',
    startDate: daysAgo(110),
    avatar: 'MJ',
    progress: [
      { moduleId: 'm1', completed: true, completedDate: completedDaysAgo(108) },
      { moduleId: 'm2', completed: true, completedDate: completedDaysAgo(108) },
      { moduleId: 'm3', completed: true, completedDate: completedDaysAgo(101) },
      { moduleId: 'm4', completed: true, completedDate: completedDaysAgo(85) },
      { moduleId: 'm5', completed: true, completedDate: completedDaysAgo(84) },
      { moduleId: 'm6', completed: true, completedDate: completedDaysAgo(81) },
      { moduleId: 'm7', completed: true, completedDate: completedDaysAgo(35) },
      { moduleId: 'm8', completed: true, completedDate: completedDaysAgo(34) },
    ],
  },
  {
    // Overdue: started 50 days ago but barely progressed — the compliance flag
    id: 'p3',
    name: 'Aisha Patel',
    role: 'Special Ed Para',
    startDate: daysAgo(50),
    avatar: 'AP',
    progress: [
      { moduleId: 'm1', completed: true, completedDate: completedDaysAgo(47) },
      { moduleId: 'm2', completed: false },
      { moduleId: 'm3', completed: false },
      { moduleId: 'm4', completed: false },
      { moduleId: 'm5', completed: false },
      { moduleId: 'm6', completed: false },
      { moduleId: 'm7', completed: false },
      { moduleId: 'm8', completed: false },
    ],
  },
  {
    // Just started: within the grace window, not yet flagged
    id: 'p4',
    name: 'Tyler Reeves',
    role: 'Inclusion Para',
    startDate: daysAgo(4),
    avatar: 'TR',
    progress: [
      { moduleId: 'm1', completed: false },
      { moduleId: 'm2', completed: false },
      { moduleId: 'm3', completed: false },
      { moduleId: 'm4', completed: false },
      { moduleId: 'm5', completed: false },
      { moduleId: 'm6', completed: false },
      { moduleId: 'm7', completed: false },
      { moduleId: 'm8', completed: false },
    ],
  },
  {
    // In progress: day-30 track done, early on
    id: 'p5',
    name: 'Camille Torres',
    role: 'Special Ed Para',
    startDate: daysAgo(22),
    avatar: 'CT',
    progress: [
      { moduleId: 'm1', completed: true, completedDate: completedDaysAgo(20) },
      { moduleId: 'm2', completed: true, completedDate: completedDaysAgo(19) },
      { moduleId: 'm3', completed: true, completedDate: completedDaysAgo(15) },
      { moduleId: 'm4', completed: false },
      { moduleId: 'm5', completed: false },
      { moduleId: 'm6', completed: false },
      { moduleId: 'm7', completed: false },
      { moduleId: 'm8', completed: false },
    ],
  },
];

export function getParaTrackStatus(para: Para): TrackStatus {
  const daysSinceStart = Math.floor((Date.now() - new Date(para.startDate).getTime()) / (1000 * 60 * 60 * 24));
  const day30Modules = MODULES.filter(m => m.day === 30);
  const day60Modules = MODULES.filter(m => m.day <= 60);
  const completed = para.progress.filter(p => p.completed).length;

  if (completed === 0 && daysSinceStart > 7) return 'overdue';

  const day30Done = day30Modules.every(m => para.progress.find(p => p.moduleId === m.id)?.completed);
  if (daysSinceStart > 30 && !day30Done) return 'overdue';

  const day60Done = day60Modules.every(m => para.progress.find(p => p.moduleId === m.id)?.completed);
  if (daysSinceStart > 60 && !day60Done) return 'overdue';

  if (completed === MODULES.length) return 'complete';
  if (completed > 0) return 'in_progress';
  return 'not_started';
}

export function getUnlockedDuties(para: Para): string[] {
  const unlocked = new Set<string>();
  for (const prog of para.progress) {
    if (prog.completed) {
      const mod = MODULES.find(m => m.id === prog.moduleId);
      mod?.duties.forEach(d => unlocked.add(d));
    }
  }
  return [...unlocked];
}

export function getCompletionPct(para: Para): number {
  const done = para.progress.filter(p => p.completed).length;
  return Math.round((done / MODULES.length) * 100);
}
