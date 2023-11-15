import {z} from "zod";
export const SendMessageValidator = z.object({
    fileId:z.string(),
    userId:z.string(),
    message:z.string(),
})