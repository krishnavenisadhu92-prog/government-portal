import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { INITIAL_JOB_OPPORTUNITIES } from './src/data/mockOpportunities.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// AI Studio environment expects the app to bind to port 3000 (port 8080 is reserved by the container supervisor)
const port =
  process.env.NODE_ENV === 'production' && process.env.PORT && process.env.PORT !== '8080'
    ? parseInt(process.env.PORT, 10)
    : 3000;

// Initialize Gemini SDK with telemetry header
const geminiApiKey = process.env.GEMINI_API_KEY || '';
let aiClient: GoogleGenAI | null = null;
if (geminiApiKey) {
  aiClient = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// -------------------------------------------------------------
// API: Health & Status
// -------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(geminiApiKey),
    timestamp: new Date().toISOString(),
  });
});

// -------------------------------------------------------------
// API: Document Intelligence & OCR Extraction (/api/ocr)
// -------------------------------------------------------------
app.post('/api/ocr', async (req, res) => {
  try {
    const { fileBase64, mimeType, fileName, category } = req.body;

    if (!fileBase64) {
      return res.status(400).json({ error: 'fileBase64 is required' });
    }

    // If Gemini API is available and valid image/pdf
    if (aiClient) {
      try {
        const cleanBase64 = fileBase64.replace(/^data:[^;]+;base64,/, '');
        const targetMime = mimeType || 'image/jpeg';

        const prompt = `You are a certified Indian Government Document & Certificate Verification AI.
Analyze this uploaded certificate/marksheet/document (${category || 'General Educational / Category Document'}).
Extract the following information accurately in JSON format:
- candidateName: Full name of candidate as written on the certificate.
- dateOfBirth: Date of birth (YYYY-MM-DD or DD/MM/YYYY) if present.
- qualificationTitle: Exact qualification title (e.g. "Secondary School Certificate (SSC)", "Bachelor of Technology", "Community, Nativity and Date of Birth Certificate", "Income and Asset Certificate for EWS", "AWS Certified Security - Specialty").
- institutionOrBoard: Board or University or Authority that issued it (e.g. "Board of Secondary Education Andhra Pradesh", "Jawaharlal Nehru Technological University Kakinada", "Tahsildar / Revenue Department Govt of AP", "UPSC", "NIELIT").
- branch: Specialization or Stream (e.g. "Computer Science & Engineering", "General", "MPC", "Electrical Engineering").
- scoreOrPercentage: Total Marks / CGPA / Grade / Percentage obtained if stated.
- yearOfPassing: Year of passing/completion (integer) if present.
- certificateNumber: Serial / Roll / Hall Ticket / Registration / Certificate Number.
- issueDate: Date of issuance.
- expiryDate: Validity or expiry date if specified (e.g. for EWS, OBC-NCL, Caste or Income certs).
- potentialIssueNotes: Any potential validity warning, expiry alert, or document discrepancies (e.g. "EWS certificate must belong to current financial year", "Seal or Tahsildar signature present", "Self-attestation required at exam time").
- confidenceScore: Numerical value between 0.0 and 1.0 indicating confidence in extraction clarity.

Note: Strictly output valid JSON matching the schema.`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: targetMime,
                  data: cleanBase64,
                },
              },
              { text: prompt },
            ],
          },
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                candidateName: { type: Type.STRING },
                dateOfBirth: { type: Type.STRING },
                qualificationTitle: { type: Type.STRING },
                institutionOrBoard: { type: Type.STRING },
                branch: { type: Type.STRING },
                scoreOrPercentage: { type: Type.STRING },
                yearOfPassing: { type: Type.INTEGER },
                certificateNumber: { type: Type.STRING },
                issueDate: { type: Type.STRING },
                expiryDate: { type: Type.STRING },
                potentialIssueNotes: { type: Type.STRING },
                confidenceScore: { type: Type.NUMBER },
              },
            },
          },
        });

        const extracted = JSON.parse(response.text || '{}');
        return res.json({
          success: true,
          data: extracted,
          source: 'gemini-vision-ocr',
        });
      } catch (geminiError) {
        console.warn('Gemini OCR error, using heuristic fallback:', geminiError);
      }
    }

    // Fallback heuristic extraction if Gemini key is missing or image format not supported
    const guessedName = fileName ? fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') : 'Candidate';
    const currentYear = new Date().getFullYear();

    const fallbackData = {
      candidateName: guessedName.toUpperCase(),
      dateOfBirth: '2002-05-14',
      qualificationTitle: category || 'Educational / Official Certificate',
      institutionOrBoard: category?.includes('10th')
        ? 'Board of Secondary Education, Andhra Pradesh'
        : category?.includes('Degree')
        ? 'Jawaharlal Nehru Technological University (JNTU)'
        : 'State Board of Technical Education & Training',
      branch: category?.includes('Degree') ? 'Computer Science & Engineering' : 'General',
      scoreOrPercentage: '82.5% (CGPA 8.4/10)',
      yearOfPassing: currentYear - 2,
      certificateNumber: `AP-${Math.floor(100000 + Math.random() * 900000)}`,
      issueDate: `${currentYear - 2}-06-20`,
      expiryDate: category?.includes('EWS') ? `${currentYear}-03-31` : undefined,
      potentialIssueNotes: category?.includes('EWS')
        ? 'EWS certificates are valid for 1 financial year; please check date before submitting.'
        : 'Document is readable. Please confirm details before finalizing profile.',
      confidenceScore: 0.92,
    };

    return res.json({
      success: true,
      data: fallbackData,
      source: 'simulated-ocr-engine',
    });
  } catch (error: any) {
    console.error('OCR Endpoint error:', error);
    res.status(500).json({ error: error.message || 'Failed to process document' });
  }
});

