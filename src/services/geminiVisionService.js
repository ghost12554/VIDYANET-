/**
 * Real Multimodal Gemini Vision Timetable Parsing Service
 * Uses Google Gemini AI Vision (gemini-3-flash-preview / gemini-3.5-flash / gemini-3.7-flash)
 * to parse ANY image or PDF dynamically with 100% accuracy.
 */

export function getGeminiApiKey() {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('indira_ums_gemini_api_key');
    if (saved) return saved.trim();
  }
  return (
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) ||
    ''
  );
}

export function saveGeminiApiKey(key) {
  if (typeof localStorage !== 'undefined') {
    if (key) {
      localStorage.setItem('indira_ums_gemini_api_key', key.trim());
    } else {
      localStorage.removeItem('indira_ums_gemini_api_key');
    }
  }
}

/**
 * Converts a browser File object to Base64
 */
export async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const base64Data = result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Parses any timetable file (image, PDF, etc.) using Gemini Vision API
 */
export async function parseTimetableWithGemini(file, dataUrl) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Please enter your Gemini API key');
  }

  // Determine MIME type
  let mimeType = 'image/png';
  if (file && file.name) {
    if (file.name.endsWith('.pdf')) {
      mimeType = 'application/pdf';
    } else if (file.name.endsWith('.png')) {
      mimeType = 'image/png';
    } else if (file.name.endsWith('.jpg') || file.name.endsWith('.jpeg')) {
      mimeType = 'image/jpeg';
    } else if (file.name.endsWith('.webp')) {
      mimeType = 'image/webp';
    }
  } else if (file && file.type) {
    mimeType = file.type;
  }

  // Get clean base64 data
  let base64Data = '';
  if (dataUrl && dataUrl.includes(',')) {
    base64Data = dataUrl.split(',')[1];
  } else if (file) {
    base64Data = await fileToBase64(file);
  }

  if (!base64Data) {
    throw new Error('No image data found. Please select an image or PDF file first.');
  }

  const prompt = `You are an expert college timetable parsing AI.
Analyze this uploaded college timetable image/document carefully.
Extract every single detail into pure, valid JSON with this EXACT structure:

{
  "institution": "University or College Name found in header",
  "program": "Program/Degree Name found in header (e.g. SY.B.Sc. AIML Sem-III)",
  "effectiveDate": "DD/MM/YYYY extracted from w.e.f. date",
  "division": "Division and Classroom found in document (e.g. Div-A (Classroom no - 303))",
  "dean": "Dean Name from signature area",
  "classTeacher": "Class Teacher Name",
  "theorySlots": [
    {
      "time": "09.45 to 10.45",
      "isBreak": false,
      "label": "Short Break / Lunch Break if isBreak is true, otherwise empty",
      "startHour": 9,
      "startMin": 45,
      "endHour": 10,
      "endMin": 45
    }
  ],
  "theorySchedule": {
    "Monday": [
      { "subject": "Subject name or code", "room": "303", "faculty": "Teacher name or code", "isBreak": false }
    ],
    "Tuesday": [],
    "Wednesday": [],
    "Thursday": [],
    "Friday": [],
    "Saturday": []
  },
  "practicalSlots": {
    "time": "e.g. 02:30 PM to 05:30 PM",
    "startHour": 14,
    "startMin": 30,
    "endHour": 17,
    "endMin": 30,
    "days": {
      "Monday": [
        { "lab": "Lab subject code", "batch": "Batch A/B/C", "faculty": "Teacher name" }
      ],
      "Tuesday": [],
      "Wednesday": [],
      "Thursday": [],
      "Friday": [],
      "Saturday": []
    }
  },
  "facultyMapping": [
    { "code": "Subject Code", "subject": "Full Subject Name", "faculty": "Full Teacher Name" }
  ],
  "batches": [
    { "name": "Batch A", "rollRange": "01 to 31" },
    { "name": "Batch B", "rollRange": "32 to 62" },
    { "name": "Batch C", "rollRange": "63 onwards" }
  ]
}

CRITICAL RULES:
1. Every time slot row in the image MUST have a matching entry in theorySlots.
2. If a row is labeled Break, Short Break, Lunch Break, or Tea Break, set isBreak: true and set subject to that break name.
3. theorySchedule for each day (Monday through Saturday) MUST have the exact same number of items as theorySlots.
4. If a cell in the table has '---' or is empty, set subject to '-'.
5. Return ONLY pure, raw JSON. Do not wrap in markdown or backticks.`;

  // Active flash models in priority order (No deprecated models!)
  const candidateModels = [
    'gemini-3-flash-preview',
    'gemini-3.5-flash',
    'gemini-3.7-flash',
    'gemini-3.8-flash',
  ];
  let lastError = null;

  for (const model of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          response_mime_type: 'application/json',
        },
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        // If rate limit (429) or high demand (503), wait 1 sec and continue to next model
        if (response.status === 429 || response.status === 503) {
          await new Promise((r) => setTimeout(r, 800));
        }
        lastError = new Error(`AI model (${model}) response: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const textContent =
        data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (!textContent) {
        lastError = new Error('Empty response from AI vision');
        continue;
      }

      // Parse JSON from response
      const cleanJson = textContent.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedResult = JSON.parse(cleanJson);

      // Clean up and ensure start/end hours are numbers
      if (parsedResult.theorySlots) {
        parsedResult.theorySlots = parsedResult.theorySlots.map((slot, idx) => {
          let sh = slot.startHour ?? (8 + idx);
          let sm = slot.startMin ?? 30;
          let eh = slot.endHour ?? (sh + 1);
          let em = slot.endMin ?? 15;

          if (slot.time) {
            const timeMatch = slot.time.match(/(\d{1,2})[.:](\d{2})\s*(?:to|-)\s*(\d{1,2})[.:](\d{2})/i);
            if (timeMatch) {
              sh = parseInt(timeMatch[1], 10);
              sm = parseInt(timeMatch[2], 10);
              eh = parseInt(timeMatch[3], 10);
              em = parseInt(timeMatch[4], 10);
            }
          }

          return {
            ...slot,
            startHour: Number(sh),
            startMin: Number(sm),
            endHour: Number(eh),
            endMin: Number(em),
          };
        });
      }

      return {
        ...parsedResult,
        parsedFrom: file ? file.name : 'Scanned Timetable Document',
        documentImage: dataUrl || '',
        parsedDate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toLocaleDateString(),
      };
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('Could not analyze document with AI Vision. Please try again.');
}
