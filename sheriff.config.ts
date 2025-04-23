import { SheriffConfig } from "@softarc/sheriff-core";

/**
 * Minimal configuration for Sheriff
 * Assigns the 'noTag' tag to all modules and
 * allows all modules to depend on each other.
 */

export const config: SheriffConfig = {
  modules: {}, // apply tags to your modules
  depRules: {
    // root is a virtual module, which contains all files not being part
    // of any module, e.g. application shell, main.ts, etc.
    root: "noTag",
    noTag: "noTag",

    // add your dependency rules here
  },
};
