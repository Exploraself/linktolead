/* Small line icons for the Growth Toolkit. Each one tells the founder
 * something before they read: what the place is, what happens next.
 * 24 by 24, drawn in the current text colour, hidden from screen readers
 * (the words beside them always carry the meaning). */
const svg = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${d}</svg>`;

export const ICONS = {
  /** A toolbox with an arrow rising out of it: the Growth Toolkit. */
  toolkit: svg('<path d="M9 8V6.4c0-.8.6-1.4 1.4-1.4h3.2c.8 0 1.4.6 1.4 1.4V8"/><rect x="3" y="8" width="18" height="12" rx="2.2"/><path d="M12 17.2v-5.4M9.6 14.1 12 11.7l2.4 2.4"/>'),
  /** You and one of your people: Personal leadership. */
  personal: svg('<circle cx="9.5" cy="8" r="3.2"/><path d="M3.5 19.5c.5-3.3 2.9-5.4 6-5.4s5.5 2.1 6 5.4"/><path d="M16 5.1a3.2 3.2 0 0 1 0 5.8M17.6 14.4c1.6.8 2.6 2.4 2.9 5.1"/>'),
  /** Bars climbing, with the trend above them: Business. */
  business: svg('<path d="M4 20h16"/><path d="M7.5 17v-3M12 17v-5.5M16.5 17V9"/><path d="M5 10.5 9.5 6.8l3 2.4L18 4.5M15 4.5h3v3"/>'),
  /** An hourglass: being built, not ready yet. */
  soon: svg('<path d="M7 3.5h10M7 20.5h10"/><path d="M8 3.5c0 4.2 4 5.2 4 8.5s-4 4.3-4 8.5M16 3.5c0 4.2-4 5.2-4 8.5s4 4.3 4 8.5"/>'),
  /** A letter: we email you something. */
  mail: svg('<rect x="3" y="5.5" width="18" height="13" rx="2.2"/><path d="m3.8 7.2 8.2 6.2 8.2-6.2"/>'),
  /** A key: type the code and you are in. */
  key: svg('<circle cx="8" cy="12" r="3.6"/><path d="M11.6 12H21M17.6 12v3M20.4 12v2.2"/>'),
  /** A person: your free account. */
  account: svg('<circle cx="12" cy="8.2" r="3.5"/><path d="M5 20c.6-3.7 3.4-6.1 7-6.1s6.4 2.4 7 6.1"/>'),
  /** A door with an arrow in: sign in. */
  signin: svg('<path d="M14 4h4.5c.8 0 1.5.7 1.5 1.5v13c0 .8-.7 1.5-1.5 1.5H14"/><path d="M4 12h10.5M11 8.5 14.5 12 11 15.5"/>'),
};
