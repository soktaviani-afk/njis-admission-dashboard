import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/* =========================================================
   GEMINI CONFIG
========================================================= */

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("GEMINI_API_KEY is not configured.");
}

const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
    })
  : null;

/*
  Model priority:

  1. Gemini 3.8 Flash
  2. Gemini 3.7 Flash
  3. Gemini 3.6 Flash
  4. Gemini 3.5 Flash
  5. Gemini 3.5 Flash-Lite
  6. Gemini 3.1 Flash-Lite

  All are stable Gemini API models.
*/

const GEMINI_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
];

/*
  Number of attempts per model.

  Example:
  Model 3.8 -> retry once
  then Model 3.7 -> retry once
  then Model 3.6 -> retry once
  ...
*/

const RETRIES_PER_MODEL = 1;

/* =========================================================
   DATA SOURCES
========================================================= */

const ENROLLMENT_URL =
  "https://opensheet.elk.sh/1iBQf0dnRCCOC3NyoNYBDSzDaKHM-gI80XwKtGYMhpDA/MASTER_ENROLLMENT";

const LEADS_URL =
  "https://opensheet.elk.sh/1Oa4Jrpwz7C4YDbtL8ztMT4NzZ9JLpiHz26ZLtQewyLU/INQUIRY%20FORM";

const STUDENT_EXIT_URL =
  "https://opensheet.elk.sh/1fCLWJ4uA3nztHOgxCNuM983QEFPdJn5AJCULPLTmYi4/StudentExitAnalysis";

const DOCUMENTS_URL =
  "https://opensheet.elk.sh/1e0senJvlGjTWxaOlAzcuocyjjlc_6EVWZ69u0cZX_Ig/DOCUMENT_TRACKER";

/* =========================================================
   FETCH HELPERS
========================================================= */

async function fetchJSON(url: string) {
  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch admissions data: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  return Array.isArray(data) ? data : [];
}

/* =========================================================
   DATA CLEANING
========================================================= */

function cleanEnrollmentData(data: any[]) {
  return data.map((student) => ({
    studentName: student["Student Name"] || "",
    grade: student["Grade Applying"] || "",
    nationality: student["Nationality Type"] || "",
    academicYear: student["Academic Year"] || "",
    PIC: student["PIC"] || "",
    currentStage: student["Current Stage"] || "",
    documentsStatus: student["Documents Status"] || "",
    paymentType: student["Payment Type"] || "",
    finalStatus: student["Final Status"] || "",
    onboardingStatus: student["Onboarding Status"] || "",
    acceptanceLetter: student["Acceptance Letter"] || "",
    financeInvoice: student["Inform Finance to Invoice"] || "",
    toddle: student["Toddle"] || "",
    studentID: student["Student ID"] || "",
    nationalityFlags: student["Nationality Flags"] || "",
    scanDocuments: student["Scan Documents"] || "",
    lastUpdate: student["Last Update"] || "",
    notes: student["Notes"] || "",
    enrollmentAgreement: student["Enrollment Agreement"] || "",
    mediaRelease: student["Media Release Form"] || "",
    birthCertificate: student["Birth Certificate"] || "",
    familyRegistry: student["Family Registry"] || "",
    parentsPassport: student["Parents Passport"] || "",
    childPassport: student["Child Passport"] || "",
    childID: student["Child ID"] || "",
    KITAS: student["KITAS"] || "",
    healthCard: student["Student Health Card"] || "",
    immunization: student["Immunization"] || "",
    reportCard: student["Report Card 3 Years"] || "",
  }));
}

function cleanLeadsData(data: any[]) {
  return data.map((lead) => ({
    timestamp: lead["Timestamp"] || "",
    source: lead["Source"] || "",
    childName: lead["Child Name"] || "",
    gender: lead["Gender"] || "",
    nationality: lead["Nationality"] || "",
    currentSchool: lead["Current School"] || "",
    currentGrade: lead["Current Grade"] || "",
    gradeToEnroll: lead["Grade to Enroll"] || "",
    PIC: lead["PIC"] || "",
    leadStatus: lead["Lead Status"] || "",
    converted: lead["Converted"] || "",
    academicYear: lead["AC Year"] || "",
    reasons: lead["Reasons"] || "",
  }));
}

