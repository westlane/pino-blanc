// Generated from config/layout.yml — do not edit.
import type { LayoutData } from "../types/layout.js";

export const layoutData: LayoutData = {
  "default": "module-right",
  "text": {
    "module-right": "%level% %emoji%  %message% %module:right%",
    "module-first": "%level% %module% %message%"
  },
  "event": {
    "identity-meta": "%identity% %emoji%  %event%\n%identity% %emoji%  %meta%"
  },
  "columns": {
    "levelWidth": 6,
    "moduleWidth": 18,
    "messageWidth": 34,
    "event": {
      "emojiWidth": 4,
      "eventNameWidth": 28,
      "identityWidth": 28,
      "identityToContentGap": "  "
    },
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
