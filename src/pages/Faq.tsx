import { ArrowLeft } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { PageHeader } from '../components/shared/PageHeader';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Button } from '../components/ui/button';

interface FaqLink {
  text: string;
  url: string;
}

interface FaqAnswer {
  type: 'text' | 'link' | 'code';
  content: string;
  link?: FaqLink;
}

interface FaqDataItem {
  question: string;
  answer: FaqAnswer[];
}

const faqData: FaqDataItem[] = [
  {
    question: 'What is this app and what was it built with?',
    answer: [
      {
        type: 'text',
        content:
          'This is a single-page application built to help players track Pokémon GO events. It was created with ',
      },
      { type: 'link', content: 'React', link: { text: 'React', url: 'https://react.dev/' } },
      { type: 'text', content: ', ' },
      {
        type: 'link',
        content: 'TypeScript',
        link: { text: 'TypeScript', url: 'https://www.typescriptlang.org/' },
      },
      { type: 'text', content: ', and ' },
      { type: 'link', content: 'Tailwind CSS', link: { text: 'Tailwind CSS', url: 'https://tailwindcss.com/' } },
      { type: 'text', content: '. The interactive calendar is powered by ' },
      { type: 'link', content: 'FullCalendar', link: { text: 'FullCalendar', url: 'https://fullcalendar.io/' } },
      { type: 'text', content: '.' },
    ],
  },
  {
    question: 'Is this an official Pokémon GO app?',
    answer: [
      {
        type: 'text',
        content:
          'No, this is a free, open-source, fan-made project created to help players track events. It is not affiliated with Niantic, Inc. or The Pokémon Company.',
      },
    ],
  },
  {
    question: 'Where does the event data come from?',
    answer: [
      { type: 'text', content: 'All event information is gratefully sourced from ' },
      { type: 'link', content: 'LeekDuck.com', link: { text: 'LeekDuck.com', url: 'https://leekduck.com/events/' } },
      {
        type: 'text',
        content:
          ' using a custom web scraper. The "Last Updated" time in the header shows when the data was last fetched.',
      },
    ],
  },
  {
    question: 'Are my custom events, saved events, and notes private?',
    answer: [
      {
        type: 'text',
        content:
          "Yes, absolutely. All your personal data, including custom events, saved event IDs, notes, filter settings, preferences, the Pokémon you mark as caught, and What's New progress, is stored exclusively in your browser's local storage. This data is never sent to any server.",
      },
    ],
  },
  {
    question: 'What are the Egg Pool, Raid Bosses, Research Tasks, and Rocket Lineup pages?',
    answer: [
      {
        type: 'text',
        content:
          'These pages display current game data sourced from LeekDuck.com. The Egg Pool shows which Pokémon can hatch from different egg types with rarity tiers. Raid Bosses lists current raid encounters with CP ranges for perfect IV catches. Research Tasks shows field research rewards from PokéStops. Rocket Lineup displays Team GO Rocket leader battle lineups with possible encounter Pokémon.',
      },
    ],
  },
  {
    question: 'What is in the Tools menu?',
    answer: [
      {
        type: 'text',
        content:
          "The Search String Builder turns filters into a search you can paste into your Pokémon storage. Pokémon Finder lists every Pokémon offered by a current or upcoming event, raid, egg, research task, or Rocket encounter, can narrow that to a name, a source, or shiny-eligible Pokémon, and tracks which ones you have caught. Type Matchups shows what a raid boss is weak to and copies a search for counters. Bonus Tracker lists active and upcoming event bonuses by type. What's New shows what appeared since you last checked.",
      },
      {
        type: 'text',
        content:
          'Search keywords such as "shiny" or "4*" are English and only work with the game set to English. The "Copy search string" buttons on the data pages use Pokédex numbers instead, which work in any language.',
      },
    ],
  },
  {
    question: 'Can I create my own custom events?',
    answer: [
      {
        type: 'text',
        content:
          "Yes! Click the 'Create Event' button in the header to add your own custom events to the calendar. These could be local community events, raid hours with friends, or personal reminders. Custom events are stored locally in your browser and will appear on the calendar alongside official Pokémon GO events.",
      },
    ],
  },
  {
    question: 'What does the "Save Event" feature do?',
    answer: [
      {
        type: 'text',
        content:
          "You can save (bookmark) events you're interested in by clicking the star icon in the event details. Saved events appear with a filled star and can be filtered using the 'Saved Only' toggle in the filters menu. This makes it easy to track events you plan to attend.",
      },
    ],
  },
  {
    question: 'How do the date and time filters work?',
    answer: [
      {
        type: 'text',
        content:
          "The date pickers allow you to set a start and end date for the events you want to see. The 'Time of Day' slider filters events based on their start time. For example, setting the slider from 6 PM (18:00) to 11 PM (23:00) will only show events that begin within that window.",
      },
    ],
  },
  {
    question: 'How does the "Active Only" filter work?',
    answer: [
      {
        type: 'text',
        content:
          'When you enable the "Active Only" switch, the calendar will only display events that are currently in progress at this very moment (i.e., the current time is between the event\'s start and end times).',
      },
    ],
  },
  {
    question: 'What does the "Add to Calendar" button do?',
    answer: [
      { type: 'text', content: 'This feature downloads an ' },
      { type: 'code', content: '.ics' },
      {
        type: 'text',
        content:
          ' file for the specific event. You can open this file with most standard calendar applications (like Google Calendar, Apple Calendar, or Outlook) to add the event directly to your personal calendar.',
      },
    ],
  },
  {
    question: 'Can I export multiple events at once?',
    answer: [
      {
        type: 'text',
        content:
          'Yes! Use the export button in the header to select and export multiple events to a single ',
      },
      { type: 'code', content: '.ics' },
      {
        type: 'text',
        content:
          ' file. This allows you to add several Pokémon GO events to your personal calendar at once, saving time when planning your gameplay schedule.',
      },
    ],
  },
  {
    question: 'What can I customize in Settings?',
    answer: [
      {
        type: 'text',
        content:
          'Settings let you choose the theme, first day of the week, default calendar view, time zone, and 12- or 24-hour time format. Event display options control Pokémon sprites, rotation for multi-Pokémon events, event times in month view, and opt-in historical events. Historical coverage begins in 2025, and the archive is downloaded only when enabled. These preferences are stored in your browser.',
      },
    ],
  },
  {
    question: 'How can I suggest a feature or report a bug?',
    answer: [
      { type: 'text', content: "Feedback is always welcome! Please visit the project's " },
      {
        type: 'link',
        content: 'GitHub Issues page',
        link: { text: 'GitHub Issues page', url: 'https://github.com/pokelitee/pogo-calendar/issues' },
      },
      { type: 'text', content: ' to report a bug or suggest a new feature.' },
    ],
  },
];

function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Frequently Asked Questions"
        description="Here are answers to some common questions about the PoGo Calendar"
      />
      <Accordion type="single" collapsible className="mb-8 flex flex-col gap-2">
        {faqData.map((item) => (
          <AccordionItem
            key={item.question}
            value={item.question}
            className="rounded-md border border-border px-4 last:border-b"
          >
            <AccordionTrigger className="text-base">{item.question}</AccordionTrigger>
            <AccordionContent className="border-t border-border pt-3 leading-relaxed text-muted-foreground">
              {item.answer.map((part, index) => {
                if (part.type === 'link' && part.link) {
                  return (
                    <a
                      key={index}
                      href={part.link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary no-underline hover:underline"
                    >
                      {part.link.text}
                    </a>
                  );
                } else if (part.type === 'code') {
                  return (
                    <code key={index} className="rounded bg-accent px-1.5 py-0.5">
                      {part.content}
                    </code>
                  );
                }
                return part.content;
              })}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="pt-2 text-center">
        <Button asChild>
          <RouterLink to="/">
            <ArrowLeft className="h-4 w-4" />
            Back to Calendar
          </RouterLink>
        </Button>
      </div>
    </div>
  );
}

export default FaqPage;
