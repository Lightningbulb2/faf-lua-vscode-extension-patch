# Lua FA VSCode Extension Patch

This extension is for a Supreme Commander Forged Alliance specific language server, found at [Lightningbulb2/faf-lua-language-server-patch](https://github.com/Lightningbulb2/faf-lua-language-server-patch) it patches in FA-specific additions to [LuaLS](https://github.com/LuaLS/lua-language-server).

<mark>**Notice**: Claude.ai was used to read all the FAF specific functionality from [FAForever/fa-lua-vscode-extension](https://github.com/FAForever/fa-lua-vscode-extension) and build this patch for [LuaLS/vscode-lua](https://github.com/LuaLS/vscode-lua).</mark>

---

## Table of Contents

[FA-Specific Changes to the Extension](#fa-specific-changes-to-the-extension)

[Building](#building)

[What's in this package](#whats-in-this-package)

---

# FA-Specific Changes to the Extension

### `package.json`

Three new configuration properties added to `contributes.configuration.properties`:

**`Lua.runtime.exportEnvDefault`** (`boolean`, default `false`)
Controls whether top-level globals in FA scripts are treated as exported env symbols.
Set to `true` automatically by the FA type library's `config.lua` when an FA workspace
is detected.

**`Lua.diagnostics.disableScheme`** (`string[]`, default `["git"]`)
URI schemes on which diagnostics are suppressed. Prevents errors appearing in VS Code's
read-only git diff views. Complements the existing `Lua.diagnostics.enableScheme`.

**`Lua.workspace.supportScheme`** (`string[]`, default `["file", "untitled", "git"]`)
URI schemes the language server accepts `didOpen` / `didChange` notifications for.
Files with other schemes are silently ignored.

**`configurationDefaults`**: Added `"editor.wordBasedSuggestions": false` for `[lua]`
files, which prevents VS Code's generic word-completion from polluting the FA-specific
suggestions.

**`semanticTokenScopes`**: Added `variable.static` token scope mapping, used by the
server to highlight static class fields distinctly.

**`name`** / **`publisher`**: Set to `lua-fa` / `FAForever` to avoid conflict with the
upstream `sumneko.lua` / `LuaLS` extension.

### `package.nls.json`

Added NLS keys for the three new settings:

- `config.runtime.exportEnvDefault`
- `config.diagnostics.disableScheme`
- `config.workspace.supportScheme`

---

# Building

### Prerequisites

| Tool           | Version | Notes                         |
| -------------- | ------- | ----------------------------- |
| Node.js        | ≥ 18    |                               |
| npm            | ≥ 9     | Bundled with Node             |
| `@vscode/vsce` | latest  | `npm install -g @vscode/vsce` |

### Step 1 — Clone the upstream extension

This is all built on top of the VSCode Lua Language Server Extension so clone that somewhere and cd into it.

```sh
git clone https://github.com/LuaLS/vscode-lua
cd vscode-lua
git submodule update --init --recursive
```

### Step 3 — Apply the FA extension patches

```sh
SRC="/your/path/to/faf-lua-vscode-extension-patch"

# Apply the two modified manifests
patch -p1 < "$SRC/patches/package.json.patch"
patch -p1 < "$SRC/patches/package.nls.json.patch"
```

### Alternative Step 3

Or copy them directly:

```sh
# SRC="/your/path/to/faf-lua-vscode-extension-patch"

cp $SRC/package.json      package.json
cp $SRC/package.nls.json  package.nls.json
```

### Step 4 — Build the TypeScript client

```sh
cd client
npm install
npm run build   # runs tsc
```

### Step 5 — Build the Vue addon manager

```sh
cd webvue
npm install
npm run build
# output goes to build/ inside this directory
```

### Step 6 — Assemble the server directory

The extension expects `server/` to contain the language server binary and Lua scripts.
Build those from `faf-lua-language-server-patch`, then copy them in:

```sh
# Current working directory: /your/path/to/vscode-lua
LS="/your/path/to/built/lua-language-server"

# Lua scripts (same for all platforms)
cp $LS/main.lua      server/
cp $LS/debugger.lua  server/
cp $LS/changelog.md  server/
cp $LS/LICENSE       server/
cp -r $LS/locale     server/
cp -r $LS/script     server/
cp -r $LS/meta       server/
cp -r $LS/bin        server/
```

> you may notice: bin/main.lua — the exe bootstraps by loading this from its own directory.
> This is make/bootstrap.lua from the LS repo. It is NOT the same as server/main.lua.

Then add the platform binaries. Include all platforms you want to support:

**Linux binary** (WSL2, Docker, or CI — see the language server README):

```sh
cp $LS/bin/lua-language-server  server/bin/lua-language-server
```

**Windows binary — built natively with MSVC** (requires Visual Studio):

<mark>ALREADY COPIED THE WHOLE BIN IN THE PREVIOUS COMMAND, CONTINUE</mark>

> includes exe and all DLLs (MSVC runtime: msvcp140.dll, vcruntime140.dll, etc.)

**Windows binary — cross-compiled from Linux with mingw** (no MSVC runtime, just one DLL):

```sh
cp $LS/build/win32/bin/lua-language-server.exe          server/bin/lua-language-server.exe
cp /usr/x86_64-w64-mingw32/lib/libwinpthread-1.dll      server/bin/libwinpthread-1.dll
```

The extension auto-selects the right binary at runtime via `os.platform()`, so include
all platforms in the same `server/bin/` for a universal VSIX. See the [language server](https://github.com/Lightningbulb2/faf-lua-language-server-patch)
README for full instructions on building Linux binaries from Windows (WSL2, Docker, or
GitHub Actions).

### Step 7 — Package

```sh
# Current working directory: "your/path/to/vscode-lua"
vsce package --no-dependencies
```

Output: `lua-fa-3.18.2.vsix`

Install:

```sh

code --install-extension lua-fa-3.18.2.vsix
```

---

## How the Extension Resolves the Binary

`client/src/languageserver.ts` detects the platform and constructs the executable path:

```
Windows → server/bin/lua-language-server.exe
Linux   → server/bin/lua-language-server
```

If `Lua.misc.executablePath` is set in VS Code settings, that path is used instead,
allowing users to point at a locally-built binary.

The extension sets the working directory to `server/` when launching the binary.
The binary itself then loads `bin/main.lua` relative to its own location (`server/bin/`),
which bootstraps the Lua VM and loads `server/main.lua` as the entry point.

---

# What's in this package

```
patches/
  package.json.patch      Diff against upstream package.json
  package.nls.json.patch  Diff against upstream package.nls.json

package.nls.json - already patched version
package.json - already patched version

```