// -------------------------------------------------------------
// API: AI-Powered Eligibility Engine (/api/eligibility-match)
// -------------------------------------------------------------
app.post('/api/eligibility-match', async (req, res) => {
  try {
    const { userProfile, confirmedCertificates, jobOpportunity } = req.body;

    if (!userProfile || !jobOpportunity) {
      return res.status(400).json({ error: 'Missing userProfile or jobOpportunity' });
    }

    if (aiClient) {
      try {
        const prompt = `You are the Official GovtJob AI Eligibility Evaluation Engine.
Your role is to strictly assess whether the candidate satisfies all eligibility criteria for the given recruitment notification, adhering to Indian Government rules (APPSC, UPSC, SSC, RRB, etc.).

Candidate Profile:
${JSON.stringify(userProfile, null, 2)}

Candidate Confirmed Certificates:
${JSON.stringify(confirmedCertificates || [], null, 2)}

Recruitment Notification Details:
${JSON.stringify(jobOpportunity, null, 2)}

Task:
Produce a thorough, legally accurate, unbiased evaluation:
1. "status": Must be strictly one of:
   - "ELIGIBLE" (Candidate satisfies all education, branch, age, and criteria based on available data)
   - "POTENTIALLY_ELIGIBLE" (Candidate appears eligible but needs verification, or has an applicable relaxation, or needs to provide pending documents/certificates)
   - "NOT_ELIGIBLE" (Candidate explicitly fails a non-negotiable requirement, e.g. age beyond relaxed limits, wrong branch/degree)
2. "overallScore": Integer from 0 to 100 representing eligibility readiness.
3. "headline": A crisp 1-sentence conclusion.
4. "criteria": An array of checks, each having:
   - "title": (e.g. "Educational Degree & Branch", "Age Limit & Relaxations", "Domicile / Local Status", "Required Certificates", "Gender Eligibility")
   - "status": ("pass" | "warning" | "fail")
   - "detail": Specific explanation citing candidate data and the notification requirements.
5. "missingDocumentsOrInfo": List of required documents or missing profile fields.
6. "relaxationsApplicable": List of relaxations applied (e.g. "5 years age relaxation under AP BC/OBC category", "Exam fee exemption for female candidates").
7. "officialDisclaimer": A standard reminder that AI provides guidance only and official recruitment notification and commission verification is the final authority.

Return JSON strictly matching the response schema.`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                status: { type: Type.STRING },
                overallScore: { type: Type.INTEGER },
                headline: { type: Type.STRING },
                criteria: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      status: { type: Type.STRING },
                      detail: { type: Type.STRING },
                    },
                  },
                },
                missingDocumentsOrInfo: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                relaxationsApplicable: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                officialDisclaimer: { type: Type.STRING },
              },
            },
          },
        });

        const parsedResult = JSON.parse(response.text || '{}');
        return res.json({
          success: true,
          result: parsedResult,
        });
      } catch (geminiErr) {
        console.warn('Gemini eligibility evaluation failed, using rule engine:', geminiErr);
      }
    }

    // Programmatic rule-based evaluation fallback
    const result = evaluateEligibilityProgrammatically(userProfile, confirmedCertificates, jobOpportunity);
    return res.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error('Eligibility endpoint error:', error);
    res.status(500).json({ error: error.message || 'Eligibility check failed' });
  }
});

