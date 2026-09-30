import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  UploadedCertificate,
  JobOpportunity,
  ApplicationTrackingRecord,
  NotificationAlert,
  ApplicationTrackingStatus,
  OpportunityCategory,
  N8nConfig,
} from '../types';
import { INITIAL_JOB_OPPORTUNITIES } from '../data/mockOpportunities';

interface AppContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  opportunities: JobOpportunity[];
  certificates: UploadedCertificate[];
  trackedApplications: ApplicationTrackingRecord[];
  savedJobIds: string[];
  notifications: NotificationAlert[];
  unreadNotificationCount: number;
  selectedJobForDetail: JobOpportunity | null;
  setSelectedJobForDetail: (job: JobOpportunity | null) => void;
  selectedJobForEligibility: JobOpportunity | null;
  setSelectedJobForEligibility: (job: JobOpportunity | null) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isProfileWizardOpen: boolean;
  setIsProfileWizardOpen: (open: boolean) => void;
  n8nConfig: N8nConfig;
  updateN8nConfig: (config: Partial<N8nConfig>) => void;
  login: (email: string, demoRole?: 'student' | 'cyber' | 'women') => void;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  addCertificate: (cert: UploadedCertificate) => void;
  updateCertificate: (id: string, updated: Partial<UploadedCertificate>) => void;
  deleteCertificate: (id: string) => void;
  toggleSaveJob: (jobId: string) => void;
  updateTrackingStatus: (
    jobId: string,
    status: ApplicationTrackingStatus,
    notes?: string,
    refNum?: string,
    examDate?: string
  ) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addJobOpportunity: (job: JobOpportunity) => void;
  updateJobOpportunity: (id: string, updated: Partial<JobOpportunity>) => void;
  deleteJobOpportunity: (id: string) => void;
  clearAllUserData: () => void;
}

const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'usr-student-ap-01',
  email: 'krishnaveni.student@example.com',
  fullName: 'Krishnaveni Sadhu',
  dateOfBirth: '2003-08-16',
  gender: 'Female',
  state: 'Andhra Pradesh',
  district: 'Visakhapatnam',
  domicileState: 'Andhra Pradesh',
  educationLevel: 'B.Tech / B.E.',
  currentDegreeAndBranch: 'Computer Science & Engineering',
  currentStatus: 'Student',
  currentYearOfStudy: 'Final Year',
  graduationYear: 2026,
  academicScorePercentage: 84.5,
  technicalSkills: ['Python', 'Network Security', 'Linux', 'Web Development', 'SQL', 'Ethical Hacking Basics'],
  nonTechnicalSkills: ['Public Speaking', 'Analytical Reasoning', 'Technical Writing'],
  workExperience: 'Completed 2-month summer cybersecurity internship at AP Technology lab.',
  projectsAndAchievements: 'Built an automated phishing detector and published research on IoT device authentication.',
  preferredCategories: ['andhra_pradesh', 'cybersecurity', 'internship', 'women_exclusive', 'central_govt'],
  preferredLocations: ['Visakhapatnam', 'Vijayawada', 'Hyderabad', 'New Delhi', 'Remote'],
  workModePreference: 'Any',
  preferredEmploymentType: 'Any',
  expectedSalaryOrStipend: '₹40,000 - ₹80,000 / month',
  preferredLanguages: ['English', 'Telugu', 'Hindi'],
  reservationCategory: 'OBC-NCL',
  isDisabilityEligible: false,
  isProfileComplete: true,
};

