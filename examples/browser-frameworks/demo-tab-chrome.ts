import {
  blendHexWithBlack,
  blendHexWithWhite,
  chromeColors,
  readableForeground,
  resolveTheme,
  themeSurfaceHex,
} from "@westlane/pino-blanc/browser";
import { DEMO_TAB_THEMES, demoThemeForTab } from "./demo-logger-options";
import { onDemoColorSchemeChange, pagePrefersDark } from "./demo-scheme";
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
  cardShadow: string;
};

const CARD_SHADOW_LIGHT =
  "0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.08), 0 24px 56px rgba(15, 23, 42, 0.12)";
const CARD_SHADOW_DARK =
  "0 1px 2px rgba(0, 0, 0, 0.2), 0 10px 28px rgba(0, 0, 0, 0.35), 0 28px 64px rgba(0, 0, 0, 0.45)";

function resolvePageChrome(themeId: string): PageChromeVars {
  const theme = resolveTheme(themeId);
  const surface = themeSurfaceHex(theme);
  const accent = theme.roles?.accent ?? theme.levels.info;
  const moduleRole = theme.roles?.module ?? accent;
  const metaRole = theme.roles?.meta ?? moduleRole;
  const messageRole = theme.roles?.message ?? "#eceff4";

  if (pagePrefersDark()) {
    const pageBg = blendHexWithBlack(surface, 0.52);
    // Match page surround so header/sidebar read as continuous night chrome.
    const headerBg = pageBg;
    const sidebarBg = pageBg;
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
      cardShadow: CARD_SHADOW_DARK,
    };
  }

  const fill = chromeColors(surface, "fill", theme);
  const ink = "#1a1a2e";
  // Light: soft washes — keep theme hint without saturating the plate.
  const pageBg = blendHexWithWhite(surface, 0.82);
  const headerBg = blendHexWithWhite(surface, 0.68);
  const sidebarBg = "#ffffff";
  const tabHoverBg = fill.background;
  return {
    pageBg,
    headerBg,
    sidebarBg,
    pageFg: readableForeground(headerBg, ink),
    pageFgMuted: readableForeground(headerBg, metaRole),
    tabIdleFg: readableForeground(sidebarBg, moduleRole),
    tabHoverBg,
    tabHoverFg: readableForeground(tabHoverBg, ink),
    focusRing: accent,
    cardShadow: CARD_SHADOW_LIGHT,
  };
}

function applyTabThemeVars(tab: HTMLElement, tabId: DemoTabId): void {
  const dark = pagePrefersDark();
  const selectedThemeId = demoThemeForTab(tabId);
  const selectedTheme = resolveTheme(selectedThemeId);
  const selectedSurface = themeSurfaceHex(selectedTheme);

  // Distinct per-tab tint from the dark identity palette; wash strength
  // follows the page scheme so idle tabs stay dark in dark mode.
  const identityTheme = resolveTheme(DEMO_TAB_THEMES[tabId].dark);
  const identitySurface = themeSurfaceHex(identityTheme);
  const identityAccent =
    identityTheme.roles?.accent ?? identityTheme.levels.info ?? identitySurface;
  const identityMessage =
    identityTheme.roles?.message ?? identityTheme.roles?.module ?? "#ebdbb2";

  let idleBg: string;
  let idleFg: string;
  let hoverBg: string;
  let hoverFg: string;
  if (dark) {
    idleBg = blendHexWithWhite(identitySurface, 0.1);
    hoverBg = blendHexWithWhite(identitySurface, 0.2);
    idleFg = readableForeground(idleBg, identityMessage);
    hoverFg = readableForeground(hoverBg, identityMessage);
  } else {
    const idle = chromeColors(identityAccent, "faint", identityTheme);
    const hover = chromeColors(identityAccent, "fill", identityTheme);
    idleBg = idle.background;
    idleFg = idle.foreground;
    hoverBg = hover.background;
    hoverFg = hover.foreground;
  }

  // Dark: theme on the selected pill. Light: shell is theme; pill is glass.
  const pillBg = dark ? selectedSurface : "#ffffff";
  const pillFg = readableForeground(
    pillBg,
    selectedTheme.roles?.message ?? (dark ? "#f8f8f2" : "#1a1a2e"),
  );

  tab.style.setProperty("--tab-bg", pillBg);
  tab.style.setProperty("--tab-fg", pillFg);
  tab.style.setProperty("--tab-idle-bg", idleBg);
  tab.style.setProperty("--tab-idle-fg", idleFg);
  tab.style.setProperty("--tab-hover-bg-local", hoverBg);
  tab.style.setProperty("--tab-hover-fg-local", hoverFg);
  tab.title = selectedThemeId
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function paintAllTabThemeVars(): void {
  const tabs = document.querySelectorAll<HTMLElement>('[role="tab"][data-tab]');
  for (const tab of tabs) {
    const id = tab.dataset.tab as DemoTabId | undefined;
    if (!id) {
      continue;
    }
    applyTabThemeVars(tab, id);
  }
}

function paintPageChrome(nextTab: DemoTabId): void {
  const themeId = demoThemeForTab(nextTab);
  const theme = resolveTheme(themeId);
  const chrome = resolvePageChrome(themeId);
  const root = document.documentElement;
  const dark = pagePrefersDark();

  root.style.setProperty("--page-bg", chrome.pageBg);
  root.style.setProperty("--header-bg", chrome.headerBg);
  root.style.setProperty("--tablist-bg", chrome.sidebarBg);
  // Panel frost source: raw theme in dark; tamed card plate in light.
  root.style.setProperty(
    "--theme-surface",
    dark ? themeSurfaceHex(theme) : chrome.headerBg,
  );
  root.style.setProperty("--page-fg", chrome.pageFg);
  root.style.setProperty("--page-fg-muted", chrome.pageFgMuted);
  root.style.setProperty("--tab-idle-fg", chrome.tabIdleFg);
  root.style.setProperty("--tab-hover-bg", chrome.tabHoverBg);
  root.style.setProperty("--tab-hover-fg", chrome.tabHoverFg);
  root.style.setProperty("--focus-ring", chrome.focusRing);
  root.style.setProperty("--card-shadow", chrome.cardShadow);
  root.style.colorScheme = dark ? "dark" : "light";
  root.dataset.scheme = dark ? "dark" : "light";
  paintAllTabThemeVars();
}

let activeTab: DemoTabId = "vanilla";

export function setDemoSidebarTab(id: DemoTabId): void {
  activeTab = id;
  paintPageChrome(id);
}

export function initDemoTabChrome(initialTab: DemoTabId = "vanilla"): void {
  activeTab = initialTab;

  onDemoColorSchemeChange(() => {
    paintPageChrome(activeTab);
  });

  paintPageChrome(activeTab);
}
