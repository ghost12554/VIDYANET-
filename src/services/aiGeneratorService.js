/**
 * Comprehensive AI Generation Service for Indira UMS BotMarket
 * Powered by NVIDIA NIM (meta/llama-3.3-70b-instruct) and Google Gemini (gemini-1.5-flash / gemini-2.5-flash)
 */

export function getNvidiaApiKey() {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('indira_ums_nvidia_api_key');
    if (saved && saved.trim()) return saved.trim();
  }
  return (
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_NVIDIA_API_KEY) ||
    ''
  );
}

export function saveNvidiaApiKey(key) {
  if (typeof localStorage !== 'undefined') {
    if (key && key.trim()) {
      localStorage.setItem('indira_ums_nvidia_api_key', key.trim());
    } else {
      localStorage.removeItem('indira_ums_nvidia_api_key');
    }
  }
}

export function getGeminiApiKey() {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('indira_ums_gemini_api_key');
    if (saved && saved.trim()) return saved.trim();
  }
  return (
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) ||
    ''
  );
}

export function saveGeminiApiKey(key) {
  if (typeof localStorage !== 'undefined') {
    if (key && key.trim()) {
      localStorage.setItem('indira_ums_gemini_api_key', key.trim());
    } else {
      localStorage.removeItem('indira_ums_gemini_api_key');
    }
  }
}

/**
 * Universal LLM caller: Attempts NVIDIA NIM first, then Gemini, then smart engine fallback
 */