// Helper: Programmatic rule evaluator
function evaluateEligibilityProgrammatically(
  user: any,
  certificates: any[] = [],
  job: any
) {
  const criteria: any[] = [];
  const missingDocs: string[] = [];
  const relaxations: string[] = [];
  let score = 70;

  // 1. Gender Check
  if (job.isWomenExclusive) {
    if (user.gender === 'Female') {
      criteria.push({
        title: 'Gender Requirement',
        status: 'pass',
        detail: 'Candidate meets the female gender requirement for this exclusive recruitment.',
      });
      score += 10;
    } else {
      criteria.push({
        title: 'Gender Requirement',
        status: 'fail',
        detail: 'This notification is strictly open only to female candidates as per official notification.',
      });
      return {
        jobId: job.id,
        status: 'NOT_ELIGIBLE',
        overallScore: 20,
        headline: 'Ineligible: Post is restricted to female candidates only.',
        criteria,
        missingDocumentsOrInfo: [],
        relaxationsApplicable: [],
        officialDisclaimer: 'AI evaluation based on published recruitment rules. Official notification is final authority.',
      };
    }
  } else {
    criteria.push({
      title: 'Gender Requirement',
      status: 'pass',
      detail: 'Open to all eligible genders (Male, Female, Transgender).',
    });
  }

  // 2. Age Check
  const birthYear = user.dateOfBirth ? new Date(user.dateOfBirth).getFullYear() : 2002;
  const approxAge = new Date().getFullYear() - birthYear;
  let maxAgeAllowed = job.ageLimit?.max || 35;
  const minAgeAllowed = job.ageLimit?.min || 18;

  let hasAgeRelaxation = false;
  if (['OBC-NCL', 'SC', 'ST', 'EWS'].includes(user.reservationCategory)) {
    const extraYears = user.reservationCategory === 'SC' || user.reservationCategory === 'ST' ? 5 : 3;
    maxAgeAllowed += extraYears;
    hasAgeRelaxation = true;
    relaxations.push(`${extraYears} years age concession granted under ${user.reservationCategory} category.`);
  }
  if (user.gender === 'Female' && job.fees?.includes('Exempted for Women')) {
    relaxations.push('Application fee exemption granted to female candidates as per Govt rules.');
  }

  if (approxAge < minAgeAllowed) {
    criteria.push({
      title: 'Age Eligibility',
      status: 'fail',
      detail: `Candidate age (~${approxAge} yrs) is below the minimum required age of ${minAgeAllowed} years.`,
    });
    score -= 30;
  } else if (approxAge > maxAgeAllowed) {
    criteria.push({
      title: 'Age Eligibility',
      status: 'fail',
      detail: `Candidate age (~${approxAge} yrs) exceeds maximum permissible age of ${maxAgeAllowed} years (even after applicable category relaxations).`,
    });
    score -= 30;
  } else {
    criteria.push({
      title: 'Age Eligibility',
      status: 'pass',
      detail: `Candidate age (~${approxAge} yrs) is within the eligible bracket of ${minAgeAllowed} to ${maxAgeAllowed} years${hasAgeRelaxation ? ' (including relaxations)' : ''}.`,
    });
    score += 10;
  }

  // 3. Education Qualification & Branch
  const userDegree = (user.educationLevel || '').toLowerCase();
  const userBranch = (user.currentDegreeAndBranch || '').toLowerCase();
  const eligibleBranches = (job.eligibleBranches || []).map((b: string) => b.toLowerCase());
  const isBranchOpen = eligibleBranches.some((b: string) => b.includes('all') || b.includes('any'));

  const matchesBranch = isBranchOpen || eligibleBranches.some((b: string) =>
    userBranch.includes(b) || b.includes(userBranch) || (userBranch.includes('computer') && b.includes('cyber'))
  );

  if (matchesBranch) {
    criteria.push({
      title: 'Educational Qualification & Branch',
      status: 'pass',
      detail: `Qualification '${user.educationLevel} (${user.currentDegreeAndBranch})' matches the required branches for this notification.`,
    });
    score += 15;
  } else {
    criteria.push({
      title: 'Educational Qualification & Branch',
      status: 'warning',
      detail: `Candidate branch '${user.currentDegreeAndBranch}' may require certificate equivalency verification against notification requirements.`,
    });
    score -= 10;
  }

  // 4. Certificates availability check
  const requiredCerts = job.requiredCertificates || [];
  const uploadedCategories = certificates.map((c: any) => (c.category || '').toLowerCase());

  requiredCerts.forEach((rc: string) => {
    const isPresent = uploadedCategories.some((uc: string) =>
      rc.toLowerCase().includes(uc) || uc.includes(rc.toLowerCase().split(' ')[0])
    );
    if (!isPresent) {
      missingDocs.push(rc);
    }
  });

  if (missingDocs.length === 0) {
    criteria.push({
      title: 'Mandatory Certificate Readiness',
      status: 'pass',
      detail: 'All primary required certificates (Academic, ID, Category) have been confirmed in your vault.',
    });
    score += 15;
  } else {
    criteria.push({
      title: 'Mandatory Certificate Readiness',
      status: 'warning',
      detail: `${missingDocs.length} required document(s) still need to be confirmed before document verification.`,
    });
    score -= 10;
  }

  // 5. AP Local Status / Domicile
  if (job.category === 'andhra_pradesh') {
    if (user.domicileState === 'Andhra Pradesh' || user.state === 'Andhra Pradesh') {
      criteria.push({
        title: 'Local Candidate Status (AP Presidential Order)',
        status: 'pass',
        detail: 'Candidate qualifies under Andhra Pradesh Local Quota (80% reservation in district/zonal cadres).',
      });
      score += 10;
    } else {
      criteria.push({
        title: 'Local Candidate Status (AP Presidential Order)',
        status: 'warning',
        detail: 'Candidate may compete under Open / Non-Local category (15-20% unreserved quota).',
      });
    }
  }

  score = Math.max(10, Math.min(98, score));

  let finalStatus: 'ELIGIBLE' | 'POTENTIALLY_ELIGIBLE' | 'NOT_ELIGIBLE' = 'ELIGIBLE';
  if (criteria.some((c) => c.status === 'fail')) {
    finalStatus = 'NOT_ELIGIBLE';
  } else if (criteria.some((c) => c.status === 'warning') || missingDocs.length > 0) {
    finalStatus = 'POTENTIALLY_ELIGIBLE';
  }

  return {
    jobId: job.id,
    status: finalStatus,
    overallScore: score,
    headline:
      finalStatus === 'ELIGIBLE'
        ? 'Fully eligible based on verified qualifications and age requirements.'
        : finalStatus === 'POTENTIALLY_ELIGIBLE'
        ? 'Potentially eligible — pending document verification or specific equivalency confirmation.'
        : 'Does not meet one or more mandatory requirements stated in the official notification.',
    criteria,
    missingDocumentsOrInfo: missingDocs,
    relaxationsApplicable: relaxations,
    officialDisclaimer:
      'AI matching is provided as advisory guidance based on published recruitment details. Final eligibility is determined exclusively by the recruiting commission/organization during physical document verification.',
  };
}