const DEFAULT_CERTIFICATES: UploadedCertificate[] = [
  {
    id: 'cert-10th-ssc',
    userId: 'usr-student-ap-01',
    fileName: 'AP_SSC_Board_Marks_Memo.pdf',
    fileType: 'pdf',
    fileSizeKb: 340,
    uploadedAt: '2026-08-10',
    category: '10th Marksheet / DOB',
    ocrExtractedData: {
      candidateName: 'KRISHNAVENI SADHU',
      dateOfBirth: '2003-08-16',
      qualificationTitle: 'Secondary School Certificate (SSC)',
      institutionOrBoard: 'Board of Secondary Education, Andhra Pradesh',
      branch: 'General',
      scoreOrPercentage: '9.8 GPA',
      yearOfPassing: 2019,
      certificateNumber: 'SSC-AP-892104',
      issueDate: '2019-05-12',
      isConfirmedByUser: true,
      confidenceScore: 0.98,
      potentialIssueNotes: 'Clear DOB verified against SSC matriculation database.',
    },
    isPotentiallyExpired: false,
    verificationDisclaimer:
      'Extracted via Document AI. Confirmed by candidate. Official verification happens during physical certificate scrutiny.',
  },
  {
    id: 'cert-inter-12th',
    userId: 'usr-student-ap-01',
    fileName: 'Intermediate_BIEAP_PassCert.pdf',
    fileType: 'pdf',
    fileSizeKb: 410,
    uploadedAt: '2026-08-10',
    category: '12th Marksheet',
    ocrExtractedData: {
      candidateName: 'KRISHNAVENI SADHU',
      dateOfBirth: '2003-08-16',
      qualificationTitle: 'Board of Intermediate Education Certificate',
      institutionOrBoard: 'Board of Intermediate Education, Andhra Pradesh',
      branch: 'Mathematics, Physics, Chemistry (MPC)',
      scoreOrPercentage: '94.2%',
      yearOfPassing: 2021,
      certificateNumber: 'BIEAP-2021-94812',
      issueDate: '2021-06-25',
      isConfirmedByUser: true,
      confidenceScore: 0.96,
      potentialIssueNotes: 'All subject marks clearly legible.',
    },
    isPotentiallyExpired: false,
    verificationDisclaimer:
      'Extracted via Document AI. Confirmed by candidate. Official verification happens during physical certificate scrutiny.',
  },
  {
    id: 'cert-btech-sem',
    userId: 'usr-student-ap-01',
    fileName: 'BTech_Consolidated_Semesters_JNTU.pdf',
    fileType: 'pdf',
    fileSizeKb: 520,
    uploadedAt: '2026-08-15',
    category: 'Semester Marks Memo',
    ocrExtractedData: {
      candidateName: 'KRISHNAVENI SADHU',
      qualificationTitle: 'Bachelor of Technology (Semester Grade Sheets 1-6)',
      institutionOrBoard: 'Jawaharlal Nehru Technological University (JNTUK)',
      branch: 'Computer Science & Engineering',
      scoreOrPercentage: '8.45 CGPA (First Class with Distinction)',
      yearOfPassing: 2026,
      certificateNumber: 'JNTUK-CSE-220491',
      issueDate: '2026-07-10',
      isConfirmedByUser: true,
      confidenceScore: 0.94,
      potentialIssueNotes: 'Semesters 1 through 6 passed with no standing backlogs.',
    },
    isPotentiallyExpired: false,
    verificationDisclaimer:
      'Extracted via Document AI. Confirmed by candidate. Final Degree / Provisional required upon graduation.',
  },
  {
    id: 'cert-caste-obc',
    userId: 'usr-student-ap-01',
    fileName: 'AP_Integrated_Community_OBC_Certificate.pdf',
    fileType: 'pdf',
    fileSizeKb: 280,
    uploadedAt: '2026-08-20',
    category: 'Caste / Category Certificate',
    ocrExtractedData: {
      candidateName: 'KRISHNAVENI SADHU',
      qualificationTitle: 'Integrated Community, Nativity & Date of Birth Certificate',
      institutionOrBoard: 'Revenue Department, Government of Andhra Pradesh (Tahsildar)',
      branch: 'BC-D (Backward Class - Non Creamy Layer)',
      certificateNumber: 'AP-REV-NCL-2026-8912',
      issueDate: '2026-04-18',
      expiryDate: '2027-03-31',
      isConfirmedByUser: true,
      confidenceScore: 0.95,
      potentialIssueNotes: 'Non-Creamy Layer valid for Financial Year 2026-27. In order.',
    },
    isPotentiallyExpired: false,
    verificationDisclaimer:
      'Extracted via Document AI. Confirmed by candidate. Official verification happens during physical certificate scrutiny.',
  },
];

