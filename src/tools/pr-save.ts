import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"

export function addPullRequestSave(server: McpServer) {
  return server.prompt(
    "pr-save",
    {
      baseRef: z
        .string()
        .describe("Pull Requestのベースブランチ（例: main または master）"),
    },
    ({ baseRef }) => ({
      description: "Pull Requestを作成または更新するためのプロンプト",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `
## pull request作成手順

### 差分の確認
- \`git diff origin/${baseRef}...HEAD | cat\` でマージ先ブランチとの差分を確認

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
git push origin HEAD
\`\`\`

- 作成する場合

    \`\`\`
    gh pr create --draft --title "{{PRタイトル}}" --body $'{{PRテンプレートを1行に変換}}' --base ${baseRef} && \
    \`\`\`
  
- 更新する場合

    \`\`\`
    gh pr edit {{PR番号}} --title "{{PRタイトル}}" --body $'{{PRテンプレートを1行に変換}}'
    \`\`\`

\`\`\`
gh pr view --web
\`\`\`

### 注意事項

PRテンプレートは .github/pull_request_template.md に記載されている内容を使用してください。
`,
          },
        },
      ],
    }),
  )
}
