export type OpportunityCategory =
  | 'andhra_pradesh'
  | 'central_govt'
  | 'other_states'
  | 'cybersecurity'
  | 'internship'
  | 'women_exclusive';

export type WorkMode = 'In-Person' | 'Remote' | 'Hybrid';
export type EmploymentType = 'Permanent' | 'Contract' | 'Internship' | 'Apprenticeship' | 'Fellowship';

export type StudentYearEligibility =
  | '1st Year'
  | '2nd Year'
  | '3rd Year'
  | 'Final Year'
  | 'Recent Graduate'
  | 'Diploma'
  | 'Postgraduate';

export type SourceVerificationStatus =
  | 'Verified Official'
  | 'Official Gazette'
  | 'Ministry Portal'
  | 'Authorized PSU Feed';

export interface JobOpportunity {
  id: string;
  title: string;
  organization: string;
  category: OpportunityCategory;
  subcategory: string; // e.g., 'APPSC', 'AP Police', 'UPSC', 'SSC', 'RRB', 'CERT-In', 'NITI Aayog', etc.
  department: string;
  notificationNumber: string;
  vacanciesCount: number;
  payScaleOrStipend: string;
  location: string;
  stateOrRegion: string;
  workMode: WorkMode;
  employmentType: EmploymentType;
  isCybersecurity: boolean;
  isInternship: boolean;
  isWomenExclusive: boolean;
  isOpenToWomen: boolean;
  isPaid: boolean;
  internshipDuration?: string;
  studentEligibilityYears?: StudentYearEligibility[];
  educationalQualifications: string[];
  eligibleBranches: string[];
  minimumPercentageOrCgpa?: number;
  ageLimit: {
    min: number;
    max: number;
    relaxationDetails: string;
  };
  selectionProcess: string[];
  requiredCertificates: string[];
  applicationStartDate: string;
  applicationDeadline: string;
  examinationDate?: string;
  officialNotificationUrl: string;
  officialApplicationUrl: string;
  publicationDate: string;
  lastVerifiedDate: string;
  sourceVerificationStatus: SourceVerificationStatus;
  summaryDescription: string;
  keyResponsibilities?: string[];
  technicalSkillsRequired?: string[];
  fees?: string;
  quotaAndRelaxationNotes?: string;
  isSectorPrivate?: boolean;
}

export type CertificateCategory =
  | '10th Marksheet / DOB'
  | '12th Marksheet'
  | 'Diploma Certificate'
  | 'Degree Certificate'
  | 'Provisional Degree'
  | 'Semester Marks Memo'
  | 'Caste / Category Certificate'
  | 'EWS Certificate'
  | 'Income Certificate'
  | 'Domicile / Residence Certificate'
  | 'Disability Certificate'
  | 'Experience Certificate'
  | 'Internship Certificate'
  | 'Technical Certification'
  | 'Other Document';

export interface ExtractedDocumentData {
  candidateName?: string;
  dateOfBirth?: string;
  qualificationTitle?: string;
  institutionOrBoard?: string;
  branch?: string;
  scoreOrPercentage?: string;
  yearOfPassing?: number;
  issueDate?: string;
  expiryDate?: string;
  certificateNumber?: string;
  isConfirmedByUser: boolean;
  confidenceScore: number;
  potentialIssueNotes?: string;
}

export interface UploadedCertificate {
  id: string;
  userId: string;
  fileName: string;
  fileType: 'pdf' | 'jpg' | 'png';
  fileSizeKb: number;
  fileDataUrl?: string; // stored client-side for viewing/download
  uploadedAt: string;
  category: CertificateCategory;
  ocrExtractedData: ExtractedDocumentData;
  isPotentiallyExpired: boolean;
  verificationDisclaimer: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  state: string;
  district: string;
  domicileState: string;
  educationLevel: string; // '10th' | '12th' | 'Diploma' | 'B.Tech / B.E.' | 'B.Sc' | 'BCA' | 'M.Tech' | 'MCA' | 'MBA' | 'Graduate' | 'Postgraduate';
  currentDegreeAndBranch: string; // e.g. 'Computer Science & Engineering', 'Information Technology', 'Civil Engineering', etc.
  currentStatus: 'Student' | 'Recent Graduate' | 'Experienced Professional';
  currentYearOfStudy: StudentYearEligibility;
  graduationYear: number;
  academicScorePercentage: number;
  technicalSkills: string[];
  nonTechnicalSkills: string[];
  workExperience: string;
  projectsAndAchievements: string;
  preferredCategories: OpportunityCategory[];
  preferredLocations: string[];
  workModePreference: 'Remote' | 'Hybrid' | 'In-Person' | 'Any';
  preferredEmploymentType: 'Permanent' | 'Contract' | 'Internship' | 'Apprenticeship' | 'Any';
  expectedSalaryOrStipend: string;
  preferredLanguages: string[];
  reservationCategory: 'General / UR' | 'OBC-NCL' | 'SC' | 'ST' | 'EWS' | 'Prefer not to disclose';
  isDisabilityEligible: boolean;
  isProfileComplete: boolean;
}

export type ApplicationTrackingStatus =
  | 'Saved'
  | 'Planning to Apply'
  | 'Applied'
  | 'Exam Scheduled'
  | 'Result Published'
  | 'Closed';

export interface ApplicationTrackingRecord {
  jobId: string;
  status: ApplicationTrackingStatus;
  notes: string;
  appliedDate?: string;
  examDate?: string;
  applicationRefNumber?: string;
  updatedAt: string;
}

export interface NotificationAlert {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'deadline' | 'new_job' | 'exam' | 'doc_expiry' | 'system';
  read: boolean;
  linkJobId?: string;
}

export interface EligibilityCriterion {
  title: string;
  status: 'pass' | 'warning' | 'fail';
  detail: string;
  officialRuleCiting?: string;
}

export interface EligibilityAnalysisResult {
  jobId: string;
  status: 'ELIGIBLE' | 'POTENTIALLY_ELIGIBLE' | 'NOT_ELIGIBLE';
  overallScore: number; // 0 - 100
  headline: string;
  criteria: EligibilityCriterion[];
  missingDocumentsOrInfo: string[];
  relaxationsApplicable: string[];
  officialDisclaimer: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  suggestedActions?: { label: string; actionType: string; payload?: string }[];
  referencedJobId?: string;
  source?: 'gemini' | 'n8n' | 'system';
  n8nStatus?: 'success' | 'fallback' | 'testing';
}

export interface N8nConfig {
  webhookId: string;
  webhookUrl: string;
  isEnabled: boolean;
  lastTestedAt?: string;
  connectionStatus: 'connected' | 'untested' | 'error';
  errorDetails?: string;
}
