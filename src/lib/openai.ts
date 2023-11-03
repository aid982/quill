import OpenAI from "OpenAI"
export const openai = new OpenAI({
    apiKey:process.env.OPEN_AI
})