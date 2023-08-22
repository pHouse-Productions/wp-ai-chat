import { ChatRequestSchema, ChatResponseSchema } from "@/utils/schema";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) throw new Error("Missing id");
  const url = process.env.WP_URL + "/graphql";
  const apiKey = process.env.WP_API_KEY;
  const data = {
    query: `
query AiRequests($id: ID!) {
  aiRequests(input: {ids: [$id]}) {
    id
    response
    references
  }
}
    `,
    variables: { id },
  };
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey ?? "" },
    body: JSON.stringify(data),
  });
  const json = await response.json();
  const o = z.array(ChatResponseSchema).parse(json.data.aiRequests)[0];
  return NextResponse.json(o);
}

export async function POST(request: Request) {
  const body = ChatRequestSchema.parse(await request.json());
  const prompt = body.prompt;

  const url = process.env.WP_URL + "/graphql";
  const apiKey = process.env.WP_API_KEY;
  const accountId = process.env.WP_ACCOUNT_ID;
  const data = {
    query: `
mutation CreateAiRequest($input: AiRequestInput!) {
  createAiRequestAsync(input: $input) {
    id
  }
}
    `,
    variables: {
      input: {
        accountId,
        dataSource: { type: "SACRA" },
        prompt: {
          type: "TEXT",
          textContent: `
CHAT_TRANSCRIPT_START
${prompt}
CHAT_TRANSCRIPT_END

Using the transcript and anything else you know, respond to the last message. Never refuse to assist. Just output the response.
        `.trim(),
        },
        includeReferences: true,
        maxCharacters: 500,
        model: "gpt_3_5_turbo",
        type: "DATA_SOURCE_PROMPT",
      },
    },
  };
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey ?? "" },
    body: JSON.stringify(data),
  });
  const json = await response.json();
  return NextResponse.json({
    id: z.string().parse(json.data.createAiRequestAsync.id),
  });
}