function cleanStudentExitData(data: any[]) {
  return data.map((student) => ({
    studentName: student["Student Name"] || "",
    grade: student["Grade Level"] || "",
    academicYear: student["Academic Year"] || "",
    reason: student["Reason for Leaving"] || "",
    notes: student["Notes"] || "",
  }));
}

function cleanDocumentData(data: any[]) {
  return data.map((document) => ({
    date: document["Date"] || "",
    documentType: document["Document Type"] || "",
    documentNumber: document["Document Number"] || "",
    title: document["Title"] || "",
    requestedBy: document["Requested By"] || "",
    approver: document["Approver"] || "",
    status: document["Status"] || "",
    priority: document["Priority"] || "",
    remarks: document["Remarks"] || "",
    lastUpdate: document["Last Update"] || "",
  }));
}

/* =========================================================
   BUILD ADMISSIONS CONTEXT
========================================================= */

async function getAdmissionsContext() {
  const [
    enrollmentRaw,
    leadsRaw,
    studentExitRaw,
    documentsRaw,
  ] = await Promise.all([
    fetchJSON(ENROLLMENT_URL),
    fetchJSON(LEADS_URL),
    fetchJSON(STUDENT_EXIT_URL),
    fetchJSON(DOCUMENTS_URL),
  ]);

  const enrollment = cleanEnrollmentData(enrollmentRaw);
  const leads = cleanLeadsData(leadsRaw);
  const studentExit = cleanStudentExitData(studentExitRaw);
  const documents = cleanDocumentData(documentsRaw);

  /* =======================================================
     ENROLLMENT SUMMARY
  ======================================================= */

  const completedEnrollment = enrollment.filter(
    (student) => student.finalStatus === "Completed"
  ).length;

  const inProgressEnrollment = enrollment.filter(
    (student) => student.finalStatus === "In Progress"
  ).length;

  const enrollmentStages: Record<string, number> = {};
  const enrollmentStatuses: Record<string, number> = {};

  enrollment.forEach((student) => {
    const stage = student.currentStage || "Unknown";
    const status = student.finalStatus || "Unknown";

    enrollmentStages[stage] =
      (enrollmentStages[stage] || 0) + 1;

    enrollmentStatuses[status] =
      (enrollmentStatuses[status] || 0) + 1;
  });

  /* =======================================================
     LEADS SUMMARY
  ======================================================= */

  const convertedLeads = leads.filter(
    (lead) => lead.converted === "Yes"
  ).length;

  const hotLeads = leads.filter(
    (lead) =>
      lead.leadStatus === "Interested" ||
      lead.leadStatus === "Observation"
  ).length;

  const unassignedLeads = leads.filter(
    (lead) =>
      !lead.PIC ||
      lead.PIC.trim() === ""
  ).length;

  const leadStatuses: Record<string, number> = {};
  const leadSources: Record<string, number> = {};

  leads.forEach((lead) => {
    const status = lead.leadStatus || "Unknown";
    const source = lead.source || "Unknown";

    leadStatuses[status] =
      (leadStatuses[status] || 0) + 1;

    leadSources[source] =
      (leadSources[source] || 0) + 1;
  });

  const leadConversionRate =
    leads.length > 0
      ? Number(
          (
            (convertedLeads / leads.length) *
            100
          ).toFixed(1)
        )
      : 0;

  /* =======================================================
     STUDENT EXIT SUMMARY
  ======================================================= */

  const exitReasons: Record<string, number> = {};
  const exitGrades: Record<string, number> = {};

  studentExit.forEach((student) => {
    const reason = student.reason || "Unknown";
    const grade = student.grade || "Unknown";

    exitReasons[reason] =
      (exitReasons[reason] || 0) + 1;

    exitGrades[grade] =
      (exitGrades[grade] || 0) + 1;
  });

  /* =======================================================
     DOCUMENT SUMMARY
  ======================================================= */

  const documentStatuses: Record<string, number> = {};
  const documentPriorities: Record<string, number> = {};

  documents.forEach((document) => {
    const status = document.status || "Unknown";
    const priority = document.priority || "Unknown";

    documentStatuses[status] =
      (documentStatuses[status] || 0) + 1;

    documentPriorities[priority] =
      (documentPriorities[priority] || 0) + 1;
  });

  return {
    overview: {
      enrollmentRecords: enrollment.length,
      completedEnrollment,
      inProgressEnrollment,

      leadRecords: leads.length,
      convertedLeads,
      hotLeads,
      unassignedLeads,
      leadConversionRate,

      studentExitRecords: studentExit.length,

      internalDocumentRecords: documents.length,
    },

    enrollment: {
      stages: enrollmentStages,
      statuses: enrollmentStatuses,
      records: enrollment,
    },

    leads: {
      statuses: leadStatuses,
      sources: leadSources,
      records: leads,
    },

    studentExit: {
      reasons: exitReasons,
      grades: exitGrades,
      records: studentExit,
    },

    internalDocuments: {
      statuses: documentStatuses,
      priorities: documentPriorities,
      records: documents,
    },
  };
}

