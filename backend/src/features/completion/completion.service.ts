import OpenAI from "openai";
import type { ChatCompletionMessageParam, ChatCompletion } from "openai/resources/chat/completions";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CompletionService {
  private openai: OpenAI;
  private model = "gpt-4o"; // gpt-4o supports vision

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async completion(messages: ChatCompletionMessageParam[], jsonMode = false): Promise<ChatCompletion> {
    return await this.openai.chat.completions.create({
      messages,
      model: this.model,
      stream: false,
      response_format: jsonMode ? { type: "json_object" } : { type: "text" }
    }) as ChatCompletion;
  }
}
