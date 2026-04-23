# pi-io-provider

A [pi](https://github.com/badlogic/pi-mono) extension that adds [IO Intelligence](https://io.net) as a custom model provider.

[![Update Models](https://github.com/monotykamary/pi-io-provider/actions/workflows/update-models.yml/badge.svg)](https://github.com/monotykamary/pi-io-provider/actions/workflows/update-models.yml)

## Features

- **OpenAI-compatible API** — Uses IO Intelligence's `/api/v1/chat/completions` endpoint
- **23 AI models** — DeepSeek, Kimi, GLM, Llama, Qwen, Mistral, and more
- **Reasoning models** — DeepSeek R1, Kimi K2 Thinking with extended reasoning
- **Vision models** — Kimi K2.5/K2.6, Llama 4 Maverick, Llama 3.2 Vision, Qwen2.5 VL, Mistral Large
- **Prompt caching** — Cache read/write support on most models
- **Confidential inference** — Verifiable TEE inference with attestation (via `/private/` endpoints)
- **Streaming** — Real-time token streaming
- **Auto-updated** — Daily CI job keeps model list and pricing current

## Available Models

| Model | ID | Context | Max Output | Vision | Reasoning | Cache | Input $/M | Output $/M |
|-------|----|---------|------------|--------|-----------|-------|-----------|------------|
| DeepSeek R1 0528 | `deepseek-ai/DeepSeek-R1-0528` | 128K | 128K | ❌ | ✅ | ✅ | $0.40 | $1.75 |
| Kimi K2 Thinking | `moonshotai/Kimi-K2-Thinking` | 262K | 262K | ❌ | ✅ | ✅ | $0.32 | $0.48 |
| Llama 3.2 90B Vision Instruct | `meta-llama/Llama-3.2-90B-Vision-Instruct` | 16K | 16K | ✅ | ❌ | ✅ | $0.35 | $0.40 |
| Llama 4 Maverick 17B 128E Instruct FP8 | `meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8` | 430K | 430K | ✅ | ❌ | ✅ | $0.15 | $0.60 |
| Mistral Large Instruct 2411 | `mistralai/Mistral-Large-Instruct-2411` | 128K | 128K | ✅ | ❌ | ✅ | $2.00 | $6.00 |
| Kimi K2.5 | `moonshotai/Kimi-K2.5` | 262K | 262K | ✅ | ❌ | ✅ | $0.44 | $2.00 |
| Kimi K2.6 | `moonshotai/Kimi-K2.6` | 262K | 262K | ✅ | ❌ | ✅ | $0.80 | $4.00 |
| Qwen2.5 VL 32B Instruct | `Qwen/Qwen2.5-VL-32B-Instruct` | 32K | 32K | ✅ | ❌ | ✅ | $0.05 | $0.22 |
| DeepSeek V3.2 | `deepseek-ai/DeepSeek-V3.2` | 164K | 164K | ❌ | ❌ | ✅ | $0.25 | $0.38 |
| Gemma 4 26B A4B | `google/gemma-4-26b-a4b-it` | 262K | 262K | ❌ | ❌ | ✅ | $0.14 | $0.50 |
| Qwen3 Coder 480B A35B Instruct INT4 Mixed AR | `Intel/Qwen3-Coder-480B-A35B-Instruct-int4-mixed-ar` | 106K | 106K | ❌ | ❌ | ✅ | $0.22 | $0.95 |
| Llama 3.3 70B Instruct | `meta-llama/Llama-3.3-70B-Instruct` | 128K | 128K | ❌ | ❌ | ✅ | $0.10 | $0.32 |
| MiniMax M2.5 | `MiniMaxAI/MiniMax-M2.5` | 197K | 197K | ❌ | ❌ | ✅ | $0.12 | $0.99 |
| Mistral Nemo Instruct 2407 | `mistralai/Mistral-Nemo-Instruct-2407` | 128K | 128K | ❌ | ❌ | ✅ | $0.02 | $0.04 |
| Kimi K2 Instruct 0905 | `moonshotai/Kimi-K2-Instruct-0905` | 262K | 262K | ❌ | ❌ | ✅ | $0.39 | $1.90 |
| gpt-oss-120b | `openai/gpt-oss-120b` | 131K | 131K | ❌ | ❌ | ✅ | $0.10 | $0.40 |
| gpt-oss-20b | `openai/gpt-oss-20b` | 64K | 64K | ❌ | ❌ | ✅ | $0.02 | $0.06 |
| Qwen3 Next 80B A3B Instruct | `Qwen/Qwen3-Next-80B-A3B-Instruct` | 262K | 262K | ❌ | ❌ | ✅ | $0.06 | $0.60 |
| GLM 4.6 | `zai-org/GLM-4.6` | 200K | 200K | ❌ | ❌ | ✅ | $0.35 | $1.50 |
| GLM 4.7 | `zai-org/GLM-4.7` | 203K | 203K | ❌ | ❌ | ✅ | $0.30 | $1.40 |
| GLM 4.7 Flash | `zai-org/GLM-4.7-Flash` | 200K | 200K | ❌ | ❌ | ✅ | $0.07 | $0.40 |
| GLM 5 | `zai-org/GLM-5` | 203K | 203K | ❌ | ❌ | ✅ | $1.00 | $3.00 |
| GLM 5.1 | `zai-org/GLM-5.1` | 203K | 131K | ❌ | ❌ | ✅ | $1.06 | $4.40 |

*Costs are per million tokens. Cache read/write pricing available on most models — see `models.json` for full pricing.*

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
