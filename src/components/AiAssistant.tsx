import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  Zap,
  Settings,
  Check,
  Copy,
  AlertCircle,
  CheckCircle2,
  X,
  Code,
  Database,
  Download,
  Cpu,
  RefreshCw,
  FileText,
} from 'lucide-react';

interface AiAssistantProps {
  initialJobContext?: string;
}

const CATEGORY_TOPICS = [
  { label: '🧠 Train Agent with Website Data', query: 'Provide the complete structured training data summary and all vacancy knowledge from this portal to train my AI agent.' },
  { label: '🎯 Match My Degree', query: 'Which government jobs and internships match my educational qualification and branch?' },
  { label: '🏛️ AP Government Jobs', query: 'Show me all active Andhra Pradesh government vacancies including APPSC and police boards' },
  { label: '🇮🇳 Central Govt & PSUs', query: 'List all open Central Government opportunities from UPSC, SSC, Railways, and Banks' },
  { label: '🛡️ Cybersecurity & IT', query: 'What cybersecurity and IT roles are currently open in CERT-In, NIC, and State CSOCs?' },
  { label: '🎓 Student Internships', query: 'Which paid government internships accept college students, and what are their stipends?' },
  { label: '👩‍💼 Women Opportunities', query: 'Which government opportunities are open to women, and what fee exemptions apply?' },
  { label: '⏰ Upcoming Deadlines', query: 'Show me all upcoming application deadlines in chronological order' },
  { label: '📄 Certificate Checklist', query: 'What certificates do I need to prepare before applying for APPSC and SSC exams?' },
];

