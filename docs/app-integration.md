# Application Integration Guide

This guide explains how to fetch, safely execute, cache, and fall back on compiled JS rulesets in your own Node.js/TypeScript applications.

---

## 🛰️ 1. Caching & Fallback Model

When your app consumes dynamic rulesets, it should always implement a **Local Persistent Disk Cache** to survive remote network outages, rate-limits, or server restarts:

1. **Startup / Interval Refresh**: Attempt to fetch the ruleset bundle (e.g. `https://example.com/rules/parcel.js`) using `fetch()`.
2. **On Success**: Update the active in-memory rules and write/overwrite the raw JS content to a local persistent directory (e.g. `.scratch/rules-cache/parcel.js`).
3. **On Fetch Failure**: Catch the error, log a warning, and attempt to read the last saved JS bundle from the local directory.
4. **On Cache Failure**: Fall back to shipped, static, or default bundled configurations.

---

## 🧩 2. Sandbox Compilation (Safe Dynamic Execution)

Since the compiled rules bundle (e.g. `dist/parcel.js`) contains executable JavaScript code (such as custom `parse()` callbacks), you should execute it inside a isolated **Node VM Sandbox** context rather than running raw `eval()` or standard `new Function()`. 

This is natively supported by Node's built-in `node:vm` module:

```typescript
import vm from "node:vm";
import { CourierRule } from "./types";

function compileRulesFromJs(jsContent: string): CourierRule[] {
  // Create an isolated sandbox environment
  const sandbox = { 
    exports: {} as any, 
    module: { exports: {} as any } 
  };
  vm.createContext(sandbox);
  
  // Run the bundle code inside the sandboxed context
  vm.runInContext(jsContent, sandbox);
  
  // Extract rules (supporting both UMD, CommonJS, and ES exports)
  const exports = sandbox.exports || {};
  const moduleExports = sandbox.module.exports || {};
  
  const rules = 
    exports.rules || 
    exports.default || 
    moduleExports.rules || 
    moduleExports.default || 
    exports || 
    moduleExports;
    
  return Array.isArray(rules) ? rules : [];
}
```

---

## ⚡ 3. Evaluation Engine Flow

To match incoming emails against the loaded `CourierRule[]` rules list, your parsing engine should evaluate each rule sequentially:

1. **Domain Match**: Fast-check if the sender's email address matches any listed in `rule.domains`.
2. **Status Evaluation**:
   - Loop through the rule's `statusRules` (delivered, exception, arriving, sent, ordered).
   - Perform prefix-based string checks on the `email` sender, `subject`, and `bodyPlain`/`bodyHtml` strings.
   - If a status rule matches, set `detectedStatus` accordingly.
3. **Parser Execution**:
   - If the rule defines a custom `rule.parse()` callback, invoke it passing the email strings and parsing helpers. If it returns a parsed result, stop and return it.
   - Otherwise, perform declarative **Named Capture Group** extraction using the patterns defined in `rule.tracking.patterns`.
   - Return the populated parsed result object!
4. **Fallback check**: If no domain matches or succeeds, loop through all rules tracking patterns to scan for valid tracking numbers to support blind fallback matches!
