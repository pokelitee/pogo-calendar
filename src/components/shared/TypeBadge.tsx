import { POKEMON_TYPE_COLORS } from '../../config/colorMapping';
import { contrastColor } from '../../utils/colorUtils';
import { Badge } from '../ui/badge';

const FALLBACK_TYPE_COLOR = '#999';

/**
 * A Pokémon type label in that type's color.
 */
export function TypeBadge({ type, size = 'sm' }: { type: string; size?: 'sm' | 'default' }) {
  const color = POKEMON_TYPE_COLORS[type] || FALLBACK_TYPE_COLOR;
  return (
    <Badge size={size} style={{ backgroundColor: color, color: contrastColor(color) }}>
      {type}
    </Badge>
  );
}
