import { RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CopyButton } from '../components/shared/CopyButton';
import { PageHeader } from '../components/shared/PageHeader';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Alert } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Chip } from '../components/ui/chip';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Slider } from '../components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '../components/ui/toggle-group';
import {
  SEARCH_PRESET_GROUPS,
  SEARCH_RANGE_FIELDS,
  SEARCH_RANGE_KEYS,
  SEARCH_SECTIONS,
  SEARCH_TERM_CATEGORIES,
  SEARCH_TERM_GROUPS,
  type SearchPreset,
  type SearchRangeField,
  type SearchSection,
  type SearchSectionField,
  type SearchTerm,
} from '../config/searchTerms';
import { cn } from '../lib/utils';
import {
  EMPTY_SEARCH_STATE,
  FULL_STAT_RANGE,
  STAT_NAMES,
  buildSearchString,
  nextTermState,
  type MoveSlot,
  type NumberRange,
  type SearchStringState,
  type StatName,
  type TermState,
} from '../utils/searchString';

const STAT_LABELS: Record<StatName, string> = { attack: 'Attack', defense: 'Defense', hp: 'HP' };

const STAT_MARKS = [0, 1, 2, 3, 4].map((value) => ({ value, label: String(value) }));

const MOVE_SLOTS: { value: MoveSlot; label: string }[] = [
  { value: '', label: 'Any move' },
  { value: '1', label: 'Fast' },
  { value: '2', label: 'Charged 1' },
  { value: '3', label: 'Charged 2' },
];

const CATEGORIES_BY_ID = new Map(SEARCH_TERM_CATEGORIES.map((category) => [category.id, category]));

const RANGE_FIELDS_BY_KEY = new Map(SEARCH_RANGE_FIELDS.map((field) => [field.key, field]));

const DEFAULT_OPEN_SECTIONS = ['pokemon', 'stats'];

function isFieldActive(field: SearchSectionField, state: SearchStringState): boolean {
  switch (field) {
    case 'stats':
      return STAT_NAMES.some(
        (stat) => state.stats[stat][0] !== FULL_STAT_RANGE[0] || state.stats[stat][1] !== FULL_STAT_RANGE[1]
      );
    case 'moveSlot':
      return state.moveSlot !== '';
    case 'pokemon':
    case 'tags':
    case 'moveNames':
    case 'custom':
      return state[field].trim() !== '';
  }
}

function countSectionSelections(section: SearchSection, state: SearchStringState): number {
  const fields = section.fields.filter((field) => isFieldActive(field, state)).length;
  const terms = section.categories
    .flatMap((id) => CATEGORIES_BY_ID.get(id)?.terms ?? [])
    .filter(({ keyword }) => state.terms[keyword]).length;
  const ranges = section.ranges.filter((key) => {
    const range = state.ranges[key];
    return range && (range.min.trim() || range.max.trim());
  }).length;
  return fields + terms + ranges;
}

function TermChip({
  category,
  term,
  state,
  onToggle,
}: {
  category: string;
  term: SearchTerm;
  state: TermState | undefined;
  onToggle: () => void;
}) {
  return (
    <Chip
      onClick={onToggle}
      aria-label={`${category} ${term.label}: ${state === 'include' ? 'included' : state === 'exclude' ? 'excluded' : 'not selected'}`}
      title={term.keyword}
      state={state === 'include' ? 'included' : state === 'exclude' ? 'excluded' : 'off'}
    >
      {state === 'exclude' ? `Not ${term.label}` : term.label}
    </Chip>
  );
}

function RangeInputs({
  field,
  value,
  onChange,
}: {
  field: SearchRangeField;
  value: NumberRange | undefined;
  onChange: (range: NumberRange) => void;
}) {
  const range = value ?? { min: '', max: '' };
  const id = `search-range-${field.key}`;
  const digitsOnly = (input: string) => input.replace(/\D/g, '');
  return (
    <div className="space-y-1.5">
      <Label htmlFor={`${id}-min`}>
        {field.label} <span className="font-normal text-muted-foreground">· {field.hint}</span>
      </Label>
      <div className="flex items-center gap-2">
        <Input
          id={`${id}-min`}
          aria-label={`${field.label} minimum`}
          placeholder="Min"
          inputMode="numeric"
          autoComplete="off"
          value={range.min}
          onChange={(event) => onChange({ ...range, min: digitsOnly(event.target.value) })}
        />
        <span className="text-muted-foreground">–</span>
        <Input
          aria-label={`${field.label} maximum`}
          placeholder="Max"
          inputMode="numeric"
          autoComplete="off"
          value={range.max}
          onChange={(event) => onChange({ ...range, max: digitsOnly(event.target.value) })}
        />
      </div>
    </div>
  );
}

