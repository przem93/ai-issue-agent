import OpenAI from "openai";
import type { ChatCompletionMessageParam, ChatCompletion } from "openai/resources/chat/completions";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CompletionService {
  private openai: OpenAI;
  private jsonMode = false;
  private model = "gpt-4";

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async completion(messages: ChatCompletionMessageParam[]): Promise<ChatCompletion> {
    return await this.openai.chat.completions.create({
      messages,
      model: this.model,
      stream: false,
      response_format: this.jsonMode ? { type: "json_object" } : { type: "text" }
    }) as ChatCompletion;
  }
}
