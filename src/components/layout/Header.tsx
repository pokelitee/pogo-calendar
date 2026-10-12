import {
  Calendar as CalendarIcon,
  ChevronDown,
  Clipboard,
  Egg,
  Filter,
  HelpCircle,
  Menu,
  RefreshCw,
  Ship,
  Sliders,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import React, { useState, type ReactNode } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { ROUTES } from '../../config/routes';
import { TOOLS } from '../../config/tools';
import { cn } from '../../lib/utils';
import { useCalendarContext } from '../../hooks/useCalendarContext';
import { usePageFiltersContext } from '../../hooks/usePageFiltersContext';
import { useScrollTrigger } from '../../hooks/useScrollTrigger';
import EggPoolFilter from '../filters/EggPoolFilter';
import EventFilter from '../filters/EventFilter';
import RaidBossFilter from '../filters/RaidBossFilter';
import ResearchTaskFilter from '../filters/ResearchTaskFilter';
import RocketLineupFilter from '../filters/RocketLineupFilter';
import { IconButton } from '../ui/icon-button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Sheet, SheetBody, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { Button } from '../ui/button';
import LogoIcon from '/icon.svg';

interface NavLink {
  label: string;
  path: string;
  icon: LucideIcon;
}

interface NavGroup {
  label: string;
  items: NavLink[];
}

type NavEntry = NavLink | NavGroup;

const NAV_ENTRIES: NavEntry[] = [
  { label: 'Calendar', path: ROUTES.CALENDAR, icon: CalendarIcon },
  {
    label: 'Game Data',
    items: [
      { label: 'Egg Pool', path: ROUTES.EGG_POOL, icon: Egg },
      { label: 'Raid Bosses', path: ROUTES.RAID_BOSSES, icon: Zap },
      { label: 'Research', path: ROUTES.RESEARCH_TASKS, icon: Clipboard },
      { label: 'Rocket', path: ROUTES.ROCKET_LINEUP, icon: Ship },
    ],
  },
  {
    label: 'Tools',
    items: TOOLS,
  },
  { label: 'FAQ', path: ROUTES.FAQ, icon: HelpCircle },
];

const isNavGroup = (entry: NavEntry): entry is NavGroup => 'items' in entry;

const NAV_LINKS = NAV_ENTRIES.flatMap((entry) => (isNavGroup(entry) ? entry.items : [entry]));

const NAV_LINK_CLASSNAME =
  'rounded-md px-3 py-1.5 text-sm font-semibold text-muted-foreground no-underline transition-colors duration-150 hover:bg-accent hover:text-foreground';

function NavMenuLink({ item }: { item: NavLink }) {
  const Icon = item.icon;
  return (
    <DropdownMenuItem asChild>
      <RouterLink to={item.path} className="no-underline text-inherit">
        <Icon className="h-4 w-4" />
        {item.label}
      </RouterLink>
    </DropdownMenuItem>
  );
}

interface HeaderProps {
  onSettingsClick: () => void;
  onRefresh: () => void;
  onNewEventClick: () => void;
  onOpenExportDialog: () => void;
  lastUpdated: string | null;
  lastUpdatedLoading: boolean;
  lastUpdatedError: string | null;
  isMobile: boolean;
}

interface FilterPanel {
  content: ReactNode;
  activeFilterCount: number;
}

function HeaderComponent({
  onSettingsClick,
  onRefresh,
  onNewEventClick,
  onOpenExportDialog,
  lastUpdated,
  lastUpdatedLoading,
  lastUpdatedError,
  isMobile,
}: HeaderProps) {
  const trigger = useScrollTrigger(0);
  const location = useLocation();
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const { activeFilterCount } = useCalendarContext();
  const pageFilters = usePageFiltersContext();

  const filterPanels: Partial<Record<string, FilterPanel>> = {
    [ROUTES.CALENDAR]: {
      content: <EventFilter onNewEventClick={onNewEventClick} onOpenExportDialog={onOpenExportDialog} />,
      activeFilterCount,
    },
    [ROUTES.EGG_POOL]: { content: <EggPoolFilter />, activeFilterCount: pageFilters.eggPool.activeFilterCount },
    [ROUTES.RAID_BOSSES]: { content: <RaidBossFilter />, activeFilterCount: pageFilters.raidBoss.activeFilterCount },
    [ROUTES.RESEARCH_TASKS]: {
      content: <ResearchTaskFilter />,
      activeFilterCount: pageFilters.researchTask.activeFilterCount,
    },
    [ROUTES.ROCKET_LINEUP]: {
      content: <RocketLineupFilter />,
      activeFilterCount: pageFilters.rocketLineup.activeFilterCount,
    },
  };
  const filterPanel = filterPanels[location.pathname];
  const filterCount = filterPanel?.activeFilterCount ?? 0;
  const currentNavLabel = NAV_LINKS.find((item) => item.path === location.pathname)?.label || 'Calendar';

  const filterTriggerButton = (
    <div className="relative">
      <IconButton
        onClick={() => setFilterSheetOpen(true)}
        aria-label="Search & filters"
        title="Search & filters"
      >
        <Filter />
      </IconButton>
      {filterCount > 0 && (
        <span className="pointer-events-none absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.65rem] font-bold text-primary-foreground">
          {filterCount}
        </span>
      )}
    </div>
  );

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-border backdrop-blur-md transition-colors duration-200',
        trigger ? 'bg-card shadow-soft-sm' : 'bg-card/80'
      )}
    >
      <div className="flex h-16 w-full items-center gap-2 px-3 sm:px-4 md:gap-3 md:px-6">
        <RouterLink
          to="/"
          className="flex shrink-0 items-center gap-2 text-inherit no-underline"
        >
          <img src={LogoIcon} alt="PoGo Calendar" className="h-8 w-8" />
          <span className="hidden text-lg font-bold tracking-tight md:block">
            PoGo Calendar
          </span>
        </RouterLink>

        <nav className="ml-2 hidden shrink-0 items-center gap-0.5 lg:flex">
          {NAV_ENTRIES.map((entry) => {
            if (isNavGroup(entry)) {
              const activeItem = entry.items.find((item) => item.path === location.pathname);
              return (
                <DropdownMenu key={entry.label}>
                  <DropdownMenuTrigger
                    className={cn(
                      NAV_LINK_CLASSNAME,
                      'inline-flex items-center gap-1 outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      activeItem && 'bg-accent text-primary'
                    )}
                  >
                    {activeItem ? `${entry.label}: ${activeItem.label}` : entry.label}
                    <ChevronDown className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="min-w-[200px]">
                    {entry.items.map((item) => (
                      <NavMenuLink key={item.path} item={item} />
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }
            return (
              <RouterLink
                key={entry.path}
                to={entry.path}
                className={cn(NAV_LINK_CLASSNAME, entry.path === location.pathname && 'bg-accent text-primary')}
              >
                {entry.label}
              </RouterLink>
            );
          })}
        </nav>

        <div className="flex-1" />

        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="hidden text-muted-foreground md:inline-flex"
            title={lastUpdatedError ? lastUpdatedError : lastUpdatedLoading ? 'Refreshing…' : 'Refresh data'}
          >
            <RefreshCw className={cn(lastUpdatedLoading && 'animate-spin')} />
            <span className="hidden lg:inline">
              {lastUpdatedError ? 'Update failed' : lastUpdatedLoading ? 'Updating…' : `Updated ${lastUpdated}`}
            </span>
          </Button>

          <div className="mx-1 hidden h-6 w-px bg-border md:block" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {isMobile ? (
                <IconButton aria-label="Open navigation" title="Navigation">
                  <Menu />
                </IconButton>
              ) : (
                <Button variant="ghost" className="lg:hidden">
                  {currentNavLabel}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[200px]">
              {NAV_ENTRIES.map((entry, index) =>
                isNavGroup(entry) ? (
                  <React.Fragment key={entry.label}>
                    {index > 0 && <DropdownMenuSeparator />}
                    <DropdownMenuLabel>{entry.label}</DropdownMenuLabel>
                    {entry.items.map((item) => (
                      <NavMenuLink key={item.path} item={item} />
                    ))}
                    {index < NAV_ENTRIES.length - 1 && !isNavGroup(NAV_ENTRIES[index + 1]) && (
                      <DropdownMenuSeparator />
                    )}
                  </React.Fragment>
                ) : (
                  <NavMenuLink key={entry.path} item={entry} />
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {filterPanel && (
            <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
              <SheetTrigger asChild>{filterTriggerButton}</SheetTrigger>
              <SheetContent side="right" className="max-w-md">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <IconButton
                    onClick={() => setFilterSheetOpen(false)}
                    aria-label="Close filters"
                    title="Close filters"
                  >
                    <X className="h-4 w-4" />
                  </IconButton>
                </SheetHeader>
                <SheetBody>{filterPanel.content}</SheetBody>
              </SheetContent>
            </Sheet>
          )}

          <IconButton onClick={onSettingsClick} aria-label="Settings" title="Settings">
            <Sliders />
          </IconButton>
        </div>
      </div>
    </header>
  );
}

export default React.memo(HeaderComponent);
