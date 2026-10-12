import {
  CalendarDays,
  Clock,
  ExternalLink,
  Pencil,
  Star,
  Trash2,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { CUSTOM_EVENT_CATEGORY } from '../../config/constants';
import { useNoteEditor } from '../../hooks/useNoteEditor';
import { useSettingsContext } from '../../hooks/useSettingsContext';
import type { ToastSeverity } from '../../hooks/useToast';
import { toDisplayPokemon, type CalendarEvent, type EventPokemon } from '../../types/events';
import { downloadIcsFile } from '../../utils/calendarUtils';
import { formatDateLine } from '../../utils/dateUtils';
import { getPokemonFieldTitle } from '../../utils/eventDetailUtils';
import { CategoryTag } from '../shared/CategoryTag';
import { DeleteConfirmationDialog } from '../shared/DeleteConfirmationDialog';
import { EventStatusTag } from '../shared/EventStatusTag';
import { ShinyIndicator } from '../shared/ShinyIndicator';
import { UnsavedChangesDialog } from '../shared/UnsavedChangesDialog';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent } from '../ui/dialog';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../ui/hover-card';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';

interface DetailSectionProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

function DetailSection({ title, children, icon }: DetailSectionProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-base font-bold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

interface EventDetailDialogProps {
  event: CalendarEvent | null;
  onClose: () => void;
  savedEventIds: string[];
  onToggleSaveEvent: (eventId: string) => void;
  onDeleteEvent: (eventId: string) => void;
  onUpdateNote: (eventId: string, noteText: string) => void;
  eventNotes: Record<string, string>;
  onEditEvent: (event: CalendarEvent) => void;
  showToast: (message: string, severity?: ToastSeverity) => void;
}

const PokemonBadge = ({ pokemon }: { pokemon: EventPokemon }) => {
  const badge = (
    <Badge variant="muted" className="gap-1.5 rounded-lg pl-1">
      {pokemon.asset_url && (
        <img
          src={pokemon.asset_url}
          alt=""
          className="h-5 w-5 object-contain"
        />
      )}
      {pokemon.name}
      {pokemon.shiny_available && <ShinyIndicator />}
    </Badge>
  );

  if (!pokemon.asset_url) {
    return badge;
  }

  return (
    <HoverCard openDelay={150} closeDelay={0}>
      <HoverCardTrigger asChild>{badge}</HoverCardTrigger>
      <HoverCardContent className="flex w-auto items-center justify-center p-2">
        <img
          src={pokemon.asset_url}
          alt={pokemon.name}
          className="h-20 w-20 object-contain"
        />
      </HoverCardContent>
    </HoverCard>
  );
};

const PokemonChipList = ({ items }: { items: (string | EventPokemon)[] }) => (
  <div className="flex flex-wrap gap-1.5">
    {items.map(toDisplayPokemon).map((pokemon) => (
      <PokemonBadge key={pokemon.name} pokemon={pokemon} />
    ))}
  </div>
);

function EventDetailDialog({
  event,
  onClose,
  savedEventIds,
  onToggleSaveEvent,
  onDeleteEvent,
  onEditEvent,
  onUpdateNote,
  eventNotes,
  showToast,
}: EventDetailDialogProps) {
  const { settings } = useSettingsContext();
  const { hour12 } = settings;
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const eventDetails = useMemo(() => {
    if (!event) return null;
    return {
      ...event.extendedProps,
      id: event.extendedProps.article_url,
      title: event.title,
      isCustomEvent: event.extendedProps.category === CUSTOM_EVENT_CATEGORY,
      isSaved: savedEventIds.includes(event.extendedProps.article_url),
      start: formatDateLine(event.start, hour12),
      end: event.end ? formatDateLine(event.end, hour12) : null,
    };
  }, [event, savedEventIds, hour12]);

  const onSaveNote = useCallback(
    (noteText: string) => {
      if (!eventDetails) return;
      onUpdateNote(eventDetails.id, noteText);
      showToast('Note saved successfully!', 'success');
    },
    [eventDetails, onUpdateNote, showToast]
  );

  const {
    noteText,
    isDirty,
    isUnsavedChangesDialogOpen,
    handleNoteChange,
    handleSave,
    handleClose,
    handleConfirmClose,
    closeUnsavedDialog,
  } = useNoteEditor(
    eventDetails ? eventNotes[eventDetails.id] || '' : '',
    onSaveNote,
    onClose
  );

  const handleDelete = useCallback(() => {
    if (!eventDetails) return;
    onDeleteEvent(eventDetails.id);
    setConfirmDeleteOpen(false);
    onClose();
  }, [eventDetails, onDeleteEvent, onClose]);

  if (!event || !eventDetails) {
    return null;
  }

  const {
    id,
    title,
    banner_url: bannerUrl,
    isCustomEvent,
    isSaved,
    category,
  } = eventDetails;

  return (
    <>
      <Dialog open onOpenChange={(o) => !o && handleClose()}>
        <DialogContent className="max-w-2xl" fullScreenOnMobile hideClose>
          <div className="relative h-[200px] w-full shrink-0">
            <img
              src={bannerUrl}
              alt={title}
              className="h-full w-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.1) 100%)',
              }}
            />

            <button
              type="button"
              aria-label={isSaved ? 'Unsave event' : 'Save event'}
              onClick={() => onToggleSaveEvent(id)}
              className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white transition-colors hover:bg-black/50"
            >
              <Star
                className="h-5 w-5"
                fill={isSaved ? 'currentColor' : 'none'}
              />
            </button>

            <div className="absolute bottom-0 left-0 w-full p-4">
              <div className="mb-2 flex flex-wrap items-center gap-1.5">
                <CategoryTag category={category} />
                <EventStatusTag
                  start={event.extendedProps.start_instant ?? event.start}
                  end={event.extendedProps.end_instant ?? event.end}
                />
              </div>
              <h2
                className="text-xl font-bold leading-tight text-white"
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
              >
                {title}
              </h2>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-4 flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5">
                <CalendarDays className="h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
                    Start Time
                  </p>
                  <p className="text-sm font-medium">{eventDetails.start}</p>
                </div>
              </div>

              {eventDetails.end && (
                <div className="flex items-center gap-2.5">
                  <Clock className="h-5 w-5 shrink-0 text-secondary" />
                  <div>
                    <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
                      End Time
                    </p>
                    <p className="text-sm font-medium">{eventDetails.end}</p>
                  </div>
                </div>
              )}
            </div>

            <Separator className="mb-4" />

            <div className="flex flex-col divide-y divide-border">
              {eventDetails.description && (
                <div className="pb-4">
                  <DetailSection title="Description">
                    <div className="flex flex-col gap-1">
                      {eventDetails.description
                        .split('\n')
                        .map((line, index) => {
                          const trimmedLine = line.trim();
                          if (!trimmedLine) return null;
                          const displayText = trimmedLine.startsWith('- ')
                            ? '• ' + trimmedLine.substring(2)
                            : trimmedLine;
                          return (
                            <p key={index} className="leading-relaxed">
                              {displayText}
                            </p>
                          );
                        })}
                    </div>
                  </DetailSection>
                </div>
              )}

              {eventDetails.bonuses && eventDetails.bonuses.length > 0 && (
                <div className="py-4">
                  <DetailSection title="Event Bonuses">
                    <div className="flex flex-col gap-1">
                      {eventDetails.bonuses.map((bonus) => (
                        <p key={bonus} className="pl-2 text-sm leading-relaxed">
                          • {bonus}
                        </p>
                      ))}
                    </div>
                  </DetailSection>
                </div>
              )}

              {Object.entries(eventDetails)
                .filter(([key, value]) => {
                  const nonPokemonFields = [
                    'category',
                    'article_url',
                    'banner_url',
                    'description',
                    'bonuses',
                    'id',
                    'title',
                    'isCustomEvent',
                    'isSaved',
                    'start',
                    'end',
                  ];
                  return (
                    !nonPokemonFields.includes(key) &&
                    Array.isArray(value) &&
                    value.length > 0
                  );
                })
                .map(([key, value]) => (
                  <div key={key} className="py-4">
                    <DetailSection title={getPokemonFieldTitle(key)}>
                      <PokemonChipList
                        items={value as (string | EventPokemon)[]}
                      />
                    </DetailSection>
                  </div>
                ))}

              <div className="pt-4">
                <DetailSection title="Notes">
                  <Textarea
                    rows={4}
                    placeholder="Add your personal notes here..."
                    value={noteText}
                    onChange={(e) => handleNoteChange(e.target.value)}
                  />
                </DetailSection>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-col-reverse items-center gap-3 border-t border-border p-3 sm:flex-row sm:justify-between">
            <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
              {!isCustomEvent && (
                <Button asChild>
                  <a href={id} target="_blank" rel="noopener noreferrer">
                    Learn More
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  void downloadIcsFile(event)
                    .then(() => showToast('Calendar file created!', 'success'))
                    .catch((error: unknown) =>
                      showToast(
                        error instanceof Error
                          ? error.message
                          : 'Failed to generate calendar file',
                        'error'
                      )
                    );
                }}
              >
                <CalendarDays className="h-4 w-4" />
                Add to Calendar
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-2 sm:justify-end">
              {isCustomEvent && (
                <>
                  <Button variant="ghost" onClick={() => onEditEvent(event)}>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setConfirmDeleteOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </>
              )}
              <Button onClick={handleSave} disabled={!isDirty}>
                Save
              </Button>
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <DeleteConfirmationDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        eventName={title}
      />
      <UnsavedChangesDialog
        open={isUnsavedChangesDialogOpen}
        onClose={closeUnsavedDialog}
        onConfirm={handleConfirmClose}
      />
    </>
  );
}

export default EventDetailDialog;
