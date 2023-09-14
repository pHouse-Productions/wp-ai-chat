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

  const transcript = body.messages.slice(-20);

  const url = process.env.WP_URL + "/graphql";
  const apiKey = process.env.WP_API_KEY;
  const accountId = await getAccountId();
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
${transcript
  .map(({ from, message, date }) =>
    `
Date: ${date}
From: ${from === "Bot" ? "You" : "User"}
Body:
${message}
          `.trim()
  )
  .join("\n\n")}
CHAT_TRANSCRIPT_END

Bot is an AI assistant that doesn't know anything beyond the transcript and data sources.
Write bot's response to the user here.
Bot does not declare that it is an AI assistant in its responses.
It is implied that all answers are based on the data sources so the bot does not preface responses saying so.
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

const getAccountId = async () => {
  const url = process.env.WP_URL + "/graphql";
  const apiKey = process.env.WP_API_KEY;
  const data = {
    query: `
query apiKeys($apiKey: ID!) {
  apiKeys(input: {apiKeys: [$apiKey]}) {
    accountId
  }
}
    `,
    variables: { apiKey },
  };
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey ?? "" },
    body: JSON.stringify(data),
  });
  const json = await response.json();
  return z
    .array(
      z.object({
        accountId: z.string(),
      })
    )
    .parse(json.data.apiKeys)[0].accountId;
};
