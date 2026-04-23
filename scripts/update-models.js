#!/usr/bin/env node

/**
 * Script to update IO Intelligence models from the API
 *
 * Fetches the model list from https://api.intelligence.io.solutions/api/v1/models
 * and regenerates models.json and the README model table.
 *
 * Requires IOINTELLIGENCE_API_KEY environment variable.
 * Usage: IOINTELLIGENCE_API_KEY=your-key node scripts/update-models.js
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE = 'https://api.intelligence.io.solutions/api/v1';
const MODELS_PATH = path.join(process.cwd(), 'models.json');

// ─── HTTP helpers ───────────────────────────────────────────────────────────

function fetchJSON(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse JSON from ${url}: ${e.message}`));
        }
      });
    });
    req.on('error', reject);
  });
}

// ─── Model transformation ──────────────────────────────────────────────────

const REASONING_IDS = ['DeepSeek-R1', 'Kimi-K2-Thinking'];

/** Clean up the display name from the API. */
function cleanName(apiName, apiId) {
  // API returns names like "MoonshotAI: Kimi K2.6" or "MiniMaxAI/MiniMax-M2.5"
  // We want clean names like "Kimi K2.6", "DeepSeek R1 0528", "GLM 5.1"
  // Strategy: extract the core model name from the ID if the API name is messy

  // If the name has a colon prefix like "MoonshotAI: Kimi K2.6", strip the prefix
  let name = apiName;
  const colonIdx = name.indexOf(': ');
  if (colonIdx > 0 && colonIdx < 25) {
    name = name.substring(colonIdx + 2);
  }

  // If name is just a slug-like ID (e.g. "MiniMaxAI/MiniMax-M2.5"), build a better name
  if (name.includes('/') && !name.includes(' ')) {
    // Use the part after the slash, replacing hyphens with spaces
    const parts = name.split('/');
    name = parts[parts.length - 1].replace(/-/g, ' ');
  }

  // Special case: "R1 0528" → "DeepSeek R1 0528"
  if (name === 'R1 0528') name = 'DeepSeek R1 0528';

  return `IO Intelligence: ${name}`;
}

function convertModel(apiModel) {
  const ctx = apiModel.context_window || 0;
  const maxTok = apiModel.max_tokens || ctx;
  const input = ['text'];
  if (apiModel.supports_images_input) input.push('image');

  const priceIn = (apiModel.input_token_price || 0) * 1_000_000;
  const priceOut = (apiModel.output_token_price || 0) * 1_000_000;
  const cacheRead = (apiModel.cache_read_token_price || 0) * 1_000_000;
  const cacheWrite = (apiModel.cache_write_token_price || 0) * 1_000_000;

  const isReasoning = REASONING_IDS.some(r => apiModel.id.includes(r));

  return {
    id: apiModel.id,
    name: cleanName(apiModel.name, apiModel.id),
    reasoning: isReasoning,
    input,
    cost: {
      input: Math.round(priceIn * 100) / 100,
      output: Math.round(priceOut * 100) / 100,
      cacheRead: Math.round(cacheRead * 100) / 100,
      cacheWrite: Math.round(cacheWrite * 100) / 100,
    },
    contextWindow: ctx,
    maxTokens: maxTok,
  };
}

// ─── README generation ──────────────────────────────────────────────────────

function formatCost(cost) {
  if (cost === 0) return 'Free';
  if (cost < 0.01) return `<$0.01`;
  return `$${cost.toFixed(2)}`;
}

