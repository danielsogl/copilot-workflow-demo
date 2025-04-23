import { noDependencies, sameTag, SheriffConfig } from "@softarc/sheriff-core";

export const config: SheriffConfig = {
  enableBarrelLess: true,
  modules: {
    "src/app/<domain>/<type>": ["domain:<domain>", "type:<type>"],
  },
  depRules: {
    root: ["*"],
    "domain:*": [sameTag, "domain:shared"],
    "type:feature": ["type:ui", "type:data", "type:util"],
    "type:ui": ["type:data", "type:util"],
    "type:data": ["type:util"],
    "type:util": noDependencies,
  },
};
