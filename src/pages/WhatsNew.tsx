import { CheckCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { DataImage } from '../components/shared/DataImage';
import { DataLoadingSkeleton } from '../components/shared/DataLoadingSkeleton';
import { NoResults } from '../components/shared/NoResults';
import { PageHeader } from '../components/shared/PageHeader';
import { AvailabilityNotice } from '../components/tools/AvailabilityNotice';
import { Alert } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { SEEN_NEWS_KEY } from '../config/constants';
import { GAME_DATA_PAGES } from '../config/gameData';
import { useGameData } from '../hooks/useGameData';
import { useOpenEventOnCalendar } from '../hooks/useOpenEventOnCalendar';
import { safeGetJSON, safeSetJSON } from '../utils/storageUtils';
import {
  NEWS_KINDS,
  addMissingBaselines,
  collectNewsItems,
  findNewItems,
  updateSnapshot,
  type NewsItem,
  type SeenSnapshot,
} from '../utils/whatsNew';

// Only string arrays for known kinds are kept, so malformed storage reads as
// a first visit instead of breaking the page.
function readSeenSnapshot(): SeenSnapshot | null {
  const stored = safeGetJSON<Record<string, unknown> | null>(SEEN_NEWS_KEY, null);
  if (!stored || typeof stored !== 'object') return null;
  const snapshot: SeenSnapshot = {};
  NEWS_KINDS.forEach((kind) => {
    const ids = stored[kind];
    if (Array.isArray(ids)) snapshot[kind] = ids.filter((id): id is string => typeof id === 'string');
  });
  return snapshot;
}

function WhatsNewPage() {
  const { currentEvents, raidBosses, eggPool, researchTasks, rocketLineups, loading, failedSources, retry } =
    useGameData();
  const openEvent = useOpenEventOnCalendar();
  const [seen, setSeen] = useState<SeenSnapshot | null>(readSeenSnapshot);
  const [firstVisit] = useState(() => seen === null);

  const items = useMemo(
    () =>
      collectNewsItems({
        events: currentEvents?.map(({ event }) => event) ?? null,
        raidBosses,
        eggPool,
        researchTasks,
        rocketLineups,
      }),
    [currentEvents, raidBosses, eggPool, researchTasks, rocketLineups]
  );

  const markAllSeen = () => setSeen((previous) => updateSnapshot(previous ?? {}, items));

  // Record a baseline for anything that has none yet, so later visits have
  // something to compare: everything on the first visit, and any data set
  // that failed on an earlier visit once it loads.
  useEffect(() => {
    if (!loading) setSeen((previous) => addMissingBaselines(previous ?? {}, items));
  }, [loading, items]);

  useEffect(() => {
    if (seen) safeSetJSON(SEEN_NEWS_KEY, seen);
  }, [seen]);

  const newItems = useMemo(
    () => (seen && !firstVisit ? findNewItems(items, seen) : []),
    [items, seen, firstVisit]
  );
  const groups = NEWS_KINDS.map((kind) => [kind, newItems.filter((item) => item.kind === kind)] as const).filter(
    ([, kindItems]) => kindItems.length > 0
  );

  const renderItem = (item: NewsItem) => (
    <li key={item.id} className="flex items-center gap-3 text-sm">
      {item.assetUrl !== undefined && (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
          <DataImage src={item.assetUrl} alt={item.title} className="max-h-full max-w-full object-contain" />
        </span>
      )}
      <span className="min-w-0">
        {item.event ? (
          <button
            type="button"
            onClick={() => openEvent(item.event!)}
            className="text-left font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {item.title}
          </button>
        ) : (
          <span className="font-medium">{item.title}</span>
        )}
        {item.detail && <span className="block text-xs text-muted-foreground">{item.detail}</span>}
      </span>
    </li>
  );

  return (
    <div>
      <PageHeader
        title="What's New"
        description="Events, raid bosses, eggs, research, and Rocket lineups that appeared since you last checked."
        actions={
          newItems.length > 0 && (
            <Button variant="outline" onClick={markAllSeen}>
              <CheckCheck />
              Mark all as seen
            </Button>
          )
        }
      />

      <AvailabilityNotice failedSources={failedSources} onRetry={retry} />

      {loading ? (
        <DataLoadingSkeleton itemCount={4} gridSize={{ xs: 12, md: 6 }} />
      ) : firstVisit ? (
        <Alert variant="info">
          This is your first visit, so everything current is now your starting point. Come back later to see what
          changed. Your progress is saved in this browser.
        </Alert>
      ) : groups.length === 0 ? (
        <NoResults title="You're All Caught Up" message="Nothing new since you last marked news as seen." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {groups.map(([kind, kindItems]) => (
            <Card key={kind} className="p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-base font-semibold">
                  {GAME_DATA_PAGES[kind].title}
                  <Badge size="sm">{kindItems.length} new</Badge>
                </h2>
                <RouterLink
                  to={GAME_DATA_PAGES[kind].path}
                  className="text-xs font-semibold text-primary no-underline hover:underline"
                >
                  View all →
                </RouterLink>
              </div>
              <ul className="flex flex-col gap-2.5">{kindItems.map(renderItem)}</ul>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default WhatsNewPage;
