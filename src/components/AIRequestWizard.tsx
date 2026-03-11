import { useMemo, useState } from 'react';
import { Sparkles, X, Loader2, CheckCircle2 } from 'lucide-react';
import type { AIUserContext } from '../lib/aiAssistant';
import { askAI } from '../lib/aiAssistant';

type RequestDraft = {
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  dropoffDate: string;
  carType: string;
  budget: string;
  additionalNotes: string;
};

export default function AIRequestWizard(props: {
  open: boolean;
  onClose: () => void;
  user: AIUserContext;
  currentStats: { label: string; value: number }[];
  initialDraft: RequestDraft;
  onApply: (draft: RequestDraft) => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [draft, setDraft] = useState<RequestDraft>(props.initialDraft);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'offline' | 'api' | null>(null);
  const [generated, setGenerated] = useState<string | null>(null);

  const canGenerate = useMemo(() => {
    return (
      draft.pickupLocation.trim() &&
      draft.dropoffLocation.trim() &&
      draft.pickupDate.trim() &&
      draft.dropoffDate.trim() &&
      draft.carType.trim() &&
      String(draft.budget).trim()
    );
  }, [draft]);

  const onGenerate = async () => {
    setLoading(true);
    try {
      const question =
        `You are an AI assistant helping a CLIENT create a high-quality rental request.\n\n` +
        `Inputs:\n` +
        `Pickup: ${draft.pickupLocation}\n` +
        `Drop-off: ${draft.dropoffLocation}\n` +
        `Pickup date/time: ${draft.pickupDate}\n` +
        `Drop-off date/time: ${draft.dropoffDate}\n` +
        `Car type: ${draft.carType}\n` +
        `Budget: $${draft.budget}/day\n\n` +
        `Write "Additional Notes" ONLY, as 4-7 short lines. Include questions about insurance/mileage/deposit, confirm driver age requirement, and preferences (automatic/AC, luggage). Keep it friendly and direct.`;

      const res = await askAI({
        user: props.user,
        stats: props.currentStats,
        question,
      });
      setMode(res.mode);
      setGenerated(res.answer.trim());
      setDraft((d) => ({ ...d, additionalNotes: res.answer.trim() }));
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const onApply = () => {
    props.onApply(draft);
    props.onClose();
  };

  if (!props.open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={props.onClose} />
      <div className="absolute inset-x-0 top-10 mx-auto w-[min(720px,calc(100%-2rem))]">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
          <div className="p-5 bg-gradient-to-r from-slate-50 to-amber-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="text-base font-semibold text-slate-900">AI Request Wizard</div>
                <div className="text-xs text-slate-600">Create a strong request agencies can quote fast.</div>
              </div>
            </div>
            <button onClick={props.onClose} className="p-2 rounded-xl hover:bg-white/70">
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          <div className="p-5">
            <div className="flex items-center gap-2 text-xs mb-4">
              <div className={`px-2.5 py-1 rounded-full border ${step === 1 ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>1. Details</div>
              <div className={`px-2.5 py-1 rounded-full border ${step === 2 ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>2. Budget</div>
              <div className={`px-2.5 py-1 rounded-full border ${step === 3 ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>3. Notes</div>
              {mode && (
                <div className="ml-auto text-[11px] text-slate-500">
                  AI mode: <span className="font-medium">{mode === 'api' ? 'API' : 'Offline'}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pickup location</label>
                <input
                  value={draft.pickupLocation}
                  onChange={(e) => setDraft((d) => ({ ...d, pickupLocation: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Drop-off location</label>
                <input
                  value={draft.dropoffLocation}
                  onChange={(e) => setDraft((d) => ({ ...d, dropoffLocation: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pickup date/time</label>
                <input
                  type="datetime-local"
                  value={draft.pickupDate}
                  onChange={(e) => setDraft((d) => ({ ...d, pickupDate: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Drop-off date/time</label>
                <input
                  type="datetime-local"
                  value={draft.dropoffDate}
                  onChange={(e) => setDraft((d) => ({ ...d, dropoffDate: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Car type</label>
                <select
                  value={draft.carType}
                  onChange={(e) => setDraft((d) => ({ ...d, carType: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Truck">Truck</option>
                  <option value="Van">Van</option>
                  <option value="Sports Car">Sports Car</option>
                  <option value="Luxury">Luxury</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Budget/day (USD)</label>
                <input
                  type="number"
                  value={draft.budget}
                  onChange={(e) => setDraft((d) => ({ ...d, budget: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Additional notes</label>
                <textarea
                  value={draft.additionalNotes}
                  onChange={(e) => setDraft((d) => ({ ...d, additionalNotes: e.target.value }))}
                  className="w-full min-h-[120px] px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Let the AI generate this, then tweak if you want."
                />
              </div>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="text-xs text-slate-500">
                {generated ? (
                  <span className="inline-flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Notes generated. You can edit before applying.
                  </span>
                ) : (
                  <span>Tip: include exact locations and times to get better offers.</span>
                )}
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={props.onClose}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={onGenerate}
                  disabled={!canGenerate || loading}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium inline-flex items-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Generate notes
                </button>
                <button
                  onClick={onApply}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 text-white hover:bg-amber-600 text-sm font-medium"
                >
                  Apply to form
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

