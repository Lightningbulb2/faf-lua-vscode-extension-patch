Notice: Claude was used to read all the FAF specific functionality from [FAForever/fa-lua-vscode-extension](https://github.com/FAForever/fa-lua-vscode-extension) and build this extension for the [modern patched version](https://github.com/Lightningbulb2/faf-lua-language-server-patch).


# FA Lua VSCode Extension

This is a Supreme Commander Forged Alliance specific language server, built on the modern
[vscode-lua](https://github.com/LuaLS/vscode-lua) v3.18.2 and a wrapper with FA-specific additions.

---

## FA-Specific Changes to the Extension

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

### `lua-language-configuration.json`

Registers VS Code client-side folding markers for Lua files. This is what makes
`-- #region` / `--#region` folding actually work — the LSP `foldingRange` response
handles structural folding (functions, if blocks, tables), but comment-region folding
is driven by client-side pattern matching from this file.

The regex pattern `^\s*--+\s*#?region\b` matches all variants:

| What you type | Matched? |
|---|---|
| `--region` | ✓ |
| `-- region` | ✓ |
| `--#region` | ✓ |
| `-- #region` | ✓ |
| `----region` *(post-FA-plugin form of `--#region`)* | ✓ |

Without this file, VS Code ignores the `kind: "region"` responses from the server for
comment-based folds and `-- #region` appears as a normal comment with no fold gutter icon.

### `package.nls.json`

Added NLS keys for the three new settings:
- `config.runtime.exportEnvDefault`
- `config.diagnostics.disableScheme`
- `config.workspace.supportScheme`

---

## What's in this package

```
extension/
  package.json               Extension manifest — FA config properties, semantic tokens,
                             publisher/name, configurationDefaults
  package.nls.json           English NLS strings for FA-specific settings
  package.nls.*.json         Localised NLS strings (es-419, ja-jp, pt-br, zh-cn, zh-tw)
  client/
    src/                     TypeScript source (unmodified from upstream)
      extension.ts           Extension entry point
      languageserver.ts      Binary launch logic, platform detection
      addon_manager/         Addon manager commands, panels, services
      psi/                   PSI tree viewer
    package.json             Client npm manifest
    tsconfig.json
  setting/
    schema.json              .luarc.json schema (includes FA setting definitions)
    schema-*.json            Localised schemas
    setting.json             Default setting values
  images/                    Extension icons and screenshots
  ...

patches/
  extension_package.json.patch      Diff against upstream package.json
  extension_package.nls.json.patch  Diff against upstream package.nls.json
```

---



## Building

### Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | ≥ 18 | |
| npm | ≥ 9 | Bundled with Node |
| `@vscode/vsce` | latest | `npm install -g @vscode/vsce` |

### Step 1 — Clone the upstream extension

```sh
git clone --depth=1 https://github.com/LuaLS/vscode-lua
cd vscode-lua
```

### Step 2 — Populate submodules

```sh
git clone --depth=1 https://github.com/LuaLS/vscode-lua-doc   client/3rd/vscode-lua-doc
git clone --depth=1 https://github.com/LuaLS/vscode-lua-webvue client/webvue-src
cp -r client/webvue-src/. client/webvue/
```

### Step 3 — Apply the FA extension patches

```sh
PATCHES=/path/to/this/package/patches

# Apply the two modified manifests
patch -p1 < "$PATCHES/extension_package.json.patch"
patch -p1 < "$PATCHES/extension_package.nls.json.patch"
```

Or copy them directly:

```sh
SRC=/path/to/this/package/extension
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
cd webvue    # or wherever the webvue source was placed
npm install
npm run build
# output goes to build/ inside this directory
```

### Step 6 — Assemble the server directory

The extension expects `server/` to contain the language server binary and Lua scripts.
Build those from `fa-lua-language-server-patches.zip`, then:

```sh
LS=/path/to/built/lua-language-server

mkdir -p server/bin

# Lua scripts
cp $LS/main.lua      server/
cp $LS/debugger.lua  server/
cp $LS/changelog.md  server/
cp $LS/LICENSE       server/
cp -r $LS/locale     server/locale
cp -r $LS/script     server/script
cp -r $LS/meta       server/meta

# Binaries
cp $LS/bin/lua-language-server                          server/bin/lua-language-server
cp $LS/build/win32/bin/lua-language-server.exe          server/bin/lua-language-server.exe
cp $LS/bin/main.lua                                     server/bin/main.lua
cp /usr/x86_64-w64-mingw32/lib/libwinpthread-1.dll      server/bin/libwinpthread-1.dll
```

> **`server/bin/main.lua` is required.** The binary bootstraps by loading `main.lua`
> from its own directory. This is `make/bootstrap.lua` from the language server repo —
> it is **not** the same as `server/main.lua`.

### Step 7 — Package

```sh
# From the extension root (vscode-lua/)
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
macOS   → server/bin/lua-language-server
```

If `Lua.misc.executablePath` is set in VS Code settings, that path is used instead,
allowing users to point at a locally-built binary.

The extension sets the working directory to `server/` when launching the binary.
The binary itself then loads `bin/main.lua` relative to its own location (`server/bin/`),
which bootstraps the Lua VM and loads `server/main.lua` as the entry point.

---

## `.vscodeignore`

Only these paths are included in the packaged `.vsix`:

```
client/node_modules/        ← runtime npm dependencies
client/out/                 ← compiled TypeScript
client/package.json
client/3rd/vscode-lua-doc/doc/
client/3rd/vscode-lua-doc/extension.js
client/webvue/build/        ← compiled Vue addon manager

server/bin/                 ← binaries + main.lua
server/locale/
server/script/
server/main.lua
server/debugger.lua
server/meta/3rd/            ← FA type library (and other bundled libraries)
server/meta/template/
server/meta/spell/

setting/
images/logo.png
package.json
package.nls.json
package.nls.*.json
README.md
changelog.md
LICENSE
```

Everything else (TypeScript source, webvue source, test files, build scripts) is excluded.