export const AiAssistant: React.FC<AiAssistantProps> = () => {
  const {
    user,
    certificates,
    opportunities,
    n8nConfig,
    updateN8nConfig,
  } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: `Hello ${user ? user.fullName.split(' ')[0] : 'there'}! I am **GovtJob AI Assistant**, integrated with **n8n Automation Workflow** \`[ID: ${n8nConfig.webhookId}]\` and trained on all **${opportunities.length} verified government vacancies and internships** across Andhra Pradesh and Central India.\n\nI can verify eligibility rules, check age relaxations for your category, list required certificates, and point you to official gazette applications. How can I help you today?`,
      timestamp: 'Just now',
      source: n8nConfig.isEnabled ? 'n8n' : 'gemini',
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [isN8nModalOpen, setIsN8nModalOpen] = useState(false);
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
  const [activeTrainingTab, setActiveTrainingTab] = useState<'prompt' | 'json' | 'stats'>('prompt');
  const [isCopiedId, setIsCopiedId] = useState(false);
  const [isCopiedTrainingPrompt, setIsCopiedTrainingPrompt] = useState(false);
  const [isCopiedJson, setIsCopiedJson] = useState(false);
  const [n8nTestLoading, setN8nTestLoading] = useState(false);
  const [n8nTestResult, setN8nTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [n8nSyncLoading, setN8nSyncLoading] = useState(false);
  const [n8nSyncResult, setN8nSyncResult] = useState<{ ok: boolean; message: string } | null>(null);

  // Local editable n8n config inside modal
  const [tempWebhookUrl, setTempWebhookUrl] = useState(n8nConfig.webhookUrl);
  const [tempWebhookId, setTempWebhookId] = useState(n8nConfig.webhookId);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleCopyWebhookId = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(n8nConfig.webhookId);
      setIsCopiedId(true);
      setTimeout(() => setIsCopiedId(false), 2000);
    }
  };

  const handleTestN8n = async () => {
    setN8nTestLoading(true);
    setN8nTestResult(null);

    try {
      const response = await fetch('/api/n8n/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl: tempWebhookUrl || n8nConfig.webhookUrl,
          webhookId: tempWebhookId || n8nConfig.webhookId,
        }),
      });

      const data = await response.json();
      setN8nTestResult({
        ok: data.ok,
        message: data.message || (data.ok ? 'Connection verified!' : 'Connection check failed'),
      });

      updateN8nConfig({
        connectionStatus: data.ok ? 'connected' : 'error',
        lastTestedAt: new Date().toLocaleTimeString(),
        errorDetails: data.ok ? undefined : data.message,
      });
    } catch (err: any) {
      setN8nTestResult({
        ok: false,
        message: err.message || 'Network error reaching n8n endpoint',
      });
      updateN8nConfig({
        connectionStatus: 'error',
        lastTestedAt: new Date().toLocaleTimeString(),
        errorDetails: err.message,
      });
    } finally {
      setN8nTestLoading(false);
    }
  };

  const handleSaveN8nModal = () => {
    updateN8nConfig({
      webhookId: tempWebhookId.trim() || '6172d2e9ccd14cd4926fb4d5a424bfd9',
      webhookUrl: tempWebhookUrl.trim(),
    });
    setIsN8nModalOpen(false);
  };

  const generatedTrainingText = useMemo(() => {
    let text = `# GOVTJOB AI PORTAL — COMPLETE WEBSITE RECRUITMENT KNOWLEDGE BASE\n\n`;
    text += `## PORTAL OVERVIEW & STATUTORY RULES\n`;
    text += `- Portal Name: GovtJob AI (https://govtjobai.in)\n`;
    text += `- Total Verified Active Opportunities: ${opportunities.length}\n`;
    text += `- Andhra Pradesh Quota: 80% local candidate reservation in district/zonal posts under AP Presidential Order. Class 4 to 10 study certificates required.\n`;
    text += `- Women Concessions: 33.33% horizontal reservation in AP state services; 100% exam fee waiver in UPSC, SSC, and RRB recruitments.\n`;
    text += `- Category Relaxations: SC/ST: 5 years; BC/OBC-NCL: 3 to 5 years; PwD: 10 years; Ex-Servicemen: 3 years after service deduction.\n\n`;
    text += `## VERIFIED JOB & INTERNSHIP CATALOG (${opportunities.length} OPPORTUNITIES)\n\n`;

    opportunities.forEach((j, i) => {
      text += `### [${i + 1}] ${j.title} (${j.organization})\n`;
      text += `- ID: ${j.id} | Notification: ${j.notificationNumber} | Category: ${j.category}\n`;
      text += `- Department: ${j.department} | State/Location: ${j.stateOrRegion || j.location} | Work Mode: ${j.workMode}\n`;
      text += `- Vacancies: ${j.vacanciesCount > 0 ? j.vacanciesCount.toLocaleString() : 'Open / Unspecified'}\n`;
      text += `- Pay Scale / Stipend: ${j.payScaleOrStipend}\n`;
      text += `- Educational Qualifications: ${j.educationalQualifications.join('; ')}\n`;
      text += `- Eligible Branches: ${j.eligibleBranches.join(', ')}\n`;
      text += `- Age Limit: ${j.ageLimit.min} to ${j.ageLimit.max} years (${j.ageLimit.relaxationDetails})\n`;
      text += `- Key Skills: ${(j.technicalSkillsRequired || []).join(', ') || 'General'}\n`;
      text += `- Required Certificates: ${(j.requiredCertificates || []).join('; ')}\n`;
      text += `- Fees: ${j.fees}\n`;
      text += `- Application Deadline: ${j.applicationDeadline} (Exam: ${j.examinationDate || 'TBA'})\n`;
      text += `- Official Notification: ${j.officialNotificationUrl}\n`;
      text += `- Official Application Portal: ${j.officialApplicationUrl}\n`;
      text += `- Summary: ${j.summaryDescription}\n\n`;
    });

    return text;
  }, [opportunities]);

  const generatedJsonData = useMemo(() => {
    return JSON.stringify(
      {
        portal: 'GovtJob AI',
        exportedAt: new Date().toISOString(),
        totalOpportunities: opportunities.length,
        opportunities,
      },
      null,
      2
    );
  }, [opportunities]);

  const handleCopyTrainingPrompt = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(generatedTrainingText);
      setIsCopiedTrainingPrompt(true);
      setTimeout(() => setIsCopiedTrainingPrompt(false), 2500);
    }
  };

  const handleCopyJsonData = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(generatedJsonData);
      setIsCopiedJson(true);
      setTimeout(() => setIsCopiedJson(false), 2500);
    }
  };

  const handleDownloadJson = () => {
    const blob = new Blob([generatedJsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `govtjob_ai_training_dataset_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSyncTrainingToN8n = async () => {
    setN8nSyncLoading(true);
    setN8nSyncResult(null);

    try {
      const targetUrl = n8nConfig.webhookUrl || 'https://krishnaveni-2008.app.n8n.cloud/webhook/80cc71d7-4ad5-42b7-aa1a-cf3e7d72f611/chat';
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'trainAgent',
          event: 'syncKnowledgeBase',
          webhookId: n8nConfig.webhookId,
          timestamp: new Date().toISOString(),
          chatInput: 'Training knowledge base update: sync all active portal opportunities',
          message: 'Training knowledge base update: sync all active portal opportunities',
          totalOpportunities: opportunities.length,
          trainingPrompt: generatedTrainingText,
          dataset: opportunities,
        }),
      });

      if (response.ok) {
        setN8nSyncResult({
          ok: true,
          message: `Successfully synchronized all ${opportunities.length} live vacancies and recruitment rules to your n8n workflow!`,
        });
      } else {
        setN8nSyncResult({
          ok: false,
          message: `n8n webhook received training payload (status ${response.status}). If using Chat Trigger, use the Copied Training Prompt in your LLM System Prompt.`,
        });
      }
    } catch (err: any) {
      setN8nSyncResult({
        ok: false,
        message: `Sync attempted: ${err.message}. You can copy the full dataset below directly into your n8n LLM agent node.`,
      });
    } finally {
      setN8nSyncLoading(false);
    }
  };

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
      // If n8n is enabled, route via /api/n8n/chat
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
        throw new Error('Failed to reach AI assistant');
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.answer || 'I am ready to help with any question about government jobs or internships.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source === 'n8n' ? 'n8n' : n8nConfig.isEnabled ? 'n8n' : 'gemini',
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

  const handleSelectJobQuery = (jobId: string) => {
    if (!jobId) return;
    const found = opportunities.find((j) => j.id === jobId);
    if (found) {
      handleSend(`Give me a complete official breakdown for ${found.title} (${found.organization}). Tell me the pay scale, total vacancies, age limits, relaxations, educational eligibility, mandatory certificates, and application deadline.`);
      setSelectedJobId('');
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: `Chat history cleared. I am connected via n8n \`[ID: ${n8nConfig.webhookId}]\` and trained on all **${opportunities.length} opportunities** currently hosted on this portal. What questions do you have?`,
        timestamp: 'Just now',
        source: n8nConfig.isEnabled ? 'n8n' : 'gemini',
      },
    ]);
  };

  // Render markdown text simply
  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      // Headings
      if (line.startsWith('#### ')) {
        return (
          <h5 key={idx} className="font-extrabold text-slate-900 text-xs mt-2.5 mb-1 text-blue-900">
            {line.replace('#### ', '')}
          </h5>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="font-extrabold text-slate-900 text-sm mt-3 mb-1.5 flex items-center gap-1.5">
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

      // Bullets
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
      .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[11px] font-semibold">$1</code>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 font-semibold underline hover:text-blue-800 inline-flex items-center gap-0.5">$1</a>');
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
            Trained on all active portal data: APPSC, APSLPRB, UPSC, SSC, Railways, CERT-In, NIC, and student internships.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Trained on {opportunities.length} Live Gazette Vacancies
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold font-mono text-[11px]">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              n8n: {n8nConfig.webhookId.slice(0, 8)}...
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => setIsTrainingModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            title="View, export and train AI Agent with all website data"
          >
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span>Train AI Agent / Website Data</span>
          </button>
          <button
            onClick={() => setIsN8nModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Configure n8n Webhook Workflow"
          >
            <Settings className="w-3.5 h-3.5 text-purple-300" /> n8n Settings
          </button>
          <button
            onClick={handleClearChat}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear History
          </button>
        </div>
      </div>

      {/* n8n Status & Integration Ribbon */}
      <div className="bg-gradient-to-r from-purple-900/10 via-indigo-900/10 to-blue-900/10 border border-purple-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
            <Zap className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">n8n Workflow Automation Agent</span>
              <span className="px-2 py-0.2 rounded-full bg-purple-100 text-purple-800 text-[10px] font-mono font-bold">
                ACTIVE
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-slate-500 mt-0.5">
              <span>Webhook ID:</span>
              <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-800 text-[11px] font-semibold">
                {n8nConfig.webhookId}
              </code>
              <button
                onClick={handleCopyWebhookId}
                className="text-slate-400 hover:text-slate-700 p-0.5"
                title="Copy Webhook ID"
              >
                {isCopiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <span className="text-slate-300 hidden sm:inline">|</span>
              <span className="text-[11px] text-purple-700 font-mono truncate max-w-[260px] hidden sm:inline" title={n8nConfig.webhookUrl}>
                {n8nConfig.webhookUrl || 'https://krishnaveni-2008.app.n8n.cloud/...'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setIsTrainingModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            title="Inspect trained knowledge base"
          >
            <Database className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden md:inline">Website Knowledge</span>
          </button>
          <button
            onClick={() =>
              updateN8nConfig({ isEnabled: !n8nConfig.isEnabled })
            }
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
              n8nConfig.isEnabled
                ? 'bg-purple-600 text-white shadow-sm hover:bg-purple-700'
                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{n8nConfig.isEnabled ? 'n8n Mode' : 'Core AI'}</span>
          </button>
          <button
            onClick={() => {
              setTempWebhookUrl(n8nConfig.webhookUrl);
              setTempWebhookId(n8nConfig.webhookId);
              setIsN8nModalOpen(true);
            }}
            className="p-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors"
            title="Configure n8n Webhook Endpoint"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Specific Job Selector Dropdown */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-700 font-semibold">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span>Ask AI about a specific vacancy in database:</span>
        </div>
        <select
          value={selectedJobId}
          onChange={(e) => handleSelectJobQuery(e.target.value)}
          className="w-full sm:w-auto flex-1 max-w-md bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
        >
          <option value="">-- Choose an opportunity to inspect --</option>
          {opportunities.map((j) => (
            <option key={j.id} value={j.id}>
              {j.title} ({j.organization})
            </option>
          ))}
        </select>
      </div>

      {/* Suggested Category Topic Chips */}
      <div>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
          Knowledge Base Topic Shortcuts
        </span>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_TOPICS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(item.query)}
              className="text-xs bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 px-3.5 py-2 rounded-xl border border-slate-200 transition-all text-left shadow-sm hover:shadow flex items-center gap-1.5 font-medium"
            >
              <span>{item.label}</span>
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
            const isN8n = msg.source === 'n8n';

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isBot ? '' : 'flex-row-reverse'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                    isBot
                      ? isN8n
                        ? 'bg-gradient-to-tr from-purple-700 via-indigo-600 to-amber-500 text-white'
                        : 'bg-gradient-to-tr from-blue-700 to-indigo-600 text-white'
                      : 'bg-slate-900 text-white'
                  }`}
                >
                  {isBot ? (
                    isN8n ? <Zap className="w-5 h-5 text-amber-300" /> : <Bot className="w-5 h-5" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed ${
                    isBot
                      ? 'bg-slate-50 border border-slate-200/90 text-slate-800'
                      : 'bg-blue-600 text-white font-medium rounded-tr-none'
                  }`}
                >
                  {/* Origin Badge */}
                  {isBot && (
                    <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-bold text-slate-500">
                      {isN8n ? (
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                          <Zap className="w-3 h-3 text-purple-600" /> n8n Workflow Agent ({n8nConfig.webhookId.slice(0, 8)})
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-blue-600" /> GovtJob AI Core Agent
                        </span>
                      )}
                    </div>
                  )}

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
              <div className="w-9 h-9 rounded-2xl bg-purple-600 text-white flex items-center justify-center">
                <Zap className="w-5 h-5 text-amber-300 animate-pulse" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-2 text-xs text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                <span>Running n8n workflow query [ID: {n8nConfig.webhookId}] & scanning gazette database...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Advisory footer */}
        <div className="px-6 py-2 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
            Connected to n8n Webhook: <code className="font-mono text-slate-600">{n8nConfig.webhookId}</code>
          </span>
          <span className="hidden sm:inline">Port 3000 • Verified Gazette Integration</span>
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
            placeholder={
              n8nConfig.isEnabled
                ? `Ask n8n agent (ID: ${n8nConfig.webhookId.slice(0, 8)}...) about APPSC, SSC, CERT-In, deadlines...`
                : 'Ask about APPSC, SSC, CERT-In, internships, age limits, syllabus...'
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`p-3 rounded-2xl text-white transition-colors shadow-md flex items-center justify-center shrink-0 disabled:opacity-50 ${
              n8nConfig.isEnabled ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* n8n Configuration & Verification Modal */}
      {isN8nModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 flex flex-col">
            {/* Header */}
            <div className="bg-slate-900 text-white p-6 relative">
              <button
                onClick={() => setIsN8nModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold uppercase tracking-wider mb-1">
                <Zap className="w-4 h-4 text-amber-400" /> n8n Workflow Configuration
              </div>
              <h3 className="text-lg font-bold text-white">
                Connect n8n AI Chatbot Workflow
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Your assigned n8n Webhook ID is registered and active in the chatbot engine.
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs text-slate-700">
              {/* Webhook ID Display & Edit */}
              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  n8n Webhook ID
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempWebhookId}
                    onChange={(e) => setTempWebhookId(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(tempWebhookId);
                        setIsCopiedId(true);
                        setTimeout(() => setIsCopiedId(false), 2000);
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1"
                  >
                    {isCopiedId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{isCopiedId ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Webhook URL Input */}
              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  n8n Instance Webhook URL
                </label>
                <input
                  type="url"
                  placeholder="https://krishnaveni-2008.app.n8n.cloud/webhook/80cc71d7-4ad5-42b7-aa1a-cf3e7d72f611/chat"
                  value={tempWebhookUrl}
                  onChange={(e) => setTempWebhookUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-purple-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Connected to n8n Cloud Webhook: <code className="text-purple-700 font-semibold font-mono">https://krishnaveni-2008.app.n8n.cloud/webhook/80cc71d7-4ad5-42b7-aa1a-cf3e7d72f611/chat</code>
                </span>
              </div>

              {/* Test Connection Button */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleTestN8n}
                  disabled={n8nTestLoading}
                  className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {n8nTestLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Zap className="w-3.5 h-3.5" />
                  )}
                  <span>Test n8n Webhook</span>
                </button>
                {n8nConfig.lastTestedAt && (
                  <span className="text-[11px] text-slate-400">
                    Last tested: {n8nConfig.lastTestedAt}
                  </span>
                )}
              </div>

              {/* Test Result Message */}
              {n8nTestResult && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                    n8nTestResult.ok
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}
                >
                  {n8nTestResult.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold block">
                      {n8nTestResult.ok ? 'Connection Verified' : 'Notice'}
                    </span>
                    <span>{n8nTestResult.message}</span>
                  </div>
                </div>
              )}

              {/* cURL & Payload Integration Guide */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <Code className="w-3.5 h-3.5 text-purple-600" />
                  How GovtJob AI routes to your n8n Node:
                </div>
                <pre className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[11px] overflow-x-auto">
{`POST https://krishnaveni-2008.app.n8n.cloud/webhook/80cc71d7-4ad5-42b7-aa1a-cf3e7d72f611/chat
Headers: { "Content-Type": "application/json", "X-N8N-Webhook-Id": "6172d2e9ccd14cd4926fb4d5a424bfd9" }
Body: {
  "chatInput": "Which AP jobs match my B.Tech?",
  "sessionId": "candidate-usr-student-ap-01",
  "candidateProfile": { "name": "...", "education": "..." },
  "websiteTrainingData": { "totalOpportunities": 22, "opportunities": [...] }
}`}
                </pre>
                <p className="text-[11px] text-slate-500">
                  GovtJob AI automatically injects all portal vacancies, user certificate details, and eligibility criteria into the n8n workflow request payload!
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsN8nModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveN8nModal}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Website Training Data & Knowledge Base Modal */}
      {isTrainingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-white flex items-center gap-2">
                    <span>Train My AI Agent with Website Data</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold">
                      {opportunities.length} Live Vacancies
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Complete knowledge base, gazette vacancies, reservation rules & certificate criteria from GovtJob AI
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTrainingModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Metrics Ribbon */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">AP State Jobs</span>
                <span className="font-extrabold text-slate-900 text-base">
                  {opportunities.filter((j) => j.category === 'andhra_pradesh').length}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Central Govt</span>
                <span className="font-extrabold text-slate-900 text-base">
                  {opportunities.filter((j) => j.category === 'central_govt').length}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Cybersecurity</span>
                <span className="font-extrabold text-slate-900 text-base">
                  {opportunities.filter((j) => j.isCybersecurity).length}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Internships</span>
                <span className="font-extrabold text-slate-900 text-base">
                  {opportunities.filter((j) => j.isInternship).length}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Women Priority</span>
                <span className="font-extrabold text-pink-600 text-base">
                  {opportunities.filter((j) => j.isWomenExclusive || j.isOpenToWomen).length}
                </span>
              </div>
            </div>

            {/* Actions Bar & Tab Controls */}
            <div className="px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-white">
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                <button
                  onClick={() => setActiveTrainingTab('prompt')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTrainingTab === 'prompt'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    Agent System Knowledge
                  </span>
                </button>
                <button
                  onClick={() => setActiveTrainingTab('json')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTrainingTab === 'json'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-purple-600" />
                    Raw JSON Dataset
                  </span>
                </button>
                <button
                  onClick={() => setActiveTrainingTab('stats')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTrainingTab === 'stats'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                    Quotas & Verification Matrix
                  </span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleSyncTrainingToN8n}
                  disabled={n8nSyncLoading}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                  title="Push complete portal dataset to your n8n workflow"
                >
                  {n8nSyncLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                  )}
                  <span>Sync to n8n Webhook</span>
                </button>

                <button
                  onClick={handleCopyTrainingPrompt}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center gap-1.5 transition-colors border border-slate-200"
                  title="Copy full prompt to paste into AI Studio / n8n / ChatGPT"
                >
                  {isCopiedTrainingPrompt ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopiedTrainingPrompt ? 'Prompt Copied!' : 'Copy Prompt'}</span>
                </button>

                <button
                  onClick={handleDownloadJson}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center gap-1.5 transition-colors border border-slate-200"
                  title="Download full JSON dataset"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <span>Download JSON</span>
                </button>
              </div>
            </div>

            {/* Sync Feedback Alert */}
            {n8nSyncResult && (
              <div
                className={`mx-6 mt-3 p-3 rounded-2xl border text-xs flex items-start gap-2.5 ${
                  n8nSyncResult.ok
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                {n8nSyncResult.ok ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <span className="font-bold block">
                    {n8nSyncResult.ok ? 'Training Knowledge Synchronized to n8n' : 'Sync Status'}
                  </span>
                  <span>{n8nSyncResult.message}</span>
                </div>
              </div>
            )}

            {/* Tab Contents */}
            <div className="flex-1 p-6 overflow-y-auto">
              {activeTrainingTab === 'prompt' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>
                      Copy and paste this markdown text into your <strong>n8n AI Agent System Prompt</strong>, LangChain memory, or custom LLM assistant:
                    </span>
                    <button
                      onClick={handleCopyTrainingPrompt}
                      className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                    >
                      {isCopiedTrainingPrompt ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopiedTrainingPrompt ? 'Copied' : 'Copy Full Text'}</span>
                    </button>
                  </div>
                  <pre className="bg-slate-900 text-slate-100 p-4 rounded-2xl font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-[460px] border border-slate-800">
                    {generatedTrainingText}
                  </pre>
                </div>
              )}

              {activeTrainingTab === 'json' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>
                      Structured JSON format containing all {opportunities.length} opportunities, qualification criteria, and application URLs:
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopyJsonData}
                        className="text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1"
                      >
                        {isCopiedJson ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopiedJson ? 'Copied' : 'Copy JSON'}</span>
                      </button>
                      <button
                        onClick={handleDownloadJson}
                        className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Save File</span>
                      </button>
                    </div>
                  </div>
                  <pre className="bg-slate-900 text-purple-200 p-4 rounded-2xl font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre max-h-[460px] border border-slate-800">
                    {generatedJsonData}
                  </pre>
                </div>
              )}

              {activeTrainingTab === 'stats' && (
                <div className="space-y-6 text-xs text-slate-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 space-y-2">
                      <h4 className="font-black text-amber-900 text-sm flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-amber-700" />
                        Andhra Pradesh Presidential Order (Local Quota)
                      </h4>
                      <p className="text-slate-600 leading-relaxed">
                        80% of direct recruitment vacancies in AP district/zonal cadres are legally reserved for Local Candidates. Candidates who studied for at least 4 consecutive years between Class 4 and 10 in an AP educational institution are treated as Local.
                      </p>
                      <div className="font-mono bg-white p-2 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                        Study Certificates from Class 4th to 10th or Tahsildar Nativity Certificate is mandatory.
                      </div>
                    </div>

                    <div className="bg-pink-50/60 border border-pink-200 rounded-2xl p-4 space-y-2">
                      <h4 className="font-black text-pink-900 text-sm flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-pink-700" />
                        Women Reservation & Fee Concessions
                      </h4>
                      <p className="text-slate-600 leading-relaxed">
                        Andhra Pradesh provides 33.33% horizontal reservation for women in all direct recruitment posts. Central recruitments (UPSC, SSC, RRB) grant 100% application fee exemption to all female candidates.
                      </p>
                      <div className="font-mono bg-white p-2 rounded-xl border border-pink-200 text-[11px] text-pink-900">
                        Exclusive roles: APSLPRB Mahila Police Battalion (1,420 posts), DST WOS Scheme (₹55,000/mo).
                      </div>
                    </div>

                    <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4 space-y-2">
                      <h4 className="font-black text-blue-900 text-sm flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-blue-700" />
                        Statutory Age Relaxations
                      </h4>
                      <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                        <li><strong>SC / ST</strong>: 5 years upper age relaxation across APPSC & Central Govt.</li>
                        <li><strong>BC / OBC-NCL</strong>: 3 to 5 years relaxation (Current FY certificate needed).</li>
                        <li><strong>PwD Candidates</strong>: 10 years upper age concession with valid UDID.</li>
                        <li><strong>Ex-Servicemen</strong>: 3 years addition over actual military tenure.</li>
                      </ul>
                    </div>

                    <div className="bg-purple-50/60 border border-purple-200 rounded-2xl p-4 space-y-2">
                      <h4 className="font-black text-purple-900 text-sm flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-purple-700" />
                        Document Verification Readiness Matrix
                      </h4>
                      <p className="text-slate-600 leading-relaxed">
                        Before attending physical certificate scrutiny, candidates must possess:
                      </p>
                      <div className="font-mono bg-white p-2 rounded-xl border border-purple-200 text-[11px] text-purple-900 space-y-0.5">
                        <div>1. 10th SSC Memo (DOB Proof)</div>
                        <div>2. 12th / Intermediate Certificate</div>
                        <div>3. Degree / Consolidated Semester Memos</div>
                        <div>4. Caste / EWS Certificate (Current FY)</div>
                        <div>5. Study / Residence Certificates (4th - 10th)</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">
                API Endpoint: <code className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-800">GET /api/training-data</code>
              </span>
              <button
                type="button"
                onClick={() => setIsTrainingModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
