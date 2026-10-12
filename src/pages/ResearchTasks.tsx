import { ChevronDown } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ShinyChip } from '../components/filters/shared';
import { CopyDexSearchButton } from '../components/shared/CopyDexSearchButton';
import { DataErrorDisplay } from '../components/shared/DataErrorDisplay';
import { DataImage } from '../components/shared/DataImage';
import { DataLoadingSkeleton } from '../components/shared/DataLoadingSkeleton';
import { NoResults } from '../components/shared/NoResults';
import { PageHeader } from '../components/shared/PageHeader';
import { SectionHeader } from '../components/shared/SectionHeader';
import { ViewModeToggle, type ViewMode } from '../components/shared/ViewModeToggle';
import { Alert } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Card, INTERACTIVE_CARD_CLASSNAME } from '../components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { usePageFiltersContext } from '../hooks/usePageFiltersContext';
import { usePageData } from '../hooks/usePageData';
import { fetchResearchTasks } from '../services/dataService';
import type { ResearchTask, ResearchTaskData, TaskReward } from '../types/researchTasks';

function ResearchTasksPage() {
  const { filters, setOptions } = usePageFiltersContext().researchTask;
  const { data, loading, error, refetch } = usePageData<ResearchTaskData>(
    fetchResearchTasks,
    'Failed to load research task data. Please try again later.'
  );
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  useEffect(() => {
    if (data) {
      const categories = Object.keys(data);
      const rewardTypes = Array.from(
        new Set(
          Object.values(data).flatMap((tasks) =>
            tasks.flatMap((task) => task.rewards.map((reward) => reward.type))
          )
        )
      ).sort();
      setOptions({ categories, rewardTypes });
    }
  }, [data, setOptions]);

  const filteredData = useMemo(() => {
    if (!data) return null;

    const result: ResearchTaskData = {};

    Object.entries(data).forEach(([category, tasks]) => {
      if (filters.selectedCategories.length > 0 && !filters.selectedCategories.includes(category)) {
        return;
      }

      const filteredTasks = tasks.filter((task) => {
        if (filters.taskSearch && !task.task.toLowerCase().includes(filters.taskSearch.toLowerCase())) {
          return false;
        }

        const hasMatchingReward = task.rewards.some((reward) => {
          if (filters.rewardTypes.length > 0 && !filters.rewardTypes.includes(reward.type)) {
            return false;
          }
          if (
            filters.pokemonSearch &&
            reward.type === 'encounter' &&
            !reward.name.toLowerCase().includes(filters.pokemonSearch.toLowerCase())
          ) {
            return false;
          }
          if (filters.shinyOnly && !reward.shiny_available) {
            return false;
          }
          return true;
        });

        if (filters.rewardTypes.length > 0 || filters.pokemonSearch || filters.shinyOnly) {
          return hasMatchingReward;
        }

        return true;
      });

      if (filteredTasks.length > 0) {
        result[category] = filteredTasks;
      }
    });

    return result;
  }, [data, filters]);

  if (loading) {
    return <DataLoadingSkeleton itemCount={6} gridSize={{ xs: 12 }} />;
  }

  if (error || !data || !filteredData) {
    return (
      <DataErrorDisplay title="Failed to Load Research Task Data" message={error || undefined} onRetry={refetch} />
    );
  }

  const renderReward = (reward: TaskReward, index: number) => (
    <div key={index} className="flex min-h-20 items-center rounded-lg border border-border bg-muted p-4">
      <div className="mr-3 flex h-14 w-14 min-w-14 items-center justify-center overflow-hidden rounded-md bg-card">
        <DataImage src={reward.asset_url} alt={reward.name} className="max-h-full max-w-full object-contain" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">
          {reward.name}
          {reward.quantity && reward.quantity > 1 && ` x${reward.quantity}`}
        </p>
        <div className="mt-1 flex flex-wrap gap-1">
          <Badge size="sm" variant={reward.type === 'encounter' ? 'success' : 'secondary'}>
            {reward.type === 'encounter'
              ? 'Pokémon'
              : reward.type.charAt(0).toUpperCase() + reward.type.slice(1)}
          </Badge>
          {reward.shiny_available && <ShinyChip />}
        </div>
      </div>
    </div>
  );

  const renderTaskListItem = (task: ResearchTask, index: number) => (
    <Card key={index} className={`flex w-full items-center gap-3 p-3 ${INTERACTIVE_CARD_CLASSNAME}`}>
      <p className="min-w-0 flex-1 text-sm font-semibold">{task.task}</p>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="-m-1 flex shrink-0 items-center gap-1.5 rounded-md p-1 hover:bg-muted"
            aria-label={`View all ${task.rewards.length} rewards for ${task.task}`}
          >
            <div className="flex items-center">
              {task.rewards.slice(0, 4).map((reward, idx) => (
                <div
                  key={idx}
                  className="-ml-2 flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-card bg-muted first:ml-0"
                  style={{ zIndex: 4 - idx }}
                  title={reward.name}
                >
                  <DataImage src={reward.asset_url} alt={reward.name} className="max-h-full max-w-full object-contain p-0.5" />
                </div>
              ))}
              {task.rewards.length > 4 && (
                <div className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-card bg-muted text-[0.65rem] font-semibold text-muted-foreground">
                  +{task.rewards.length - 4}
                </div>
              )}
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 p-3">
          <p className="mb-2 text-xs font-semibold text-muted-foreground">All Rewards</p>
          <div className="flex flex-col gap-2">
            {task.rewards.map((reward, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                  <DataImage src={reward.asset_url} alt={reward.name} className="max-h-full max-w-full object-contain" />
                </div>
                <p className="min-w-0 flex-1 truncate text-xs font-medium">
                  {reward.name}
                  {reward.quantity && reward.quantity > 1 && ` x${reward.quantity}`}
                </p>
                {reward.shiny_available && <ShinyChip />}
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      <Badge size="sm" className="min-w-20 shrink-0 justify-center">
        {task.rewards.length} Reward{task.rewards.length !== 1 ? 's' : ''}
      </Badge>
    </Card>
  );

  const renderTaskCard = (task: ResearchTask, index: number) => (
    <Card key={index} className={`mb-4 flex break-inside-avoid flex-col p-4 ${INTERACTIVE_CARD_CLASSNAME}`}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <p className="text-sm font-semibold leading-6">{task.task}</p>
        <Badge className="shrink-0">
          {task.rewards.length} Reward{task.rewards.length !== 1 ? 's' : ''}
        </Badge>
      </div>
      <div className="grid grid-cols-1 gap-2">{task.rewards.map((reward, idx) => renderReward(reward, idx))}</div>
    </Card>
  );

  return (
    <div>
      <PageHeader
        title="Research Tasks"
        description="Current field research tasks and their rewards"
        actions={
          <div className="flex items-center gap-2">
            <CopyDexSearchButton pokemon={Object.values(filteredData)
                .flat()
                .flatMap((task) => task.rewards.filter((reward) => reward.type === 'encounter'))} />
            <ViewModeToggle value={viewMode} onChange={setViewMode} />
          </div>
        }
      />

      <Alert variant="info" className="mb-6">
        Field research tasks are obtained by spinning PokéStops. Complete tasks to earn rewards including
        Pokémon encounters, items, and Stardust.
      </Alert>

      {Object.keys(filteredData).length === 0 && <NoResults />}

      <div className="flex flex-col gap-6">
        {Object.entries(filteredData).map(([category, tasks]) => {
          if (!tasks || tasks.length === 0) return null;

          return (
            <div key={category}>
              <SectionHeader
                title={category}
                count={tasks.length}
                label={`Task${tasks.length !== 1 ? 's' : ''}`}
              />
              {viewMode === 'grid' ? (
                <div className="columns-1 gap-4 lg:columns-2">
                  {tasks.map((task, index) => renderTaskCard(task, index))}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {tasks.map((task, index) => renderTaskListItem(task, index))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ResearchTasksPage;
