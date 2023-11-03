"use client";
import React, { useState } from "react";
import UploadButton from "./UploadButton";
import { trpc } from "@/app/_trpc/client";
import { GhostIcon, Loader2, MessageSquare, Plus, Trash, TrashIcon } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "./ui/button";

type Props = {};

function DashBoard({}: Props) {
  const [curDelFile,setCurDelFile] = useState<number|null>(null);
  const utils = trpc.useContext();  
  const { data: files, isLoading } = trpc.getUserFiles.useQuery();
  const { mutate: deleteFile,isLoading:deleteIs } = trpc.deleteFile.useMutation({
    onSuccess: ()=>{
        utils.getUserFiles.invalidate();
    },
    onMutate:({id})=>{
        setCurDelFile(id);

    },
    onSettled:(        
    )=>{
        setCurDelFile(null)
    } 

  });

  return (
    <main className="mx-auto max-w-7xl md:p-10">
      <div className="mt-8  flex flex-col items-center justify-between border-b border-gray-200 pb-5 sm:flex-row gap-4 sm:gap-1">
        <h1 className="mb-3 text-3xl">My Files</h1>
        <UploadButton />
      </div>
      {files && files.length !== 0 ? (
        <ul className="mt-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2 lg:grid-cols-3">
          {files
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((file) => (
              <li
                key={file.id}
                className="col-span-1 divide-y divide-gray-200 rounded-md bg-white 
                shadow transition hover:shadow-lg"
              >
                <Link
                  href={`/dashboard/${file.id}`}
                  className="flex flex-col gap-2"
                >
                  <div className="pt-6 px-6 flex w-full items-center justify-between space-x-6">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"></div>
                    <div className="flex-1 truncate">
                      <div className="flex items-center space-x-3">
                        <h3 className="truncate text-lg font-medium text-zinc-900">
                          {file.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                </Link>
                <div className="px-6 mt-4 grid grid-cols-3 place-items-center py-2 gap-6 text-xs  text-zinc-500">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    {format(new Date(file.createdAt), "dd MMM yyy")}
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    mocked
                  </div>
                  <Button
                    size={"sm"}
                    className="w-full"
                    variant={"destructive"}
                    onClick={() => {
                      deleteFile({ id: file.id });
                    }}
                  >
                    {curDelFile===file.id ? <Loader2 size='sm' className=" h-4 w-4 animate-spin" />:<Trash className="h-4 w-4" />}
                  </Button>
                </div>
              </li>
            ))}
        </ul>
      ) : isLoading ? (
        <Skeleton height={100} className="my-2" count={3}></Skeleton>
      ) : (
        <div className="mt-16 flex flex-col items-center gap-2">
          <GhostIcon className="h-8 w-8 text-zinc-800" />
          <h3 className="font-semibold text-xl">There is nothing here yet</h3>
          <p>Let&apos;s upload your first PDF</p>
        </div>
      )}
    </main>
  );
}

export default DashBoard;
