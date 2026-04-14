import { createBrowserRouter } from 'react-router';
import { Root } from './pages/Root';
import { Home } from './pages/Home';
import { FreeZone } from './pages/FreeZone';
import { NotFound } from './pages/NotFound';
import { LeadForm } from './components/home/LeadForm';
import { Contact } from './pages/Contact';
import { About } from './pages/About';
import { OurServices } from './pages/OurServices';
import { IndiaServices } from './pages/IndiaServices';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: 'free-zone', Component: FreeZone },
      { path: 'our-services', Component: OurServices },
      { path: 'india-services', Component: IndiaServices },
      { path: 'leadform', Component: LeadForm },
      { path: 'contact', Component: Contact },
      { path: 'about', Component: About },
      { path: '*', Component: NotFound },
    ],
  },
]);
