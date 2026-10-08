import {
  blendHexWithBlack,
  blendHexWithWhite,
  chromeColors,
  readableForeground,
  resolveTheme,
  themeSurfaceHex,
} from "@westlane/pino-blanc/browser";
import { DEMO_TAB_THEMES } from "./demo-logger-options";
import type { DemoTabId } from "./tabs";

type PageChromeVars = {
  pageBg: string;
  headerBg: string;
  sidebarBg: string;
  pageFg: string;
  pageFgMuted: string;
  tabIdleFg: string;
  tabHoverBg: string;
  tabHoverFg: string;
  focusRing: string;
};

function pagePrefersDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolvePageChrome(themeId: string): PageChromeVars {
  const theme = resolveTheme(themeId);
  const surface = themeSurfaceHex(theme);
  const accent = theme.roles?.accent ?? theme.levels.info;
  const moduleRole = theme.roles?.module ?? accent;
  const metaRole = theme.roles?.meta ?? moduleRole;
  const messageRole = theme.roles?.message ?? "#eceff4";

  if (pagePrefersDark()) {
    const pageBg = blendHexWithBlack(surface, 0.52);
    const headerBg = blendHexWithWhite(surface, 0.1);
    const sidebarBg = blendHexWithBlack(surface, 0.18);
    const tabHoverBg = blendHexWithWhite(surface, 0.1);
    return {
      pageBg,
      headerBg,
      sidebarBg,
      pageFg: readableForeground(pageBg, messageRole),
      pageFgMuted: readableForeground(pageBg, metaRole),
      tabIdleFg: readableForeground(sidebarBg, moduleRole),
      tabHoverBg,
      tabHoverFg: readableForeground(tabHoverBg, messageRole),
      focusRing: accent,
    };
  }

  const faint = chromeColors(surface, "faint", theme).background;
  const fill = chromeColors(surface, "fill", theme).background;
  const tabHoverBg = chromeColors(surface, "fill", theme).background;
  const ink = "#1a1a2e";
  return {
    pageBg: faint,
    headerBg: fill,
    sidebarBg: faint,
    pageFg: readableForeground(faint, ink),
    pageFgMuted: readableForeground(faint, metaRole),
    tabIdleFg: readableForeground(faint, moduleRole),
    tabHoverBg,
    tabHoverFg: readableForeground(tabHoverBg, ink),
    focusRing: accent,
  };
}

function applyTabThemeVars(tab: HTMLElement, themeId: string): void {
  const theme = resolveTheme(themeId);
  const bg = themeSurfaceHex(theme);
  const fg = theme.roles?.message ?? "#f8f8f2";

  tab.style.setProperty("--tab-bg", bg);
  tab.style.setProperty("--tab-fg", fg);
  tab.title = themeId
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function paintPageChrome(activeTab: DemoTabId): void {
  const themeId = DEMO_TAB_THEMES[activeTab];
  const chrome = resolvePageChrome(themeId);
  const root = document.documentElement;

  root.style.setProperty("--page-bg", chrome.pageBg);
  root.style.setProperty("--header-bg", chrome.headerBg);
  root.style.setProperty("--tablist-bg", chrome.sidebarBg);
  root.style.setProperty("--page-fg", chrome.pageFg);
  root.style.setProperty("--page-fg-muted", chrome.pageFgMuted);
  root.style.setProperty("--tab-idle-fg", chrome.tabIdleFg);
  root.style.setProperty("--tab-hover-bg", chrome.tabHoverBg);
  root.style.setProperty("--tab-hover-fg", chrome.tabHoverFg);
  root.style.setProperty("--focus-ring", chrome.focusRing);
  root.style.colorScheme = pagePrefersDark() ? "dark" : "light";
}

let activeTab: DemoTabId = "vanilla";

export function setDemoSidebarTab(id: DemoTabId): void {
  activeTab = id;
  paintPageChrome(id);
}

export function initDemoTabChrome(initialTab: DemoTabId = "vanilla"): void {
  activeTab = initialTab;
  const tabs = document.querySelectorAll<HTMLElement>('[role="tab"][data-tab]');
  for (const tab of tabs) {
    const id = tab.dataset.tab as DemoTabId | undefined;
    if (!id) {
      continue;
    }
    applyTabThemeVars(tab, DEMO_TAB_THEMES[id]);
  }

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    paintPageChrome(activeTab);
  });

  paintPageChrome(activeTab);
}
