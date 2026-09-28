import React from 'react';
import { ShieldCheck, ExternalLink, Heart, AlertCircle, Lock, BookOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const { setActiveTab } = useApp();

  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: About & Mission */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                GovtJob <span className="text-amber-400">AI</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              India’s unified, AI-powered public sector career and student internship gateway. Helping candidates in Andhra Pradesh and across India match authentic opportunities with confirmed credentials.
            </p>
            <div className="mt-4 flex items-center gap-2 text-[11px] text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>100% Sourced from Official Gazettes & Portals</span>
            </div>
          </div>

          {/* Col 2: Official Portals Directory */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">
              Official Recruitment Portals
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://psc.ap.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3 h-3 text-slate-500" /> APPSC (Andhra Pradesh)
                </a>
              </li>
              <li>
                <a
                  href="https://slprb.ap.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3 h-3 text-slate-500" /> AP State Police (APSLPRB)
                </a>
              </li>
              <li>
                <a
                  href="https://upsc.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3 h-3 text-slate-500" /> UPSC (Union Public Service)
                </a>
              </li>
              <li>
                <a
                  href="https://ssc.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3 h-3 text-slate-500" /> Staff Selection Commission
                </a>
              </li>
              <li>
                <a
                  href="https://www.cert-in.org.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3 h-3 text-slate-500" /> CERT-In (Cyber Security)
                </a>
              </li>
              <li>
                <a
                  href="https://internship.aicte-india.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3 h-3 text-slate-500" /> AICTE Internship Portal
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Navigation */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">
              Career Categories
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setActiveTab('ap-jobs')}
                  className="hover:text-white transition-colors"
                >
                  Andhra Pradesh State Jobs
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('central-jobs')}
                  className="hover:text-white transition-colors"
                >
                  Central Ministries & PSUs
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('cybersecurity')}
                  className="hover:text-white transition-colors"
                >
                  Cybersecurity & IT Careers
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('internships')}
                  className="hover:text-white transition-colors"
                >
                  Student Internships & Apprenticeships
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('women')}
                  className="hover:text-white transition-colors"
                >
                  Opportunities for Women
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('certificates')}
                  className="hover:text-white transition-colors"
                >
                  Document Intelligence Vault
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust, Disclaimers & Ethics */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">
              Legal & Verification Policy
            </h4>
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-[11px] leading-relaxed text-slate-400 space-y-2">
              <div className="flex items-start gap-1.5 text-amber-400 font-medium">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>Non-Affiliation Advisory</span>
              </div>
              <p>
                GovtJob AI provides informational aggregation and AI-assisted eligibility verification. We are not an official government commission. Always verify with official gazette PDFs before submitting fee.
              </p>
              <div className="flex items-center gap-1.5 text-slate-300 pt-1 border-t border-slate-800">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>Zero Public Storage of Uploaded Certificates</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} GovtJob AI Portal. Built for students & job seekers in India.
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => setActiveTab('settings')} className="hover:text-slate-300">
              Privacy & Data Retention
            </button>
            <span>•</span>
            <button onClick={() => setActiveTab('settings')} className="hover:text-slate-300">
              Terms of Use
            </button>
            <span>•</span>
            <button onClick={() => setActiveTab('assistant')} className="hover:text-slate-300">
              Ask AI Career Assistant
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
