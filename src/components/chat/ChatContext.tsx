import React, { ReactNode, createContext, useRef, useState } from "react";
import { toast, useToast } from "../ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/app/_trpc/client";
import { AI_ID_RESPONSE, INFINITE_QUERY_LIMIT } from "@/config/infinite-query";

interface StreamResponse {
  addMessage: () => void;
  message: string;
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
}

const ChatContext = createContext<StreamResponse>({
  addMessage: () => {},
  message: "",
  handleInputChange: () => {},
  isLoading: false,
});
interface Props {
  fileId: string;
  children: ReactNode;
}
export const ChatContextProvider = ({ fileId, children }: Props) => {
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {} = useToast();
  const utils = trpc.useContext();
  const addMessage = () => sendMessage({ message });

  const backupMessage = useRef('');

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value);
  };

  const { mutate: sendMessage } = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      console.log(message);
      const resp = await fetch("/api/message", {
        method: "POST",
        body: JSON.stringify({
          fileId,
          message,
        }),
      });
      console.log(resp.body)
      if (!resp.ok) {
        throw new Error("Failed to send message");
      }
      return resp.body;
    },
    onMutate:async ({message})=>{
      backupMessage.current = message;
      await utils.getFileMessages.cancel();
      setMessage('');
      const previousMessages = utils.getFileMessages.getInfiniteData();

      utils.getFileMessages.setInfiniteData({fileId,limit:INFINITE_QUERY_LIMIT},(old)=>{
        if(!old) {
          return {
            pages:[],
            pageParams:[]
          }
        }

        let newPages = [...old.pages];
        let latestPage =  newPages[0]!;

        latestPage.data = [{
          createdAt: new Date().toISOString(),
          id:'latestPage',
          text:message,
          isUserMessage:true,
          fileId,
          userId:"d",
          updateAt:new Date().toISOString(),

        },...latestPage.data];

        newPages[0] = latestPage;

        return {
          ...old,
          pages:newPages
        }
      })

      setIsLoading(true)

      return {
        previousMessages:
          previousMessages?.pages.flatMap(
            (page) => page.data
          ) ?? [],
      }
    },
    onError:(_,__,context) =>{
      setMessage(backupMessage.current);
      utils.getFileMessages.setData(
        {fileId},
        {data: context?.previousMessages ?? []}
      )
    },
    onSuccess:async (stream)=>{
      setIsLoading(false)
      if(!stream) {
        return toast({
          title:"There is some problem with sending this message",
          description:"Please refresh this page and try again",
          variant:"destructive"
        })
      }
      const reader = stream.getReader();
      const decoder = new TextDecoder();

      let  done = false;

      let accumResponse = "";

      while (!done) { 
        const {value,done:doneReading} = await reader.read();        
        done = doneReading;
        const chunkValue = decoder.decode(value);
        accumResponse += chunkValue;

        utils.getFileMessages.setInfiniteData({fileId,limit:INFINITE_QUERY_LIMIT},(old)=>{
          if(!old) {
            return ({
              pageParams:[],
              pages:[]
            })
          }
          
          let isAIResponseCreated = old.pages.some((page)=>page.data.some((message)=>message.id=== AI_ID_RESPONSE))

          let updatedPages = old.pages.map((page)=>{
            if(page === old.pages[0]) {
              let updatedMessages;
              if(!isAIResponseCreated) { 
                  updatedMessages = [{
                  createdAt: new Date().toISOString(),
                  updateAt: new Date().toISOString(),
                  id:AI_ID_RESPONSE,
                  text: accumResponse,
                  isUserMessage: false,
                  userId:"AI",
                  fileId                  
                },...page.data];
              } else { 
                updatedMessages = page.data.map((message)=>{
                  if(message.id===AI_ID_RESPONSE) {
                    return ({
                      ...message,
                      text:accumResponse
                    })
                  }
                  return message;
                })
              }
              return {
                ...page,
                data:updatedMessages

              }
            }
            return page;
          })

          return {...old, pages:updatedPages} 



        });

        
      }



    },
    onSettled: async () =>{
      setIsLoading(false);

      await utils.getFileMessages.invalidate({fileId})
    }
  });

  return (
    <ChatContext.Provider
      value={{
        message,
        addMessage,
        handleInputChange,
        isLoading,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
