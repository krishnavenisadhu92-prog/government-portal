import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserProfile, OpportunityCategory, StudentYearEligibility } from '../types';
import {
  X,
  User,
  GraduationCap,
  Sparkles,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Save,
  Briefcase,
} from 'lucide-react';

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Telangana',
  'Karnataka',
  'Tamil Nadu',
  'Maharashtra',
  'Delhi',
  'Uttar Pradesh',
  'Kerala',
  'Gujarat',
  'Rajasthan',
  'West Bengal',
  'Odisha',
  'Other State / UT',
];

const AP_DISTRICTS = [
  'Visakhapatnam',
  'Vijayawada / NTR',
  'Guntur',
  'Tirupati',
  'Kurnool',
  'Ananthapuramu',
  'Kadapa (YSR)',
  'Nellore',
  'Kakinada',
  'East Godavari',
  'West Godavari',
  'Srikakulam',
  'Vizianagaram',
  'Prakasam',
  'Chittoor',
  'Alluri Sitharama Raju',
];

export const ProfileWizardModal: React.FC = () => {
  const { user, updateProfile, isProfileWizardOpen, setIsProfileWizardOpen } = useApp();

  const [step, setStep] = useState(1);

  // Form State initialized from user
  const [formData, setFormData] = useState<UserProfile>(
    user || {
      id: 'usr-new',
      email: '',
      fullName: '',
      dateOfBirth: '2003-01-01',
      gender: 'Male',
      state: 'Andhra Pradesh',
      district: 'Visakhapatnam',
      domicileState: 'Andhra Pradesh',
      educationLevel: 'B.Tech / B.E.',
      currentDegreeAndBranch: 'Computer Science & Engineering',
      currentStatus: 'Student',
      currentYearOfStudy: 'Final Year',
      graduationYear: 2026,
      academicScorePercentage: 80,
      technicalSkills: ['Python', 'Networking', 'SQL'],
      nonTechnicalSkills: ['Communication', 'Analytical Thinking'],
      workExperience: '',
      projectsAndAchievements: '',
      preferredCategories: ['andhra_pradesh', 'central_govt', 'cybersecurity'],
      preferredLocations: ['Visakhapatnam', 'Vijayawada'],
      workModePreference: 'Any',
      preferredEmploymentType: 'Permanent',
      expectedSalaryOrStipend: '₹40,000 - ₹80,000 / month',
      preferredLanguages: ['English', 'Telugu'],
      reservationCategory: 'General / UR',
      isDisabilityEligible: false,
      isProfileComplete: true,
    }
  );

  const [techSkillInput, setTechSkillInput] = useState('');

  if (!isProfileWizardOpen) return null;

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSave = () => {
    updateProfile(formData);
    setIsProfileWizardOpen(false);
  };

  const handleAddSkill = () => {
    if (techSkillInput.trim() && !formData.technicalSkills.includes(techSkillInput.trim())) {
      setFormData({
        ...formData,
        technicalSkills: [...formData.technicalSkills, techSkillInput.trim()],
      });
      setTechSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData({
      ...formData,
      technicalSkills: formData.technicalSkills.filter((s) => s !== skill),
    });
  };

  const toggleCategoryPreference = (cat: OpportunityCategory) => {
    const exists = formData.preferredCategories.includes(cat);
    if (exists) {
      setFormData({
        ...formData,
        preferredCategories: formData.preferredCategories.filter((c) => c !== cat),
      });
    } else {
      setFormData({
        ...formData,
        preferredCategories: [...formData.preferredCategories, cat],
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={() => setIsProfileWizardOpen(false)}
            className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-2 text-amber-400 font-semibold text-xs tracking-wider uppercase">
            <Sparkles className="w-4 h-4" /> Comprehensive Candidate Profile
          </div>
          <h3 className="text-xl font-bold text-white">
            {step === 1 && 'Step 1: Personal & Demographic Details'}
            {step === 2 && 'Step 2: Educational Qualifications & Branch'}
            {step === 3 && 'Step 3: Technical Skills & Projects'}
            {step === 4 && 'Step 4: Career Preferences & Quotas'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Used by the AI engine to evaluate age limits, AP local quota rules, and branch eligibility.
          </p>

          {/* Stepper Dots */}
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full flex-1 transition-all ${
                  s === step ? 'bg-amber-400' : s < step ? 'bg-blue-500' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Wizard Step Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 flex-1">
          {/* STEP 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Date of Birth (as per 10th) *</label>
                  <input
                    type="text"
                    placeholder="YYYY-MM-DD"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Reservation Category (Voluntary for eligibility)
                  </label>
                  <select
                    value={formData.reservationCategory}
                    onChange={(e) => setFormData({ ...formData, reservationCategory: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="General / UR">General / Unreserved (UR)</option>
                    <option value="OBC-NCL">OBC - Non Creamy Layer</option>
                    <option value="SC">Scheduled Caste (SC)</option>
                    <option value="ST">Scheduled Tribe (ST)</option>
                    <option value="EWS">Economically Weaker Section (EWS)</option>
                    <option value="Prefer not to disclose">Prefer not to disclose</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">State of Residence *</label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">District *</label>
                  {formData.state === 'Andhra Pradesh' ? (
                    <select
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                    >
                      {AP_DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                    />
                  )}
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Domicile / Nativity State (For State Local Quota)
                  </label>
                  <select
                    value={formData.domicileState}
                    onChange={(e) => setFormData({ ...formData, domicileState: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isDisabilityEligible}
                      onChange={(e) => setFormData({ ...formData, isDisabilityEligible: e.target.checked })}
                      className="rounded text-blue-600 w-4 h-4"
                    />
                    <span className="text-slate-800 font-semibold">
                      Eligible for PwBD / Disability Reservation Concessions
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Educational Details */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Highest Educational Level *
                  </label>
                  <select
                    value={formData.educationLevel}
                    onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="10th">10th Standard / SSC</option>
                    <option value="12th">Intermediate (10+2)</option>
                    <option value="Diploma">Polytechnic Diploma</option>
                    <option value="B.Tech / B.E.">B.Tech / B.E. (Engineering)</option>
                    <option value="B.Sc">B.Sc (Science)</option>
                    <option value="BCA">BCA (Computer Applications)</option>
                    <option value="Graduate">Graduate (B.Com / B.A. / BBA)</option>
                    <option value="M.Tech">M.Tech / M.E.</option>
                    <option value="MCA">MCA</option>
                    <option value="Postgraduate">Postgraduate (M.Sc / MBA / M.A.)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Degree Branch / Specialization *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Computer Science & Engineering, Information Technology, Civil"
                    value={formData.currentDegreeAndBranch}
                    onChange={(e) => setFormData({ ...formData, currentDegreeAndBranch: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Current Study Status
                  </label>
                  <select
                    value={formData.currentStatus}
                    onChange={(e) => setFormData({ ...formData, currentStatus: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="Student">Active Student (Undergraduate / PG)</option>
                    <option value="Recent Graduate">Recent Graduate</option>
                    <option value="Experienced Professional">Experienced Professional</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Current Year of Study / Eligibility
                  </label>
                  <select
                    value={formData.currentYearOfStudy}
                    onChange={(e) => setFormData({ ...formData, currentYearOfStudy: e.target.value as StudentYearEligibility })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="1st Year">1st Year Student</option>
                    <option value="2nd Year">2nd Year Student</option>
                    <option value="3rd Year">3rd Year Student</option>
                    <option value="Final Year">Final Year Student</option>
                    <option value="Recent Graduate">Recent Graduate / Passed Out</option>
                    <option value="Diploma">Diploma Student</option>
                    <option value="Postgraduate">Postgraduate Student</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Graduation Year (Actual or Expected)
                  </label>
                  <input
                    type="number"
                    value={formData.graduationYear}
                    onChange={(e) => setFormData({ ...formData, graduationYear: parseInt(e.target.value, 10) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Academic Score (% or converted CGPA)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.academicScorePercentage}
                    onChange={(e) => setFormData({ ...formData, academicScorePercentage: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Skills & Experience */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Technical Skills & Certifications
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g. Python, Linux, Network Security, Wazuh, SIEM..."
                    value={techSkillInput}
                    onChange={(e) => setTechSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {formData.technicalSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 text-xs border border-blue-200 flex items-center gap-1"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-blue-500 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Internships & Work Experience Summary
                </label>
                <textarea
                  rows={3}
                  value={formData.workExperience}
                  onChange={(e) => setFormData({ ...formData, workExperience: e.target.value })}
                  placeholder="Describe any previous government or private internships, apprenticeships, or research positions..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Projects, CTF Competitions & Academic Achievements
                </label>
                <textarea
                  rows={3}
                  value={formData.projectsAndAchievements}
                  onChange={(e) => setFormData({ ...formData, projectsAndAchievements: e.target.value })}
                  placeholder="e.g. Built automated port scanner, published paper on wireless security, NCC 'C' certificate..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Career Preferences */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-2">
                  Preferred Recruitment Categories (Select all that apply)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'andhra_pradesh' as OpportunityCategory, label: 'Andhra Pradesh Government (APPSC/Police/DSC)' },
                    { id: 'central_govt' as OpportunityCategory, label: 'Central Government (UPSC/SSC/RRB/Banks)' },
                    { id: 'cybersecurity' as OpportunityCategory, label: 'Cybersecurity & IT (CERT-In/NIC/I4C)' },
                    { id: 'internship' as OpportunityCategory, label: 'Student Internships & Apprenticeships' },
                    { id: 'women_exclusive' as OpportunityCategory, label: 'Women-Specific Opportunities & Schemes' },
                    { id: 'other_states' as OpportunityCategory, label: 'Other State Government Jobs' },
                  ].map((cat) => {
                    const isChecked = formData.preferredCategories.includes(cat.id);
                    return (
                      <label
                        key={cat.id}
                        className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                          isChecked ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCategoryPreference(cat.id)}
                          className="rounded text-blue-600"
                        />
                        <span>{cat.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Work Mode Preference</label>
                  <select
                    value={formData.workModePreference}
                    onChange={(e) => setFormData({ ...formData, workModePreference: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="Any">Any Mode (In-Person / Remote / Hybrid)</option>
                    <option value="In-Person">In-Person Only</option>
                    <option value="Remote">Remote Only</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Expected Salary / Stipend</label>
                  <input
                    type="text"
                    value={formData.expectedSalaryOrStipend}
                    onChange={(e) => setFormData({ ...formData, expectedSalaryOrStipend: e.target.value })}
                    placeholder="e.g. ₹50,000 / month"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              Next Step <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
            >
              <Save className="w-3.5 h-3.5" /> Save Candidate Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
