/* The toolkit, one entry per tool (2 Nov 2026). /tools/ draws its tiles from
 * this list, grouped by the four domains in their order, and every tool page
 * draws its cover from its own entry. A new tool (the calculator, the
 * teleprompter, the templates for clients, landing pages and Reels) is one
 * more entry here and one small page; nothing else changes.
 *
 *   id      the tool's key: its page sends it to /api/tools (the same ids and
 *           names as TOOL_NAMES in functions/api/tools.js; a test holds them)
 *   domain  one of DOMAINS
 *   href    its page; none while it is being built (soon: true)
 *   cover   the approved cover (Alexandru, 2 Nov 2026): the kicker, the
 *           headline (its second half in <em>), the curiosity line, the
 *           picture and the bottom strip. Words are his: change them only
 *           with him.
 *   open    the button that opens it for a full account, and one line on
 *           what happens next
 */

export const DOMAINS = [
  { k: 'yourself', name: 'Lead yourself', color: '#E0A282', ink: '#8C5A3C' },
  { k: 'people', name: 'Lead your people', color: '#9BC0A1', ink: '#4C6B55' },
  { k: 'business', name: 'Lead your business', color: '#91B8D5', ink: '#3E5C78' },
  { k: 'market', name: 'Lead the market', color: '#D9B45E', ink: '#7A5C16' },
];

