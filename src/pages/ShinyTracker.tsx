import { useMemo, useState } from 'react';
import { DataLoadingSkeleton } from '../components/shared/DataLoadingSkeleton';
import { NoResults } from '../components/shared/NoResults';
import { PageHeader } from '../components/shared/PageHeader';
import { AvailabilityNotice } from '../components/tools/AvailabilityNotice';
import { PokemonAvailabilityCard } from '../components/tools/PokemonAvailabilityCard';
import { Input } from '../components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '../components/ui/toggle-group';
import { usePokemonAvailability } from '../hooks/usePokemonAvailability';
import {
  POKEMON_SOURCE_KIND_LABELS,
  getShinyAvailability,
  normalizeSearchText,
  type PokemonSourceKind,
} from '../utils/pokemonAvailability';

const SOURCE_KINDS = Object.keys(POKEMON_SOURCE_KIND_LABELS) as PokemonSourceKind[];

function ShinyTrackerPage() {
  const { entries, loading, failedSources, retry } = usePokemonAvailability();
  const [kinds, setKinds] = useState<PokemonSourceKind[]>([]);
  const [query, setQuery] = useState('');

  const shinies = useMemo(() => {
    const needle = normalizeSearchText(query);
    return getShinyAvailability(entries, new Set(kinds)).filter(
      (entry) => !needle || normalizeSearchText(entry.name).includes(needle)
    );
  }, [entries, kinds, query]);

  return (
    <div>
      <PageHeader
        title="Shinies Available Now"
        description="Every Pokémon you can currently find shiny, and where to get it."
      />

      <AvailabilityNotice failedSources={failedSources} onRetry={retry} />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          aria-label="Filter by Pokémon name"
          placeholder="Filter by name"
          className="sm:max-w-xs"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <ToggleGroup
          type="multiple"
          aria-label="Filter by source"
          className="flex-wrap"
          value={kinds}
          onValueChange={(value) => setKinds(value as PokemonSourceKind[])}
        >
          {SOURCE_KINDS.map((kind) => (
            <ToggleGroupItem key={kind} value={kind}>
              {POKEMON_SOURCE_KIND_LABELS[kind]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {loading ? (
        <DataLoadingSkeleton itemCount={6} gridSize={{ xs: 12, md: 6 }} />
      ) : shinies.length === 0 ? (
        <NoResults message="No shiny-eligible Pokémon match these filters." />
      ) : (
        <>
          <p className="mb-3 text-sm text-muted-foreground">{shinies.length} shiny-eligible Pokémon</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {shinies.map((entry) => (
              <PokemonAvailabilityCard key={entry.name} entry={entry} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ShinyTrackerPage;
