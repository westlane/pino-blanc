// Generated from config/layout.yml — browser/publish fallback.
// Node reloads config/layout.yml on mtime change (see layout-store.ts).
import type { LayoutData } from "../types/layout.js";

export const layoutData: LayoutData = {
  "text": {
    "default": "[%lv%  ]  [----%md%----] [%ms% ----------------------] [%mt%]",
    "complex": "[%lv%  ]  [%mj%][%ms% -----------------------------][------------- %md%]\n[------]  [----][%mt%]"
  },
  "event": {
    "default": "[%mj%] [%ev% -----------------------] [%mt%]",
    "complex": "[%id% -------------------]  [%mj%][%ev% -----------------------]\n[%id% -------------------]  [----][%mt%]"
  },
  "box": {
    "default": {
      "width": 48,
      "minInner": 48,
      "pad": 48,
      "bands": [
        "------------------------------------------------",
        "------------------- %title% --------------------",
        "------------------------------------------------"
      ]
    },
    "complex": {
      "width": 48,
      "minInner": 48,
      "pad": 48,
      "bands": [
        "------------------------------------------------",
        "-------- %title% %version% - %lv% level --------",
        "------------------------------------------------",
        "------------------------------------------------",
        "------------------ %subtitle% ------------------",
        "------------------------------------------------"
      ]
    }
  },
  "tint": {
    "multiplier": 31
  }
};

/** Active box preset (`box.default`) — metrics for formatBoxLine. */
export const box = layoutData.box.default;
export const tint = layoutData.tint;
