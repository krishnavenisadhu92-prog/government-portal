import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { SearchAndFilters } from './components/SearchAndFilters';
import { CertificateManager } from './components/CertificateManager';
import { DashboardView } from './components/DashboardView';
import { AiAssistant } from './components/AiAssistant';
import { ApplicationTracker } from './components/ApplicationTracker';
import { AdminPanel } from './components/AdminPanel';
import { AccountSettings } from './components/AccountSettings';
import { JobDetailModal } from './components/JobDetailModal';
import { EligibilityModal } from './components/EligibilityModal';
import { AuthModal } from './components/AuthModal';
import { ProfileWizardModal } from './components/ProfileWizardModal';
import { FloatingChatWidget } from './components/FloatingChatWidget';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    selectedJobForDetail,
    setSelectedJobForDetail,
    selectedJobForEligibility,
    setSelectedJobForEligibility,
    setActiveTab,
    setIsProfileWizardOpen,
  } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'home' && <HomeView />}

        {activeTab === 'ap-jobs' && (
          <SearchAndFilters
            initialCategory="andhra_pradesh"
            pageTitle="Andhra Pradesh Government Jobs 🏛️"
            pageDescription="Authentic recruitment opportunities from Andhra Pradesh Public Service Commission (APPSC), APSLPRB Police Board, AP DSC Teachers, and State PSUs."
          />
        )}

        {activeTab === 'central-jobs' && (
          <SearchAndFilters
            initialCategory="central_govt"
            pageTitle="Central Government & PSU Jobs 🇮🇳"
            pageDescription="All-India examinations and cadres including UPSC Civil Services, Staff Selection Commission (SSC CGL), Railway Recruitment Boards, and Public Sector Banks."
          />
        )}

        {activeTab === 'cybersecurity' && (
          <SearchAndFilters
            initialCategory="cybersecurity"
            pageTitle="Cybersecurity & Government IT Careers 🛡️"
            pageDescription="Protect national digital infrastructure at CERT-In, NIC, I4C (Ministry of Home Affairs), AP Cyber Security Operations Centre, and verified private sector SOC roles."
          />
        )}

        {activeTab === 'internships' && (
          <SearchAndFilters
            initialCategory="internship"
            pageTitle="Internships, Apprenticeships & Student Opportunities 🎓"
            pageDescription="Government and industry internships accepting 1st to final-year students, NITI Aayog research tracks, and AICTE certified fellowships with stipends."
          />
        )}

        {activeTab === 'women' && (
          <SearchAndFilters
            initialCategory="women_exclusive"
            pageTitle="Government Opportunities & Schemes for Women 👩‍💼"
            pageDescription="Dedicated recruitments (AP Mahila Police Battalions, CRPF), women scientist fellowships (DST WISE), and complete examination fee exemptions."
          />
        )}

        {activeTab === 'other-states' && (
          <SearchAndFilters
            initialCategory="other_states"
            pageTitle="Other State Government Recruitments 🌐"
            pageDescription="Vacancies across Telangana (TSPSC), Karnataka (KPSC), and other state public service commissions."
          />
        )}

        {activeTab === 'search' && <SearchAndFilters />}

        {activeTab === 'dashboard' && <DashboardView />}

        {activeTab === 'tracker' && <ApplicationTracker />}

        {activeTab === 'certificates' && <CertificateManager />}

        {activeTab === 'assistant' && <AiAssistant />}

        {activeTab === 'admin' && <AdminPanel />}

        {activeTab === 'settings' && <AccountSettings />}
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Global Modals */}
      <JobDetailModal
        job={selectedJobForDetail}
        onClose={() => setSelectedJobForDetail(null)}
        onCheckEligibility={(job) => {
          setSelectedJobForDetail(null);
          setSelectedJobForEligibility(job);
        }}
      />

      <EligibilityModal
        job={selectedJobForEligibility}
        onClose={() => setSelectedJobForEligibility(null)}
        onUploadDocsClick={() => {
          setSelectedJobForEligibility(null);
          setActiveTab('certificates');
        }}
        onEditProfileClick={() => {
          setSelectedJobForEligibility(null);
          setIsProfileWizardOpen(true);
        }}
      />

      <AuthModal />
      <ProfileWizardModal />
      <FloatingChatWidget />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
