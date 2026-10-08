import Chance from "chance";
import type { LogLevelName } from "@westlane/pino-blanc/browser";
import type { DemoTabId } from "./tabs";

export type WineLineSample = {
  kind: "line";
  level: LogLevelName;
  module: string;
  msg: string;
  fields?: Record<string, unknown>;
};

export type WineEventSample = {
  kind: "event";
  module: string;
  name: string;
  fields: Record<string, unknown>;
};

export type WineSample = WineLineSample | WineEventSample;

type WineCatalogEntry = {
  name: string;
  region: string;
  skuPrefix: string;
};

const WINES: WineCatalogEntry[] = [
  { name: "Pinot Noir", region: "Willamette", skuPrefix: "PN" },
  { name: "Rioja Crianza", region: "Rioja", skuPrefix: "RJ" },
  { name: "Chablis", region: "Burgundy", skuPrefix: "CH" },
  { name: "Barolo", region: "Piedmont", skuPrefix: "BR" },
  { name: "Sancerre", region: "Loire", skuPrefix: "SC" },
  { name: "Garnacha", region: "Priorat", skuPrefix: "GN" },
];

const AISLES = ["Burgundy", "Bordeaux", "Rioja", "Willamette", "Champagne", "Tuscany"];
const PAIRINGS = [
  "roast chicken",
  "aged cheddar",
  "mushroom risotto",
  "grilled salmon",
  "dark chocolate",
  "charcuterie board",
];
const SHOP_MODULES = ["shop", "cart", "till", "cellar", "visit"] as const;
const EVENT_WEIGHT = 0.32;

const demoChance = new Chance();

type LineBuilder = (c: Chance) => WineLineSample;
type EventBuilder = (c: Chance) => WineEventSample;

function randomGuest(c: Chance): string {
  return c.pickone([c.first(), c.first({ nationality: "es" }), c.first({ nationality: "fr" })]);
}

function randomBottle(c: Chance): {
  wine: string;
  year: number;
  region: string;
  sku: string;
  price: number;
} {
  const entry = c.pickone(WINES);
  const year = c.integer({ min: 2015, max: 2023 });
  const yy = String(year).slice(-2);
  return {
    wine: entry.name,
    year,
    region: entry.region,
    sku: `${entry.skuPrefix}-${yy}`,
    price: c.floating({ min: 18, max: 72, fixed: 2 }),
  };
}

function randomHour(c: Chance): number {
  return c.integer({ min: 9, max: 21 });
}

const LINE_BUILDERS: LineBuilder[] = [
  (c) => ({
    kind: "line",
    level: "trace",
    module: "shop",
    msg: "doors.open",
    fields: { hour: randomHour(c) },
  }),
  (c) => ({
    kind: "line",
    level: "debug",
    module: "shop",
    msg: "shelf.scan",
    fields: { aisle: c.pickone(AISLES), shelf: c.letter({ casing: "upper" }) + c.integer({ min: 1, max: 12 }) },
  }),
  (c) => ({
    kind: "line",
    level: "info",
    module: "shop",
    msg: "guest.welcome",
    fields: { name: randomGuest(c), party: c.integer({ min: 1, max: 6 }) },
  }),
  (c) => {
    const bottle = randomBottle(c);
    return {
      kind: "line",
      level: "info",
      module: "cart",
      msg: "item.added",
      fields: { wine: bottle.wine, year: bottle.year, price: bottle.price },
    };
  },
  (c) => {
    const bottle = randomBottle(c);
    return {
      kind: "line",
      level: "debug",
      module: "cart",
      msg: "stock.low",
      fields: { sku: bottle.sku, left: c.integer({ min: 0, max: 5 }) },
    };
  },
  (c) => ({
    kind: "line",
    level: "warn",
    module: "cellar",
    msg: "temp.drift",
    fields: {
      celsius: c.floating({ min: 12.5, max: 16.5, fixed: 1 }),
      target: 13,
      zone: c.pickone(["sparkling", "reds", "whites"]),
    },
  }),
  (c) => ({
    kind: "line",
    level: "error",
    module: "till",
    msg: "card.declined",
    fields: {
      last4: c.string({ length: 4, pool: "0123456789" }),
      attempt: c.integer({ min: 1, max: 3 }),
      reason: c.pickone(["insufficient_funds", "expired", "cvv_mismatch"]),
    },
  }),
  (c) => {
    const total = c.floating({ min: 24, max: 180, fixed: 2 });
    const tip = c.floating({ min: 0, max: 24, fixed: 2 });
    return {
      kind: "line",
      level: "info",
      module: "till",
      msg: "card.approved",
      fields: { total, tip, currency: c.currency().code },
    };
  },
  (c) => ({
    kind: "line",
    level: c.pickone<LogLevelName>(["info", "debug"]),
    module: "shop",
    msg: "doors open",
    fields: { _emoji: "🚪", hour: randomHour(c) },
  }),
  (c) => ({
    kind: "line",
    level: "info",
    module: "shop",
    msg: "pouring taste",
    fields: { _emoji: "🍷", pours: c.integer({ min: 1, max: 5 }), guest: randomGuest(c) },
  }),
  (c) => {
    const bottle = randomBottle(c);
    return {
      kind: "line",
      level: "debug",
      module: "shop",
      msg: "stock low",
      fields: { _emoji: "📦", sku: bottle.sku, left: c.integer({ min: 0, max: 8 }) },
    };
  },
  (c) => ({
    kind: "line",
    level: "info",
    module: "shop",
    msg: "bag ready",
    fields: {
      _emoji: "🛍️",
      bottles: c.integer({ min: 1, max: 6 }),
      gift: c.bool({ likelihood: 35 }),
    },
  }),
  (c) => ({
    kind: "line",
    level: "info",
    module: "shop",
    msg: "cheers",
    fields: { _emoji: "🥂", guest: randomGuest(c), table: c.integer({ min: 1, max: 14 }) },
  }),
];

