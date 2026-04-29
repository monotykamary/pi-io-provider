/**
 * IO Intelligence Provider Extension
 *
 * Registers IO Intelligence (io.net) as a custom provider using the openai-completions API.
 * Base URL: https://api.intelligence.io.solutions/api/v1
 *
 * Model resolution strategy: Stale-While-Revalidate
 *   1. Serve stale immediately: disk cache → embedded models.json (zero-latency)
 *   2. Revalidate in background: live API /models → merge with embedded → cache → hot-swap
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
import modelsData from "./models.json" with { type: "json" };
import fs from "fs";
import os from "os";
import path from "path";

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface IOModel {
  id: string;
  name: string;
  reasoning: boolean;
  input: ("text" | "image")[];
  cost: {
    input: number;
    output: number;
    cacheRead: number;
    cacheWrite: number;
  };
  contextWindow: number;
  maxTokens: number;
}

// ─── Model Transformation ─────────────────────────────────────────────────────

function toPiModel(model: IOModel): PiModel {
  return {
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
  };
}

// ─── Stale-While-Revalidate Model Sync ────────────────────────────────────────

const PROVIDER_ID = "io-intelligence";
const BASE_URL = "https://api.intelligence.io.solutions/api/v1";
const MODELS_URL = `${BASE_URL}/models`;
const CACHE_DIR = path.join(os.homedir(), ".pi", "agent", "cache");
const CACHE_PATH = path.join(CACHE_DIR, `${PROVIDER_ID}-models.json`);
const LIVE_FETCH_TIMEOUT_MS = 8000;

/** Transform a model from the IO Intelligence /v1/models API to IOModel format. */
function transformApiModel(apiModel: any): IOModel | null {
  const hasVision = apiModel.supports_images_input === true;
  // IO returns per-token pricing, convert to per-million
  const toPerM = (v: any) => (typeof v === "number" ? v * 1_000_000 : 0);
  return {
    id: apiModel.id,
    name: apiModel.name || apiModel.id,
    reasoning: false, // IO doesn't expose reasoning capability in API
    input: hasVision ? ["text", "image"] as ("text" | "image")[] : ["text"] as ("text" | "image")[],
    cost: {
      input: toPerM(apiModel.input_token_price),
      output: toPerM(apiModel.output_token_price),
      cacheRead: toPerM(apiModel.cache_read_token_price),
      cacheWrite: toPerM(apiModel.cache_write_token_price),
    },
    contextWindow: apiModel.context_window || 131072,
    maxTokens: apiModel.max_tokens || 0,
  };
}

async function fetchLiveModels(apiKey: string): Promise<IOModel[] | null> {
  try {
    const response = await fetch(MODELS_URL, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(LIVE_FETCH_TIMEOUT_MS),
    });
    if (!response.ok) return null;
    const data = await response.json();
    const apiModels = Array.isArray(data) ? data : (data.data || []);
    if (!Array.isArray(apiModels) || apiModels.length === 0) return null;
    return apiModels.map(transformApiModel).filter((m): m is IOModel => m !== null);
  } catch {
    return null;
  }
}

function loadCachedModels(): IOModel[] | null {
  try {
    const data = JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

function cacheModels(models: IOModel[]): void {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(CACHE_PATH, JSON.stringify(models, null, 2) + "\n");
  } catch {
    // Cache write failure is non-fatal
  }
}

function mergeWithEmbedded(liveModels: IOModel[], embeddedModels: IOModel[]): IOModel[] {
  const embeddedIds = new Set(embeddedModels.map(m => m.id));
  const result = [...embeddedModels];
  for (const model of liveModels) {
    if (!embeddedIds.has(model.id)) {
      result.push(model);
    }
  }
  return result;
}

function loadStaleModels(embeddedModels: IOModel[]): IOModel[] {
  const cached = loadCachedModels();
  if (cached && cached.length > 0) return cached;
  return embeddedModels;
}

async function revalidateModels(apiKey: string | undefined, embeddedModels: IOModel[]): Promise<IOModel[] | null> {
  if (!apiKey) return null;
  const liveModels = await fetchLiveModels(apiKey);
  if (!liveModels || liveModels.length === 0) return null;
  const merged = mergeWithEmbedded(liveModels, embeddedModels);
  cacheModels(merged);
  return merged;
}

// ─── API Key Resolution (via ModelRegistry) ────────────────────────────────────

let cachedApiKey: string | undefined;

async function resolveApiKey(modelRegistry: ModelRegistry): Promise<void> {
  cachedApiKey = await modelRegistry.getApiKeyForProvider("io-intelligence") ?? undefined;
}

// ─── Extension Entry Point ────────────────────────────────────────────────────

export default function (pi: ExtensionAPI) {
  const embeddedModels = modelsData as IOModel[];
  const staleBase = loadStaleModels(embeddedModels);
  const staleModels = staleBase.map(toPiModel);

  pi.registerProvider("io-intelligence", {
    baseUrl: BASE_URL,
    apiKey: "IOINTELLIGENCE_API_KEY",
    api: "openai-completions",
    models: staleModels,
  });

  pi.on("session_start", async (_event, ctx) => {
    await resolveApiKey(ctx.modelRegistry);
    revalidateModels(cachedApiKey, embeddedModels).then((freshBase) => {
      if (freshBase) {
        pi.registerProvider("io-intelligence", {
          baseUrl: BASE_URL,
          apiKey: "IOINTELLIGENCE_API_KEY",
          models: freshBase.map(toPiModel),
        });
      }
    });
  });
}