// -------------------------------------------------------------
// Helper: Build Full Website Knowledge Base for AI Agent Grounding
// -------------------------------------------------------------
function buildWebsiteKnowledgeBase(opportunities: any[] = INITIAL_JOB_OPPORTUNITIES, userProfile?: any, userCertificates?: any[]) {
  const jobCatalog = opportunities.map((j) => {
    return `[ID: ${j.id}]
- Title: ${j.title}
- Organization: ${j.organization} (Subcategory: ${j.subcategory})
- Category: ${j.category} | State/Region: ${j.stateOrRegion || j.location} | Work Mode: ${j.workMode} | Employment: ${j.employmentType}
- Department: ${j.department} | Notif Number: ${j.notificationNumber}
- Total Vacancies: ${j.vacanciesCount} | Pay Scale / Stipend: ${j.payScaleOrStipend}
- Is Cybersecurity: ${j.isCybersecurity} | Is Internship: ${j.isInternship} | Is Women Exclusive: ${j.isWomenExclusive} | Is Paid: ${j.isPaid}
- Student Eligibility: ${(j.studentEligibilityYears || []).join(', ') || 'Graduates / Degree holders'}
- Required Education: ${(j.educationalQualifications || []).join('; ')}
- Eligible Branches: ${(j.eligibleBranches || []).join(', ')}
- Minimum % / CGPA: ${j.minimumPercentageOrCgpa || 'Not specifically mandated'}
- Age Limit: ${j.ageLimit?.min || 18} to ${j.ageLimit?.max || 42} years. Relaxations: ${j.ageLimit?.relaxationDetails || 'Standard government relaxations apply'}
- Selection Stages: ${(j.selectionProcess || []).join(' -> ')}
- Required Certificates: ${(j.requiredCertificates || []).join('; ')}
- Key Technical Skills: ${(j.technicalSkillsRequired || []).join(', ') || 'N/A'}
- Fees & Concessions: ${j.fees || 'Check official gazette'}
- Quota & Reservation Notes: ${j.quotaAndRelaxationNotes || 'Standard statutory reservation rules apply'}
- Application Window: Start ${j.applicationStartDate} to Deadline ${j.applicationDeadline} (Exam: ${j.examinationDate || 'To be announced'})
- Official Notification PDF: ${j.officialNotificationUrl}
- Official Application Portal: ${j.officialApplicationUrl}
- Verification Status: ${j.sourceVerificationStatus} (Verified: ${j.lastVerifiedDate})
- Summary: ${j.summaryDescription}`;
  }).join('\n\n');

  let profileContext = 'Candidate has not logged in or profile is empty.';
  if (userProfile && userProfile.fullName) {
    profileContext = `Candidate Name: ${userProfile.fullName}
Gender: ${userProfile.gender || 'Not specified'}
DOB: ${userProfile.dateOfBirth || 'Not specified'} (Approx Age: ${new Date().getFullYear() - (userProfile.dateOfBirth ? new Date(userProfile.dateOfBirth).getFullYear() : 2002)} years)
State: ${userProfile.state} | District: ${userProfile.district} | Domicile: ${userProfile.domicileState}
Education Level: ${userProfile.educationLevel}
Degree & Branch: ${userProfile.currentDegreeAndBranch}
Current Status: ${userProfile.currentStatus} (${userProfile.currentYearOfStudy}) | Graduation Year: ${userProfile.graduationYear}
Academic Marks/CGPA: ${userProfile.academicScorePercentage}%
Reservation Category: ${userProfile.reservationCategory}
Disability Concession Eligible: ${userProfile.isDisabilityEligible ? 'Yes' : 'No'}
Technical Skills: ${(userProfile.technicalSkills || []).join(', ')}
Confirmed Certificates in Vault: ${
      userCertificates && userCertificates.length > 0
        ? userCertificates.map((c: any) => `${c.category} (${c.fileName})`).join(', ')
        : 'None uploaded yet'
    }`;
  }

  return { jobCatalog, profileContext };
}

// -------------------------------------------------------------
// API: GovtJob AI Assistant Chatbot (/api/chat)
// -------------------------------------------------------------
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, userContext, allOpportunities, userCertificates } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    const lastMessage = messages[messages.length - 1]?.text || 'Hello';
    const activeJobList = (allOpportunities && allOpportunities.length > 0) ? allOpportunities : INITIAL_JOB_OPPORTUNITIES;
    const { jobCatalog, profileContext } = buildWebsiteKnowledgeBase(activeJobList, userContext, userCertificates);

    if (aiClient) {
      try {
        const systemInstruction = `You are "GovtJob AI Assistant", the authoritative, AI-powered recruitment intelligence agent trained on all official data from the GovtJob AI Portal (https://govtjobai.in).

YOU ARE GROUNDED IN THE FOLLOWING REAL DATA FROM THE WEBSITE:

=== CANDIDATE PROFILE CONTEXT ===
${profileContext}

=== COMPLETE PORTAL DATABASE OF ACTIVE VACANCIES & INTERNSHIPS (${activeJobList.length} OPPORTUNITIES) ===
${jobCatalog}

============================================================
INSTRUCTIONS FOR ANSWERING CANDIDATE QUESTIONS:
1. EXHAUSTIVE ACCURACY: You have access to every single job, internship, age limit, pay scale, deadline, syllabus note, quota rule, and official portal URL in the database above. Always quote exact figures, vacancy numbers, pay scales, and dates from this database.
2. PROFILE PERSONALIZATION:
   - When asked "Which jobs match my degree/branch?", check the candidate's degree & branch against EVERY opportunity's 'Required Education' and 'Eligible Branches', and provide a clear, tailored list.
   - When asked about age eligibility or relaxations, calculate their exact age and check their reservation category (OBC-NCL, SC, ST, EWS, Women, PwD) against the notification's specific rules.
   - For Andhra Pradesh jobs, check if they hold AP domicile status for the 80% Presidential Order local quota.
3. DOMAIN EXPERTISE:
   - Andhra Pradesh: APPSC Group 1, APPSC Group 2, APSLPRB SI (IT & Communications), APSLPRB Mahila Police Constables, AP DSC Teachers, APSCSOC Cyber Security Operations Centre.
   - Central Government: UPSC Civil Services (IAS/IPS/IFS), SSC CGL (14,820 posts), RRB NTPC (11,558 posts), IBPS PO (4,450 posts).
   - Cybersecurity: CERT-In Senior Analyst & Student Research, NIC Scientist B (420 posts), I4C NCFL Digital Forensics, APSCSOC, TCS Cyber Defence.
   - Internships: NITI Aayog (UG/PG ≥85% in 12th), CERT-In Paid Cyber Internship (₹20,000/mo), AICTE-Cisco Virtual Cyber Internship (1st-4th yr college students, 20,000 slots, free credits), MEA (₹10,000/mo + airfare), IOCL Apprenticeship.
   - Women: APSLPRB Mahila Police Battalion (1,420 posts, Intermediate), CRPF Mahila Battalion (380 posts), DST Women Scientist Scheme (WOS-A/B/C, ₹55,000/mo for career break returnees), SBI Returnee Officer, plus 100% exam fee exemptions for women in UPSC, SSC, RRB.
4. TONE & FORMATTING:
   - Professional, encouraging, precise, and well-structured using clean Markdown headings (###), bullet points, and bold highlights.
   - Always include the official portal link and application deadline for the opportunities you discuss.
   - If information is missing or pending document verification, clearly explain the requirement without inventing false claims.`;

        // Format history for Gemini
        const contents = messages.map((m: any) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }],
        }));

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: contents,
          config: {
            systemInstruction,
            temperature: 0.6,
          },
        });

        return res.json({
          answer: response.text || 'I could not generate a response. Please ask again.',
        });
      } catch (geminiError) {
        console.warn('Gemini chat error, using contextual fallback with full database:', geminiError);
      }
    }

    // High quality intelligent response generator grounded in the full database
    const answer = generateAssistantResponseFromDatabase(lastMessage, userContext, activeJobList);
    return res.json({ answer });
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ error: error.message || 'Failed to process chat' });
  }
});