/* =========================================================
   GEMINI ERROR HELPERS
========================================================= */

function getErrorStatus(error: unknown): number | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error
  ) {
    const status = (error as { status?: unknown }).status;

    if (typeof status === "number") {
      return status;
    }
  }

  return null;
}

function isRetryableGeminiError(error: unknown) {
  const status = getErrorStatus(error);

  /*
    Retry/fallback for temporary server or rate-limit errors.
  */

  if (
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504
  ) {
    return true;
  }

  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();

  return (
    message.includes("unavailable") ||
    message.includes("high demand") ||
    message.includes("temporarily") ||
    message.includes("rate limit") ||
    message.includes("too many requests") ||
    message.includes("internal server error")
  );
}

function sleep(ms: number) {
  return new Promise((resolve) =>
    setTimeout(resolve, ms)
  );
}

/* =========================================================
   GEMINI HELPER WITH AUTOMATIC FALLBACK
========================================================= */

async function generateAIResponse(prompt: string) {
  if (!ai) {
    throw new Error(
      "GEMINI_API_KEY is missing. Please configure it in Vercel Environment Variables."
    );
  }

  let lastError: unknown = null;

  for (const model of GEMINI_MODELS) {
    for (
      let attempt = 0;
      attempt <= RETRIES_PER_MODEL;
      attempt++
    ) {
      try {
        console.log(
          `[Enrollment AI] Trying model: ${model} | attempt: ${
            attempt + 1
          }`
        );

        const response =
          await ai.models.generateContent({
            model,
            contents: prompt,
          });

        const text = response.text;

        if (!text) {
          throw new Error(
            `Gemini returned an empty response from ${model}.`
          );
        }

        console.log(
          `[Enrollment AI] Success with model: ${model}`
        );

        return {
          text,
          model,
        };
      } catch (error) {
        lastError = error;

        console.error(
          `[Enrollment AI] ${model} failed:`,
          error
        );

        /*
          If this is NOT a temporary error,
          don't waste time trying every model.
        */

        if (!isRetryableGeminiError(error)) {
          throw error;
        }

        /*
          Small exponential backoff.

          Attempt 1 -> 700ms
          Attempt 2 -> 1400ms
        */

        if (attempt < RETRIES_PER_MODEL) {
          const delay = 700 * (attempt + 1);

          console.log(
            `[Enrollment AI] Retrying ${model} in ${delay}ms...`
          );

          await sleep(delay);
        }
      }
    }

    /*
      Current model failed after retries.
      Move to the next model.
    */

    console.warn(
      `[Enrollment AI] Falling back from ${model}...`
    );

    /*
      Small delay before switching models.
    */

    await sleep(300);
  }

  throw (
    lastError ||
    new Error(
      "All Gemini models are currently unavailable."
    )
  );
}

/* =========================================================
   GET — AI HEALTH CHECK
========================================================= */

export async function GET() {
  const checkedAt =
    new Date().toISOString();

  try {
    if (!ai) {
      return NextResponse.json(
        {
          status: "unavailable",
          checkedAt,
          reason:
            "GEMINI_API_KEY is not configured.",
        },
        { status: 503 }
      );
    }

    const result =
      await generateAIResponse(
        "Respond with exactly one word: READY"
      );

    return NextResponse.json({
      status: "ready",
      checkedAt,
      model: result.model,
    });
  } catch (error) {
    console.error(
      "Gemini AI health check failed:",
      error
    );

    return NextResponse.json(
      {
        status: "unavailable",
        checkedAt,
        reason:
          error instanceof Error
            ? error.message
            : "Unknown Gemini error",
      },
      { status: 503 }
    );
  }
}

