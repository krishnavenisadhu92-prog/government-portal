# GovtJob AI — All-in-One Government Job & Internship Portal

GovtJob AI is a modern, secure, AI-powered web platform designed for students, fresh graduates, and job seekers across India. It helps candidates discover genuine government jobs, cybersecurity opportunities, student internships, apprenticeships, and women-exclusive schemes, while providing automated document intelligence, certificate verification checklists, and AI-assisted eligibility matching.

---

## 🌟 Key Features

1. **Andhra Pradesh Government Jobs**:
   - Dedicated portal for APPSC (Group 1, Group 2, Gazetted/Non-Gazetted), APSLPRB (Police Constable & SI - Civil & Technical), AP DSC (Teachers), AP State Cyber Security Operations Centre (APSCSOC), and APCPDCL.
   - Built-in recognition of AP Presidential Order local candidate status (80% district/zonal reservations).

2. **Central Government Jobs Throughout India**:
   - Covers UPSC (Civil Services, ESE), Staff Selection Commission (SSC CGL/CHSL), Railway Recruitment Boards (RRB NTPC/JE), Banking (IBPS, SBI), India Post, and Central Ministries.
   - Comprehensive breakdown of pay scales, reservation categories, age relaxations, and selection stages.

3. **Cybersecurity & Government IT Careers**:
   - Verified opportunities from CERT-In, National Informatics Centre (NIC), National Critical Information Infrastructure Protection Centre (NCIIPC), and Indian Cyber Crime Coordination Centre (I4C, Ministry of Home Affairs).
   - Filter between government security units and verified private sector SOC / Vulnerability Assessment roles.

4. **Internships, Apprenticeships & Student Opportunities**:
   - Curated listings from NITI Aayog Internship Scheme, CERT-In Research Internships (Paid ₹20,000/mo), AICTE-Cisco Virtual Cyber Internships (open to 1st to 4th year college students), MEA, and PSU apprenticeships (IOCL, BEL).
   - Filter by year of study (1st Year, 2nd Year, 3rd Year, Final Year, Recent Graduate, Diploma).

5. **Opportunities for Women**:
   - Dedicated section highlighting women-only recruitments (APSLPRB Mahila Police Battalions, CRPF Mahila Battalions, Indian Army Women Military Police), career re-entry programmes (DST Women Scientist Scheme WOS-A/B/C, SBI Returnee Officers), and 100% application fee exemptions across central bodies.

6. **AI-Powered Eligibility Matching Engine**:
   - Compares the candidate's degree, branch, age, reservation category, and confirmed certificates against official recruitment notices.
   - Three distinct classification results:
     - `Eligible based on available information`
     - `Potentially eligible — verification required`
     - `Does not meet one or more stated requirements`
   - Detailed rule-by-rule checks, relaxation citations, and missing document warnings.

7. **Document Intelligence & Certificate Vault**:
   - Upload academic and category documents in PDF, JPG, and PNG formats (10th marksheet for DOB, 12th, degree, provisional, caste, EWS, domicile, technical certifications).
   - Multimodal Document AI OCR extracts candidate name, DOB, board, branch, marks, passing year, and certificate numbers.
   - Interactive confirmation wizard allows candidates to inspect and confirm extracted data before saving.
   - Detects missing certificates and potentially expired documents (e.g. EWS/OBC-NCL financial year validity).
   - Private and secure: No public document URLs, no model training on personal certificates, and one-click permanent data wipe.

8. **GovtJob AI Assistant**:
   - Context-aware chatbot powered by Gemini 3.8 Flash grounded in Indian public sector recruitment regulations, age relaxations, and syllabus requirements.

9. **Application Status Tracker**:
   - Track application stages across *Saved*, *Planning to Apply*, *Applied*, *Exam Scheduled*, *Result Published*, and *Closed*.
   - Store roll numbers, exam dates, and personal notes.

10. **Administrator Control Panel**:
    - Manage active listings, verify official notification PDFs and portal application URLs, mark expired vacancies, and inspect security audit logs.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend / API**: Express 4 with TypeScript (`tsx server.ts`), Vite middleware in development.
- **AI & Document OCR**: `@google/genai` TypeScript SDK using `gemini-3.8-flash` on the server-side with telemetry headers (`User-Agent: aistudio-build`).
- **Data Persistence**: Local browser storage with export/import capabilities and zero server-side certificate exposure.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- NPM or PNPM

### Environment Variables

Set the following variables in your environment or `.env` file:

```env
# Gemini API Key for server-side OCR, AI eligibility matching, and career assistant
GEMINI_API_KEY="your-gemini-api-key"

# Port (defaults to 3000)
PORT=3000

# n8n Automation Workflow Webhook
N8N_WEBHOOK_URL="https://krishnaveni-2008.app.n8n.cloud/webhook/80cc71d7-4ad5-42b7-aa1a-cf3e7d72f611/chat"
N8N_WEBHOOK_ID="6172d2e9ccd14cd4926fb4d5a424bfd9"
```

---

## ⚡ n8n Workflow Automation & AI Agent Training

GovtJob AI Assistant is directly integrated with an n8n Cloud Chat Workflow:
- **Webhook Endpoint**: `https://krishnaveni-2008.app.n8n.cloud/webhook/80cc71d7-4ad5-42b7-aa1a-cf3e7d72f611/chat`
- **Webhook ID**: `6172d2e9ccd14cd4926fb4d5a424bfd9`
- **Training Data Export Endpoint**: `GET /api/training-data` returns all active vacancies across Andhra Pradesh, Central Government, Cybersecurity, Student Internships, and Women Schemes in structured JSON.
- **In-Chat Training Studio**: Click **"Train AI Agent / Website Data"** in the chatbot to inspect the formatted markdown system prompt, copy the dataset for your n8n LLM nodes, download `govtjob_ai_training_dataset.json`, or click **"Sync to n8n Webhook"** to dispatch the entire website knowledge base directly to your n8n workflow.

### Installation & Run

```bash
# Install dependencies
npm install

# Start development full-stack server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## 🔒 Privacy & Compliance Pledge

- **No Public Certificate Exposure**: Uploaded documents are converted to client-side data URLs and processed through secure server-side OCR proxies. No certificates are stored on public cloud buckets.
- **No Generative AI Training on User Data**: User documents are strictly used for momentary text extraction and are never used to train or fine-tune public models.
- **Anti-Discrimination & Neutrality**: Religion and non-statutory factors are strictly excluded from job-matching criteria. Only lawful statutory reservations (OBC-NCL, SC, ST, EWS, Women, PwD) sanctioned by official gazettes are applied.
- **Advisory Role**: GovtJob AI provides advisory guidance. Final eligibility and selection are governed solely by recruiting commissions during physical certificate verification.
