import { useAddonStore } from "@/stores/addonStore";
import type { Addon } from "@/types/addon";

type Message = {
  data: {
    addons: Addon[];
  };
};

/** Receives a `LocalAddon` or array of `LocalAddon`s. Updates the
 * `localAddonsStore` state to contain the new addons. If the store already
 * contains an addon with the same name, it will be overwritten.
 * @param message The message from VS Code
 * */
export default (message: Message) => {
  const addonStore = useAddonStore();

  const addons = Array.isArray(message.data.addons)
    ? message.data.addons
    : [message.data.addons];

  addonStore.$patch((state) => {
    for (const newAddon of addons) {
      const index = state.addons.findIndex(
        (addon) => addon.name === newAddon.name
      );

      if (index > -1) {
        Object.assign(state.addons[index], newAddon);
      } else {
        state.addons.push(newAddon);
      }
    }
  });
};
