'use client';

import {
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Edit3,
  ListChecks,
  Plus,
  Sparkles,
  Target,
  Trash2,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type Difficulty = 'Low' | 'Medium' | 'High';

type Subject = {
  id: number;
  name: string;
  difficulty: Difficulty;
  examDate: string;
};

type Session = {
  id: string;
  subject: string;
  minutes: number;
  start: string;
  end: string;
  focus: string;
  difficulty: Difficulty;
};

const today = new Date();

const dateInput = (offset: number) => {
  const date = new Date(today);
  date.setDate(today.getDate() + offset);
  return date.toISOString().slice(0, 10);
};

const defaultSubjects: Subject[] = [
  { id: 1, name: 'Mathematics', difficulty: 'High', examDate: dateInput(11) },
  { id: 2, name: 'English Language', difficulty: 'Medium', examDate: dateInput(14) },
  { id: 3, name: 'Basic Science', difficulty: 'Medium', examDate: dateInput(17) },
];

const difficultyWeight: Record<Difficulty, number> = {
  Low: 1,
  Medium: 2,
  High: 3,
};

const focusIdeas = [
  'Practice questions',
  'Notes review',
  'Topic summary',
  'Timed quiz',
  'Weak-area revision',
  'Teach-back practice',
];

function daysUntil(dateValue: string) {
  const target = new Date(`${dateValue}T23:59:59`);
  const diff = target.getTime() - today.getTime();
  return Math.max(1, Math.ceil(diff / 86_400_000));
}

function addMinutes(hour: number, minute: number, extra: number) {
  const total = hour * 60 + minute + extra;
  const nextHour = Math.floor(total / 60);
  const nextMinute = total % 60;
  const suffix = nextHour >= 12 ? 'PM' : 'AM';
  const displayHour = nextHour > 12 ? nextHour - 12 : nextHour;
  return `${displayHour}:${String(nextMinute).padStart(2, '0')} ${suffix}`;
}

function shortDate(date: Date) {
  return date.toLocaleDateString('en', { month: 'short', day: 'numeric' });
}

function buildPlan(subjects: Subject[], dailyHours: number) {
  const activeSubjects = subjects.filter((subject) => subject.name.trim());
  const totalWeight = activeSubjects.reduce((sum, subject) => {
    const urgency = Math.max(1, 20 - Math.min(20, daysUntil(subject.examDate)));
    return sum + difficultyWeight[subject.difficulty] + urgency / 8;
  }, 0);

  return Array.from({ length: 7 }, (_, dayIndex) => {
    const date = new Date(today);
    date.setDate(today.getDate() + dayIndex);

    let cursor = 16 * 60;
    const sessions: Session[] = activeSubjects.map((subject, subjectIndex) => {
      const urgency = Math.max(1, 20 - Math.min(20, daysUntil(subject.examDate)));
      const weight = difficultyWeight[subject.difficulty] + urgency / 8;
      const minutes = Math.max(25, Math.round(((dailyHours * 60 * weight) / totalWeight) / 5) * 5);
      const startHour = Math.floor(cursor / 60);
      const startMinute = cursor % 60;
      cursor += minutes + 10;

      return {
        id: `${dayIndex}-${subject.id}`,
        subject: subject.name,
        minutes,
        start: addMinutes(startHour, startMinute, 0),
        end: addMinutes(startHour, startMinute, minutes),
        focus: focusIdeas[(dayIndex + subjectIndex) % focusIdeas.length],
        difficulty: subject.difficulty,
      };
    });

    return {
      id: dayIndex,
      name: dayIndex === 0 ? 'Today' : date.toLocaleDateString('en', { weekday: 'long' }),
      date: shortDate(date),
      sessions,
    };
  });
}

export default function Home() {
  const [subjects, setSubjects] = useState(defaultSubjects);
  const [dailyHours, setDailyHours] = useState(2);
  const [completed, setCompleted] = useState<string[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const plan = useMemo(() => buildPlan(subjects, dailyHours), [subjects, dailyHours]);
  const totalSessions = plan.reduce((sum, day) => sum + day.sessions.length, 0);
  const totalMinutes = plan.reduce(
    (sum, day) => sum + day.sessions.reduce((dayTotal, session) => dayTotal + session.minutes, 0),
    0,
  );
  const progress = totalSessions ? Math.round((completed.length / totalSessions) * 100) : 0;
  const nearestExam = subjects.reduce(
    (nearest, subject) => Math.min(nearest, daysUntil(subject.examDate)),
    99,
  );

  const addSubject = () => {
    setSubjects((current) => [
      ...current,
      { id: Date.now(), name: 'New Subject', difficulty: 'Medium', examDate: dateInput(21) },
    ]);
  };

  const updateSubject = (id: number, field: keyof Subject, value: string) => {
    setSubjects((current) =>
      current.map((subject) => (subject.id === id ? { ...subject, [field]: value } : subject)),
    );
  };

  const removeSubject = (id: number) => {
    setSubjects((current) => current.filter((subject) => subject.id !== id));
    setCompleted((current) => current.filter((item) => !item.endsWith(`-${id}`)));
  };

  const toggleComplete = (id: string) => {
    setCompleted((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  return (
    <main className="min-h-screen bg-[#eef3ef] text-[#12201c]">
      <header className="border-b border-[#cbd8d0] bg-[#fbfcf8]">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#2f7567]">
                NotebookLM assisted coding project
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-normal sm:text-4xl">
                AI Study Planner
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-[#52645f]">
                A simple web app that turns exam dates, subject difficulty, and available time into a structured weekly study timetable.
              </p>
            </div>
            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#d95f43] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#bf5037]"
              onClick={() => setSettingsOpen(true)}
              type="button"
            >
              <Edit3 size={17} />
              Edit Plan
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Metric icon={<BookOpen size={17} />} label="Subjects" value={subjects.length.toString()} />
            <Metric icon={<Clock3 size={17} />} label="Weekly Study" value={`${Math.round(totalMinutes / 60)}h`} />
            <Metric icon={<CalendarDays size={17} />} label="Nearest Exam" value={`${nearestExam} days`} />
            <Metric icon={<CheckCircle2 size={17} />} label="Completed" value={`${progress}%`} />
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_310px] lg:px-8">
        <section className="rounded-lg border border-[#cbd8d0] bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 border-b border-[#e2e8e4] pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <IconBox>
                <ListChecks size={20} />
              </IconBox>
              <div>
                <h2 className="text-xl font-bold">Generated Study Timetable</h2>
                <p className="text-sm text-[#52645f]">Check each session when it is completed.</p>
              </div>
            </div>
            <div className="min-w-[170px]">
              <div className="h-2 overflow-hidden rounded-full bg-[#e6decd]">
                <div className="h-full rounded-full bg-[#2f8c7d]" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-1 text-right text-xs font-bold text-[#2f7567]">{progress}% complete</p>
            </div>
          </div>

          <div className="mt-4 divide-y divide-[#e2e8e4]">
            {plan.map((day) => (
              <article className="py-4 first:pt-0 last:pb-0" key={day.id}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold">{day.name}</h3>
                    <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#6b7a74]">{day.date}</p>
                  </div>
                  <span className="rounded-md bg-[#eef3ef] px-3 py-1 text-xs font-bold text-[#2f7567]">
                    {day.sessions.length} sessions
                  </span>
                </div>

                <div className="grid gap-2">
                  {day.sessions.map((session) => {
                    const isDone = completed.includes(session.id);

                    return (
                      <button
                        className={`grid w-full grid-cols-[32px_minmax(0,1fr)] gap-3 rounded-md border p-3 text-left transition sm:grid-cols-[32px_132px_minmax(0,1fr)_80px] ${
                          isDone
                            ? 'border-[#9bcec3] bg-[#effaf6]'
                            : 'border-[#d9e1dc] bg-[#fbfcf8] hover:border-[#2f8c7d]'
                        }`}
                        key={session.id}
                        onClick={() => toggleComplete(session.id)}
                        type="button"
                      >
                        <span
                          className={`grid h-8 w-8 place-items-center rounded-md ${
                            isDone ? 'bg-[#2f8c7d] text-white' : 'bg-[#e6decd] text-[#6c604e]'
                          }`}
                        >
                          <Check size={16} />
                        </span>
                        <span className="text-sm font-bold text-[#12201c] sm:pt-1">
                          {session.start} - {session.end}
                        </span>
                        <span className="min-w-0 sm:pt-1">
                          <span className="block truncate text-sm font-bold text-[#12201c]">{session.subject}</span>
                          <span className="block text-xs text-[#52645f]">{session.focus}</span>
                        </span>
                        <span className="col-start-2 rounded-md bg-white px-2 py-1 text-xs font-bold text-[#d95f43] sm:col-start-auto sm:justify-self-end">
                          {session.minutes} min
                        </span>
                      </button>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="space-y-5">
          <section className="rounded-lg border border-[#cbd8d0] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <IconBox>
                <Target size={20} />
              </IconBox>
              <h2 className="text-lg font-bold">Subject Priority</h2>
            </div>
            <div className="mt-5 space-y-4">
              {subjects.map((subject) => {
                const score =
                  difficultyWeight[subject.difficulty] * 18 + Math.max(8, 28 - daysUntil(subject.examDate));

                return (
                  <div key={subject.id}>
                    <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                      <span className="min-w-0 truncate font-bold">{subject.name}</span>
                      <span className="text-[#52645f]">{subject.difficulty}</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-[#e6decd]">
                      <div className="h-full rounded-full bg-[#d95f43]" style={{ width: `${Math.min(100, score)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-lg border border-[#cbd8d0] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <IconBox>
                <Sparkles size={20} />
              </IconBox>
              <h2 className="text-lg font-bold">Smart Study Tips</h2>
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[#52645f]">
              <li>Study difficult subjects first when your energy is highest.</li>
              <li>Use practice questions after reading each topic.</li>
              <li>Take a 10-minute break between sessions.</li>
              <li>Review weak topics again before the exam date.</li>
            </ul>
          </section>
        </aside>
      </section>

      {settingsOpen && (
        <div className="fixed inset-0 z-20 bg-[#12201c]/45 px-4 py-5 backdrop-blur-sm">
          <div className="mx-auto max-h-[calc(100vh-40px)] max-w-3xl overflow-y-auto rounded-lg bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e2e8e4] bg-white px-4 py-4 sm:px-5">
              <div>
                <h2 className="text-xl font-bold">Plan Inputs</h2>
                <p className="text-sm text-[#52645f]">Change subjects, difficulty, exam dates, and study time.</p>
              </div>
              <button
                className="grid h-10 w-10 place-items-center rounded-md border border-[#d9e1dc] text-[#52645f] transition hover:bg-[#eef3ef]"
                onClick={() => setSettingsOpen(false)}
                title="Close"
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 sm:p-5">
              <label className="block text-sm font-bold">
                Daily study time
                <input
                  className="mt-3 w-full accent-[#2f8c7d]"
                  max="6"
                  min="1"
                  onChange={(event) => setDailyHours(Number(event.target.value))}
                  type="range"
                  value={dailyHours}
                />
              </label>
              <div className="mt-2 flex items-center justify-between text-sm text-[#52645f]">
                <span>1 hour</span>
                <strong className="rounded-md bg-[#e7f4ef] px-3 py-1 text-[#2f7567]">{dailyHours} hours per day</strong>
                <span>6 hours</span>
              </div>

              <div className="mt-6 space-y-3">
                {subjects.map((subject) => (
                  <div className="rounded-lg border border-[#d9e1dc] bg-[#fbfcf8] p-3" key={subject.id}>
                    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_140px_160px_40px]">
                      <label className="text-xs font-bold uppercase tracking-[0.08em] text-[#6b7a74]">
                        Subject
                        <input
                          className="mt-1 h-10 w-full rounded-md border border-[#cbd8d0] bg-white px-3 text-sm font-medium outline-none focus:border-[#2f8c7d] focus:ring-2 focus:ring-[#2f8c7d]/20"
                          onChange={(event) => updateSubject(subject.id, 'name', event.target.value)}
                          value={subject.name}
                        />
                      </label>
                      <label className="text-xs font-bold uppercase tracking-[0.08em] text-[#6b7a74]">
                        Difficulty
                        <select
                          className="mt-1 h-10 w-full rounded-md border border-[#cbd8d0] bg-white px-3 text-sm font-medium outline-none focus:border-[#2f8c7d] focus:ring-2 focus:ring-[#2f8c7d]/20"
                          onChange={(event) => updateSubject(subject.id, 'difficulty', event.target.value as Difficulty)}
                          value={subject.difficulty}
                        >
                          <option>Low</option>
                          <option>Medium</option>
                          <option>High</option>
                        </select>
                      </label>
                      <label className="text-xs font-bold uppercase tracking-[0.08em] text-[#6b7a74]">
                        Exam Date
                        <input
                          className="mt-1 h-10 w-full rounded-md border border-[#cbd8d0] bg-white px-3 text-sm font-medium outline-none focus:border-[#2f8c7d] focus:ring-2 focus:ring-[#2f8c7d]/20"
                          onChange={(event) => updateSubject(subject.id, 'examDate', event.target.value)}
                          type="date"
                          value={subject.examDate}
                        />
                      </label>
                      <button
                        className="grid h-10 w-10 place-items-center self-end rounded-md border border-[#ecc9bf] text-[#bf5037] transition hover:bg-[#fff0eb]"
                        onClick={() => removeSubject(subject.id)}
                        title="Remove subject"
                        type="button"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-between">
                <button
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#cbd8d0] px-4 text-sm font-bold text-[#2f7567] transition hover:bg-[#eef3ef]"
                  onClick={addSubject}
                  type="button"
                >
                  <Plus size={17} />
                  Add Subject
                </button>
                <button
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#2f8c7d] px-5 text-sm font-bold text-white transition hover:bg-[#25796c]"
                  onClick={() => setSettingsOpen(false)}
                  type="button"
                >
                  <CheckCircle2 size={17} />
                  Generate Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#cbd8d0] bg-white p-3 shadow-sm">
      <div className="flex items-center gap-2 text-[#2f7567]">
        {icon}
        <span className="text-xs font-bold text-[#52645f]">{label}</span>
      </div>
      <strong className="mt-2 block text-xl font-bold">{value}</strong>
    </div>
  );
}

function IconBox({ children }: { children: React.ReactNode }) {
  return (
    <span className="grid h-10 w-10 place-items-center rounded-md bg-[#e7f4ef] text-[#2f7567]">
      {children}
    </span>
  );
}
