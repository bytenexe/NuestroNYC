import React from 'react';
import { Sparkles, User } from 'lucide-react';
import SpeakButton from '@/components/common/SpeakButton';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <li className={`flex gap-3 ${isUser ? 'flex-row-reverse text-right' : ''}`}>
      <span
        className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${
          isUser ? 'bg-muted text-muted-foreground' : 'bg-[hsl(var(--brand-teal))] text-white'
        }`}
        aria-hidden="true"
      >
        {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
      </span>
      <div className={`max-w-[85%] ${isUser ? 'items-end' : ''}`}>
        <div
          className={`whitespace-pre-line rounded-3xl px-4 py-3 text-left text-[15px] leading-relaxed ${
            isUser
              ? 'rounded-tr-md bg-[hsl(var(--brand-navy))] text-white'
              : 'rounded-tl-md border border-border bg-card text-foreground'
          }`}
        >
          {message.content}
        </div>
        {!isUser ? <SpeakButton text={message.content} className="mt-2" /> : null}
      </div>
    </li>
  );
}