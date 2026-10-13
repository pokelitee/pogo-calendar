import { Check } from 'lucide-react';
import { useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CopyButton } from '../components/shared/CopyButton';
import { DataImage } from '../components/shared/DataImage';
import { PageHeader } from '../components/shared/PageHeader';
import { TypeBadge } from '../components/shared/TypeBadge';
import { AvailabilityNotice } from '../components/tools/AvailabilityNotice';
import { Card } from '../components/ui/card';
import { Chip } from '../components/ui/chip';
import { Skeleton } from '../components/ui/skeleton';
import { POKEMON_TYPE_COLORS } from '../config/colorMapping';
import { GAME_DATA_PAGES } from '../config/gameData';
import { usePageData } from '../hooks/usePageData';
import { cn } from '../lib/utils';
import { fetchRaidBosses } from '../services/dataService';
import type { RaidBoss } from '../types/raidBosses';
import {
  IMMUNE_MULTIPLIER,
  NOT_VERY_EFFECTIVE_MULTIPLIER,
  POKEMON_TYPES,
  SUPER_EFFECTIVE_MULTIPLIER,
  buildCounterSearches,
  formatMultiplier,
  getDefensiveMatchups,
  getWeaknesses,
  isPokemonType,
  MAX_DEFENDING_TYPES,
  parseTypeList,
  roundMultiplier,
  type PokemonType,
} from '../utils/typeMatchups';

const MULTIPLIER_LABELS: Record<number, string> = {
  [roundMultiplier(SUPER_EFFECTIVE_MULTIPLIER ** 2)]: 'Double weakness',
  [SUPER_EFFECTIVE_MULTIPLIER]: 'Weak',
  1: 'Neutral',
  [NOT_VERY_EFFECTIVE_MULTIPLIER]: 'Resists',
  [IMMUNE_MULTIPLIER]: 'Double resist',
  [roundMultiplier(IMMUNE_MULTIPLIER * NOT_VERY_EFFECTIVE_MULTIPLIER)]: 'Triple resist',
};

function TypeMatchupsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const typesParam = searchParams.get('types');
  const defending = useMemo(() => parseTypeList(typesParam), [typesParam]);
  const bossName = searchParams.get('boss');
  const raidBosses = usePageData(fetchRaidBosses, 'Raid bosses could not be loaded.');
  const resultsRef = useRef<HTMLDivElement>(null);

  const bosses = useMemo(() => Object.values(raidBosses.data ?? {}).flat(), [raidBosses.data]);
  const matchups = useMemo(() => (defending.length > 0 ? getDefensiveMatchups(defending) : []), [defending]);
  const weaknesses = useMemo(() => getWeaknesses(defending), [defending]);
  const counterSearches = buildCounterSearches(weaknesses);

  const select = (types: PokemonType[], boss?: string) => {
    const next = new URLSearchParams();
    if (types.length > 0) next.set('types', types.join(','));
    if (boss) next.set('boss', boss);
    setSearchParams(next, { replace: true });
    // On narrow screens the results sit below the pickers; bring them into view.
    // The desktop results card is sticky near the top, so it never scrolls.
    requestAnimationFrame(() => {
      const card = resultsRef.current;
      if (!card) return;
      const { top } = card.getBoundingClientRect();
      if (top < 0 || top > window.innerHeight / 2) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const toggleType = (type: PokemonType) => {
    if (defending.includes(type)) {
      select(defending.filter((selected) => selected !== type));
    } else {
      // Picking a third type replaces the oldest selection.
      select([...defending, type].slice(-MAX_DEFENDING_TYPES));
    }
  };

  const selectBoss = (boss: RaidBoss) => select(boss.types.filter(isPokemonType), boss.name);

  return (
    <div>
      <PageHeader
        title="Type Matchups"
        description="See what a raid boss or type combination is weak to, then copy a search for counters in your storage"
      />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <Card className="p-4">
            <h2 className="mb-1 text-base font-semibold">Current Raid Bosses</h2>
            <p className="mb-3 text-sm text-muted-foreground">Pick a boss to use its types.</p>
            {raidBosses.loading ? (
              <Skeleton className="h-24 w-full" />
            ) : raidBosses.error ? (
              <AvailabilityNotice
                failedSources={[GAME_DATA_PAGES.raid.title]}
                onRetry={raidBosses.refetch}
                className="mb-0"
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {bosses.map((boss) => {
                  const active = bossName === boss.name;
                  return (
                    <Chip
                      key={`${boss.tier}-${boss.name}`}
                      aria-pressed={active}
                      onClick={() => selectBoss(boss)}
                      state={active ? 'selected' : 'off'}
                      className="pl-1"
                    >
                      <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-muted">
                        <DataImage src={boss.asset_url} alt="" className="max-h-full max-w-full object-contain" />
                      </span>
                      {boss.name}
                    </Chip>
                  );
                })}
              </div>
            )}
          </Card>

          <Card className="p-4">
            <h2 className="mb-1 text-base font-semibold">Defending Types</h2>
            <p className="mb-3 text-sm text-muted-foreground">Or pick up to two types.</p>
            <div className="flex flex-wrap gap-2">
              {POKEMON_TYPES.map((type) => {
                const active = defending.includes(type);
                return (
                  <Chip
                    key={type}
                    aria-pressed={active}
                    onClick={() => toggleType(type)}
                    className={cn('border-2 font-semibold', active && 'text-foreground')}
                    style={
                      active
                        ? { borderColor: POKEMON_TYPE_COLORS[type], backgroundColor: `${POKEMON_TYPE_COLORS[type]}33` }
                        : undefined
                    }
                  >
                    {active && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                    {type}
                  </Chip>
                );
              })}
            </div>
          </Card>
        </div>

        <Card ref={resultsRef} className="flex scroll-mt-20 flex-col gap-4 p-4 lg:sticky lg:top-20">
          {defending.length === 0 ? (
            <p className="text-sm text-muted-foreground">Pick a raid boss or a type to see its matchups.</p>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold">{bossName ?? 'Selected Types'}</h2>
                {defending.map((type) => (
                  <TypeBadge key={type} type={type} />
                ))}
              </div>

              <dl className="flex flex-col gap-3">
                {matchups.map(({ multiplier, types }) => (
                  <div key={multiplier} className="grid grid-cols-[8.5rem_1fr] items-start gap-2">
                    <dt className="text-sm">
                      <span className="font-semibold">{MULTIPLIER_LABELS[multiplier] ?? 'Damage'}</span>{' '}
                      <span className="text-muted-foreground">{formatMultiplier(multiplier)}</span>
                    </dt>
                    <dd className="flex flex-wrap gap-1">
                      {types.map((type) => (
                        <TypeBadge key={type} type={type} />
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>

              {weaknesses.length > 0 && (
                <div className="flex flex-col gap-3 border-t border-border pt-4">
                  <div>
                    <h3 className="text-sm font-semibold">Find Counters in Your Storage</h3>
                    <p className="text-xs text-muted-foreground">
                      English search keywords; set the game to English to use them.
                    </p>
                  </div>
                  {[
                    { label: 'Any move of a weakness type', value: counterSearches.anyMove },
                    { label: 'Fast and charged moves of a weakness type', value: counterSearches.fastAndCharged },
                  ].map((search) => (
                    <div key={search.label} className="space-y-1.5">
                      <p className="text-xs font-medium text-muted-foreground">{search.label}</p>
                      <div className="flex items-start gap-2">
                        <code className="flex-1 break-all rounded-md bg-muted p-2 font-mono text-xs">{search.value}</code>
                        <CopyButton value={search.value} variant="outline" size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

export default TypeMatchupsPage;
