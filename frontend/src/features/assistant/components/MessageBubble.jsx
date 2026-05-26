import { Bot, User } from 'lucide-react';
import FeedbackButtons from './FeedbackButtons';

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function MarkdownText({ text }) {
  // Very lightweight markdown: bold, inline code, line breaks
  const parts = text.split('\n').map((line, i) => {
    const formatted = line
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="bg-slate-100 dark:bg-slate-800 px-1 rounded text-xs font-mono">$1</code>');
    return (
      <span key={i}>
        <span dangerouslySetInnerHTML={{ __html: formatted }} />
        {i < text.split('\n').length - 1 && <br />}
      </span>
    );
  });
  return <>{parts}</>;
}

export default function MessageBubble({ message, isLast }) {
  const isUser = message.senderType === 'user';
  const isBlocked = message.metadata?.blocked;

  if (isUser) {
    return (
      <div className="flex justify-end gap-2 mb-3">
        <div className="max-w-[80%]">
          <div className="bg-tetri-blue text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm leading-relaxed">
            {message.message}
          </div>
          <p className="text-xs text-tetri-muted mt-1 text-right">{formatTime(message.createdAt)}</p>
        </div>
        <div className="w-7 h-7 rounded-full bg-[#eff4ff] flex items-center justify-center flex-shrink-0 mt-0.5">
          <User className="w-3.5 h-3.5 text-tetri-blue" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 mb-3">
      <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Bot className="w-3.5 h-3.5 text-violet-600" />
      </div>
      <div className="max-w-[85%]">
        <div className={`px-4 py-2.5 rounded-2xl rounded-tl-sm text-sm leading-relaxed ${
          isBlocked
            ? 'bg-amber-50 border border-amber-200 text-amber-800'
            : 'bg-tetri-surface border border-tetri-border text-tetri-text'
        }`}>
          <MarkdownText text={message.message} />
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-tetri-muted">{formatTime(message.createdAt)}</p>
          {!isBlocked && isLast && <FeedbackButtons messageId={message.id} />}
        </div>
      </div>
    </div>
  );
}
