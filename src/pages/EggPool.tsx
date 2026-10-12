import { useEffect, useMemo, useState } from 'react';
import { ShinyChip } from '../components/filters/shared';
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
import { EGG_COLORS, RARITY_TIERS } from '../config/colorMapping';
import { usePageFiltersContext } from '../hooks/usePageFiltersContext';
import { usePageData } from '../hooks/usePageData';
import { fetchEggPool } from '../services/dataService';
import type { EggPokemon, EggPoolData } from '../types/eggPool';
import { contrastColor } from '../utils/colorUtils';

function EggPoolPage() {
  const { filters, setOptions } = usePageFiltersContext().eggPool;
  const { data, loading, error, refetch } = usePageData<EggPoolData>(
    fetchEggPool,
    'Failed to load egg pool data. Please try again later.'
  );
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  useEffect(() => {
    if (data) {
      const eggTiers = Object.keys(data);
      const rarityTiers = Object.values(RARITY_TIERS).map((tier) => tier.label);
      setOptions({ eggTiers, rarityTiers });
    }
  }, [data, setOptions]);

  const filteredData = useMemo(() => {
    if (!data) return null;

    const result: EggPoolData = {};

    Object.entries(data).forEach(([tier, pokemon]) => {
      if (filters.selectedEggTiers.length > 0 && !filters.selectedEggTiers.includes(tier)) {
        return;
      }

      const filteredPokemon = pokemon.filter((p) => {
        if (filters.pokemonSearch && !p.name.toLowerCase().includes(filters.pokemonSearch.toLowerCase())) {
          return false;
        }
        if (filters.shinyOnly && !p.shiny_available) {
          return false;
        }
        if (filters.selectedRarityTiers.length > 0) {
          const rarityLabel = p.rarity_tier
            ? RARITY_TIERS[p.rarity_tier]?.label
            : undefined;
          if (!rarityLabel || !filters.selectedRarityTiers.includes(rarityLabel)) {
            return false;
          }
        }
        return true;
      });

      if (filteredPokemon.length > 0) {
        result[tier] = filteredPokemon;
      }
    });

    return result;
  }, [data, filters]);

  if (loading) {
    return <DataLoadingSkeleton itemCount={8} gridSize={{ xs: 6, sm: 4, md: 3, lg: 2 }} />;
  }

  if (error || !data || !filteredData) {
    return <DataErrorDisplay title="Failed to Load Egg Pool Data" message={error || undefined} onRetry={refetch} />;
  }

  const renderPokemonCard = (pokemon: EggPokemon) => (
    <Card
      key={pokemon.name}
      className={`flex h-full flex-col overflow-hidden ${INTERACTIVE_CARD_CLASSNAME}`}
    >
      <div className="flex h-32 items-center justify-center bg-muted p-4">
        <DataImage src={pokemon.asset_url} alt={pokemon.name} className="max-h-full max-w-full object-contain" />
      </div>
      <div className="flex-1 p-3 pt-2 text-center">
        <p className="mb-1.5 text-sm font-semibold sm:text-base">{pokemon.name}</p>
        <div className="flex flex-wrap justify-center gap-1">
          {pokemon.shiny_available && <ShinyChip />}
          <Badge
            size="sm"
            style={{
              backgroundColor:
                (pokemon.rarity_tier
                  ? RARITY_TIERS[pokemon.rarity_tier]?.color
                  : undefined) || '#999',
              color: contrastColor(
                (pokemon.rarity_tier
                  ? RARITY_TIERS[pokemon.rarity_tier]?.color
                  : undefined) || '#999'
              ),
            }}
          >
            {(pokemon.rarity_tier
              ? RARITY_TIERS[pokemon.rarity_tier]?.label
              : undefined) || 'Unknown'}
          </Badge>
        </div>
      </div>
    </Card>
  );

  const renderPokemonListItem = (pokemon: EggPokemon) => (
    <Card key={pokemon.name} className={`flex w-full items-center gap-3 p-3 ${INTERACTIVE_CARD_CLASSNAME}`}>
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
        <DataImage src={pokemon.asset_url} alt={pokemon.name} className="max-h-full max-w-full object-contain" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <p className="text-sm font-semibold">{pokemon.name}</p>
          {pokemon.shiny_available && <ShinyChip />}
        </div>
      </div>
      <Badge
        size="sm"
        className="min-w-20 justify-center"
        style={{
          backgroundColor:
            (pokemon.rarity_tier
              ? RARITY_TIERS[pokemon.rarity_tier]?.color
              : undefined) || '#999',
          color: contrastColor(
            (pokemon.rarity_tier
              ? RARITY_TIERS[pokemon.rarity_tier]?.color
              : undefined) || '#999'
          ),
        }}
      >
        {(pokemon.rarity_tier
          ? RARITY_TIERS[pokemon.rarity_tier]?.label
          : undefined) || 'Unknown'}
      </Badge>
    </Card>
  );

  return (
    <div>
      <PageHeader
        title="Egg Pool"
        description="Current Pokémon available from different egg types"
        actions={
          <div className="flex items-center gap-2">
            <CopyDexSearchButton pokemon={Object.values(filteredData).flat()} />
            <ViewModeToggle value={viewMode} onChange={setViewMode} />
          </div>
        }
      />

      <Alert variant="info" className="mb-6">
        Egg contents are updated regularly based on current in-game events. Rarity tiers indicate the
        relative hatch chance.
      </Alert>

      {Object.keys(filteredData).length === 0 && <NoResults />}

      {Object.entries(filteredData).map(([tier, pokemon]) => {
        if (!pokemon || pokemon.length === 0) return null;

        return (
          <div key={tier} className="mb-8">
            <SectionHeader
              title={tier}
              count={pokemon.length}
              label="Pokémon"
              color={EGG_COLORS[tier] || 'hsl(var(--primary))'}
            />

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {pokemon.map((p) => renderPokemonCard(p))}
              </div>
            ) : (
              <div className="flex flex-col gap-2">{pokemon.map((p) => renderPokemonListItem(p))}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default EggPoolPage;
