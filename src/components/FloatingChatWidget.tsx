import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ChatMessage } from '../types';
import {
  Sparkles,
  Send,
  Bot,
  User,
  X,
  Maximize2,
  Trash2,
  Zap,
  MessageSquare,
  ChevronDown,
  Loader2,
  BookOpen,
} from 'lucide-react';

const QUICK_PROMPTS = [
  'Which jobs match my degree?',
  'Show active APPSC vacancies',
  'Central govt SSC & Railway jobs',
  'Cybersecurity & CERT-In internships',
  'Women-only recruitment schemes',
];

export const FloatingChatWidget: React.FC = () => {
  const {
    user,
    certificates,
    opportunities,
    n8nConfig,
    activeTab,
    setActiveTab,
  } = useApp();

  // If already on the dedicated full assistant page, hide the floating widget
  const isOnAssistantPage = activeTab === 'assistant';

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'floating-welcome',
      sender: 'assistant',
      text: `Hello ${user ? user.fullName.split(' ')[0] : 'there'}! 👋 I am **GovtJob AI Chatbot**, powered by **n8n Workflow** \`[ID: ${n8nConfig.webhookId.slice(0, 8)}...]\` and trained on all **${opportunities.length} live government vacancies** across Andhra Pradesh and Central India.\n\nAsk me anything about eligibility, age relaxations, application deadlines, or degree matching!`,
      timestamp: 'Just now',
      source: n8nConfig.isEnabled ? 'n8n' : 'gemini',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  const handleSend = async (customQuery?: string) => {
    const textToSend = customQuery || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customQuery) setInput('');
    setIsLoading(true);

    try {
      const endpoint = n8nConfig.isEnabled ? '/api/n8n/chat' : '/api/chat';
      const payload = {
        message: textToSend.trim(),
        messages: [...messages, userMessage],
        userContext: user,
        allOpportunities: opportunities,
        userCertificates: certificates,
        n8nWebhookUrl: n8nConfig.webhookUrl,
        n8nWebhookId: n8nConfig.webhookId,
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to reach assistant');
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.answer || 'I could not retrieve details. Please ask another question.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source === 'n8n' ? 'n8n' : 'gemini',
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'I am momentarily unable to reach the recruitment server. You can also explore the verified vacancies directly from the tabs above.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: `Chat cleared! What would you like to know about government jobs or internships today?`,
        timestamp: 'Just now',
        source: n8nConfig.isEnabled ? 'n8n' : 'gemini',
      },
    ]);
  };

  const formatInline = (str: string) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[10px] font-semibold">$1</code>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 font-semibold underline hover:text-blue-800 inline-flex items-center gap-0.5">$1</a>');
  };

  const renderBubbleText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="font-extrabold text-slate-900 text-xs mt-2 mb-1">
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('#### ')) {
        return (
          <h5 key={idx} className="font-bold text-blue-900 text-[11px] mt-1.5 mb-0.5">
            {line.replace('#### ', '')}
          </h5>
        );
      }
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <div key={idx} className="flex items-start gap-1.5 ml-1 my-0.5 text-xs text-slate-700">
            <span className="text-amber-500 font-bold">•</span>
            <span dangerouslySetInnerHTML={{ __html: formatInline(line.trim().substring(2)) }} />
          </div>
        );
      }
      if (line.match(/^\d+\.\s/)) {
        return (
          <div key={idx} className="ml-1 my-0.5 text-xs text-slate-800 font-medium">
            <span dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
          </div>
        );
      }
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }
      return (
        <p key={idx} className="my-0.5 text-xs text-slate-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
      );
    });
  };

  // If user is currently in the full Assistant tab, avoid duplicating the widget
  if (isOnAssistantPage) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Floating Chat Window */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[420px] h-[550px] max-h-[80vh] bg-white rounded-3xl border border-slate-200/90 shadow-2xl flex flex-col overflow-hidden mb-3 animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-4 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 via-orange-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-4 h-4 text-white animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm tracking-tight text-white">GovtJob AI Chatbot</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold font-mono">
                    LIVE
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-300">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>n8n: {n8nConfig.webhookId.slice(0, 8)}...</span>
                  <span>•</span>
                  <span>{opportunities.length} vacancies</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-300">
              <button
                onClick={handleClear}
                title="Clear conversation"
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setActiveTab('assistant');
                }}
                title="Open in full screen"
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick chips */}
          <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 overflow-x-auto flex gap-1.5 scrollbar-none shrink-0">
            {QUICK_PROMPTS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-[11px] font-medium border border-slate-200 transition-colors shrink-0 shadow-2xs"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50/50">
            {messages.map((msg) => {
              const isBot = msg.sender === 'assistant';
              const isN8n = msg.source === 'n8n';

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${isBot ? '' : 'flex-row-reverse'}`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-2xs text-white text-xs ${
                      isBot
                        ? isN8n
                          ? 'bg-gradient-to-tr from-purple-700 via-indigo-600 to-amber-500'
                          : 'bg-gradient-to-tr from-blue-700 to-indigo-600'
                        : 'bg-slate-900'
                    }`}
                  >
                    {isBot ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl p-3 shadow-xs ${
                      isBot
                        ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                        : 'bg-blue-600 text-white rounded-tr-xs'
                    }`}
                  >
                    {isBot ? (
                      renderBubbleText(msg.text)
                    ) : (
                      <p className="text-xs leading-relaxed">{msg.text}</p>
                    )}
                    <span
                      className={`text-[9px] block mt-1 text-right font-medium ${
                        isBot ? 'text-slate-400' : 'text-blue-100'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center shrink-0 text-white">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-3 shadow-xs flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
                  <span>GovtJob AI is analyzing vacancies...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              placeholder="Ask about APPSC, UPSC, internships, eligibility..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white font-medium"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-sm disabled:opacity-40 transition-colors shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20 select-none cursor-pointer"
        aria-label="Open AI Recruitment Chatbot"
      >
        <div className="relative">
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
            {isOpen ? (
              <ChevronDown className="w-4 h-4 text-white" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            )}
          </div>
          {!isOpen && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900 animate-ping" />
          )}
        </div>

        <div className="text-left hidden sm:block">
          <div className="text-xs font-black tracking-tight leading-none text-white flex items-center gap-1.5">
            <span>{isOpen ? 'Close Chatbot' : 'Ask GovtJob AI'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 text-[9px] font-bold">
              n8n
            </span>
          </div>
          <span className="text-[10px] text-slate-300 font-medium leading-none block mt-0.5">
            Trained on {opportunities.length} live jobs
          </span>
        </div>
      </button>
    </div>
  );
};
