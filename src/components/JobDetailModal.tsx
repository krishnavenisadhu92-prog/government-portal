import React, { useState } from 'react';
import { JobOpportunity, ApplicationTrackingStatus } from '../types';
import { useApp } from '../context/AppContext';
import {
  X,
  Building2,
  Calendar,
  MapPin,
  ExternalLink,
  Sparkles,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  Clock,
  GraduationCap,
  Banknote,
  FileText,
  ShieldCheck,
  Award,
  Users,
  FileCheck2,
  Share2,
} from 'lucide-react';

interface JobDetailModalProps {
  job: JobOpportunity | null;
  onClose: () => void;
  onCheckEligibility: (job: JobOpportunity) => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({ job, onClose, onCheckEligibility }) => {
  const { savedJobIds, toggleSaveJob, trackedApplications, updateTrackingStatus } = useApp();

  if (!job) return null;

  const isSaved = savedJobIds.includes(job.id);
  const currentTracking = trackedApplications.find((t) => t.jobId === job.id);
  const [trackingStatus, setTrackingStatus] = useState<ApplicationTrackingStatus>(
    currentTracking?.status || 'Saved'
  );
  const [trackingNotes, setTrackingNotes] = useState(currentTracking?.notes || '');
  const [refNumber, setRefNumber] = useState(currentTracking?.applicationRefNumber || '');
  const [isCopied, setIsCopied] = useState(false);

  const handleStatusChange = (newStatus: ApplicationTrackingStatus) => {
    setTrackingStatus(newStatus);
    updateTrackingStatus(job.id, newStatus, trackingNotes, refNumber);
  };

  const handleNotesBlur = () => {
    updateTrackingStatus(job.id, trackingStatus, trackingNotes, refNumber);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `GovtJob AI: ${job.title} at ${job.organization}. Closes on ${job.applicationDeadline}. Check eligibility & official apply link: ${window.location.origin}`
      );
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Top Header Banner */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              {job.subcategory}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-blue-400" /> {job.sourceVerificationStatus}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Notif: {job.notificationNumber}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
            {job.title}
          </h2>
          <p className="text-sm text-slate-300 mt-1 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span>{job.organization}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">{job.department}</span>
          </p>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block">Pay Scale / Stipend</span>
              <span className="font-bold text-emerald-400 text-sm mt-0.5 block truncate">
                {job.payScaleOrStipend}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Total Vacancies</span>
              <span className="font-bold text-white text-sm mt-0.5 block">
                {job.vacanciesCount > 0 ? `${job.vacanciesCount.toLocaleString()} Posts` : 'Open Quota'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Location & Mode</span>
              <span className="font-bold text-white text-sm mt-0.5 block truncate">
                {job.location} ({job.workMode})
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Application Deadline</span>
              <span className="font-bold text-amber-400 text-sm mt-0.5 block">
                {job.applicationDeadline}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-slate-700 text-sm">
          {/* Action CTAs: Check Eligibility & Track */}
          <div className="bg-gradient-to-r from-blue-50 to-amber-50 rounded-2xl p-4 sm:p-5 border border-blue-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                AI-Powered Eligibility Evaluation
              </h4>
              <p className="text-xs text-slate-600 mt-1 max-w-xl">
                Compare your confirmed certificates, educational stream, age relaxations, and AP/Central reservation eligibility in real-time.
              </p>
            </div>
            <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
              <button
                onClick={() => onCheckEligibility(job)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Check My Eligibility
              </button>
              <button
                onClick={() => toggleSaveJob(job.id)}
                className={`p-2.5 rounded-xl border transition-colors ${
                  isSaved
                    ? 'bg-amber-100 border-amber-300 text-amber-700'
                    : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
                title={isSaved ? 'Saved to bookmarks' : 'Save opportunity'}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-2.5 rounded-xl bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors"
                title="Share link"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          {isCopied && (
            <div className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 text-center animate-fade-in">
              Opportunity details copied to clipboard!
            </div>
          )}

          {/* Section 1: Overview & Summary */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-2 text-slate-500">
              Recruitment Overview
            </h4>
            <p className="text-slate-700 leading-relaxed">{job.summaryDescription}</p>

            {job.keyResponsibilities && job.keyResponsibilities.length > 0 && (
              <div className="mt-3">
                <span className="font-semibold text-xs text-slate-900 block mb-1.5">
                  Core Responsibilities:
                </span>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-600">
                  {job.keyResponsibilities.map((resp, i) => (
                    <li key={i}>{resp}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Section 2: Educational Qualification & Eligible Branches */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="font-bold text-xs text-slate-900 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-blue-600" /> Prescribed Qualifications
              </span>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {job.educationalQualifications.map((q, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
              {job.minimumPercentageOrCgpa && (
                <div className="mt-3 pt-2 border-t border-slate-200 text-xs text-slate-600">
                  Minimum Qualifying Score: <span className="font-semibold">{job.minimumPercentageOrCgpa}% / equivalent CGPA</span>
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="font-bold text-xs text-slate-900 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600" /> Eligible Streams & Branches
              </span>
              <div className="flex flex-wrap gap-1.5">
                {job.eligibleBranches.map((b, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md text-xs bg-white text-slate-800 border border-slate-200 font-medium"
                  >
                    {b}
                  </span>
                ))}
              </div>

              {job.technicalSkillsRequired && job.technicalSkillsRequired.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">
                    Key Technical Competencies:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {job.technicalSkillsRequired.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Age Limit, Relaxations & Quotas */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="font-bold text-xs text-slate-900 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-purple-600" /> Age Limits & Category Relaxations
            </span>
            <div className="text-xs space-y-1.5">
              <p>
                <span className="font-semibold text-slate-900">Standard Age Bracket: </span>
                <span className="text-slate-800">{job.ageLimit.min} to {job.ageLimit.max} Years (as on publication date)</span>
              </p>
              <p className="text-slate-700">
                <span className="font-semibold text-slate-900">Relaxation Provisions: </span>
                {job.ageLimit.relaxationDetails}
              </p>
              {job.quotaAndRelaxationNotes && (
                <p className="text-slate-700 pt-1 border-t border-slate-200">
                  <span className="font-semibold text-slate-900">Reservation & Quota Rules: </span>
                  {job.quotaAndRelaxationNotes}
                </p>
              )}
            </div>
          </div>

          {/* Section 4: Selection Process & Required Documents */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-xl p-4">
              <span className="font-bold text-xs text-slate-900 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600" /> Selection Stages
              </span>
              <ol className="list-decimal list-inside space-y-1 text-xs text-slate-700">
                {job.selectionProcess.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
              {job.examinationDate && (
                <div className="mt-3 pt-2 border-t border-slate-100 text-xs text-amber-700 font-medium">
                  Tentative Exam Date: {job.examinationDate}
                </div>
              )}
            </div>

            <div className="border border-slate-200 rounded-xl p-4">
              <span className="font-bold text-xs text-slate-900 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-amber-600" /> Mandatory Certificates Required
              </span>
              <ul className="space-y-1 text-xs text-slate-700">
                {job.requiredCertificates.map((cert, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span>{cert}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section 5: Application Tracking Quick-Update */}
          <div className="bg-slate-900 text-white rounded-2xl p-5">
            <h4 className="font-bold text-sm text-white mb-2 flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-amber-400" /> Application Pipeline Tracker
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Track your stage for this recruitment. Notes and reference numbers are stored securely in your dashboard.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Status</label>
                <select
                  value={trackingStatus}
                  onChange={(e) => handleStatusChange(e.target.value as ApplicationTrackingStatus)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Saved">Saved</option>
                  <option value="Planning to Apply">Planning to Apply</option>
                  <option value="Applied">Applied</option>
                  <option value="Exam Scheduled">Exam Scheduled</option>
                  <option value="Result Published">Result Published</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Application Ref / Roll No.</label>
                <input
                  type="text"
                  placeholder="e.g. APPSC-2026-94812"
                  value={refNumber}
                  onChange={(e) => setRefNumber(e.target.value)}
                  onBlur={handleNotesBlur}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Personal Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Read GS Paper 1 syllabus"
                  value={trackingNotes}
                  onChange={(e) => setTrackingNotes(e.target.value)}
                  onBlur={handleNotesBlur}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Sticky Footer with Official Links */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Last verified against gazette: {job.lastVerifiedDate}</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <a
              href={job.officialNotificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" /> Official PDF
            </a>
            <a
              href={job.officialApplicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Apply on Official Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
