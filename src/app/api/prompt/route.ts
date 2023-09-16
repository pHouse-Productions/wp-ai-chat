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

  const transcript = body.messages
    .slice(-10)
    .map((m) =>
      `
FROM: ${m.from}
BODY_START
${m.message}
BODY_END
`.trim()
    )
    .join("\n\n");
  const model = AiModel.Gpt_3_5Turbo;

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
        type: AiRequestType.DataSourcePrompt,
        includeReferences: true,
        model,
        temperature: 0,
        dataSource: { type: "SACRA" },
        maxCharacters: 500,
        prompt: {
          type: DataSourceType.Array,
          array: [
            {
              type: DataSourceType.AiRequest,
              aiRequest: {
                accountId,
                type: AiRequestType.Prompt,
                model,
                prompt: {
                  type: DataSourceType.Text,
                  textContent: `
START_TRANSCRIPT
${transcript}
END_TRANSCRIPT

Rewrite ONLY the last message from "User" so it can be submitted as a stand-alone question or statement separate from the rest of the chat.
It will be submitted to somebody that doesn't know anything about the transcript and has no context.
Carry over any information that is relevant to the question or statement so it can be understood without context.
Your response should look something like:
"The user would like to know..."
or
"The user says that..."
                `.trim(),
                },
              },
            },
            {
              type: DataSourceType.Text,
              textContent: `
  
Respond to the user using ONLY the data sources provided.
If you cannot respond or if there's no specific query, suggest some topics that are in the data sources.
Respond in the style of an informal human.
You do not need to say hi.
              `.trimEnd(),
            },
          ],
        },
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

enum AiRequestType {
  DataSourcePrompt = "DATA_SOURCE_PROMPT",
  Facts = "FACTS",
  Prompt = "PROMPT",
  Summary = "SUMMARY",
}

enum DataSourceType {
  AiRequest = "AI_REQUEST",
  Array = "ARRAY",
  GoogleSearch = "GOOGLE_SEARCH",
  Sacra = "SACRA",
  Text = "TEXT",
  Url = "URL",
}

enum AiModel {
  Gpt_3_5Turbo = "gpt_3_5_turbo",
  Gpt_3_5Turbo_16k = "gpt_3_5_turbo_16k",
  Gpt_4 = "gpt_4",
  TextEmbeddingAda_002 = "text_embedding_ada_002",
}
