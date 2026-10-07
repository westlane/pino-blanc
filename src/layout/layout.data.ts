// Generated from config/layout.yml — do not edit.
import type { LayoutData } from "../types/layout.js";

export const layoutData: LayoutData = {
  "default": "module-right",
  "text": {
    "module-right": "%level:6% %emoji:4%  %message:34% %module:18%",
    "module-first": "%level:6% %module:18% %message%"
  },
  "event": {
    "identity-meta": "%identity:28% %emoji:4%  %event:28%\n%identity:28% %emoji:4%  %meta%"
  },
  "columns": {
    "box": {
      "width": 80,
      "minInner": 20,
      "pad": 4,
      "ellipsis": 3
    },
    "hashShift": 5
  }
};

export const spec = layoutData.columns;
