import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";

const apiKey = process.env.GEMINI_API_KEY;

const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
    })
  : null;

// Fallback order.
// If one model is temporarily unavailable, the next model is tried.
const MODELS = [
  "gemini-3.7-flash",
  "gemini-3.8-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
];

export async function POST(request: Request) {
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
    if (!ai) {
      return NextResponse.json(
        {
          error: "GEMINI_API_KEY is not configured.",
        },
        { status: 500 }
      );
    }

    const body = await request.json();

    const { question, leads } = body;

    if (!question || !Array.isArray(leads)) {
      return NextResponse.json(
        {
          error:
            "Question and leads data are required.",
        },
        { status: 400 }
      );
    }

    /*
     * Limit the amount of data sent to the AI.
     * The AI only needs information relevant
     * to sales/admissions analysis.
     */
    const safeLeads = leads.map((lead: any) => ({
      Timestamp: lead.Timestamp || "",
      Source: lead.Source || "",
      "Child Name": lead["Child Name"] || "",
      Nationality: lead.Nationality || "",
      "Current School":
        lead["Current School"] || "",
      "Current Grade":
        lead["Current Grade"] || "",
      "Grade to Enroll":
        lead["Grade to Enroll"] || "",
      "Mother's Name":
        lead["Mother's Name"] || "",
      "Father's Name":
        lead["Father's Name"] || "",
      PIC: lead.PIC || "",
      "Lead Status":
        lead["Lead Status"] || "",
      Converted: lead.Converted || "",
      "AC Year": lead["AC Year"] || "",
      Reasons: lead.Reasons || "",
    }));

    const leadContext = JSON.stringify(
      safeLeads,
      null,
      2
    );

    const prompt = `
You are the Lead AI Assistant inside an internal Admissions and Sales dashboard.

Your job is to help the Admissions/Sales team understand their lead database and decide what information deserves attention.

IMPORTANT RULES:

- Use ONLY the lead data provided below.
- Never invent information.
- Never assume information that is not recorded.
- If information is unavailable, say "Information unavailable."
- Do not make admission decisions.
- Do not recommend accepting or rejecting a student.
- Do not modify lead data.
- Do not claim that a parent was contacted unless the provided data explicitly says so.
- Do not create fake follow-up history.
- You may identify leads that appear to need attention based ONLY on recorded data such as timestamp, lead status, PIC, and conversion status.
- Keep answers practical and concise for Admissions/Sales staff.
- Use plain text only.
- Do NOT use Markdown.
- Do NOT use asterisks.
- Do NOT use hashtags.
- Do NOT use Markdown headings.
- Do NOT use Markdown bullet syntax.
- For lists, use simple numbered lists or the "•" character.
- Use short paragraphs and clear line breaks.
- When recommending a follow-up action, clearly label it as a suggestion.
- The final decision and verification always remain with Admissions/Sales staff.

Useful lead analysis:

1. Days idle may be estimated from Timestamp compared with today's date.
2. Interested and Observation leads may be considered active/higher-interest leads, but do not claim they are guaranteed to convert.
3. Leads with long idle periods may be highlighted for follow-up.
4. Converted = Yes means the record is marked as converted.
5. Compare sources and PICs only using the provided records.
6. If the data does not support a conclusion, say "Information unavailable."

LEAD DATABASE:

${leadContext}

ADMISSIONS/SALES QUESTION:

${question}
`;

    let lastError: unknown = null;

    for (const model of MODELS) {
      try {
        console.log(
          `Lead AI trying model: ${model}`
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
            "AI returned an empty response."
          );
        }

        console.log(
          `Lead AI success with model: ${model}`
        );

        return NextResponse.json({
          answer,
          model,
        });
      } catch (error) {
        lastError = error;

        console.error(
          `Lead AI model ${model} failed:`,
          error
        );

        // Try the next model.
        continue;
      }
    }

    console.error(
      "All Lead AI models failed:",
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
      "Lead AI error:",
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