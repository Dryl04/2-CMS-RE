import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User as UserIcon, Sparkles } from 'lucide-react';
import type { AIMessage } from '@/lib/redactionTypes';

interface RedactionMessageListProps {
  messages: AIMessage[];
  loading: boolean;
}

function MessageBubble({ message }: { message: AIMessage }) {
  const isAssistant = message.role === 'assistant';
  const isSystem = message.role === 'system';

  if (isSystem) return null;

  return (
    <div className={`flex gap-2.5 ${isAssistant ? '' : 'flex-row-reverse'}`}>
      <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center
        ${isAssistant ? 'bg-emerald-100' : 'bg-gray-100'}`}
      >
        {isAssistant ? (
          <Bot className="w-4 h-4 text-emerald-600" />
        ) : (
          <UserIcon className="w-4 h-4 text-gray-500" />
        )}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed
          ${isAssistant
            ? 'bg-white border border-gray-200 text-gray-800'
            : 'bg-emerald-600 text-white'
          }`}
      >
        <div className="whitespace-pre-wrap break-words">{message.content}</div>
        <div className={`text-[10px] mt-1 ${isAssistant ? 'text-gray-400' : 'text-emerald-200'}`}>
          {new Date(message.created_at).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
}

export default function RedactionMessageList({ messages, loading }: RedactionMessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, loading]);

  if (messages.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
          <Sparkles className="w-6 h-6 text-emerald-500" />
        </div>
        <p className="text-sm font-medium text-gray-700 mb-1">
          Conversation IA
        </p>
        <p className="text-xs text-gray-500 max-w-[220px]">
          Posez une question ou demandez la génération du JSON pour votre page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}
      {loading && (
        <div className="flex gap-2.5">
          <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl px-3.5 py-2.5">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Réflexion en cours…
            </div>
          </div>
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}
