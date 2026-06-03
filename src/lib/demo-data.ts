import { Module, Curriculum, Para } from './types';

// ─────────────────────────────────────────────────────────────
// Module library — the reusable building blocks. A district can
// add to this; curriculums assemble these into named tracks.
// ─────────────────────────────────────────────────────────────
export const MODULE_LIBRARY: Module[] = [
  {
    id: 'm1',
    title: 'De-escalation Basics',
    description: 'Recognize early warning signs and use non-confrontational language to prevent behavioral escalation in the classroom.',
    duration: '7 min',
    duties: ['Unsupervised 1:1 support', 'Behavioral observation logging'],
  },
  {
    id: 'm2',
    title: 'Choking Response & First Aid',
    description: 'Abdominal thrusts, back blows, and when to call 911. Required before any food-service or lunchroom duty.',
    duration: '5 min',
    duties: ['Lunchroom supervision', 'Food service support'],
  },
  {
    id: 'm3',
    title: 'Seizure Response Protocol',
    description: 'What to do (and not do) during a seizure event, timing, positioning, and documentation requirements.',
    duration: '6 min',
    duties: ['Medication administration support', 'Health aide coverage'],
  },
  {
    id: 'm4',
    title: 'Autism Support Strategies',
    description: 'Evidence-based strategies for supporting students on the autism spectrum: structured routines, sensory accommodations, AAC basics.',
    duration: '9 min',
    duties: ['ASD classroom assignment', 'AAC device support'],
  },
  {
    id: 'm5',
    title: 'Least Restrictive Environment',
    description: 'Understanding LRE, inclusive practices, and how paras support inclusion without creating dependence.',
    duration: '8 min',
    duties: ['General ed inclusion support', 'Co-teaching assistance'],
  },
  {
    id: 'm6',
    title: 'Confidentiality & FERPA',
    description: 'What student information you can and cannot share, with whom, and how to handle sensitive records.',
    duration: '5 min',
    duties: ['IEP meeting attendance', 'Progress note access'],
  },
  {
    id: 'm7',
    title: 'Positive Behavior Support (PBS)',
    description: 'Function-based thinking, antecedent strategies, and reinforcement systems aligned to behavior intervention plans.',
    duration: '10 min',
    duties: ['Behavior support plan implementation', 'Data collection primary'],
  },
  {
    id: 'm8',
    title: 'Physical Crisis Intervention Awareness',
    description: 'When physical intervention is appropriate, restraint policies, documentation, and incident reporting.',
    duration: '8 min',
    duties: ['Crisis response team support', 'Restraint documentation'],
  },
  {
    id: 'm9',
    title: 'Feeding & Swallowing Safety',
    description: 'Supporting students with dysphagia: positioning, pacing, texture modification, and recognizing aspiration risk.',
    duration: '7 min',
    duties: ['Feeding assistance', 'Mealtime supervision (medical)'],
  },
  {
    id: 'm10',
    title: 'AAC & Communication Devices',
    description: 'Operating augmentative and alternative communication devices and modeling their use throughout the day.',
    duration: '9 min',
    duties: ['AAC device support', 'Communication partner role'],
  },
];

export const MODULE_MAP: Record<string, Module> = Object.fromEntries(
  MODULE_LIBRARY.map(m => [m.id, m])
);

