import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js"
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js"
import {
  LoggingMessageNotificationSchema,
  CallToolResultSchema,
  ListToolsRequest,
  ListToolsResultSchema,
} from "@modelcontextprotocol/sdk/types.js"

/**
 * MCPクライアントの作成と接続を行うユーティリティ関数
 * Streamable HTTPとSSEの両方の接続方法をサポートし、後方互換性を維持
 */
export async function createMcpClient(serverUrl: string) {
  console.log(`MCPサーバーに接続中: ${serverUrl}`)

  // 新しいクライアントを作成
  const client = new Client({
    name: "eureka-client",
    version: "0.1.0",
  })

  // エラーハンドラーを設定
  client.onerror = (error) => {
    console.error("クライアントエラー:", error)
  }

  // 通知ハンドラーを設定
  client.setNotificationHandler(LoggingMessageNotificationSchema, (notification) => {
    console.log(`通知: ${notification.params.level} - ${notification.params.data}`)
  })

  // 基本URLを解析
  const baseUrl = new URL(serverUrl)

  try {
    // まずStreamable HTTP接続を試みる
    console.log("Streamable HTTPトランスポートで接続を試みています...")
    const streamableTransport = new StreamableHTTPClientTransport(baseUrl)
    await client.connect(streamableTransport)
    console.log("Streamable HTTPトランスポートで接続に成功しました")
    
    return {
      client,
      transport: streamableTransport,
      transportType: "streamable-http" as const,
    }
  } catch (error) {
    // エラーが発生した場合はSSEトランスポートを試す
    console.log(`Streamable HTTPトランスポート接続に失敗: ${error}`)
    console.log("SSEトランスポートにフォールバックします...")

    try {
      // SSEトランスポートを作成
      const sseTransport = new SSEClientTransport(baseUrl)
      await client.connect(sseTransport)
      console.log("SSEトランスポートで接続に成功しました")
      
      return {
        client,
        transport: sseTransport,
        transportType: "sse" as const,
      }
    } catch (sseError) {
      console.error(
        `どちらのトランスポート方式でも接続に失敗しました:
        1. Streamable HTTPエラー: ${error}
        2. SSEエラー: ${sseError}`
      )
      throw new Error("利用可能なトランスポートでサーバーに接続できませんでした")
    }
  }
}

/**
 * MCPサーバーで利用可能なツール一覧を取得する
 */
export async function listMcpTools(client: Client) {
  try {
    const toolsRequest: ListToolsRequest = {
      method: "tools/list",
      params: {},
    }
    const toolsResult = await client.request(toolsRequest, ListToolsResultSchema)

    console.log("利用可能なツール:")
    if (toolsResult.tools.length === 0) {
      console.log("  利用可能なツールはありません")
      return []
    } else {
      for (const tool of toolsResult.tools) {
        console.log(`  - ${tool.name}: ${tool.description}`)
      }
      return toolsResult.tools
    }
  } catch (error) {
    console.log(`このサーバーはツールをサポートしていません: ${error}`)
    return []
  }
}

/**
 * MCPサーバーのツールを呼び出す
 */
export async function callMcpTool(
  client: Client,
  toolName: string,
  args: Record<string, unknown>
) {
  try {
    console.log(`ツール '${toolName}' を呼び出し中、引数:`, args)
    
    const result = await client.request(
      {
        method: "tools/call",
        params: {
          name: toolName,
          arguments: args,
        },
      },
      CallToolResultSchema
    )

    console.log("ツール実行結果:")
    result.content.forEach((item) => {
      if (item.type === "text") {
        console.log(`  ${item.text}`)
      } else {
        console.log(`  ${item.type} content:`, item)
      }
    })

    return result
  } catch (error) {
    console.error(`ツール ${toolName} の呼び出しに失敗: ${error}`)
    throw error
  }
}