const DEFAULT_NOTIFICATIONS: NotificationAlert[] = [
  {
    id: 'notif-1',
    title: 'Deadline Approaching: APPSC Group 1 Services',
    message: 'Application window closes on October 25, 2026. 168 vacancies across Andhra Pradesh.',
    date: 'Today',
    type: 'deadline',
    read: false,
    linkJobId: 'ap-appsc-group1-2026',
  },
  {
    id: 'notif-2',
    title: 'New Cybersecurity Opening: CERT-In Research Internship',
    message: 'Paid government internship (₹20,000/mo) accepting 2nd, 3rd, and Final year students.',
    date: 'Yesterday',
    type: 'new_job',
    read: false,
    linkJobId: 'intern-cert-in-cyber-student',
  },
  {
    id: 'notif-3',
    title: 'Mahila Police Battalion Recruitment Open',
    message: '1,420 Constable vacancies exclusive for women in Andhra Pradesh. Zero application fee for eligible categories.',
    date: '3 days ago',
    type: 'new_job',
    read: true,
    linkJobId: 'ap-police-women-constable-2026',
  },
  {
    id: 'notif-4',
    title: 'Certificate Verification Ready',
    message: 'Your 10th and 12th certificates are confirmed. Ensure Provisional Degree is uploaded once results are notified.',
    date: '1 week ago',
    type: 'doc_expiry',
    read: true,
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('govtjob_ai_user');
      return saved ? JSON.parse(saved) : DEFAULT_USER_PROFILE;
    } catch {
      return DEFAULT_USER_PROFILE;
    }
  });

  const [activeTab, setActiveTab] = useState<string>('home');
  const [opportunities, setOpportunities] = useState<JobOpportunity[]>(() => {
    try {
      const saved = localStorage.getItem('govtjob_ai_opportunities');
      return saved ? JSON.parse(saved) : INITIAL_JOB_OPPORTUNITIES;
    } catch {
      return INITIAL_JOB_OPPORTUNITIES;
    }
  });

  const [certificates, setCertificates] = useState<UploadedCertificate[]>(() => {
    try {
      const saved = localStorage.getItem('govtjob_ai_certificates');
      return saved ? JSON.parse(saved) : DEFAULT_CERTIFICATES;
    } catch {
      return DEFAULT_CERTIFICATES;
    }
  });

  const [trackedApplications, setTrackedApplications] = useState<ApplicationTrackingRecord[]>(() => {
    try {
      const saved = localStorage.getItem('govtjob_ai_tracking');
      return saved
        ? JSON.parse(saved)
        : [
            {
              jobId: 'ap-scsoc-cyber-analyst',
              status: 'Planning to Apply',
              notes: 'Preparing hands-on CTF writeups and reviewing Wazuh SIEM logs.',
              updatedAt: '2026-09-25',
            },
            {
              jobId: 'intern-cert-in-cyber-student',
              status: 'Applied',
              notes: 'Submitted NOC from Principal and GitHub repository link.',
              appliedDate: '2026-09-20',
              applicationRefNumber: 'CERTIN-INT-2026-904',
              updatedAt: '2026-09-20',
            },
            {
              jobId: 'ap-appsc-group1-2026',
              status: 'Saved',
              notes: 'Checked syllabus for General Studies & Mental Ability.',
              updatedAt: '2026-09-18',
            },
          ];
    } catch {
      return [];
    }
  });

  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('govtjob_ai_saved_jobs');
      return saved ? JSON.parse(saved) : ['ap-scsoc-cyber-analyst', 'intern-cert-in-cyber-student', 'ap-appsc-group1-2026', 'central-ssc-cgl-2026'];
    } catch {
      return ['ap-scsoc-cyber-analyst', 'intern-cert-in-cyber-student'];
    }
  });

  const [notifications, setNotifications] = useState<NotificationAlert[]>(() => {
    try {
      const saved = localStorage.getItem('govtjob_ai_notifications');
      return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATIONS;
    } catch {
      return DEFAULT_NOTIFICATIONS;
    }
  });

  const [selectedJobForDetail, setSelectedJobForDetail] = useState<JobOpportunity | null>(null);
  const [selectedJobForEligibility, setSelectedJobForEligibility] = useState<JobOpportunity | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileWizardOpen, setIsProfileWizardOpen] = useState(false);

  const [n8nConfig, setN8nConfig] = useState<N8nConfig>(() => {
    const DEFAULT_N8N_ID = '6172d2e9ccd14cd4926fb4d5a424bfd9';
    const DEFAULT_N8N_URL = 'https://krishnaveni-2008.app.n8n.cloud/webhook/80cc71d7-4ad5-42b7-aa1a-cf3e7d72f611/chat';

    try {
      const saved = localStorage.getItem('govtjob_ai_n8n_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Automatically inject valid URL and ID if missing or outdated
        return {
          webhookId: parsed.webhookId && parsed.webhookId.length > 5 ? parsed.webhookId : DEFAULT_N8N_ID,
          webhookUrl: parsed.webhookUrl && parsed.webhookUrl.startsWith('http') ? parsed.webhookUrl : DEFAULT_N8N_URL,
          isEnabled: parsed.isEnabled !== undefined ? parsed.isEnabled : true,
          connectionStatus: parsed.connectionStatus || 'connected',
          lastTestedAt: parsed.lastTestedAt || 'Active',
        };
      }
      return {
        webhookId: DEFAULT_N8N_ID,
        webhookUrl: DEFAULT_N8N_URL,
        isEnabled: true,
        connectionStatus: 'connected',
        lastTestedAt: 'Active',
      };
    } catch {
      return {
        webhookId: DEFAULT_N8N_ID,
        webhookUrl: DEFAULT_N8N_URL,
        isEnabled: true,
        connectionStatus: 'connected',
        lastTestedAt: 'Active',
      };
    }
  });

  const updateN8nConfig = (updated: Partial<N8nConfig>) => {
    setN8nConfig((prev) => {
      const next = { ...prev, ...updated };
      localStorage.setItem('govtjob_ai_n8n_config', JSON.stringify(next));
      return next;
    });
  };

  // Sync to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('govtjob_ai_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('govtjob_ai_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('govtjob_ai_opportunities', JSON.stringify(opportunities));
  }, [opportunities]);

  useEffect(() => {
    localStorage.setItem('govtjob_ai_certificates', JSON.stringify(certificates));
  }, [certificates]);

  useEffect(() => {
    localStorage.setItem('govtjob_ai_tracking', JSON.stringify(trackedApplications));
  }, [trackedApplications]);

  useEffect(() => {
    localStorage.setItem('govtjob_ai_saved_jobs', JSON.stringify(savedJobIds));
  }, [savedJobIds]);

  useEffect(() => {
    localStorage.setItem('govtjob_ai_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const login = (email: string, demoRole?: 'student' | 'cyber' | 'women') => {
    if (demoRole === 'cyber') {
      setUser({
        ...DEFAULT_USER_PROFILE,
        id: 'usr-cyber-pro',
        email: email || 'cyber.specialist@example.com',
        fullName: 'Rahul Sharma',
        gender: 'Male',
        currentStatus: 'Recent Graduate',
        currentYearOfStudy: 'Recent Graduate',
        graduationYear: 2025,
        educationLevel: 'B.Tech / B.E.',
        currentDegreeAndBranch: 'Cyber Security & Forensic Engineering',
        preferredCategories: ['cybersecurity', 'central_govt', 'andhra_pradesh'],
      });
    } else if (demoRole === 'women') {
      setUser({
        ...DEFAULT_USER_PROFILE,
        id: 'usr-women-aspirant',
        email: email || 'ananya.aspirant@example.com',
        fullName: 'Ananya Varma',
        gender: 'Female',
        state: 'Andhra Pradesh',
        district: 'Guntur',
        currentStatus: 'Recent Graduate',
        currentYearOfStudy: 'Recent Graduate',
        graduationYear: 2025,
        educationLevel: 'Graduate',
        currentDegreeAndBranch: 'Commerce & Management (B.Com)',
        preferredCategories: ['women_exclusive', 'andhra_pradesh', 'central_govt'],
      });
    } else {
      setUser({
        ...DEFAULT_USER_PROFILE,
        email: email || DEFAULT_USER_PROFILE.email,
      });
    }
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...updated } : ({ ...DEFAULT_USER_PROFILE, ...updated } as UserProfile)));
  };

  const addCertificate = (cert: UploadedCertificate) => {
    setCertificates((prev) => [cert, ...prev]);
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'New Document Added',
        message: `Successfully uploaded ${cert.fileName} under category '${cert.category}'.`,
        date: 'Just now',
        type: 'system',
        read: false,
      },
      ...prev,
    ]);
  };

  const updateCertificate = (id: string, updated: Partial<UploadedCertificate>) => {
    setCertificates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
    );
  };

  const deleteCertificate = (id: string) => {
    setCertificates((prev) => prev.filter((c) => c.id !== id));
  };

  const toggleSaveJob = (jobId: string) => {
    setSavedJobIds((prev) => {
      const exists = prev.includes(jobId);
      if (exists) {
        return prev.filter((id) => id !== jobId);
      } else {
        return [...prev, jobId];
      }
    });
  };

  const updateTrackingStatus = (
    jobId: string,
    status: ApplicationTrackingStatus,
    notes?: string,
    refNum?: string,
    examDate?: string
  ) => {
    setTrackedApplications((prev) => {
      const existingIndex = prev.findIndex((t) => t.jobId === jobId);
      const newRecord: ApplicationTrackingRecord = {
        jobId,
        status,
        notes: notes || '',
        applicationRefNumber: refNum,
        examDate,
        updatedAt: new Date().toISOString().split('T')[0],
      };

      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = { ...copy[existingIndex], ...newRecord };
        return copy;
      } else {
        return [newRecord, ...prev];
      }
    });
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const addJobOpportunity = (job: JobOpportunity) => {
    setOpportunities((prev) => [job, ...prev]);
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'New Official Notification Published',
        message: `${job.title} - ${job.organization}`,
        date: 'Just now',
        type: 'new_job',
        read: false,
        linkJobId: job.id,
      },
      ...prev,
    ]);
  };

  const updateJobOpportunity = (id: string, updated: Partial<JobOpportunity>) => {
    setOpportunities((prev) =>
      prev.map((j) => (j.id === id ? { ...j, ...updated } : j))
    );
  };

  const deleteJobOpportunity = (id: string) => {
    setOpportunities((prev) => prev.filter((j) => j.id !== id));
  };

  const clearAllUserData = () => {
    setUser(null);
    setCertificates([]);
    setTrackedApplications([]);
    setSavedJobIds([]);
    localStorage.removeItem('govtjob_ai_user');
    localStorage.removeItem('govtjob_ai_certificates');
    localStorage.removeItem('govtjob_ai_tracking');
    localStorage.removeItem('govtjob_ai_saved_jobs');
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        activeTab,
        setActiveTab,
        opportunities,
        certificates,
        trackedApplications,
        savedJobIds,
        notifications,
        unreadNotificationCount,
        selectedJobForDetail,
        setSelectedJobForDetail,
        selectedJobForEligibility,
        setSelectedJobForEligibility,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isProfileWizardOpen,
        setIsProfileWizardOpen,
        n8nConfig,
        updateN8nConfig,
        login,
        logout,
        updateProfile,
        addCertificate,
        updateCertificate,
        deleteCertificate,
        toggleSaveJob,
        updateTrackingStatus,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addJobOpportunity,
        updateJobOpportunity,
        deleteJobOpportunity,
        clearAllUserData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
