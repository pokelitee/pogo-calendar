import type {
  DateSelectArg,
  DatesSetArg,
  EventClickArg,
  EventContentArg,
  FormatterInput,
} from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import FullCalendar from '@fullcalendar/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useCalendarContext } from '../../hooks/useCalendarContext';
import { HOVER_QUERY, useMediaQuery } from '../../hooks/useMediaQuery';
import { useSettingsContext } from '../../hooks/useSettingsContext';
import type { CalendarEvent } from '../../types/events';
import type { CalendarView } from '../../types/settings';
import { Card } from '../ui/card';
import EventHoverDetails from '../events/EventHoverDetails';
import { CalendarEventContent } from './CalendarEventContent';
import { CalendarToolbar } from './CalendarToolbar';

interface EventCalendarProps {
  view: CalendarView;
  isMobile: boolean;
}

function EventCalendar({ view, isMobile }: EventCalendarProps) {
  const {
    filteredEvents: events,
    savedEventIds,
    setSelectedEvent: onSelectEvent,
    handleToggleSaveEvent: onToggleSaveEvent,
    setCurrentView: onViewChange,
    filters: { startDate: filterStartDate, endDate: filterEndDate },
    setFilters,
  } = useCalendarContext();
  const calendarRef = useRef<FullCalendar>(null);
  const { settings } = useSettingsContext();
  const { firstDay, hour12, timezone } = settings;
  const canHover = useMediaQuery(HOVER_QUERY);
  const [title, setTitle] = useState('');

  const [popoverState, setPopoverState] = useState<{
    event: CalendarEvent | null;
    position: { top: number; left: number } | null;
  }>({ event: null, position: null });

  useEffect(() => {
    const timer = setTimeout(() => {
      calendarRef.current?.getApi().changeView(view);
    }, 0);
    return () => clearTimeout(timer);
  }, [view]);

  const eventTimeFormat: FormatterInput = {
    hour: isMobile ? 'numeric' : hour12 ? 'numeric' : '2-digit',
    minute: isMobile ? undefined : '2-digit',
    meridiem: isMobile ? 'short' : hour12,
  };

  const findOriginalEvent = useCallback(
    (fcEvent: { extendedProps: { article_url?: string; [key: string]: unknown } }) => {
      const articleUrl = fcEvent.extendedProps.article_url as string;
      return events.find((e) => e.extendedProps.article_url === articleUrl) || null;
    },
    [events]
  );

  const handleEventClick = useCallback(
    (clickInfo: EventClickArg) => {
      onSelectEvent(findOriginalEvent(clickInfo.event));
    },
    [findOriginalEvent, onSelectEvent]
  );

  const handleDatesSet = useCallback(
    (dateInfo: DatesSetArg) => {
      setTitle(dateInfo.view.title);
      onViewChange(dateInfo.view.type);
    },
    [onViewChange]
  );

  const setDateRange = useCallback(
    (startDate: Date | null, endDate: Date | null) => {
      setFilters((prev) => ({ ...prev, startDate, endDate }));
    },
    [setFilters]
  );

  const handleDateSelect = useCallback(
    (selectionInfo: DateSelectArg) => {
      const { start, end } = selectionInfo;
      const inclusiveEnd = new Date(end.getTime() - 1);

      if (
        filterStartDate &&
        filterEndDate &&
        start.toDateString() === filterStartDate.toDateString() &&
        inclusiveEnd.toDateString() === filterEndDate.toDateString()
      ) {
        setDateRange(null, null);
        calendarRef.current?.getApi().unselect();
        return;
      }

      setDateRange(start, inclusiveEnd);
    },
    [filterStartDate, filterEndDate, setDateRange]
  );

  const getEventClassSelector = (url: string) => {
    return `event-${url.replace(/[^a-zA-Z0-9]/g, '_')}`;
  };

  const handlePopoverOpen = useCallback(
    (event: React.MouseEvent<HTMLElement>, calendarEvent: CalendarEvent) => {
      // Touch devices emulate mouseenter on tap, which would leave the preview
      // stuck open behind the detail dialog.
      if (!canHover) return;

      const originalEvent = findOriginalEvent(calendarEvent);

      // Highlighting Logic
      const selector = getEventClassSelector(calendarEvent.extendedProps.article_url);
      const elements = document.querySelectorAll(`.${selector}`);
      elements.forEach((el) => el.classList.add('event-highlight'));

      setPopoverState({
        event: originalEvent,
        position: { top: event.clientY, left: event.clientX },
      });
    },
    [canHover, findOriginalEvent]
  );

  const handlePopoverClose = useCallback(() => {
    // Remove highlight from all events
    const elements = document.querySelectorAll('.event-highlight');
    elements.forEach((el) => el.classList.remove('event-highlight'));

    setPopoverState({ event: null, position: null });
  }, []);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (popoverState.event) {
        setPopoverState((current) => ({
          ...current,
          position: { top: event.clientY, left: event.clientX },
        }));
      }
    },
    [popoverState.event]
  );

  const renderEventContent = useCallback(
    (eventInfo: EventContentArg) => {
      const article_url = eventInfo.event.extendedProps.article_url;
      const isSaved = savedEventIds.includes(article_url);

      return (
        <CalendarEventContent
          eventInfo={eventInfo}
          isSaved={isSaved}
          onToggleSave={onToggleSaveEvent}
          onMouseEnter={handlePopoverOpen}
          onMouseLeave={handlePopoverClose}
        />
      );
    },
    [savedEventIds, onToggleSaveEvent, handlePopoverOpen, handlePopoverClose]
  );

  return (
    <>
      <Card className="p-3 md:p-4" onMouseMove={handleMouseMove}>
        <CalendarToolbar
          title={title}
          onPrev={() => calendarRef.current?.getApi().prev()}
          onNext={() => calendarRef.current?.getApi().next()}
          onToday={() => calendarRef.current?.getApi().today()}
        />
        <div className="calendar-scroll-shell">
          <FullCalendar
            key={timezone}
            ref={calendarRef}
            plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
            headerToolbar={false}
            initialView={view}
            events={events}
            eventClick={handleEventClick}
            eventContent={renderEventContent}
            height="auto"
            aspectRatio={isMobile ? 1.15 : 1.75}
            dayMaxEvents={false}
            dayMaxEventRows={false}
            expandRows={false}
            eventBackgroundColor="transparent"
            eventBorderColor="transparent"
            datesSet={handleDatesSet}
            views={{
              dayGridMonth: { titleFormat: { month: isMobile ? 'short' : 'long', year: 'numeric' } },
              listWeek: { titleFormat: { month: 'short', day: 'numeric', year: 'numeric' } },
            }}
            firstDay={firstDay}
            selectable={true}
            select={handleDateSelect}
            unselectAuto={false}
            eventTimeFormat={eventTimeFormat}
            timeZone={timezone}
            eventClassNames={(arg) => {
              return getEventClassSelector(arg.event.extendedProps.article_url);
            }}
          />
        </div>
      </Card>

      <EventHoverDetails
        open={Boolean(popoverState.event)}
        mousePosition={popoverState.position}
        event={popoverState.event}
        onClose={handlePopoverClose}
      />
    </>
  );
}

export default EventCalendar;
