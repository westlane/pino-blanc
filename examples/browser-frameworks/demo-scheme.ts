const STORAGE_KEY = "pino-blanc-demo-scheme";

export type DemoColorScheme = "light" | "dark";

type SchemeListener = (scheme: DemoColorScheme) => void;

const listeners = new Set<SchemeListener>();

function readStoredScheme(): DemoColorScheme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

let schemeOverride: DemoColorScheme | null = readStoredScheme();

export function resolveDemoColorScheme(): DemoColorScheme {
  if (schemeOverride) {
    return schemeOverride;
  }
  return "dark";
}

export function pagePrefersDark(): boolean {
  return resolveDemoColorScheme() === "dark";
}

export function setDemoColorScheme(scheme: DemoColorScheme): void {
  schemeOverride = scheme;
  try {
    localStorage.setItem(STORAGE_KEY, scheme);
  } catch {
    // Ignore quota / private-mode failures; in-memory override still applies.
  }
  document.documentElement.dataset.scheme = scheme;
  for (const listener of listeners) {
    listener(scheme);
  }
}

export function onDemoColorSchemeChange(listener: SchemeListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function syncSchemeButtons(scheme: DemoColorScheme): void {
  const buttons = document.querySelectorAll<HTMLButtonElement>(
    ".demo-scheme-toggle[data-scheme]",
  );
  for (const button of buttons) {
    const target = button.dataset.scheme;
    const pressed = target === scheme;
    button.setAttribute("aria-pressed", pressed ? "true" : "false");
  }
}

export function initDemoSchemeToggle(): void {
  const scheme = resolveDemoColorScheme();
  document.documentElement.dataset.scheme = scheme;

  const buttons = [
    ...document.querySelectorAll<HTMLButtonElement>(".demo-scheme-toggle[data-scheme]"),
  ];
  if (buttons.length === 0) {
    return;
  }

  syncSchemeButtons(scheme);

  for (const button of buttons) {
    button.addEventListener("click", () => {
      const target = button.dataset.scheme;
      if (target !== "light" && target !== "dark") {
        return;
      }
      if (target === resolveDemoColorScheme()) {
        return;
      }
      setDemoColorScheme(target);
    });
  }

  onDemoColorSchemeChange((next) => {
    syncSchemeButtons(next);
  });
}
