import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import type { CalendarEvent } from '../types/events';
import { useEventDataContext } from './useEventDataContext';

/**
 * Returns a function that opens an event's details on the Calendar page.
 */
export function useOpenEventOnCalendar() {
  const { setSelectedEvent } = useEventDataContext();
  const navigate = useNavigate();
  return useCallback(
    (event: CalendarEvent) => {
      setSelectedEvent(event);
      navigate(ROUTES.CALENDAR);
    },
    [setSelectedEvent, navigate]
  );
}
