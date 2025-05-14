# MCP機能

Model Context Protocol (MCP) を使用して他のMCPサーバーと通信するための機能です。

## 機能一覧

### mcp-request

他のMCPサーバーにリクエストを送信し、結果を取得します。

**使用例**:
```
mcp-request --url "http://localhost:3001/mcp" --tool "get-weather" --args '{"city": "Tokyo"}'
```

**パラメータ**:
- `url` (必須): 接続先のMCPサーバーURL
- `tool` (必須): 呼び出すツール名
- `args` (オプション): ツールに渡す引数 (JSONオブジェクト)

### mcp-list

サーバーに登録されているMCPサーバー一覧を表示します。

**使用例**:
```
mcp-list
```

## 接続の仕組み

このツールは以下の2つのトランスポート方式をサポートし、後方互換性を維持しています：

1. **Streamable HTTP** (プロトコルバージョン 2025-03-26): 最新のトランスポート方式
2. **HTTP+SSE** (プロトコルバージョン 2024-11-05): 従来のトランスポート方式

接続時は自動的に先にStreamable HTTPを試み、失敗した場合はSSEトランスポートにフォールバックします。
