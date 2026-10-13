import { formatDistanceToNowStrict } from 'date-fns';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataErrorDisplay } from '../components/shared/DataErrorDisplay';
import { DataLoadingSkeleton } from '../components/shared/DataLoadingSkeleton';
import { NoResults } from '../components/shared/NoResults';
import { PageHeader } from '../components/shared/PageHeader';
import { Card } from '../components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '../components/ui/toggle-group';
import { ROUTES } from '../config/routes';
import { useEventDataContext } from '../hooks/useEventDataContext';
import { useNow } from '../hooks/useNow';
import { useSettingsContext } from '../hooks/useSettingsContext';
import type { CalendarEvent } from '../types/events';
import { BONUS_CATEGORY_LABELS, categorizeBonus, type BonusCategory } from '../utils/bonuses';
import { formatDateLine } from '../utils/dateUtils';
import { getCurrentEvents, type EventTiming, type TimedEvent } from '../utils/eventTimeUtils';

interface BonusEntry {
  bonus: string;
  category: BonusCategory;
  timed: TimedEvent;
}

const CATEGORY_ORDER = Object.keys(BONUS_CATEGORY_LABELS) as BonusCategory[];

const TIMING_SECTIONS: { timing: EventTiming; title: string }[] = [
  { timing: 'active', title: 'Active Now' },
  { timing: 'upcoming', title: 'Upcoming' },
];

// Active bonuses that end soonest come first; upcoming ones by start time.
const sortTime = ({ timing, start, end }: TimedEvent) =>
  (timing === 'active' ? end : (start ?? end)).getTime();

function groupByCategory(entries: BonusEntry[]): [BonusCategory, BonusEntry[]][] {
  return CATEGORY_ORDER.map(
    (category) => [category, entries.filter((entry) => entry.category === category)] as [BonusCategory, BonusEntry[]]
  ).filter(([, items]) => items.length > 0);
}

function BonusTrackerPage() {
  const { allEvents, loading, error, refetchEvents, setSelectedEvent } = useEventDataContext();
  const { settings } = useSettingsContext();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<BonusCategory[]>([]);
  const now = useNow();

  const entries = useMemo(
    () =>
      getCurrentEvents(allEvents, now)
        .flatMap((timed) =>
          (timed.event.extendedProps.bonuses ?? []).map((bonus) => ({
            bonus,
            category: categorizeBonus(bonus),
            timed,
          }))
        )
        .sort((a, b) => sortTime(a.timed) - sortTime(b.timed)),
    [allEvents, now]
  );

  const availableCategories = CATEGORY_ORDER.filter((category) =>
    entries.some((entry) => entry.category === category)
  );
  const visible = entries.filter((entry) => categories.length === 0 || categories.includes(entry.category));

  const openEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    navigate(ROUTES.CALENDAR);
  };

  const describeTiming = ({ timing, start, end, event }: TimedEvent) =>
    timing === 'active'
      ? `Ends in ${formatDistanceToNowStrict(end)} · ${formatDateLine(event.end, settings.hour12)}`
      : `Starts in ${formatDistanceToNowStrict(start ?? end)} · ${formatDateLine(event.start, settings.hour12)}`;

  if (loading) return <DataLoadingSkeleton itemCount={6} gridSize={{ xs: 12, md: 6 }} />;

  if (error) {
    return (
      <DataErrorDisplay
        title="Failed to Load Events"
        message={error}
        onRetry={() => void refetchEvents().catch(() => undefined)}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Bonus Tracker"
        description="Event bonuses active now and coming up, grouped by what they boost."
      />

      {availableCategories.length > 1 && (
        <ToggleGroup
          type="multiple"
          aria-label="Filter by bonus type"
          className="mb-6 flex-wrap"
          value={categories}
          onValueChange={(value) => setCategories(value as BonusCategory[])}
        >
          {availableCategories.map((category) => (
            <ToggleGroupItem key={category} value={category}>
              {BONUS_CATEGORY_LABELS[category]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      )}

      {visible.length === 0 && (
        <NoResults title="No Bonuses" message="No current or upcoming event bonuses match these filters." />
      )}

      {TIMING_SECTIONS.map(({ timing, title }) => {
        const groups = groupByCategory(visible.filter((entry) => entry.timed.timing === timing));
        if (groups.length === 0) return null;
        return (
          <section key={timing} className="mb-8">
            <h2 className="mb-3 text-xl font-bold">{title}</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {groups.map(([category, items]) => (
                <Card key={category} className="p-4">
                  <h3 className="mb-3 text-base font-semibold">{BONUS_CATEGORY_LABELS[category]}</h3>
                  <ul className="flex flex-col gap-3">
                    {items.map(({ bonus, timed }) => (
                      <li key={`${timed.event.extendedProps.article_url}-${bonus}`} className="text-sm">
                        <p className="font-medium">{bonus}</p>
                        <p className="text-xs text-muted-foreground">
                          <button
                            type="button"
                            onClick={() => openEvent(timed.event)}
                            className="font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {timed.event.title}
                          </button>{' '}
                          · {describeTiming(timed)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default BonusTrackerPage;
