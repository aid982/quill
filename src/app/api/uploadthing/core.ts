import { files } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { pinecone } from "@/lib/pinecone";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { PineconeStore } from 'langchain/vectorstores/pinecone'

import { OpenAIEmbeddings } from 'langchain/embeddings/openai'



import { createUploadthing, type FileRouter } from "uploadthing/next";
import { eq } from "drizzle-orm";

const f = createUploadthing();

//const auth = (req: Request) => ({ id: "fakeId" }); // Fake auth function

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  pdfUploader: f({ pdf: { maxFileSize: "4MB" } })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      const session = await auth();
      console.log(session);

      // If you throw, the user will not be able to upload
      if (!session || !session.user) throw new Error("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      const createdFile = await db.insert(files).values({
        userId: metadata.userId,
        key: file.key,
        name: file.name,
        url: file.url,
        uploadStatus: "PROCESSING",
      }).returning();

      try {
        const resp = await fetch(file.url);
        console.log(resp)
        const blob = await resp.blob();

        const loader = new PDFLoader(
          blob
        );

        console.log('load',loader)

        const docs = await loader.load();

        console.log('doc',docs)
        const pagesAmt = docs.length;
        // Vectorize
        //const pinecone = await getPineconeClient()
        console.log(pinecone)
//        const pineConeIndex = pinecone.Index("quill");
        const pineconeIndex = pinecone.Index('quill');
        console.log(pineconeIndex)

        const embaddings = new OpenAIEmbeddings({
          openAIApiKey:process.env.OPEN_AI
        })
        console.log(embaddings)
        console.log(String(createdFile[0].id));
        await PineconeStore.fromDocuments(docs,embaddings,{                   
          pineconeIndex          
        })        
        
        const data = await db.update(files).set({uploadStatus:'SUCCESS'}).where(eq(files.id,createdFile[0].id)).returning()
        console.log(data);
        //  const loader = new PDF
      } catch (error) {
        console.log(error)
        await db.update(files).set({uploadStatus:'FAILED'}).where(eq(files.id,createdFile[0].id)).returning()
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
