import React, { useState, useEffect } from 'react';
import { JobOpportunity, EligibilityAnalysisResult } from '../types';
import { useApp } from '../context/AppContext';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck2,
  ShieldAlert,
  Loader2,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

interface EligibilityModalProps {
  job: JobOpportunity | null;
  onClose: () => void;
  onUploadDocsClick: () => void;
  onEditProfileClick: () => void;
}

export const EligibilityModal: React.FC<EligibilityModalProps> = ({
  job,
  onClose,
  onUploadDocsClick,
  onEditProfileClick,
}) => {
  const { user, certificates } = useApp();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<EligibilityAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!job || !user) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    const runAnalysis = async () => {
      try {
        const response = await fetch('/api/eligibility-match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userProfile: user,
            confirmedCertificates: certificates,
            jobOpportunity: job,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to run AI eligibility analysis');
        }

        const data = await response.json();
        if (isMounted) {
          setResult(data.result);
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Eligibility check error:', err);
        if (isMounted) {
          setError(err.message || 'Error evaluating eligibility');
          setLoading(false);
        }
      }
    };

    runAnalysis();

    return () => {
      isMounted = false;
    };
  }, [job, user, certificates]);

  if (!job) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2 text-amber-400 font-semibold text-xs tracking-wider uppercase">
            <Sparkles className="w-4 h-4 animate-pulse" />
            AI Eligibility Matching Engine
          </div>
          <h2 className="text-xl font-bold text-white leading-tight">
            Eligibility Analysis: {job.title}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Evaluated against {user?.fullName}’s profile ({user?.educationLevel} • {user?.currentDegreeAndBranch} • {user?.state})
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-sm">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
              <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
              <div className="space-y-1">
                <p className="font-bold text-slate-900 text-base">Running AI Verification...</p>
                <p className="text-xs text-slate-500 max-w-sm">
                  Comparing education credentials, age limits with category relaxations, domicile rules, and verified certificates.
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 rounded-2xl border border-red-200 text-red-700 text-xs">
              <div className="font-bold mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Error during evaluation
              </div>
              <p>{error}</p>
            </div>
          ) : result ? (
            <>
              {/* Verdict Status Card */}
              <div
                className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center sm:items-start gap-4 ${
                  result.status === 'ELIGIBLE'
                    ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                    : result.status === 'POTENTIALLY_ELIGIBLE'
                    ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                    : 'bg-rose-50/80 border-rose-300 text-rose-950'
                }`}
              >
                {/* Status Icon */}
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                    result.status === 'ELIGIBLE'
                      ? 'bg-emerald-600 text-white'
                      : result.status === 'POTENTIALLY_ELIGIBLE'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  {result.status === 'ELIGIBLE' ? (
                    <CheckCircle2 className="w-8 h-8" />
                  ) : result.status === 'POTENTIALLY_ELIGIBLE' ? (
                    <AlertTriangle className="w-8 h-8" />
                  ) : (
                    <XCircle className="w-8 h-8" />
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {result.status === 'ELIGIBLE'
                        ? 'Eligible based on available information'
                        : result.status === 'POTENTIALLY_ELIGIBLE'
                        ? 'Potentially eligible — verification required'
                        : 'Does not meet one or more stated requirements'}
                    </span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white/70 border">
                      Match Score: {result.overallScore}%
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base mb-1">{result.headline}</h3>
                  <p className="text-xs opacity-90 leading-relaxed">
                    Evaluated strictly against published notification criteria ({job.notificationNumber}).
                  </p>
                </div>
              </div>

              {/* Criteria Detailed Checks */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3">
                  Verification Breakdown
                </h4>
                <div className="space-y-2.5">
                  {result.criteria.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border bg-slate-50 border-slate-200/80 text-xs flex items-start gap-3"
                    >
                      <div className="mt-0.5 shrink-0">
                        {item.status === 'pass' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : item.status === 'warning' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-slate-900 block">{item.title}</span>
                        <p className="text-slate-600 mt-0.5 leading-relaxed">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Applicable Relaxations */}
              {result.relaxationsApplicable && result.relaxationsApplicable.length > 0 && (
                <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-xs">
                  <span className="font-bold text-blue-900 block mb-1.5 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-blue-700" /> Applicable Relaxations & Concessions
                  </span>
                  <ul className="space-y-1 text-blue-800">
                    {result.relaxationsApplicable.map((rel, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="font-bold text-blue-500">•</span>
                        <span>{rel}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Missing Documents or Fields */}
              {result.missingDocumentsOrInfo && result.missingDocumentsOrInfo.length > 0 && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-amber-900 flex items-center gap-1.5">
                      <FileCheck2 className="w-4 h-4 text-amber-700" /> Pending Certificates / Verification
                    </span>
                    <button
                      onClick={onUploadDocsClick}
                      className="text-amber-800 font-bold hover:underline flex items-center gap-1"
                    >
                      Upload Now <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <ul className="space-y-1 text-amber-800">
                    {result.missingDocumentsOrInfo.map((doc, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="font-bold text-amber-600">•</span>
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Mandatory Official Disclaimer */}
              <div className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-500 leading-relaxed border border-slate-200 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  {result.officialDisclaimer ||
                    'AI evaluation is strictly advisory and cannot override published gazette provisions. Final eligibility and selection are governed solely by the recruiting commission upon physical certificate verification.'}
                </span>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onEditProfileClick}
            className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1"
          >
            Update my education or reservation details
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold"
            >
              Close
            </button>
            <a
              href={job.officialApplicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
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
