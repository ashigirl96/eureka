#!/usr/bin/env node
import { z } from "zod";
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Create an MCP server
const server = new McpServer({
  name: "Eureka",
  version: "0.1.0",
  description: "開発を効率化するためのツール群"
}, {
  capabilities: {
    tools: {},
    prompts: {},
  },
  instructions: "eurekaは開発を効率化するためのツール群です。"
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
        text: `
## pull request作成手順

### 必須前提条件
- Issue番号の確認
  - Issueのリンクが提供されていない場合は、必ずユーザーに「関連するIssueのリンクはありますか？」と確認する
  - Issueが存在しない場合は、その旨をPRの説明に明記する

### 差分の確認
- \`git diff origin/{{マージ先ブランチ}}...HEAD | cat\` でマージ先ブランチとの差分を確認
- IMPORTANCE: マージ先ブランチは ${baseRef}

### descriptionに記載するリンクの準備
- Issueのリンクを確認（必須前提条件で確認済みであること）

### Pull Request 作成とブラウザでの表示
- 以下のコマンドでpull requestを作成し、自動的にブラウザで開く
- PRタイトルおよびPRテンプレートはマージ先との差分をもとに適切な内容にする
- 指示がない限りDraftでpull requestを作成
- \`{{PRテンプレートを1行に変換}}\`の部分はPRテンプレートの内容を\`\n\`で改行表現した1行の文字列
- \`$'...'\`構文を使用することで\`{{PRテンプレートを1行に変換}}\`の改行文字を正しく解釈させ、各セクションが適切な見出しレベルになるようにする
- 各セクションを明確に区分
- 必要な情報を漏れなく記載

\`\`\`bash
git push origin HEAD && \
gh pr create --draft --title "{{PRタイトル}}" --body $'{{PRテンプレートを1行に変換}}' && \
gh pr view --web
\`\`\`

PRテンプレートは .github/pull_request_template.md に記載されている内容を使用してください。
`
      }
    }]
  })
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
