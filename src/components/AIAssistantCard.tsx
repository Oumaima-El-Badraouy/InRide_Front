import { useMemo, useState } from 'react';
import { Sparkles, Loader2, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { AIOfferLite, AIRequestLite, AIStat, AIUserContext } from '../lib/aiAssistant';
import { askAI, buildAIInsights } from '../lib/aiAssistant';

const severityMeta = {
  info: { Icon: Info, className: 'bg-sky-50 text-sky-700 border-sky-100' },
  success: { Icon: CheckCircle2, className: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  warning: { Icon: AlertTriangle, className: 'bg-amber-50 text-amber-800 border-amber-100' },
} as const;

export default function AIAssistantCard(props: {
  user: AIUserContext;
  stats: AIStat[];
  requests?: AIRequestLite[];
  offers?: AIOfferLite[];
}) {
  const insights = useMemo(
    () => buildAIInsights({ user: props.user, stats: props.stats, requests: props.requests, offers: props.offers }),
    [props.user, props.stats, props.requests, props.offers]
  );

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [mode, setMode] = useState<'offline' | 'api' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onAsk = async () => {
    setIsLoading(true);
    try {
      const res = await askAI({
        user: props.user,
        stats: props.stats,
        question,
        requests: props.requests,
        offers: props.offers,
      });
      setAnswer(res.answer);
      setMode(res.mode);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-amber-50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">AI Assistant</h3>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              Suggestions tailored to your activity. Optional API integration via <span className="font-mono">VITE_AI_ENDPOINT</span>.
            </p>
          </div>
          {mode && (
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                mode === 'api' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-600 border-slate-100'
              }`}
            >
              {mode === 'api' ? 'API' : 'Offline'}
            </span>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="grid gap-3">
          {insights.map((insight) => {
            const meta = severityMeta[insight.severity];
            return (
              <div key={insight.title} className={`rounded-xl border p-4 ${meta.className}`}>
                <div className="flex items-center gap-2 font-semibold">
                  <meta.Icon className="w-4 h-4" />
                  <span>{insight.title}</span>
                </div>
                <ul className="mt-2 text-sm space-y-1 list-disc pl-5">
                  {insight.bullets.map((b, idx) => (
                    <li key={idx}>{b}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4">
          <label className="block text-sm font-medium text-slate-700">Ask the AI</label>
          <div className="mt-2 flex flex-col gap-3">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={
                props.user.role === 'CLIENT'
                  ? 'Example: Rewrite my request to get better offers and faster replies.'
                  : 'Example: Suggest a better negotiation reply to increase acceptance.'
              }
              className="min-h-[96px] w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={onAsk}
                disabled={isLoading || question.trim().length === 0}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Generate
              </button>
              <div className="text-xs text-slate-500">
                Tip: include details (locations, dates, car type, budget) for best output.
              </div>
            </div>
          </div>

          {answer && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs text-slate-500 mb-2">AI response</div>
              <pre className="whitespace-pre-wrap text-sm text-slate-800 leading-relaxed">{answer}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

