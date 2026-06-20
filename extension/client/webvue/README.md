
# vscode-lua-webvue
A [Vue](https://vuejs.org/) web application that is used by [Sumneko's Lua VS Code extension][vscode-lua]. The extension allows users to open a [webview](https://code.visualstudio.com/api/extension-guides/webview) that contains this webapp. This webapp gives users a reactive and first-party looking UI to manage their addons.


## Usage
This webapp is not intended to be run outside of VS Code, as it depends on the [VS Code API][vscode-api] in order to perform filesystem actions and commands specific to VS Code.

For using with [Sumneko's VS Code extension][vscode-lua], you can follow these steps:

1. Clone this repository

2. `npm i` in the root to install dependencies

3. `npm run build` to have [Vite][vite] build the app into the `build/` directory

4. The `build/` directory can be copied to `client/webvue/` in the [Lua VS Code extension][vscode-lua].

After following those steps, the build folder should now be found at `client/webvue/build/` in the `vscode-lua` directory.

After launching VS Code, the extension will be enabled and the `Lua: Open Addon Manager`(`lua.addon_manager.open`) command will be registered. Running this command in VS Code will open this webapp.



## Development
Because this webapp depends on the [VS Code API][vscode-api], it has a bit of an odd development/testing method.

In order to not have to build the webapp and reload VS Code every time a small change is made, the VS Code extension will instead load the [Vite][vite] development server in an iframe. This allows changes to the webapp to immediately show in VS Code, but also has some drawbacks.

Because the webapp is being displayed in an iframe… in an iframe, the [`message`](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)s that are exchanged between VS Code and the webview have to be relayed by the webview to the inner development iframe. This means that **popups/`target="_blank"` will not function** (setting the [`sandbox`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/sandbox) attribute allows popups, but ends up breaking everything else).

### Prerequisites
- VS Code
- NodeJS & NPM

### Setup
First, we will have to set up the VS Code extension.

1. Extension setup
   1. Run `git clone --recurse-submodules $REPO`, where `$REPO` is your preferred clone URL from [`vscode-lua`][vscode-lua].

   2. Download a language server binary from [`lua-language-server`](https://github.com/LuaLS/lua-language-server/releases/latest) for your machine.

   3. Unzip the compressed file and copy its contents to your `vscode-lua` clone under the `server/` directory.

   4. In the `client/` folder, run `npm i` to install dependencies for the client.

   5. Run `tsc --watch` in the `client/` folder. This will compile all TypeScript changes to the client as they happen.

> **Note**
> You will want to open another terminal window to run the following steps in.

2. WebVue setup
   1. Move to `client/webuve`
   2. Run `npm i` to install dependencies in `client/webvue`.
   3. Run `npm run dev` to start a [Vite][vite] local server.

3. Testing in VS Code
   1. You can now edit the files in `client/` to modify the VS Code extension, and the files in `client/webvue/` to edit this webapp.
   2. Open your `vscode-lua` clone in VS Code, go to the `Run and Debug` menu, and run the `Launch Client` option. This will open an extension development window of VS Code where you can test your changes.

[vscode-api]: https://code.visualstudio.com/api/references/vscode-api
[vscode-lua]: https://github.com/sumneko/vscode-lua
[vite]: https://vitejs.dev/

