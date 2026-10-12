import { getDexNumber } from '../../utils/pokemonAvailability';
import { buildDexSearchString } from '../../utils/searchString';
import { CopyButton } from './CopyButton';

interface CopyDexSearchButtonProps {
  pokemon: { asset_url: string | null }[];
  label?: string;
}

/**
 * Copies a storage search string matching the given Pokémon by Pokédex number.
 */
export function CopyDexSearchButton({ pokemon, label = 'Copy search string' }: CopyDexSearchButtonProps) {
  const dexNumbers = pokemon.map(({ asset_url }) => getDexNumber(asset_url));
  const known = dexNumbers.filter((dex): dex is number => dex !== null);
  const skipped = dexNumbers.length - known.length;
  const title = [
    'Copies Pokédex numbers for your storage search; they work in any game language.',
    skipped > 0 ? `${skipped} Pokémon without a known Pokédex number are left out.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <CopyButton
      value={buildDexSearchString(known)}
      label={label}
      variant="outline"
      size="sm"
      title={title}
    />
  );
}
