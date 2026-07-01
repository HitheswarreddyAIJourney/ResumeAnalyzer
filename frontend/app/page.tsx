'use client';

import { ChangeEvent, FormEvent, useState } from 'react';

interface ChatResponse {
  answer: string;
  suggestions?: string[];
  score?: number;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export default function HomePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ChatResponse | null>(null);
  const [error, setError] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'I can help you rewrite sections of your resume based on the feedback. Ask me to improve your summary, bullets, or skills.',
    },
  ]);

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

  const handleChatSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!chatInput.trim()) {
      return;
    }

    const userMessage = chatInput.trim();
    const feedbackHints = result?.suggestions?.slice(0, 3).join(' ');
    const assistantReply = feedbackHints
      ? `I can help with that. Based on the feedback, focus on ${feedbackHints}. I can help rewrite your summary, experience bullets, or skills section.`
      : 'I can help refine your resume wording and structure. Share the section you want improved and I will suggest a stronger version.';

    setChatMessages((prev) => [
      ...prev,
      { role: 'user', text: userMessage },
      { role: 'assistant', text: assistantReply },
    ]);
    setChatInput('');
  };

  const scoreLabel = result?.score
    ? result.score >= 80
      ? 'Strong'
      : result.score >= 60
        ? 'Needs refinement'
        : 'Needs work'
    : 'Pending';

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#1f2937,_#050816_70%)] p-3 text-slate-100 sm:p-4 lg:p-5">
      <div className="grid h-[calc(100vh-1.5rem)] gap-3 overflow-hidden lg:h-[calc(100vh-2.5rem)] lg:grid-cols-2 lg:grid-rows-2">
        <section className="flex flex-col rounded-[28px] border border-slate-800 bg-slate-950/80 p-5 shadow-2xl shadow-black/30 backdrop-blur sm:p-6">
          <div className="mb-4">
            <p className="text-sm font-medium text-cyan-400">Top Left</p>
            <h2 className="text-xl font-semibold">Upload Resume</h2>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Choose a resume file</span>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              className="block w-full cursor-pointer rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-xl file:border-0 file:bg-cyan-600 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:border-cyan-500"
            />
          </label>

          <div className="mt-3 rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-3 text-sm text-slate-400">
            <div className="font-medium text-slate-200">{selectedFile ? selectedFile.name : 'No file chosen yet'}</div>
            <div className="mt-1 text-xs">Supported formats: PDF, DOCX, DOC, TXT</div>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 flex flex-1 flex-col gap-3">
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Add instructions for the review..."
              rows={4}
              className="w-full flex-1 rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? 'Analyzing...' : 'Analyze Resume'}
            </button>
          </form>

          {error ? <p className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p> : null}
        </section>

        <section className="flex flex-col rounded-[28px] border border-slate-800 bg-slate-950/80 p-5 shadow-2xl shadow-black/30 backdrop-blur sm:p-6">
          <div className="mb-4">
            <p className="text-sm font-medium text-cyan-400">Top Right</p>
            <h2 className="text-xl font-semibold">How to use this view</h2>
          </div>
          <div className="flex-1 space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm leading-7 text-slate-300">
            <p>1. Upload your resume file in the top-left panel.</p>
            <p>2. Add extra instructions for the analysis if needed.</p>
            <p>3. Review your score in the bottom-left panel.</p>
            <p>4. Read the feedback and use the assistant to refine your resume.</p>
          </div>
        </section>

        <section className="flex flex-col rounded-[28px] border border-slate-800 bg-slate-950/80 p-5 shadow-2xl shadow-black/30 backdrop-blur sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-cyan-400">Bottom Left</p>
              <h2 className="text-xl font-semibold">Score</h2>
            </div>
            <div className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-200">
              {scoreLabel}
            </div>
          </div>

          <div className="flex-1 rounded-3xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="text-sm text-slate-400">Overall ATS score</div>
            <div className="mt-2 text-4xl font-semibold text-white">{result?.score ?? '—'}%</div>
            <div className="mt-4 h-3 rounded-full bg-slate-800">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400"
                style={{ width: `${Math.min(result?.score ?? 0, 100)}%` }}
              />
            </div>
          </div>
        </section>

        <section className="flex flex-col rounded-[28px] border border-slate-800 bg-slate-950/80 p-5 shadow-2xl shadow-black/30 backdrop-blur sm:p-6">
          <div className="mb-4">
            <p className="text-sm font-medium text-cyan-400">Bottom Right</p>
            <h2 className="text-xl font-semibold">Feedback</h2>
          </div>

          {result?.suggestions?.length ? (
            <ul className="flex-1 space-y-2 overflow-auto">
              {result.suggestions.map((suggestion, index) => (
                <li key={index} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3 text-sm text-slate-300">
                  {suggestion}
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-4 text-center text-sm text-slate-500">
              Feedback appears here after you analyze a resume.
            </div>
          )}
        </section>
      </div>

      <button
        type="button"
        onClick={() => setIsChatOpen((prev) => !prev)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-600 text-2xl shadow-xl shadow-cyan-900/40 transition hover:bg-cyan-500"
        aria-label="Open resume editing assistant"
      >
        💬
      </button>

      {isChatOpen ? (
        <div className="fixed bottom-24 right-5 z-50 w-[min(92vw,360px)] rounded-[24px] border border-slate-700 bg-slate-950/95 p-4 shadow-2xl shadow-black/40 backdrop-blur">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-cyan-400">Assistant</p>
              <h3 className="text-base font-semibold">Edit help</h3>
            </div>
            <button
              type="button"
              onClick={() => setIsChatOpen(false)}
              className="rounded-full bg-slate-800 px-2.5 py-1 text-sm text-slate-300"
            >
              ×
            </button>
          </div>

          <div className="mb-3 max-h-56 space-y-2 overflow-auto rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
            {chatMessages.map((message, index) => (
              <div
                key={index}
                className={`rounded-2xl px-3 py-2 text-sm ${message.role === 'user' ? 'ml-auto bg-cyan-600 text-white' : 'bg-slate-800 text-slate-200'}`}
              >
                {message.text}
              </div>
            ))}
          </div>

          <form onSubmit={handleChatSubmit} className="flex gap-2">
            <input
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              placeholder="Ask for edits..."
              className="flex-1 rounded-2xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
            />
            <button type="submit" className="rounded-2xl bg-cyan-600 px-3 py-2 text-sm font-semibold text-white">
              Send
            </button>
          </form>
        </div>
      ) : null}
    </main>
  );
}
