import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create an MCP server
const server = new McpServer({
  name: "Eureka",
  version: "0.1.0",
  description: "開発を効率化するためのツール群"
});

// PR作成用のプロンプト
server.prompt(
  "pr-create",
  { 
    baseRef: z.string().describe("Pull Requestのベースブランチ（例: main または master）")
  },
  ({ baseRef }) => ({
    description: "Pull Requestを作成するためのプロンプト",
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `現在のブランチから ${baseRef} ブランチに向けてPull Requestを作成したいと思います。

現在の作業の背景や目的・変更内容などを踏まえて、適切なPull Requestのタイトルと説明文を考えてください。説明文は以下の項目に沿って記述されるようにしてください：

1. **タイトル**: 明確で簡潔なPRのタイトル
2. **概要**: 変更の目的と概要
3. **変更内容**: 具体的な変更点の箇条書き
4. **テスト方法**: 変更をテストするための手順
5. **関連Issue**: 関連するIssue番号（ある場合）

以下のフォーマットに沿って回答してください：

## タイトル
[ここにPRのタイトルを記入]

## 説明
### 概要
[ここにPR内容の簡潔な説明を記入]

### 変更内容
- [変更点1]
- [変更点2]
- [変更点3（必要に応じて追加）]

### テスト方法
[ここに変更の動作確認方法を記入]

### 関連Issue
[ここに関連するIssue番号を記入（例: #123）または「なし」]

この内容を元にPRのタイトルと説明文を作成します。現在のコードベースの状況や作業内容に基づいて、できるだけ具体的に記述してください。`
      }
    }]
  })
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
