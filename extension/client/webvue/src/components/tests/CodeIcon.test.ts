import { describe, it, expect } from "vitest";

import { mount } from "@vue/test-utils";
import CodeIcon from "../CodeIcon.vue";

describe("CodeIcon", () => {
  it("renders properly", () => {
    const wrapper = mount(CodeIcon, { props: { icon: "refresh" } });
    expect(wrapper.exists());
    expect(wrapper.classes()).toEqual(["codicon", "codicon-refresh"]);
  });
});