export async function callLlmApi({ systemPrompt, userPrompt, temperature = 0.5 }) {
  const nvidiaKey = getNvidiaApiKey();
  const geminiKey = getGeminiApiKey();

  // 1. Try NVIDIA NIM API
  if (nvidiaKey) {
    try {
      const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${nvidiaKey}`,
        },
        body: JSON.stringify({
          model: 'meta/llama-3.3-70b-instruct',
          messages: [
            { role: 'system', content: systemPrompt || 'You are an expert university professor and AI academic content generator.' },
            { role: 'user', content: userPrompt },
          ],
          temperature: temperature,
          max_tokens: 3500,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content;
        if (content && content.trim()) {
          return content.trim();
        }
      } else {
        console.warn('NVIDIA API status:', response.status, await response.text());
      }
    } catch (err) {
      console.warn('NVIDIA API call failed, attempting fallback...', err);
    }
  }

  // 2. Try Google Gemini API
  if (geminiKey) {
    const geminiModels = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-pro'];
    for (const model of geminiModels) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      text: `${systemPrompt ? systemPrompt + '\n\n' : ''}${userPrompt}`,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: temperature,
                maxOutputTokens: 3500,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text && text.trim()) {
            return text.trim();
          }
        }
      } catch (err) {
        console.warn(`Gemini model ${model} failed:`, err);
      }
    }
  }

  return null;
}

/**
 * Parses JSON response safely from LLM output (removes markdown ```json fences)
 */
function cleanJsonOutput(text) {
  if (!text) return null;
  let clean = text.trim();
  if (clean.startsWith('```json')) {
    clean = clean.substring(7);
  } else if (clean.startsWith('```')) {
    clean = clean.substring(3);
  }
  if (clean.endsWith('```')) {
    clean = clean.substring(0, clean.length - 3);
  }
  clean = clean.trim();
  try {
    return JSON.parse(clean);
  } catch (err) {
    // Attempt regex extraction of first json object or array
    const match = clean.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (e) {
        return null;
      }
    }
    return null;
  }
}

// ----------------------------------------------------
// 1. AI QUIZ GENERATOR
// ----------------------------------------------------
export async function generateAIQuiz({
  topic,
  numQuestions = 5,
  rules = '',
  numOptions = 4,
  timeLimit = 15,
  marksPerQuestion = 5,
  department = 'Information Technology (AIML)',
  referenceText = '',
}) {
  const points = Number(marksPerQuestion) || 5;
  const count = Number(numQuestions) || 5;

  const systemPrompt = `You are a strict, top-tier Computer Science university professor creating multiple-choice assessment questions. Return ONLY valid JSON without markdown wrapping.`;

  const userPrompt = `Generate a ${count}-question university assessment on the topic: "${topic}".
Instructions & Rules: ${rules || 'Academic standard difficulty with precise conceptual questions.'}
Options per question: ${numOptions}
Marks per question: ${points}
${referenceText ? `Use reference material: ${referenceText.slice(0, 1500)}` : ''}

Format your response as a single valid JSON object strictly matching this schema:
{
  "title": "${topic} Assessment",
  "subject": "Information Technology",
  "department": "${department}",
  "durationMins": ${timeLimit},
  "marksPerQuestion": ${points},
  "totalMarks": ${count * points},
  "questions": [
    {
      "id": "q-1",
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "points": ${points},
      "explanation": "Clear explanation why this option is correct."
    }
  ]
}`;

  const rawOutput = await callLlmApi({ systemPrompt, userPrompt });
  const parsed = cleanJsonOutput(rawOutput);

  if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
    return {
      title: parsed.title || `${topic} Assessment`,
      subject: parsed.subject || 'Information Technology',
      department: department,
      type: 'mcq',
      durationMins: Number(parsed.durationMins) || Number(timeLimit) || 15,
      marksPerQuestion: points,
      totalMarks: parsed.questions.length * points,
      questions: parsed.questions.map((q, idx) => ({
        id: `q-${idx + 1}`,
        question: q.question,
        options: Array.isArray(q.options) ? q.options.slice(0, Number(numOptions)) : ['A', 'B', 'C', 'D'],
        correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
        points: Number(q.points) || points,
        explanation: q.explanation || `Derived from rule for topic: ${topic}.`,
      })),
    };
  }

  // Smart Academic Fallback if LLM is offline
  const fallbackQuestions = [];
  const sampleFocus = [
    'fundamental principle and mathematical definition',
    'worst-case time and space complexity characteristics',
    'edge case scenario handling and invariant preservation',
    'optimal real-world application and hardware considerations',
    'comparative trade-off vs alternate standard data structures',
    'rotation balancing and dynamic adjustment mechanics',
    'memory traversal and pointer manipulation patterns',
  ];

  for (let i = 1; i <= count; i++) {
    const focus = sampleFocus[(i - 1) % sampleFocus.length];
    fallbackQuestions.push({
      id: `q-${i}`,
      question: `Regarding ${topic}, which of the following best describes its ${focus}?`,
      options: [
        `Maintains strict logarithmic O(log N) depth through self-balancing invariants`,
        `Requires linear O(N) auxiliary overhead during dynamic node redistribution`,
        `Guarantees deterministic amortized O(1) operations across heterogeneous workloads`,
        `Direct sequential memory traversal prioritizing cache-locality efficiency`,
      ].slice(0, Number(numOptions)),
      correctIndex: (i - 1) % Number(numOptions),
      points: points,
      explanation: `Detailed analysis of ${topic}: The property aligns with ${focus} based on syllabus guidelines.`,
    });
  }

  return {
    title: `${topic} AI Assessment`,
    subject: 'Information Technology',
    department: department,
    type: 'mcq',
    durationMins: Number(timeLimit) || 15,
    marksPerQuestion: points,
    totalMarks: fallbackQuestions.length * points,
    questions: fallbackQuestions,
  };
}

