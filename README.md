# pi-io-provider

A [pi](https://github.com/badlogic/pi-mono) extension that adds [IO Intelligence](https://io.net) as a custom model provider.

## Features

- **OpenAI-compatible API** — Uses IO Intelligence's `/api/v1/chat/completions` endpoint
- **23+ AI models** — DeepSeek, Kimi, GLM, Llama, Qwen, Mistral, and more
- **Reasoning models** — DeepSeek R1, Kimi K2 Thinking with extended reasoning
- **Vision models** — Kimi K2.5/K2.6, Llama 4 Maverick, Llama 3.2 Vision, Qwen2.5 VL, Mistral Large
- **Prompt caching** — Cache read/write support on most models
- **Confidential inference** — Verifiable TEE inference with attestation (via /private/ endpoints)
- **Streaming** — Real-time token streaming

## Available Models

| Model | ID | Context | Max Output | Vision | Reasoning | Cache | Input $/M | Output $/M |
|-------|----|---------|------------|--------|-----------|-------|-----------|------------|
| DeepSeek R1 0528 | `deepseek-ai/DeepSeek-R1-0528` | 128K | 128K | ❌ | ✅ | ✅ | $0.56 | $2.25 |
| Kimi K2 Thinking | `moonshotai/Kimi-K2-Thinking` | 262K | 262K | ❌ | ✅ | ✅ | $0.60 | $2.50 |
| Llama 3.2 90B Vision Instruct | `meta-llama/Llama-3.2-90B-Vision-Instruct` | 16K | 16K | ✅ | ❌ | ✅ | $0.34 | $0.34 |
| Llama 4 Maverick 17B 128E Instruct FP8 | `meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8` | 430K | 430K | ✅ | ❌ | ✅ | $0.27 | $0.89 |
| Kimi K2.5 | `moonshotai/Kimi-K2.5` | 262K | 262K | ✅ | ❌ | ✅ | $0.49 | $2.63 |
| Kimi K2.6 | `moonshotai/Kimi-K2.6` | 262K | 262K | ✅ | ❌ | ✅ | $0.90 | $3.86 |
| DeepSeek V3.2 | `deepseek-ai/DeepSeek-V3.2` | 164K | 164K | ❌ | ❌ | ✅ | $0.95 | $1.88 |
| DeepSeek V4 Flash | `deepseek-ai/DeepSeek-V4-Flash` | 1.0M | 1.0M | ❌ | ❌ | ✅ | $0.13 | $0.26 |
| DeepSeek V4 Pro | `deepseek-ai/DeepSeek-V4-Pro` | 1.0M | 600K | ❌ | ❌ | ✅ | $1.45 | $2.88 |
| Gemma 4 26B A4B | `google/gemma-4-26b-a4b-it` | 262K | 262K | ❌ | ❌ | ✅ | $0.13 | $0.42 |
| Qwen3 Coder 480B A35B Instruct INT4 Mixed AR | `Intel/Qwen3-Coder-480B-A35B-Instruct-int4-mixed-ar` | 106K | 106K | ❌ | ❌ | ✅ | $0.56 | $2.54 |
| Llama 3.3 70B Instruct | `meta-llama/Llama-3.3-70B-Instruct` | 128K | 128K | ❌ | ❌ | ✅ | $0.55 | $1.07 |
| MiniMax M2.5 | `MiniMaxAI/MiniMax-M2.5` | 197K | 197K | ❌ | ❌ | ✅ | $0.23 | $1.07 |
| MiniMax M2.7 | `MiniMaxAI/MiniMax-M2.7` | 205K | 205K | ❌ | ❌ | ✅ | $0.84 | $2.62 |
| Mistral Nemo Instruct 2407 | `mistralai/Mistral-Nemo-Instruct-2407` | 128K | 128K | ❌ | ❌ | ✅ | $0.06 | $0.10 |
| Kimi K2 Instruct 0905 | `moonshotai/Kimi-K2-Instruct-0905` | 262K | 262K | ❌ | ❌ | ✅ | $0.57 | $2.30 |
| Kimi K2.7 Code | `moonshotai/Kimi-K2.7-Code` | 262K | 262K | ❌ | ❌ | ✅ | $1.06 | $4.60 |
| gpt-oss-120b | `openai/gpt-oss-120b` | 131K | 131K | ❌ | ❌ | ✅ | $0.17 | $0.56 |
| gpt-oss-20b | `openai/gpt-oss-20b` | 64K | 64K | ❌ | ❌ | ✅ | $0.06 | $0.21 |
| Qwen3 Next 80B A3B Instruct | `Qwen/Qwen3-Next-80B-A3B-Instruct` | 262K | 262K | ❌ | ❌ | ✅ | $0.13 | $1.28 |
| Qwen3.6 27B | `Qwen/Qwen3.6-27B` | 262K | 262K | ❌ | ❌ | ✅ | $0.40 | $3.03 |
| Qwen3.6 35B A3B | `Qwen/Qwen3.6-35B-A3B` | 262K | 262K | ❌ | ❌ | ✅ | $0.16 | $1.14 |
| GLM-4.5-Air | `zai-org/GLM-4.5-Air` | 131K | 131K | ❌ | ❌ | ✅ | $0.16 | $0.94 |
| GLM 4.6 | `zai-org/GLM-4.6` | 131K | 131K | ❌ | ❌ | ✅ | $0.85 | $2.75 |
| GLM 4.7 | `zai-org/GLM-4.7` | 203K | 203K | ❌ | ❌ | ✅ | $0.88 | $2.24 |
| GLM 4.7 Flash | `zai-org/GLM-4.7-Flash` | 200K | 200K | ❌ | ❌ | ✅ | $0.08 | $0.42 |
| GLM 5 | `zai-org/GLM-5` | 203K | 203K | ❌ | ❌ | ✅ | $0.81 | $2.62 |
| GLM 5.1 | `zai-org/GLM-5.1` | 203K | 33K | ❌ | ❌ | ✅ | $1.30 | $4.14 |
| GLM 5.2 | `zai-org/GLM-5.2` | 262K | 131K | ❌ | ❌ | ✅ | $1.78 | $5.91 |

*Costs are per million tokens. Cache read/write pricing available on most models.*

## Installation

### Option 1: Using `pi install` (Recommended)

Install directly from GitHub:

```bash
pi install git:github.com/monotykamary/pi-io-provider
```

Then set your API key and run pi:
```bash
# Recommended: add to auth.json
# See Authentication section below

# Or set as environment variable
export IOINTELLIGENCE_API_KEY=your-api-key-here

pi
```

Get your API key from [io.net](https://io.net).

### Option 2: Manual Clone

1. Clone this repository:
   ```bash
   git clone https://github.com/monotykamary/pi-io-provider.git
   cd pi-io-provider
   ```

2. Set your IO Intelligence API key:
   ```bash
   # Recommended: add to auth.json
   # See Authentication section below

   # Or set as environment variable
   export IOINTELLIGENCE_API_KEY=your-api-key-here
   ```

3. Run pi with the extension:
   ```bash
   pi -e /path/to/pi-io-provider
   ```

## Authentication

The IO Intelligence API key can be configured in multiple ways (resolved in this order):

1. **`auth.json`** (recommended) — Add to `~/.pi/agent/auth.json`:
   ```json
   { "io-intelligence": { "type": "api_key", "key": "your-api-key" } }
   ```
   The `key` field supports literal values, env var names, and shell commands (prefix with `!`). See [pi's auth file docs](https://github.com/badlogic/pi-mono) for details.
2. **Runtime override** — Use the `--api-key` CLI flag
3. **Environment variable** — Set `IOINTELLIGENCE_API_KEY`

Get your API key from [io.net](https://io.net).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `IOINTELLIGENCE_API_KEY` | No | Your IO Intelligence API key (fallback if not in auth.json) |

## Configuration

Add to your pi configuration for automatic loading:

```json
{
  "extensions": [
    "/path/to/pi-io-provider"
  ]
}
```

## Usage

Once loaded, select a model with:

```
/model io-intelligence deepseek-ai/DeepSeek-R1-0528
```

Or use `/models` to browse all available IO Intelligence models.

## API Documentation

- IO Intelligence Docs: https://io.net/docs/guides/confidential-inference/quick-start
- OpenAI-compatible endpoint: `https://api.intelligence.io.solutions/api/v1`
- Models endpoint: `https://api.intelligence.io.solutions/api/v1/models`
- Confidential inference: `https://api.intelligence.io.solutions/api/v1/private/completions`

## License

MIT
