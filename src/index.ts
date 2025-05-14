#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
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

server
  // PR作成用のプロンプト
  .addPullRequestSave(server)

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport()
await server.connect(transport)
