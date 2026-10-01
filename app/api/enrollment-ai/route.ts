import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

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

    const studentContext = JSON.stringify(student, null, 2);

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
- Do not use asterisks (*), double asterisks (**), hashtags (#), or Markdown bullet syntax.
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

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    return NextResponse.json({
      answer: response.text,
    });
  } catch (error: any) {
    console.error("Enrollment AI error:", error);

    const status = error?.status || 500;

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