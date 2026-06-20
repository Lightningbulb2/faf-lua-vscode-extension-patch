<template>
  <div class="addon">
    <div>
      <div class="top">
        <h1>
          {{ addon.displayName ?? addon.name }}
        </h1>
        <span class="badges">
          <span v-if="addon.hasPlugin" class="badge"
            ><CodeIcon icon="plug" />Has Plugin</span
          >
        </span>
      </div>
      <p class="description truncate">
        {{ description }}
      </p>
      <div class="bottom">
        {{ size }}
      </div>
    </div>
    <div class="right">
      <div class="top">
        <div class="quick-actions">
          <button @click="open"><CodeIcon icon="folder" /></button>
          <a
            :href="url"
            target="_blank"
            rel="nofollow noreferrer noopener external"
            title="View on GitHub"
            class="github-link"
            ><CodeIcon icon="github"
          /></a>
        </div>
      </div>
      <div class="controls">
        <vscode-dropdown
          v-if="addon.installed && (addon.tags?.length ?? 0) > 0"
          @change="versionChange"
          :disabled="addon.processing"
          :value="addon.version"
        >
          <vscode-option>Latest</vscode-option>
          <vscode-option v-for="tag in addon.tags" :key="tag">{{
            tag
          }}</vscode-option>
        </vscode-dropdown>
        <vscode-button
          v-if="addon.hasUpdate"
          @click="update"
          :disabled="addon.processing"
        >
          Update
        </vscode-button>
        <vscode-button
          v-if="canBeEnabled"
          @click="enable"
          :disabled="addon.processing"
        >
          Enable
        </vscode-button>
        <vscode-button
          v-if="canBeDisabled"
          @click="disable"
          appearance="secondary"
          :disabled="addon.processing"
        >
          Disable
        </vscode-button>
        <vscode-button
          v-if="addon.installed"
          appearance="secondary"
          @click="uninstall"
          :disabled="addon.processing"
        >
          Uninstall
        </vscode-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Addon } from "@/types/addon";

import CodeIcon from "./CodeIcon.vue";

import { REPOSITORY_OWNER, REPOSITORY_NAME, ADDONS_DIRECTORY } from "@/config";
import { computed } from "vue";
import { formatBytes } from "@/services/format.service";
import { vscode } from "@/services/vscode.service";
import {
  vsCodeButton,
  provideVSCodeDesignSystem,
  vsCodeDropdown,
  vsCodeOption,
} from "@vscode/webview-ui-toolkit";
import { useAddonStore } from "@/stores/addonStore";

provideVSCodeDesignSystem().register(
  vsCodeButton(),
  vsCodeDropdown(),
  vsCodeOption()
);

const addonStore = useAddonStore();

const props = defineProps<{ addon: Addon }>();

const url = `https://github.com/${REPOSITORY_OWNER}/${REPOSITORY_NAME}/tree/main/${ADDONS_DIRECTORY}/${props.addon.name}`;

const description = computed(() => props.addon.description ?? "No description");
const size = computed(() =>
  props.addon.size ? formatBytes(props.addon.size) : "? B"
);
const canBeEnabled = computed(() =>
  props.addon.enabled?.some((v) => v === false)
);
const canBeDisabled = computed(() =>
  props.addon.enabled?.some((v) => v === true)
);

const lockAddon = () => {
  const addon = addonStore.getAddon(props.addon.name);

  if (!addon) {
    console.warn(`Could not lock "${props.addon.name}" addon during operation`);
    return;
  }

  addon.processing = true;
};

const open = () => {
  vscode.postMessage("open", { name: props.addon.name });
};
const update = () => {
  lockAddon();
  vscode.postMessage("update", { name: props.addon.name });
};
const enable = () => {
  lockAddon();
  vscode.postMessage("enable", { name: props.addon.name });
};
const disable = () => {
  lockAddon();
  vscode.postMessage("disable", { name: props.addon.name });
};
const uninstall = () => {
  lockAddon();
  vscode.postMessage("uninstall", { name: props.addon.name });
};
const versionChange = (e: Event) => {
  e.stopPropagation();
  const value = (e.target as HTMLInputElement).value;
  vscode.postMessage("setVersion", { name: props.addon.name, version: value });
};
</script>

<style lang="scss">
.addon {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: stretch;
  gap: 0.2rem;
  position: relative;
  background-color: var(--panel-view-background);
  padding: 0.5em 0.4em;
  border-radius: 0.2em;
  --input-min-width: 10em;

  .top {
    display: flex;
    flex-wrap: wrap;
    align-items: center;

    h1 {
      font-size: 2em;
      line-height: 1;
      margin: 0px 0.2em 0.2em 0px;
      width: fit-content;
      display: inline-block;

      a {
        display: inline-block;
        border-radius: 0.1em;
        padding: 0.1em;
        color: inherit;
        text-decoration: none;

        &:hover {
          background: rgba(90, 93, 94, 0.31);
        }
      }
    }

    span.badges {
      display: inline-flex;
      justify-content: space-around;
      gap: 0.3em;
      margin-left: 0.3em;
      font-size: 1.2em;

      span.badge {
        display: flex;
        align-items: center;
        gap: 0.4em;
        line-height: 1.2em;
      }

      span.codicon[class*="codicon-"] {
        font-size: 1em;
      }
    }
  }

  p.description {
    --lh: 1.3em;
    --lines: 2;
    margin: 0px;
    margin-bottom: 0.4em;
  }

  .controls {
    display: flex;
    gap: 0.7em;
    margin: 0.3em 0.1em 0px 0.1em;
  }

  .right {
    display: flex;
    flex-direction: column;
    flex: 1 0;
    align-items: flex-end;
    justify-content: space-between;

    .quick-actions {
      font-size: 1em;

      a.github-link {
        display: inline-block;
        padding: 3px;
        color: inherit;
        text-decoration: none;

        &:not(:only-child) {
          margin-left: 0.5em;
        }
      }
      span.codicon[class*="codicon-"] {
        font-size: 1.3em;
        vertical-align: middle;
      }
    }
  }

  .bottom {
    color: inherit;
    opacity: 0.8;
  }
}
</style>
