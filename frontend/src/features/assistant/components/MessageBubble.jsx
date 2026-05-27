import { useState } from 'react';
import { Bot, Copy, Check, RefreshCw, ThumbsUp, ThumbsDown, Flag } from 'lucide-react';
import MarkdownContent from './MarkdownContent';
import ContextPanel from './ContextPanel';
import assistantService from '../services/assistantService';

export default function MessageBubble({ message, isLast, onRegenerate }) {
  const [copied,   setCopied]   = useState(false);
  const [feedback, setFeedback] = useState(null);

  const isUser        = message.senderType === 'user';
  const isBlocked     = message.metadata?.blocked;
  const isStream      = message.streaming;
  const sources       = message.metadata?.sources || [];
  const confidence    = message.metadata?.confidence;
  const actionName    = message.metadata?.actionName;
  const actionCategory = message.metadata?.actionCategory;

  const copyText = () => {
    navigator.clipboard.writeText(message.message).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const submitFeedback = async (rating) => {
    if (feedback || message.id?.startsWith('tmp')) return;
    try {
      await assistantService.submitFeedback({ messageId: message.id, rating });
      setFeedback(rating);
    } catch {}
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[80%] bg-tetri-blue text-white px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed whitespace-pre-wrap">
          {message.message}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 mb-4 group/bubble">
      <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Bot className="w-3.5 h-3.5 text-violet-600" />
      </div>

      <div className="flex-1 min-w-0">
        <div
          className={`px-4 py-3 rounded-2xl rounded-tl-sm ${
            isBlocked
              ? 'border border-amber-200 bg-amber-50 text-amber-900'
              : 'bg-tetri-surface border border-tetri-border text-tetri-text'
          }`}
        >
          {isStream ? (
            <div className="text-sm">
              {message.message
                ? <MarkdownContent content={message.message} />
                : null}
              <span className="inline-block w-0.5 h-4 bg-tetri-blue animate-pulse ml-0.5 align-middle" />
            </div>
          ) : (
            <MarkdownContent content={message.message} />
          )}
        </div>

        {/* Action badge */}
        {!isStream && !isBlocked && actionName && actionCategory !== 'general' && (
          <div className="mt-1.5 flex items-center gap-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-50 border border-violet-200 text-xs text-violet-700 font-medium">
              <Bot className="w-3 h-3" />
              {actionName}
            </span>
          </div>
        )}

        {/* Context sources */}
        {!isStream && !isBlocked && sources.length > 0 && (
          <ContextPanel sources={sources} confidence={confidence} />
        )}

        {/* Action bar */}
        {!isStream && isLast && !isBlocked && (
          <div className="flex items-center gap-0.5 mt-1.5 opacity-0 group-hover/bubble:opacity-100 transition-opacity">
            <button
              onClick={copyText}
              title="Copy response"
              className="p-1.5 rounded-lg text-tetri-muted hover:bg-tetri-bg hover:text-tetri-text transition-colors"
            >
              {copied
                ? <Check className="w-3.5 h-3.5 text-green-500" />
                : <Copy  className="w-3.5 h-3.5" />}
            </button>

            {onRegenerate && (
              <button
                onClick={onRegenerate}
                title="Regenerate response"
                className="p-1.5 rounded-lg text-tetri-muted hover:bg-tetri-bg hover:text-tetri-text transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}

            <div className="w-px h-3.5 bg-tetri-border mx-1" />

            <button
              onClick={() => submitFeedback('helpful')}
              title="Helpful"
              className={`p-1.5 rounded-lg transition-colors ${
                feedback === 'helpful'
                  ? 'text-green-600 bg-green-50'
                  : 'text-tetri-muted hover:bg-tetri-bg hover:text-green-600'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => submitFeedback('not_helpful')}
              title="Not helpful"
              className={`p-1.5 rounded-lg transition-colors ${
                feedback === 'not_helpful'
                  ? 'text-red-500 bg-red-50'
                  : 'text-tetri-muted hover:bg-tetri-bg hover:text-red-500'
              }`}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => submitFeedback('report')}
              title="Report issue"
              className="p-1.5 rounded-lg text-tetri-muted hover:bg-tetri-bg hover:text-amber-500 transition-colors"
            >
              <Flag className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
