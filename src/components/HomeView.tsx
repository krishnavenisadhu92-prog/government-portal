import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { JobCard } from './JobCard';
import {
  ShieldCheck,
  Search,
  Sparkles,
  Building2,
  FileCheck2,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Lock,
  GraduationCap,
  Users,
  ShieldAlert,
  ChevronRight,
  Award,
  Zap,
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const {
    opportunities,
    setActiveTab,
    setSelectedJobForDetail,
    setSelectedJobForEligibility,
    setIsProfileWizardOpen,
  } = useApp();

  const [heroSearch, setHeroSearch] = useState('');

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveTab('search');
  };

  // Highlights across domains
  const apJobs = opportunities.filter((j) => j.category === 'andhra_pradesh').slice(0, 3);
  const centralJobs = opportunities.filter((j) => j.category === 'central_govt').slice(0, 3);
  const cyberJobs = opportunities.filter((j) => j.isCybersecurity).slice(0, 3);
  const internshipJobs = opportunities.filter((j) => j.isInternship).slice(0, 3);
  const womenJobs = opportunities.filter((j) => j.isWomenExclusive || j.isOpenToWomen).slice(0, 3);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Decorative background glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-xs font-semibold text-amber-300 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Official Recruitment Discovery & Document Intelligence Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Discover Government Jobs & Internships Across{' '}
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 bg-clip-text text-transparent">
              Andhra Pradesh & India
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Match your real degree, certificates, and category relaxations with verified APPSC, UPSC, SSC, CERT-In, and AICTE government opportunities.
          </p>

          {/* Hero Search Box */}
          <form
            onSubmit={handleHeroSearchSubmit}
            className="max-w-2xl mx-auto bg-slate-800/90 p-2 sm:p-2.5 rounded-2xl border border-slate-700/80 shadow-2xl flex flex-col sm:flex-row gap-2 backdrop-blur-md"
          >
            <div className="relative flex-1 flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5" />
              <input
                type="text"
                placeholder="Search jobs, APPSC Group 1, CERT-In, student internships..."
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                className="w-full bg-transparent pl-11 pr-4 py-3 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md transition-colors whitespace-nowrap flex items-center justify-center gap-2"
            >
              <span>Explore Vacancies</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Category Jump Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs font-medium">
            <button
              onClick={() => setActiveTab('assistant')}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-800 to-indigo-800 hover:from-purple-700 hover:to-indigo-700 border border-purple-400/50 text-amber-300 font-bold transition-all flex items-center gap-1.5 shadow-sm hover:scale-105"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              🤖 Ask AI Chatbot (n8n Powered)
            </button>
            <button
              onClick={() => setActiveTab('ap-jobs')}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 text-slate-200 transition-colors flex items-center gap-1.5"
            >
              🏛️ Andhra Pradesh (APPSC)
            </button>
            <button
              onClick={() => setActiveTab('central-jobs')}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 text-slate-200 transition-colors flex items-center gap-1.5"
            >
              🇮🇳 Central Govt (UPSC / SSC)
            </button>
            <button
              onClick={() => setActiveTab('cybersecurity')}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 text-slate-200 transition-colors flex items-center gap-1.5"
            >
              🛡️ Cybersecurity & IT (CERT-In)
            </button>
            <button
              onClick={() => setActiveTab('internships')}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 text-slate-200 transition-colors flex items-center gap-1.5"
            >
              🎓 Student Internships (AICTE)
            </button>
            <button
              onClick={() => setActiveTab('women')}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 text-slate-200 transition-colors flex items-center gap-1.5"
            >
              👩‍💼 Women Exclusive Openings
            </button>
          </div>
        </div>
      </section>

      {/* Trust & Stats Metric Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900">32,000+</span>
            <span className="block text-xs font-semibold text-slate-500 mt-0.5">Verified Public Vacancies</span>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-blue-600">100% Official</span>
            <span className="block text-xs font-semibold text-slate-500 mt-0.5">Gazettes & Commission Feeds</span>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-amber-500">Document AI</span>
            <span className="block text-xs font-semibold text-slate-500 mt-0.5">Automated OCR Extraction</span>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600">Zero Public Storage</span>
            <span className="block text-xs font-semibold text-slate-500 mt-0.5">Private Encrypted Vault</span>
          </div>
        </div>
      </div>

      {/* Primary Category Grid Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Explore Government Recruitment Portals
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Categorized directories directly referencing official state and national employment gazettes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: AP Jobs */}
          <div
            onClick={() => setActiveTab('ap-jobs')}
            className="p-6 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 hover:shadow-xl transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform shadow-md">
              🏛️
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-amber-700 transition-colors">
              Andhra Pradesh Government
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              APPSC Group 1, Group 2, AP Police (APSLPRB), AP DSC School Teachers, and AP State Cyber Security Operations Centre.
            </p>
            <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
              Browse AP Openings <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Card 2: Central Govt */}
          <div
            onClick={() => setActiveTab('central-jobs')}
            className="p-6 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 hover:shadow-xl transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform shadow-md">
              🇮🇳
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-700 transition-colors">
              Central Government & PSUs
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              UPSC Civil Services, Staff Selection Commission (SSC CGL/CHSL), Railway Recruitment Boards, and Public Sector Banks.
            </p>
            <span className="text-xs font-bold text-blue-700 flex items-center gap-1">
              Browse Central Openings <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Card 3: Cybersecurity */}
          <div
            onClick={() => setActiveTab('cybersecurity')}
            className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 hover:shadow-xl transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform shadow-md">
              🛡️
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-emerald-700 transition-colors">
              Cybersecurity & Govt IT
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              CERT-In, NCIIPC, NIC, I4C (Ministry of Home Affairs), digital forensics, SOC analysts, and private sector cyber roles.
            </p>
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              Explore Cyber Roles <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Card 4: Internships */}
          <div
            onClick={() => setActiveTab('internships')}
            className="p-6 rounded-3xl bg-gradient-to-br from-cyan-50 to-sky-50 border border-cyan-200/80 hover:shadow-xl transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-cyan-600 text-white flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform shadow-md">
              🎓
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-cyan-700 transition-colors">
              Internships & Fellowships
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Government internships for 1st to final-year students, NITI Aayog, MEA, paid CERT-In research, and AICTE credits.
            </p>
            <span className="text-xs font-bold text-cyan-700 flex items-center gap-1">
              Find Internships <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Card 5: Opportunities for Women */}
          <div
            onClick={() => setActiveTab('women')}
            className="p-6 rounded-3xl bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200/80 hover:shadow-xl transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-pink-600 text-white flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform shadow-md">
              👩‍💼
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-pink-700 transition-colors">
              Opportunities for Women
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              APSLPRB Mahila Police Battalions, DST Women Scientist Fellowships (WOS), CRPF, and 100% exam fee exemptions.
            </p>
            <span className="text-xs font-bold text-pink-700 flex items-center gap-1">
              View Women Opportunities <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Card 6: Document Vault & OCR */}
          <div
            onClick={() => setActiveTab('certificates')}
            className="p-6 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 hover:shadow-xl transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform shadow-md">
              <FileCheck2 className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-700 transition-colors">
              Document Intelligence Studio
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Upload 10th, 12th, degree, and caste certificates. AI extracts details for automated verification and checks expiry.
            </p>
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
              Open Document Vault <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </section>

      {/* Featured Section 1: Andhra Pradesh Government Jobs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Andhra Pradesh Government Recruitment
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified openings from APPSC, APSLPRB Police, State CSOC, and District Authorities.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('ap-jobs')}
            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 self-start sm:self-center"
          >
            View all AP vacancies <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onViewDetails={setSelectedJobForDetail}
              onCheckEligibility={setSelectedJobForEligibility}
            />
          ))}
        </div>
      </section>

      {/* Featured Section 2: Central Government Jobs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Central Government & Public Sector Cadres
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              UPSC, Staff Selection Commission (SSC CGL), Indian Railways (RRB), and Banking (IBPS / SBI).
            </p>
          </div>
          <button
            onClick={() => setActiveTab('central-jobs')}
            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 self-start sm:self-center"
          >
            View all Central vacancies <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {centralJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onViewDetails={setSelectedJobForDetail}
              onCheckEligibility={setSelectedJobForEligibility}
            />
          ))}
        </div>
      </section>

      {/* Call To Action Banner: Check Eligibility & Upload */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl relative z-10">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> AI-Powered Accuracy
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Wondering if you qualify for APPSC Group 1, CERT-In, or SSC?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Upload your marks memos and certificates once. Our matching engine verifies your age limits (with applicable category relaxations), educational branch, and local candidate quota.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10 shrink-0">
            <button
              onClick={() => setActiveTab('certificates')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-lg transition-colors flex items-center justify-center gap-2"
            >
              <FileCheck2 className="w-4 h-4" /> Upload Certificates
            </button>
            <button
              onClick={() => setActiveTab('assistant')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400" /> Ask AI Assistant
            </button>
          </div>
        </div>
      </section>

      {/* Featured Section 3: Cybersecurity & IT Careers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Cybersecurity & Government IT Careers
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Defend national cyber infrastructure at CERT-In, NIC, I4C, and State CSOCs.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('cybersecurity')}
            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 self-start sm:self-center"
          >
            View all cyber roles <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cyberJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onViewDetails={setSelectedJobForDetail}
              onCheckEligibility={setSelectedJobForEligibility}
            />
          ))}
        </div>
      </section>

      {/* Featured Section 4: Internships & Opportunities for Women */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Student Internships & Opportunities for Women
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Government internships accepting college students, and exclusive schemes empowering women candidates.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('internships')}
            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 self-start sm:self-center"
          >
            View all internships & schemes <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...internshipJobs.slice(0, 2), ...womenJobs.slice(0, 1)].map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onViewDetails={setSelectedJobForDetail}
              onCheckEligibility={setSelectedJobForEligibility}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
