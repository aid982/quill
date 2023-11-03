import React, { useContext, useRef } from "react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Send } from "lucide-react";
import ChatContext from "./ChatContext";
import { messages } from "@/db/schema";

type Props = {
  isDisabled: boolean;
};

function ChatInput({ isDisabled }: Props) {
  const { addMessage, handleInputChange, isLoading, message } =
    useContext(ChatContext);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  return (
    <div className="absolute bottom-0 w-full">
      <form className="mx-2 flex flex-row md:mx-4 md:last:mb-6 gab-3 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
        <div className="relative flex h-full flex-1 items-stretch md:flex-col p-4 flex-grow">
          <div className="relative flex flex-col w-full flex-grow p-4">
            <div className="relative">
              <Textarea
                rows={1}
                maxRows={4}
                ref={textAreaRef}
                className="resize-none pr-12 text-base py-3 scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
                autoFocus
                onChange={handleInputChange}
                value={message}
                placeholder="Enter your question ..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    addMessage();
                    textAreaRef.current?.focus();
                  }
                }}
              />
              <Button
                className="absolute bottom-1.5 right-[8px]"
                type="submit"
                onClick={() => {
                  addMessage();
                  textAreaRef.current?.focus();
                }}
                disabled={isLoading || isDisabled}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ChatInput;
