import { useState, useEffect, useCallback } from 'react';
import { Send, Loader2, RefreshCw } from 'lucide-react';
import type { AIMessage, AIConversation, AIProviderConfig } from '@/lib/redactionTypes';
import {
  getOrCreateConversation,
  fetchMessages,
  addMessage,
  callAIProvider,
  fetchAIConfigs,
  fetchDefaultSystemPrompt,
  updateConversation,
} from '@/lib/redactionAiClient';
import RedactionMessageList from './RedactionMessageList';
import AIProviderSelector from './AIProviderSelector';
import AIModelSelector from './AIModelSelector';

interface RedactionConversationProps {
  documentId: string;
  userId: string;
  onJsonDetected?: (jsonText: string) => void;
}

export default function RedactionConversation({
  documentId,
  userId,
  onJsonDetected,
}: RedactionConversationProps) {
  const [conversation, setConversation] = useState<AIConversation | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [configs, setConfigs] = useState<AIProviderConfig[]>([]);
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState('');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger conversation + configs
  const init = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [conv, cfgs, defaultPrompt] = await Promise.all([
        getOrCreateConversation(documentId),
        fetchAIConfigs(),
        fetchDefaultSystemPrompt(),
      ]);

      let activeConversation = conv;

      if (
        defaultPrompt &&
        (conv.system_prompt_id !== defaultPrompt.id ||
          conv.system_prompt_snapshot !== defaultPrompt.prompt_text)
      ) {
        activeConversation = await updateConversation(conv.id, {
          system_prompt_id: defaultPrompt.id,
          system_prompt_snapshot: defaultPrompt.prompt_text,
        });
      }

      setConversation(activeConversation);
      setConfigs(cfgs);

      // Pré-sélectionner config/model
      if (activeConversation.provider_config_id) {
        setSelectedConfigId(activeConversation.provider_config_id);
      } else if (cfgs.length > 0) {
        setSelectedConfigId(cfgs[0].id);
      }
      if (activeConversation.model_name) {
        setSelectedModel(activeConversation.model_name);
      } else {
        const cfg = cfgs.find((c) => c.id === activeConversation.provider_config_id) ?? cfgs[0];
        if (cfg?.default_model) setSelectedModel(cfg.default_model);
      }

      // Charger messages
      const msgs = await fetchMessages(activeConversation.id);
      setMessages(msgs);
    } catch (err) {
      console.error('[Conversation] Init error:', err);
      setError('Impossible de charger la conversation.');
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    init();
  }, [init]);

  // Config sélectionnée
  const activeConfig = configs.find((c) => c.id === selectedConfigId) ?? null;

  // Mettre à jour la conversation quand le provider/model change
  const handleConfigChange = async (configId: string | null) => {
    setSelectedConfigId(configId);
    if (!conversation || !configId) return;
    const cfg = configs.find((c) => c.id === configId);
    if (cfg?.default_model) setSelectedModel(cfg.default_model);
    try {
      await updateConversation(conversation.id, {
        provider_config_id: configId,
        model_name: cfg?.default_model ?? null,
      });
    } catch {
      // Non critique
    }
  };

  const handleModelChange = async (model: string) => {
    setSelectedModel(model);
    if (!conversation) return;
    try {
      await updateConversation(conversation.id, { model_name: model });
    } catch {
      // Non critique
    }
  };

  // Envoyer un message
  const handleSend = async () => {
    if (!input.trim() || !conversation || !activeConfig || !selectedModel) return;

    const userText = input.trim();
    setInput('');
    setSending(true);
    setError(null);

    try {
      // Sauvegarder et afficher le message utilisateur
      const userMsg = await addMessage(conversation.id, 'user', userText, userId);
      setMessages((prev) => [...prev, userMsg]);

      // Construire les messages pour l'appel IA
      const chatMessages = [...messages, userMsg]
        .filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role, content: m.content }));

      // Appeler le fournisseur IA via Edge Function
      const assistantText = await callAIProvider({
        providerKey: activeConfig.provider_key,
        model: selectedModel,
        systemPrompt: conversation.system_prompt_snapshot,
        messages: chatMessages,
        conversationId: conversation.id,
        providerConfigId: activeConfig.id,
      });

      // Sauvegarder la réponse
      const assistantMsg = await addMessage(conversation.id, 'assistant', assistantText);
      setMessages((prev) => [...prev, assistantMsg]);

      // Détecter du JSON dans la réponse
      if (onJsonDetected && (assistantText.includes('"pages"') || assistantText.includes('```json'))) {
        onJsonDetected(assistantText);
      }
    } catch (err) {
      console.error('[Conversation] Send error:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = input.trim().length > 0 && activeConfig != null && selectedModel && !sending;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Sélecteurs provider/model */}
      <div className="flex gap-2 px-3 py-2 border-b border-gray-100">
        <div className="flex-1">
          <AIProviderSelector
            configs={configs}
            selectedConfigId={selectedConfigId}
            onSelect={handleConfigChange}
          />
        </div>
        <div className="flex-1">
          <AIModelSelector
            providerKey={activeConfig?.provider_key ?? null}
            selectedModel={selectedModel}
            onSelect={handleModelChange}
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 min-h-0">
        <RedactionMessageList messages={messages} loading={sending} />
      </div>

      {/* Erreur */}
      {error && (
        <div className="mx-3 mb-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      {/* Zone de saisie */}
      <div className="border-t border-gray-100 p-3">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              activeConfig
                ? 'Écrivez votre message… (Entrée pour envoyer)'
                : "Configurez un fournisseur IA d\u2019abord\u2026"
            }
            disabled={!activeConfig}
            rows={2}
            className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-xl bg-white
              focus:border-emerald-500 outline-none resize-none placeholder:text-gray-400
              disabled:bg-gray-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={!canSend}
            className="self-end p-2.5 bg-emerald-600 text-white rounded-xl
              hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
