import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CopyDexSearchButton } from '../components/shared/CopyDexSearchButton';
import { DataLoadingSkeleton } from '../components/shared/DataLoadingSkeleton';
import { NoResults } from '../components/shared/NoResults';
import { PageHeader } from '../components/shared/PageHeader';
import { AvailabilityNotice } from '../components/tools/AvailabilityNotice';
import { PokemonAvailabilityCard } from '../components/tools/PokemonAvailabilityCard';
import { Checkbox } from '../components/ui/checkbox';
import { Input } from '../components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '../components/ui/toggle-group';
import { useCollection } from '../hooks/useCollection';
import { usePokemonAvailability } from '../hooks/usePokemonAvailability';
import {
  POKEMON_SOURCE_KIND_LABELS,
  filterPokemonAvailability,
  type PokemonSourceKind,
} from '../utils/pokemonAvailability';

const SOURCE_KINDS = Object.keys(POKEMON_SOURCE_KIND_LABELS) as PokemonSourceKind[];

function PokemonFinderPage() {
  const { entries, loading, failedSources, retry } = usePokemonAvailability();
  const [query, setQuery] = useState('');
  const [kinds, setKinds] = useState<PokemonSourceKind[]>([]);
  const [shinyOnly, setShinyOnly] = useState(false);
  const [hideCaught, setHideCaught] = useState(false);
  const { has: isInCollection, toggle: toggleCollection } = useCollection();
  // When hunting shinies, "caught" means the shiny has been caught.
  const caughtList = shinyOnly ? 'shiny' : 'registered';

  const results = useMemo(
    () =>
      filterPokemonAvailability(entries, { query, kinds: new Set(kinds), shinyOnly }).filter(
        (entry) => !hideCaught || !isInCollection(caughtList, entry.name)
      ),
    [entries, query, kinds, shinyOnly, hideCaught, isInCollection, caughtList]
  );

  return (
    <div>
      <PageHeader
        title="Pokémon Finder"
        description="Every Pokémon you can get right now or soon, and where: events, raids, eggs, research, and Team GO Rocket."
      />

      <AvailabilityNotice failedSources={failedSources} onRetry={retry} />

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative lg:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Pokémon name"
            placeholder="Search for a Pokémon, e.g. Zorua"
            className="pl-9"
            value={query}
            autoFocus
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <ToggleGroup
          type="multiple"
          aria-label="Filter by source"
          className="flex-wrap self-start"
          value={kinds}
          onValueChange={(value) => setKinds(value as PokemonSourceKind[])}
        >
          {SOURCE_KINDS.map((kind) => (
            <ToggleGroupItem key={kind} value={kind}>
              {POKEMON_SOURCE_KIND_LABELS[kind]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <label className="flex items-center gap-2.5 text-sm">
          <Checkbox checked={shinyOnly} onCheckedChange={(checked) => setShinyOnly(checked === true)} />
          Shiny available only
        </label>
        <label className="flex items-center gap-2.5 text-sm">
          <Checkbox checked={hideCaught} onCheckedChange={(checked) => setHideCaught(checked === true)} />
          {shinyOnly ? 'Hide shinies I’ve caught' : 'Hide Pokémon I’ve caught'}
        </label>
      </div>

      {loading ? (
        <DataLoadingSkeleton itemCount={6} gridSize={{ xs: 12, md: 6 }} />
      ) : results.length === 0 ? (
        <NoResults
          title="Not Available Right Now"
          message="No current or upcoming event, raid, egg, research task, or Rocket encounter matches these filters."
        />
      ) : (
        <>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">{results.length} Pokémon</p>
            <CopyDexSearchButton
              pokemon={results.map((entry) => ({ asset_url: entry.assetUrl, dexNumber: entry.dexNumber }))}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {results.map((entry) => (
              <PokemonAvailabilityCard
                key={entry.name}
                entry={entry}
                caught={isInCollection('registered', entry.name)}
                shinyCaught={isInCollection('shiny', entry.name)}
                onToggleCollection={(list) => toggleCollection(list, entry.name)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default PokemonFinderPage;
