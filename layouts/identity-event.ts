import type { LogLayoutPreset } from "./types.js";

/** Two-line event grid: identity chip left, JSON on row 2 under the event name. */
export const identityEventLayout: LogLayoutPreset = {
  id: "identity-event",
  description:
    "Row 1: identity + emoji + event name; row 2: blank identity slot + emoji slot + JSON meta",
  template: "%identity% %emoji%  %event%\n%identity% %emoji%  %meta%",
};
