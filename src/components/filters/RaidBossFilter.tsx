import { useCallback } from 'react';
import { usePageFiltersContext } from '../../hooks/usePageFiltersContext';
import type { RaidBossFilters } from '../../types/pageFilters';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Slider } from '../ui/slider';
import { FilterActions, FilterSection } from './shared';

function RaidBossFilter() {
  const {
    filters,
    setFilters: onFilterChange,
    resetFilters: onResetFilters,
    options: { raidTiers: availableRaidTiers, types: availableTypes },
  } = usePageFiltersContext().raidBoss;

  const handleFilterChange = useCallback(
    <K extends keyof RaidBossFilters>(field: K, value: RaidBossFilters[K]) => {
      onFilterChange({ ...filters, [field]: value });
    },
    [filters, onFilterChange]
  );

  const handleRaidTierChange = useCallback(
    (tier: string, checked: boolean) => {
      const newSelectedTiers = checked
        ? [...filters.selectedRaidTiers, tier]
        : filters.selectedRaidTiers.filter((t) => t !== tier);
      handleFilterChange('selectedRaidTiers', newSelectedTiers);
    },
    [filters.selectedRaidTiers, handleFilterChange]
  );

  const handleTypeChange = useCallback(
    (type: string, checked: boolean) => {
      const newSelectedTypes = checked
        ? [...filters.selectedTypes, type]
        : filters.selectedTypes.filter((t) => t !== type);
      handleFilterChange('selectedTypes', newSelectedTypes);
    },
    [filters.selectedTypes, handleFilterChange]
  );

  return (
    <div className="flex flex-col gap-4">
      <FilterSection title="Search">
        <div className="space-y-1.5">
          <Label htmlFor="raid-pokemon-search">Search by Pokémon Name</Label>
          <Input
            id="raid-pokemon-search"
            value={filters.pokemonSearch}
            onChange={(e) => handleFilterChange('pokemonSearch', e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2.5 text-sm">
          <Checkbox
            checked={filters.shinyOnly}
            onCheckedChange={(checked) => handleFilterChange('shinyOnly', checked === true)}
          />
          Show Shiny Available Only
        </label>
        <label className="flex items-center gap-2.5 text-sm">
          <Checkbox
            checked={filters.shadowOnly}
            onCheckedChange={(checked) => handleFilterChange('shadowOnly', checked === true)}
          />
          Show Shadow Raids Only
        </label>
      </FilterSection>

      <Separator />
      <FilterSection title="CP Range">
        <div className="px-1">
          <p className="mb-2 text-sm text-muted-foreground">Filter by CP Range</p>
          <Slider
            value={[filters.minCP, filters.maxCP]}
            onValueChange={([min, max]) => {
              handleFilterChange('minCP', min);
              handleFilterChange('maxCP', max);
            }}
            min={0}
            max={60000}
            step={1000}
            marks={[
              { value: 0, label: '0' },
              { value: 30000, label: '30k' },
              { value: 60000, label: '60k' },
            ]}
            formatLabel={(v) => v.toLocaleString()}
          />
        </div>
      </FilterSection>

      <Separator />
      <FilterSection title="Raid Tiers">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Select raid tiers to display</span>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleFilterChange('selectedRaidTiers', availableRaidTiers)}
            >
              Select All
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleFilterChange('selectedRaidTiers', [])}>
              Clear All
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {availableRaidTiers.map((tier) => (
            <label key={tier} className="flex items-center gap-2.5 text-sm">
              <Checkbox
                checked={filters.selectedRaidTiers.includes(tier)}
                onCheckedChange={(checked) => handleRaidTierChange(tier, checked === true)}
              />
              {tier}
            </label>
          ))}
        </div>
      </FilterSection>

      <Separator />
      <FilterSection title="Pokémon Types">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Select types to display</span>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={() => handleFilterChange('selectedTypes', availableTypes)}>
              Select All
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleFilterChange('selectedTypes', [])}>
              Clear All
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {availableTypes.map((type) => (
            <label key={type} className="flex items-center gap-2.5 text-sm">
              <Checkbox
                checked={filters.selectedTypes.includes(type)}
                onCheckedChange={(checked) => handleTypeChange(type, checked === true)}
              />
              {type}
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterActions onReset={onResetFilters} />
    </div>
  );
}

export default RaidBossFilter;
