# Email Parser Rules Repository Documentation

`email-parser-rules` is a decoupled, modular rules engine for parsing structured information (such as shipping parcels, merchant order confirmations, and return requests) directly from incoming emails. 

By separating the parsing rules from your core application, you can update, expand, and maintain rulesets without needing to redeploy or restart the main application server.

---

## 💡 Core Philosophy

1. **Modular Source Files**: Rules are organized cleanly in folders inside `src/`. No single massive configuration file.
2. **Naming Convention (`_.json`)**: Basic metadata about each courier or shipper (such as name and domains) is stored in a file called `_.json` so that it always sorts to the very top in your code editor.
3. **Single-File Bundled Assets**: The repository contains a build script using `esbuild` to merge, minify, and bundle everything into exactly **one single-file compiled Javascript bundle** per category under `dist/` (e.g. `dist/parcel.js`, `dist/order.js`, `dist/return.js`).
4. **Resilient dynamic consumption**: Your application downloads this single bundle from a remote URL (like a GitHub Raw URL or Release Asset), loads it in memory, and persists it to a local disk cache to survive server restarts and network outages.

---

## 📖 Table of Contents

*   [**Creating Rules**](creating-rules.md)
    *   Learn how to configure metadata (`_.json`), build status matching, use high-performance prefix search, extract variables declaratively using Regex Named Capture Groups, and write custom JavaScript parser callbacks.
*   [**Application Integration Guide**](app-integration.md)
    *   Learn how to fetch, safely execute, cache, and fall back on compiled JS rulesets inside your own application engine.

---

## 🛠️ Quick Start

To build and compile your rules locally:

1. Clone or navigate to the directory:
   ```bash
   cd email-parser-rules
   ```
2. Install the lightweight development dependencies:
   ```bash
   npm install
   ```
3. Run the build compiler:
   ```bash
   npm run build
   ```
4. Verify the output compiled assets under the `dist/` directory.
