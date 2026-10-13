import { Check, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ROUTES } from '../../config/routes';
import type { CollectionList } from '../../hooks/useCollection';
import { cn } from '../../lib/utils';
import {
  POKEMON_SOURCE_KIND_LABELS,
  type PokemonAvailability,
  type PokemonSource,
  type PokemonSourceKind,
} from '../../utils/pokemonAvailability';
import { getPokemonFieldTitle } from '../../utils/eventDetailUtils';
import { DataImage } from '../shared/DataImage';
import { ShinyIndicator } from '../shared/ShinyIndicator';
import { ShinyChip } from '../filters/shared';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';

const SOURCE_KIND_PATHS: Record<PokemonSourceKind, string> = {
  event: ROUTES.CALENDAR,
  raid: ROUTES.RAID_BOSSES,
  egg: ROUTES.EGG_POOL,
  research: ROUTES.RESEARCH_TASKS,
  rocket: ROUTES.ROCKET_LINEUP,
};

function SourceRow({ source }: { source: PokemonSource }) {
  return (
    <li className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
      <RouterLink to={SOURCE_KIND_PATHS[source.kind]} className="no-underline">
        <Badge variant="outline" size="sm">
          {POKEMON_SOURCE_KIND_LABELS[source.kind]}
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

function CollectionToggle({
  pressed,
  label,
  icon,
  onToggle,
}: {
  pressed: boolean;
  label: string;
  icon: ReactNode;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onToggle}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-3.5',
        pressed ? 'border-success bg-success/10 text-success' : 'border-border text-muted-foreground hover:bg-accent'
      )}
    >
      {icon}
      {label}
    </button>
  );
}

interface PokemonAvailabilityCardProps {
  entry: PokemonAvailability;
  caught: boolean;
  shinyCaught: boolean;
  onToggleCollection: (list: CollectionList) => void;
}

/**
 * Shows a Pokémon, where it can be obtained, and whether the trainer has it.
 */
export function PokemonAvailabilityCard({
  entry,
  caught,
  shinyCaught,
  onToggleCollection,
}: PokemonAvailabilityCardProps) {
  const { sources } = entry;
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
        <div className="mt-3 flex flex-wrap gap-2">
          <CollectionToggle
            pressed={caught}
            label={caught ? 'Caught' : 'Mark caught'}
            icon={<Check />}
            onToggle={() => onToggleCollection('registered')}
          />
          <CollectionToggle
            pressed={shinyCaught}
            label={shinyCaught ? 'Shiny caught' : 'Mark shiny caught'}
            icon={<Sparkles />}
            onToggle={() => onToggleCollection('shiny')}
          />
        </div>
      </div>
    </Card>
  );
}
