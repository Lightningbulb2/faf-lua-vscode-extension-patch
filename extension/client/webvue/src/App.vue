<template>
  <div class="content">
    <RouterView />

    <Notifications />

    <footer>
      <div v-if="devMode" id="dev-warn">Development Mode Active</div>
      <span class="versions">
        <span title="WebVue Version">
          <CodeIcon icon="preview" /> v{{ version }}
        </span>
        <span title="Lua Extension Version">
          <CodeIcon icon="server" />v{{ appStore.clientVersion }}
        </span>
      </span>
      <span>{{ addonStore.addons.length }} / {{ addonStore.total }}</span>
      <span>
        <a
          :href="FEEDBACK_URL"
          target="_blank"
          rel="nofollow noreferrer noopener external"
          title="Feedback"
        >
          <CodeIcon icon="feedback" />
        </a>
        <button @click="openLog" title="Open Log File" role="Open Log File">
          <CodeIcon icon="output" />
        </button>
      </span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import "@vscode/codicons/dist/codicon.css";
import CodeIcon from "./components/CodeIcon.vue";
import Notifications from "./components/Notifications.vue";
import { vscode } from "./services/vscode.service";
import { useAppStore } from "./stores/app";
import { FEEDBACK_URL } from "./config";
import { useAddonStore } from "./stores/addonStore";

const addonStore = useAddonStore();

const appStore = useAppStore();

const devMode = import.meta.env.DEV;
const version = import.meta.env.APP_VERSION;

const openLog = () => vscode.postMessage("openLog");
</script>
