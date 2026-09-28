import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Lock,
  Trash2,
  Download,
  Bell,
  CheckCircle2,
  AlertTriangle,
  User,
  FileCheck2,
} from 'lucide-react';

export const AccountSettings: React.FC = () => {
  const { user, certificates, trackedApplications, clearAllUserData, logout } = useApp();

  const [notifPreferences, setNotifPreferences] = useState({
    apGovtAlerts: true,
    centralGovtAlerts: true,
    cyberAlerts: true,
    internshipAlerts: true,
    womenSchemes: true,
    deadlineReminders: true,
    examDates: true,
  });

  const [confirmWipe, setConfirmWipe] = useState(false);
  const [successNote, setSuccessNote] = useState<string | null>(null);

  const handleExportData = () => {
    const backupData = {
      userProfile: user,
      certificatesCount: certificates.length,
      certificatesList: certificates.map((c) => ({
        fileName: c.fileName,
        category: c.category,
        extracted: c.ocrExtractedData,
        uploadedAt: c.uploadedAt,
      })),
      trackedApplications,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GovtJob_AI_Candidate_Export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setSuccessNote('Your encrypted candidate profile and certificate metadata have been exported.');
    setTimeout(() => setSuccessNote(null), 4000);
  };

  const handlePurgeAll = () => {
    clearAllUserData();
    setConfirmWipe(false);
    setSuccessNote('All personal certificates, profile details, and tracked items have been permanently deleted.');
    setTimeout(() => setSuccessNote(null), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-2 mb-2 text-amber-400 font-semibold text-xs tracking-wider uppercase">
          <Lock className="w-4 h-4" /> Data Sovereignty & Privacy Center
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Account & Privacy Controls
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
          Manage notification frequencies, export your candidate records, or permanently purge all certificates and account data.
        </p>
      </div>

      {successNote && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successNote}</span>
        </div>
      )}

      {/* Notification Preferences Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" /> Recruitment Alert Notifications
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Choose which categories and reminders you wish to receive alerts for.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {[
            { id: 'apGovtAlerts', label: 'Andhra Pradesh Government Gazettes & DSC' },
            { id: 'centralGovtAlerts', label: 'Central Government (UPSC, SSC, Railways, Banks)' },
            { id: 'cyberAlerts', label: 'Cybersecurity & Government IT Openings (CERT-In, NIC)' },
            { id: 'internshipAlerts', label: 'Student Internships & AICTE Fellowships' },
            { id: 'womenSchemes', label: 'Opportunities for Women & Mahila Battalions' },
            { id: 'deadlineReminders', label: 'Upcoming Application Deadline Alerts (7 Days Notice)' },
            { id: 'examDates', label: 'Examination Dates & Admit Card Notifications' },
          ].map((item) => (
            <label
              key={item.id}
              className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 flex items-center justify-between cursor-pointer select-none"
            >
              <span className="font-semibold text-slate-800">{item.label}</span>
              <input
                type="checkbox"
                checked={(notifPreferences as any)[item.id]}
                onChange={(e) =>
                  setNotifPreferences({ ...notifPreferences, [item.id]: e.target.checked })
                }
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Data Export & Backup */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-600" /> Export Personal Candidate Dossier
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Download a portable, machine-readable JSON archive of your confirmed certificates, qualifications, and application tracking history.
          </p>
        </div>

        <button
          onClick={handleExportData}
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" /> Download Complete Archive
        </button>
      </div>

      {/* Responsible AI Commitments */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600" /> Responsible AI & Confidentiality Pledge
        </h3>
        <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
          <p>
            • <strong>No Public Exposure:</strong> Your certificates and marks memos are never indexed in public registries or made discoverable via search engines.
          </p>
          <p>
            • <strong>Zero Third-Party Training:</strong> Your marks memos and government identity numbers are never used to train public generative models.
          </p>
          <p>
            • <strong>Anti-Bias Commitment:</strong> Religion, caste, or background are never utilized to exclude candidates. Only lawful reservation quotas explicitly sanctioned in official gazettes are evaluated.
          </p>
        </div>
      </div>

      {/* Permanent Deletion & Account Reset */}
      <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 sm:p-8 space-y-4">
        <div>
          <h3 className="text-base font-bold text-rose-900 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-rose-600" /> Permanent Data Wipe & Account Deletion
          </h3>
          <p className="text-xs text-rose-700 mt-0.5">
            Permanently delete your profile, confirmed marks memos, caste certificates, and application tracking notes from this browser session. This action cannot be reversed.
          </p>
        </div>

        {confirmWipe ? (
          <div className="p-4 bg-white rounded-2xl border border-rose-300 space-y-3">
            <div className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Are you sure you want to permanently erase all certificates?
            </div>
            <p className="text-xs text-slate-600">
              This will remove all confirmed OCR records and application statuses.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePurgeAll}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm"
              >
                Yes, Permanently Delete Everything
              </button>
              <button
                onClick={() => setConfirmWipe(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-800 font-semibold text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmWipe(true)}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" /> Permanent Delete Data
          </button>
        )}
      </div>
    </div>
  );
};
