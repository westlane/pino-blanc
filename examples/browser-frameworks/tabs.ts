export type DemoTabId = "vanilla" | "react" | "vue" | "svelte";

const TAB_HASH: Record<DemoTabId, string> = {
  vanilla: "vanilla",
  react: "react",
  vue: "vue",
  svelte: "svelte",
};

const HASH_ALIASES: Record<string, DemoTabId> = {
  vanilla: "vanilla",
  react: "react",
  vue: "vue",
  vu: "vue",
  svelte: "svelte",
};

export function tabHash(id: DemoTabId): string {
  return TAB_HASH[id];
}

export function parseTabFromHash(): DemoTabId | null {
  const raw = location.hash.replace(/^#/, "").trim().toLowerCase();
  if (!raw) {
    return null;
  }
  return HASH_ALIASES[raw] ?? null;
}

export type DemoTabActivate = (id: DemoTabId) => void;

export function initDemoTabs(options: {
  defaultTab?: DemoTabId;
  onActivate?: DemoTabActivate;
}): void {
  const defaultTab = options.defaultTab ?? "vanilla";
  const tablist = document.querySelector<HTMLElement>('[role="tablist"]');
  if (!tablist) {
    return;
  }

  const tabs = [...tablist.querySelectorAll<HTMLButtonElement>('[role="tab"][data-tab]')];
  const panels = [...document.querySelectorAll<HTMLElement>('[role="tabpanel"][data-panel]')];

  const selectUi = (id: DemoTabId): void => {
    for (const tab of tabs) {
      const active = tab.dataset.tab === id;
      tab.setAttribute("aria-selected", active ? "true" : "false");
      tab.tabIndex = active ? 0 : -1;
    }
    for (const panel of panels) {
      const active = panel.dataset.panel === id;
      panel.hidden = !active;
    }
  };

  const resolveTab = (): DemoTabId => parseTabFromHash() ?? defaultTab;

  const activate = (id: DemoTabId): void => {
    selectUi(id);
    options.onActivate?.(id);
  };

  for (const tab of tabs) {
    tab.addEventListener("click", () => {
      const id = tab.dataset.tab as DemoTabId | undefined;
      if (!id) {
        return;
      }
      const hash = `#${tabHash(id)}`;
      if (location.hash === hash) {
        activate(id);
        return;
      }
      location.hash = tabHash(id);
    });
  }

  window.addEventListener("hashchange", () => {
    activate(resolveTab());
  });

  const initialHash = parseTabFromHash();
  if (initialHash) {
    selectUi(initialHash);
    options.onActivate?.(initialHash);
  } else {
    selectUi(defaultTab);
  }
}
