import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Flag, Check } from 'lucide-react';
import assistantService from '../services/assistantService';

export default function FeedbackButtons({ messageId }) {
  const [submitted, setSubmitted] = useState(null);
  const [loading, setLoading]     = useState(false);

  const submit = async (rating) => {
    if (submitted || loading) return;
    setLoading(true);
    try {
      await assistantService.submitFeedback({ messageId, rating });
      setSubmitted(rating);
    } catch {
      // non-critical
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-1 mt-1">
        <Check className="w-3 h-3 text-emerald-500" />
        <span className="text-xs text-tetri-muted">Thanks for the feedback</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 mt-1">
      <button
        onClick={() => submit('helpful')}
        disabled={loading}
        title="Helpful"
        className="p-1 rounded hover:bg-tetri-bg text-tetri-muted hover:text-emerald-600 transition-colors"
      >
        <ThumbsUp className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => submit('not_helpful')}
        disabled={loading}
        title="Not helpful"
        className="p-1 rounded hover:bg-tetri-bg text-tetri-muted hover:text-tetri-error transition-colors"
      >
        <ThumbsDown className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => submit('report')}
        disabled={loading}
        title="Report issue"
        className="p-1 rounded hover:bg-tetri-bg text-tetri-muted hover:text-amber-600 transition-colors"
      >
        <Flag className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