// ----------------------------------------------------
// 2. AI ASSIGNMENT GENERATOR
// ----------------------------------------------------
export async function generateAIAssignment({
  topic,
  numQuestions = 3,
  rules = '',
  deadline = '2026-10-31T23:59',
  department = 'Information Technology (AIML)',
  referenceText = '',
}) {
  const count = Number(numQuestions) || 3;
  const marksPerProblem = 10;

  const systemPrompt = `You are a university academic coordinator designing practical assignments for engineering students. Return ONLY valid JSON without markdown wrapping.`;

  const userPrompt = `Design a ${count}-problem university assignment for topic: "${topic}".
Department: ${department}
Rules/Guidelines: ${rules || 'Require algorithmic proof, step-by-step calculations, and implementation.'}
Deadline: ${deadline}
${referenceText ? `Reference Material: ${referenceText.slice(0, 1500)}` : ''}

Format as JSON matching this schema:
{
  "title": "${topic} Problem Set",
  "subject": "Data Structures & Algorithms",
  "department": "${department}",
  "deadline": "${deadline}",
  "totalMarks": ${count * marksPerProblem},
  "instructions": "General submission guidelines and format requirements.",
  "problems": [
    {
      "id": "prob-1",
      "title": "Problem Title",
      "description": "Full problem statement with input/output and real-world context.",
      "marks": ${marksPerProblem},
      "deliverables": "What student needs to upload."
    }
  ]
}`;

  const rawOutput = await callLlmApi({ systemPrompt, userPrompt });
  const parsed = cleanJsonOutput(rawOutput);

  if (parsed && Array.isArray(parsed.problems) && parsed.problems.length > 0) {
    return {
      title: parsed.title || `${topic} Assignment`,
      subject: parsed.subject || 'Data Structures',
      department: department,
      deadline: parsed.deadline || deadline,
      totalMarks: parsed.problems.length * marksPerProblem,
      instructions: parsed.instructions || 'Submit clean handwritten PDF or typed document before the deadline.',
      problems: parsed.problems.map((p, idx) => ({
        id: `prob-${idx + 1}`,
        title: p.title || `Problem ${idx + 1}: ${topic}`,
        description: p.description,
        marks: Number(p.marks) || marksPerProblem,
        deliverables: p.deliverables || 'Code implementation + complexity analysis.',
      })),
    };
  }

  // Fallback
  const fallbackProblems = [];
  const probThemes = [
    { title: 'Core Implementation & State Analysis', marks: 10 },
    { title: 'Rigorous Complexity Bound Verification', marks: 10 },
    { title: 'Edge Case Stress-Testing & Robustness Proof', marks: 10 },
    { title: 'Real-world System Optimization & Benchmarking', marks: 10 },
  ];

  for (let i = 1; i <= count; i++) {
    const t = probThemes[(i - 1) % probThemes.length];
    fallbackProblems.push({
      id: `prob-${i}`,
      title: `${topic}: ${t.title}`,
      description: `Formulate a complete analytical and algorithmic solution for ${topic} focusing on ${t.title.toLowerCase()}. Provide mathematical proofs and trace the state transitions step-by-step.`,
      marks: t.marks,
      deliverables: 'Document containing pseudo-code, mathematical justification, and complexity bounds.',
    });
  }

  return {
    title: `${topic} Practical Assignment`,
    subject: 'Data Structures',
    department: department,
    deadline: deadline,
    totalMarks: fallbackProblems.length * marksPerProblem,
    instructions: 'All problems must be answered with documented steps. Plagiarism will be penalized.',
    problems: fallbackProblems,
  };
}

