import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      mode,
      question,
      totalApplicants,
      completed,
      inProgress,
      completionRate,
      stageCounts,
      statusCounts,
    } = body;

    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash-lite",
    });

    const admissionsData = `
Total Applicants: ${totalApplicants}
Completed: ${completed}
In Progress: ${inProgress}
Completion Rate: ${completionRate}%

Stage Distribution:
${JSON.stringify(stageCounts, null, 2)}

Status Distribution:
${JSON.stringify(statusCounts, null, 2)}
`;

    // =========================
    // AI CHAT MODE
    // =========================

    if (mode === "chat") {
      const prompt = `
You are NJIS Admissions Intelligence, an AI assistant for the internal admissions team.

Answer the user's question using ONLY the admissions data provided below.

ADMISSIONS DATA:
${admissionsData}

USER QUESTION:
${question}

Rules:
- Answer directly and clearly.
- Do not invent applicant names, numbers, dates, or facts.
- If the data does not contain enough information to answer, say so clearly.
- Give useful operational insight when appropriate.
- Keep the answer concise but informative.
- You are assisting an admissions operations team, so focus on actionable insights.

Return a natural language answer. Do not return JSON.
`;

      const result =
        await model.generateContent(prompt);

      return NextResponse.json({
        answer: result.response.text(),
      });
    }

    // =========================
    // AI SUMMARY MODE
    // =========================

    const prompt = `
You are NJIS Admissions Intelligence, an AI assistant for an internal school admissions team.

Analyze the following admissions dashboard data:

${admissionsData}

Your job is to:

1. Identify the most important operational insight.
2. Identify 2-3 priority areas.
3. Give one practical recommendation.

IMPORTANT:
- Only use information provided in the data.
- Do not invent applicants, names, dates, numbers, or facts.
- Keep the analysis concise and professional.
- Focus on actionable admissions operations.

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
      await model.generateContent(prompt);

    const text =
      result.response.text();

    let parsed;

    try {
      const cleanedText = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      parsed = JSON.parse(cleanedText);
    } catch {
      parsed = {
        summary: text,
        priorities: [],
        recommendation:
          "Review the admissions pipeline and prioritize applications that require follow-up.",
      };
    }

    return NextResponse.json(parsed);

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