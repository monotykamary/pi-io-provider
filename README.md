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
- **Quiet live model sync** — Models refresh from the IO Intelligence API in the background, at most hourly and by one pi process at a time ([details](#model-sync))

## Available Models

| Model | ID | Context | Max Output | Vision | Reasoning | Cache | Input $/M | Output $/M |
|-------|----|---------|------------|--------|-----------|-------|-----------|------------|
| DeepSeek V4.1 Flash | `deepseek-ai/DeepSeek-V4.1-Flash` | 1.0M | 131K | ✅ | ✅ | ✅ | $0.33 | $1.33 |
| Gemma 4 26B A4B | `google/gemma-4-26b-a4b-it` | 262K | 262K | ✅ | ✅ | ✅ | $0.10 | $0.33 |
| Gemma 4 31B Instruct | `google/gemma-4-31b-it` | 262K | 16K | ✅ | ✅ | ✅ | $0.30 | $0.66 |
| Kimi K2.5 | `moonshotai/Kimi-K2.5` | 262K | 262K | ✅ | ✅ | ✅ | $0.54 | $2.83 |
| Kimi K2.6 | `moonshotai/Kimi-K2.6` | 262K | 262K | ✅ | ✅ | ✅ | $0.68 | $3.20 |
| Kimi K2.7 Code | `moonshotai/Kimi-K2.7-Code` | 262K | 262K | ✅ | ✅ | ✅ | $1.08 | $4.67 |
| Kimi K3 | `moonshotai/Kimi-K3` | 1.0M | 1.0M | ✅ | ✅ | ✅ | $2.52 | $17.26 |
| Nemotron 3.5 Super VL | `nvidia/nemotron-3.5-super-vl` | 262K | 131K | ✅ | ✅ | ✅ | $0.17 | $0.63 |
| Qwen3.6 27B | `Qwen/Qwen3.6-27B` | 33K | 33K | ✅ | ✅ | ✅ | $0.32 | $2.87 |
| Qwen3.6 35B A3B | `Qwen/Qwen3.6-35B-A3B` | 262K | 262K | ✅ | ✅ | ✅ | $0.13 | $1.02 |
| Qwen3.8 27B | `Qwen/Qwen3.8-27B` | 66K | 66K | ✅ | ✅ | ✅ | $0.42 | $2.27 |
| MiMo-V2.6-Flash | `XiaomiMiMo/MiMo-V2.6-Flash` | 1.0M | 131K | ✅ | ✅ | ✅ | $0.13 | $0.28 |
| GLM 5.3 Flash | `zai-org/GLM-5.3-Flash` | 262K | 131K | ✅ | ✅ | ✅ | $0.15 | $0.49 |
| DeepSeek R1 0528 | `deepseek-ai/DeepSeek-R1-0528` | 128K | 128K | ❌ | ✅ | ✅ | $0.52 | $2.21 |
| DeepSeek V3.2 | `deepseek-ai/DeepSeek-V3.2` | 164K | 164K | ❌ | ✅ | ✅ | $1.00 | $1.65 |
| DeepSeek V4 Flash | `deepseek-ai/DeepSeek-V4-Flash` | 33K | 33K | ❌ | ✅ | ✅ | $0.20 | $0.58 |
| DeepSeek V4 Flash 0731 | `deepseek-ai/DeepSeek-V4-Flash-0731` | 262K | 66K | ❌ | ✅ | ✅ | $0.13 | $0.25 |
| DeepSeek V4 Pro | `deepseek-ai/DeepSeek-V4-Pro` | 1.0M | 600K | ❌ | ✅ | ✅ | $1.22 | $2.39 |
| DeepSeek V4 Pro 0813 | `deepseek-ai/DeepSeek-V4-Pro-0813` | 1.0M | 393K | ❌ | ✅ | ✅ | $0.80 | $4.94 |
| MiniMax M2.5 | `MiniMaxAI/MiniMax-M2.5` | 197K | 197K | ❌ | ✅ | ✅ | $0.35 | $1.42 |
| MiniMax M2.7 | `MiniMaxAI/MiniMax-M2.7` | 262K | 66K | ❌ | ✅ | ✅ | $0.40 | $1.49 |
| Kimi K2 Thinking | `moonshotai/Kimi-K2-Thinking` | 262K | 262K | ❌ | ✅ | ✅ | $0.60 | $2.50 |
| Nemotron 3.5 Lightning | `nvidia/nemotron-3.5-lightning` | 262K | 131K | ❌ | ✅ | ✅ | $0.05 | $0.16 |
| gpt-oss-120b | `openai/gpt-oss-120b` | 131K | 131K | ❌ | ✅ | ✅ | $0.17 | $0.63 |
| gpt-oss-20b | `openai/gpt-oss-20b` | 64K | 64K | ❌ | ✅ | ✅ | $0.04 | $0.17 |
| Beam 1.0 | `reflection/Beam-1.0-501B-A23B` | 1.0M | 131K | ❌ | ✅ | ✅ | $0.35 | $1.12 |
| MiMo-V2.5 | `XiaomiMiMo/MiMo-V2.5` | 1.0M | 1.0M | ❌ | ✅ | ✅ | $0.40 | $2.00 |
| GLM-4.5-Air | `zai-org/GLM-4.5-Air` | 131K | 131K | ❌ | ✅ | ✅ | $0.16 | $0.94 |
| GLM 4.6 | `zai-org/GLM-4.6` | 131K | 131K | ❌ | ✅ | ✅ | $0.52 | $2.04 |
| GLM 4.7 | `zai-org/GLM-4.7` | 203K | 203K | ❌ | ✅ | ✅ | $0.53 | $2.07 |
| GLM 4.7 Flash | `zai-org/GLM-4.7-Flash` | 200K | 200K | ❌ | ✅ | ✅ | $0.07 | $0.40 |
| GLM 5 | `zai-org/GLM-5` | 203K | 203K | ❌ | ✅ | ✅ | $0.86 | $2.75 |
| GLM 5.1 | `zai-org/GLM-5.1` | 203K | 33K | ❌ | ✅ | ✅ | $1.36 | $4.27 |
| GLM 5.2 | `zai-org/GLM-5.2` | 262K | 131K | ❌ | ✅ | ✅ | $1.48 | $5.60 |
| GLM 5.3 | `zai-org/GLM-5.3` | 262K | 131K | ❌ | ✅ | ✅ | $1.44 | $5.29 |
| Llama 4 Maverick 17B 128E Instruct FP8 | `meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8` | 430K | 430K | ✅ | ❌ | ✅ | $0.27 | $0.83 |
| Qwen3 Coder 480B A35B Instruct INT4 Mixed AR | `Intel/Qwen3-Coder-480B-A35B-Instruct-int4-mixed-ar` | 106K | 106K | ❌ | ❌ | ✅ | $0.33 | $1.25 |
| Llama 3.3 70B Instruct | `meta-llama/Llama-3.3-70B-Instruct` | 128K | 128K | ❌ | ❌ | ✅ | $0.58 | $0.77 |
| Mistral Nemo Instruct 2407 | `mistralai/Mistral-Nemo-Instruct-2407` | 128K | 128K | ❌ | ❌ | ✅ | $0.06 | $0.06 |
| Kimi K2 Instruct 0905 | `moonshotai/Kimi-K2-Instruct-0905` | 262K | 262K | ❌ | ❌ | ✅ | $0.57 | $2.30 |
| Qwen3 Next 80B A3B Instruct | `Qwen/Qwen3-Next-80B-A3B-Instruct` | 262K | 262K | ❌ | ❌ | ✅ | $0.11 | $1.28 |

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
| `PI_PROVIDER_SYNC_TTL_MS` | No | Model sync freshness window in ms (default `3600000`; `0` = revalidate every session start) |

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

## Model sync

Startup never waits on the network. pi starts with the cached catalog (`~/.pi/agent/cache/io-intelligence-models.json`,
falling back to the bundled `models.json`) and revalidates against `/api/v1/models` in the background — only when:

- an IO Intelligence API key is configured (no key, no request),
- the cache is older than 1 hour, missing, or was fetched with a different API key, and
- no other pi process is already refreshing it (an `io-intelligence-models.lock` file next to the cache).

So `/new`, `/reload`, `pi -p` and fan-out child agents share one cache instead of each calling the API; a
session that skips the fetch still picks up a cache another process refreshed. A failed refresh is retried after
5 minutes at the earliest. `PI_PROVIDER_SYNC_TTL_MS` changes the window (`0` revalidates on every session start).
Only a hash fingerprint of the key is stored (`io-intelligence-models.sync.json`), never the key itself.

## API Documentation

- IO Intelligence Docs: https://io.net/docs/guides/confidential-inference/quick-start
- OpenAI-compatible endpoint: `https://api.intelligence.io.solutions/api/v1`
- Models endpoint: `https://api.intelligence.io.solutions/api/v1/models`
- Confidential inference: `https://api.intelligence.io.solutions/api/v1/private/completions`

## License

MIT
