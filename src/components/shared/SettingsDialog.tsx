import { MonitorCog, Moon, Sun, X } from 'lucide-react';
import React, { useMemo } from 'react';
import { dayOptions } from '../../config/eventFilter';
import { useSettingsContext } from '../../hooks/useSettingsContext';
import type { Settings, ThemeSetting } from '../../types/settings';
import { getTimeZoneOptions } from '../../utils/timeZones';
import { Button } from '../ui/button';
import { Combobox } from '../ui/combobox';
import { IconButton } from '../ui/icon-button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Sheet, SheetBody, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { Switch } from '../ui/switch';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';

const themeOptions: { value: ThemeSetting; text: string; Icon: React.ElementType }[] = [
  { value: 'light', text: 'Light', Icon: Sun },
  { value: 'dark', text: 'Dark', Icon: Moon },
  { value: 'auto', text: 'Auto', Icon: MonitorCog },
];

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  onSettingsChange: (newSettings: Partial<Settings>) => void;
  historyLoading: boolean;
  historyError: string | null;
  onRetryEventHistory: () => void;
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="px-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
        {children}
      </div>
    </section>
  );
}

function SettingsDialogComponent({
  open,
  onClose,
  onSettingsChange,
  historyLoading,
  historyError,
  onRetryEventHistory,
}: SettingsDialogProps) {
  const { settings } = useSettingsContext();
  // Built only while the dialog is open; formatting ~400 zones isn't free.
  const timezones = useMemo(
    () => (open ? getTimeZoneOptions(settings.timezone) : []),
    [open, settings.timezone]
  );

  const handleSettingChange = (field: keyof Settings, value: string | number | boolean) => {
    onSettingsChange({ [field]: value });
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="max-w-md">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <IconButton onClick={onClose} aria-label="Close settings">
            <X className="h-4 w-4" />
          </IconButton>
        </SheetHeader>
        <SheetBody className="space-y-5">
          <SettingsSection title="Appearance">
            <div className="space-y-2.5 p-3">
              <Label>Theme</Label>
              <ToggleGroup
                type="single"
                value={settings.theme}
                onValueChange={(value) => value && handleSettingChange('theme', value)}
                className="grid w-full grid-cols-3"
              >
                {themeOptions.map(({ value, text, Icon }) => (
                  <ToggleGroupItem key={value} value={value} className="w-full">
                    <Icon />
                    {text}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          </SettingsSection>

          <SettingsSection title="Calendar Display">
            <div className="space-y-2 p-3">
              <Label>Week Starts On</Label>
              <Select
                value={String(settings.firstDay)}
                onValueChange={(value) => handleSettingChange('firstDay', Number(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dayOptions.map((day) => (
                    <SelectItem key={day.value} value={String(day.value)}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2.5 p-3">
              <Label>Default View</Label>
              <ToggleGroup
                type="single"
                value={settings.defaultCalendarView}
                onValueChange={(value) =>
                  value && handleSettingChange('defaultCalendarView', value)
                }
                className="grid w-full grid-cols-3"
              >
                <ToggleGroupItem value="auto" className="w-full">
                  Automatic
                </ToggleGroupItem>
                <ToggleGroupItem value="dayGridMonth" className="w-full">
                  Month
                </ToggleGroupItem>
                <ToggleGroupItem value="listWeek" className="w-full">
                  List
                </ToggleGroupItem>
              </ToggleGroup>
              <p className="text-xs text-muted-foreground">
                Automatic uses Month on larger screens and List on mobile
              </p>
            </div>
          </SettingsSection>

          <SettingsSection title="Event Display">
            <div className="flex items-center justify-between gap-4 p-3">
              <div className="space-y-0.5">
                <Label htmlFor="show-pokemon-sprites">Pokémon Sprites</Label>
                <p className="text-xs text-muted-foreground">
                  Show Pokémon sprites in calendar events
                </p>
              </div>
              <Switch
                id="show-pokemon-sprites"
                checked={settings.showPokemonSprites}
                onCheckedChange={(checked) =>
                  handleSettingChange('showPokemonSprites', checked)
                }
              />
            </div>
            <div className="flex items-center justify-between gap-4 p-3">
              <div className="space-y-0.5">
                <Label htmlFor="rotate-pokemon-sprites">Rotate Multiple Sprites</Label>
                <p className="text-xs text-muted-foreground">
                  Cycle through Pokémon for multi-Pokémon events
                </p>
              </div>
              <Switch
                id="rotate-pokemon-sprites"
                checked={settings.rotatePokemonSprites}
                disabled={!settings.showPokemonSprites}
                onCheckedChange={(checked) =>
                  handleSettingChange('rotatePokemonSprites', checked)
                }
              />
            </div>
            <div className="flex items-center justify-between gap-4 p-3">
              <div className="space-y-0.5">
                <Label htmlFor="show-event-times">Event Times</Label>
                <p className="text-xs text-muted-foreground">
                  Show event times in Month view
                </p>
              </div>
              <Switch
                id="show-event-times"
                checked={settings.showEventTimes}
                onCheckedChange={(checked) => handleSettingChange('showEventTimes', checked)}
              />
            </div>
            <div className="flex items-start justify-between gap-4 p-3">
              <div className="space-y-0.5">
                <Label htmlFor="show-event-history">Event History</Label>
                <p className="text-xs text-muted-foreground">
                  Load archived official events from every year leak-duck has
                  archived; earlier events are unavailable.
                </p>
                {historyLoading && settings.showEventHistory && (
                  <p className="text-xs text-muted-foreground" role="status">
                    Loading historical events…
                  </p>
                )}
                {historyError && settings.showEventHistory && (
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-destructive" role="alert">
                      {historyError}
                    </p>
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs"
                      onClick={onRetryEventHistory}
                    >
                      Retry
                    </Button>
                  </div>
                )}
              </div>
              <Switch
                id="show-event-history"
                checked={settings.showEventHistory}
                onCheckedChange={(checked) =>
                  handleSettingChange('showEventHistory', checked)
                }
              />
            </div>
          </SettingsSection>

          <SettingsSection title="Time & Date">
            <div className="space-y-2 p-3">
              <Label>Time Zone</Label>
              <Combobox
                value={settings.timezone}
                onChange={(value) => handleSettingChange('timezone', value)}
                options={timezones.map((tz) => ({ value: tz.value, label: tz.text }))}
                placeholder="Select timezone"
                searchPlaceholder="Search timezones..."
              />
            </div>
            <div className="space-y-2.5 p-3">
              <Label>Time Format</Label>
              <ToggleGroup
                type="single"
                value={String(settings.hour12)}
                onValueChange={(value) => value && handleSettingChange('hour12', value === 'true')}
                className="grid w-full grid-cols-2"
              >
                <ToggleGroupItem value="true" className="w-full">
                  12-hour
                </ToggleGroupItem>
                <ToggleGroupItem value="false" className="w-full">
                  24-hour
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </SettingsSection>
        </SheetBody>
        <div className="flex shrink-0 justify-end border-t border-border px-4 py-3">
          <Button onClick={onClose}>Done</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export const SettingsDialog = React.memo(SettingsDialogComponent);
SettingsDialog.displayName = 'SettingsDialog';
