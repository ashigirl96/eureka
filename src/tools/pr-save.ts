import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"

export function addPullRequestSave(server: McpServer) {
  return server.prompt(
    "pr-save",
    {
      baseRef: z
        .string()
        .describe("Pull Requestのベースブランチ（例: main または master）"),
    },
    ({ baseRef }) => {
      return {
        description: "Pull Requestを作成または更新してください",
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `以下の手順に従ってPull Requestを作成または更新してください。

0. <if コミットしていないものがある>
    <command>git add . && git commit -m "{{コミット文}}"</command> # 変更をコミット
   </if コミットしていないものがある>
1. <command>cat .github/pull_request_template.md</command> # Pull Requestテンプレートを確認
2. <command>git diff origin/${baseRef}...HEAD | cat</command> # IMPORTANT: 必ずこのコマンドを実行してマージ先ブランチとの差分を確認しなさい
3. <command>git push origin HEAD</command> # 変更をリモートにプッシュ
4. <if pull requestがまだ作成されてない>
    <command>gh pr create --draft --title "{{PRタイトル}}" --body $'{{PRテンプレートを1行に変換}}' --base ${baseRef}</command> # IMPORTANT: 必ずこのコマンドを実行してPull Requestを作成しなさい
   </if pull requestがまだ作成されてない>
    <if pull requestが作成されている>
    <command>gh pr edit {{PR番号}} --title "{{PRタイトル}}" --body $'{{PRテンプレートを1行に変換}}'</command> # Pull Requestを更新
   </if pull requestが作成されている>
5. <command>gh pr view --web</command> # Pull RequestをWebブラウザで表示
    `,
            },
          },
        ],
      }
    },
  )
}
