import { RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CopyButton } from '../components/shared/CopyButton';
import { PageHeader } from '../components/shared/PageHeader';
import { Alert } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Slider } from '../components/ui/slider';
import {
  SEARCH_PRESETS,
  SEARCH_TERM_CATEGORIES,
  SEARCH_TERM_KEYWORDS,
  type SearchTerm,
} from '../config/searchTerms';
import { cn } from '../lib/utils';
import {
  EMPTY_SEARCH_STATE,
  FULL_STAT_RANGE,
  STAT_NAMES,
  buildSearchString,
  nextTermState,
  type SearchStringState,
  type StatName,
  type TermState,
} from '../utils/searchString';

const STAT_LABELS: Record<StatName, string> = { attack: 'Attack', defense: 'Defense', hp: 'HP' };

const STAT_MARKS = [0, 1, 2, 3, 4].map((value) => ({ value, label: String(value) }));

function TermChip({
  term,
  state,
  onToggle,
}: {
  term: SearchTerm;
  state: TermState | undefined;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`${term.label}: ${state === 'include' ? 'included' : state === 'exclude' ? 'excluded' : 'not selected'}`}
      title={term.keyword}
      className={cn(
        'rounded-full border px-3 py-1 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        state === undefined && 'border-border bg-card text-foreground hover:bg-accent',
        state === 'include' && 'border-primary bg-primary text-primary-foreground',
        state === 'exclude' && 'border-destructive bg-destructive/10 text-destructive line-through'
      )}
    >
      {state === 'exclude' ? `Not ${term.label}` : term.label}
    </button>
  );
}

function BuilderSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-4">
      <h2 className="text-base font-semibold">{title}</h2>
      {description && <p className="mb-3 text-sm text-muted-foreground">{description}</p>}
      <div className={cn(!description && 'mt-3')}>{children}</div>
    </Card>
  );
}

function SearchStringBuilderPage() {
  const [state, setState] = useState<SearchStringState>(EMPTY_SEARCH_STATE);
  const searchString = useMemo(() => buildSearchString(state, SEARCH_TERM_KEYWORDS), [state]);

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

  const updateStat = (stat: StatName, range: [number, number]) =>
    setState((prev) => ({ ...prev, stats: { ...prev.stats, [stat]: range } }));

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
          <BuilderSection title="Presets" description="Start from a common search, then adjust it.">
            <div className="flex flex-wrap gap-2">
              {SEARCH_PRESETS.map((preset) => (
                <Button
                  key={preset.label}
                  variant="outline"
                  size="sm"
                  title={preset.description}
                  onClick={() => setState({ ...EMPTY_SEARCH_STATE, ...preset.state })}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </BuilderSection>

          <BuilderSection title="Pokémon" description="Names, Pokédex numbers, or ranges such as 1-151.">
            <div className="flex flex-col gap-3">
              <Input
                aria-label="Pokémon names or Pokédex numbers"
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
          </BuilderSection>

          {SEARCH_TERM_CATEGORIES.map((category) => (
            <BuilderSection key={category.id} title={category.title} description={category.description}>
              <div className="flex flex-wrap gap-2">
                {category.terms.map((term) => (
                  <TermChip
                    key={term.keyword}
                    term={term}
                    state={state.terms[term.keyword]}
                    onToggle={() => toggleTerm(term.keyword)}
                  />
                ))}
              </div>
            </BuilderSection>
          ))}

          <BuilderSection title="CP and IVs" description="Leave a CP bound empty to keep it open.">
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="search-cp-min">Minimum CP</Label>
                  <Input
                    id="search-cp-min"
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={state.cpMin}
                    onChange={(event) => update('cpMin', event.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="search-cp-max">Maximum CP</Label>
                  <Input
                    id="search-cp-max"
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={state.cpMax}
                    onChange={(event) => update('cpMax', event.target.value)}
                  />
                </div>
              </div>
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
          </BuilderSection>

          <BuilderSection
            title="Other Terms"
            description="Added as-is, for example age0-7, distance100-, buddy2-5, or @moveName."
          >
            <Input
              aria-label="Other search terms"
              value={state.custom}
              onChange={(event) => update('custom', event.target.value)}
            />
          </BuilderSection>
        </div>

        <Card className="flex flex-col gap-3 p-4 lg:sticky lg:top-20">
          <h2 className="text-base font-semibold">Your Search String</h2>
          <code
            aria-live="polite"
            className="min-h-16 break-all rounded-md bg-muted p-3 font-mono text-sm"
          >
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