// ─────────────────────────────────────────────────────────────
// Seed curriculums — named training paths targeted at roles.
// The same module can sit at different track days in different
// curriculums (e.g. PBS is day-90 in Core, day-60 for Behavioral).
// ─────────────────────────────────────────────────────────────
export const SEED_CURRICULUMS: Curriculum[] = [
  {
    id: 'cur_core',
    name: 'Core Special Education Onboarding',
    description: 'The baseline path for all new special education paraprofessionals. Covers safety, behavior, and compliance fundamentals.',
    appliesToRoles: ['Special Ed Para'],
    modules: [
      { moduleId: 'm1', day: 30 },
      { moduleId: 'm2', day: 30 },
      { moduleId: 'm3', day: 30 },
      { moduleId: 'm4', day: 60 },
      { moduleId: 'm5', day: 60 },
      { moduleId: 'm6', day: 60 },
      { moduleId: 'm7', day: 90 },
      { moduleId: 'm8', day: 90 },
    ],
  },
  {
    id: 'cur_behavioral',
    name: 'Behavioral Para Track',
    description: 'For paras supporting students with significant behavioral needs. Front-loads de-escalation and crisis competencies.',
    appliesToRoles: ['Behavioral Para'],
    modules: [
      { moduleId: 'm1', day: 30 },
      { moduleId: 'm7', day: 30 }, // PBS pulled forward to day-30 for this role
      { moduleId: 'm3', day: 30 },
      { moduleId: 'm8', day: 60 }, // crisis intervention earlier than Core
      { moduleId: 'm6', day: 60 },
      { moduleId: 'm4', day: 90 },
    ],
  },
  {
    id: 'cur_inclusion',
    name: 'Inclusion Para Track',
    description: 'For paras supporting students in general education settings. Emphasizes LRE, co-teaching, and fostering independence.',
    appliesToRoles: ['Inclusion Para'],
    modules: [
      { moduleId: 'm1', day: 30 },
      { moduleId: 'm6', day: 30 },
      { moduleId: 'm5', day: 60 },
      { moduleId: 'm4', day: 60 },
      { moduleId: 'm7', day: 90 },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// Seed paras — each assigned to a curriculum. Dates are relative
// to today so the demo always shows a realistic status mix.
// ─────────────────────────────────────────────────────────────
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export const SEED_PARAS: Para[] = [
  {
    id: 'p1',
    name: 'Destiny Williams',
    role: 'Special Ed Para',
    startDate: daysAgo(45),
    avatar: 'DW',
    curriculumId: 'cur_core',
    progress: [
      { moduleId: 'm1', completed: true, completedDate: daysAgo(42) },
      { moduleId: 'm2', completed: true, completedDate: daysAgo(41) },
      { moduleId: 'm3', completed: true, completedDate: daysAgo(38) },
      { moduleId: 'm4', completed: true, completedDate: daysAgo(15) },
      { moduleId: 'm5', completed: true, completedDate: daysAgo(13) },
      { moduleId: 'm6', completed: false },
      { moduleId: 'm7', completed: false },
      { moduleId: 'm8', completed: false },
    ],
  },
  {
    id: 'p2',
    name: 'Marcus Johnson',
    role: 'Behavioral Para',
    startDate: daysAgo(110),
    avatar: 'MJ',
    curriculumId: 'cur_behavioral',
    progress: [
      { moduleId: 'm1', completed: true, completedDate: daysAgo(108) },
      { moduleId: 'm7', completed: true, completedDate: daysAgo(105) },
      { moduleId: 'm3', completed: true, completedDate: daysAgo(101) },
      { moduleId: 'm8', completed: true, completedDate: daysAgo(70) },
      { moduleId: 'm6', completed: true, completedDate: daysAgo(68) },
      { moduleId: 'm4', completed: true, completedDate: daysAgo(35) },
    ],
  },
  {
    id: 'p3',
    name: 'Aisha Patel',
    role: 'Special Ed Para',
    startDate: daysAgo(50),
    avatar: 'AP',
    curriculumId: 'cur_core',
    progress: [
      { moduleId: 'm1', completed: true, completedDate: daysAgo(47) },
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
    id: 'p4',
    name: 'Tyler Reeves',
    role: 'Inclusion Para',
    startDate: daysAgo(4),
    avatar: 'TR',
    curriculumId: 'cur_inclusion',
    progress: [
      { moduleId: 'm1', completed: false },
      { moduleId: 'm6', completed: false },
      { moduleId: 'm5', completed: false },
      { moduleId: 'm4', completed: false },
      { moduleId: 'm7', completed: false },
    ],
  },
  {
    id: 'p5',
    name: 'Camille Torres',
    role: 'Special Ed Para',
    startDate: daysAgo(22),
    avatar: 'CT',
    curriculumId: 'cur_core',
    progress: [
      { moduleId: 'm1', completed: true, completedDate: daysAgo(20) },
      { moduleId: 'm2', completed: true, completedDate: daysAgo(19) },
      { moduleId: 'm3', completed: true, completedDate: daysAgo(15) },
      { moduleId: 'm4', completed: false },
      { moduleId: 'm5', completed: false },
      { moduleId: 'm6', completed: false },
      { moduleId: 'm7', completed: false },
      { moduleId: 'm8', completed: false },
    ],
  },
];