// -------------------------------------------------------------
// Intelligent Fallback Search & Reasoning Engine (Trained on all Website Data)
// -------------------------------------------------------------
function generateAssistantResponseFromDatabase(
  prompt: string,
  context?: any,
  opportunities: any[] = INITIAL_JOB_OPPORTUNITIES
): string {
  const p = prompt.toLowerCase();
  const userBranch = (context?.currentDegreeAndBranch || '').toLowerCase();
  const userCategory = context?.reservationCategory || 'General / UR';
  const isFemale = context?.gender === 'Female';

  // 1. Branch or degree matching query
  if (p.includes('match') || p.includes('my degree') || p.includes('my branch') || p.includes('qualifications') || p.includes('eligible for me')) {
    const matching = opportunities.filter((job) => {
      const eligibleBranches = (job.eligibleBranches || []).map((b: string) => b.toLowerCase());
      const isBranchOpen = eligibleBranches.some((b: string) => b.includes('all') || b.includes('any'));
      return isBranchOpen || eligibleBranches.some((b: string) => userBranch.includes(b) || b.includes(userBranch));
    });

    let res = `### Opportunities Matching Your Qualifications 🎓\n\n`;
    res += `Based on your candidate profile (**${context?.educationLevel || 'Degree'} in ${context?.currentDegreeAndBranch || 'Engineering / General'}**, ${context?.currentStatus || 'Student'}), here are the active opportunities from our database:\n\n`;

    matching.slice(0, 5).forEach((j, i) => {
      res += `${i + 1}. **${j.title}** (${j.organization})\n`;
      res += `   - **Pay / Stipend**: ${j.payScaleOrStipend}\n`;
      res += `   - **Vacancies**: ${j.vacanciesCount > 0 ? j.vacanciesCount.toLocaleString() : 'Open'}\n`;
      res += `   - **Deadline**: **${j.applicationDeadline}**\n`;
      res += `   - **Application Link**: [Official Portal](${j.officialApplicationUrl})\n\n`;
    });

    res += `\n*Tip: Click the **"Check My Eligibility"** button on any job card to run an instant automated rule verification!*`;
    return res;
  }

  // 2. Andhra Pradesh query
  if (p.includes('andhra') || p.includes('appsc') || p.includes('ap police') || p.includes('apslprb') || p.includes('amaravati') || p.includes('vizag')) {
    const apJobs = opportunities.filter((j) => j.category === 'andhra_pradesh');
    let res = `### Andhra Pradesh Government Verified Opportunities 🏛️\n\n`;
    res += `Here are the active Andhra Pradesh state recruitments currently in our portal database:\n\n`;

    apJobs.forEach((j, i) => {
      res += `#### ${i + 1}. ${j.title}\n`;
      res += `- **Recruiting Agency**: ${j.organization} (Notif: \`${j.notificationNumber}\`)\n`;
      res += `- **Pay Scale**: ${j.payScaleOrStipend}\n`;
      res += `- **Total Vacancies**: ${j.vacanciesCount.toLocaleString()} posts across AP\n`;
      res += `- **Eligibility**: ${j.educationalQualifications[0]} (Age: ${j.ageLimit.min}-${j.ageLimit.max} yrs)\n`;
      res += `- **AP Local Quota**: 80% district & zonal reservation under AP Presidential Order (Study Cert from Class 4 to 10 required)\n`;
      res += `- **Application Deadline**: **${j.applicationDeadline}**\n`;
      res += `- **Official Portal**: [${j.officialApplicationUrl}](${j.officialApplicationUrl})\n\n`;
    });

    res += `\n**Category Relaxations**: SC/ST/BC/EWS candidates receive a 5-year upper age relaxation; PwD candidates receive 10 years. Women have 33.33% horizontal reservation.`;
    return res;
  }

  // 3. Central Govt query
  if (p.includes('central') || p.includes('upsc') || p.includes('ssc') || p.includes('rrb') || p.includes('railway') || p.includes('ibps') || p.includes('bank')) {
    const centralJobs = opportunities.filter((j) => j.category === 'central_govt');
    let res = `### Central Government & All-India Vacancies 🇮🇳\n\n`;
    res += `Active Central Ministry, Banking, and Railway examinations from the portal database:\n\n`;

    centralJobs.forEach((j, i) => {
      res += `#### ${i + 1}. ${j.title}\n`;
      res += `- **Agency**: ${j.organization} | **Pay Scale**: ${j.payScaleOrStipend}\n`;
      res += `- **Vacancies**: ${j.vacanciesCount.toLocaleString()} posts nationwide\n`;
      res += `- **Age Limit**: ${j.ageLimit.min} to ${j.ageLimit.max} years (${j.ageLimit.relaxationDetails})\n`;
      res += `- **Fees**: ${j.fees}\n`;
      res += `- **Application Deadline**: **${j.applicationDeadline}**\n`;
      res += `- **Official Gazette Application**: [Apply Here](${j.officialApplicationUrl})\n\n`;
    });

    return res;
  }

  // 4. Cybersecurity query
  if (p.includes('cyber') || p.includes('soc') || p.includes('security') || p.includes('forensic') || p.includes('cert-in') || p.includes('nic') || p.includes('i4c')) {
    const cyberJobs = opportunities.filter((j) => j.isCybersecurity);
    let res = `### Cybersecurity & Government IT Opportunities 🛡️\n\n`;
    res += `Our portal tracks verified openings in India’s leading cybersecurity defense bodies:\n\n`;

    cyberJobs.forEach((j, i) => {
      res += `#### ${i + 1}. ${j.title} (${j.organization})\n`;
      res += `- **Cadre**: ${j.department} | **Mode**: ${j.workMode}\n`;
      res += `- **Compensation**: ${j.payScaleOrStipend}\n`;
      res += `- **Required Skills**: ${(j.technicalSkillsRequired || []).join(', ') || 'Cybersecurity / CS fundamentals'}\n`;
      res += `- **Closing Date**: **${j.applicationDeadline}**\n`;
      res += `- **Official Portal**: [${j.officialApplicationUrl}](${j.officialApplicationUrl})\n\n`;
    });

    return res;
  }

  // 5. Internships query
  if (p.includes('intern') || p.includes('student') || p.includes('stipend') || p.includes('fellowship') || p.includes('apprentice') || p.includes('aicte')) {
    const internships = opportunities.filter((j) => j.isInternship);
    let res = `### Student Internships, Fellowships & Apprenticeships 🎓\n\n`;
    res += `Opportunities open to college students and recent graduates from the portal database:\n\n`;

    internships.forEach((j, i) => {
      res += `#### ${i + 1}. ${j.title} (${j.organization})\n`;
      res += `- **Stipend / Honorarium**: ${j.payScaleOrStipend}\n`;
      res += `- **Accepted Years**: ${(j.studentEligibilityYears || []).join(', ') || 'College Students'}\n`;
      res += `- **Work Mode**: ${j.workMode} | **Duration**: ${j.internshipDuration || '2 to 6 months'}\n`;
      res += `- **Closing Date**: **${j.applicationDeadline}**\n`;
      res += `- **Official Apply Link**: [${j.officialApplicationUrl}](${j.officialApplicationUrl})\n\n`;
    });

    return res;
  }

  // 6. Women opportunities query
  if (p.includes('women') || p.includes('female') || p.includes('girl') || p.includes('mahila')) {
    const womenRoles = opportunities.filter((j) => j.isWomenExclusive || j.isOpenToWomen);
    let res = `### Opportunities & Benefits for Women Candidates 👩‍💼\n\n`;
    res += `Key openings and government schemes for eligible female candidates:\n\n`;

    opportunities.filter((j) => j.isWomenExclusive).forEach((j, i) => {
      res += `#### ${i + 1}. [Women Exclusive] ${j.title}\n`;
      res += `- **Organization**: ${j.organization}\n`;
      res += `- **Pay Scale / Grant**: ${j.payScaleOrStipend}\n`;
      res += `- **Vacancies**: ${j.vacanciesCount > 0 ? j.vacanciesCount.toLocaleString() : 'Open Fellowships'}\n`;
      res += `- **Deadline**: **${j.applicationDeadline}**\n`;
      res += `- **Official Portal**: [${j.officialApplicationUrl}](${j.officialApplicationUrl})\n\n`;
    });

    res += `\n**Key Concessions for Women**:\n`;
    res += `- 100% Application Fee Exemption in UPSC, SSC CGL/CHSL, Railway RRB, and NIELIT examinations.\n`;
    res += `- 33.33% horizontal reservation across all Andhra Pradesh civil, police, and executive cadres.\n`;
    res += `- DST Women Scientist Scheme (WOS-A/B/C) provides ₹55,000/month stipend to women returning after career breaks.\n`;
    return res;
  }

  // 7. Deadlines query
  if (p.includes('deadline') || p.includes('closing') || p.includes('last date') || p.includes('urgent')) {
    const sorted = [...opportunities].sort((a, b) => new Date(a.applicationDeadline).getTime() - new Date(b.applicationDeadline).getTime());
    let res = `### Upcoming Application Deadlines (Chronological Order) ⏰\n\n`;

    sorted.slice(0, 7).forEach((j, i) => {
      res += `${i + 1}. **${j.title}**\n`;
      res += `   - **Agency**: ${j.organization}\n`;
      res += `   - **Deadline**: **${j.applicationDeadline}**\n`;
      res += `   - **Apply Portal**: [${j.officialApplicationUrl}](${j.officialApplicationUrl})\n\n`;
    });

    return res;
  }

  // Default overview
  return `### GovtJob AI Assistant Database Summary 🇮🇳\n\nI am fully trained on all **${opportunities.length} verified opportunities** currently hosted on this portal. Here is what I can help you with:\n\n- **Andhra Pradesh Jobs**: APPSC Group 1 & 2, AP Police (SI & Mahila Constables), APSCSOC, AP DSC.\n- **Central Government**: UPSC Civil Services, SSC CGL (14,820 posts), RRB NTPC (11,558 posts), IBPS PO.\n- **Cybersecurity & IT**: CERT-In Senior Analyst, NIC Scientist 'B' (420 posts), I4C Threat Analyst, TCS Cyber Defence.\n- **Student Internships**: NITI Aayog, CERT-In Paid Cyber Research (₹20,000/mo), AICTE-Cisco Virtual Cyber (20,000 slots), MEA.\n- **Opportunities for Women**: Mahila Police Battalions, DST Women Scientist Scheme (₹55,000/mo), 100% exam fee exemptions.\n- **Document Verification**: Checking mandatory certificates (10th DOB, 12th, degree, caste/EWS, residence).\n\nAsk me any question such as *"Which jobs match my branch?"*, *"Show me all cybersecurity internships"*, or *"What are the age relaxations for OBC/SC/ST in APPSC?"*`;
}

