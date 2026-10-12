import { Badge } from '../../ui/badge';

/**
 * Shadow raid boss chip, styled to sit alongside ShinyChip
 */
export const ShadowChip = () => (
  <Badge
    variant="muted"
    size="sm"
    className="bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300"
  >
    Shadow
  </Badge>
);
