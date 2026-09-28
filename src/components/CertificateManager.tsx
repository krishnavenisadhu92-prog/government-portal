import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  UploadedCertificate,
  CertificateCategory,
  ExtractedDocumentData,
} from '../types';
import {
  FileCheck2,
  UploadCloud,
  FileText,
  Trash2,
  Eye,
  Download,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Calendar,
  Lock,
  Loader2,
  Plus,
  RefreshCw,
  Info,
  X,
} from 'lucide-react';

const DOCUMENT_CATEGORIES: CertificateCategory[] = [
  '10th Marksheet / DOB',
  '12th Marksheet',
  'Diploma Certificate',
  'Degree Certificate',
  'Provisional Degree',
  'Semester Marks Memo',
  'Caste / Category Certificate',
  'EWS Certificate',
  'Income Certificate',
  'Domicile / Residence Certificate',
  'Disability Certificate',
  'Experience Certificate',
  'Internship Certificate',
  'Technical Certification',
  'Other Document',
];

export const CertificateManager: React.FC = () => {
  const { certificates, addCertificate, updateCertificate, deleteCertificate, user } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<CertificateCategory>('10th Marksheet / DOB');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Review & Confirmation Modal state
  const [pendingCertForConfirmation, setPendingCertForConfirmation] = useState<{
    file: File;
    category: CertificateCategory;
    extracted: ExtractedDocumentData;
    dataUrl: string;
  } | null>(null);

  // Preview Modal state
  const [viewingCert, setViewingCert] = useState<UploadedCertificate | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.pdf')) {
      setUploadError('Only PDF, JPG, and PNG documents are supported.');
      return;
    }

    // Validate size (max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      setUploadError('Document size exceeds maximum 15MB limit.');
      return;
    }

    setUploadError(null);
    setIsProcessing(true);

    try {
      // Read file to data URL
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;

        // Call server-side OCR endpoint
        const response = await fetch('/api/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileBase64: base64Data,
            mimeType: file.type || 'application/pdf',
            fileName: file.name,
            category: selectedCategory,
          }),
        });

        if (!response.ok) {
          throw new Error('Document intelligence extraction failed');
        }

        const resData = await response.json();
        const extracted: ExtractedDocumentData = {
          candidateName: resData.data.candidateName || user?.fullName || 'Candidate Name',
          dateOfBirth: resData.data.dateOfBirth || user?.dateOfBirth,
          qualificationTitle: resData.data.qualificationTitle || selectedCategory,
          institutionOrBoard: resData.data.institutionOrBoard || '',
          branch: resData.data.branch || user?.currentDegreeAndBranch || 'General',
          scoreOrPercentage: resData.data.scoreOrPercentage || '',
          yearOfPassing: resData.data.yearOfPassing || 2024,
          certificateNumber: resData.data.certificateNumber || '',
          issueDate: resData.data.issueDate || new Date().toISOString().split('T')[0],
          expiryDate: resData.data.expiryDate,
          potentialIssueNotes: resData.data.potentialIssueNotes,
          confidenceScore: resData.data.confidenceScore || 0.9,
          isConfirmedByUser: false,
        };

        // Open Confirmation Wizard
        setPendingCertForConfirmation({
          file,
          category: selectedCategory,
          extracted,
          dataUrl: base64Data,
        });

        setIsProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      };

      reader.onerror = () => {
        setIsProcessing(false);
        setUploadError('Failed to read the selected file.');
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setIsProcessing(false);
      setUploadError(err.message || 'Error processing document');
    }
  };

  const handleConfirmAndSave = () => {
    if (!pendingCertForConfirmation) return;

    const { file, category, extracted, dataUrl } = pendingCertForConfirmation;

    // Check if certificate might be expired (e.g. EWS/Income cert issued more than 1 financial year ago)
    const isEwsOrIncome = category.includes('EWS') || category.includes('Income') || category.includes('Caste');
    const isExpired = Boolean(
      extracted.expiryDate && new Date(extracted.expiryDate).getTime() < new Date().getTime()
    );

    const newCert: UploadedCertificate = {
      id: `cert-${Date.now()}`,
      userId: user?.id || 'usr-default',
      fileName: file.name,
      fileType: file.name.endsWith('.pdf') ? 'pdf' : 'png',
      fileSizeKb: Math.round(file.size / 1024),
      fileDataUrl: dataUrl,
      uploadedAt: new Date().toISOString().split('T')[0],
      category,
      ocrExtractedData: {
        ...extracted,
        isConfirmedByUser: true,
      },
      isPotentiallyExpired: isExpired,
      verificationDisclaimer:
        'Extracted with Document AI and verified by user. Official validity will be scrutinized during physical document verification by the recruiting board.',
    };

    addCertificate(newCert);
    setPendingCertForConfirmation(null);
  };

  const downloadFile = (cert: UploadedCertificate) => {
    if (!cert.fileDataUrl) return;
    const a = document.createElement('a');
    a.href = cert.fileDataUrl;
    a.download = cert.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Missing documents analysis based on typical Indian recruitment expectations
  const uploadedCategories = certificates.map((c) => c.category);
  const checklist = [
    {
      category: '10th Marksheet / DOB' as CertificateCategory,
      title: '10th Class / SSC Matriculation (Mandatory DOB Proof)',
      isUploaded: uploadedCategories.includes('10th Marksheet / DOB'),
      reason: 'Required by UPSC, SSC, APPSC, RRB, and State Boards for Date of Birth verification.',
    },
    {
      category: '12th Marksheet' as CertificateCategory,
      title: 'Intermediate / 12th Standard Certificate',
      isUploaded: uploadedCategories.includes('12th Marksheet'),
      reason: 'Required for all undergraduate recruitments, police constables, and NITI Aayog eligibility.',
    },
    {
      category: 'Degree Certificate' as CertificateCategory,
      title: 'Bachelor / Graduation Degree or Provisional',
      isUploaded:
        uploadedCategories.includes('Degree Certificate') ||
        uploadedCategories.includes('Provisional Degree') ||
        uploadedCategories.includes('Semester Marks Memo'),
      reason: 'Mandatory for Group 1, Group 2, SSC CGL, Banking PO, and technical jobs.',
    },
    {
      category: 'Domicile / Residence Certificate' as CertificateCategory,
      title: 'Domicile / AP Local Candidate Study Certificate',
      isUploaded: uploadedCategories.includes('Domicile / Residence Certificate'),
      reason: 'Crucial to claim 80% AP state local candidate reservation quota.',
    },
    {
      category: 'Caste / Category Certificate' as CertificateCategory,
      title: 'Integrated Community Certificate (OBC-NCL / SC / ST / EWS)',
      isUploaded:
        uploadedCategories.includes('Caste / Category Certificate') ||
        uploadedCategories.includes('EWS Certificate'),
      reason: 'Required to claim age relaxations, fee concessions, and reserved category vacancies.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title & Privacy Guarantee Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-2 text-amber-400 font-semibold text-xs tracking-wider uppercase">
            <Lock className="w-4 h-4" /> Secure Client-Side Document Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Document Intelligence & Certificate Vault
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Upload your academic marksheets, degree certificates, and reservation credentials in PDF, JPG, or PNG. Our AI extracts key details so you don’t have to re-enter them for every exam, and checks for upcoming expirations.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-300">
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Private & Encrypted
            </span>
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700">
              <CheckCircle2 className="w-4 h-4 text-blue-400" /> Never Shared Publicly
            </span>
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700">
              <RefreshCw className="w-4 h-4 text-amber-400" /> AI OCR Extraction
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Upload Center + Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Upload Component */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-blue-600" /> Upload New Certificate
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Document Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as CertificateCategory)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                >
                  {DOCUMENT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isProcessing
                    ? 'border-blue-400 bg-blue-50/50'
                    : 'border-slate-300 hover:border-blue-500 hover:bg-slate-50/80'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,image/png,image/jpeg,image/jpg"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isProcessing}
                />

                {isProcessing ? (
                  <div className="py-4 space-y-3">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Running Document Intelligence...</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Extracting candidate name, marks, year, and board details.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-2 space-y-2">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                      <FileCheck2 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        Click or drag document to upload
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Supports PDF, JPG, PNG (Max 15MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {uploadError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 space-y-1">
                <div className="font-semibold text-slate-700 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-blue-500" /> Confirmation Workflow
                </div>
                <p>
                  Extracted information will be presented for your confirmation before saving. We never claim a document is officially verified until scrutinized by the recruitment authority.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Missing Certificates Checklist */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Document Readiness & Missing Certificate Checker
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verify essential certificates needed for Andhra Pradesh & Central recruitments.
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {certificates.length} Verified in Vault
              </span>
            </div>

            <div className="space-y-3">
              {checklist.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                    item.isUploaded
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-amber-50/50 border-amber-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {item.isUploaded ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{item.title}</span>
                        {item.isUploaded ? (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                            Available in Vault
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full">
                            Pending Upload
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.reason}</p>
                    </div>
                  </div>

                  {!item.isUploaded && (
                    <button
                      onClick={() => {
                        setSelectedCategory(item.category);
                        fileInputRef.current?.click();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shrink-0 transition-colors"
                    >
                      Upload
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Vault List Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Confirmed Documents in Your Vault</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Permanently stored on your device. You can preview, download, replace, or delete anytime.
            </p>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            {certificates.length} document(s) registered
          </div>
        </div>

        {certificates.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <FileText className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No certificates uploaded yet.</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Start by uploading your 10th marksheet or graduation degree to unlock automated eligibility checks.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificates.map((cert) => {
              const data = cert.ocrExtractedData;
              return (
                <div
                  key={cert.id}
                  className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:border-blue-300 transition-all hover:shadow-md"
                >
                  <div>
                    {/* Category pill & Actions */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-800 truncate">
                        {cert.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setViewingCert(cert)}
                          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600"
                          title="View Extracted Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => downloadFile(cert)}
                          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600"
                          title="Download Document"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteCertificate(cert.id)}
                          className="p-1.5 rounded-lg hover:bg-red-100 text-red-600"
                          title="Permanently Delete Document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 truncate mb-1" title={cert.fileName}>
                      {cert.fileName}
                    </h4>

                    {/* Extracted Details summary */}
                    <div className="space-y-1 text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100 mt-2">
                      {data.candidateName && (
                        <div className="truncate">
                          <span className="text-slate-400">Name: </span>
                          <span className="font-semibold text-slate-800">{data.candidateName}</span>
                        </div>
                      )}
                      {data.qualificationTitle && (
                        <div className="truncate">
                          <span className="text-slate-400">Title: </span>
                          <span className="text-slate-800">{data.qualificationTitle}</span>
                        </div>
                      )}
                      {data.scoreOrPercentage && (
                        <div>
                          <span className="text-slate-400">Score: </span>
                          <span className="font-semibold text-emerald-700">{data.scoreOrPercentage}</span>
                        </div>
                      )}
                      {data.certificateNumber && (
                        <div className="truncate font-mono text-[10px]">
                          <span className="text-slate-400">Cert No: </span>
                          <span className="text-slate-700">{data.certificateNumber}</span>
                        </div>
                      )}
                    </div>

                    {cert.isPotentiallyExpired && (
                      <div className="mt-2 p-2 bg-amber-50 rounded-lg border border-amber-200 text-[10px] text-amber-800 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                        <span>Potentially expired or renewal required.</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/70 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Uploaded: {cert.uploadedAt}</span>
                    <span className="font-mono">{cert.fileSizeKb} KB</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation & Inspection Wizard Modal */}
      {pendingCertForConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 text-white p-6 relative">
              <button
                onClick={() => setPendingCertForConfirmation(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" /> AI OCR Extraction Confirmation
              </div>
              <h3 className="text-lg font-bold text-white">
                Verify Extracted Certificate Details
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Please verify and correct any field before storing this document in your vault.
              </p>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Candidate Full Name
                  </label>
                  <input
                    type="text"
                    value={pendingCertForConfirmation.extracted.candidateName || ''}
                    onChange={(e) =>
                      setPendingCertForConfirmation({
                        ...pendingCertForConfirmation,
                        extracted: {
                          ...pendingCertForConfirmation.extracted,
                          candidateName: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Date of Birth (YYYY-MM-DD)
                  </label>
                  <input
                    type="text"
                    value={pendingCertForConfirmation.extracted.dateOfBirth || ''}
                    onChange={(e) =>
                      setPendingCertForConfirmation({
                        ...pendingCertForConfirmation,
                        extracted: {
                          ...pendingCertForConfirmation.extracted,
                          dateOfBirth: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Qualification Title / Certificate Name
                </label>
                <input
                  type="text"
                  value={pendingCertForConfirmation.extracted.qualificationTitle || ''}
                  onChange={(e) =>
                    setPendingCertForConfirmation({
                      ...pendingCertForConfirmation,
                      extracted: {
                        ...pendingCertForConfirmation.extracted,
                        qualificationTitle: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Issuing Board / University / Authority
                  </label>
                  <input
                    type="text"
                    value={pendingCertForConfirmation.extracted.institutionOrBoard || ''}
                    onChange={(e) =>
                      setPendingCertForConfirmation({
                        ...pendingCertForConfirmation,
                        extracted: {
                          ...pendingCertForConfirmation.extracted,
                          institutionOrBoard: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Branch / Stream / Subject
                  </label>
                  <input
                    type="text"
                    value={pendingCertForConfirmation.extracted.branch || ''}
                    onChange={(e) =>
                      setPendingCertForConfirmation({
                        ...pendingCertForConfirmation,
                        extracted: {
                          ...pendingCertForConfirmation.extracted,
                          branch: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Marks / CGPA
                  </label>
                  <input
                    type="text"
                    value={pendingCertForConfirmation.extracted.scoreOrPercentage || ''}
                    onChange={(e) =>
                      setPendingCertForConfirmation({
                        ...pendingCertForConfirmation,
                        extracted: {
                          ...pendingCertForConfirmation.extracted,
                          scoreOrPercentage: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Year of Passing
                  </label>
                  <input
                    type="number"
                    value={pendingCertForConfirmation.extracted.yearOfPassing || 2024}
                    onChange={(e) =>
                      setPendingCertForConfirmation({
                        ...pendingCertForConfirmation,
                        extracted: {
                          ...pendingCertForConfirmation.extracted,
                          yearOfPassing: parseInt(e.target.value, 10),
                        },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Cert / Roll Number
                  </label>
                  <input
                    type="text"
                    value={pendingCertForConfirmation.extracted.certificateNumber || ''}
                    onChange={(e) =>
                      setPendingCertForConfirmation({
                        ...pendingCertForConfirmation,
                        extracted: {
                          ...pendingCertForConfirmation.extracted,
                          certificateNumber: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              {pendingCertForConfirmation.extracted.potentialIssueNotes && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-[11px] flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <span>{pendingCertForConfirmation.extracted.potentialIssueNotes}</span>
                </div>
              )}

              <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Confirming this document will link its credentials to your automated eligibility analysis.
                </span>
              </div>
            </div>

            <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setPendingCertForConfirmation(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAndSave}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Confirm & Save into Vault
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {viewingCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 text-white p-6 relative flex items-center justify-between">
              <div>
                <span className="text-xs text-amber-400 font-bold uppercase block">
                  {viewingCert.category}
                </span>
                <h3 className="text-base font-bold text-white">{viewingCert.fileName}</h3>
              </div>
              <button
                onClick={() => setViewingCert(null)}
                className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 flex-1">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">Candidate Name</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {viewingCert.ocrExtractedData.candidateName || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Date of Birth</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {viewingCert.ocrExtractedData.dateOfBirth || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Qualification Title</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {viewingCert.ocrExtractedData.qualificationTitle || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Board / Institution</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {viewingCert.ocrExtractedData.institutionOrBoard || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Score / Marks</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    {viewingCert.ocrExtractedData.scoreOrPercentage || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Passing Year</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {viewingCert.ocrExtractedData.yearOfPassing || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-blue-50 text-blue-900 rounded-xl border border-blue-200 text-[11px]">
                {viewingCert.verificationDisclaimer}
              </div>
            </div>

            <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-2">
              <button
                onClick={() => downloadFile(viewingCert)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Download File
              </button>
              <button
                onClick={() => setViewingCert(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
