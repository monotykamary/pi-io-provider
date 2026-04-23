/**
 * IO Intelligence Provider Extension
 *
 * Registers IO Intelligence (io.net) as a custom provider using the openai-completions API.
 * Base URL: https://api.intelligence.io.solutions/api/v1
 *
 * Usage:
 *   # Option 1: Store in auth.json (recommended)
 *   # Add to ~/.pi/agent/auth.json:
 *   #   "io-intelligence": { "type": "api_key", "key": "your-api-key" }
 *
 *   # Option 2: Set as environment variable
 *   export IOINTELLIGENCE_API_KEY=your-api-key
 *
 *   # Run pi with the extension
 *   pi -e /path/to/pi-io-provider
 *
 * Then use /model to select from available models like DeepSeek R1, Kimi K2.5,
 * GLM 5.1, Llama 4 Maverick, Qwen3 Coder, and more.
 *
 * IO Intelligence Features:
 *   - OpenAI-compatible API (https://api.intelligence.io.solutions/api/v1)
 *   - Reasoning/thinking models (DeepSeek R1, Kimi K2 Thinking)
 *   - Vision models (Kimi K2.5/K2.6, Llama 4 Maverick, Llama 3.2 Vision, etc.)
 *   - Prompt caching support on most models
 *   - Confidential inference with attestation (via /private/ endpoints)
 *   - Streaming support
 *
 * @see https://io.net/docs/guides/confidential-inference/quick-start
 */

import type { ExtensionAPI, ModelRegistry } from "@mariozechner/pi-coding-agent";
import models from "./models.json" with { type: "json" };

// Pi's expected model structure
interface PiModel {
  id: string;
  name: string;
  reasoning: boolean;
  input: string[];
  cost: {
    input: number;
    output: number;
    cacheRead: number;
    cacheWrite: number;
  };
  contextWindow: number;
  maxTokens: number;
}

// IO Intelligence model data structure from JSON
interface IOModel {
  id: string;
  name: string;
  reasoning: boolean;
  input: ("text" | "image")[];
  cost: {
    input: number;      // $ per million input tokens
    output: number;     // $ per million output tokens
    cacheRead: number;  // $ per million cached tokens
    cacheWrite: number; // $ per million cache write tokens
  };
  contextWindow: number;
  maxTokens: number;
}

const piModels = (models as IOModel[]).map((model): PiModel => ({
  id: model.id,
  name: model.name,
  reasoning: model.reasoning,
  input: model.input,
  cost: {
    input: model.cost.input,
    output: model.cost.output,
    cacheRead: model.cost.cacheRead,
    cacheWrite: model.cost.cacheWrite,
  },
  contextWindow: model.contextWindow,
  maxTokens: model.maxTokens,
}));

// ─── API Key Resolution (via ModelRegistry) ────────────────────────────────────

/**
 * Cached API key resolved from ModelRegistry.
 *
 * Pi's core resolves the key via ModelRegistry before making requests,
 * but we also cache it here so we can resolve it in contexts where the resolved
 * key isn't directly available and to make the dependency explicit.
 *
 * Resolution order (via ModelRegistry.getApiKeyForProvider):
 *   1. Runtime override (CLI --api-key)
 *   2. auth.json stored credentials (manual entry in ~/.pi/agent/auth.json)
 *   3. OAuth tokens (auto-refreshed)
 *   4. Environment variable (from auth.json or provider config)
 */
let cachedApiKey: string | undefined;

/**
 * Resolve the IO Intelligence API key via ModelRegistry and cache the result.
 * Called on session_start and whenever ctx.modelRegistry is available.
 */
async function resolveApiKey(modelRegistry: ModelRegistry): Promise<void> {
  cachedApiKey = await modelRegistry.getApiKeyForProvider("io-intelligence") ?? undefined;
}

export default function (pi: ExtensionAPI) {
  // Resolve API key via ModelRegistry on session start
  pi.on("session_start", async (_event, ctx) => {
    await resolveApiKey(ctx.modelRegistry);
  });

  pi.registerProvider("io-intelligence", {
    baseUrl: "https://api.intelligence.io.solutions/api/v1",
    apiKey: "IOINTELLIGENCE_API_KEY",
    api: "openai-completions",
    models: piModels,
  });
}
