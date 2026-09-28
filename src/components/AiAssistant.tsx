import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ChatMessage } from '../types';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Trash2,
  HelpCircle,
  ShieldAlert,
  Loader2,
  ExternalLink,
  BookOpen,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';

const SUGGESTED_QUERIES = [
  'Which Andhra Pradesh government jobs match my degree?',
  'Which cybersecurity internships accept 2nd or 3rd year students?',
  'What age relaxations are provided for OBC/SC/ST/EWS in APPSC?',
  'Which government opportunities are open exclusively to women?',
  'What certificates are mandatory for SSC CGL and UPSC examinations?',
  'What skills do I need for a Tier-1 SOC Analyst in government?',
];

export const AiAssistant: React.FC = () => {
  const { user, setActiveTab, setSelectedJobForDetail, opportunities } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: `Hello ${user ? user.fullName.split(' ')[0] : 'there'}! I am **GovtJob AI Assistant**, your dedicated advisor for Andhra Pradesh and Central Government recruitment, cybersecurity careers, and student internships.\n\nI can verify eligibility rules, check age relaxations for your category, list required certificates, and point you to official gazette applications. How can I assist you today?`,
      timestamp: 'Just now',
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!queryText) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          userContext: user,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reach AI assistant');
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.answer || 'I am ready to help with any question about government jobs or internships.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'I am momentarily unable to reach the recruitment database. Please verify your query or explore the jobs directly from the tabs above.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: 'Chat history cleared. What questions do you have about government jobs, cybersecurity careers, or student internships?',
        timestamp: 'Just now',
      },
    ]);
  };

  // Render markdown text simply
  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      // Check for headings
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="font-extrabold text-slate-900 text-sm mt-3 mb-1.5">
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h3 key={idx} className="font-extrabold text-slate-900 text-base mt-3 mb-1.5">
            {line.replace('## ', '')}
          </h3>
        );
      }

      // Check for bullet lines
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const content = line.trim().substring(2);
        return (
          <div key={idx} className="flex items-start gap-2 ml-2 my-1">
            <span className="text-amber-500 font-bold">•</span>
            <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(content) }} />
          </div>
        );
      }

      if (line.match(/^\d+\.\s/)) {
        return (
          <div key={idx} className="flex items-start gap-2 ml-2 my-1 font-medium text-slate-800">
            <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }} />
          </div>
        );
      }

      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className="my-1" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }} />
      );
    });
  };

  const formatInlineMarkdown = (str: string) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[11px]">$1</code>');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 text-amber-400 font-semibold text-xs tracking-wider uppercase">
            <Sparkles className="w-4 h-4 animate-pulse" />
            AI Career & Recruitment Assistant
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            GovtJob AI Assistant
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Ask questions about APPSC, UPSC, SSC, CERT-In, AICTE internships, reservation quotas, and certificate requirements.
          </p>
        </div>
        <button
          onClick={handleClearChat}
          className="self-start sm:self-center px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear History
        </button>
      </div>

      {/* Suggested Prompt Chips */}
      <div>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
          Recommended Queries
        </span>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUERIES.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-xs bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 px-3.5 py-2 rounded-xl border border-slate-200 transition-all text-left shadow-2xl shadow-slate-100 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{q}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
        {/* Messages Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isBot = msg.sender === 'assistant';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isBot ? '' : 'flex-row-reverse'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                    isBot
                      ? 'bg-gradient-to-tr from-blue-700 to-indigo-600 text-white'
                      : 'bg-slate-900 text-white'
                  }`}
                >
                  {isBot ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed ${
                    isBot
                      ? 'bg-slate-50 border border-slate-200/90 text-slate-800'
                      : 'bg-blue-600 text-white font-medium rounded-tr-none'
                  }`}
                >
                  {isBot ? (
                    <div>{renderFormattedText(msg.text)}</div>
                  ) : (
                    <p>{msg.text}</p>
                  )}
                  <span
                    className={`block text-[10px] mt-2 ${
                      isBot ? 'text-slate-400' : 'text-blue-200 text-right'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-2 text-xs text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                <span>Checking official notifications & gazette rules...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Advisory footer */}
        <div className="px-6 py-2 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
            AI guidance references active Indian public sector rules. Always consult official gazettes.
          </span>
          <span className="hidden sm:inline">Port 3000 Verified</span>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 bg-white border-t border-slate-200 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask about APPSC, SSC, CERT-In, internships, age limits, syllabus..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition-colors shadow-md flex items-center justify-center shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
