import { defineStore } from "pinia";
import { vscode } from "@/services/vscode.service";
import type { Addon } from "@/types/addon";

export type AddonStore = {
  loading: boolean;
  addons: Addon[];
  page: number;
  total: number | null;
};

export const useAddonStore = defineStore("addons", {
  state: (): AddonStore => ({
    loading: true,
    addons: [],
    page: 1,
    total: null,
  }),
  getters: {
    sortedByName(state): Addon[] {
      return [...state.addons].sort((a, b) => {
        if (a.hasUpdate) return -1;
        const aName = a.displayName ?? a.name;
        const bName = b.displayName ?? b.name;

        return (
          Number(b.enabled?.some((a) => a)) -
          Number(a.enabled?.some((a) => a)) +
          Number(b.installed) -
          Number(a.installed) +
          aName.localeCompare(bName) * 0.9
        );
      });
    },
  },
  actions: {
    getPage() {
      vscode.postMessage("getAddons", {
        page: this.page,
      });
      this.page++;
    },
    refresh() {
      this.page = 1;
      vscode.postMessage("refreshAddons");
      this.getPage();
    },
    getAddon(name: string) {
      return this.addons.find((addon) => addon.name === name);
    },
  },
});
