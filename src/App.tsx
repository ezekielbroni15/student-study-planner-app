'use client';

import {
  BarChart3,
  Bell,
  BookOpen,
  BrainCircuit,
  CalendarClock,
  Check,
  CheckCircle2,
  Clock3,
  Grid2X2,
  Lightbulb,
  Moon,
  Pencil,
  Plus,
  Repeat2,
  Timer,
  Trash2,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type SubjectName = 'Mathematics' | 'Physics' | 'Computer Science' | 'Literature' | 'History';
type Priority = 'High' | 'Medium' | 'Low';

type Subject = {
  name: SubjectName;
  priority: Priority;
  daysLeft: number;
  progress: number;
};

type StudySession = {
  id: string;
  subject: SubjectName;
  topic: string;
  time: string;
  done: boolean;
};

type DayPlan = {
  weekday: string;
  day: string;
  month: string;
  sessions: StudySession[];
};

const subjectStyles: Record<SubjectName, { dot: string; bg: string; bar: string }> = {
  Mathematics: { dot: '#ff4d57', bg: '#ffe1e3', bar: '#ff4d57' },
  Physics: { dot: '#ffa510', bg: '#fff2c7', bar: '#ffa510' },
  'Computer Science': { dot: '#5a4dff', bg: '#e9edff', bar: '#5a4dff' },
  Literature: { dot: '#8a4dff', bg: '#f0ebff', bar: '#8a4dff' },
  History: { dot: '#1fc48f', bg: '#d3f8e7', bar: '#1fc48f' },
};

const initialSubjects: Subject[] = [
  { name: 'Mathematics', priority: 'High', daysLeft: 3, progress: 92 },
  { name: 'Physics', priority: 'High', daysLeft: 5, progress: 80 },
  { name: 'Computer Science', priority: 'Medium', daysLeft: 8, progress: 65 },
  { name: 'Literature', priority: 'Medium', daysLeft: 12, progress: 45 },
  { name: 'History', priority: 'Low', daysLeft: 15, progress: 28 },
];

const weekPlan: DayPlan[] = [
  {
    weekday: 'Mon',
    day: '7',
    month: 'Jul',
    sessions: [
      { id: 'mon-1', subject: 'Mathematics', topic: 'Calculus - Limits and Derivatives', time: '8:00-9:30', done: true },
      { id: 'mon-2', subject: 'Physics', topic: "Newton's Laws review", time: '10:00-11:00', done: true },
      { id: 'mon-3', subject: 'Mathematics', topic: 'Practice problem sets', time: '14:00-15:30', done: false },
    ],
  },
  {
    weekday: 'Tue',
    day: '8',
    month: 'Jul',
    sessions: [
      { id: 'tue-1', subject: 'Physics', topic: 'Waves and Optics chapter', time: '9:00-10:30', done: true },
      { id: 'tue-2', subject: 'Computer Science', topic: 'Data structures - Trees', time: '11:00-12:00', done: false },
      { id: 'tue-3', subject: 'Mathematics', topic: 'Trig identities', time: '15:00-16:00', done: false },
    ],
  },
  {
    weekday: 'Wed',
    day: '9',
    month: 'Jul',
    sessions: [
      { id: 'wed-1', subject: 'Mathematics', topic: 'Integration methods', time: '8:00-9:30', done: false },
      { id: 'wed-2', subject: 'Literature', topic: 'Essay structure and themes', time: '10:00-11:00', done: false },
      { id: 'wed-3', subject: 'Computer Science', topic: 'Sorting algorithms', time: '14:00-15:00', done: false },
    ],
  },
  {
    weekday: 'Thu',
    day: '10',
    month: 'Jul',
    sessions: [
      { id: 'thu-1', subject: 'Mathematics', topic: 'Mock exam practice', time: '8:00-9:30', done: false },
      { id: 'thu-2', subject: 'Physics', topic: 'Electricity and Circuits', time: '10:00-11:30', done: false },
    ],
  },
  {
    weekday: 'Fri',
    day: '11',
    month: 'Jul',
    sessions: [
      { id: 'fri-1', subject: 'Computer Science', topic: 'Graph theory basics', time: '9:00-10:00', done: false },
      { id: 'fri-2', subject: 'Literature', topic: 'Poetry analysis', time: '11:00-12:00', done: false },
      { id: 'fri-3', subject: 'History', topic: 'WW2 key events', time: '14:00-15:30', done: false },
    ],
  },
  {
    weekday: 'Sat',
    day: '12',
    month: 'Jul',
    sessions: [
      { id: 'sat-1', subject: 'Physics', topic: 'Thermodynamics review', time: '10:00-11:30', done: false },
      { id: 'sat-2', subject: 'History', topic: 'Cold War overview', time: '13:00-14:00', done: false },
    ],
  },
  {
    weekday: 'Sun',
    day: '13',
    month: 'Jul',
    sessions: [
      { id: 'sun-1', subject: 'Computer Science', topic: 'Full revision session', time: '10:00-11:00', done: false },
      { id: 'sun-2', subject: 'Mathematics', topic: 'Final mock test', time: '11:30-13:00', done: false },
    ],
  },
];

const tips = [
  { icon: Timer, text: 'Use Pomodoro technique: 25 min study, 5 min break for deep focus.' },
  { icon: Moon, text: 'Prioritize 7-8 hours of sleep - memory consolidation happens at night.' },
  { icon: Repeat2, text: 'Review notes within 24 hours to boost retention by up to 80%.' },
  { icon: Zap, text: 'Tackle hardest subjects when your energy is at its peak.' },
];

export default function Home() {
  const [subjects, setSubjects] = useState(initialSubjects);
  const [plan, setPlan] = useState(weekPlan);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const totalSessions = 24;
  const completedSessions = useMemo(
    () =>
      6 +
      plan.reduce(
        (count, day) => count + day.sessions.filter((session) => session.done).length,
        0,
      ),
    [plan],
  );
  const progress = Math.round((completedSessions / totalSessions) * 100);

  const toggleSession = (sessionId: string) => {
    setPlan((current) =>
      current.map((day) => ({
        ...day,
        sessions: day.sessions.map((session) =>
          session.id === sessionId ? { ...session, done: !session.done } : session,
        ),
      })),
    );
  };

  const removeSubject = (name: SubjectName) => {
    setSubjects((current) => current.filter((subject) => subject.name !== name));
    setPlan((current) =>
      current.map((day) => ({
        ...day,
        sessions: day.sessions.filter((session) => session.subject !== name),
      })),
    );
  };

  const addSubject = () => {
    if (subjects.some((subject) => subject.name === 'History')) {
      return;
    }

    setSubjects((current) => [
      ...current,
      { name: 'History', priority: 'Low', daysLeft: 15, progress: 28 },
    ]);
  };

  return (
    <main className="min-h-screen bg-[#f7f5ff] text-[#211d46]">
      <nav className="sticky top-0 z-20 border-b border-[#ddd8ff] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[84px] max-w-[1720px] items-center justify-between px-5 sm:px-8 lg:px-10">
          <div className="flex min-w-0 items-center gap-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#6246f5] text-white shadow-[0_8px_18px_rgba(98,70,245,0.28)]">
              <BrainCircuit size={22} />
            </div>
            <h1 className="truncate text-lg font-extrabold tracking-normal sm:text-2xl">AI Study Planner</h1>
            <span className="hidden rounded-lg bg-[#efe9ff] px-3 py-1 text-sm font-bold text-[#7659ff] sm:inline">
              Beta
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#6246f5] px-4 text-sm font-bold text-white shadow-[0_10px_24px_rgba(98,70,245,0.28)] transition hover:bg-[#5338df] sm:px-5 sm:text-base"
              onClick={() => setIsEditorOpen(true)}
              type="button"
            >
              <Pencil size={18} />
              <span className="hidden sm:inline">Edit Study Plan</span>
              <span className="sm:hidden">Edit</span>
            </button>
            <button
              className="grid h-11 w-11 place-items-center rounded-full bg-[#f0ebff] text-[#6246f5]"
              title="Notifications"
              type="button"
            >
              <Bell size={20} />
            </button>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-[1720px] px-5 py-8 sm:px-8 lg:px-10">
        <div>
          <h2 className="text-3xl font-extrabold tracking-normal sm:text-4xl">My Study Dashboard</h2>
          <p className="mt-2 text-base font-medium text-[#9189c7] sm:text-lg">
            Week of July 7-13, 2025 - AI-generated plan based on your subjects and exam dates
          </p>
        </div>

        <section className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard icon={<BookOpen size={25} />} value={subjects.length.toString()} label="Subjects - enrolled" />
          <SummaryCard icon={<Clock3 size={25} />} value="28h" label="Weekly Hours - planned" />
          <SummaryCard icon={<CalendarClock size={25} />} value="3 days" label="Next Exam - Mathematics" accent="orange" />
          <SummaryCard icon={<CheckCircle2 size={25} />} value={`${completedSessions} / ${totalSessions}`} label="Completed - sessions" accent="green" />
        </section>

        <section className="mt-7 rounded-2xl border border-[#ddd8ff] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-[#6246f5]" size={22} />
              <h3 className="text-lg font-extrabold">Weekly Progress</h3>
            </div>
            <span className="text-lg font-extrabold text-[#6246f5]">{progress}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-[#e6e1fb]">
            <div className="h-full rounded-full bg-[#6246f5]" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-4 text-base font-medium text-[#9189c7]">
            {completedSessions} of {totalSessions} sessions completed this week
          </p>
        </section>

        <section className="mt-7 overflow-hidden rounded-2xl border border-[#ddd8ff] bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-[#ddd8ff] px-6 py-5">
            <div className="flex items-center gap-3">
              <Grid2X2 className="text-[#6246f5]" size={22} />
              <h3 className="text-lg font-extrabold">7-Day Study Timetable</h3>
            </div>
            <span className="hidden text-base font-medium text-[#9189c7] sm:inline">Jul 7 - Jul 13, 2025</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-7">
            {plan.map((day, index) => (
              <article
                className={`min-h-[360px] border-[#ddd8ff] p-3 sm:p-4 lg:border-r ${
                  index === 0 ? 'bg-[#ece7ff]' : 'bg-white'
                } ${index === plan.length - 1 ? 'lg:border-r-0' : ''}`}
                key={day.day}
              >
                <div className="mb-4 text-center">
                  <p className={`text-sm font-extrabold ${index === 0 ? 'text-[#6246f5]' : 'text-[#958cc7]'}`}>
                    {day.weekday}
                  </p>
                  <p className="text-2xl font-extrabold">{day.day}</p>
                  <p className="text-sm font-medium text-[#958cc7]">{day.month}</p>
                </div>

                <div className="space-y-3">
                  {day.sessions.map((session) => (
                    <SessionCard key={session.id} session={session} onToggle={toggleSession} />
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-7 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <section className="rounded-2xl border border-[#ddd8ff] bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <BarChart3 className="text-[#6246f5]" size={23} />
              <h3 className="text-lg font-extrabold">Subject Priority</h3>
            </div>
            <div className="space-y-5">
              {subjects.map((subject) => (
                <div key={subject.name}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="truncate text-lg font-extrabold">{subject.name}</span>
                      <PriorityPill priority={subject.priority} />
                    </div>
                    <span className="text-sm font-medium text-[#9189c7]">{subject.daysLeft}d left</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-[#e6e1fb]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${subject.progress}%`,
                        background: subjectStyles[subject.name].bar,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[#ddd8ff] bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <Lightbulb className="text-[#ffa510]" size={23} />
              <h3 className="text-lg font-extrabold">Study Tips</h3>
            </div>
            <div className="space-y-5">
              {tips.map((tip) => {
                const Icon = tip.icon;
                return (
                  <div className="flex items-center gap-4" key={tip.text}>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#eee9ff] text-[#6246f5]">
                      <Icon size={19} />
                    </span>
                    <p className="text-base font-medium leading-7 text-[#9189c7]">{tip.text}</p>
                  </div>
                );
              })}
            </div>
          </section>
        </section>
      </section>

      {isEditorOpen && (
        <div className="fixed inset-0 z-30 flex items-start justify-center overflow-y-auto bg-[#211d46]/45 px-4 py-6 backdrop-blur-sm">
          <section className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#ddd8ff] px-5 py-4">
              <div>
                <h3 className="text-xl font-extrabold">Edit Study Plan</h3>
                <p className="mt-1 text-sm font-medium text-[#9189c7]">Adjust the subjects used for this weekly dashboard.</p>
              </div>
              <button
                className="grid h-10 w-10 place-items-center rounded-xl bg-[#f0ebff] text-[#6246f5]"
                onClick={() => setIsEditorOpen(false)}
                title="Close editor"
                type="button"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              {subjects.map((subject) => (
                <div className="grid gap-3 rounded-2xl border border-[#ddd8ff] bg-[#fbfaff] p-4 sm:grid-cols-[1fr_120px_120px_44px]" key={subject.name}>
                  <label className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#9189c7]">
                    Subject
                    <input
                      className="mt-2 h-11 w-full rounded-xl border border-[#ddd8ff] bg-white px-3 text-base font-bold outline-none focus:border-[#6246f5]"
                      readOnly
                      value={subject.name}
                    />
                  </label>
                  <label className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#9189c7]">
                    Priority
                    <select
                      className="mt-2 h-11 w-full rounded-xl border border-[#ddd8ff] bg-white px-3 text-base font-bold outline-none focus:border-[#6246f5]"
                      onChange={(event) =>
                        setSubjects((current) =>
                          current.map((item) =>
                            item.name === subject.name
                              ? { ...item, priority: event.target.value as Priority }
                              : item,
                          ),
                        )
                      }
                      value={subject.priority}
                    >
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                  </label>
                  <label className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#9189c7]">
                    Days Left
                    <input
                      className="mt-2 h-11 w-full rounded-xl border border-[#ddd8ff] bg-white px-3 text-base font-bold outline-none focus:border-[#6246f5]"
                      min="1"
                      onChange={(event) =>
                        setSubjects((current) =>
                          current.map((item) =>
                            item.name === subject.name
                              ? { ...item, daysLeft: Number(event.target.value) }
                              : item,
                          ),
                        )
                      }
                      type="number"
                      value={subject.daysLeft}
                    />
                  </label>
                  <button
                    className="grid h-11 w-11 place-items-center self-end rounded-xl bg-[#ffe1e3] text-[#ff4d57]"
                    onClick={() => removeSubject(subject.name)}
                    title="Remove subject"
                    type="button"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <button
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#ddd8ff] px-4 text-sm font-extrabold text-[#6246f5]"
                  onClick={addSubject}
                  type="button"
                >
                  <Plus size={18} />
                  Add Subject
                </button>
                <button
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#6246f5] px-5 text-sm font-extrabold text-white"
                  onClick={() => setIsEditorOpen(false)}
                  type="button"
                >
                  <CheckCircle2 size={18} />
                  Save Plan
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function SummaryCard({
  icon,
  value,
  label,
  accent = 'purple',
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  accent?: 'purple' | 'orange' | 'green';
}) {
  const accentClass =
    accent === 'green'
      ? 'text-[#10bf8c]'
      : accent === 'orange'
        ? 'text-[#ffa510]'
        : 'text-[#6246f5]';

  return (
    <div className="flex min-h-[96px] items-center gap-5 rounded-2xl border border-[#ddd8ff] bg-white px-6 shadow-sm">
      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#f0ebff] ${accentClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-3xl font-extrabold leading-none">{value}</p>
        <p className="mt-2 text-sm font-medium text-[#9189c7]">{label}</p>
      </div>
    </div>
  );
}

function SessionCard({
  session,
  onToggle,
}: {
  session: StudySession;
  onToggle: (id: string) => void;
}) {
  const style = subjectStyles[session.subject];

  return (
    <div
      className="rounded-xl p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)]"
      style={{ background: style.bg }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: style.dot }} />
            <p className="truncate text-sm font-extrabold" style={{ color: style.dot }}>
              {session.subject === 'Computer Science' ? 'CS' : session.subject}
            </p>
          </div>
          <p className="mt-1 text-sm font-extrabold leading-5 text-[#29264f]">{session.topic}</p>
          <p className="mt-2 text-sm font-semibold text-[#9189c7]">{session.time}</p>
        </div>

        <button
          className={`mt-auto grid h-5 w-5 shrink-0 place-items-center rounded-md border text-white transition ${
            session.done ? 'border-[#10bf8c] bg-[#10bf8c]' : 'border-[#d9d4ff] bg-white'
          }`}
          onClick={() => onToggle(session.id)}
          title={session.done ? 'Mark incomplete' : 'Mark complete'}
          type="button"
        >
          {session.done && <Check size={14} />}
        </button>
      </div>
    </div>
  );
}

function PriorityPill({ priority }: { priority: Priority }) {
  const classes =
    priority === 'High'
      ? 'bg-[#ffe1e3] text-[#ff4d57]'
      : priority === 'Medium'
        ? 'bg-[#fff2c7] text-[#ffa510]'
        : 'bg-[#d3f8e7] text-[#10bf8c]';

  return <span className={`rounded-lg px-2.5 py-1 text-sm font-extrabold ${classes}`}>{priority}</span>;
}
