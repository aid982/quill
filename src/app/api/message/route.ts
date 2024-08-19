import { files, messages } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { openai } from "@/lib/openai";
import { pinecone } from "@/lib/pinecone";
import { SendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { and, eq, sql } from "drizzle-orm";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { NextRequest } from "next/server";
import { OpenAIStream, StreamingTextResponse, GoogleGenerativeAIStream } from "ai";


import { GoogleGenerativeAI } from "@google/generative-ai";
import { tr } from "date-fns/locale";

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

  } catch (error) {
    console.log(error);
    return new Response("SERVER ERROR", { status: 500 });
  }
  try {

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY!);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


    const response = await model.generateContentStream(message);

    const stream = GoogleGenerativeAIStream(response, {
      async onCompletion(completion) {
        console.log('Complition',completion)
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
