<template>
  <div id="browse">
    <div class="controls">
      <vscode-text-field
        type="search"
        name="search"
        autofocus="true"
        id="search"
        placeholder="Search"
        @input="search"
      >
        <!-- eslint-disable-next-line vue/no-deprecated-slot-attribute -->
        <CodeIcon slot="start" icon="search" />
      </vscode-text-field>
      <vscode-checkbox @change="(e: Event) => updateFilter(e, 'enabled')">
        Enabled
      </vscode-checkbox>
      <vscode-checkbox @change="(e: Event) => updateFilter(e, 'installed')"
        >Installed</vscode-checkbox
      >
      <button class="refresh" :disabled="addonStore.loading" @click="refresh">
        <CodeIcon icon="refresh" />
      </button>
    </div>
    <div v-if="addons.length === 0">
      <h2 class="text-center">Nothing to show 🕳️</h2>
    </div>
    <div v-else class="addons" :class="skipTransition ? 'noAnimate' : ''">
      <TransitionGroup name="fade">
        <Addon
          v-for="(addon, index) of addons"
          :key="addon.name"
          :addon="addon"
          :style="`--duration: ${(addons.length - index) / addons.length / 3}s
          ;--reverse-duration: ${(index + 1) / addons.length / 3}s`"
        />
      </TransitionGroup>
    </div>
    <vscode-progress-ring
      v-if="
        addonStore.loading ||
        (addonStore.addons?.length ?? 0) < (addonStore.total ?? 0)
      "
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useAddonStore } from "@/stores/addonStore";
import CodeIcon from "@/components/CodeIcon.vue";
import Addon from "@/components/Addon.vue";

import {
  provideVSCodeDesignSystem,
  vsCodeCheckbox,
  vsCodeProgressRing,
  vsCodeTextField,
} from "@vscode/webview-ui-toolkit";

provideVSCodeDesignSystem().register(
  vsCodeProgressRing(),
  vsCodeTextField(),
  vsCodeCheckbox()
);

const addonStore = useAddonStore();

const addons = computed(() => {
  const addons = addonStore.sortedByName;

  const filtered = addons.filter((addon) => {
    if (filters.value.installed && !addon.installed) return false;
    if (filters.value.enabled && !(addon.enabled ?? []).some((a) => a))
      return false;
    if (filters.value.regex) {
      const rgx = new RegExp(
        `.*${filters.value.regex.split("").join(".*")}.*`,
        "gi"
      );
      if (!rgx.test(addon.displayName ?? addon.name) && !rgx.test(addon.name))
        return false;
    }
    return true;
  });

  return filtered;
});
type FilterOptions = "enabled" | "installed";
const filters = ref({ enabled: false, installed: false, regex: "" });

const updateFilter = (e: Event, filter: FilterOptions) => {
  skipTransition.value = false;
  filters.value[filter] = (e.target as HTMLInputElement).checked;
};

const refresh = () => {
  if (addonStore.loading) return;
  addonStore.addons = [];
  addonStore.refresh();
};

const skipTransition = ref(false);
const search = (e: Event) => {
  skipTransition.value = true;

  const element = e.target as HTMLInputElement;
  let value = element.value;
  filters.value.regex = value.trim();
};

onMounted(() => addonStore.getPage());
</script>

<style scoped lang="scss">
#browse {
  width: 100%;
  margin-bottom: 2rem;

  > .controls {
    position: sticky;
    top: 0px;
    background: var(--vscode-activityBar-border);
    z-index: 5;
    display: flex;
    justify-content: space-between;
    padding: 0.3rem;
    margin: 0px 0.2rem 0.5rem 0.2rem;
    gap: 0.2rem;

    .refresh:disabled {
      opacity: 0.3;
    }

    .refresh span {
      vertical-align: middle;
    }
  }

  > vscode-progress-ring {
    transform: translateX(-50%);
    position: relative;
    left: 50%;
  }

  .addons {
    display: flex;
    flex-direction: column;
    gap: 0.4em;
    margin: 0px 0.5em;

    &:not(.noAnimate) {
      .fade-enter-active {
        transition: all var(--reverse-duration) ease-in-out;
      }
      .fade-leave-active {
        transition: all var(--duration) ease-in-out;
      }
      .fade-enter-from,
      .fade-leave-to {
        opacity: 0;
        transform: translate(-100%);
      }
      .fade-enter-to,
      .fade-leave-from {
        opacity: 1;
        transform: translate(0%);
      }
    }
  }

  #addon-list-count {
    margin: 0.5em auto 0px auto;
    text-align: center;
    color: inherit;
    font-size: 0.9em;
    opacity: 0.8;
  }
}
</style>
