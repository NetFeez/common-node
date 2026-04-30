# @netfeez/common-node

> Node.js-specific extensions for the NetFeez ecosystem

`@netfeez/common-node` provides specialized utilities for Node.js environments, extending the core functionality of the NetFeez platform. This package handles low-level system operations—including filesystem management, environment configuration, and path resolution—with a focus on performance, type safety, and a "silent-unless-failed" architecture.

---

## 🚩 Key Features

- **Asynchronous & Non-Blocking:** Optimized wrappers for `node:fs` and `node:path` to ensure high-concurrency performance.
- **Silent Architecture:** Designed to be purely logical. No internal logging; uses descriptive `Exceptions` and `Throws` to give developers total control over output.
- **Environment Management:** Robust `.env` loader with automatic creation, schema parsing, and fallback support.
- **Intelligent Path Resolution:** Cross-platform path normalization and project-root awareness.
- **Deep Integration:** Seamlessly works with `@netfeez/common` and powers the core of [Vortez](https://github.com/NetFeez/vortez).

---

## 🧩 Package Structure

- **src/Env.ts** — Secure environment variable management and `.env` parsing.
- **src/File.ts** — Enhanced filesystem utilities (recursive scanning, existence checks, async operations).
- **src/Path.ts** — Advanced path resolution (module vs. root directory mapping).
- **src/Encoding.ts** — Node-specific data transformation and buffer utilities.
- **src/common-node.ts** — Main barrel file for unified imports.

---

## 🌐 NetFeez Ecosystem Integration

This package serves as the bridge between the platform-agnostic core and the Node.js runtime:
- [@netfeez/common](https://github.com/NetFeez/common): The universal core foundation.
- [Vortez](https://github.com/NetFeez/vortez): High-performance web framework utilizing these node-specific tools for its core infrastructure.

---

## 📦 Installation

```bash
npm install @netfeez/common-node
```

### Usage

Since this package is built for Node.js, you can import utilities directly into your project:

#### 1. Environment Loading
```ts
import { Env } from '@netfeez/common-node';

// Load .env file and set variables to process.env automatically
await Env.load('.env', {
    defaultEnv: { PORT: '3000', HOST: 'localhost' }
});

const port = Env.get('PORT', { default: '8080' });
```

#### 2. Filesystem Utilities
```ts
import { File } from '@netfeez/common-node';

// Recursively find all TypeScript files
const files = await File.getAllFiles('./src', ['.ts']);

// Check existence without try-catch blocks
if (await File.exists('./config.json')) {
    // ...
}
```

#### 3. Path Normalization
```ts
import { Path } from '@netfeez/common-node';

// Automatically handles OS-specific separators (\ vs /)
const normalized = Path.normalize('src//modules\\logger/');

// Resolve paths relative to the project root
const logPath = Path.root('logs', 'server.vlog');
```

---

## 🛡️ Error Handling Policy

`@netfeez/common-node` follows a **Zero-Footprint** policy. It will never use `console.log` or internal loggers. If an operation fails (e.g., a file is not readable or a directory cannot be created), it will throw an error. 

This allows you to wrap calls in your own logging infrastructure:

```ts
import { Env } from '@netfeez/common-node';
import { Logger } from '@netfeez/vterm'; // Or your preferred logger

try {
    await Env.load('.env');
} catch (error) {
    Logger.error('Failed to initialize environment:', error.message);
}
```

---

## 📄 License

Distributed under the **Apache License, Version 2.0**. See the [LICENSE](LICENSE) file for details.
