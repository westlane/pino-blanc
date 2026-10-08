export type BoxLayoutPreset = {
  width: number;
  minInner: number;
  pad: number;
  /** Inner text of each `[…]` band (title, optional subtitle). */
  bands: string[];
};

export type LayoutData = {
  text: Record<string, string>;
  event: Record<string, string>;
  box: Record<string, BoxLayoutPreset>;
  tint: {
    multiplier: number;
  };
};

export type LogLayoutPreset = {
  id: string;
  description: string;
  template: string;
};
