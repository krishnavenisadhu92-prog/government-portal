import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { JobOpportunity, OpportunityCategory, StudentYearEligibility } from '../types';
import { JobCard } from './JobCard';
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
  Sparkles,
  Building2,
  Calendar,
  GraduationCap,
  Users,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface SearchAndFiltersProps {
  initialCategory?: OpportunityCategory;
  pageTitle?: string;
  pageDescription?: string;
}

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  initialCategory,
  pageTitle = 'Search All Government Vacancies & Internships',
  pageDescription = 'Filter authentic opportunities across Andhra Pradesh, Central Ministries, Cybersecurity agencies, and student internships.',
}) => {
  const { opportunities, user, setSelectedJobForDetail, setSelectedJobForEligibility } = useApp();

  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState<string>(initialCategory || 'all');
  const [studentYear, setStudentYear] = useState<string>('all');
  const [workMode, setWorkMode] = useState<string>('all');
  const [paidOnly, setPaidOnly] = useState<boolean>(false);
  const [onlyMatchingProfile, setOnlyMatchingProfile] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'deadline' | 'newest' | 'vacancies'>('deadline');
  const [savedFilterAlert, setSavedFilterAlert] = useState(false);

  const filteredJobs = useMemo(() => {
    return opportunities
      .filter((job) => {
        // Keyword search
        if (keyword.trim()) {
          const q = keyword.toLowerCase();
          const matchTitle = job.title.toLowerCase().includes(q);
          const matchOrg = job.organization.toLowerCase().includes(q);
          const matchDept = job.department.toLowerCase().includes(q);
          const matchSub = job.subcategory.toLowerCase().includes(q);
          const matchLoc = job.location.toLowerCase().includes(q);
          const matchBranches = job.eligibleBranches.some((b) => b.toLowerCase().includes(q));
          if (!matchTitle && !matchOrg && !matchDept && !matchSub && !matchLoc && !matchBranches) {
            return false;
          }
        }

        // Category filter
        if (category !== 'all') {
          if (category === 'andhra_pradesh' && job.category !== 'andhra_pradesh') return false;
          if (category === 'central_govt' && job.category !== 'central_govt') return false;
          if (category === 'cybersecurity' && !job.isCybersecurity) return false;
          if (category === 'internship' && !job.isInternship) return false;
          if (category === 'women_exclusive' && !job.isWomenExclusive && !job.isOpenToWomen) return false;
          if (category === 'other_states' && job.category !== 'other_states') return false;
        }

        // Student year filter
        if (studentYear !== 'all') {
          if (!job.studentEligibilityYears || !job.studentEligibilityYears.includes(studentYear as StudentYearEligibility)) {
            // If it's a general job requiring degree, and candidate is recent graduate
            if (studentYear === 'Recent Graduate' && !job.isInternship) {
              // Eligible
            } else {
              return false;
            }
          }
        }

        // Work mode
        if (workMode !== 'all' && job.workMode !== workMode) {
          return false;
        }

        // Paid only
        if (paidOnly && !job.isPaid) {
          return false;
        }

        // Matching profile toggle
        if (onlyMatchingProfile && user) {
          // If women only and user is male
          if (job.isWomenExclusive && user.gender !== 'Female') {
            return false;
          }
          // If branch doesn't match
          const userBranch = (user.currentDegreeAndBranch || '').toLowerCase();
          const matches = job.eligibleBranches.some(
            (b) =>
              b.toLowerCase().includes('all') ||
              b.toLowerCase().includes('any') ||
              userBranch.includes(b.toLowerCase()) ||
              b.toLowerCase().includes(userBranch)
          );
          if (!matches) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'deadline') {
          return new Date(a.applicationDeadline).getTime() - new Date(b.applicationDeadline).getTime();
        }
        if (sortBy === 'newest') {
          return new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime();
        }
        if (sortBy === 'vacancies') {
          return b.vacanciesCount - a.vacanciesCount;
        }
        return 0;
      });
  }, [opportunities, keyword, category, studentYear, workMode, paidOnly, onlyMatchingProfile, sortBy, user]);

  const handleSaveSearch = () => {
    setSavedFilterAlert(true);
    setTimeout(() => setSavedFilterAlert(false), 3000);
  };

  const handleResetFilters = () => {
    setKeyword('');
    setCategory(initialCategory || 'all');
    setStudentYear('all');
    setWorkMode('all');
    setPaidOnly(false);
    setOnlyMatchingProfile(false);
    setSortBy('deadline');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Search Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-2 text-amber-400 font-semibold text-xs tracking-wider uppercase">
            <SlidersHorizontal className="w-4 h-4" /> Multi-Faceted Career Discovery
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {pageTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">{pageDescription}</p>
        </div>

        {/* Global Keyword Search Bar */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by post name, department, branch, location (e.g. 'APPSC', 'CERT-In', 'Computer Science')..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl pl-12 pr-4 py-3.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
            {keyword && (
              <button
                onClick={() => setKeyword('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={handleSaveSearch}
            className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-colors whitespace-nowrap"
          >
            Save Search & Alerts
          </button>
        </div>

        {savedFilterAlert && (
          <div className="mt-3 text-xs bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-xl border border-emerald-500/30 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Search preferences saved! You will receive alerts when new matching notifications are published.</span>
          </div>
        )}
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pb-3 border-b border-slate-100 text-xs">
          <span className="font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          {[
            { id: 'all', label: 'All Sectors' },
            { id: 'andhra_pradesh', label: 'Andhra Pradesh' },
            { id: 'central_govt', label: 'Central Govt' },
            { id: 'cybersecurity', label: 'Cybersecurity & IT' },
            { id: 'internship', label: 'Internships' },
            { id: 'women_exclusive', label: 'Women Opportunities' },
            { id: 'other_states', label: 'Other States' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl transition-all font-medium ${
                category === cat.id
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Multi-Dropdown row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              Student / Study Year
            </label>
            <select
              value={studentYear}
              onChange={(e) => setStudentYear(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Any Eligibility Level</option>
              <option value="1st Year">1st Year Students</option>
              <option value="2nd Year">2nd Year Students</option>
              <option value="3rd Year">3rd Year Students</option>
              <option value="Final Year">Final Year Students</option>
              <option value="Recent Graduate">Recent Graduates</option>
              <option value="Diploma">Diploma Students</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              Work Mode
            </label>
            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Modes (In-Person / Remote)</option>
              <option value="In-Person">In-Person Only</option>
              <option value="Remote">Remote Only</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              Sort Opportunities By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="deadline">Application Deadline (Urgent First)</option>
              <option value="newest">Recently Published Gazette</option>
              <option value="vacancies">Highest Vacancies</option>
            </select>
          </div>

          {/* Profile Match Toggle */}
          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-100 p-2.5 rounded-xl border border-slate-300 transition-colors select-none">
              <input
                type="checkbox"
                checked={onlyMatchingProfile}
                onChange={(e) => setOnlyMatchingProfile(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Match My Profile Only
              </span>
            </label>
          </div>
        </div>

        {/* Active Filters Summary & Reset */}
        <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
          <div>
            Showing <span className="font-bold text-slate-900">{filteredJobs.length}</span> opportunities
          </div>
          {(keyword || category !== 'all' || studentYear !== 'all' || workMode !== 'all' || paidOnly || onlyMatchingProfile) && (
            <button
              onClick={handleResetFilters}
              className="text-blue-600 hover:underline font-semibold"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Results Grid */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No matching vacancies found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Try broadening your search keywords, switching categories, or clearing the "Match My Profile" toggle.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onViewDetails={setSelectedJobForDetail}
              onCheckEligibility={setSelectedJobForEligibility}
            />
          ))}
        </div>
      )}
    </div>
  );
};
