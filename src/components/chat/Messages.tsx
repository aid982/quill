import { trpc } from "@/app/_trpc/client";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";
import { Loader2, MessageSquare } from "lucide-react";
import React, { useContext, useEffect, useRef } from "react";
import Message from "./Message";
import Skeleton from "react-loading-skeleton";
import { ExtendedMessage } from "@/types/messsage";
import ChatContext from "./ChatContext";
import { useIntersection } from "@mantine/hooks";

type Props = {
  fileId: string;
};

function Messages({ fileId }: Props) {
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const { isLoading: aiThinking } = useContext(ChatContext);

  const { data, isLoading, fetchNextPage } =
    trpc.getFileMessages.useInfiniteQuery(
      { fileId, limit: INFINITE_QUERY_LIMIT },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        keepPreviousData: true,
      }
    );

  const loadingMessage: ExtendedMessage = {
    fileId,
    createdAt: new Date().toISOString(),
    id: 'loading',
    isUserMessage: false,
    updateAt: "",
    userId: "",
    text: (
      <span className="flex h-full items-center justify-center">
        <Loader2 className="w-4 h-4 animate-spin" />
      </span>
    ),
  };
  const messages = data?.pages.flatMap((page) => page.data);
  const combinedMessages = [
    ...(aiThinking ? [loadingMessage] : []),
    ...(messages ?? []),
  ];

  const {ref,entry} = useIntersection({
    root:lastMessageRef.current,
    threshold:1
  });

  useEffect(()=>{
    if(entry?.isIntersecting) {
      fetchNextPage();

    }


  },[entry,fetchNextPage])
  
  return (
    <div
      className="flex max-h-[calc(100vh-3.5rem-10rem)]  md:max-h-[calc(100vh-3.5rem-8rem)] lg:max-h-[calc(100vh-3.5rem-9rem)] border-zinc-200 flex-1 flex-col-reverse
  gap-4 p-3 overflow-y-auto"
    >
      {combinedMessages && combinedMessages.length > 0 ? (
        combinedMessages.map((message, i) => {
          console.log(combinedMessages);
          const isNextMessageSamePerson =
            combinedMessages[i - 1]?.isUserMessage ===
            combinedMessages[i]?.isUserMessage;

          if (i === combinedMessages.length - 1)
            return (
          // Last message 
              <Message
                ref={ref}
                isNextMessageSamePerson={isNextMessageSamePerson}
                key={i}
                message={message}
              />
            );
          else
            return (
              <Message
                isNextMessageSamePerson={isNextMessageSamePerson}
                key={i}
                message={message}
              />
            );
        })
      ) : isLoading ? (
        <div className="w-full flex flex-col gap-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <MessageSquare className="h-8 w-8 text-blue-500" />
          <h3 className="font-semibold text-xl">All is ready</h3>
          <p>Ask your first question </p>
        </div>
      )}
    </div>
  );
}

export default Messages;