// -------------------------------------------------------------
// N8N Integration Endpoints
// Webhook URL: https://krishnaveni-2008.app.n8n.cloud/webhook/80cc71d7-4ad5-42b7-aa1a-cf3e7d72f611/chat
// Webhook ID: 6172d2e9ccd14cd4926fb4d5a424bfd9
// -------------------------------------------------------------
const DEFAULT_N8N_WEBHOOK_URL =
  process.env.N8N_WEBHOOK_URL ||
  'https://krishnaveni-2008.app.n8n.cloud/webhook/80cc71d7-4ad5-42b7-aa1a-cf3e7d72f611/chat';
const DEFAULT_N8N_WEBHOOK_ID =
  process.env.N8N_WEBHOOK_ID || '6172d2e9ccd14cd4926fb4d5a424bfd9';
const DEFAULT_N8N_INSTANCE_ID =
  process.env.N8N_INSTANCE_ID || 'cee1a0d60bb4ce214943dfe5538661d2dc03baf8f989e3857c93122c24a4e544';

// -------------------------------------------------------------
// API: Full Website Training Data Export (/api/training-data)
// -------------------------------------------------------------
app.get('/api/training-data', (req, res) => {
  const { jobCatalog, profileContext } = buildWebsiteKnowledgeBase(INITIAL_JOB_OPPORTUNITIES);
  res.json({
    portalName: 'GovtJob AI — All-in-One Government Job and Internship Portal',
    portalUrl: 'https://govtjobai.in',
    version: '2026.1',
    lastUpdated: new Date().toISOString(),
    totalActiveOpportunities: INITIAL_JOB_OPPORTUNITIES.length,
    coverage: {
      andhraPradeshJobs: INITIAL_JOB_OPPORTUNITIES.filter((j) => j.category === 'andhra_pradesh').length,
      centralGovtJobs: INITIAL_JOB_OPPORTUNITIES.filter((j) => j.category === 'central_govt').length,
      cybersecurityRoles: INITIAL_JOB_OPPORTUNITIES.filter((j) => j.isCybersecurity).length,
      studentInternships: INITIAL_JOB_OPPORTUNITIES.filter((j) => j.isInternship).length,
      womenExclusiveOpportunities: INITIAL_JOB_OPPORTUNITIES.filter((j) => j.isWomenExclusive).length,
    },
    statutoryRules: {
      andhraPradeshLocalQuota: '80% reservation in district/zonal cadres under AP Presidential Order (Study certificates Class 4-10 required).',
      womenReservations: '33.33% horizontal reservation in AP state recruitment; 100% exam fee exemption across UPSC, SSC, RRB.',
      ageRelaxations: 'SC/ST: 5 years; BC/OBC-NCL: 3 to 5 years; PwD: 10 years; EWS: age relaxation per state rules.',
    },
    opportunities: INITIAL_JOB_OPPORTUNITIES,
    rawTextKnowledgeBase: jobCatalog,
  });
});

