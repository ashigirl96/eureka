#!/usr/bin/env node
import { completable } from "@modelcontextprotocol/sdk/server/completable.js"
import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js"

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { z } from "zod"
import { addPullRequestSave } from "./tools/pr-save.js"

// Create an MCP server
const server = new McpServer(
  {
    name: "Eureka",
    version: "0.1.0",
    description: "開発を効率化するためのツール群",
  },
  {
    capabilities: {
      tools: {},
      prompts: {},
      completions: {},
      resources: {
        subscribe: true,
        listChanged: true,
      },
    },
    instructions: "eurekaは開発を効率化するためのツール群です。",
  },
)

addPullRequestSave(server)

// // Simple tool with parameters
// server.tool(
//   "calculate-bmi",
//   {
//     weightKg: z.number(),
//     heightM: z.number(),
//   },
//   async (
//     { weightKg, heightM },
//     {
//       sendNotification,
//       _meta,
//       authInfo,
//       sendRequest,
//       requestId,
//       sessionId,
//       signal,
//     },
//   ) => ({
//     content: [
//       {
//         type: "text",
//         text: String(weightKg / (heightM * heightM)),
//       },
//     ],
//   }),
// )
//
// server.resource(
//   "user-profile",
//   new ResourceTemplate("users://{userId}/profile", { list: undefined }),
//   async (uri, { userId }) => ({
//     contents: [
//       {
//         uri: uri.href,
//         text: `Profile data for user ${userId}`,
//       },
//     ],
//   }),
// )

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport()
await server.connect(transport)
