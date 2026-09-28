import React from 'react';
import { JobOpportunity } from '../types';
import { useApp } from '../context/AppContext';
import {
  Building2,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  GraduationCap,
  Banknote,
  Users,
} from 'lucide-react';

interface JobCardProps {
  job: JobOpportunity;
  onViewDetails?: (job: JobOpportunity) => void;
  onCheckEligibility?: (job: JobOpportunity) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onViewDetails, onCheckEligibility }) => {
  const { savedJobIds, toggleSaveJob, setSelectedJobForDetail, setSelectedJobForEligibility, user } = useApp();

  const isSaved = savedJobIds.includes(job.id);

  // Calculate days remaining to deadline
  const today = new Date('2026-09-28');
  const deadline = new Date(job.applicationDeadline);
  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isExpiringSoon = diffDays > 0 && diffDays <= 15;
  const isExpired = diffDays <= 0;

  const handleDetailsClick = () => {
    if (onViewDetails) {
      onViewDetails(job);
    } else {
      setSelectedJobForDetail(job);
    }
  };

  const handleEligibilityClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCheckEligibility) {
      onCheckEligibility(job);
    } else {
      setSelectedJobForEligibility(job);
    }
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSaveJob(job.id);
  };

  return (
    <div
      onClick={handleDetailsClick}
      className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400/80 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer"
    >
      {/* Category accent bar */}
      <div
        className={`h-1.5 w-full ${
          job.category === 'andhra_pradesh'
            ? 'bg-gradient-to-r from-amber-500 to-orange-500'
            : job.category === 'cybersecurity'
            ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
            : job.category === 'women_exclusive'
            ? 'bg-gradient-to-r from-pink-500 to-purple-500'
            : job.category === 'internship'
            ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600'
        }`}
      />

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Header row: Organization & Badges */}
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div className="flex-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{job.organization}</span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-200 font-mono">
                  {job.subcategory}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2 leading-snug">
                {job.title}
              </h3>
            </div>

            {/* Bookmark button */}
            <button
              onClick={handleSaveClick}
              className={`p-2 rounded-xl transition-colors shrink-0 ${
                isSaved
                  ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                  : 'bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
              title={isSaved ? 'Remove from saved' : 'Save opportunity'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>
          </div>

          {/* Feature Badges: Cyber, Women, Internship, Verification */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[11px]">
            {job.isCybersecurity && (
              <span className="px-2 py-0.5 rounded-md font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-emerald-600" /> Cybersecurity
              </span>
            )}
            {job.isWomenExclusive && (
              <span className="px-2 py-0.5 rounded-md font-medium bg-pink-50 text-pink-700 border border-pink-200 flex items-center gap-1">
                <Users className="w-3 h-3 text-pink-600" /> Women Exclusive
              </span>
            )}
            {job.isInternship && (
              <span className="px-2 py-0.5 rounded-md font-medium bg-cyan-50 text-cyan-700 border border-cyan-200 flex items-center gap-1">
                <GraduationCap className="w-3 h-3 text-cyan-600" /> Student Friendly
              </span>
            )}
            {job.sourceVerificationStatus === 'Verified Official' && (
              <span className="px-2 py-0.5 rounded-md font-medium bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-blue-600" /> Official Gazette
              </span>
            )}
            {job.vacanciesCount > 0 && (
              <span className="px-2 py-0.5 rounded-md font-medium bg-slate-100 text-slate-700 border border-slate-200">
                {job.vacanciesCount.toLocaleString()} Vacancies
              </span>
            )}
          </div>

          {/* Key metadata grid */}
          <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/80 rounded-xl p-3 border border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <Banknote className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="font-semibold text-slate-900 truncate">{job.payScaleOrStipend}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{job.location}</span>
              <span className="text-[10px] text-slate-400 font-mono">({job.workMode})</span>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">
                {job.educationalQualifications[0] || 'Degree / Diploma required'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer actions: Deadline & Buttons */}
        <div>
          <div className="flex items-center justify-between text-xs mb-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500">Closes:</span>
              <span className="font-medium text-slate-800">{job.applicationDeadline}</span>
            </div>

            {/* Countdown pill */}
            {isExpired ? (
              <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                Closed
              </span>
            ) : isExpiringSoon ? (
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1 animate-pulse">
                <Clock className="w-3 h-3" /> {diffDays} days left
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {diffDays} days left
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleEligibilityClick}
              className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Check Eligibility</span>
            </button>
            <button
              onClick={handleDetailsClick}
              className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-medium text-xs transition-all flex items-center justify-center gap-1"
            >
              <span>View Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
