import PdfRenderer from "@/components/PdfRenderer";
import Chatwrapper from "@/components/chat/Chatwrapper";
import { files } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import React from "react";

type Props = {
  params: {
    fileId: string;
  };
};

async function page({ params }: Props) {
  const { fileId } = params;
  const session = await auth();
  if (!session) redirect(`/api/auth/signin?origin=dashboard/${fileId}`);
  const {user} = session;

  const curFile = await db
    .select()
    .from(files)
    .where(eq(files.id, String(fileId)));
  if (curFile.length === 0) notFound();
  const file = curFile[0];
  return (
    <div className='flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]'>
      <div className='mx-auto w-full max-w-8xl grow lg:flex xl:px-2'>
        {/* Left sidebar & main wrapper */}
        <div className='flex-1 xl:flex'>
          <div className='px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6'>
            {/* Main area */}
            <PdfRenderer url={file.url!} />
          </div>
        </div>

        <div className='shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0'>
          <Chatwrapper userId={user.id} fileId={file.id} />
        </div>
      </div>
    </div>
  );
}

export default page;