// ----------------------------------------------------
// 3. AI CODING TEST GENERATOR
// ----------------------------------------------------
export async function generateAICodingTest({
  topic,
  numQuestions = 2,
  rules = '',
  timeLimit = 30,
  testType = 'coding',
  department = 'Information Technology (AIML)',
  referenceText = '',
}) {
  const count = Number(numQuestions) || 2;

  const systemPrompt = `You are a technical coding interviewer designing programming assessment challenges with test cases and executable code templates. Return ONLY valid JSON.`;

  const userPrompt = `Create a ${count}-challenge coding assessment on topic: "${topic}".
Focus: ${rules || 'Time complexity, space optimization, edge cases.'}
Time Limit: ${timeLimit} minutes
Department: ${department}
${referenceText ? `Context: ${referenceText.slice(0, 1500)}` : ''}

Format as JSON matching this schema:
{
  "title": "${topic} Coding Benchmark",
  "subject": "Algorithm Engineering",
  "department": "${department}",
  "timeLimit": ${timeLimit},
  "totalMarks": ${count * 25},
  "challenges": [
    {
      "id": "code-1",
      "title": "Challenge Name",
      "difficulty": "Medium",
      "marks": 25,
      "description": "Problem explanation with constraints.",
      "inputFormat": "Input specifications.",
      "outputFormat": "Output specifications.",
      "starterCode": {
        "python": "def solve():\\n    # Write code here\\n    pass\\n",
        "javascript": "function solve() {\\n    // Write code here\\n}\\n"
      },
      "testCases": [
        { "input": "Sample input", "expectedOutput": "Expected output", "explanation": "Why this output." }
      ]
    }
  ]
}`;

  const rawOutput = await callLlmApi({ systemPrompt, userPrompt });
  const parsed = cleanJsonOutput(rawOutput);

  if (parsed && Array.isArray(parsed.challenges) && parsed.challenges.length > 0) {
    return {
      title: parsed.title || `${topic} Coding Test`,
      subject: parsed.subject || 'Programming & Algorithms',
      department: department,
      type: 'code',
      timeLimit: Number(parsed.timeLimit) || Number(timeLimit) || 30,
      totalMarks: parsed.challenges.length * 25,
      challenges: parsed.challenges.map((c, idx) => ({
        id: `code-${idx + 1}`,
        title: c.title || `Challenge ${idx + 1}: ${topic}`,
        difficulty: c.difficulty || 'Medium',
        marks: Number(c.marks) || 25,
        description: c.description || `Implement an efficient algorithm for ${topic}.`,
        inputFormat: c.inputFormat || 'Read inputs from stdin or function arguments.',
        outputFormat: c.outputFormat || 'Return the computed result matching constraints.',
        starterCode: c.starterCode || {
          python: `def solve(data):\n    # Write your solution for ${topic} below:\n    return data\n`,
          javascript: `function solve(data) {\n    // Write your solution for ${topic} below:\n    return data;\n}\n`,
        },
        testCases: Array.isArray(c.testCases) ? c.testCases : [
          { input: '[10, 20, 30]', expectedOutput: '[30, 20, 10]', explanation: 'Baseline test case.' },
        ],
      })),
    };
  }

  // Fallback Coding Challenge
  const fallbackChallenges = [];
  for (let i = 1; i <= count; i++) {
    fallbackChallenges.push({
      id: `code-${i}`,
      title: `${topic} Optimal Solution (Part ${i})`,
      difficulty: i === 1 ? 'Medium' : 'Hard',
      marks: 25,
      description: `Write a high-performance routine to process data under ${topic}. The routine must maintain O(N log N) or O(1) auxiliary bounds and handle boundary cases (empty input, duplicates, negative numbers).`,
      inputFormat: 'A list of integer nodes or dataset elements.',
      outputFormat: 'Return the balanced tree representation or transformed array.',
      starterCode: {
        python: `# Complete the implementation for ${topic}
def solution(nodes):
    # Your code here
    result = sorted(nodes)
    return result

# Test run
print(solution([45, 12, 85, 32, 89, 39, 69]))
`,
        javascript: `// Complete the implementation for ${topic}
function solution(nodes) {
    // Your code here
    return nodes.slice().sort((a, b) => a - b);
}

// Test run
console.log(solution([45, 12, 85, 32, 89, 39, 69]));
`,
      },
      testCases: [
        { input: '[45, 12, 85, 32, 89, 39, 69]', expectedOutput: '[12, 32, 39, 45, 69, 85, 89]', explanation: 'Sorted order verification.' },
        { input: '[5]', expectedOutput: '[5]', explanation: 'Single element boundary condition.' },
        { input: '[]', expectedOutput: '[]', explanation: 'Empty set edge case.' },
      ],
    });
  }

  return {
    title: `${topic} Coding Assessment`,
    subject: 'Data Structures & Algorithms',
    department: department,
    type: 'code',
    timeLimit: Number(timeLimit) || 30,
    totalMarks: fallbackChallenges.length * 25,
    challenges: fallbackChallenges,
  };
}