function formatCtx(num) {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${Math.round(num / 1_000)}K`;
  return num.toString();
}

function generateReadme(models) {
  const sorted = [...models].sort((a, b) => {
    // Sort by: reasoning first, then vision, then by cost
    if (a.reasoning !== b.reasoning) return b.reasoning - a.reasoning;
    const aVis = a.input.includes('image') ? 1 : 0;
    const bVis = b.input.includes('image') ? 1 : 0;
    if (aVis !== bVis) return bVis - aVis;
    return a.id.localeCompare(b.id);
  });

  const rows = sorted.map(m => {
    const vision = m.input.includes('image') ? '✅' : '❌';
    const reasoning = m.reasoning ? '✅' : '❌';
    const cache = m.cost.cacheRead > 0 ? '✅' : '❌';
    // Strip IO Intelligence prefix for the table
    const displayName = m.name.replace('IO Intelligence: ', '');
    return `| ${displayName} | \`${m.id}\` | ${formatCtx(m.contextWindow)} | ${formatCtx(m.maxTokens)} | ${vision} | ${reasoning} | ${cache} | ${formatCost(m.cost.input)} | ${formatCost(m.cost.output)} |`;
  }).join('\n');

  const readme = `# pi-io-provider

A [pi](https://github.com/badlogic/pi-mono) extension that adds [IO Intelligence](https://io.net) as a custom model provider.

## Features

- **OpenAI-compatible API** — Uses IO Intelligence's \`/api/v1/chat/completions\` endpoint
- **23+ AI models** — DeepSeek, Kimi, GLM, Llama, Qwen, Mistral, and more
- **Reasoning models** — DeepSeek R1, Kimi K2 Thinking with extended reasoning
- **Vision models** — Kimi K2.5/K2.6, Llama 4 Maverick, Llama 3.2 Vision, Qwen2.5 VL, Mistral Large
- **Prompt caching** — Cache read/write support on most models
- **Confidential inference** — Verifiable TEE inference with attestation (via /private/ endpoints)
- **Streaming** — Real-time token streaming

## Available Models

| Model | ID | Context | Max Output | Vision | Reasoning | Cache | Input $/M | Output $/M |
|-------|----|---------|------------|--------|-----------|-------|-----------|------------|
${rows}

*Costs are per million tokens. Cache read/write pricing available on most models.*

## Installation

### Option 1: Using \`pi install\` (Recommended)

Install directly from GitHub:

\`\`\`bash
pi install git:github.com/monotykamary/pi-io-provider
\`\`\`

Then set your API key and run pi:
\`\`\`bash
# Recommended: add to auth.json
# See Authentication section below

# Or set as environment variable
export IOINTELLIGENCE_API_KEY=your-api-key-here

pi
\`\`\`

Get your API key from [io.net](https://io.net).

### Option 2: Manual Clone

1. Clone this repository:
   \`\`\`bash
   git clone https://github.com/monotykamary/pi-io-provider.git
   cd pi-io-provider
   \`\`\`

2. Set your IO Intelligence API key:
   \`\`\`bash
   # Recommended: add to auth.json
   # See Authentication section below

   # Or set as environment variable
   export IOINTELLIGENCE_API_KEY=your-api-key-here
   \`\`\`

3. Run pi with the extension:
   \`\`\`bash
   pi -e /path/to/pi-io-provider
   \`\`\`

## Authentication

The IO Intelligence API key can be configured in multiple ways (resolved in this order):

1. **\`auth.json\`** (recommended) — Add to \`~/.pi/agent/auth.json\`:
   \`\`\`json
   { "io-intelligence": { "type": "api_key", "key": "your-api-key" } }
   \`\`\`
   The \`key\` field supports literal values, env var names, and shell commands (prefix with \`!\`). See [pi's auth file docs](https://github.com/badlogic/pi-mono) for details.
2. **Runtime override** — Use the \`--api-key\` CLI flag
3. **Environment variable** — Set \`IOINTELLIGENCE_API_KEY\`

Get your API key from [io.net](https://io.net).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| \`IOINTELLIGENCE_API_KEY\` | No | Your IO Intelligence API key (fallback if not in auth.json) |

## Configuration

Add to your pi configuration for automatic loading:

\`\`\`json
{
  "extensions": [
    "/path/to/pi-io-provider"
  ]
}
\`\`\`

## Usage

Once loaded, select a model with:

\`\`\`
/model io-intelligence deepseek-ai/DeepSeek-R1-0528
\`\`\`

Or use \`/models\` to browse all available IO Intelligence models.

## API Documentation

- IO Intelligence Docs: https://io.net/docs/guides/confidential-inference/quick-start
- OpenAI-compatible endpoint: \`https://api.intelligence.io.solutions/api/v1\`
- Models endpoint: \`https://api.intelligence.io.solutions/api/v1/models\`
- Confidential inference: \`https://api.intelligence.io.solutions/api/v1/private/completions\`

## License

MIT
`;

  return readme;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const apiKey = process.env.IOINTELLIGENCE_API_KEY;
  if (!apiKey) {
    console.error('Error: IOINTELLIGENCE_API_KEY environment variable is required');
    console.error('Usage: IOINTELLIGENCE_API_KEY=your-key node scripts/update-models.js');
    process.exit(1);
  }

  console.log('Fetching models from IO Intelligence API...\n');

  try {
    const data = await fetchJSON(`${API_BASE}/models`, {
      Authorization: `Bearer ${apiKey}`,
    });

    const apiModels = data.data || [];
    console.log(`Total models from API: ${apiModels.length}`);

    const models = apiModels.map(convertModel);
    console.log(`Converted ${models.length} models`);

    // Save models.json
    fs.writeFileSync(MODELS_PATH, JSON.stringify(models, null, 2) + '\n');
    console.log(`✓ Saved ${models.length} models to models.json`);

    // Update README
    const readme = generateReadme(models);
    fs.writeFileSync(path.join(process.cwd(), 'README.md'), readme);
    console.log(`✓ Updated README.md`);

    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
