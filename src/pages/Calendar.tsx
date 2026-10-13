import { CalendarX } from 'lucide-react';
import { useState } from 'react';
import { CalendarSkeleton } from '../components/calendar/CalendarSkeleton';
import EventCalendar from '../components/calendar/EventCalendar';
import EventDetailDialog from '../components/events/EventDetailDialog';
import { DataErrorDisplay } from '../components/shared/DataErrorDisplay';
import { NoResults } from '../components/shared/NoResults';
import { PageHeader } from '../components/shared/PageHeader';
import { ViewModeToggle } from '../components/shared/ViewModeToggle';
import { Button } from '../components/ui/button';
import { useCalendarContext } from '../hooks/useCalendarContext';
import { MOBILE_QUERY, useMediaQuery } from '../hooks/useMediaQuery';
import { useSettingsContext } from '../hooks/useSettingsContext';
import type { ToastSeverity } from '../hooks/useToast';
import type { CalendarEvent } from '../types/events';
import type { CalendarView } from '../types/settings';

interface CalendarPageProps {
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  showToast: (message: string, severity?: ToastSeverity) => void;
}

function CalendarPage({ onEditEvent, onDeleteEvent, showToast }: CalendarPageProps) {
  const {
    loading,
    error,
    filteredEvents,
    setCurrentView,
    handleResetFilters,
    selectedEvent,
    setSelectedEvent,
    savedEventIds,
    handleToggleSaveEvent,
    eventNotes,
    updateNote,
  } = useCalendarContext();
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const { settings } = useSettingsContext();

  const defaultView: CalendarView =
    settings.defaultCalendarView === 'auto'
      ? isMobile
        ? 'listWeek'
        : 'dayGridMonth'
      : settings.defaultCalendarView;
  const [view, setView] = useState<CalendarView>(defaultView);
  const [previousDefaultView, setPreviousDefaultView] = useState(defaultView);
  if (defaultView !== previousDefaultView) {
    setPreviousDefaultView(defaultView);
    setView(defaultView);
  }

  const handleViewChange = (nextView: CalendarView) => {
    setView(nextView);
    setCurrentView(nextView);
  };

  if (loading) {
    return <CalendarSkeleton isMobile={isMobile} />;
  }

  if (error) {
    return <DataErrorDisplay title="Failed to Load Events" message={error} />;
  }

  return (
    <div>
      <PageHeader
        title="Event Calendar"
        description="Upcoming Pokémon GO events, raids, and research at a glance"
        actions={
          <ViewModeToggle
            value={view === 'dayGridMonth' ? 'grid' : 'list'}
            onChange={(mode) => handleViewChange(mode === 'grid' ? 'dayGridMonth' : 'listWeek')}
          />
        }
      />

      {filteredEvents.length === 0 ? (
        <NoResults
          title="No Events Found"
          message="Try adjusting your filters or creating a new custom event."
          icon={<CalendarX className="mb-3 h-10 w-10 text-muted-foreground" />}
          action={
            <Button variant="outline" onClick={handleResetFilters}>
              Reset All Filters
            </Button>
          }
        />
      ) : (
        <EventCalendar view={view} isMobile={isMobile} />
      )}

      {/* Rendered outside the calendar so events opened from other pages show
          even when the current filters hide every event. */}
      <EventDetailDialog
        eventNotes={eventNotes}
        onUpdateNote={updateNote}
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        savedEventIds={savedEventIds}
        onToggleSaveEvent={handleToggleSaveEvent}
        onDeleteEvent={onDeleteEvent}
        onEditEvent={onEditEvent}
        showToast={showToast}
      />
    </div>
  );
}

export default CalendarPage;
