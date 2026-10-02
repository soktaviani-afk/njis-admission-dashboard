import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODELS = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
];

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { question, student } = body;

    if (!question || !student) {
      return NextResponse.json(
        {
          error: "Question and student data are required.",
        },
        { status: 400 }
      );
    }

    const studentContext = JSON.stringify(
      student,
      null,
      2
    );

    const prompt = `
You are an AI assistant inside an internal Admissions dashboard.

Your role is to help Admissions staff understand and review an enrollment record.

IMPORTANT RULES:

- Use ONLY the information provided in the student record.
- Never invent or assume information.
- If information is unavailable, explicitly say "Information unavailable."
- Do not make admission decisions.
- Do not recommend accepting or rejecting a student.
- Do not modify any student data.
- Do not claim that an action has been completed unless the provided record explicitly says so.
- Keep answers concise and practical for Admissions staff.
- Do not use Markdown formatting.
- Do not use asterisks.
- Do not use hashtags.
- Do not use Markdown bullet syntax.
- Use plain text only.
- For lists, use simple numbered lists or the "•" bullet character.
- Use short paragraphs and clear line breaks.
- Make the answer easy to scan.
- When identifying pending items, clearly distinguish between recorded incomplete items and information that is unavailable.
- The final decision and verification always remain with the Admissions staff member.

Student record:
${studentContext}

Admissions staff question:
${question}
`;

    let lastError: any = null;

    for (const model of MODELS) {
      try {
        console.log(
          `[Enrollment AI] Trying model: ${model}`
        );

        const response =
          await ai.models.generateContent({
            model: model,
            contents: prompt,
          });

        const answer =
          response.text?.trim();

        if (!answer) {
          throw new Error(
            `Model ${model} returned an empty response.`
          );
        }

        console.log(
          `[Enrollment AI] Success with model: ${model}`
        );

        return NextResponse.json({
          answer: answer,
          model: model,
        });
      } catch (error: any) {
        lastError = error;

        const status =
          error?.status ||
          error?.response?.status ||
          500;

        console.error(
          `[Enrollment AI] ${model} failed:`,
          error?.message || error
        );

        if (
          status === 429 ||
          status === 500 ||
          status === 502 ||
          status === 503 ||
          status === 504
        ) {
          console.log(
            `[Enrollment AI] Falling back to next model...`
          );

          continue;
        }

        throw error;
      }
    }

    console.error(
      "[Enrollment AI] All models failed:",
      lastError
    );

    return NextResponse.json(
      {
        error:
          "All AI models are temporarily unavailable. Please try again shortly.",
      },
      { status: 503 }
    );
  } catch (error: any) {
    console.error(
      "[Enrollment AI] Unexpected error:",
      error
    );

    const status =
      error?.status ||
      error?.response?.status ||
      500;

    return NextResponse.json(
      {
        error:
          status === 503
            ? "The AI service is temporarily unavailable. Please try again shortly."
            : "Unable to generate AI response. Please try again.",
      },
      { status }
    );
  }
}