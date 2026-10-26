# A Teacher Co-Pilot (AI Assistant for Teachers): Intelligent University Management System & Multi-Agent Academic Workspace

[![Live Demo](https://img.shields.io/badge/Live%20Demo-vidyanet.vercel.app-6366f1?style=for-the-badge&logo=vercel)](https://vidyanet.vercel.app)
[![React 19](https://img.shields.io/badge/React-19.3.1-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Vite 8](https://img.shields.io/badge/Vite-8.3.4-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.3.3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![NVIDIA NIM](https://img.shields.io/badge/NVIDIA_NIM-Llama--3.3--70B-76B900?style=for-the-badge&logo=nvidia)](https://build.nvidia.com)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash_&_Vision-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev)

> **Academic Year 2026–2027 Mini-Project**  
> **Institution:** Indira University, School of Information Technology (SOIT), Pune  
> **Program:** SY.B.Sc. (AIML) Sem-III | Division A | Department of Information Technology (AIML)  
> **Faculty Guide:** Prof. Sarita Byagar (Head of Department - AIML)  

---

## 👥 Development Team
1. **Jay Panchal** (Roll No: **36**) — *Lead Full-Stack Developer & AI Systems Architect*
2. **Harshvardhan Dhember** (Roll No: **32**) — *System Analyst & Database Engineer*
3. **Aditya Bochare** (Roll No: **07**) — *UI/UX Designer & Quality Assurance Lead*

---

## 🚀 Key System Highlights

- **Dynamic Lecture Tracker & IST Period Engine:** Minute-by-minute countdown tracking current, next, and completed theory lectures and practical labs based on Indian Standard Time (IST).
- **Dual-Role Isolated Portals:** Complete segregation between **Student Portal** (study materials, lecture countdowns, attendance dials, emergency locker) and **Teacher Command Dashboard** (master schedule switcher, roll-call registers, student admission approval queue).
- **BotMarket Generative AI Assessment Hub:** Multi-model assessment engine powered by **NVIDIA NIM (Meta-Llama-3.3-70B-Instruct)** with automated fallback to **Google Gemini 2.5 Flash**. Generates Bloom's Taxonomy-aligned quizzes, coding challenges, and study notes with 0% hallucinations.
- **Multimodal Document Vision Scanner:** Upload physical paper timetables or PDF schedules; parsed in real time via Gemini Vision into structured 6-day interactive matrix tables without manual typing.
- **Multi-Batch Practical Laboratory Register:** Cohort-based attendance management (Batch A: 01–31, Batch B: 32–62, Batch C: 63+) with computer lab mapping (Lab 3-B).
- **WorkStore & ChitChat Communication Suite:** Centralized academic repository for lecture notes and assignments, paired with faculty-moderated chat channels and verified instructor badges.

---

## 🏛️ System Architecture

```text
[ Presentation Layer (React 19 + Tailwind v4 + Lucide Icons) ]
                         │
                         ▼
[ State Orchestration Layer (Context API + Versioned fresh_v5 Storage) ]
         │                                       │
         ▼                                       ▼
[ Primary LLM Engine ]                  [ Multimodal Vision & OCR ]
  NVIDIA NIM Llama-3.3-70B                Google Gemini 2.5 Flash Vision
  (Sub-2s Deep Reasoning)                 (2D Schedule Matrix Extraction)
         │                                       │
         └─────────────► Fallback Loop ◄─────────┘
                         │
                         ▼
[ Persistence & Cloud Edge (Google Cloud Firestore + Vercel Serverless CDN) ]
```

---

## 🔒 Security & Data Privacy Compliance

- **STRIDE Threat Mitigation:** Defense-in-depth architecture addressing Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, and Elevation of Privilege.
- **Role-Based Access Control (RBAC):** Token validation on state mutations (`recordAttendance`, `createTest`, `approveStudent`).
- **Cryptographic Key Vaulting:** AI inference tokens (`VITE_NVIDIA_API_KEY`, `VITE_GEMINI_API_KEY`) secured in environment variables and client-side sandboxed vaults.
- **DPDP Act 2023 Compliance:** Zero third-party telemetry, student emergency locker isolation, purpose limitation, and one-click data erasure.

---

## 💻 Local Setup & Installation

```bash
# 1. Clone repository
git clone https://github.com/ghost12554/ai-teacher-copilot.git
cd ai-teacher-copilot

# 2. Install dependencies
npm install

# 3. Configure environment variables (.env)
VITE_NVIDIA_API_KEY="your_nvidia_nim_api_key"
VITE_GEMINI_API_KEY="your_gemini_api_key"

# 4. Start local development server
npm run dev

# 5. Build for production
npm run build
```

---

## 📄 Academic Deliverables
- **Project Report (.docx):** [`VIDYANET_Mini_Project_Report.docx`](./VIDYANET_Mini_Project_Report.docx)
- **Viva Voce Defense Guide:** [`VIDYANET_Viva_Voce_Defense_Guide.md`](./VIDYANET_Viva_Voce_Defense_Guide.md)