const EVENT_BUILDERS: EventBuilder[] = [
  (c) => ({
    kind: "event",
    module: "visit",
    name: "shop.open",
    fields: { _emoji: "🏪", city: c.city(), open: c.bool({ likelihood: 90 }) },
  }),
  (c) => ({
    kind: "event",
    module: "visit",
    name: "guest.arrived",
    fields: {
      _emoji: "👋",
      name: randomGuest(c),
      party: c.integer({ min: 1, max: 8 }),
      occasion: c.pickone(["dinner", "tasting", "gift", "anniversary"]),
    },
  }),
  (c) => {
    const bottle = randomBottle(c);
    return {
      kind: "event",
      module: "visit",
      name: "bottle.picked",
      fields: { _emoji: "🍷", wine: bottle.wine, year: bottle.year, region: bottle.region },
    };
  },
  (c) => ({
    kind: "event",
    module: "visit",
    name: "clerk.recommend",
    fields: {
      _emoji: "💬",
      pair: c.pickone(PAIRINGS),
      clerk: c.pickone(["sam", "jules", "marco", "priya"]),
    },
  }),
  (c) => {
    const total = c.floating({ min: 32, max: 220, fixed: 2 });
    const tip = c.floating({ min: 0, max: Math.min(32, total * 0.25), fixed: 2 });
    return {
      kind: "event",
      module: "visit",
      name: "checkout.paid",
      fields: { _emoji: "✅", total, tip, bottles: c.integer({ min: 1, max: 5 }) },
    };
  },
  (c) => ({
    kind: "event",
    module: c.pickone([...SHOP_MODULES]),
    name: "tasting.note",
    fields: {
      _emoji: "📝",
      note: c.sentence({ words: c.integer({ min: 4, max: 9 }) }),
      rating: c.integer({ min: 1, max: 5 }),
    },
  }),
];

export function pickRandomWineSample(rng: Chance = demoChance): WineSample {
  if (rng.floating({ min: 0, max: 1 }) < EVENT_WEIGHT) {
    return rng.pickone(EVENT_BUILDERS)(rng);
  }
  return rng.pickone(LINE_BUILDERS)(rng);
}

export function adapterFieldsForTab(tab: DemoTabId): Record<string, string> {
  switch (tab) {
    case "vanilla":
      return { surface: "browser" };
    case "react":
      return { via: "PBProvider" };
    case "vue":
      return { via: "pbPlugin" };
    case "svelte":
      return { via: "setPB" };
    default: {
      const _never: never = tab;
      return _never;
    }
  }
}