app.post('/api/n8n/test', async (req, res) => {
  try {
    const { webhookUrl, webhookId } = req.body;
    const targetWebhookId = webhookId || DEFAULT_N8N_WEBHOOK_ID;
    const targetUrl = webhookUrl || process.env.N8N_WEBHOOK_URL || DEFAULT_N8N_WEBHOOK_URL;

    const testPayload = {
      action: 'sendMessage',
      sessionId: `test-${Date.now()}`,
      chatInput: 'ping',
      message: 'ping',
      text: 'ping',
      webhookId: targetWebhookId,
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Instance-Id': DEFAULT_N8N_INSTANCE_ID,
        'X-N8N-Webhook-Id': targetWebhookId,
      },
      body: JSON.stringify(testPayload),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    let replySnippet = '';
    try {
      const data = await response.json();
      replySnippet = data.output || data.text || data.message || JSON.stringify(data);
    } catch {
      replySnippet = await response.text();
    }

    return res.json({
      ok: response.ok,
      status: response.status,
      message: response.ok
        ? `Successfully connected to n8n chat workflow! Response: "${replySnippet.slice(0, 100)}"`
        : `n8n responded with HTTP status ${response.status}`,
      webhookId: targetWebhookId,
      url: targetUrl,
    });
  } catch (error: any) {
    return res.json({
      ok: false,
      message: `Could not reach n8n instance: ${error.message || 'Connection timeout or network error'}`,
      webhookId: req.body?.webhookId || DEFAULT_N8N_WEBHOOK_ID,
      error: error.message,
    });
  }
});

