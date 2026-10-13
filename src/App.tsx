import { lazy, Suspense, useCallback, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import CreateEventDialog from './components/events/CreateEventDialog';
import { ExportEventDialog } from './components/events/ExportEventDialog';
import Footer from './components/layout/Footer';
import Header from './components/layout/Header';
import PageLayout from './components/layout/PageLayout';
import ErrorBoundary from './components/shared/ErrorBoundary';
import { PageLoader } from './components/shared/PageLoader';
import ScrollToTop from './components/shared/ScrollToTop';
import { SettingsDialog } from './components/shared/SettingsDialog';
import { Toaster } from './components/ui/toaster';
import { useCalendarContext } from './hooks/useCalendarContext';
import { useSettingsContext } from './hooks/useSettingsContext';
import { useDialogs } from './hooks/useDialogs';
import { useLastUpdated } from './hooks/useLastUpdated';
import { MOBILE_QUERY, useMediaQuery } from './hooks/useMediaQuery';
import { useThemeMode } from './hooks/useThemeMode';
import { useToast } from './hooks/useToast';
import type { CalendarEvent, NewEventData } from './types/events';
import type { Settings } from './types/settings';
import { downloadIcsForEvents } from './utils/calendarUtils';
import { ROUTES } from './config/routes';

// Lazy load page components
const CalendarPage = lazy(() => import('./pages/Calendar'));
const FaqPage = lazy(() => import('./pages/Faq'));
const EggPoolPage = lazy(() => import('./pages/EggPool'));
const RaidBossesPage = lazy(() => import('./pages/RaidBosses'));
const ResearchTasksPage = lazy(() => import('./pages/ResearchTasks'));
const RocketLineupPage = lazy(() => import('./pages/RocketLineup'));
const SearchStringBuilderPage = lazy(() => import('./pages/SearchStringBuilder'));
const PokemonFinderPage = lazy(() => import('./pages/PokemonFinder'));
const TypeMatchupsPage = lazy(() => import('./pages/TypeMatchups'));
const BonusTrackerPage = lazy(() => import('./pages/BonusTracker'));

function App() {
  const { settings, setSettings } = useSettingsContext();
  useThemeMode(settings.theme);
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const { activeDialog, openDialog, closeDialog } = useDialogs();
  const { toast, showToast, handleCloseToast } = useToast();
  const [eventToEdit, setEventToEdit] = useState<CalendarEvent | null>(null);

  const {
    historyLoading,
    historyError,
    filteredEvents,
    allEvents,
    savedEventIds,
    refetchEvents,
    refetchHistory,
    addEvent,
    updateEvent,
    deleteEvent,
  } = useCalendarContext();

  const {
    lastUpdated,
    loading: lastUpdatedLoading,
    error,
    refetch: refetchLastUpdated,
  } = useLastUpdated();

  const handleSettingsChange = useCallback(
    (newSettings: Partial<Settings>) => {
      setSettings((prev) => ({ ...prev, ...newSettings }));
    },
    [setSettings]
  );

  const handleRefresh = useCallback(async () => {
    try {
      await Promise.all([refetchEvents(), refetchLastUpdated()]);
      showToast('Data refreshed successfully!', 'success');
    } catch {
      showToast('Failed to refresh data.', 'error');
    }
  }, [refetchEvents, refetchLastUpdated, showToast]);

  const handleOpenEditDialog = useCallback(
    (event: CalendarEvent) => {
      setEventToEdit(event);
      openDialog('create');
    },
    [openDialog]
  );

  const handleCloseCreateDialog = useCallback(() => {
    closeDialog();
    setEventToEdit(null);
  }, [closeDialog]);

  const handleSaveEvent = useCallback(
    (eventData: NewEventData, eventId?: string) => {
      if (eventId) {
        updateEvent(eventId, eventData);
        showToast('Event updated successfully!', 'success');
      } else {
        addEvent(eventData);
        showToast('Event created successfully!', 'success');
      }
      handleCloseCreateDialog();
    },
    [addEvent, updateEvent, handleCloseCreateDialog, showToast]
  );

  const handleDeleteEvent = useCallback(
    (eventId: string) => {
      deleteEvent(eventId);
      showToast('Event deleted successfully', 'success');
    },
    [deleteEvent, showToast]
  );

  const handleExport = useCallback(
    async (eventsToExport: CalendarEvent[]) => {
      try {
        await downloadIcsForEvents(eventsToExport);
        showToast(`Exported ${eventsToExport.length} events!`, 'success');
      } catch (error) {
        showToast(
          error instanceof Error
            ? error.message
            : 'Failed to generate calendar export file',
          'error'
        );
      }
    },
    [showToast]
  );

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header
        onSettingsClick={() => openDialog('settings')}
        onRefresh={handleRefresh}
        onNewEventClick={() => openDialog('create')}
        onOpenExportDialog={() => openDialog('export')}
        lastUpdated={lastUpdated}
        lastUpdatedLoading={lastUpdatedLoading}
        lastUpdatedError={error}
        isMobile={isMobile}
      />
      <main className="flex-1 px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6">
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route element={<PageLayout />}>
                <Route
                  path={ROUTES.CALENDAR}
                  element={
                    <CalendarPage
                      onEditEvent={handleOpenEditDialog}
                      onDeleteEvent={handleDeleteEvent}
                      showToast={showToast}
                    />
                  }
                />
                <Route path={ROUTES.EGG_POOL} element={<EggPoolPage />} />
                <Route path={ROUTES.RAID_BOSSES} element={<RaidBossesPage />} />
                <Route path={ROUTES.RESEARCH_TASKS} element={<ResearchTasksPage />} />
                <Route path={ROUTES.ROCKET_LINEUP} element={<RocketLineupPage />} />
                <Route path={ROUTES.SEARCH_STRING_BUILDER} element={<SearchStringBuilderPage />} />
                <Route path={ROUTES.POKEMON_FINDER} element={<PokemonFinderPage />} />
                <Route path={ROUTES.TYPE_MATCHUPS} element={<TypeMatchupsPage />} />
                <Route path={ROUTES.BONUS_TRACKER} element={<BonusTrackerPage />} />
                <Route path={ROUTES.FAQ} element={<FaqPage />} />
              </Route>
              <Route path="*" element={<Navigate to={ROUTES.CALENDAR} replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />

      <SettingsDialog
        open={activeDialog === 'settings'}
        onClose={closeDialog}
        onSettingsChange={handleSettingsChange}
        historyLoading={historyLoading}
        historyError={historyError}
        onRetryEventHistory={() => {
          void refetchHistory().catch(() => undefined);
        }}
      />
      <CreateEventDialog
        open={activeDialog === 'create'}
        onClose={handleCloseCreateDialog}
        onSave={handleSaveEvent}
        eventToEdit={eventToEdit}
      />
      <ExportEventDialog
        open={activeDialog === 'export'}
        onClose={closeDialog}
        onExport={handleExport}
        allEvents={allEvents}
        filteredEvents={filteredEvents}
        savedEventIds={savedEventIds}
      />
      <Toaster toast={toast} onClose={handleCloseToast} />
      <ScrollToTop />
    </div>
  );
}

export default App;
