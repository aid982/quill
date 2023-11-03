import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { ExpandIcon, Loader2 } from "lucide-react";
import SimpleBar from "simplebar-react";
import { Document, Page } from "react-pdf";
import { useToast } from "./ui/use-toast";
import { useResizeDetector } from "react-resize-detector";

type Props = {
    url:string
};

function PdfFullScreen({url}: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { toast } = useToast();
  const [numPages, setNumPages] = useState<number>();
  const { ref, width } = useResizeDetector();
  

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
        <Button airia-aria-label="Full screen" variant={"ghost"} onClick={()=>{
            setIsOpen(true)
        }}>
          <ExpandIcon className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl w-full">
        <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)]">
          <div ref={ref}>
            <Document
              file={url}
              loading={
                <div className="flex justify-center">
                  <Loader2 className="my-24 h-6 w-6 animate-spin" />
                </div>
              }
              className="max-h-full"
              onLoadSuccess={({ numPages }) => {
                setNumPages(numPages);
              }}
              onError={() => {
                toast({
                  title: "Error loading PDF",
                  description: "Try again later",
                  variant: "destructive",
                });
              }}
            >
              {new Array(numPages).fill(0).map((_,ind)=>(<Page
                width={width ? width : 1}
                key={ind}
                pageNumber={ind+1}                                
              />))}
            </Document>
          </div>
        </SimpleBar>
      </DialogContent>
    </Dialog>
  );
}

export default PdfFullScreen;
