import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.tsx';
import { CalendarProvider } from './contexts/CalendarProvider.tsx';
import { PageFiltersProvider } from './contexts/PageFiltersProvider.tsx';
import { SettingsProvider } from './contexts/SettingsProvider.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <SettingsProvider>
        <CalendarProvider>
          <PageFiltersProvider>
            <App />
          </PageFiltersProvider>
        </CalendarProvider>
      </SettingsProvider>
    </HashRouter>
  </StrictMode>
);
