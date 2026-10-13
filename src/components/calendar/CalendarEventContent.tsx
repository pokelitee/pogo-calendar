import type { EventDisplayInfo } from '@fullcalendar/react';
import { Star } from 'lucide-react';
import React from 'react';
import { useSettingsContext } from '../../hooks/useSettingsContext';
import { useResolvedThemeMode } from '../../hooks/useThemeMode';
import { cn } from '../../lib/utils';
import type { CalendarEvent } from '../../types/events';
import { getCalendarSprites } from '../../utils/calendarSpriteUtils';
import { colorWithAlpha, getColorForCategory } from '../../utils/colorUtils';
import { formatEventTimeText } from '../../utils/dateUtils';
import { RotatingPokemonSprite } from './RotatingPokemonSprite';

interface CalendarEventContentProps {
  eventInfo: EventDisplayInfo;
  isSaved: boolean;
  onToggleSave: (eventId: string) => void;
  onMouseEnter: (e: React.MouseEvent<HTMLElement>, event: CalendarEvent) => void;
  onMouseLeave: () => void;
}

export const CalendarEventContent = React.memo(function CalendarEventContent({
  eventInfo,
  isSaved,
  onToggleSave,
  onMouseEnter,
  onMouseLeave,
}: CalendarEventContentProps) {
  const { settings } = useSettingsContext();
  const mode = useResolvedThemeMode(settings.theme);
  const { category, article_url } = eventInfo.event.extendedProps;
  const baseColor = getColorForCategory(category, mode);
  const calendarEvent = eventInfo.event as unknown as CalendarEvent;
  const sprites = settings.showPokemonSprites ? getCalendarSprites(calendarEvent) : [];
  const isListView = eventInfo.view.type.startsWith('list');
  const showEventTime = settings.showEventTimes && eventInfo.view.type === 'dayGridMonth';
  const timeText = formatEventTimeText(eventInfo.timeText);

  const pill = (
    <div
      className="calendar-event-pill flex min-h-6 w-full cursor-pointer items-center justify-between gap-1 rounded-sm pl-1.5 text-xs"
      style={
        {
          '--event-color': baseColor,
          '--event-bg': colorWithAlpha(baseColor, 0.14),
          '--event-bg-active': colorWithAlpha(baseColor, 0.26),
        } as React.CSSProperties
      }
      onMouseEnter={(e) => onMouseEnter(e, calendarEvent)}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex min-w-0 flex-1 items-center gap-1.5 whitespace-nowrap">
        {showEventTime && timeText && (
          <span className="min-w-fit font-semibold tabular-nums opacity-75">{timeText}</span>
        )}
        {sprites.length > 0 && (
          <RotatingPokemonSprite
            key={article_url}
            eventId={article_url}
            rotate={settings.rotatePokemonSprites}
            sprites={sprites}
          />
        )}
        <span className="min-w-0 truncate font-medium">
          {eventInfo.event.title}
        </span>
      </div>

      <button
        type="button"
        aria-label={isSaved ? 'Remove from saved events' : 'Save event'}
        aria-pressed={isSaved}
        onClick={(e) => {
          e.stopPropagation();
          onToggleSave(article_url);
        }}
        className="flex size-6 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-warning focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Star className={cn('size-3.5', isSaved && 'fill-warning text-warning')} />
      </button>
    </div>
  );

  // FullCalendar 7 lets eventContent replace the whole list row, including the
  // time column it used to render itself, so list views draw it here.
  if (!isListView) return pill;
  return (
    <div className="flex w-full min-w-0 items-center gap-3">
      <span className="w-28 shrink-0 text-xs tabular-nums text-muted-foreground sm:w-36">{timeText}</span>
      <div className="min-w-0 flex-1">{pill}</div>
    </div>
  );
});