// ----------------------------------------------------
// 4. AI NOTES GENERATOR
// ----------------------------------------------------
export async function generateAINotes({
  topic,
  subject = 'Data Structures',
  focusArea = '',
  department = 'Information Technology (AIML)',
  referenceText = '',
}) {
  const systemPrompt = `You are a distinguished university professor authoring comprehensive, publication-ready academic lecture notes with clear headers, code illustrations, mathematical formulas, and bulleted takeaways.`;

  const userPrompt = `Author a complete, detailed lecture note document for:
Topic: "${topic}"
Subject: "${subject}"
Department: "${department}"
Focus: ${focusArea || 'Foundations, mathematical proof, architectural diagram, practical applications.'}
${referenceText ? `Source Reference: ${referenceText.slice(0, 2000)}` : ''}

Include these sections:
1. Executive Summary & Overview
2. Formal Definitions & Mathematical Theory
3. Algorithm / Step-by-Step Architecture
4. Complexity Analysis (Best, Average, Worst Case)
5. Real-World Applications in Modern Systems
6. Key Takeaways & Exam Revision Notes`;

  const rawOutput = await callLlmApi({ systemPrompt, userPrompt });
  if (rawOutput && rawOutput.length > 200) {
    return {
      title: `${topic} • Comprehensive Lecture Notes`,
      subject: subject,
      department: department,
      author: 'Prof. Divya C (AI Enhanced)',
      date: new Date().toLocaleDateString('en-GB'),
      readTime: '12 min read',
      content: rawOutput,
    };
  }

  // Fallback high-quality lecture note
  const fallbackContent = `# ${topic}
## Subject: ${subject} • ${department}
*Prepared for Academic Year 2026-2027 • Classroom 303 Lecture Module*

---

### 1. Executive Summary
The study of **${topic}** represents a cornerstone in modern computing and system design. In systems where performance, memory layout, and deterministic execution bounds are critical, ${topic} provides the theoretical and practical framework to ensure balanced and reliable throughput.

---

### 2. Theoretical Foundations & Mathematical Invariants
Every valid structure under this topic satisfies the invariant:
$$\\text{Balance Factor } BF = h(LeftSubtree) - h(RightSubtree) \\in \\{-1, 0, +1\\}$$

When $|BF| > 1$, balancing procedures are dynamically invoked to re-establish $O(\\log N)$ height invariants.

Key Properties:
- **Depth Guarantee**: Never exceeds $1.44 \\log_2(N + 2)$ levels.
- **Lookup Guarantee**: Deterministic $O(\\log N)$ lookup under all permutations.
- **Node Overhead**: Auxiliary balance factor requires minimal pointer bits.

---

### 3. Step-by-Step Rotation Operations
1. **Left-Left (LL) Rotation**: Single right rotation around the unbalance pivot.
2. **Right-Right (RR) Rotation**: Single left rotation around the unbalance pivot.
3. **Left-Right (LR) Double Rotation**: Left rotation on child node followed by Right rotation on parent.
4. **Right-Left (RL) Double Rotation**: Right rotation on child node followed by Left rotation on parent.

\`\`\`python
# Algorithmic Representation
def rotate_right(root):
    new_root = root.left
    root.left = new_root.right
    new_root.right = root
    update_height(root)
    update_height(new_root)
    return new_root
\`\`\`

---

### 4. Complexity Matrix
| Operation | Best Case | Average Case | Worst Case | Space Complexity |
| :--- | :--- | :--- | :--- | :--- |
| **Search** | $O(1)$ | $O(\\log N)$ | $O(\\log N)$ | $O(1)$ |
| **Insertion** | $O(1)$ | $O(\\log N)$ | $O(\\log N)$ | $O(1)$ |
| **Deletion** | $O(1)$ | $O(\\log N)$ | $O(\\log N)$ | $O(1)$ |

---

### 5. Practical Industry Applications
- **In-Memory Caches**: Dynamic indexation in database query planners (PostgreSQL, SQLite).
- **Network Routers**: High-speed routing table lookup for CIDR subnet IP classification.
- **Compiler Symbol Tables**: Fast identifier scoping in GCC and LLVM AST parsing.

---

### 6. Key Takeaways & Exam Tips
1. Always calculate balance factors top-down and verify bounds after every insertion.
2. Double rotations occur when the signs of the parent balance factor and child balance factor differ.
3. Keep track of parent pointer reassignments to avoid dangling pointer references.
`;

  return {
    title: `${topic} • Lecture Master Notes`,
    subject: subject,
    department: department,
    author: 'Prof. Divya C (AI Enhanced)',
    date: new Date().toLocaleDateString('en-GB'),
    readTime: '10 min read',
    content: fallbackContent,
  };
}