const PRESET_STRINGS = new Map(
  SEARCH_PRESET_GROUPS.flatMap(({ presets }) => presets).map((preset) => [
    preset.label,
    buildSearchString({ ...EMPTY_SEARCH_STATE, ...preset.state }, SEARCH_TERM_GROUPS, SEARCH_RANGE_KEYS),
  ])
);

function PresetButton({
  preset,
  active,
  onApply,
}: {
  preset: SearchPreset;
  active: boolean;
  onApply: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onApply}
      aria-pressed={active}
      className={cn(
        'flex flex-col gap-0.5 rounded-md border px-3 py-2 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        active ? 'border-primary bg-primary/10' : 'border-border bg-card hover:bg-accent'
      )}
    >
      <span className={cn('text-sm font-semibold', active && 'text-primary')}>{preset.label}</span>
      <span className="text-xs text-muted-foreground">{preset.description}</span>
    </button>
  );
}

function SearchStringBuilderPage() {
  const [state, setState] = useState<SearchStringState>(EMPTY_SEARCH_STATE);
  const searchString = useMemo(
    () => buildSearchString(state, SEARCH_TERM_GROUPS, SEARCH_RANGE_KEYS),
    [state]
  );

  const update = <K extends keyof SearchStringState>(field: K, value: SearchStringState[K]) =>
    setState((prev) => ({ ...prev, [field]: value }));

  const toggleTerm = (keyword: string) =>
    setState((prev) => {
      const terms = { ...prev.terms };
      const next = nextTermState(terms[keyword]);
      if (next) terms[keyword] = next;
      else delete terms[keyword];
      return { ...prev, terms };
    });

  const updateRange = (key: keyof SearchStringState['ranges'], range: NumberRange) =>
    setState((prev) => ({ ...prev, ranges: { ...prev.ranges, [key]: range } }));

  const updateStat = (stat: StatName, range: [number, number]) =>
    setState((prev) => ({ ...prev, stats: { ...prev.stats, [stat]: range } }));

  const renderField = (field: SearchSectionField) => {
    switch (field) {
      case 'pokemon':
        return (
          <div key={field} className="flex flex-col gap-2">
            <Label htmlFor="search-pokemon">Names, Pokédex numbers, or ranges such as 1-151</Label>
            <Input
              id="search-pokemon"
              placeholder="pikachu, 133, 1-151"
              value={state.pokemon}
              onChange={(event) => update('pokemon', event.target.value)}
            />
            <label className="flex items-center gap-2.5 text-sm">
              <Checkbox
                checked={state.includeFamily}
                onCheckedChange={(checked) => update('includeFamily', checked === true)}
              />
              Include each named Pokémon’s evolution family
            </label>
          </div>
        );
      case 'tags':
        return (
          <div key={field} className="space-y-1.5">
            <Label htmlFor="search-tags">Tags</Label>
            <Input
              id="search-tags"
              placeholder="battle, trade"
              value={state.tags}
              onChange={(event) => update('tags', event.target.value)}
            />
          </div>
        );
      case 'stats':
        return (
          <div key={field} className="flex flex-col gap-5">
            {STAT_NAMES.map((stat) => (
              <div key={stat} className="px-1">
                <p className="mb-2 text-sm font-medium">
                  {STAT_LABELS[stat]} appraisal bars{' '}
                  <span className="text-muted-foreground">
                    ({state.stats[stat][0]}–{state.stats[stat][1]})
                  </span>
                </p>
                <Slider
                  aria-label={`${STAT_LABELS[stat]} appraisal bars`}
                  value={state.stats[stat]}
                  onValueChange={([min, max]) => updateStat(stat, [min, max])}
                  min={FULL_STAT_RANGE[0]}
                  max={FULL_STAT_RANGE[1]}
                  step={1}
                  marks={STAT_MARKS}
                />
              </div>
            ))}
          </div>
        );
      case 'moveSlot':
        return (
          <div key={field} className="space-y-1.5">
            <p className="text-sm font-medium">Move slot for move types and names</p>
            <ToggleGroup
              type="single"
              aria-label="Move slot"
              className="flex-wrap"
              value={state.moveSlot || 'any'}
              onValueChange={(value) => value && update('moveSlot', (value === 'any' ? '' : value) as MoveSlot)}
            >
              {MOVE_SLOTS.map((slot) => (
                <ToggleGroupItem key={slot.label} value={slot.value || 'any'}>
                  {slot.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        );
      case 'moveNames':
        return (
          <div key={field} className="space-y-1.5">
            <Label htmlFor="search-moves">Specific moves</Label>
            <Input
              id="search-moves"
              placeholder="hyper beam, shadow ball"
              value={state.moveNames}
              onChange={(event) => update('moveNames', event.target.value)}
            />
          </div>
        );
      case 'custom':
        return (
          <Input
            key={field}
            aria-label="Other search terms"
            placeholder="Added as-is"
            value={state.custom}
            onChange={(event) => update('custom', event.target.value)}
          />
        );
    }
  };

  return (
    <div>
      <PageHeader
        title="Search String Builder"
        description="Pick filters and copy the result into the search bar of your Pokémon storage."
      />

      <Alert variant="info" className="mb-6">
        Tap an option once to include it, again to exclude it, and a third time to clear it. Keywords
        are in English, so they only work with the game set to English; Pokédex numbers work in any
        language.
      </Alert>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-4">
          <Card className="p-4">
            <h2 className="text-base font-semibold">Presets</h2>
            <p className="mb-3 text-sm text-muted-foreground">Start from a common search, then adjust it.</p>
            <div className="flex flex-col gap-4">
              {SEARCH_PRESET_GROUPS.map((group) => (
                <div key={group.title} className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {group.title}
                  </p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {group.presets.map((preset) => (
                      <PresetButton
                        key={preset.label}
                        preset={preset}
                        active={searchString !== '' && searchString === PRESET_STRINGS.get(preset.label)}
                        onApply={() => setState({ ...EMPTY_SEARCH_STATE, ...preset.state })}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="px-4">
            <Accordion type="multiple" defaultValue={DEFAULT_OPEN_SECTIONS}>
              {SEARCH_SECTIONS.map((section) => {
                const selections = countSectionSelections(section, state);
                return (
                  <AccordionItem key={section.id} value={section.id}>
                    <AccordionTrigger>
                      <span className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-2 text-base">
                          {section.title}
                          {selections > 0 && <Badge size="sm">{selections}</Badge>}
                        </span>
                        <span className="text-xs font-normal text-muted-foreground">{section.description}</span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-5">
                      {section.fields.filter((field) => field !== 'stats').map(renderField)}
                      {section.categories.map((id) => {
                        const category = CATEGORIES_BY_ID.get(id);
                        if (!category) return null;
                        return (
                          <div key={id} className="space-y-2">
                            <p className="text-sm font-medium">{category.title}</p>
                            <div className="flex flex-wrap gap-2">
                              {category.terms.map((term) => (
                                <TermChip
                                  key={term.keyword}
                                  category={category.title}
                                  term={term}
                                  state={state.terms[term.keyword]}
                                  onToggle={() => toggleTerm(term.keyword)}
                                />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                      {section.fields.includes('stats') && renderField('stats')}
                      {section.ranges.length > 0 && (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          {section.ranges.map((key) => {
                            const field = RANGE_FIELDS_BY_KEY.get(key);
                            return (
                              field && (
                                <RangeInputs
                                  key={key}
                                  field={field}
                                  value={state.ranges[key]}
                                  onChange={(range) => updateRange(key, range)}
                                />
                              )
                            );
                          })}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </Card>
        </div>

        <Card className="sticky bottom-24 z-10 flex flex-col gap-3 p-3 shadow-soft-lg lg:bottom-auto lg:top-20 lg:p-4 lg:shadow-soft-sm">
          <h2 className="hidden text-base font-semibold lg:block">Your Search String</h2>
          <code aria-live="polite" className="break-all lg:min-h-16 rounded-md bg-muted p-3 font-mono text-sm">
            {searchString || <span className="text-muted-foreground">Select filters to build a search.</span>}
          </code>
          <div className="flex gap-2">
            <CopyButton value={searchString} className="flex-1" />
            <Button variant="outline" onClick={() => setState(EMPTY_SEARCH_STATE)}>
              <RotateCcw />
              Reset
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default SearchStringBuilderPage;
