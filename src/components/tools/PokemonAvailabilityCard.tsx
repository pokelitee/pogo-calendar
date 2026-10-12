import { Link as RouterLink } from 'react-router-dom';
import { ROUTES } from '../../config/routes';
import type { PokemonAvailability, PokemonSource, PokemonSourceKind } from '../../utils/pokemonAvailability';
import { getPokemonFieldTitle } from '../../utils/eventDetailUtils';
import { DataImage } from '../shared/DataImage';
import { ShinyIndicator } from '../shared/ShinyIndicator';
import { ShinyChip } from '../filters/shared';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';

const SOURCE_KIND_DETAILS: Record<PokemonSourceKind, { label: string; path: string }> = {
  event: { label: 'Event', path: ROUTES.CALENDAR },
  raid: { label: 'Raid', path: ROUTES.RAID_BOSSES },
  egg: { label: 'Egg', path: ROUTES.EGG_POOL },
  research: { label: 'Research', path: ROUTES.RESEARCH_TASKS },
  rocket: { label: 'Rocket', path: ROUTES.ROCKET_LINEUP },
};

function SourceRow({ source }: { source: PokemonSource }) {
  const kind = SOURCE_KIND_DETAILS[source.kind];
  return (
    <li className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
      <RouterLink to={kind.path} className="no-underline">
        <Badge variant="outline" size="sm">
          {kind.label}
        </Badge>
      </RouterLink>
      <span className="min-w-0">
        {source.group}
        {source.detail && <span className="text-muted-foreground"> · {getPokemonFieldTitle(source.detail)}</span>}
      </span>
      {source.timing === 'upcoming' && (
        <Badge variant="secondary" size="sm">
          Upcoming
        </Badge>
      )}
      {source.shiny && <ShinyIndicator />}
    </li>
  );
}

interface PokemonAvailabilityCardProps {
  entry: PokemonAvailability;
  sources?: PokemonSource[];
}

/**
 * Shows a Pokémon and where it can be obtained. Pass `sources` to show a
 * subset, such as only the shiny-eligible ones.
 */
export function PokemonAvailabilityCard({ entry, sources = entry.sources }: PokemonAvailabilityCardProps) {
  return (
    <Card className="flex gap-4 p-4">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
        <DataImage src={entry.assetUrl} alt={entry.name} className="max-h-full max-w-full object-contain" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h2 className="text-base font-semibold">{entry.name}</h2>
          {entry.dexNumber !== null && (
            <span className="text-xs text-muted-foreground">#{entry.dexNumber}</span>
          )}
          {sources.some((source) => source.shiny) && <ShinyChip />}
        </div>
        <ul className="flex flex-col gap-1.5">
          {sources.map((source, index) => (
            <SourceRow key={index} source={source} />
          ))}
        </ul>
      </div>
    </Card>
  );
}
