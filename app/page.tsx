'use client';

import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Plus,
  RefreshCw,
  Sparkles,
  Target,
  Trash2,
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
  day: string;
  date: string;
  subject: string;
  minutes: number;
  focus: string;
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
  'review notes and examples',
  'solve practice questions',
  'summarize key points',
  'teach the topic aloud',
  'complete a timed quiz',
  'revise weak areas',
];

function daysUntil(dateValue: string) {
  const target = new Date(`${dateValue}T23:59:59`);
  const diff = target.getTime() - today.getTime();
  return Math.max(1, Math.ceil(diff / 86_400_000));
}

function formatShortDate(date: Date) {
  return date.toLocaleDateString('en', {
    month: 'short',
    day: 'numeric',
  });
}

function buildSessions(subjects: Subject[], dailyHours: number) {
  const dayCount = 7;
  const activeSubjects = subjects.filter((subject) => subject.name.trim());
  const weightTotal = activeSubjects.reduce((sum, subject) => {
    const urgency = Math.max(1, 18 - Math.min(18, daysUntil(subject.examDate)));
    return sum + difficultyWeight[subject.difficulty] + urgency / 6;
  }, 0);

  return Array.from({ length: dayCount }, (_, dayIndex) => {
    const date = new Date(today);
    date.setDate(today.getDate() + dayIndex);

    const sessions: Session[] = activeSubjects.map((subject, subjectIndex) => {
      const urgency = Math.max(1, 18 - Math.min(18, daysUntil(subject.examDate)));
      const weight = difficultyWeight[subject.difficulty] + urgency / 6;
      const minutes = Math.max(20, Math.round(((dailyHours * 60 * weight) / weightTotal) / 5) * 5);

      return {
        id: `${dayIndex}-${subject.id}`,
        day: dayIndex === 0 ? 'Today' : `Day ${dayIndex + 1}`,
        date: formatShortDate(date),
        subject: subject.name,
        minutes,
        focus: focusIdeas[(dayIndex + subjectIndex) % focusIdeas.length],
      };
    });

    return {
      date,
      label: dayIndex === 0 ? 'Today' : date.toLocaleDateString('en', { weekday: 'short' }),
      shortDate: formatShortDate(date),
      sessions,
    };
  });
}

