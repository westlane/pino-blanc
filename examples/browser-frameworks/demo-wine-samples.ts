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

/** Which sample pool a tab draws from (paired with layout in demo-logger-options). */
type DemoSampleMode = "lines" | "emoji-lines" | "events";

const TAB_SAMPLE_MODE: Record<DemoTabId, DemoSampleMode> = {
  vanilla: "events",
  react: "events",
  vue: "emoji-lines",
  svelte: "lines",
};

const demoChance = new Chance();

type LineBuilder = (c: Chance) => WineLineSample;
type EventBuilder = (c: Chance) => WineEventSample;

function randomGuest(c: Chance): string {
  // Chance firstNames: en | it | nl | fr only
  return c.pickone([
    c.first(),
    c.first({ nationality: "it" }),
    c.first({ nationality: "fr" }),
  ]);
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

/** Level / module / message lines (no emoji column). */
const STRUCTURED_LINE_BUILDERS: LineBuilder[] = [
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
];

/** Lines that carry `_emoji` for text layouts with a `%mj%` column. */
const EMOJI_LINE_BUILDERS: LineBuilder[] = [
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

function identityFields(
  kind: string,
  body: string,
  tintKey?: string,
): Record<string, unknown> {
  const trimmed = body.trim();
  return {
    _identityKind: kind,
    _identityBody: trimmed,
    _identityTintKey: tintKey ?? `${kind}:${trimmed}`,
    _identityChrome: "fill",
  };
}

const EVENT_BUILDERS: EventBuilder[] = [
  (c) => {
    const city = c.city();
    return {
      kind: "event",
      module: "visit",
      name: "shop.open",
      fields: {
        _emoji: "🏪",
        ...identityFields("shop", city),
        city,
        open: c.bool({ likelihood: 90 }),
      },
    };
  },
  (c) => {
    const name = randomGuest(c);
    return {
      kind: "event",
      module: "visit",
      name: "guest.arrived",
      fields: {
        _emoji: "👋",
        ...identityFields("guest", name),
        name,
        party: c.integer({ min: 1, max: 8 }),
        occasion: c.pickone(["dinner", "tasting", "gift", "anniversary"]),
      },
    };
  },
  (c) => {
    const bottle = randomBottle(c);
    return {
      kind: "event",
      module: "visit",
      name: "bottle.picked",
      fields: {
        _emoji: "🍷",
        ...identityFields("sku", bottle.sku),
        wine: bottle.wine,
        year: bottle.year,
        region: bottle.region,
      },
    };
  },
  (c) => {
    const clerk = c.pickone(["sam", "jules", "marco", "priya"]);
    return {
      kind: "event",
      module: "visit",
      name: "clerk.recommend",
      fields: {
        _emoji: "💬",
        ...identityFields("clerk", clerk),
        pair: c.pickone(PAIRINGS),
        clerk,
      },
    };
  },
  (c) => {
    const total = c.floating({ min: 32, max: 220, fixed: 2 });
    const tip = c.floating({ min: 0, max: Math.min(32, total * 0.25), fixed: 2 });
    return {
      kind: "event",
      module: "visit",
      name: "checkout.paid",
      fields: {
        _emoji: "✅",
        ...identityFields("till", `$${total.toFixed(0)}`),
        total,
        tip,
        bottles: c.integer({ min: 1, max: 5 }),
      },
    };
  },
  (c) => {
    const module = c.pickone([...SHOP_MODULES]);
    return {
      kind: "event",
      module,
      name: "tasting.note",
      fields: {
        _emoji: "📝",
        ...identityFields("note", module),
        note: c.sentence({ words: c.integer({ min: 4, max: 9 }) }),
        rating: c.integer({ min: 1, max: 5 }),
      },
    };
  },
];

/** Staggered delays (ms) for a tab-activate log burst; first entry is always 0. */
export function demoLogBurstSchedule(rng: Chance = demoChance): number[] {
  const count = rng.integer({ min: 3, max: 6 });
  const schedule = [0];
  for (let i = 1; i < count; i++) {
    schedule.push(rng.integer({ min: 85, max: 340 }));
  }
  return schedule;
}

export function pickRandomWineSample(tab: DemoTabId, rng: Chance = demoChance): WineSample {
  const mode = TAB_SAMPLE_MODE[tab];
  switch (mode) {
    case "lines":
      return rng.pickone(STRUCTURED_LINE_BUILDERS)(rng);
    case "emoji-lines":
      return rng.pickone(EMOJI_LINE_BUILDERS)(rng);
    case "events":
      return rng.pickone(EVENT_BUILDERS)(rng);
    default: {
      const _never: never = mode;
      return _never;
    }
  }
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