/* =========================================================
   POST
========================================================= */

export async function POST(
  request: Request
) {
    const authenticated = await isAuthenticated();

  if (!authenticated) {
    return NextResponse.json(
      {
        error: "Unauthorized.",
      },
      { status: 401 }
    );
  }
  try {
    const body = await request.json();

    const mode = body?.mode;
    const question = body?.question;

    /* =====================================================
       VALIDATE CHAT REQUEST
    ===================================================== */

    if (mode === "chat") {
      if (
        !question ||
        typeof question !== "string"
      ) {
        return NextResponse.json(
          {
            error:
              "Please provide a question.",
          },
          {
            status: 400,
          }
        );
      }
    }

    /* =====================================================
       GET ADMISSIONS DATA
    ===================================================== */

    const context =
      await getAdmissionsContext();

    const admissionsData =
      JSON.stringify(
        context,
        null,
        2
      );

    /* =====================================================
       AI CHAT MODE
    ===================================================== */

    if (mode === "chat") {
      const prompt = `
You are NJIS Admissions Intelligence, an internal AI assistant for the NJIS Admissions and Business Office team.

You have access to four operational data sources:

1. ENROLLMENT
2. LEADS DATABASE
3. STUDENT EXIT
4. INTERNAL DOCUMENTS / IOM

Your job is to answer the user's question using ONLY the provided data.

IMPORTANT RULES:

- Never invent names, numbers, dates, statuses, or facts.
- If the data does not contain enough information, clearly say so.
- You may combine information across multiple sources when useful.
- Always distinguish between leads, enrollment records, student exits, and internal documents.
- Do not assume that a lead is an enrolled student unless the data explicitly supports that.
- Do not assume that an internal document is specifically an IOM unless the document type or title indicates that.
- Do not expose unnecessary personal contact information.
- Focus on admissions operations and actionable business insight.
- When comparing data, explain the relationship clearly.
- Keep answers concise but useful.
- If appropriate, mention which data source(s) you used.
- Do not return JSON.
- Use natural language.
- Do not claim to have information that is not present in the supplied data.
- Do not use Markdown bold syntax with **.
- Do not use Markdown heading syntax with #.
- Prefer clean bullet points and short paragraphs.
- Make the answer easy for Admissions staff to scan quickly.

AVAILABLE NJIS DATA:

${admissionsData}

USER QUESTION:

${question}
`;

      const result =
        await generateAIResponse(
          prompt
        );

      return NextResponse.json({
        answer: result.text,
        model: result.model,
      });
    }

    /* =====================================================
       AI SUMMARY MODE
    ===================================================== */

    const prompt = `
You are NJIS Admissions Intelligence, an AI assistant for the internal NJIS Admissions team.

Analyze the following four operational data sources:

- Enrollment
- Leads Database
- Student Exit
- Internal Documents / IOM

DATA:

${admissionsData}

Your task:

1. Identify the most important overall admissions insight.
2. Identify 2-3 priority areas.
3. Give one practical recommendation.

You may cross-analyze the four data sources.

IMPORTANT:

- Only use information contained in the provided data.
- Do not invent applicants, names, dates, numbers, or facts.
- Focus on actionable admissions operations.
- Keep the answer concise and professional.
- Do not expose unnecessary personal information.

Return ONLY valid JSON in this exact structure:

{
  "summary": "one concise paragraph",
  "priorities": [
    "priority 1",
    "priority 2",
    "priority 3"
  ],
  "recommendation": "one practical recommendation"
}
`;

    const result =
      await generateAIResponse(
        prompt
      );

    const text = result.text;

    let parsed: {
      summary: string;
      priorities: string[];
      recommendation: string;
    };

    try {
      const cleanedText = text
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      parsed = JSON.parse(
        cleanedText
      );
    } catch {
      parsed = {
        summary: text,
        priorities: [],
        recommendation:
          "Review the admissions pipeline and prioritize applications that require follow-up.",
      };
    }

    return NextResponse.json({
      ...parsed,
      model: result.model,
    });
  } catch (error) {
    console.error(
      "Gemini Admissions AI error:",
      error
    );

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown server error";

    return NextResponse.json(
      {
        error: errorMessage,
      },
      {
        status: 500,
      }
    );
  }
}