export default function Home() {
  const [subjects, setSubjects] = useState(defaultSubjects);
  const [dailyHours, setDailyHours] = useState(2);
  const [completed, setCompleted] = useState<string[]>([]);

  const plan = useMemo(() => buildSessions(subjects, dailyHours), [subjects, dailyHours]);
  const totalMinutes = plan.reduce(
    (sum, day) => sum + day.sessions.reduce((daySum, session) => daySum + session.minutes, 0),
    0,
  );
  const totalSessions = plan.reduce((sum, day) => sum + day.sessions.length, 0);
  const progress = totalSessions ? Math.round((completed.length / totalSessions) * 100) : 0;
  const nearestExam = subjects.reduce(
    (nearest, subject) => Math.min(nearest, daysUntil(subject.examDate)),
    99,
  );

  const addSubject = () => {
    setSubjects((current) => [
      ...current,
      {
        id: Date.now(),
        name: 'New Subject',
        difficulty: 'Medium',
        examDate: dateInput(21),
      },
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
    <main className="min-h-screen bg-[#f7f8f2] text-[#17211f]">
      <section className="border-b border-[#d8ddd3] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.09em] text-[#4f776f]">
                NotebookLM guided coding project
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-normal text-[#17211f] sm:text-4xl">
                AI Study Planner
              </h1>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm sm:min-w-[430px]">
              <Stat icon={<Target size={17} />} label="Subjects" value={subjects.length.toString()} />
              <Stat icon={<Clock3 size={17} />} label="Weekly Hours" value={`${Math.round(totalMinutes / 60)}h`} />
              <Stat icon={<CalendarDays size={17} />} label="Next Exam" value={`${nearestExam}d`} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[380px_minmax(0,1fr)] lg:px-8">
        <aside className="space-y-4">
          <Panel>
            <div className="flex items-center justify-between gap-3">
              <Heading icon={<BookOpen size={20} />} title="Plan Inputs" />
              <button
                className="grid h-9 w-9 place-items-center rounded-md bg-[#f06d4f] text-white transition hover:bg-[#d95c41]"
                onClick={addSubject}
                title="Add subject"
                type="button"
              >
                <Plus size={18} />
              </button>
            </div>

            <label className="mt-5 block text-sm font-medium text-[#384642]">
              Daily study time
              <input
                className="mt-2 w-full accent-[#1f8a70]"
                max="6"
                min="1"
                onChange={(event) => setDailyHours(Number(event.target.value))}
                type="range"
                value={dailyHours}
              />
            </label>
            <div className="mt-2 flex items-center justify-between text-sm text-[#63716c]">
              <span>1 hour</span>
              <strong className="rounded-md bg-[#e8f2ed] px-3 py-1 text-[#1f6d5c]">
                {dailyHours} hours per day
              </strong>
              <span>6 hours</span>
            </div>

            <div className="mt-5 space-y-3">
              {subjects.map((subject) => (
                <div
                  className="rounded-lg border border-[#d8ddd3] bg-[#fbfcf7] p-3"
                  key={subject.id}
                >
                  <div className="flex gap-2">
                    <input
                      className="min-w-0 flex-1 rounded-md border border-[#cbd3cc] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#1f8a70] focus:ring-2 focus:ring-[#1f8a70]/20"
                      onChange={(event) => updateSubject(subject.id, 'name', event.target.value)}
                      value={subject.name}
                    />
                    <button
                      className="grid h-9 w-9 place-items-center rounded-md border border-[#e1c7bd] text-[#b64d36] transition hover:bg-[#fff0eb]"
                      onClick={() => removeSubject(subject.id)}
                      title="Remove subject"
                      type="button"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <select
                      className="rounded-md border border-[#cbd3cc] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f8a70] focus:ring-2 focus:ring-[#1f8a70]/20"
                      onChange={(event) =>
                        updateSubject(subject.id, 'difficulty', event.target.value as Difficulty)
                      }
                      value={subject.difficulty}
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                    <input
                      className="rounded-md border border-[#cbd3cc] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f8a70] focus:ring-2 focus:ring-[#1f8a70]/20"
                      onChange={(event) => updateSubject(subject.id, 'examDate', event.target.value)}
                      type="date"
                      value={subject.examDate}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <Heading icon={<Sparkles size={20} />} title="Study Tips" />
            <ul className="mt-4 space-y-3 text-sm text-[#4b5955]">
              <li>Start each session with one clear goal.</li>
              <li>Give harder subjects the freshest part of your day.</li>
              <li>Use short quizzes after reading to check understanding.</li>
              <li>Review completed topics again before the exam date.</li>
            </ul>
          </Panel>
        </aside>

        <section className="space-y-5">
          <Panel>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Heading icon={<CalendarDays size={20} />} title="Generated 7-Day Plan" />
                <p className="mt-1 text-sm text-[#63716c]">
                  Sessions are shared by subject difficulty and exam urgency.
                </p>
              </div>
              <button
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#bed4cd] bg-[#e8f2ed] px-4 text-sm font-semibold text-[#1f6d5c] transition hover:bg-[#d9ebe4]"
                onClick={() => setCompleted([])}
                type="button"
              >
                <RefreshCw size={16} />
                Reset Progress
              </button>
            </div>

            <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#e7e2d6]">
              <div
                className="h-full rounded-full bg-[#1f8a70] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-sm font-medium text-[#384642]">{progress}% complete</p>

            <div className="mt-5 grid grid-cols-1 gap-3 xl:grid-cols-2">
              {plan.map((day) => (
                <div className="rounded-lg border border-[#d8ddd3] bg-white p-4" key={day.shortDate}>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-[#17211f]">{day.label}</h2>
                    <span className="text-sm text-[#63716c]">{day.shortDate}</span>
                  </div>
                  <div className="space-y-2">
                    {day.sessions.map((session) => {
                      const isDone = completed.includes(session.id);

                      return (
                        <button
                          className={`flex w-full items-start gap-3 rounded-md border px-3 py-3 text-left transition ${
                            isDone
                              ? 'border-[#acd4c9] bg-[#eef8f4]'
                              : 'border-[#e0e4dd] bg-[#fbfcf7] hover:border-[#1f8a70]'
                          }`}
                          key={session.id}
                          onClick={() => toggleComplete(session.id)}
                          type="button"
                        >
                          <span
                            className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md ${
                              isDone ? 'bg-[#1f8a70] text-white' : 'bg-[#e7e2d6] text-[#6a5a43]'
                            }`}
                          >
                            <CheckCircle2 size={16} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-[#17211f]">
                              {session.subject}
                            </span>
                            <span className="block text-xs text-[#63716c]">
                              {session.minutes} min - {session.focus}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <Heading icon={<Target size={20} />} title="Priority Overview" />
            <div className="mt-5 space-y-4">
              {subjects.map((subject) => {
                const score = difficultyWeight[subject.difficulty] * 18 + Math.max(8, 28 - daysUntil(subject.examDate));

                return (
                  <div key={subject.id}>
                    <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium text-[#384642]">{subject.name}</span>
                      <span className="text-[#63716c]">{subject.difficulty}</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-[#e7e2d6]">
                      <div
                        className="h-full rounded-full bg-[#f06d4f]"
                        style={{ width: `${Math.min(100, score)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </section>
      </section>
    </main>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[#d8ddd3] bg-white p-4 shadow-sm sm:p-5">
      {children}
    </div>
  );
}

function Heading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-md bg-[#e8f2ed] text-[#1f6d5c]">
        {icon}
      </span>
      <h2 className="text-lg font-semibold tracking-normal text-[#17211f]">{title}</h2>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#d8ddd3] bg-[#fbfcf7] p-3">
      <div className="flex items-center gap-2 text-[#1f6d5c]">
        {icon}
        <span className="text-xs font-medium text-[#63716c]">{label}</span>
      </div>
      <strong className="mt-2 block text-xl font-semibold text-[#17211f]">{value}</strong>
    </div>
  );
}
