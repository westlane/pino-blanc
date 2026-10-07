export type LayoutData = {
  default: string;
  text: Record<string, string>;
  event: Record<string, string>;
  columns: {
    box: {
      width: number;
      minInner: number;
      pad: number;
      ellipsis: number;
    };
    hashShift: number;
  };
};

export type LogLayoutPreset = {
  id: string;
  description: string;
  template: string;
};
