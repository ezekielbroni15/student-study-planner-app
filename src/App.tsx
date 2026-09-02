import {
  BarChart3,
  Bell,
  BookOpen,
  BrainCircuit,
  CalendarDays,
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

type Priority = 'High' | 'Medium' | 'Low';
type ViewMode = 'week' | 'year' | 'month';

type Subject = {
  id: number;
  name: string;
  priority: Priority;
  examDate: string;
  color: keyof typeof subjectStyles;
};

type StudySession = {
  id: string;
  date: Date;
  subject: Subject;
  topic: string;
  time: string;
  done: boolean;
};

const subjectStyles = {
  red: { dot: '#ff4d57', bg: '#ffe1e3', bar: '#ff4d57' },
  orange: { dot: '#ffa510', bg: '#fff2c7', bar: '#ffa510' },
  blue: { dot: '#5a4dff', bg: '#e9edff', bar: '#5a4dff' },
  purple: { dot: '#8a4dff', bg: '#f0ebff', bar: '#8a4dff' },
  green: { dot: '#1fc48f', bg: '#d3f8e7', bar: '#1fc48f' },
};

const startDate = new Date(2025, 6, 7);

const initialSubjects: Subject[] = [
  { id: 1, name: 'Mathematics', priority: 'High', examDate: '2025-07-10', color: 'red' },
  { id: 2, name: 'Physics', priority: 'High', examDate: '2025-07-12', color: 'orange' },
  { id: 3, name: 'Computer Science', priority: 'Medium', examDate: '2025-07-15', color: 'blue' },
  { id: 4, name: 'Literature', priority: 'Medium', examDate: '2025-07-19', color: 'purple' },
  { id: 5, name: 'History', priority: 'Low', examDate: '2025-07-22', color: 'green' },
];

const topics = [
  'Calculus - Limits and Derivatives',
  "Newton's Laws review",
  'Practice problem sets',
  'Waves and Optics chapter',
  'Data structures - Trees',
  'Trig identities',
  'Integration methods',
  'Essay structure and themes',
  'Sorting algorithms',
  'Mock exam practice',
  'Electricity and Circuits',
  'Poetry analysis',
  'Graph theory basics',
  'WW2 key events',
  'Thermodynamics review',
  'Cold War overview',
  'Full revision session',
  'Final mock test',
];

const timeSlots = [
  '8:00-9:30',
  '10:00-11:00',
  '14:00-15:30',
  '9:00-10:30',
  '11:00-12:00',
  '15:00-16:00',
  '8:00-9:30',
  '10:00-11:00',
  '14:00-15:00',
  '8:00-9:30',
  '10:00-11:30',
  '11:00-12:00',
  '9:00-10:00',
  '14:00-15:30',
  '10:00-11:30',
  '13:00-14:00',
  '10:00-11:00',
  '11:30-13:00',
];

const tips = [
  { icon: Timer, text: 'Use Pomodoro technique: 25 min study, 5 min break for deep focus.' },
  { icon: Moon, text: 'Prioritize 7-8 hours of sleep - memory consolidation happens at night.' },
  { icon: Repeat2, text: 'Review notes within 24 hours to boost retention by up to 80%.' },
  { icon: Zap, text: 'Tackle hardest subjects when your energy is at its peak.' },
];

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function dateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function sameDay(first: Date, second: Date) {
  return first.toDateString() === second.toDateString();
}

function priorityWeight(priority: Priority) {
  return priority === 'High' ? 3 : priority === 'Medium' ? 2 : 1;
}

function daysLeft(examDate: string) {
  const diff = new Date(`${examDate}T23:59:59`).getTime() - startDate.getTime();
  return Math.max(1, Math.ceil(diff / 86_400_000));
}

function buildSessions(subjects: Subject[], completed: string[]) {
  const safeSubjects =
    subjects.length > 0
      ? subjects
      : [{ id: 1, name: 'Study Session', priority: 'Medium' as Priority, examDate: '2025-07-18', color: 'blue' as const }];

  const weighted = safeSubjects
    .flatMap((subject) => Array.from({ length: priorityWeight(subject.priority) }, () => subject))
    .slice(0, 18);

  const sessions: StudySession[] = [];
  const dayCounts = [3, 3, 3, 2, 3, 2, 2];
  let cursor = 0;

  dayCounts.forEach((count, dayIndex) => {
    for (let i = 0; i < count; i += 1) {
      const subject = weighted[cursor % weighted.length] ?? safeSubjects[0];
      const id = `session-${dayIndex}-${i}-${subject.id}`;
      sessions.push({
        id,
        date: addDays(startDate, dayIndex),
        subject,
        topic: topics[cursor % topics.length],
        time: timeSlots[cursor % timeSlots.length],
        done: completed.includes(id),
      });
      cursor += 1;
    }
  });

  return sessions;
}

function monthGrid(year: number, monthIndex: number) {
  const firstDay = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const blanks = firstDay.getDay();
  return [
    ...Array.from({ length: blanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => new Date(year, monthIndex, index + 1)),
  ];
}

export default function App() {
  const [subjects, setSubjects] = useState(initialSubjects);
  const [completed, setCompleted] = useState<string[]>([
    'session-0-0-1',
    'session-0-1-1',
    'session-0-2-1',
  ]);
  const [view, setView] = useState<ViewMode>('week');
  const [monthIndex, setMonthIndex] = useState(6);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const sessions = useMemo(() => buildSessions(subjects, completed), [subjects, completed]);
  const completedCount = 6 + sessions.filter((session) => session.done).length;
  const totalSessions = 24;
  const progress = Math.round((completedCount / totalSessions) * 100);
  const weekEnd = addDays(startDate, 6);

  const toggleSession = (id: string) => {
    setCompleted((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const updateSubject = (id: number, field: keyof Subject, value: string) => {
    setSubjects((current) =>
      current.map((subject) => (subject.id === id ? { ...subject, [field]: value } : subject)),
    );
  };

  const removeSubject = (id: number) => {
    setSubjects((current) => (current.length <= 1 ? current : current.filter((subject) => subject.id !== id)));
  };

  const addSubject = () => {
    const colors = Object.keys(subjectStyles) as Subject['color'][];
    setSubjects((current) => [
      ...current,
      {
        id: Date.now(),
        name: `Subject ${current.length + 1}`,
        priority: 'Medium',
        examDate: dateInput(addDays(startDate, 18)),
        color: colors[current.length % colors.length],
      },
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

          <div className="flex items-center gap-3 sm:gap-4">
            <Segmented view={view} setView={setView} />
            <button
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#6246f5] px-4 text-sm font-bold text-white shadow-[0_10px_24px_rgba(98,70,245,0.28)] transition hover:bg-[#5338df] sm:px-5 sm:text-base"
              onClick={() => setIsEditorOpen(true)}
              type="button"
            >
              <Pencil size={18} />
              <span className="hidden sm:inline">Edit Study Plan</span>
              <span className="sm:hidden">Edit</span>
            </button>
            <button className="hidden h-11 w-11 place-items-center rounded-full bg-[#f0ebff] text-[#6246f5] sm:grid" title="Notifications" type="button">
              <Bell size={20} />
            </button>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-[1720px] px-5 py-8 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-3xl font-extrabold tracking-normal sm:text-4xl">My Study Dashboard</h2>
            <p className="mt-2 text-base font-medium text-[#9189c7] sm:text-lg">
              Week of July 7-13, 2025 - AI-generated plan based on your subjects and exam dates
            </p>
            <div className="mt-5 lg:hidden">
              <MobileSegmented view={view} setView={setView} />
            </div>
          </div>
          {view === 'month' && (
            <button
              className="inline-flex h-10 items-center justify-center rounded-xl border border-[#ddd8ff] bg-white px-4 text-sm font-extrabold text-[#6246f5]"
              onClick={() => setView('year')}
              type="button"
            >
              Back to Year View
            </button>
          )}
        </div>

        <section className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard icon={<BookOpen size={25} />} value={subjects.length.toString()} label="Subjects - enrolled" />
          <SummaryCard icon={<Clock3 size={25} />} value="28h" label="Weekly Hours - planned" />
          <SummaryCard icon={<CalendarDays size={25} />} value="3 days" label="Next Exam - Mathematics" accent="orange" />
          <SummaryCard icon={<CheckCircle2 size={25} />} value={`${completedCount} / ${totalSessions}`} label="Completed - sessions" accent="green" />
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
            {completedCount} of {totalSessions} sessions completed this week
          </p>
        </section>

        {view === 'week' && <WeekTimetable sessions={sessions} weekEnd={weekEnd} onToggle={toggleSession} />}
        {view === 'year' && (
          <YearCalendar
            sessions={sessions}
            selectedMonth={monthIndex}
            onSelect={(selected) => {
              setMonthIndex(selected);
              setView('month');
            }}
          />
        )}
        {view === 'month' && <MonthView monthIndex={monthIndex} sessions={sessions} onToggle={toggleSession} />}

        <section className="mt-7 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <SubjectPriority subjects={subjects} />
          <StudyTips />
        </section>
      </section>

      {isEditorOpen && (
        <PlanEditor
          subjects={subjects}
          updateSubject={updateSubject}
          removeSubject={removeSubject}
          addSubject={addSubject}
          close={() => setIsEditorOpen(false)}
        />
      )}
    </main>
  );
}

function Segmented({ view, setView }: { view: ViewMode; setView: (view: ViewMode) => void }) {
  return (
    <div className="hidden rounded-xl bg-[#f0ebff] p-1 lg:flex">
      {(['week', 'year'] as ViewMode[]).map((item) => (
        <button
          className={`h-9 rounded-lg px-4 text-sm font-extrabold capitalize transition ${
            view === item ? 'bg-white text-[#6246f5] shadow-sm' : 'text-[#9189c7]'
          }`}
          key={item}
          onClick={() => setView(item)}
          type="button"
        >
          {item === 'week' ? '7 Days' : 'Year Calendar'}
        </button>
      ))}
    </div>
  );
}

function MobileSegmented({ view, setView }: { view: ViewMode; setView: (view: ViewMode) => void }) {
  return (
    <div className="grid grid-cols-2 rounded-xl bg-[#ebe6ff] p-1">
      {(['week', 'year'] as ViewMode[]).map((item) => (
        <button
          className={`h-10 rounded-lg text-sm font-extrabold capitalize transition ${
            view === item ? 'bg-white text-[#6246f5] shadow-sm' : 'text-[#9189c7]'
          }`}
          key={item}
          onClick={() => setView(item)}
          type="button"
        >
          {item === 'week' ? '7 Days' : 'Year Calendar'}
        </button>
      ))}
    </div>
  );
}

function WeekTimetable({
  sessions,
  weekEnd,
  onToggle,
}: {
  sessions: StudySession[];
  weekEnd: Date;
  onToggle: (id: string) => void;
}) {
  const days = Array.from({ length: 7 }, (_, index) => addDays(startDate, index));

  return (
    <section className="mt-7 overflow-hidden rounded-2xl border border-[#ddd8ff] bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-[#ddd8ff] px-6 py-5">
        <div className="flex items-center gap-3">
          <Grid2X2 className="text-[#6246f5]" size={22} />
          <h3 className="text-lg font-extrabold">7-Day Study Timetable</h3>
        </div>
        <span className="hidden text-base font-medium text-[#9189c7] sm:inline">
          Jul {startDate.getDate()} - Jul {weekEnd.getDate()}, 2025
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7">
        {days.map((date, index) => (
          <article
            className={`min-h-[360px] border-[#ddd8ff] p-3 sm:p-4 lg:border-r ${
              index === 0 ? 'bg-[#ece7ff]' : 'bg-white'
            } ${index === 6 ? 'lg:border-r-0' : ''}`}
            key={date.toISOString()}
          >
            <DayHeader date={date} active={index === 0} short />
            <div className="space-y-3">
              {sessions.filter((session) => sameDay(session.date, date)).map((session) => (
                <SessionCard key={session.id} session={session} onToggle={onToggle} />
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function YearCalendar({
  sessions,
  selectedMonth,
  onSelect,
}: {
  sessions: StudySession[];
  selectedMonth: number;
  onSelect: (month: number) => void;
}) {
  return (
    <section className="mt-7 rounded-2xl border border-[#ddd8ff] bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CalendarDays className="text-[#6246f5]" size={23} />
          <h3 className="text-lg font-extrabold">Study Calendar 2025</h3>
        </div>
        <span className="text-sm font-bold text-[#9189c7]">Click a month to view all planned study days</span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {monthNames.map((month, index) => {
          const count = sessions.filter((session) => session.date.getMonth() === index).length;
          const active = selectedMonth === index;

          return (
            <button
              className={`min-h-[126px] rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                count
                  ? 'border-[#c8c0ff] bg-[#f3efff]'
                  : 'border-[#e2def9] bg-white'
              } ${active ? 'ring-2 ring-[#6246f5]' : ''}`}
              key={month}
              onClick={() => onSelect(index)}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xl font-extrabold">{month}</p>
                  <p className="mt-1 text-sm font-bold text-[#9189c7]">2025</p>
                </div>
                <span className={`rounded-lg px-3 py-1 text-sm font-extrabold ${count ? 'bg-[#6246f5] text-white' : 'bg-[#f0ebff] text-[#9189c7]'}`}>
                  {count ? `${count} sessions` : 'No plan'}
                </span>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#e6e1fb]">
                <div className="h-full rounded-full bg-[#6246f5]" style={{ width: count ? '62%' : '0%' }} />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function MonthView({
  monthIndex,
  sessions,
  onToggle,
}: {
  monthIndex: number;
  sessions: StudySession[];
  onToggle: (id: string) => void;
}) {
  const cells = monthGrid(2025, monthIndex);
  const monthSessions = sessions.filter((session) => session.date.getMonth() === monthIndex);

  return (
    <section className="mt-7 overflow-hidden rounded-2xl border border-[#ddd8ff] bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b border-[#ddd8ff] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <CalendarDays className="text-[#6246f5]" size={23} />
          <h3 className="text-lg font-extrabold">{monthNames[monthIndex]} 2025 Month View</h3>
        </div>
        <span className="text-sm font-bold text-[#9189c7]">
          {monthSessions.length} planned sessions shown across the month
        </span>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-7 border-b border-[#ddd8ff] bg-[#fbfaff]">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div className="px-3 py-3 text-center text-sm font-extrabold text-[#9189c7]" key={day}>
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((date, index) => {
              const daySessions = date ? sessions.filter((session) => sameDay(session.date, date)) : [];

              return (
                <div className="min-h-[154px] border-b border-r border-[#eeeaff] p-2 last:border-r-0" key={date?.toISOString() ?? `blank-${index}`}>
                  {date && (
                    <>
                      <p className={`mb-2 text-sm font-extrabold ${daySessions.length ? 'text-[#6246f5]' : 'text-[#9189c7]'}`}>
                        {date.getDate()}
                      </p>
                      <div className="space-y-2">
                        {daySessions.map((session) => (
                          <MiniSession session={session} onToggle={onToggle} key={session.id} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function DayHeader({ date, active, short }: { date: Date; active?: boolean; short?: boolean }) {
  return (
    <div className="mb-4 text-center">
      <p className={`text-sm font-extrabold ${active ? 'text-[#6246f5]' : 'text-[#958cc7]'}`}>
        {date.toLocaleDateString('en', { weekday: short ? 'short' : 'long' })}
      </p>
      <p className="text-2xl font-extrabold">{date.getDate()}</p>
      <p className="text-sm font-medium text-[#958cc7]">{date.toLocaleDateString('en', { month: 'short' })}</p>
    </div>
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
  const style = subjectStyles[session.subject.color];

  return (
    <div className="rounded-xl p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)]" style={{ background: style.bg }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: style.dot }} />
            <p className="truncate text-sm font-extrabold" style={{ color: style.dot }}>
              {session.subject.name === 'Computer Science' ? 'CS' : session.subject.name}
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

function MiniSession({ session, onToggle }: { session: StudySession; onToggle: (id: string) => void }) {
  const style = subjectStyles[session.subject.color];

  return (
    <button
      className="w-full rounded-lg px-2 py-2 text-left"
      onClick={() => onToggle(session.id)}
      style={{ background: style.bg }}
      type="button"
    >
      <div className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: style.dot }} />
        <span className="truncate text-xs font-extrabold" style={{ color: style.dot }}>
          {session.subject.name}
        </span>
      </div>
      <p className="mt-1 truncate text-xs font-bold text-[#29264f]">{session.topic}</p>
      <p className="text-xs font-semibold text-[#9189c7]">{session.time}</p>
    </button>
  );
}

function SubjectPriority({ subjects }: { subjects: Subject[] }) {
  return (
    <section className="rounded-2xl border border-[#ddd8ff] bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <BarChart3 className="text-[#6246f5]" size={23} />
        <h3 className="text-lg font-extrabold">Subject Priority</h3>
      </div>
      <div className="space-y-5">
        {subjects.map((subject) => (
          <div key={subject.id}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="truncate text-lg font-extrabold">{subject.name}</span>
                <PriorityPill priority={subject.priority} />
              </div>
              <span className="text-sm font-medium text-[#9189c7]">{daysLeft(subject.examDate)}d left</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-[#e6e1fb]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(24, 100 - daysLeft(subject.examDate) * 4 + priorityWeight(subject.priority) * 9)}%`,
                  background: subjectStyles[subject.color].bar,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function StudyTips() {
  return (
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
  );
}

function PlanEditor({
  subjects,
  updateSubject,
  removeSubject,
  addSubject,
  close,
}: {
  subjects: Subject[];
  updateSubject: (id: number, field: keyof Subject, value: string) => void;
  removeSubject: (id: number) => void;
  addSubject: () => void;
  close: () => void;
}) {
  return (
    <div className="fixed inset-0 z-30 flex items-start justify-center overflow-y-auto bg-[#211d46]/45 px-4 py-6 backdrop-blur-sm">
      <section className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#ddd8ff] px-5 py-4">
          <div>
            <h3 className="text-xl font-extrabold">Edit Study Plan</h3>
            <p className="mt-1 text-sm font-medium text-[#9189c7]">Changes update the timetable and calendar instantly.</p>
          </div>
          <button className="grid h-10 w-10 place-items-center rounded-xl bg-[#f0ebff] text-[#6246f5]" onClick={close} title="Close editor" type="button">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          {subjects.map((subject) => (
            <div className="grid gap-3 rounded-2xl border border-[#ddd8ff] bg-[#fbfaff] p-4 sm:grid-cols-[1fr_130px_160px_94px_44px]" key={subject.id}>
              <label className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#9189c7]">
                Subject
                <input
                  className="mt-2 h-11 w-full rounded-xl border border-[#ddd8ff] bg-white px-3 text-base font-bold outline-none focus:border-[#6246f5]"
                  onChange={(event) => updateSubject(subject.id, 'name', event.target.value)}
                  value={subject.name}
                />
              </label>
              <label className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#9189c7]">
                Priority
                <select
                  className="mt-2 h-11 w-full rounded-xl border border-[#ddd8ff] bg-white px-3 text-base font-bold outline-none focus:border-[#6246f5]"
                  onChange={(event) => updateSubject(subject.id, 'priority', event.target.value)}
                  value={subject.priority}
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </label>
              <label className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#9189c7]">
                Exam Date
                <input
                  className="mt-2 h-11 w-full rounded-xl border border-[#ddd8ff] bg-white px-3 text-base font-bold outline-none focus:border-[#6246f5]"
                  onChange={(event) => updateSubject(subject.id, 'examDate', event.target.value)}
                  type="date"
                  value={subject.examDate}
                />
              </label>
              <label className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#9189c7]">
                Color
                <select
                  className="mt-2 h-11 w-full rounded-xl border border-[#ddd8ff] bg-white px-3 text-base font-bold outline-none focus:border-[#6246f5]"
                  onChange={(event) => updateSubject(subject.id, 'color', event.target.value)}
                  value={subject.color}
                >
                  {Object.keys(subjectStyles).map((color) => (
                    <option key={color}>{color}</option>
                  ))}
                </select>
              </label>
              <button className="grid h-11 w-11 place-items-center self-end rounded-xl bg-[#ffe1e3] text-[#ff4d57]" onClick={() => removeSubject(subject.id)} title="Remove subject" type="button">
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#ddd8ff] px-4 text-sm font-extrabold text-[#6246f5]" onClick={addSubject} type="button">
              <Plus size={18} />
              Add Subject
            </button>
            <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#6246f5] px-5 text-sm font-extrabold text-white" onClick={close} type="button">
              <CheckCircle2 size={18} />
              Generate Plan
            </button>
          </div>
        </div>
      </section>
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
