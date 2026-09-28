import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ApplicationTrackingStatus, JobOpportunity } from '../types';
import {
  Bookmark,
  Calendar,
  Building2,
  ExternalLink,
  ChevronRight,
  Clock,
  CheckCircle2,
  FileText,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

const STATUS_COLUMNS: { status: ApplicationTrackingStatus; label: string; color: string }[] = [
  { status: 'Saved', label: 'Saved', color: 'border-slate-300 text-slate-700 bg-slate-100' },
  { status: 'Planning to Apply', label: 'Planning to Apply', color: 'border-amber-300 text-amber-700 bg-amber-50' },
  { status: 'Applied', label: 'Applied', color: 'border-blue-300 text-blue-700 bg-blue-50' },
  { status: 'Exam Scheduled', label: 'Exam Scheduled', color: 'border-purple-300 text-purple-700 bg-purple-50' },
  { status: 'Result Published', label: 'Result Published', color: 'border-emerald-300 text-emerald-700 bg-emerald-50' },
  { status: 'Closed', label: 'Closed', color: 'border-gray-200 text-gray-500 bg-gray-50' },
];

export const ApplicationTracker: React.FC = () => {
  const {
    trackedApplications,
    opportunities,
    updateTrackingStatus,
    setSelectedJobForDetail,
    setSelectedJobForEligibility,
    setActiveTab,
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredRecords = trackedApplications.filter((rec) => {
    if (filterStatus === 'all') return true;
    return rec.status === filterStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 text-amber-400 font-semibold text-xs tracking-wider uppercase">
            <Bookmark className="w-4 h-4" /> Personal Career Pipeline
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Application Status Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Keep track of every government examination, deadline, roll number, and interview date in one place.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('search')}
          className="self-start sm:self-center px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-colors flex items-center gap-1.5"
        >
          <span>Find More Vacancies</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Status Counters Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {STATUS_COLUMNS.map((col) => {
          const count = trackedApplications.filter((t) => t.status === col.status).length;
          const isSelected = filterStatus === col.status;
          return (
            <button
              key={col.status}
              onClick={() => setFilterStatus(isSelected ? 'all' : col.status)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-blue-500'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <span className={`text-[10px] font-bold uppercase tracking-wider block ${isSelected ? 'text-amber-400' : 'text-slate-400'}`}>
                {col.label}
              </span>
              <span className="text-2xl font-black mt-1 block">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Records List */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="font-bold text-base text-slate-900">
            {filterStatus === 'all' ? 'All Tracked Applications' : `${filterStatus} (${filteredRecords.length})`}
          </h3>
          {filterStatus !== 'all' && (
            <button
              onClick={() => setFilterStatus('all')}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              Show all stages
            </button>
          )}
        </div>

        {filteredRecords.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Bookmark className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No applications in this stage.</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Explore opportunities in Andhra Pradesh or Central Government and click "Save" or "Track" to manage them here.
            </p>
            <button
              onClick={() => setActiveTab('ap-jobs')}
              className="mt-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
            >
              Explore Andhra Pradesh Jobs
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecords.map((record) => {
              const job = opportunities.find((j) => j.id === record.jobId);
              if (!job) return null;

              return (
                <div
                  key={record.jobId}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {job.organization}
                      </span>
                      <span className="text-[10px] bg-slate-200/80 px-2 py-0.5 rounded font-mono">
                        {job.notificationNumber}
                      </span>
                      <span className="text-xs font-bold text-emerald-700">
                        {job.payScaleOrStipend}
                      </span>
                    </div>

                    <h4
                      onClick={() => setSelectedJobForDetail(job)}
                      className="text-base font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors"
                    >
                      {job.title}
                    </h4>

                    {/* Metadata chips */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Deadline: {job.applicationDeadline}
                      </span>
                      {record.applicationRefNumber && (
                        <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800">
                          Ref: {record.applicationRefNumber}
                        </span>
                      )}
                      {record.examDate && (
                        <span className="text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          Exam: {record.examDate}
                        </span>
                      )}
                    </div>

                    {record.notes && (
                      <p className="text-xs text-slate-600 italic bg-white p-2 rounded-lg border border-slate-100">
                        "{record.notes}"
                      </p>
                    )}
                  </div>

                  {/* Actions & Status Dropdown */}
                  <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-end shrink-0">
                    <select
                      value={record.status}
                      onChange={(e) =>
                        updateTrackingStatus(
                          job.id,
                          e.target.value as ApplicationTrackingStatus,
                          record.notes,
                          record.applicationRefNumber,
                          record.examDate
                        )
                      }
                      className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                    >
                      <option value="Saved">Saved</option>
                      <option value="Planning to Apply">Planning to Apply</option>
                      <option value="Applied">Applied</option>
                      <option value="Exam Scheduled">Exam Scheduled</option>
                      <option value="Result Published">Result Published</option>
                      <option value="Closed">Closed</option>
                    </select>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedJobForEligibility(job)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Eligibility
                      </button>
                      <button
                        onClick={() => setSelectedJobForDetail(job)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-medium"
                      >
                        Details
                      </button>
                      <a
                        href={job.officialApplicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-xl border border-slate-300 hover:bg-slate-200 text-slate-600"
                        title="Official portal"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