export const CATALOG = [
  {
    id: 'off-switch', domain: 'yourself', name: 'The off-switch check', line: 'Your laptop is closed. Is your head?', href: '/off-switch/', time: '90 seconds',
    cover: { tone: 'yourself', kicker: 'Lead yourself · The off-switch check', h: "Your laptop is closed. <em>Is your head?</em>", sub: "See who really gets your evenings, and win one back this week.",
      svg: "<svg viewBox=\"0 0 260 120\" aria-hidden=\"true\"><path d=\"M70 86 h120 l14 12 H56 Z\" fill=\"#2B3F55\"/><rect x=\"78\" y=\"74\" width=\"104\" height=\"12\" rx=\"3\" fill=\"#1A2F45\" stroke=\"#3A5470\"/><path d=\"M130 70 C 120 52, 150 46, 138 30 S 150 8, 170 12\" fill=\"none\" stroke=\"#E0A282\" stroke-width=\"2\" stroke-dasharray=\"3 5\"/><circle cx=\"176\" cy=\"14\" r=\"7\" fill=\"#E0A282\"/><circle cx=\"40\" cy=\"22\" r=\"10\" fill=\"none\" stroke=\"#D6BF8F\" stroke-width=\"1.5\"/><path d=\"M40 16v6l4 3\" stroke=\"#D6BF8F\" stroke-width=\"1.5\" fill=\"none\"/><text x=\"40\" y=\"50\" text-anchor=\"middle\" font-family=\"Inter\" font-size=\"10\" fill=\"#D6BF8F\">9:40 pm</text></svg>",
      strip: ['Free · 90 seconds', 'One evening that is yours'] },
    open: { btn: 'Open The off-switch check', p: 'Ten quick answers about last week’s evenings. You will see what work took home, and choose one evening this week that is fully yours.', fine: 'A self-reflection tool, not medical advice.' },
  },
  {
    id: 'twelve-days', domain: 'yourself', name: '12 Days to Start Winning', line: 'Lead your day before it leads you.', href: '/12-days/', time: '12 mornings',
    cover: { tone: 'market', kicker: '12 Days to Start Winning · Free subscription', h: "Lead your day <em>before it leads you.</em>", sub: "12 mornings. One principle and one ten-minute move in your inbox before the day starts.",
      svg: "<svg viewBox=\"0 0 260 120\" aria-hidden=\"true\"><path d=\"M20 100 A 110 110 0 0 1 240 100\" fill=\"none\" stroke=\"#2B3F55\" stroke-width=\"2\"/><g fill=\"#D9B45E\"><circle cx=\"22\" cy=\"96\" r=\"4\"/><circle cx=\"34\" cy=\"74\" r=\"4\"/><circle cx=\"51\" cy=\"55\" r=\"4\"/><circle cx=\"72\" cy=\"40\" r=\"4\"/><circle cx=\"96\" cy=\"29\" r=\"4\"/><circle cx=\"121\" cy=\"23\" r=\"4\" opacity=\".55\"/><circle cx=\"146\" cy=\"23\" r=\"4\" opacity=\".45\"/><circle cx=\"171\" cy=\"29\" r=\"4\" opacity=\".38\"/><circle cx=\"195\" cy=\"40\" r=\"4\" opacity=\".3\"/><circle cx=\"216\" cy=\"55\" r=\"4\" opacity=\".24\"/><circle cx=\"231\" cy=\"74\" r=\"4\" opacity=\".2\"/><circle cx=\"240\" cy=\"96\" r=\"4\" opacity=\".16\"/></g><circle cx=\"130\" cy=\"100\" r=\"18\" fill=\"#D9B45E\" opacity=\".25\"/><path d=\"M106 100h48\" stroke=\"#D9B45E\" stroke-width=\"2\"/><text x=\"130\" y=\"118\" text-anchor=\"middle\" font-family=\"Inter\" font-size=\"10\" fill=\"#D6BF8F\">day 5 of 12</text></svg>",
      strip: ['Free · 12 mornings', 'One principle, one move'] },
    open: { btn: 'Start my 12 days', p: 'Twelve letters from Alexandru, one each morning at 8:00 your time, then one on what comes next.', fine: 'Unsubscribe in one tap, any time.' },
  },
  {
    id: 'bottleneck', domain: 'people', name: 'The bottleneck test', line: 'What stops when you stop?', href: '/bottleneck/', time: '2 minutes',
    cover: { tone: 'people', kicker: 'Lead your people · The bottleneck test', h: "What stops <em>when you stop?</em>", sub: "Your team isn’t stuck. They’re waiting for you. Count the decisions on your desk.",
      svg: "<svg viewBox=\"0 0 260 120\" aria-hidden=\"true\"><g fill=\"#9BC0A1\" opacity=\".9\"><rect x=\"10\" y=\"20\" width=\"22\" height=\"16\" rx=\"3\"/><rect x=\"38\" y=\"14\" width=\"22\" height=\"16\" rx=\"3\"/><rect x=\"66\" y=\"22\" width=\"22\" height=\"16\" rx=\"3\"/><rect x=\"18\" y=\"44\" width=\"22\" height=\"16\" rx=\"3\"/><rect x=\"46\" y=\"40\" width=\"22\" height=\"16\" rx=\"3\"/><rect x=\"74\" y=\"48\" width=\"22\" height=\"16\" rx=\"3\"/><rect x=\"12\" y=\"70\" width=\"22\" height=\"16\" rx=\"3\"/><rect x=\"40\" y=\"70\" width=\"22\" height=\"16\" rx=\"3\"/><rect x=\"68\" y=\"76\" width=\"22\" height=\"16\" rx=\"3\"/><rect x=\"96\" y=\"30\" width=\"22\" height=\"16\" rx=\"3\"/><rect x=\"100\" y=\"58\" width=\"22\" height=\"16\" rx=\"3\"/></g><path d=\"M128 12 L170 52 L170 68 L128 108\" fill=\"none\" stroke=\"#D6BF8F\" stroke-width=\"2\"/><circle cx=\"186\" cy=\"60\" r=\"14\" fill=\"none\" stroke=\"#D6BF8F\" stroke-width=\"2\"/><text x=\"186\" y=\"64\" text-anchor=\"middle\" font-family=\"Inter\" font-size=\"10\" font-weight=\"700\" fill=\"#D6BF8F\">YOU</text><rect x=\"216\" y=\"52\" width=\"22\" height=\"16\" rx=\"3\" fill=\"#9BC0A1\" opacity=\".35\"/><text x=\"236\" y=\"96\" text-anchor=\"end\" font-family=\"Newsreader\" font-style=\"italic\" font-size=\"13\" fill=\"#D6BF8F\">one at a time</text></svg>",
      strip: ['Free · 2 minutes', 'One decision to hand over'] },
    open: { btn: 'Open The bottleneck test', p: 'Ten quick answers about last week. You will see how much of the work runs through your desk, and choose one decision to hand over this week.', fine: 'Nobody is graded, not even you.' },
  },
  {
    id: 'runway', domain: 'business', name: 'Cash runway', line: 'Your bank balance is lying to you.', href: '/runway/', time: '60 seconds',
    cover: { tone: 'business', kicker: 'Lead your business · Cash runway', h: "Your bank balance is <em>lying to you.</em>", sub: "Tax, a supplier, payroll: some of it already has a name on it. How many weeks are really yours?",
      svg: "<svg viewBox=\"0 0 260 120\" aria-hidden=\"true\"><rect x=\"6\" y=\"40\" width=\"248\" height=\"44\" rx=\"8\" fill=\"#1A2F45\" stroke=\"#2B3F55\"/><rect x=\"6\" y=\"40\" width=\"74\" height=\"44\" rx=\"8\" fill=\"#5A4632\"/><text x=\"43\" y=\"67\" text-anchor=\"middle\" font-family=\"Inter\" font-size=\"11\" font-weight=\"700\" fill=\"#F3EBDD\">TAX</text><rect x=\"82\" y=\"40\" width=\"64\" height=\"44\" fill=\"#4A3B2C\"/><text x=\"114\" y=\"67\" text-anchor=\"middle\" font-family=\"Inter\" font-size=\"11\" font-weight=\"700\" fill=\"#F3EBDD\">SUPPLIER</text><rect x=\"148\" y=\"40\" width=\"58\" height=\"44\" fill=\"#3E3226\"/><text x=\"177\" y=\"67\" text-anchor=\"middle\" font-family=\"Inter\" font-size=\"11\" font-weight=\"700\" fill=\"#F3EBDD\">PAYROLL</text><rect x=\"208\" y=\"40\" width=\"46\" height=\"44\" rx=\"8\" fill=\"#91B8D5\"/><text x=\"231\" y=\"67\" text-anchor=\"middle\" font-family=\"Inter\" font-size=\"11\" font-weight=\"700\" fill=\"#0E1C2B\">YOURS</text><text x=\"6\" y=\"26\" font-family=\"Newsreader\" font-style=\"italic\" font-size=\"15\" fill=\"#D6BF8F\">Today’s balance</text><path d=\"M231 92v14\" stroke=\"#91B8D5\" stroke-width=\"2\"/><text x=\"231\" y=\"118\" text-anchor=\"middle\" font-family=\"Inter\" font-size=\"11\" fill=\"#91B8D5\">? weeks</text></svg>",
      strip: ['Free · 60 seconds', 'Your weeks, in your numbers'] },
    open: { btn: 'Open Cash runway', p: 'Ten quick answers at most. Rough numbers are fine. You will see your runway in weeks, worked out only from what you enter.', fine: 'A self-reflection tool, not financial advice.' },
  },
  { id: 'market-templates', domain: 'market', name: 'Next here', line: 'Templates to find your clients. Being built.', soon: true },
];

/** The tools that open (everything but what is being built), by id. */
export const TOOLS = Object.fromEntries(CATALOG.filter((t) => !t.soon).map((t) => [t.id, t]));

/** The catalog grouped by domain, in the domains' order; within a domain,
 *  the order of CATALOG. */
export const byDomain = (list = CATALOG) => DOMAINS.map((d) => ({ ...d, tools: list.filter((t) => t.domain === d.k) }));
