"use client";
import {
  ChevronDown,
  ChevronUp,
  Divide,
  Loader2,
  RotateCw,
  SearchIcon,
} from "lucide-react";
import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useToast } from "./ui/use-toast";
import { useResizeDetector } from "react-resize-detector";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import SimpleBar from "simplebar-react";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import PdfFullScreen from "./PdfFullScreen";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

type Props = {
  url: string;
};

function PdfRenderer({ url }: Props) {
  const { toast } = useToast();
  const [numPages, setNumPages] = useState<number>();
  const [curPages, setCurPages] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [renderedScale, setRenderedScale] = useState<number|null>(null);
  const { ref, width } = useResizeDetector();
  const [rotation, setRotation] = useState<number>(0);

  const isLoading = renderedScale!==scale;
  
  const PageValidation = z.object({
    page: z
      .string()
      .refine((num) => Number(num) > 0 && Number(num) <= numPages!),
  });
  type TCustomPageValidator = z.infer<typeof PageValidation>;
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<TCustomPageValidator>({
    defaultValues: {
      page: "1",
    },
    resolver: zodResolver(PageValidation),
  });
  const handlePageSubmit = ({ page }: TCustomPageValidator) => {
    setCurPages(Number(page));
    setValue("page", page);
  };
  return (
    <div className="w-full bg-white rounded-md flex flex-col items-center">
      <div className="h-14 w-full border-b border-zinc-200 flex justify-between items-center">
        {/*TOP BAR*/}
        <div className="flex items-center gap-1.5">
          <Button
            aria-label="previus page"
            variant={"ghost"}
            onClick={() => {
              setCurPages((prev) => (prev - 1 > 1 ? prev - 1 : 1));
              setValue("page",String(curPages - 1 > 1 ? curPages - 1 : 1))
            }
            
          }
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-1.5 ">
            <Input
              {...register("page")}
              className={cn(
                "w-12 h-8",
                errors.page && "focus-visible:ring-red-500"
              )}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit(handlePageSubmit)();
                }
              }}
            />
            <p className="text-zinc-700 text-sm space-x-1">
              <span>/</span>
              <span>{numPages ?? "x"}</span>
            </p>
          </div>
          <Button
            aria-label="next page"
            variant={"ghost"}
            disabled={numPages === undefined || curPages === numPages}
            onClick={() => {
              setCurPages((prev) =>
                prev + 1 > numPages! ? numPages! : prev + 1
              );
              setValue("page",String(curPages + 1))
            }}
          >
            <ChevronUp className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-5" variant={"ghost"} aria-label="zoom">
                <SearchIcon className="w-4 h-4" />
                {scale * 100}%<ChevronDown className="w-3 h-3 opacity-40" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onSelect={() => {
                  setScale(1);
                }}
              >
                100%
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  setScale(1.5);
                }}
              >
                150%
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  setScale(2);
                }}
              >
                200%
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button aria-label="Rotate 90%" variant={"ghost"} onClick={()=>{
            setRotation((prev)=>prev+90)
          }}>
            <RotateCw className="w-4 h-4"/>
          </Button>
          <PdfFullScreen url={url}/>
          
        </div>
      </div>
      <div className="flex-1 w-full max-h-screen">
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
              {isLoading&&renderedScale ? <Page
                width={width ? width : 1}
                pageNumber={curPages}
                scale={scale}
                rotate={rotation}
                key={"$"+renderedScale}
              /> : null}
              <Page className={cn(isLoading ? "hidden":"")}
                width={width ? width : 1}
                pageNumber={curPages}
                scale={scale}
                rotate={rotation}
                key={"@"+scale}
                loading={
                  <div className="flex justify-center"><Loader2 className="mt-24 h-6 w-6 animate-spin"/></div>
                }
                onRenderSuccess={()=>setRenderedScale(scale)}
              />
            </Document>
          </div>
        </SimpleBar>
      </div>
    </div>
  );
}

export default PdfRenderer;
