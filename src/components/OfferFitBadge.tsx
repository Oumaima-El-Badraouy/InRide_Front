import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { AIOfferLite, AIRequestLite } from '../lib/aiAssistant';
import { scoreOfferFit } from '../lib/aiAssistant';

export default function OfferFitBadge(props: { request: AIRequestLite; offer: AIOfferLite }) {
  const fit = useMemo(() => scoreOfferFit({ request: props.request, offer: props.offer }), [props.request, props.offer]);
  const [open, setOpen] = useState(false);

  const color =
    fit.label === 'Great'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
      : fit.label === 'Good'
        ? 'bg-sky-50 text-sky-700 border-sky-100'
        : fit.label === 'Okay'
          ? 'bg-amber-50 text-amber-800 border-amber-100'
          : 'bg-slate-50 text-slate-600 border-slate-100';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${color}`}
        title="AI fit score"
      >
        <span>AI Fit: {fit.score}</span>
        <span className="opacity-80">({fit.label})</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-100 bg-white shadow-xl p-3 z-20">
          <div className="text-xs font-semibold text-slate-900">Why this score</div>
          <ul className="mt-2 text-xs text-slate-600 space-y-1 list-disc pl-4">
            {fit.reasons.map((r, idx) => (
              <li key={idx}>{r}</li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-3 w-full text-xs font-semibold px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

