import { useCallback, useMemo } from 'react';
import { CUSTOM_EVENT_CATEGORY } from '../config/constants';
import { useCustomEventsContext } from '../hooks/useCustomEventsContext';
import { useEventDataContext } from '../hooks/useEventDataContext';
import { useFilters } from '../hooks/useFilters';
import type { CalendarEvent, EventPokemon, NewEventData } from '../types/events';
import { CalendarContext } from './CalendarContext';
import { CustomEventsProvider } from './CustomEventsProvider';
import { EventDataProvider } from './EventDataProvider';

const NON_POKEMON_FIELDS = new Set([
  'category',
  'article_url',
  'banner_url',
  'description',
  'bonuses',
  'is_local_time',
  'start_instant',
  'end_instant',
]);

function getEventMetadata(events: CalendarEvent[]) {
  const categories = new Set<string>();
  const pokemon = new Set<string>();
  const bonuses = new Set<string>();

  events.forEach((event) => {
    categories.add(event.extendedProps.category);
    event.extendedProps.bonuses?.forEach((bonus) => bonuses.add(bonus));
    Object.entries(event.extendedProps).forEach(([key, value]) => {
      if (!NON_POKEMON_FIELDS.has(key) && Array.isArray(value)) {
        (value as EventPokemon[]).forEach((item) => pokemon.add(item.name));
      }
    });
  });

  return {
    allCategories: Array.from(categories).sort(),
    allPokemon: Array.from(pokemon).sort(),
    allBonuses: Array.from(bonuses).sort(),
  };
}

function CalendarStateProvider({ children }: { children: React.ReactNode }) {
  const eventData = useEventDataContext();
  const customEvents = useCustomEventsContext();

  const allEvents = useMemo(
    () => [...eventData.allEvents, ...customEvents.customEvents],
    [eventData.allEvents, customEvents.customEvents]
  );
  const metadata = useMemo(() => getEventMetadata(allEvents), [allEvents]);
  const { filters, setFilters, handleResetFilters, setCurrentView, filteredEvents, activeFilterCount } =
    useFilters(allEvents, customEvents.savedEventIds);
  const { addEvent } = customEvents;

  const handleAddEvent = useCallback(
    (newEvent: NewEventData) => {
      addEvent(newEvent);
      if (filters.selectedCategories.length > 0) {
        setFilters((prev) => ({
          ...prev,
          selectedCategories: [...new Set([...prev.selectedCategories, CUSTOM_EVENT_CATEGORY])],
        }));
      }
    },
    [addEvent, filters.selectedCategories.length, setFilters]
  );

  const value = useMemo(
    () => ({
      loading: eventData.loading,
      error: eventData.error,
      historyLoading: eventData.historyLoading,
      historyError: eventData.historyError,
      allEvents,
      eventNotes: eventData.eventNotes,
      selectedEvent: eventData.selectedEvent,
      setSelectedEvent: eventData.setSelectedEvent,
      refetchEvents: eventData.refetchEvents,
      refetchHistory: eventData.refetchHistory,
      updateNote: eventData.updateNote,
      ...metadata,
      savedEventIds: customEvents.savedEventIds,
      addEvent: handleAddEvent,
      updateEvent: customEvents.updateEvent,
      deleteEvent: customEvents.deleteEvent,
      handleToggleSaveEvent: customEvents.handleToggleSaveEvent,
      filters,
      setFilters,
      handleResetFilters,
      setCurrentView,
      filteredEvents,
      activeFilterCount,
    }),
    [
      eventData,
      customEvents,
      allEvents,
      metadata,
      handleAddEvent,
      filters,
      setFilters,
      handleResetFilters,
      setCurrentView,
      filteredEvents,
      activeFilterCount,
    ]
  );

  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>;
}

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  return (
    <EventDataProvider>
      <CustomEventsProvider>
        <CalendarStateProvider>{children}</CalendarStateProvider>
      </CustomEventsProvider>
    </EventDataProvider>
  );
}
