"use client";
import React, { useState } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { Button } from "./ui/button";

import Dropzone from "react-dropzone";
import { Cloud, File, Loader2 } from "lucide-react";
import { Progress } from "./ui/progress";
import { resolve } from "path";
import { useUploadThing } from "@/lib/uploadthing";
import { useToast } from "./ui/use-toast";
import { trpc } from "@/app/_trpc/client";
import { useRouter } from "next/navigation";

type Props = {};

const UploadDropZone = () => {
  const router = useRouter();
  const [isUploading,setIsUploading] = useState<boolean>(true);
  const [uploadProgress,setUploadProgress] = useState<number>(0);
  const {startUpload} = useUploadThing("pdfUploader");
  const {toast} = useToast();
  const {mutate:startPolling} = trpc.getFile.useMutation({
    onSuccess: (file)=>{
      router.push(`/dashboard/${file.id}`)

    },
    retry:true,
    retryDelay:500
  });

  const startSimProgress = ()=>{
    setUploadProgress(0);
    const interval = setInterval(()=>{
      setUploadProgress((prevValue)=>{
        if(prevValue>=95) {
          clearInterval(interval);
          return prevValue;
        }
        return prevValue + 5;

      })     

    },500)

    return interval;

  }

  return (
    <Dropzone
      multiple={false}
      onDrop={async (acceptedFile) => {        
        setIsUploading(true);
        const progressInterval = startSimProgress();

        // Handle upload file
        const res = await startUpload(acceptedFile)
        //await new Promise((resolve1)=>setTimeout(resolve1,15000));
        if(!res) {
          return toast({
            title:"Something went wrong",
            description:"pls try later",
            variant:"destructive"
          })

        }
        const [fileResp] = res; 
        const key = fileResp.key;    
        if(!key) {
          return toast({
            title:"Something went wrong",
            description:"pls try later",
            variant:"destructive"
          })
        }
        clearInterval(progressInterval);
        setUploadProgress(100);
        startPolling({key});

      }}
    >
      {({ getRootProps, getInputProps, acceptedFiles }) => (
        <div
          {...getRootProps()}
          className="border h-64 m-4 border-dashed border-gray-300 rounded-lg"
        >
          <div className="flex items-center justify-center h-full w-full">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center
            h-full w-full rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-5">
                <Cloud className="w-6 h-6 " />
                <p className="mb-2 text-sm text-zinc-700">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-zinc-400">PDF (up to 4mb)</p>
              </div>
              {acceptedFiles && acceptedFiles[0] ? (
                <div className="max-w-xs bg-white flex items-center rounded-md overflow-hidden outline outline-[1px] outline-zinc-200 divide-x divide-zinc-200">
                  <div className="p-x py-2 h-full grid place-items-center">
                    <File className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="px-3 py-2 h-full text-sm truncate">
                    {acceptedFiles[0].name}
                  </div>
                </div>
              ) : null}
              {isUploading ? (<div className="w-full mt-4 max-w-xs mx-auto">
                <Progress value={uploadProgress} className="h-1 w-full bg-zinc-200"
                indicatorColor={uploadProgress === 100 ? 'bg-green-600':''}/>                

              </div>):null}
              {uploadProgress=== 100 ? (<div className="mt-2 flex gap-1 justify-center text-sm items-center text-zinc-700"><Loader2 className="animate-spin h3- w-3"/>Redirecting...</div>):null}
              <input {...getInputProps} type="file" id='dropzone-file' className="hidden"/>
            </label>
          </div>
        </div>
      )}
    </Dropzone>
  );
};

function UploadButton({}: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) {
          setIsOpen(v);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          onClick={() => {
            setIsOpen(true);
          }}
        >
          Upload PDF
        </Button>
      </DialogTrigger>
      <DialogContent>
        <UploadDropZone />
      </DialogContent>
    </Dialog>
  );
}

export default UploadButton;
