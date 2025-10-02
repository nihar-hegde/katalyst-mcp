import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { NextResponse } from "next/server";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { title, description, attendees } = await req.json();

    if (!title) {
      return NextResponse.json(
        { error: "Event title is required." },
        { status: 400 }
      );
    }

    const attendeeList =
      attendees?.map((a: { email: string }) => a.email).join(", ") ||
      "No attendees listed";
    const userPrompt = `
      You are an expert meeting summarizer. Your goal is to generate a concise, professional summary for a past calendar event.
      Based on the following details, infer the meeting's purpose and its most likely key discussion points or outcomes.
      The output should be a single, well-written paragraph. Do not use markdown or special formatting.

      ---
      Event Title: "${title}"
      Event Description: "${description || "No description provided."}"
      Attendees: ${attendeeList}
      ---
    `;

    const result = await streamText({
      model: openai("gpt-5-nano"),
      messages: [{ role: "user", content: userPrompt }],
    });
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("[API_SUMMARIZE_ERROR]", error);
    return NextResponse.json(
      { error: "An error occurred while generating the summary." },
      { status: 500 }
    );
  }
}