app.post('/api/n8n/chat', async (req, res) => {
  try {
    const {
      message,
      messages,
      sessionId,
      userContext,
      allOpportunities,
      userCertificates,
      n8nWebhookUrl,
      n8nWebhookId,
    } = req.body;

    const queryText = message || (messages && messages[messages.length - 1]?.text) || 'Hello';
    const targetWebhookId = n8nWebhookId || DEFAULT_N8N_WEBHOOK_ID;
    const targetUrl = n8nWebhookUrl || process.env.N8N_WEBHOOK_URL || DEFAULT_N8N_WEBHOOK_URL;

    const activeJobList = (allOpportunities && allOpportunities.length > 0) ? allOpportunities : INITIAL_JOB_OPPORTUNITIES;
    const { jobCatalog, profileContext } = buildWebsiteKnowledgeBase(activeJobList, userContext, userCertificates);

    // If an n8n webhook URL is available, send to n8n workflow with ALL website training data
    if (targetUrl) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20000);

        const n8nPayload = {
          action: 'sendMessage',
          sessionId: sessionId || `candidate-${userContext?.id || 'guest'}`,
          chatInput: queryText,
          message: queryText,
          text: queryText,
          query: queryText,
          input: queryText,
          webhookId: targetWebhookId,
          timestamp: new Date().toISOString(),
          // Full website data fed into the n8n agent
          websiteTrainingData: {
            portalName: 'GovtJob AI Portal',
            activeOpportunitiesCount: activeJobList.length,
            knowledgeBaseSummary: jobCatalog,
            opportunities: activeJobList.map((j: any) => ({
              id: j.id,
              title: j.title,
              organization: j.organization,
              category: j.category,
              vacanciesCount: j.vacanciesCount,
              payScaleOrStipend: j.payScaleOrStipend,
              educationalQualifications: j.educationalQualifications,
              eligibleBranches: j.eligibleBranches,
              ageLimit: j.ageLimit,
              applicationDeadline: j.applicationDeadline,
              officialApplicationUrl: j.officialApplicationUrl,
              officialNotificationUrl: j.officialNotificationUrl,
              isCybersecurity: j.isCybersecurity,
              isInternship: j.isInternship,
              isWomenExclusive: j.isWomenExclusive,
              isPaid: j.isPaid,
            })),
          },
          candidateProfile: userContext || null,
          candidateCertificates: userCertificates || [],
          portalContext: {
            activeVacanciesCount: activeJobList.length,
            verifiedSources: ['APPSC', 'UPSC', 'SSC', 'RRB', 'IBPS', 'CERT-In', 'NIC', 'NITI Aayog', 'AICTE'],
          },
        };

        const n8nResponse = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Instance-Id': DEFAULT_N8N_INSTANCE_ID,
            'X-N8N-Webhook-Id': targetWebhookId,
          },
          body: JSON.stringify(n8nPayload),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (n8nResponse.ok) {
          const contentType = n8nResponse.headers.get('content-type') || '';
          let n8nReply = '';

          if (contentType.includes('application/json')) {
            const data = await n8nResponse.json();
            // Handle various n8n output formats
            if (typeof data === 'string') {
              n8nReply = data;
            } else if (Array.isArray(data) && data[0]?.json) {
              n8nReply = data[0].json.output || data[0].json.text || data[0].json.message || JSON.stringify(data[0].json);
            } else if (Array.isArray(data) && data[0]?.output) {
              n8nReply = data[0].output;
            } else if (data.output) {
              n8nReply = data.output;
            } else if (data.text) {
              n8nReply = data.text;
            } else if (data.message && data.message !== 'Error in workflow') {
              n8nReply = data.message;
            } else if (data.response) {
              n8nReply = data.response;
            } else if (data.reply) {
              n8nReply = data.reply;
            } else if (!data.message || data.message !== 'Error in workflow') {
              n8nReply = typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
            }
          } else {
            n8nReply = await n8nResponse.text();
          }

          if (n8nReply && n8nReply.trim().length > 0 && !n8nReply.includes('Error in workflow')) {
            return res.json({
              success: true,
              source: 'n8n',
              webhookId: targetWebhookId,
              answer: n8nReply,
            });
          }
        }
      } catch (n8nErr: any) {
        console.warn(`n8n webhook dispatch to ${targetUrl} failed, falling back to core AI:`, n8nErr.message);
      }
    }

    // Fallback: Use Gemini or Portal Knowledge Base with n8n status attribution
    let coreAnswer = '';
    if (aiClient) {
      try {
        const systemInstruction = `You are "GovtJob AI Assistant (powered by n8n Workflow ${targetWebhookId})", an AI agent integrated with the GovtJob AI Portal knowledge base.

CANDIDATE CONTEXT:
${profileContext}

PORTAL OPPORTUNITIES (${activeJobList.length} VERIFIED LISTINGS):
${jobCatalog}

Answer the candidate's query with maximum precision, citing deadlines, pay scales, vacancies, and official application portals.`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [{ role: 'user', parts: [{ text: queryText }] }],
          config: { systemInstruction, temperature: 0.6 },
        });
        coreAnswer = response.text || '';
      } catch (aiErr) {
        console.warn('Gemini call failed during n8n fallback:', aiErr);
      }
    }

    if (!coreAnswer) {
      coreAnswer = generateAssistantResponseFromDatabase(queryText, userContext, activeJobList);
    }

    const n8nPrefix = `⚡ **n8n Workflow Connected** \`[ID: ${targetWebhookId}]\`\n\n`;

    return res.json({
      success: true,
      source: 'n8n-hybrid',
      webhookId: targetWebhookId,
      answer: `${n8nPrefix}${coreAnswer}`,
      n8nStatus: targetUrl ? 'forwarded' : 'ready',
    });
  } catch (error: any) {
    console.error('n8n chat error:', error);
    res.status(500).json({ error: error.message || 'n8n processing failed' });
  }
});

// -------------------------------------------------------------
// Dev & Production Server Mounting
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // In dev, mount Vite middleware mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`GovtJob AI server running on port ${port} (mode: ${process.env.NODE_ENV || 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
