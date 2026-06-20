<template>
  <div id="notifications" v-if="notification">
    <div>
      <div class="message">
        <div class="level">{{ level }}</div>
        <div class="message">{{ message }}</div>
      </div>
      <div class="buttons">
        <vscode-button @click="appStore.notifications.splice(0, 1)">
          Okay
        </vscode-button>
        <vscode-button
          appearance="secondary"
          @click="vscode.postMessage('openLog')"
        >
          Open Log
        </vscode-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from "@/stores/app";
import { computed } from "vue";
import { vscode } from "@/services/vscode.service";
import {
  vsCodeButton,
  provideVSCodeDesignSystem,
} from "@vscode/webview-ui-toolkit";

provideVSCodeDesignSystem().register(vsCodeButton());

const LEVELS = ["Error", "Warning", "Info"];

const appStore = useAppStore();

const notification = computed(() => appStore.notifications[0]);

const level = computed(() => LEVELS[notification.value.level]);
const message = computed(() => notification.value.message);
</script>

<style lang="scss">
#notifications {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50%;
  height: fit-content;
  padding: 1em 2em;
  background: var(--background);
  z-index: 30;
  border-radius: 0.3rem;

  & > div {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .message {
    .level {
      font-size: 1.4em;
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .message {
      text-align: center;
      margin: 0px auto 2rem auto;
    }
  }

  .buttons {
    display: flex;
    justify-content: space-evenly;
  }
}
</style>
