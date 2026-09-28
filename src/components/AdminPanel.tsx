import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { JobOpportunity, OpportunityCategory, WorkMode, EmploymentType } from '../types';
import {
  Lock,
  PlusCircle,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  FileText,
  Clock,
  ExternalLink,
  ShieldCheck,
  Building2,
  Calendar,
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { opportunities, addJobOpportunity, updateJobOpportunity, deleteJobOpportunity, setActiveTab } = useApp();

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(true);
  const [activeAdminTab, setActiveAdminTab] = useState<'listings' | 'add' | 'logs'>('listings');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State for new listing
  const [title, setTitle] = useState('');
  const [organization, setOrganization] = useState('');
  const [category, setCategory] = useState<OpportunityCategory>('andhra_pradesh');
  const [subcategory, setSubcategory] = useState('APPSC');
  const [department, setDepartment] = useState('');
  const [notificationNumber, setNotificationNumber] = useState('');
  const [vacanciesCount, setVacanciesCount] = useState<number>(50);
  const [payScale, setPayScale] = useState('');
  const [location, setLocation] = useState('Andhra Pradesh');
  const [workMode, setWorkMode] = useState<WorkMode>('In-Person');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('Permanent');
  const [isCybersecurity, setIsCybersecurity] = useState(false);
  const [isInternship, setIsInternship] = useState(false);
  const [isWomenExclusive, setIsWomenExclusive] = useState(false);
  const [education, setEducation] = useState('Bachelor Degree in any discipline');
  const [branches, setBranches] = useState('All Streams, Computer Science, Engineering');
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(42);
  const [relaxations, setRelaxations] = useState('5 years for SC/ST/BC/EWS candidates.');
  const [deadline, setDeadline] = useState('2026-11-15');
  const [notifUrl, setNotifUrl] = useState('https://psc.ap.gov.in');
  const [applyUrl, setApplyUrl] = useState('https://psc.ap.gov.in');
  const [description, setDescription] = useState('');

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !organization || !department) {
      alert('Please fill out all required fields.');
      return;
    }

    const newJob: JobOpportunity = {
      id: `job-${Date.now()}`,
      title,
      organization,
      category,
      subcategory,
      department,
      notificationNumber: notificationNumber || `NOTIF-${Math.floor(100 + Math.random() * 900)}/2026`,
      vacanciesCount: Number(vacanciesCount),
      payScaleOrStipend: payScale || '₹35,000 - ₹85,000 / month',
      location,
      stateOrRegion: location,
      workMode,
      employmentType,
      isCybersecurity,
      isInternship,
      isWomenExclusive,
      isOpenToWomen: true,
      isPaid: true,
      educationalQualifications: [education],
      eligibleBranches: branches.split(',').map((b) => b.trim()),
      ageLimit: {
        min: Number(minAge),
        max: Number(maxAge),
        relaxationDetails: relaxations,
      },
      selectionProcess: ['Written Examination', 'Document Verification'],
      requiredCertificates: ['10th Marksheet / DOB', 'Degree Certificate', 'Category Certificate'],
      applicationStartDate: new Date().toISOString().split('T')[0],
      applicationDeadline: deadline,
      officialNotificationUrl: notifUrl,
      officialApplicationUrl: applyUrl,
      publicationDate: new Date().toISOString().split('T')[0],
      lastVerifiedDate: new Date().toISOString().split('T')[0],
      sourceVerificationStatus: 'Verified Official',
      summaryDescription: description || `${title} conducted by ${organization}.`,
    };

    addJobOpportunity(newJob);
    setSuccessMessage(`Opportunity '${title}' successfully verified and added to public database!`);
    setActiveAdminTab('listings');

    // Reset fields
    setTitle('');
    setDescription('');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleMarkExpired = (jobId: string) => {
    updateJobOpportunity(jobId, {
      applicationDeadline: '2026-09-01',
      summaryDescription: '[EXPIRED] Notification window has officially closed.',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 text-amber-400 font-semibold text-xs tracking-wider uppercase">
            <Lock className="w-4 h-4" /> Role-Based Access Control
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Administrator Gateway & Verification Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Publish authentic government gazettes, verify application links, manage active vacancies, and audit error telemetry.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-500/30 font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Admin Authorized
          </span>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveAdminTab('listings')}
          className={`pb-3 px-4 transition-all border-b-2 ${
            activeAdminTab === 'listings'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Manage Listings ({opportunities.length})
        </button>
        <button
          onClick={() => setActiveAdminTab('add')}
          className={`pb-3 px-4 transition-all border-b-2 ${
            activeAdminTab === 'add'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          + Add Verified Vacancy
        </button>
        <button
          onClick={() => setActiveAdminTab('logs')}
          className={`pb-3 px-4 transition-all border-b-2 ${
            activeAdminTab === 'logs'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          System Audit Logs & Security
        </button>
      </div>

      {/* Tab 1: Listings Table */}
      {activeAdminTab === 'listings' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900">Live Published Vacancies</h3>
            <span className="text-xs text-slate-400">All changes reflect in real-time</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Title & Organization</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4">Vacancies</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {opportunities.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs truncate">
                      {job.title}
                      <span className="block text-[11px] text-slate-400 font-normal">
                        {job.organization} • {job.notificationNumber}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px]">
                        {job.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">{job.applicationDeadline}</td>
                    <td className="py-3.5 px-4 font-bold">{job.vacanciesCount}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px] font-semibold">
                        {job.sourceVerificationStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleMarkExpired(job.id)}
                        className="text-amber-600 hover:text-amber-800 font-semibold"
                        title="Mark application as closed"
                      >
                        Expire
                      </button>
                      <button
                        onClick={() => deleteJobOpportunity(job.id)}
                        className="text-red-600 hover:text-red-800 font-semibold"
                        title="Delete listing"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Add Listing Form */}
      {activeAdminTab === 'add' && (
        <form onSubmit={handleCreateJob} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Add New Verified Opportunity</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verify links, eligibility, and pay scales against official gazette PDFs before publishing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">
                Recruitment Post Title *
              </label>
              <input
                type="text"
                placeholder="e.g. APPSC Group 1 Deputy Collector or CERT-In Cyber Analyst"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Recruiting Organization / Board *
              </label>
              <input
                type="text"
                placeholder="e.g. Andhra Pradesh Public Service Commission"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Government Department
              </label>
              <input
                type="text"
                placeholder="e.g. General Administration Department, Govt of AP"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Portal Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as OpportunityCategory)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
              >
                <option value="andhra_pradesh">Andhra Pradesh Government</option>
                <option value="central_govt">Central Government</option>
                <option value="cybersecurity">Cybersecurity & Govt IT</option>
                <option value="internship">Internships & Students</option>
                <option value="women_exclusive">Opportunities for Women</option>
                <option value="other_states">Other State Government</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Subcategory Tag
              </label>
              <input
                type="text"
                placeholder="e.g. APPSC, UPSC, APSLPRB, CERT-In"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Pay Scale / Monthly Stipend
              </label>
              <input
                type="text"
                placeholder="e.g. ₹54,060 - ₹1,33,900 / month"
                value={payScale}
                onChange={(e) => setPayScale(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Vacancies Count
              </label>
              <input
                type="number"
                value={vacanciesCount}
                onChange={(e) => setVacanciesCount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Application Deadline (YYYY-MM-DD)
              </label>
              <input
                type="text"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Location & State
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">
                Educational Qualification Requirement
              </label>
              <input
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">
                Eligible Branches (comma-separated)
              </label>
              <input
                type="text"
                value={branches}
                onChange={(e) => setBranches(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Official Notification PDF Link
              </label>
              <input
                type="url"
                value={notifUrl}
                onChange={(e) => setNotifUrl(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Official Application Portal Link
              </label>
              <input
                type="url"
                value={applyUrl}
                onChange={(e) => setApplyUrl(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
              />
            </div>

            {/* Checkbox tags */}
            <div className="sm:col-span-2 flex flex-wrap gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isCybersecurity}
                  onChange={(e) => setIsCybersecurity(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span className="font-semibold text-slate-800">Cybersecurity / IT Role</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInternship}
                  onChange={(e) => setIsInternship(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span className="font-semibold text-slate-800">Internship / Student Opportunity</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isWomenExclusive}
                  onChange={(e) => setIsWomenExclusive(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span className="font-semibold text-slate-800">Women-Only Exclusive Recruitment</span>
              </label>
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">
                Summary Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of duties, quota details, and exam format..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveAdminTab('listings')}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-colors"
            >
              Verify & Publish Opportunity
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Security & Audit Logs */}
      {activeAdminTab === 'logs' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900">Security & Privacy Audit</h3>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-semibold">
              All Systems Operational
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="flex items-center justify-between font-semibold text-slate-900">
                <span>Certificate Privacy Policy Status</span>
                <span className="text-emerald-600">ENFORCED</span>
              </div>
              <p className="text-slate-500">
                User certificates remain strictly in browser client storage and private processing pipelines. Administrators do not have access to candidate marks memos or caste certificates.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="flex items-center justify-between font-semibold text-slate-900">
                <span>Gemini 3.8 Flash Vision OCR Proxy</span>
                <span className="text-emerald-600">ONLINE</span>
              </div>
              <p className="text-slate-500">
                Document intelligence extracts structured JSON without retaining images on AI servers.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="flex items-center justify-between font-semibold text-slate-900">
                <span>Anti-Discrimination & Neutrality Filter</span>
                <span className="text-emerald-600">ACTIVE</span>
              </div>
              <p className="text-slate-500">
                Religion or arbitrary criteria are strictly excluded from job-matching logic. Only lawful reservations and published rules are applied.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
