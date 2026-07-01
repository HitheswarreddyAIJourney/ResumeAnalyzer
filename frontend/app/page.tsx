'use client';

import { ChangeEvent, FormEvent, useState } from 'react';

interface ChatResponse {
  answer: string;
  suggestions?: string[];
  score?: number;
}

export default function HomePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ChatResponse | null>(null);
  const [error, setError] = useState('');

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedFile) {
      setError('Please upload a resume before analyzing.');
      return;
    }

    setIsLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('question', question || 'Please review this resume.');
    formData.append('resume_file', selectedFile);

    try {
      const response = await fetch('http://127.0.0.1:8000/chat', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Unable to analyze resume.');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to analyze resume.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#1f2937,_#050816_70%)] px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl shadow-black/30 backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Resume Analyzer</p>
              <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">AI-powered resume feedback and scoring</h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-400 sm:text-base">
                Upload a resume, review ATS-specific suggestions, and monitor your overall score from one focused workspace.
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200">
              <span className="font-semibold">Status:</span> Ready for resume review
            </div>
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl shadow-black/30 backdrop-blur">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-cyan-400">Chat Assistant</p>
                <h2 className="text-xl font-semibold">Resume review workspace</h2>
              </div>
              <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                Live feedback
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">Upload Resume</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  className="block w-full cursor-pointer rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-xl file:border-0 file:bg-cyan-600 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:border-cyan-500"
                />
                <p className="mt-2 text-xs text-slate-500">Required • PDF, DOC, DOCX, or TXT</p>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">Additional instructions</span>
                <textarea
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="Tell the assistant what to focus on..."
                  rows={4}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none ring-0 transition focus:border-cyan-500"
                />
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? 'Analyzing resume...' : 'Analyze Resume'}
              </button>
            </form>

            {error ? <p className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p> : null}
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl shadow-black/30 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-cyan-400">Dashboard</p>
                  <h2 className="text-xl font-semibold">Resume score</h2>
                </div>
                <div className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-400">
                  ATS readout
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                <div className="text-sm text-slate-400">Overall score</div>
                <div className="mt-2 text-5xl font-semibold text-white">
                  {result?.score ?? '—'}
                  {result?.score ? '%' : ''}
                </div>
                <div className="mt-4 h-3 rounded-full bg-slate-800">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400"
                    style={{ width: `${Math.min(result?.score ?? 0, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl shadow-black/30 backdrop-blur">
              <div className="mb-4">
                <p className="text-sm font-medium text-cyan-400">Feedback</p>
                <h2 className="text-xl font-semibold">Improvement suggestions</h2>
              </div>

              {result?.suggestions?.length ? (
                <ul className="space-y-3">
                  {result.suggestions.map((suggestion, index) => (
                    <li key={index} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3 text-sm text-slate-300">
                      {suggestion}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-4 text-sm text-slate-500">
                  Suggestions will appear here after the resume is analyzed.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl shadow-black/30 backdrop-blur">
          <p className="text-sm font-medium text-cyan-400">Assistant response</p>
          <div className="mt-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm leading-7 text-slate-300">
            {result?.answer ?? 'Upload a resume to receive an AI-generated review and tailored improvement advice.'}
          </div>
        </section>
      </div>
    </main>
  );
}
