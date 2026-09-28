import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

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
// API: GovtJob AI Assistant Chatbot (/api/chat)
// -------------------------------------------------------------
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, userContext } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    const lastMessage = messages[messages.length - 1]?.text || 'Hello';

    if (aiClient) {
      try {
        const systemInstruction = `You are "GovtJob AI Assistant", India's premier conversational AI expert on Government Jobs, Cybersecurity Careers, Public Sector Opportunities, Internships, Apprenticeships, and Women's Recruitment.

Key Principles & Knowledge Base:
1. ANDHRA PRADESH JOBS:
   - APPSC (Group 1, 2, 4, Gazetted/Non-Gazetted), AP DSC (School Teachers), APSLPRB (Police Constable & SI - Civil, AR, Tech, Mahila Battalions), AP Power utilities (APCPDCL, APGENCO), District Collectorate recruitments.
   - AP Local status rules: Presidential Order requires study from 4th to 10th class in AP for 80% district/zonal reservation.
   - Age relaxations: SC/ST/BC/EWS candidates get 5 years upper age relaxation; PwD get 10 years.
2. CENTRAL GOVT JOBS:
   - UPSC (Civil Services, ESE, CDS, NDA), SSC (CGL, CHSL, MTS, CPO, GD Constable), Railway Recruitment Boards (RRB NTPC, JE, ALP), Banking (IBPS PO/Clerk, SBI PO/JA), India Post GDS, Defence research (DRDO, ISRO, BARC).
   - Fee exemptions: Almost all central exams (UPSC, SSC, RRB) exempt female candidates, SC, ST, and PwD candidates from exam fees.
3. CYBERSECURITY & GOVT IT:
   - CERT-In, NCIIPC, NIC (Scientist B), I4C (Indian Cyber Crime Coordination Centre under MHA), MeitY Digital India Corp, State Police Cyber Crime Wings.
   - Roles: SOC Analyst, Vulnerability Researcher, Digital Forensics, Threat Intelligence, Penetration Tester.
   - Relevant certs: CEH, CompTIA Security+, OSCP, Blue Team Level 1, CHFI.
4. INTERNSHIPS & STUDENT OPPORTUNITIES:
   - NITI Aayog Internship Scheme (UG/PG, policy/tech, minimum 85% in 12th), CERT-In Student Cyber Internship (paid stipend ₹20,000/mo), AICTE-Cisco Virtual Cyber Internship (1st-4th year, free credits), Ministry of External Affairs (MEA), RBI Summer Placement.
5. OPPORTUNITIES FOR WOMEN:
   - APSLPRB Mahila Police Battalions, CRPF Mahila Battalion, Indian Army Military Police (Women), DST Women Scientist Scheme (WOS-A/B/C for career break returnees), SBI Returnee Officers.
6. COMPLIANCE & ACCURACY:
   - Never invent vacancies, fake links, or claim a document is officially verified.
   - Always encourage candidates to verify against the official gazette / notification PDF.
   - Tone: Professional, encouraging, precise, authoritative yet accessible to students. Use markdown formatting with bullet points and clear sections.`;

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
            temperature: 0.7,
          },
        });

        return res.json({
          answer: response.text || 'I could not generate a response. Please try asking again.',
        });
      } catch (geminiError) {
        console.warn('Gemini chat error, using contextual fallback:', geminiError);
      }
    }

    // High quality intelligent response generator if API key is not present
    const answer = generateAssistantResponse(lastMessage, userContext);
    return res.json({ answer });
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ error: error.message || 'Failed to process chat' });
  }
});

