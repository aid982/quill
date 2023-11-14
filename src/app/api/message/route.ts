import { files, messages } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { pinecone } from "@/lib/pinecone";
import { SendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { and, eq, sql } from "drizzle-orm";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { NextRequest } from "next/server";
import { OpenAIStream, StreamingTextResponse } from "ai";
import OpenAI from "openai"

export const openai = new OpenAI({
    apiKey:process.env.OPEN_AI
})

export const POST = async (req: NextRequest) => {
  // api for asking question to a PDF
  const session = await auth();
  if (!session) return new Response("UNAUTHORIZED", { status: 401 });
  const { user } = session;

  const body = await req.json();

  const { fileId, message } = SendMessageValidator.parse(body);

  const fileArray = await db
    .select()
    .from(files)
    .where(and(eq(files.id, fileId), eq(files.userId, user.id)));
  console.log(fileArray);

  if (fileArray.length === 0) {
    return new Response("NOT_FOUND", { status: 404 });
  }
  const file = fileArray[0];
  const prevMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.fileId, fileId))
    .orderBy(sql`${messages.createdAt} asc`)
    .limit(5);

  try {
    const insertedData = await db
      .insert(messages)
      .values({
        fileId: file.id,
        userId: user.id,
        text: message,
        isUserMessage: true,
      })
      .returning();
    console.log(insertedData);
  } catch (error) {
    console.log(error);
    return new Response("SERVER ERROR", { status: 500 });
  }

  // Vectorize
  const embaddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPEN_AI,
  });
  console.log(embaddings);

  const pineconeIndex = pinecone.Index("quill");

  const vectorStore = await PineconeStore.fromExistingIndex(embaddings, {
    pineconeIndex,
  });

  console.log(vectorStore);

  const results = await vectorStore.similaritySearch(message, 2);
  console.log(message)
  console.log(results);  

  const formattedPrevMessages = prevMessages.map((msg) => ({
    role: msg.isUserMessage ? ("user" as const) : ("assistant" as const),
    content: msg.text,
  }));

  const withoutContext = false;

  const openAIMessage = [
    {
      role: "system" as const,
      content:
        "Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format.",
    },
    {
      role: "user" as const,
      content: `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
      
\n----------------\n

PREVIOUS CONVERSATION:
${formattedPrevMessages.map((message) => {
  if (message.role === "user") return `User: ${message.content}\n`;
  return `Assistant: ${message.content}\n`;
})}

\n----------------\n
${withoutContext ? '':`CONTEXT:
${results.map((r) => r.pageContent).join("\n\n")}`}

USER INPUT: ${message}`,
    },
  ];

  console.log(openAIMessage);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0,
      stream: true,
      messages: openAIMessage,
    });
    const stream = OpenAIStream(response, {
      async onCompletion(completion) {
        console.log(completion)
        await db.insert(messages).values({
          text: completion,
          isUserMessage: false,
          fileId,
          userId: user.id,
        });
      },
    });
    return new StreamingTextResponse(stream);
    
  } catch (error) {
    console.log(error)
    return new Response("SERVER ERROR", { status: 500 });
    
  }

  
};
