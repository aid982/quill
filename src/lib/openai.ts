//import OpenAI from "OpenAI"
const { OpenAI } = require("OpenAI");
export const openai = new OpenAI({
    apiKey:process.env.OPEN_AI
})