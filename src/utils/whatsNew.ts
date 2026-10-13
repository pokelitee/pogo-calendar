import type { EggPoolData } from '../types/eggPool';
import type { CalendarEvent } from '../types/events';
import type { RaidBossData } from '../types/raidBosses';
import type { ResearchTaskData } from '../types/researchTasks';
import type { RocketLineupData } from '../types/rocketLineup';

export type NewsKind = 'event' | 'raid' | 'egg' | 'research' | 'rocket';

export const NEWS_KINDS: NewsKind[] = ['event', 'raid', 'egg', 'research', 'rocket'];

export interface NewsItem {
  kind: NewsKind;
  // Stable identity used to decide whether the item was seen before.
  id: string;
  title: string;
  detail?: string;
  assetUrl?: string | null;
  event?: CalendarEvent;
}

export type NewsItems = Partial<Record<NewsKind, NewsItem[]>>;

// Item ids per kind, as of the last time the trainer marked news as seen.
export type SeenSnapshot = Partial<Record<NewsKind, string[]>>;

export interface NewsData {
  // Data sets that failed or are still loading are null and left out.
  events: CalendarEvent[] | null;
  raidBosses: RaidBossData | null;
  eggPool: EggPoolData | null;
  researchTasks: ResearchTaskData | null;
  rocketLineups: RocketLineupData | null;
}

/**
 * Lists every current item for each data set that loaded.
 */
export function collectNewsItems(data: NewsData): NewsItems {
  const items: NewsItems = {};

  if (data.events) {
    items.event = data.events.map((event) => ({
      kind: 'event',
      id: event.extendedProps.article_url,
      title: event.title,
      detail: event.extendedProps.category,
      event,
    }));
  }

  if (data.raidBosses) {
    items.raid = Object.entries(data.raidBosses).flatMap(([tier, bosses]) =>
      bosses.map((boss) => ({
        kind: 'raid' as const,
        id: `${tier}|${boss.name}`,
        title: boss.name,
        detail: tier,
        assetUrl: boss.asset_url,
      }))
    );
  }

  if (data.eggPool) {
    items.egg = Object.entries(data.eggPool).flatMap(([eggType, hatches]) =>
      hatches.map((hatch) => ({
        kind: 'egg' as const,
        id: `${eggType}|${hatch.name}`,
        title: hatch.name,
        detail: eggType,
        assetUrl: hatch.asset_url,
      }))
    );
  }

  if (data.researchTasks) {
    items.research = Object.values(data.researchTasks).flatMap((tasks) =>
      tasks.map((task) => {
        const rewards = task.rewards.map((reward) => reward.name).join(', ');
        return { kind: 'research' as const, id: `${task.task}|${rewards}`, title: task.task, detail: rewards };
      })
    );
  }

  if (data.rocketLineups) {
    items.rocket = Object.entries(data.rocketLineups).map(([member, slots]) => {
      const lineup = slots
        .map((slot) => `Slot ${slot.slot}: ${slot.pokemons.map((pokemon) => pokemon.name).join(', ')}`)
        .join(' · ');
      // A changed lineup counts as new, so the id covers every slot.
      return { kind: 'rocket' as const, id: `${member}|${lineup}`, title: member, detail: lineup };
    });
  }

  return items;
}

/**
 * Returns the items not in the snapshot. Kinds the snapshot has never
 * recorded have no baseline, so none of their items count as new.
 */
export function findNewItems(items: NewsItems, seen: SeenSnapshot): NewsItem[] {
  return NEWS_KINDS.flatMap((kind) => {
    const seenIds = seen[kind];
    if (!seenIds) return [];
    const known = new Set(seenIds);
    return (items[kind] ?? []).filter((item) => !known.has(item.id));
  });
}

/**
 * Records the current items as seen. Kinds that did not load keep their
 * previous snapshot so a failed request never hides news.
 */
export function updateSnapshot(previous: SeenSnapshot, items: NewsItems): SeenSnapshot {
  const next: SeenSnapshot = { ...previous };
  NEWS_KINDS.forEach((kind) => {
    const current = items[kind];
    if (current) next[kind] = current.map((item) => item.id);
  });
  return next;
}
