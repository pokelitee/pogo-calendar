import { useEffect, useMemo, useState } from 'react';
import { ShadowChip, ShinyChip } from '../components/filters/shared';
import { CopyDexSearchButton } from '../components/shared/CopyDexSearchButton';
import { DataErrorDisplay } from '../components/shared/DataErrorDisplay';
import { DataImage } from '../components/shared/DataImage';
import { DataLoadingSkeleton } from '../components/shared/DataLoadingSkeleton';
import { NoResults } from '../components/shared/NoResults';
import { PageHeader } from '../components/shared/PageHeader';
import { SectionHeader } from '../components/shared/SectionHeader';
import { ViewModeToggle, type ViewMode } from '../components/shared/ViewModeToggle';
import { Alert } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Card, INTERACTIVE_CARD_CLASSNAME } from '../components/ui/card';
import { POKEMON_TYPE_COLORS, RAID_TIER_COLORS } from '../config/colorMapping';
import { usePageFiltersContext } from '../hooks/usePageFiltersContext';
import { usePageData } from '../hooks/usePageData';
import { fetchRaidBosses } from '../services/dataService';
import type { RaidBoss, RaidBossData } from '../types/raidBosses';
import { contrastColor } from '../utils/colorUtils';

function RaidBossesPage() {
  const { filters, setOptions } = usePageFiltersContext().raidBoss;
  const { data, loading, error, refetch } = usePageData<RaidBossData>(
    fetchRaidBosses,
    'Failed to load raid boss data. Please try again later.'
  );
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  useEffect(() => {
    if (data) {
      const raidTiers = Object.keys(data);
      const typesSet = new Set<string>();
      Object.values(data).forEach((bosses) => {
        bosses.forEach((boss) => {
          boss.types.forEach((type) => typesSet.add(type));
        });
      });
      const types = Array.from(typesSet).sort();
      setOptions({ raidTiers, types });
    }
  }, [data, setOptions]);

  const filteredData = useMemo(() => {
    if (!data) return null;

    const result: RaidBossData = {};

    Object.entries(data).forEach(([tier, bosses]) => {
      if (filters.selectedRaidTiers.length > 0 && !filters.selectedRaidTiers.includes(tier)) {
        return;
      }

      const filteredBosses = bosses.filter((boss) => {
        if (filters.pokemonSearch && !boss.name.toLowerCase().includes(filters.pokemonSearch.toLowerCase())) {
          return false;
        }
        if (filters.shinyOnly && !boss.shiny_available) {
          return false;
        }
        if (filters.shadowOnly && !boss.is_shadow) {
          return false;
        }
        if (filters.selectedTypes.length > 0) {
          const hasMatchingType = boss.types.some((type) => filters.selectedTypes.includes(type));
          if (!hasMatchingType) {
            return false;
          }
        }
        const cpFilterActive = filters.minCP > 0 || filters.maxCP < 60000;
        if (
          cpFilterActive &&
          (!boss.cp_range ||
            boss.cp_range.max < filters.minCP ||
            boss.cp_range.min > filters.maxCP)
        ) {
          return false;
        }
        return true;
      });

      if (filteredBosses.length > 0) {
        result[tier] = filteredBosses;
      }
    });

    return result;
  }, [data, filters]);

  if (loading) {
    return <DataLoadingSkeleton itemCount={8} gridSize={{ xs: 12, sm: 6, md: 4, lg: 3 }} />;
  }

  if (error || !data || !filteredData) {
    return <DataErrorDisplay title="Failed to Load Raid Boss Data" message={error || undefined} onRetry={refetch} />;
  }

  const renderRaidBossCard = (boss: RaidBoss) => (
    <Card
      key={boss.name}
      className={`flex h-full flex-col overflow-hidden ${INTERACTIVE_CARD_CLASSNAME}`}
    >
      <div className="flex h-36 items-center justify-center bg-muted p-4">
        <DataImage src={boss.asset_url} alt={boss.name} className="max-h-full max-w-full object-contain" />
      </div>
      <div className="flex-1 p-4">
        <p className="mb-2.5 text-center text-base font-semibold sm:text-lg">{boss.name}</p>

        <div className="flex flex-col gap-2.5">
          <div className="flex flex-wrap justify-center gap-1">
            {boss.types.map((type) => (
              <Badge
                key={type}
                size="sm"
                style={{
                  backgroundColor: POKEMON_TYPE_COLORS[type] || '#999',
                  color: contrastColor(POKEMON_TYPE_COLORS[type] || '#999'),
                }}
              >
                {type}
              </Badge>
            ))}
            {boss.is_shadow && <ShadowChip />}
            {boss.shiny_available && <ShinyChip />}
          </div>

          <div className="grid grid-cols-2 divide-x divide-border overflow-hidden rounded-md bg-muted">
            <div className="p-3">
              <p className="text-xs text-muted-foreground">Normal CP</p>
              <p className="text-sm font-semibold">
                {boss.cp_range
                  ? `${boss.cp_range.min.toLocaleString()} - ${boss.cp_range.max.toLocaleString()}`
                  : 'Unknown'}
              </p>
            </div>
            <div className="p-3">
              <p className="text-xs text-muted-foreground">Boosted CP</p>
              <p className="text-sm font-semibold">
                {boss.boosted_cp_range
                  ? `${boss.boosted_cp_range.min.toLocaleString()} - ${boss.boosted_cp_range.max.toLocaleString()}`
                  : 'Unknown'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  const renderRaidBossListItem = (boss: RaidBoss) => (
    <Card key={boss.name} className={`flex w-full items-center gap-3 p-3 ${INTERACTIVE_CARD_CLASSNAME}`}>
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
        <DataImage src={boss.asset_url} alt={boss.name} className="max-h-full max-w-full object-contain" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-1.5">
          <p className="text-sm font-semibold">{boss.name}</p>
          {boss.is_shadow && <ShadowChip />}
          {boss.shiny_available && <ShinyChip />}
        </div>
        <div className="flex flex-wrap gap-1">
          {boss.types.map((t) => (
            <Badge
              key={t}
              size="sm"
              style={{ backgroundColor: POKEMON_TYPE_COLORS[t], color: contrastColor(POKEMON_TYPE_COLORS[t] || '#999') }}
            >
              {t}
            </Badge>
          ))}
        </div>
      </div>
      <div className="hidden min-w-[100px] text-right sm:block">
        <p className="text-xs text-muted-foreground">CP Range</p>
        <p className="text-sm font-semibold">
          {boss.cp_range ? boss.cp_range.max.toLocaleString() : 'Unknown'}
        </p>
      </div>
    </Card>
  );

  return (
    <div>
      <PageHeader
        title="Raid Bosses"
        description="Current raid bosses available in Pokémon GO"
        actions={
          <div className="flex items-center gap-2">
            <CopyDexSearchButton pokemon={Object.values(filteredData).flat()} />
            <ViewModeToggle value={viewMode} onChange={setViewMode} />
          </div>
        }
      />

      <Alert variant="info" className="mb-6">
        CP ranges help you identify perfect IV catches. Weather boosted ranges indicate the Pokémon is
        level 25 instead of level 20.
      </Alert>

      {Object.keys(filteredData).length === 0 && <NoResults />}

      {Object.entries(filteredData).map(([tier, bosses]) => {
        if (!bosses || bosses.length === 0) return null;

        return (
          <div key={tier} className="mb-8">
            <SectionHeader
              title={tier}
              count={bosses.length}
              label={`Boss${bosses.length !== 1 ? 'es' : ''}`}
              color={RAID_TIER_COLORS[tier] || 'hsl(var(--primary))'}
            />

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {bosses.map((boss) => renderRaidBossCard(boss))}
              </div>
            ) : (
              <div className="flex flex-col gap-2">{bosses.map((boss) => renderRaidBossListItem(boss))}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default RaidBossesPage;