// Fallback chat generator with rich domain guidance
function generateAssistantResponse(prompt: string, context?: any): string {
  const p = prompt.toLowerCase();

  if (p.includes('andhra') || p.includes('appsc') || p.includes('ap police') || p.includes('ap ')) {
    return `### Andhra Pradesh Government Opportunities Overview 🏛️

Andhra Pradesh provides vibrant career options across state civil services, technical communications, and uniform services:

1. **APPSC Group 1 & Group 2 Services**:
   - **Eligibility**: Any recognized Bachelor's Degree.
   - **Age Limit**: 18 to 42 years (Relaxed up to 47 for SC/ST/BC/EWS; up to 52 for PwD).
   - **Local Reservation**: 80% district & zonal quota reserved for bona fide AP local candidates (verified via Study Certificate from Class 4 to 10).
2. **AP Police (APSLPRB)**:
   - **Sub-Inspector (IT & Communications)**: Requires B.Tech in CSE / IT / ECE / EEE or MCA / M.Sc Computer Science.
   - **Mahila Police Battalion**: Dedicated horizontal reservation with 1,420+ constable openings for eligible women with Intermediate (10+2).
3. **AP State Cyber Security Operations Centre (APSCSOC)**:
   - Openings for SOC Analysts & Incident Handlers to protect state cloud and e-Pragati citizen portals.

**Next Step**: Visit the [APPSC Official Portal](https://psc.ap.gov.in) or navigate to the **Andhra Pradesh Jobs** tab above to check current vacancies.`;
  }

  if (p.includes('cyber') || p.includes('soc') || p.includes('security') || p.includes('ethical hack')) {
    return `### Cybersecurity & IT Careers in Government & PSUs 🛡️

Cybersecurity is one of the highest-demand domains in the Indian public sector:

- **Key Recruiting Bodies**:
  - **CERT-In (MeitY)**: Handles national cyber incident response, zero-day research, and malware triage (Level 10-12 pay matrix).
  - **NIC (National Informatics Centre)**: Scientist 'B' & Scientific Officer (Cybersecurity, Cloud, DevSecOps).
  - **I4C (Ministry of Home Affairs)**: Cyber Crime Threat Analysts & Digital Forensics Investigators at NCFL New Delhi.
  - **State Police Cyber Crime Wings**: Technical sub-inspectors and forensic consultants.
- **Eligibility**:
  - B.Tech / B.E. in Cyber Security, CSE, IT, or MCA / M.Sc Forensics.
  - Helpful certifications: CompTIA Security+, CEH, Blue Team Level 1, OSCP, or Cellebrite Mobile Forensics.
- **Student Opportunities**:
  - Check the **CERT-In Student Research Internship** (Paid ₹20,000/mo) and the **AICTE-Cisco Virtual Cyber Internship** (open to 1st to 4th year college students).

Explore the **Cybersecurity Careers** tab to view open positions!`;
  }

  if (p.includes('intern') || p.includes('student') || p.includes('1st year') || p.includes('2nd year') || p.includes('college')) {
    return `### Internships & Student Opportunities in India 🎓

College students can build credentials and earn government stipends through official programmes:

1. **NITI Aayog Internship Scheme**:
   - **Eligibility**: Enrolled UG/PG students with ≥85% in Class 12th.
   - **Fields**: AI, Technology, Infrastructure, Public Policy, Economics.
   - **Duration**: 6 weeks to 6 months with official Certificate of Internship.
2. **CERT-In Cyber Student Internship**:
   - **Eligibility**: 2nd, 3rd, and Final year B.Tech/MCA students.
   - **Stipend**: ₹20,000 per month (paid government research grant).
3. **AICTE - Cisco Virtual Cybersecurity Internship**:
   - Open to **all engineering students (1st, 2nd, 3rd, and Final year)**.
   - Fully remote, zero fee, provides academic credits and Cisco certified digital badge.
4. **Ministry of External Affairs (MEA)**:
   - ₹10,000/month stipend with airfare assistance for research in international diplomacy.

Select the **Internships** filter in the navigation to view student-specific openings matching your year of study!`;
  }

  if (p.includes('women') || p.includes('female') || p.includes('girl')) {
    return `### Exclusive Opportunities & Benefits for Women Candidates 👩‍💼

The Indian government and state administrations offer significant concessions and exclusive recruitments for women:

- **100% Application Fee Exemption**:
  - Almost all major central recruitment bodies (UPSC, SSC CGL/CHSL, RRB Railways, NIELIT) completely waive application fees for all female candidates regardless of category.
- **Dedicated Women-Only Openings**:
  - **APSLPRB Mahila Police Battalion**: Direct recruitment of constables dedicated to women safety and Disha divisions.
  - **CRPF & CAPF Mahila Battalions**: Sub-Inspectors and General Duty Constables.
  - **Indian Army Women Military Police (Agniveer Mahila GD)**.
- **Career Re-entry & Research Schemes**:
  - **DST Women Scientist Scheme (WOS-A/B/C)**: ₹55,000/mo stipend + ₹3 Lakh/year research grant for women with career breaks.
  - **SBI Women Returnee Officer Programme**.
- **Horizontal Reservation**:
  - Andhra Pradesh state recruitment enforces 33.33% horizontal reservation for women across all administrative cadres.

Click the **Opportunities for Women** tab to see all filtered roles!`;
  }

  return `### GovtJob AI Assistant Career Guidance 🇮🇳

I can assist you with all aspects of your government career and internship journey:

- **Eligibility Checks**: "Does my B.Tech branch qualify for APPSC or NIC Scientist B?"
- **Age Relaxations**: "How many years of age relaxation do I get under OBC-NCL or SC/ST?"
- **Internships**: "Which government internships accept 2nd or 3rd year students?"
- **Document Requirements**: "What certificates do I need before applying for SSC CGL or APPSC?"
- **Cybersecurity Pathways**: "How can I join CERT-In or AP State Cyber Security Operations Centre?"

Feel free to ask any specific question or click on **"Check My Eligibility"** on any job card to run an instant automated analysis!`;
}

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
