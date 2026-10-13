import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { ALL_FILTERS_KEY, SAVED_EVENTS_CATEGORY } from '../config/constants';
import { initialFilters } from '../config/eventFilter';
import {
  ALL_DAY_EVENT_THRESHOLD_HOURS,
  MS_PER_HOUR,
} from '../config/timeConstants';
import type { CalendarEvent, EventPokemon } from '../types/events';
import type { Filters } from '../types/filters';
import { safeGetJSON, safeSetJSON } from '../utils/storageUtils';
import { getEventInstant } from '../utils/eventTimeUtils';

type SetFilters = Dispatch<SetStateAction<Filters>>;

const defaultAllFilters: Record<string, Filters> = {
  dayGridMonth: initialFilters,
  listWeek: initialFilters,
};

// --- Helper functions for filtering logic ---
const passesSavedFilter = (
  event: CalendarEvent,
  isSavedFilterActive: boolean,
  savedEventIds: string[]
) =>
  !isSavedFilterActive ||
  savedEventIds.includes(event.extendedProps.article_url);

const passesCategoryFilter = (
  event: CalendarEvent,
  otherSelectedCategories: string[]
) =>
  otherSelectedCategories.length === 0 ||
  otherSelectedCategories.includes(event.extendedProps.category);

const passesSearchFilter = (event: CalendarEvent, searchTerm: string) =>
  event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;

const passesDateFilter = (
  event: CalendarEvent,
  startDate: Date | null,
  endDate: Date | null
) => {
  if (!event.start || !event.end) return false;

  const eventStart = new Date(event.start);
  const eventEnd = new Date(event.end);

  if (isNaN(eventStart.getTime()) || isNaN(eventEnd.getTime())) return false;

  return !(
    (startDate && eventEnd < startDate) ||
    (endDate && eventStart > endDate)
  );
};

const passesTimeFilter = (event: CalendarEvent, timeRange: number[]) => {
  if (!event.start || !event.end) return false;

  const eventStart = new Date(event.start);
  const eventEnd = new Date(event.end);

  if (isNaN(eventStart.getTime()) || isNaN(eventEnd.getTime())) return false;

  const [startHour, endHour] = timeRange;
  const eventDurationHours =
    (eventEnd.getTime() - eventStart.getTime()) / MS_PER_HOUR;
  const isAllDayEvent = eventDurationHours >= ALL_DAY_EVENT_THRESHOLD_HOURS;
  const eventStartHour = eventStart.getHours();
  return (
    isAllDayEvent || (eventStartHour >= startHour && eventStartHour < endHour)
  );
};

const passesActiveOnlyFilter = (
  event: CalendarEvent,
  showActiveOnly: boolean
) => {
  if (!showActiveOnly) return true;
  if (!event.start || !event.end) return false;

  const now = new Date();
  const eventStart = getEventInstant(event, 'start');
  const eventEnd = getEventInstant(event, 'end');

  if (!eventStart || !eventEnd) return false;

  return now >= eventStart && now <= eventEnd;
};

const passesPokemonFilter = (event: CalendarEvent, pokemonSearch: string[]) => {
  if (pokemonSearch.length === 0) return true;

  // Collect all Pokemon from all fields (everything except bonuses and non-array fields)
  const allPokemonInEvent: string[] = [];
  const nonPokemonFields = [
    'category',
    'article_url',
    'banner_url',
    'description',
    'bonuses',
  ];

  Object.entries(event.extendedProps).forEach(([key, value]) => {
    if (!nonPokemonFields.includes(key) && Array.isArray(value)) {
      allPokemonInEvent.push(...(value as EventPokemon[]).map((item) => item.name));
    }
  });

  return pokemonSearch.every((pokemon: string) =>
    allPokemonInEvent.includes(pokemon)
  );
};

const passesBonusFilter = (event: CalendarEvent, bonusSearch: string[]) =>
  bonusSearch.length === 0 ||
  bonusSearch.every((bonus: string) =>
    (event.extendedProps.bonuses ?? []).includes(bonus)
  );
// ---------------------------------------------

export function useFilters(
  allEvents: CalendarEvent[],
  savedEventIds: string[]
) {
  const [currentView, setCurrentView] = useState('dayGridMonth');

  const [allFilters, setAllFilters] = useState(() => {
    const saved = safeGetJSON<Record<string, Filters>>(ALL_FILTERS_KEY, {});

    // Merge with defaults and parse dates
    const merged: Record<string, Filters> = {};
    Object.keys(defaultAllFilters).forEach((view) => {
      merged[view] = { ...initialFilters, ...saved[view] };
      if (merged[view].startDate)
        merged[view].startDate = new Date(merged[view].startDate);
      if (merged[view].endDate)
        merged[view].endDate = new Date(merged[view].endDate);
    });

    return Object.keys(saved).length > 0 ? merged : defaultAllFilters;
  });

  useEffect(() => {
    safeSetJSON(ALL_FILTERS_KEY, allFilters);
  }, [allFilters]);

  const filtersForCurrentView = allFilters[currentView] || initialFilters;

  const setFiltersForCurrentView: SetFilters = useCallback(
    (update) => {
      setAllFilters((prev: Record<string, Filters>) => {
        const currentFilters: Filters = prev[currentView] || initialFilters;
        const newFilters: Filters =
          typeof update === 'function'
            ? (update as (filters: Filters) => Filters)(currentFilters)
            : (update as Filters);
        return { ...prev, [currentView]: newFilters };
      });
    },
    [currentView]
  );

  const handleResetFilters = useCallback(() => {
    setAllFilters((prev: Record<string, Filters>) => ({
      ...prev,
      [currentView]: initialFilters,
    }));
  }, [currentView]);

  const filteredEvents = useMemo(() => {
    const {
      selectedCategories,
      searchTerm,
      startDate,
      endDate,
      timeRange,
      showActiveOnly,
      pokemonSearch,
      bonusSearch,
    } = filtersForCurrentView;

    const isSavedFilterActive = selectedCategories.includes(
      SAVED_EVENTS_CATEGORY
    );
    const otherSelectedCategories = selectedCategories.filter(
      (c: string) => c !== SAVED_EVENTS_CATEGORY
    );

    return allEvents.filter(
      (event) =>
        passesSavedFilter(event, isSavedFilterActive, savedEventIds) &&
        passesCategoryFilter(event, otherSelectedCategories) &&
        passesSearchFilter(event, searchTerm) &&
        passesDateFilter(event, startDate, endDate) &&
        passesTimeFilter(event, timeRange) &&
        passesActiveOnlyFilter(event, showActiveOnly) &&
        passesPokemonFilter(event, pokemonSearch) &&
        passesBonusFilter(event, bonusSearch)
    );
  }, [allEvents, filtersForCurrentView, savedEventIds]);

  const activeFilterCount = useMemo(() => {
    const { searchTerm, selectedCategories, startDate, endDate, showActiveOnly, timeRange, pokemonSearch, bonusSearch } =
      filtersForCurrentView;
    return (
      (searchTerm ? 1 : 0) +
      selectedCategories.length +
      (startDate ? 1 : 0) +
      (endDate ? 1 : 0) +
      (showActiveOnly ? 1 : 0) +
      (timeRange[0] > 0 || timeRange[1] < 24 ? 1 : 0) +
      pokemonSearch.length +
      bonusSearch.length
    );
  }, [filtersForCurrentView]);

  return {
    filters: filtersForCurrentView,
    setFilters: setFiltersForCurrentView,
    handleResetFilters,
    setCurrentView,
    filteredEvents,
    activeFilterCount,
  };
}
