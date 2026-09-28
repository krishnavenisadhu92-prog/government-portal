import React from 'react';
import { useApp } from '../context/AppContext';
import { JobCard } from './JobCard';
import {
  Sparkles,
  Calendar,
  AlertTriangle,
  FileCheck2,
  Bookmark,
  ChevronRight,
  TrendingUp,
  Clock,
  ShieldAlert,
  GraduationCap,
  Users,
  CheckCircle2,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    user,
    opportunities,
    certificates,
    savedJobIds,
    trackedApplications,
    setActiveTab,
    setIsProfileWizardOpen,
    setSelectedJobForDetail,
    setSelectedJobForEligibility,
  } = useApp();

  // Recommendations: matches user's education/branch
  const userBranch = (user?.currentDegreeAndBranch || '').toLowerCase();
  const recommendedJobs = opportunities.filter((j) => {
    return j.eligibleBranches.some(
      (b) =>
        b.toLowerCase().includes('all') ||
        b.toLowerCase().includes('any') ||
        userBranch.includes(b.toLowerCase()) ||
        b.toLowerCase().includes(userBranch)
    );
  }).slice(0, 3);

  // Recommended Internships
  const recommendedInternships = opportunities.filter((j) => j.isInternship).slice(0, 3);

  // Upcoming Deadlines (within next 30 days)
  const upcomingDeadlines = [...opportunities]
    .sort((a, b) => new Date(a.applicationDeadline).getTime() - new Date(b.applicationDeadline).getTime())
    .slice(0, 4);

  // Saved Jobs
  const savedJobs = opportunities.filter((j) => savedJobIds.includes(j.id));

  // Readiness Calculation
  const has10th = certificates.some((c) => c.category === '10th Marksheet / DOB');
  const has12th = certificates.some((c) => c.category === '12th Marksheet');
  const hasDegree = certificates.some(
    (c) =>
      c.category === 'Degree Certificate' ||
      c.category === 'Semester Marks Memo' ||
      c.category === 'Provisional Degree'
  );
  const hasCategoryCert = certificates.some((c) => c.category === 'Caste / Category Certificate' || c.category === 'EWS Certificate');

  let readinessScore = 40;
  if (has10th) readinessScore += 15;
  if (has12th) readinessScore += 15;
  if (hasDegree) readinessScore += 20;
  if (hasCategoryCert) readinessScore += 10;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs tracking-wider uppercase">
            <Sparkles className="w-4 h-4" /> Personalized Career Command Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Welcome back, {user ? user.fullName : 'Aspirant'}! 🇮🇳
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Your candidate profile is configured for <strong className="text-white">{user?.educationLevel} ({user?.currentDegreeAndBranch})</strong>, residing in <strong className="text-white">{user?.district}, {user?.state}</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
            <button
              onClick={() => setIsProfileWizardOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
            >
              Edit Career Profile
            </button>
            <button
              onClick={() => setActiveTab('certificates')}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold transition-colors border border-slate-700"
            >
              Manage Documents ({certificates.length})
            </button>
          </div>
        </div>

        {/* Readiness Meter Card */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shrink-0 w-full md:w-72">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-300">Document Readiness</span>
            <span className="font-bold text-amber-400 font-mono">{readinessScore}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden mb-3">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                readinessScore >= 80 ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
              style={{ width: `${readinessScore}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            {readinessScore >= 80
              ? 'Your essential documents are confirmed in the vault. Ready for quick eligibility analysis.'
              : 'Upload missing caste/degree certificates to maximize your verification confidence.'}
          </p>
        </div>
      </div>

      {/* Quick Metrics Ticker */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('dashboard')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-blue-300 transition-colors"
        >
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Tracked Applications
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1 flex items-center justify-between">
            <span>{trackedApplications.length}</span>
            <Bookmark className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        <div
          onClick={() => setActiveTab('certificates')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-blue-300 transition-colors"
        >
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Vault Certificates
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1 flex items-center justify-between">
            <span>{certificates.length}</span>
            <FileCheck2 className="w-5 h-5 text-amber-600" />
          </div>
        </div>

        <div
          onClick={() => setActiveTab('ap-jobs')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-blue-300 transition-colors"
        >
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            AP State Vacancies
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1 flex items-center justify-between">
            <span>
              {opportunities.filter((j) => j.category === 'andhra_pradesh').length}
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        <div
          onClick={() => setActiveTab('cybersecurity')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-blue-300 transition-colors"
        >
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Cyber & IT Openings
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1 flex items-center justify-between">
            <span>{opportunities.filter((j) => j.isCybersecurity).length}</span>
            <ShieldAlert className="w-5 h-5 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Recommended for You Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Recommended for Your Qualifications
            </h2>
            <p className="text-xs text-slate-500">
              Curated based on your degree ({user?.currentDegreeAndBranch}) and preference criteria.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('search')}
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
          >
            Explore all <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onViewDetails={setSelectedJobForDetail}
              onCheckEligibility={setSelectedJobForEligibility}
            />
          ))}
        </div>
      </div>

      {/* Upcoming Application Deadlines Strip */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-base text-slate-900">Upcoming Application Deadlines</h3>
          </div>
          <span className="text-xs text-slate-400">Do not miss these closing windows</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {upcomingDeadlines.map((job) => (
            <div
              key={job.id}
              onClick={() => setSelectedJobForDetail(job)}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 cursor-pointer transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block truncate">
                  {job.organization}
                </span>
                <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-2">
                  {job.title}
                </h4>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Closes:</span>
                <span className="font-bold text-rose-600 font-mono">{job.applicationDeadline}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Internships for Students */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              Student Internships & Fellowships
            </h2>
            <p className="text-xs text-slate-500">
              Government and verified industry student opportunities with stipends and academic credits.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('internships')}
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
          >
            View all internships <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedInternships.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onViewDetails={setSelectedJobForDetail}
              onCheckEligibility={setSelectedJobForEligibility}
            />
          ))}
        </div>
      </div>

      {/* Learning & Preparation Resources Guide */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs tracking-wider uppercase">
            <BookOpen className="w-4 h-4" /> Exam Preparation & Syllabi
          </div>
          <h3 className="text-xl font-bold text-white">
            Need Guidance on Syllabus, Books, or Previous Year Papers?
          </h3>
          <p className="text-xs text-slate-300 max-w-xl">
            Ask our AI Career Assistant for APPSC Group 1 syllabus breakdowns, SSC CGL Tier-1 strategies, or cybersecurity CTF practice platforms.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('assistant')}
          className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-lg transition-colors flex items-center gap-2 shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Launch AI Assistant</span>
        </button>
      </div>
    </div>
  );
};
