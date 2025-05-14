import type { GetPromptResultSchema } from "@modelcontextprotocol/sdk/types.js"
import type { z } from "zod"

export type UserMessage = z.input<
  typeof GetPromptResultSchema
>["messages"][number]
export function userPromptMessage(content: string): UserMessage {
  return {
    role: "user",
    content: {
      type: "text",
      text: content,
    },
  }
}
