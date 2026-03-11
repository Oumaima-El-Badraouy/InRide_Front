export type AIRole = 'CLIENT' | 'AGENCY';

export type AIUserContext = {
  id: string;
  role: AIRole;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  nationality?: string;
  companyName?: string;
  createdAt?: string;
};

export type AIStat = { label: string; value: number };

export type AIRequestLite = {
  id: string;
  status: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  budget?: number;
  pickupDate?: string;
  dropoffDate?: string;
};

export type AIOfferLite = {
  id: string;
  status: string;
  carModel?: string;
  dailyRate?: number;
  finalRate?: number;
  createdAt?: string;
};

export type AIInsight = {
  title: string;
  severity: 'info' | 'success' | 'warning';
  bullets: string[];
};

export type OfferFit = {
  score: number; // 0..100
  label: 'Great' | 'Good' | 'Okay' | 'Poor';
  reasons: string[];
};

function clampText(s: string, max = 800) {
  const trimmed = s.trim();
  if (trimmed.length <= max) return trimmed;
  return trimmed.slice(0, max).trimEnd() + '…';
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function daysBetween(startIso?: string, endIso?: string) {
  if (!startIso || !endIso) return null;
  const s = new Date(startIso).getTime();
  const e = new Date(endIso).getTime();
  if (!Number.isFinite(s) || !Number.isFinite(e)) return null;
  return Math.max(1, Math.ceil((e - s) / (1000 * 60 * 60 * 24)));
}

export function scoreOfferFit(params: {
  request: AIRequestLite;
  offer: AIOfferLite;
}): OfferFit {
  const { request, offer } = params;
  const offerRate = offer.finalRate ?? offer.dailyRate ?? 0;
  const budget = request.budget ?? 0;
  const durationDays = daysBetween(request.pickupDate, request.dropoffDate);

  let score = 55;
  const reasons: string[] = [];

  if (offer.status === 'ACCEPTED') score += 10;
  if (offer.status === 'REJECTED') score -= 40;

  if (budget > 0 && offerRate > 0) {
    const ratio = offerRate / budget;
    if (ratio <= 0.9) {
      score += 18;
      reasons.push(`Price is below budget (${Math.round((1 - ratio) * 100)}% under).`);
    } else if (ratio <= 1.05) {
      score += 10;
      reasons.push('Price is close to your budget.');
    } else if (ratio <= 1.25) {
      score -= 10;
      reasons.push(`Price is above budget (~${Math.round((ratio - 1) * 100)}% over).`);
    } else {
      score -= 20;
      reasons.push('Price is far above budget.');
    }
  } else if (offerRate > 0) {
    reasons.push('Tip: adding a budget helps compare offers.');
  }

  if (durationDays !== null && offerRate > 0) {
    const total = offerRate * durationDays;
    reasons.push(`Estimated total: $${total.toFixed(0)} for ${durationDays} day(s).`);
  }

  if (!offer.carModel?.trim()) {
    score -= 6;
    reasons.push('Car model not specified.');
  } else {
    score += 4;
  }

  score = clamp(score, 0, 100);

  const label: OfferFit['label'] =
    score >= 82 ? 'Great' : score >= 68 ? 'Good' : score >= 52 ? 'Okay' : 'Poor';

  return { score, label, reasons: reasons.slice(0, 3) };
}

export function buildAIInsights(params: {
  user: AIUserContext;
  stats: AIStat[];
  requests?: AIRequestLite[];
  offers?: AIOfferLite[];
}): AIInsight[] {
  const { user, stats, requests = [], offers = [] } = params;
  const insights: AIInsight[] = [];

  const missing: string[] = [];
  if (!user.phone?.trim()) missing.push('phone number');
  if (!user.nationality?.trim()) missing.push('nationality');
  if (user.role === 'AGENCY' && !user.companyName?.trim()) missing.push('company name');

  if (missing.length > 0) {
    insights.push({
      title: 'Profile completeness',
      severity: 'warning',
      bullets: [
        `Add your ${missing.join(', ')} to improve trust and conversions.`,
        user.role === 'AGENCY'
          ? 'A complete agency profile helps clients choose you faster.'
          : 'A complete profile helps agencies respond with better offers.',
      ],
    });
  } else {
    insights.push({
      title: 'Profile looks solid',
      severity: 'success',
      bullets: ['Your profile has the key fields filled in.', 'Next step: use AI recommendations below to improve results.'],
    });
  }

  const byLabel = Object.fromEntries(stats.map((s) => [s.label, s.value] as const));

  if (user.role === 'CLIENT') {
    const active = byLabel['Active'] ?? requests.filter((r) => ['OPEN', 'NEGOTIATING'].includes(r.status)).length;
    const completed = byLabel['Completed'] ?? requests.filter((r) => ['BOOKED', 'COMPLETED'].includes(r.status)).length;

    if (active > 0) {
      insights.push({
        title: 'Speed up your active requests',
        severity: 'info',
        bullets: [
          'Add clear pickup/drop-off locations and preferred car type to reduce back-and-forth.',
          'If budget is flexible, mention a range (e.g. “$35–$45/day”) to get better matches.',
        ],
      });
    }

    if (completed === 0 && requests.length > 0) {
      insights.push({
        title: 'Convert more offers into bookings',
        severity: 'info',
        bullets: [
          'When you like an offer, respond fast—agencies prioritize active chats.',
          'Ask for a final rate and confirm what’s included (insurance, mileage, deposit).',
        ],
      });
    }

    const missingBudget = requests.filter((r) => (r.budget ?? 0) <= 0).length;
    if (missingBudget > 0) {
      insights.push({
        title: 'Budget tip',
        severity: 'warning',
        bullets: [
          `${missingBudget} request(s) look like they have no budget set.`,
          'Adding a budget helps agencies pick the right car class and pricing.',
        ],
      });
    }
  } else {
    const pending = byLabel['Pending'] ?? offers.filter((o) => ['PENDING', 'NEGOTIATING'].includes(o.status)).length;
    const accepted = byLabel['Accepted'] ?? offers.filter((o) => o.status === 'ACCEPTED').length;

    if (pending > 0) {
      insights.push({
        title: 'Win more deals from pending offers',
        severity: 'info',
        bullets: [
          'Reply quickly with 2–3 options (economy, mid, premium) rather than one car.',
          'Send a “final rate” message when you can—clarity increases acceptance.',
        ],
      });
    }

    if (accepted === 0 && offers.length > 0) {
      insights.push({
        title: 'Negotiation improvement',
        severity: 'warning',
        bullets: [
          'Try offering a small discount for longer rentals (3+ days).',
          'Include what’s covered (insurance/mileage) to reduce price-only comparisons.',
        ],
      });
    }
  }

  return insights.slice(0, 5);
}

export async function askAI(params: {
  user: AIUserContext;
  stats: AIStat[];
  question: string;
  requests?: AIRequestLite[];
  offers?: AIOfferLite[];
}): Promise<{ answer: string; mode: 'offline' | 'api' }> {
  const question = clampText(params.question, 700);
  if (!question) return { answer: 'Ask me something about improving your results on InRide.', mode: 'offline' };

  const endpoint = import.meta.env.VITE_AI_ENDPOINT as string | undefined;
  if (endpoint) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          context: {
            user: params.user,
            stats: params.stats,
            requests: params.requests ?? [],
            offers: params.offers ?? [],
          },
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { answer?: string };
        if (data.answer?.trim()) return { answer: data.answer.trim(), mode: 'api' };
      }
    } catch {
      // fall back to offline
    }
  }

  const roleLine =
    params.user.role === 'CLIENT'
      ? 'Client goal: get faster, better-matched offers and book with confidence.'
      : 'Agency goal: convert more offers by responding fast and reducing uncertainty.';
  const statLine = params.stats.length
    ? `Your stats: ${params.stats.map((s) => `${s.label}=${s.value}`).join(', ')}.`
    : 'I don’t see stats yet, but I can still help.';

  const answer =
    `Here’s a practical plan based on your role.\n\n` +
    `${roleLine}\n` +
    `${statLine}\n\n` +
    `About your question: “${question}”\n\n` +
    (params.user.role === 'CLIENT'
      ? `- Make your request “easy to quote”: exact pickup/drop-off, dates, car type, budget range.\n- If you’re negotiating, ask for a final all-in daily rate and what’s included.\n- If you want, paste one request text here and I’ll rewrite it to get better offers.`
      : `- Reply with 2–3 car options + availability + a clear final rate.\n- Offer small incentives for longer rentals (3+ days) and be explicit about inclusions.\n- If you paste a recent negotiation message, I can propose a better response.`) +
    `\n`;

  return { answer, mode: 'offline' };
}

export function extractFirstUsdNumber(text: string): number | null {
  const m = text.match(/(?:\$|USD\s*)\s*([0-9]+(?:\.[0-9]+)?)/i);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

