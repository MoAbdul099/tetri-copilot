import { useState, useCallback } from 'react';
import { Sparkles, Loader2, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

function confidenceBadge(score) {
  if (score >= 90) return 'bg-green-100 text-green-700 border-green-200';
  if (score >= 75) return 'bg-blue-100 text-blue-700 border-blue-200';
  if (score >= 60) return 'bg-amber-100 text-amber-700 border-amber-200';
  return 'bg-gray-100 text-gray-500 border-gray-200';
}

function confidenceLabel(score) {
  if (score >= 90) return 'High confidence';
  if (score >= 75) return 'Good match';
  if (score >= 60) return 'Possible match';
  return 'Low confidence';
}

export default function AiCategorizationPanel({
  description,
  vendorName,
  amount,
  currency,
  notes,
  expenseId,
  onAccept,
  onCategorize,
  disabled = false,
}) {
  const [loading,      setLoading]      = useState(false);
  const [result,       setResult]       = useState(null);
  const [accepted,     setAccepted]     = useState(false);
  const [rejected,     setRejected]     = useState(false);
  const [showAlts,     setShowAlts]     = useState(false);
  const [error,        setError]        = useState(null);

  const run = useCallback(async () => {
    if (!description && !vendorName) return;
    setLoading(true);
    setResult(null);
    setError(null);
    setAccepted(false);
    setRejected(false);
    setShowAlts(false);

    try {
      const data = await onCategorize({ description, vendorName, amount, currency, notes, expenseId });
      if (data?.skipped) {
        setError(data.reasoning || 'Categorization unavailable.');
        return;
      }
      setResult(data);
    } catch (err) {
      setError('AI categorization failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [description, vendorName, amount, currency, notes, expenseId, onCategorize]);

  const accept = useCallback(async (cat) => {
    setAccepted(true);
    if (onAccept) onAccept({ categoryId: cat.categoryId, categoryName: cat.categoryName });
    if (result?.recommendationId) {
      try {
        const { expensesService } = await import('../services/expensesService');
        await expensesService.aiAccept({
          expenseId,
          recommendationId: result.recommendationId,
          finalCategoryId:  cat.categoryId,
        });
      } catch {}
    }
  }, [result, expenseId, onAccept]);

  const reject = useCallback(() => {
    setRejected(true);
  }, []);

  const canRun = (description || vendorName) && !disabled && !loading;

  return (
    <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
          </div>
          <span className="text-sm font-semibold text-violet-900">AI Category Suggestion</span>
        </div>

        {!accepted && !rejected && (
          <button
            onClick={run}
            disabled={!canRun}
            className="text-xs px-3 py-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {loading ? (
              <><Loader2 className="w-3 h-3 animate-spin" /> Analyzing…</>
            ) : (
              <><Sparkles className="w-3 h-3" /> Suggest Category</>
            )}
          </button>
        )}
      </div>

      {/* Error state */}
      {error && !loading && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Accepted state */}
      {accepted && result && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>Applied <strong>{result.primary?.categoryName}</strong> — category updated.</span>
        </div>
      )}

      {/* Rejected state */}
      {rejected && (
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          <XCircle className="w-4 h-4 flex-shrink-0" />
          <span>Suggestion dismissed. Please select a category manually.</span>
        </div>
      )}

      {/* Result */}
      {result && !accepted && !rejected && (
        <div className="space-y-3">
          {/* Primary */}
          <div className="bg-white rounded-lg border border-violet-200 px-3 py-2.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-violet-600 font-medium uppercase tracking-wide">Best match</span>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${confidenceBadge(result.primary?.confidence)}`}>
                {result.primary?.confidence}% · {confidenceLabel(result.primary?.confidence)}
              </span>
            </div>
            <p className="text-sm font-semibold text-tetri-text">{result.primary?.categoryName}</p>
            {result.reasoning && (
              <p className="text-xs text-tetri-muted leading-relaxed">{result.reasoning}</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => accept(result.primary)}
              className="flex-1 text-xs px-3 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors flex items-center justify-center gap-1.5 font-medium"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Use this category
            </button>
            <button
              onClick={reject}
              className="text-xs px-3 py-2 rounded-lg border border-tetri-border text-tetri-muted hover:bg-tetri-bg hover:text-tetri-text transition-colors"
            >
              Dismiss
            </button>
          </div>

          {/* Alternatives toggle */}
          {result.alternatives?.length > 0 && (
            <div>
              <button
                onClick={() => setShowAlts((v) => !v)}
                className="text-xs text-violet-600 hover:text-violet-800 flex items-center gap-1 transition-colors"
              >
                {showAlts ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {showAlts ? 'Hide' : 'Show'} {result.alternatives.length} alternative{result.alternatives.length > 1 ? 's' : ''}
              </button>

              {showAlts && (
                <div className="mt-2 space-y-1.5">
                  {result.alternatives.map((alt, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-white rounded-lg border border-tetri-border px-3 py-2 cursor-pointer hover:border-violet-300 hover:bg-violet-50 transition-colors group"
                      onClick={() => accept(alt)}
                    >
                      <span className="text-sm text-tetri-text group-hover:text-violet-700">{alt.categoryName}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${confidenceBadge(alt.confidence)}`}>
                          {alt.confidence}%
                        </span>
                        <span className="text-xs text-violet-600 opacity-0 group-hover:opacity-100 transition-opacity">Use</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!result && !loading && !error && (
        <p className="text-xs text-violet-600">
          Enter a description or vendor name, then click <strong>Suggest Category</strong> to get an AI recommendation.
        </p>
      )}
    </div>
  );
}
