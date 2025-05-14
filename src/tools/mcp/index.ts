import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { createMcpClient, callMcpTool, listMcpTools } from "./client.js"

/**
 * MCP経由で外部のサーバーにリクエストを送信し、結果を取得するツール
 */
export function addMcpTool(server: McpServer) {
  return server.tool(
    "mcp-request",
    "他のMCPサーバーにリクエストを送信し、結果を取得します",
    {
      url: z.string().url().describe("MCPサーバーのURL"),
      tool: z.string().describe("呼び出すツール名"),
      args: z
        .record(z.unknown())
        .describe("ツールに渡す引数（JSONオブジェクト）")
        .optional(),
    },
    async ({ url, tool, args = {} }) => {
      try {
        // MCPクライアントを作成し接続
        const { client, transport } = await createMcpClient(url)

        try {
          // 利用可能なツールの一覧を取得
          const tools = await listMcpTools(client)
          
          // 指定されたツールが存在するか確認
          const targetTool = tools.find((t) => t.name === tool)
          if (!targetTool) {
            return {
              content: [
                {
                  type: "text",
                  text: `エラー: ツール '${tool}' は指定されたMCPサーバーに存在しません\n利用可能なツール: ${tools.map((t) => t.name).join(", ")}`,
                },
              ],
              isError: true,
            }
          }

          // ツールを呼び出し
          const result = await callMcpTool(client, tool, args)

          // クライアントを切断
          await transport.close()

          return {
            content: result.content,
          }
        } catch (toolError) {
          // ツール呼び出しエラー
          await transport.close()
          return {
            content: [
              {
                type: "text",
                text: `エラー: ツールの呼び出しに失敗しました - ${toolError}`,
              },
            ],
            isError: true,
          }
        }
      } catch (connectionError) {
        // 接続エラー
        return {
          content: [
            {
              type: "text",
              text: `エラー: MCPサーバー接続に失敗しました - ${connectionError}`,
            },
          ],
          isError: true,
        }
      }
    }
  )
}

/**
 * 利用可能なMCPサーバーを一覧表示するツール
 */
export function addMcpListTool(server: McpServer) {
  return server.tool(
    "mcp-list",
    "サーバーに登録されているMCPサーバー一覧を表示します",
    {},
    async () => {
      // 実際の実装では登録済みのサーバーリストを返す
      // 現在はサンプルとして固定リストを返す
      const serverList = [
        {
          name: "GitHub",
          url: "http://localhost:3001/mcp",
          description: "GitHub操作用MCPサーバー",
        },
        {
          name: "SQLite",
          url: "http://localhost:3002/mcp",
          description: "SQLiteデータベース操作用MCPサーバー",
        },
      ]

      return {
        content: [
          {
            type: "text",
            text: `利用可能なMCPサーバー一覧:\n\n${serverList
              .map(
                (server) =>
                  `- ${server.name}: ${server.description}\n  URL: ${server.url}`
              )
              .join("\n\n")}`,
          },
        ],
      }
    }
  )
}

/**
 * すべてのMCPツールをサーバーに追加する
 */
export function addMcpTools(server: McpServer) {
  addMcpTool(server)
  addMcpListTool(server)
  return server
}
