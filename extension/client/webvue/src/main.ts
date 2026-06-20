////////////////////// VUE //////////////////////

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

import "./assets/scss/main.scss";

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount("#app");

//////////////////// VS CODE ////////////////////
import { commands } from "./commands";
import { vscode } from "@/services/vscode.service";

// Listen for messages from VS Code
// https://code.visualstudio.com/api/extension-guides/webview#scripts-and-message-passing
window.addEventListener("message", (event: MessageEvent) => {
  const data = event.data;
  const command = data.command as string;

  if (!command) {
    console.error("Command field not found in message");
    return;
  }

  const commandHandler = commands[command];
  if (!commandHandler) {
    console.error(`"${command}" could not be found!`);
    return;
  }
  commandHandler(data);
});

// Save and restore state using Pinia and VS Code
// https://code.visualstudio.com/api/extension-guides/webview#persistence
import { useAppStore, type AppStore } from "./stores/app";

type State = {
  appStore: AppStore;
};

const appStore = useAppStore();

const previousState = vscode.getState() as State;

if (previousState) {
  appStore.$state = previousState.appStore;
  appStore.notifications = [];
}

const saveState = () => {
  const state: State = {
    appStore: appStore.$state,
  };

  vscode.setState(state);
};

// Save state on update to stores
appStore.$subscribe(() => saveState());
