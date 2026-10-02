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

    const { question, exitRecords } = body;

    if (!question || !exitRecords) {
      return NextResponse.json(
        {
          error: "Question and exit records are required.",
        },
        { status: 400 }
      );
    }

    const exitContext = JSON.stringify(
      exitRecords,
      null,
      2
    );

    const prompt = `
You are an AI assistant inside an internal Admissions dashboard.

Your role is to help Admissions staff analyze student exit records and identify useful patterns.

IMPORTANT RULES:

- Use ONLY the information provided in the student exit records.
- Never invent or assume information.
- If information is unavailable, explicitly say "Information unavailable."
- Do not make admission decisions.
- Do not recommend accepting or rejecting students.
- Do not modify any student data.
- Do not claim that an action has been completed unless the records explicitly say so.
- Keep answers concise and practical for Admissions staff.
- Do not use Markdown formatting.
- Do not use asterisks (*).
- Do not use double asterisks (**).
- Do not use hashtags (#).
- Do not use Markdown bullet syntax.
- Use plain text only.
- For lists, use simple numbered lists or the "•" bullet character.
- Use short paragraphs and clear line breaks.
- Clearly distinguish between recorded information and information that is unavailable.
- When identifying patterns, only describe patterns that can actually be supported by the provided records.
- Do not exaggerate trends.
- The final interpretation and verification remain with the Admissions staff member.

Student exit records:

${exitContext}

Admissions staff question:

${question}
`;

    let lastError: unknown = null;

    for (const model of MODELS) {
      try {
        console.log(
          `[Student Exit AI] Trying model: ${model}`
        );

        const response =
          await ai.models.generateContent({
            model,
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
          `[Student Exit AI] Success with model: ${model}`
        );

        return NextResponse.json({
          answer,
          model,
        });
      } catch (error) {
        lastError = error;

        console.error(
          `[Student Exit AI] Model ${model} failed:`,
          error
        );
      }
    }

    console.error(
      "[Student Exit AI] All models failed:",
      lastError
    );

    return NextResponse.json(
      {
        error:
          "The AI service is temporarily unavailable. Please try again shortly.",
      },
      { status: 503 }
    );
  } catch (error) {
    console.error(
      "Student Exit AI error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to generate AI response. Please try again.",
      },
      { status: 500 }
    );
  }
}