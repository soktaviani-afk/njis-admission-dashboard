import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY!
);

const ENROLLMENT_URL =
  "https://opensheet.elk.sh/1iBQf0dnRCCOC3NyoNYBDSzDaKHM-gI80XwKtGYMhpDA/MASTER_ENROLLMENT";

const LEADS_URL =
  "https://opensheet.elk.sh/1Oa4Jrpwz7C4YDbtL8ztMT4NzZ9JLpiHz26ZLtQewyLU/INQUIRY%20FORM";

const STUDENT_EXIT_URL =
  "https://opensheet.elk.sh/1fCLWJ4uA3nztHOgxCNuM983QEFPdJn5AJCULPLTmYi4/StudentExitAnalysis";

const DOCUMENTS_URL =
  "https://opensheet.elk.sh/1e0senJvlGjTWxaOlAzcuocyjjlc_6EVWZ69u0cZX_Ig/DOCUMENT_TRACKER";

async function fetchJSON(url: string) {
  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch data: ${response.status}`
    );
  }

  const data = await response.json();

  return Array.isArray(data) ? data : [];
}

function cleanEnrollmentData(data: any[]) {
  return data.map((student) => ({
    studentName:
      student["Student Name"] || "",
    grade:
      student["Grade Applying"] || "",
    nationality:
      student["Nationality Type"] || "",
    academicYear:
      student["Academic Year"] || "",
    PIC:
      student["PIC"] || "",
    currentStage:
      student["Current Stage"] || "",
    documentsStatus:
      student["Documents Status"] || "",
    paymentType:
      student["Payment Type"] || "",
    finalStatus:
      student["Final Status"] || "",
    onboardingStatus:
      student["Onboarding Status"] || "",
    acceptanceLetter:
      student["Acceptance Letter"] || "",
    financeInvoice:
      student["Inform Finance to Invoice"] || "",
    toddle:
      student["Toddle"] || "",
    studentID:
      student["Student ID"] || "",
    nationalityFlags:
      student["Nationality Flags"] || "",
    scanDocuments:
      student["Scan Documents"] || "",
    lastUpdate:
      student["Last Update"] || "",
    notes:
      student["Notes"] || "",
    enrollmentAgreement:
      student["Enrollment Agreement"] || "",
    mediaRelease:
      student["Media Release Form"] || "",
    birthCertificate:
      student["Birth Certificate"] || "",
    familyRegistry:
      student["Family Registry"] || "",
    parentsPassport:
      student["Parents Passport"] || "",
    childPassport:
      student["Child Passport"] || "",
    childID:
      student["Child ID"] || "",
    KITAS:
      student["KITAS"] || "",
    healthCard:
      student["Student Health Card"] || "",
    immunization:
      student["Immunization"] || "",
    reportCard:
      student["Report Card 3 Years"] || "",
  }));
}

function cleanLeadsData(data: any[]) {
  return data.map((lead) => ({
    timestamp:
      lead["Timestamp"] || "",
    source:
      lead["Source"] || "",
    childName:
      lead["Child Name"] || "",
    gender:
      lead["Gender"] || "",
    nationality:
      lead["Nationality"] || "",
    currentSchool:
      lead["Current School"] || "",
    currentGrade:
      lead["Current Grade"] || "",
    gradeToEnroll:
      lead["Grade to Enroll"] || "",
    PIC:
      lead["PIC"] || "",
    leadStatus:
      lead["Lead Status"] || "",
    converted:
      lead["Converted"] || "",
    academicYear:
      lead["AC Year"] || "",
    reasons:
      lead["Reasons"] || "",
  }));
}

function cleanStudentExitData(data: any[]) {
  return data.map((student) => ({
    studentName:
      student["Student Name"] || "",
    grade:
      student["Grade Level"] || "",
    academicYear:
      student["Academic Year"] || "",
    reason:
      student["Reason for Leaving"] || "",
    notes:
      student["Notes"] || "",
  }));
}

function cleanDocumentData(data: any[]) {
  return data.map((document) => ({
    date:
      document["Date"] || "",
    documentType:
      document["Document Type"] || "",
    documentNumber:
      document["Document Number"] || "",
    title:
      document["Title"] || "",
    requestedBy:
      document["Requested By"] || "",
    approver:
      document["Approver"] || "",
    status:
      document["Status"] || "",
    priority:
      document["Priority"] || "",
    remarks:
      document["Remarks"] || "",
    lastUpdate:
      document["Last Update"] || "",
  }));
}

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

  const enrollment =
    cleanEnrollmentData(enrollmentRaw);

  const leads =
    cleanLeadsData(leadsRaw);

  const studentExit =
    cleanStudentExitData(studentExitRaw);

  const documents =
    cleanDocumentData(documentsRaw);

  // =========================
  // ENROLLMENT SUMMARY
  // =========================

  const completedEnrollment =
    enrollment.filter(
      (student) =>
        student.finalStatus === "Completed"
    ).length;

  const inProgressEnrollment =
    enrollment.filter(
      (student) =>
        student.finalStatus === "In Progress"
    ).length;

  const enrollmentStages: Record<
    string,
    number
  > = {};

  const enrollmentStatuses: Record<
    string,
    number
  > = {};

  enrollment.forEach((student) => {
    const stage =
      student.currentStage || "Unknown";

    const status =
      student.finalStatus || "Unknown";

    enrollmentStages[stage] =
      (enrollmentStages[stage] || 0) + 1;

    enrollmentStatuses[status] =
      (enrollmentStatuses[status] || 0) + 1;
  });

  // =========================
  // LEADS SUMMARY
  // =========================

  const convertedLeads =
    leads.filter(
      (lead) =>
        lead.converted === "Yes"
    ).length;

  const hotLeads =
    leads.filter(
      (lead) =>
        lead.leadStatus === "Interested" ||
        lead.leadStatus === "Observation"
    ).length;

  const unassignedLeads =
    leads.filter(
      (lead) =>
        !lead.PIC ||
        lead.PIC.trim() === ""
    ).length;

  const leadStatuses: Record<
    string,
    number
  > = {};

  const leadSources: Record<
    string,
    number
  > = {};

  leads.forEach((lead) => {
    const status =
      lead.leadStatus || "Unknown";

    const source =
      lead.source || "Unknown";

    leadStatuses[status] =
      (leadStatuses[status] || 0) + 1;

    leadSources[source] =
      (leadSources[source] || 0) + 1;
  });

  const leadConversionRate =
    leads.length > 0
      ? Number(
          (
            (convertedLeads /
              leads.length) *
            100
          ).toFixed(1)
        )
      : 0;

  // =========================
  // STUDENT EXIT SUMMARY
  // =========================

  const exitReasons: Record<
    string,
    number
  > = {};

  const exitGrades: Record<
    string,
    number
  > = {};

  studentExit.forEach((student) => {
    const reason =
      student.reason || "Unknown";

    const grade =
      student.grade || "Unknown";

    exitReasons[reason] =
      (exitReasons[reason] || 0) + 1;

    exitGrades[grade] =
      (exitGrades[grade] || 0) + 1;
  });

  // =========================
  // DOCUMENT SUMMARY
  // =========================

  const documentStatuses: Record<
    string,
    number
  > = {};

  const documentPriorities: Record<
    string,
    number
  > = {};

  documents.forEach((document) => {
    const status =
      document.status || "Unknown";

    const priority =
      document.priority || "Unknown";

    documentStatuses[status] =
      (documentStatuses[status] || 0) + 1;

    documentPriorities[priority] =
      (documentPriorities[priority] || 0) + 1;
  });

  return {
    overview: {
      enrollmentRecords:
        enrollment.length,
      completedEnrollment,
      inProgressEnrollment,

      leadRecords:
        leads.length,
      convertedLeads,
      hotLeads,
      unassignedLeads,
      leadConversionRate,

      studentExitRecords:
        studentExit.length,

      internalDocumentRecords:
        documents.length,
    },

    enrollment: {
      stages:
        enrollmentStages,
      statuses:
        enrollmentStatuses,
      records:
        enrollment,
    },

    leads: {
      statuses:
        leadStatuses,
      sources:
        leadSources,
      records:
        leads,
    },

    studentExit: {
      reasons:
        exitReasons,
      grades:
        exitGrades,
      records:
        studentExit,
    },

    internalDocuments: {
      statuses:
        documentStatuses,
      priorities:
        documentPriorities,
      records:
        documents,
    },
  };
}

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    const {
      mode,
      question,
    } = body;

    const model =
      genAI.getGenerativeModel({
        model: "gemini-3.5-flash-lite",
      });

    const context =
      await getAdmissionsContext();

    const admissionsData =
      JSON.stringify(
        context,
        null,
        2
      );

    // =========================
    // AI CHAT MODE
    // =========================

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
- Do not assume that an internal document is specifically an IOM unless the document type/title indicates it.
- Do not expose unnecessary personal contact information.
- Focus on admissions operations and actionable business insight.
- When comparing data, explain the relationship clearly.
- Keep answers concise but useful.
- If appropriate, mention which data sources you used.
- Do not return JSON.
- Use natural language.

AVAILABLE NJIS DATA:

${admissionsData}

USER QUESTION:

${question}
`;

      const result =
        await model.generateContent(
          prompt
        );

      return NextResponse.json({
        answer:
          result.response.text(),
      });
    }

    // =========================
    // AI SUMMARY MODE
    // =========================

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
      await model.generateContent(
        prompt
      );

    const text =
      result.response.text();

    let parsed;

    try {
      const cleanedText =
        text
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();

      parsed =
        JSON.parse(cleanedText);
    } catch {
      parsed = {
        summary: text,
        priorities: [],
        recommendation:
          "Review the admissions pipeline and prioritize applications that require follow-up.",
      };
    }

    return NextResponse.json(
      parsed
    );
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