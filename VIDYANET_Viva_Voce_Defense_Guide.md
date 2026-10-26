# A Teacher Co-Pilot (AI Assistant for Teachers): Mini-Project Viva Voce & Examiner Defense Guide

> **Prepared for:** Jay Panchal (36), Harshvardhan Dhember (32), Aditya Bochare (07)  
> **Course:** SY.B.Sc. (AIML) Sem-III • Division A | Indira University, SOIT
> **Project Guide & HOD:** Prof. Sarita Byagar (Head of Department - AIML)  
> **Project:** A Teacher Co-Pilot (AI Assistant for Teachers) — University Management System & Multi-Agent Workspace  

---

### Top 20 Examination Questions & High-Scoring Technical Answers

#### 1. Why did you choose NVIDIA NIM and Google Gemini instead of OpenAI GPT-4o?
**Answer:**
- **Cost & Accessibility:** NVIDIA NIM provides free open-weights access to state-of-the-art 70B models (Llama-3.3-70B) optimized with TensorRT-LLM, incurring zero subscription barriers for university scale.
- **Latency:** NVIDIA NIM delivers sub-2-second inference for complex reasoning, while Gemini 2.5 Flash executes in 1.4 seconds.
- **Dual Fallback Pipeline:** If NVIDIA NIM hits quota limits or experiences network latency, our client automatically cascades to Google Gemini without dropping user sessions.

#### 2. What is the role of Multimodal Vision in your project?
**Answer:**
Colleges still distribute schedules as paper printouts or photos on notice boards. Traditional OCR (like Tesseract) fails because it scrambles multi-column grids and merged lab period cells. We use **Google Gemini Multimodal Vision**, which uses spatial vision transformers to understand the 2D layout and convert photos directly into normalized JSON timetables with zero typing.

#### 3. How do you prevent AI Hallucinations in quiz and test generation?
**Answer:**
- **Temperature Clamping:** We clamp the LLM temperature strictly between `0.4` and `0.5`, suppressing stochastic creativity.
- **Context Grounding:** Instructors can attach syllabus excerpts or textbook text; the model is prompted with `Use ONLY the provided reference material to formulate questions`.
- **Human-in-the-Loop (HITL):** Generated assessments remain in an interactive draft state where instructors review, modify, or delete questions before publishing to students.

#### 4. How does the system prevent students from cheating or accessing teacher controls?
**Answer:**
- **Cryptographic Role-Based Access Control (RBAC):** State-modifying actions (`recordAttendance`, `createTest`, `approveStudent`) verify the user's role and session token.
- **Student Registration Quarantine:** When students sign up, they are assigned `status: PENDING`. They cannot log in until an authorized faculty member verifies their roll number in the Teacher Approval Queue.
- **Client Sanitization:** Test answer keys and grading criteria are never sent to the student client until the test is officially submitted and completed.

#### 5. Why did you choose Vite 8 over Webpack or Next.js?
**Answer:**
- **Vite 8:** Uses native browser ES Modules (ESM) and Rollup/esbuild. Server startup takes under 200ms and production compilation takes only 699ms.
- **Decoupled Client-Side SPA:** We chose client-side React 19 over Next.js Server-Side Rendering (SSR) because A Teacher Co-Pilot (AI Assistant for Teachers) is an authenticated dashboard application where data is dynamic and private to the user; SSR provides no SEO benefit for private portals and increases server hosting overhead.

#### 6. How is your project compliant with India's DPDP Act 2023?
**Answer:**
- **Zero Third-Party Telemetry:** No commercial trackers, ads, or third-party cookies.
- **Data Minimization:** We only collect required educational data (Name, Roll No, Department, College Email).
- **Emergency Locker Isolation:** Student medical and academic files are stored in a private, encrypted digital locker scoped strictly to the student's ID.
- **Right to Erasure:** Students can permanently purge uploaded files with one click.

#### 7. What is the Dynamic Lecture Tracker algorithm?
**Answer:**
It syncs with Indian Standard Time (`Asia/Kolkata`). Every second, it compares the current time against the active timetable's theory and practical slots. It computes:
1. Active Lecture & Classroom
2. Elapsed vs Remaining minutes with animated progress bars
3. Upcoming lecture with break interval detection

#### 8. How does the Practical Lab Attendance system differ from Theory Attendance?
**Answer:**
Theory lectures are attended by the entire division (60+ students). Practical labs are divided into 3 cohorts:
- Batch A: Roll 01 to 31
- Batch B: Roll 32 to 62
- Batch C: Roll 63 onwards  
Our system dynamically filters the roster by batch, maps to specific computer laboratory rooms (e.g., Lab 3-B), and records experiment-specific attendance logs.

#### 9. What state management approach is used?
**Answer:**
We utilized React 19's **Context API (`CollegeContext.jsx`)** paired with custom hooks (`useCollege()`). This provides reactive, application-wide state distribution without the excessive boilerplate and bundle weight of Redux Toolkit. State is persisted with versioned local caching (`fresh_v5`) to prevent memory leaks across shared lab computers.

#### 10. What is your 5-Phase Future Scope?
**Answer:**
1. **Phase 1:** Cross-platform React Native mobile app with push notifications.
2. **Phase 2:** On-premise local Small Language Models (SLMs) via Ollama for offline capability.
3. **Phase 3:** Dockerized Judge0 sandbox for automated code evaluation.
4. **Phase 4:** Dynamic rotating QR-code attendance with geofencing.
5. **Phase 5:** Multilingual voice assistant using Whisper and TTS.