// ----------------------------------------------------
// 5. AI PPT GENERATOR
// ----------------------------------------------------
export async function generateAIPpt({
  topic,
  numSlides = 5,
  audience = 'SY.B.Sc AIML Undergraduates',
  department = 'Information Technology (AIML)',
  referenceText = '',
}) {
  const count = Number(numSlides) || 5;

  const systemPrompt = `You are a professional academic presentation designer creating structured PowerPoint slide decks for university lectures. Return ONLY valid JSON.`;

  const userPrompt = `Create a ${count}-slide academic lecture presentation on: "${topic}".
Target Audience: ${audience}
Department: ${department}
${referenceText ? `Source Material: ${referenceText.slice(0, 1500)}` : ''}

Format response as JSON matching this schema:
{
  "title": "${topic} Lecture Slides",
  "topic": "${topic}",
  "audience": "${audience}",
  "department": "${department}",
  "totalSlides": ${count},
  "slides": [
    {
      "slideNumber": 1,
      "title": "Slide Title",
      "subtitle": "Slide Subtitle / Context",
      "bulletPoints": [
        "Key point 1 with detail",
        "Key point 2 with detail",
        "Key point 3 with detail"
      ],
      "speakerNotes": "Guidance notes for the teacher while presenting this slide."
    }
  ]
}`;

  const rawOutput = await callLlmApi({ systemPrompt, userPrompt });
  const parsed = cleanJsonOutput(rawOutput);

  if (parsed && Array.isArray(parsed.slides) && parsed.slides.length > 0) {
    return {
      title: parsed.title || `${topic} Slide Deck`,
      topic: topic,
      audience: audience,
      department: department,
      totalSlides: parsed.slides.length,
      slides: parsed.slides.map((s, idx) => ({
        slideNumber: idx + 1,
        title: s.title || `Slide ${idx + 1}: ${topic}`,
        subtitle: s.subtitle || `Lecture Series • ${department}`,
        bulletPoints: Array.isArray(s.bulletPoints) ? s.bulletPoints : [
          `Fundamental properties of ${topic}`,
          `Practical implementation steps and caveats`,
          `Performance benchmarks and system considerations`,
        ],
        speakerNotes: s.speakerNotes || `Explain the core concepts and open the floor for questions.`,
      })),
    };
  }

  // Fallback Slides
  const fallbackSlides = [
    {
      slideNumber: 1,
      title: `${topic}: Conceptual Introduction`,
      subtitle: `Unit 2 • ${department} • Classroom 303`,
      bulletPoints: [
        `Historical origin, need, and significance in computing architectures`,
        `Core problem solved: Eliminating degenerate worst-case complexity`,
        `Formal mathematical definitions and invariant rules`,
      ],
      speakerNotes: 'Begin by asking students why unbalanced trees degenerate to linked lists in worst cases.',
    },
    {
      slideNumber: 2,
      title: 'Architectural Design & Invariants',
      subtitle: 'Height balancing equations and rotation taxonomy',
      bulletPoints: [
        'Balance Factor: Height(Left) - Height(Right) strictly between -1 and +1',
        'Single Rotations: Left-Left (LL) and Right-Right (RR) rebalancing',
        'Double Rotations: Left-Right (LR) and Right-Left (RL) pivot adjustments',
      ],
      speakerNotes: 'Draw the 4 rotation cases on the blackboard and ask students to identify pivot nodes.',
    },
    {
      slideNumber: 3,
      title: 'Algorithmic Implementation & Trace',
      subtitle: 'Step-by-step traversal and pointer manipulation',
      bulletPoints: [
        'Recursive vs iterative insertion logic',
        'Top-down balancing vs bottom-up height reconciliation',
        'Memory management and pointer update sequencing to prevent cycles',
      ],
      speakerNotes: 'Step through an animated example inserting keys: 10, 20, 30, 40, 50.',
    },
    {
      slideNumber: 4,
      title: 'Performance & Complexity Benchmarks',
      subtitle: 'Theoretical bounds vs empirical runtime analysis',
      bulletPoints: [
        'Search, Insert, Delete guaranteed in O(log N) worst-case time',
        'Auxiliary space bounded by O(1) beyond tree nodes',
        'Comparison with Red-Black Trees, B-Trees, and Skip Lists',
      ],
      speakerNotes: 'Highlight that AVL trees are preferred over Red-Black trees when lookups heavily outnumber inserts.',
    },
    {
      slideNumber: 5,
      title: 'Industry Systems & Summary',
      subtitle: 'Real-world deployments and practical takeaways',
      bulletPoints: [
        'Deployments in database index engines, virtual memory maps, and OS schedulers',
        'Summary: Balancing overhead is amortized across millions of queries',
        'Assignment & Lab exercise: Complete the implementation in Lab 3-B',
      ],
      speakerNotes: 'Wrap up and assign problem set #3 for next laboratory session.',
    },
  ];

  return {
    title: `${topic} Presentation Slides`,
    topic: topic,
    audience: audience,
    department: department,
    totalSlides: fallbackSlides.length,
    slides: fallbackSlides.slice(0, count),
  };
}
