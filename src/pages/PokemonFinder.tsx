import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DataLoadingSkeleton } from '../components/shared/DataLoadingSkeleton';
import { NoResults } from '../components/shared/NoResults';
import { PageHeader } from '../components/shared/PageHeader';
import { AvailabilityNotice } from '../components/tools/AvailabilityNotice';
import { PokemonAvailabilityCard } from '../components/tools/PokemonAvailabilityCard';
import { Input } from '../components/ui/input';
import { usePokemonAvailability } from '../hooks/usePokemonAvailability';
import { searchPokemonAvailability } from '../utils/pokemonAvailability';

function PokemonFinderPage() {
  const { entries, loading, failedSources, retry } = usePokemonAvailability();
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchPokemonAvailability(entries, query), [entries, query]);

  return (
    <div>
      <PageHeader
        title="Pokémon Finder"
        description="Find every current way to get a Pokémon: events, raids, eggs, research, and Team GO Rocket."
      />

      <AvailabilityNotice failedSources={failedSources} onRetry={retry} />

      <div className="relative mb-6 max-w-xl">
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

      {loading ? (
        <DataLoadingSkeleton itemCount={4} gridSize={{ xs: 12, md: 6 }} />
      ) : !query.trim() ? (
        <p className="text-sm text-muted-foreground">
          {entries.length} Pokémon are available from current and upcoming sources.
        </p>
      ) : results.length === 0 ? (
        <NoResults
          title="Not Available Right Now"
          message="No current or upcoming event, raid, egg, research task, or Rocket encounter offers that Pokémon."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {results.map((entry) => (
            <PokemonAvailabilityCard key={entry.name} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}

export default PokemonFinderPage;
