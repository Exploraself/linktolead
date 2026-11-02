// The letters that follow each pain (Alexandru, approved 2 Nov 2026: "YES,
// 37 letters"). Three series, sent by the site like 12 Days to Start Winning:
//
//   1. After The Leader's North Star, by the FIRST pain they picked:
//      8 pains x 4 letters, days 1, 3, 6 and 10 after they finish, 8:00 their
//      time. The paid Boardroom ($27) appears only in letter 4's P.S.
//   2. Account made, Level 01 never started: days 2, 5 and 9. Free P.S. only.
//   3. Finished Level 03: the morning after, then day 4 (The Boardroom, $27,
//      and "not now" made easy).
//
// Stop rules: unsubscribe, pause, a question in Ask Alexandru, or the next
// series starting. One automatic letter a day at most, across every series
// and 12 Days. Mailchimp tags (with consent), one per series:
// linktolead-letters-northstar, linktolead-letters-not-started,
// linktolead-letters-level3 (Alexandru, 2 Nov 2026).
//
// The words are as rendered for an example founder, Sam; ⟦…⟧ marks what is
// filled from the founder's own answers (name, want, the day their step is
// due, their storm rule). No "Launchpad" in these letters; The Boardroom is
// $27. Change none of them without Alexandru: the engine reads each letter
// from its `text` (functions/_series.js parseLetter, SERIES_MODE in the
// Cloudflare settings switches it on), and tests/series.test.mjs renders all
// 37 for Sam and holds them equal to it.
// Shown on the email map in /internal (scripts/email-map.mjs).

export const SERIES_TAGS = { northstar: 'linktolead-letters-northstar', never: 'linktolead-letters-not-started', level3: 'linktolead-letters-level3' };
export const SERIES_GROUPS = [
 {
  "id": "alone",
  "name": "Doing everything myself",
  "sub": "Lead your people",
  "col": "#4C6B55",
  "hook": "approved",
  "want": "a team I trust",
  "kind": "pain"
 },
 {
  "id": "time",
  "name": "No time for myself",
  "sub": "Lead yourself",
  "col": "#8C5A3C",
  "hook": "approved",
  "want": "more free time",
  "kind": "pain"
 },
 {
  "id": "clients",
  "name": "Not enough clients",
  "sub": "Lead the market",
  "col": "#8A6A1F",
  "hook": "approved",
  "want": "steady clients",
  "kind": "pain"
 },
 {
  "id": "price",
  "name": "Prices feel too low",
  "sub": "Lead your business",
  "col": "#3E5C78",
  "hook": "approved",
  "want": "higher income",
  "kind": "pain"
 },
 {
  "id": "direction",
  "name": "Unclear direction",
  "sub": "Lead yourself",
  "col": "#8C5A3C",
  "hook": "approved",
  "want": "clarity on direction",
  "kind": "pain"
 },
 {
  "id": "cash",
  "name": "Cash is tight",
  "sub": "Lead your business",
  "col": "#3E5C78",
  "hook": "none",
  "want": "higher income",
  "kind": "pain"
 },
 {
  "id": "team",
  "name": "Team not stepping up",
  "sub": "Lead your people",
  "col": "#4C6B55",
  "hook": "none",
  "want": "a team I trust",
  "kind": "pain"
 },
 {
  "id": "switch",
  "name": "I can’t switch off",
  "sub": "Lead yourself",
  "col": "#8C5A3C",
  "hook": "none",
  "want": "more free time",
  "kind": "pain"
 },
 {
  "id": "never",
  "name": "Never started",
  "sub": "Account made, Launchpad never started",
  "col": "#5F5648",
  "kind": "never"
 },
 {
  "id": "level3",
  "name": "Finished Level 03",
  "sub": "The Boardroom invitation",
  "col": "#B4975F",
  "kind": "level3"
 }
];
export const SERIES_LETTERS = [
 {
  "id": "alone-1",
  "g": "alone",
  "n": 1,
  "day": 1,
  "subject": "Your business can’t grow past you",
  "hook": "approved hook",
  "link": {
   "url": "https://linktolead.exploraself.com/ground-plan/#programme",
   "label": "Open Level 01 →",
   "move": "Blueprint · Level 01 SEED · Entrust"
  },
  "ps": "The Two-Week Test (free assessment)",
  "paid": false,
  "text": "Hi ⟦Sam⟧,\n\nThank you for finishing your Leader’s North Star. You told me what hurts most right now: doing everything yourself. So my next few letters are about that, and only that.\n\nHere is the hard part. Your business can’t grow past you. Everything you hold yourself becomes a ceiling. Not because nobody else could do it, but because nobody has been shown what “done” looks like.\n\nIf nothing changes, what will you still be holding a year from now?\n\nYou told me you want ⟦a team I trust⟧. The road there starts with one task, not a whole team.\n\nYour step, ⟦by Wednesday⟧: pick one task you did last week that someone else could do. Write three things: the task, the person, and what “done” means.\nDone when you have told that person, out loud, with a day.\n\nIt’s the Entrust move in Level 01 of your free Blueprint: one tap, one slide, one sentence.\n\nOpen Level 01 →: https://linktolead.exploraself.com/ground-plan/#programme\n\nTell me in one line: which task did you pick, and who gets it?\n\nYou showed up for your business today, and that is how every real change begins. I’m proud of the work you’re doing.\n\nAny question at all, big or small? Just reply to this email. It comes straight to me, and I read every one.\n· My task and my person\n· I’m stuck on this step. Can you help?\n\nSee you soon. Have a good morning.\n\nAlexandru\nAlexandru Cojocari · ExploraSelf\n\nP.S. If you stepped away for two weeks, what would break first? The Two-Week Test shows you, free, in about six minutes: https://exploraself.com/two-week-test\n\nFree assessments, when you want to look deeper:\n· First 100 Clients: https://exploraself.com/first-100-clients\n· The Inner Boardroom: https://exploraself.com/unbound\n· Allow Yourself to Rise: https://exploraself.com/rise\n—\nYou finished The Leader’s North Star in your free ExploraSelf account and told us what hurts most. These letters follow that, for ten days.\nUnsubscribe: https://linktolead.exploraself.com/api/unsubscribe?u=…\nExploraSelf · [postal address]"
 },
 {
  "id": "alone-2",
  "g": "alone",
  "n": 2,
  "day": 3,
  "subject": "The fear of not being needed",
  "hook": "",
  "link": {
   "url": "https://linktolead.exploraself.com/northstar/#growth-plan",
   "label": "Open my Growth Plan →",
   "move": "North Star · Massive Growth Plan · step 9, The fear of not being needed"
  },
  "ps": "Built to Lead, 99 tools (free, existing line)",
  "paid": false,
  "text": "Hi ⟦Sam⟧,\n\nThank you for staying with me. Two days ago I asked you to pick one task to hand over. If you did, well done. If not, today works too.\n\nSometimes we hold everything because being needed feels safe. Your Growth Plan says it plainly: if they can do it without you, who are you? Answer that, and you can finally let go.\n\nYour step, ⟦by Saturday⟧: let one small decision be made without you this week. Choose the person and the decision, tell them it’s theirs, and don’t step back in.\nDone when one decision was made without you, and you let it stand.\n\nIt’s step 9 of your Massive Growth Plan, at the end of your North Star. Tick it there when it’s done.\n\nOpen my Growth Plan →: https://linktolead.exploraself.com/northstar/#growth-plan\n\nTell me in one line: which decision will you let someone else make?\n\nEvery honest answer you write makes the next decision lighter. Keep going, you’re further along than you feel.\n\nAny question at all, big or small? Just reply to this email. It comes straight to me, and I read every one.\n· The decision I’m letting go\n· I’m stuck on this step. Can you help?\n\nSee you soon. Have a good morning.\n\nAlexandru\nAlexandru Cojocari · ExploraSelf\n\nP.S. While you’re in, open Built to Lead in your library: 99 practical tools, free with your account. https://linktolead.exploraself.com/ground-plan/#library\n\nFree assessments, when you want to look deeper:\n· The Inner Boardroom: https://exploraself.com/unbound\n· Allow Yourself to Rise: https://exploraself.com/rise\n· The EQ Dividend: https://exploraself.com/eq\n—\nYou finished The Leader’s North Star in your free ExploraSelf account and told us what hurts most. These letters follow that, for ten days.\nUnsubscribe: https://linktolead.exploraself.com/api/unsubscribe?u=…\nExploraSelf · [postal address]"
 },
 {
  "id": "alone-3",
  "g": "alone",
  "n": 3,
  "day": 6,
  "subject": "Before you take it back",
  "hook": "",
  "link": {
   "url": "https://linktolead.exploraself.com/ground-plan/#programme",
   "label": "Open my Blueprint →",
   "move": "Blueprint · Level 02 VIEW · Inquire"
  },
  "ps": "Worth Building, 32 frameworks (free, library)",
  "paid": false,
  "text": "Hi ⟦Sam⟧,\n\nThank you for reading these, ⟦Sam⟧. Today is about the moment a handover goes wrong.\n\nWhen someone’s work comes back wrong, the quick fix is to take it back and do it yourself. It feels faster. It also teaches everyone that it all comes back to you.\n\nMind-reading feels quicker than asking. Ask once, and compare.\n\nYour step, ⟦by Monday⟧: the next time someone’s work isn’t right, ask one question before you fix anything: “When this happened, what was going on for you?” Then only listen.\nDone when you asked once and listened to the end, without fixing it.\n\nIt’s the Inquire move in Level 02 of your free Blueprint. It opens as soon as Level 01 is done, and the step works on paper today.\n\nOpen my Blueprint →: https://linktolead.exploraself.com/ground-plan/#programme\n\nTell me in one line: who will you ask first?\n\nBuilding something that matters takes courage, and you have more of it than you think. One step this week is enough.\n\nAny question at all, big or small? Just reply to this email. It comes straight to me, and I read every one.\n· Who I’ll ask first\n· I’m stuck on this step. Can you help?\n\nSee you soon. Have a good morning.\n\nAlexandru\nAlexandru Cojocari · ExploraSelf\n\nP.S. Worth Building is free in your library: 32 frameworks for the decisions in front of you. https://linktolead.exploraself.com/ground-plan/#library\n\nFree assessments, when you want to look deeper:\n· Allow Yourself to Rise: https://exploraself.com/rise\n· The EQ Dividend: https://exploraself.com/eq\n· The Two-Week Test: https://exploraself.com/two-week-test\n—\nYou finished The Leader’s North Star in your free ExploraSelf account and told us what hurts most. These letters follow that, for ten days.\nUnsubscribe: https://linktolead.exploraself.com/api/unsubscribe?u=…\nExploraSelf · [postal address]"
 },
 {
  "id": "alone-4",
  "g": "alone",
  "n": 4,
  "day": 10,
  "subject": "The business learned my habits",
  "hook": "",
  "link": {
   "url": "https://linktolead.exploraself.com/northstar/",
   "label": "Open my North Star →",
   "move": "North Star · Lead your people reading"
  },
  "ps": "PAID · The Boardroom, $27, gentle",
  "paid": true,
  "text": "Hi ⟦Sam⟧,\n\nTen days ago you finished your North Star. Thank you for letting me write to you since.\n\nIn my late teens I made kitchens and wardrobes to measure, for about three years. I loved the craft and the clients. I managed the money poorly, orders ran late, and my father closed the business. The business learned my habits. Skill without leadership collapses.\n\nThat is why I keep coming back to one task, one decision, one question. Each one teaches your business a new habit.\n\nYour step, ⟦by Thursday⟧: open your North Star and read your Lead your people reading again. Then write one line: what is different since you let go of one thing.\nDone when one honest line is written, even if it says “nothing yet”.\n\nYour North Star keeps your Lead your people reading, in your own answers.\n\nOpen my North Star →: https://linktolead.exploraself.com/northstar/\n\nTell me in one line: what did letting go cost you, and what did it give you?\n\nSmall steps, taken every week, build a business that runs and a life worth living. You’re on that road now.\n\nAny question at all, big or small? Just reply to this email. It comes straight to me, and I read every one.\n· What letting go gave me\n· What happens in a 1:1 in The Boardroom?\n\nSee you soon. Have a good morning.\n\nAlexandru\nAlexandru Cojocari · ExploraSelf\n\nP.S. If you’d like to look at what you still hold, together: The Boardroom is one 1:1 with me, plus levels 04 and 05 and your full North Star. It’s $27. If you want it, tell me a time that suits you, and I’ll write back to confirm: https://forms.gle/opnxfhFTJJg69Qy77 If now isn’t the time, that’s a good answer. The first three levels stay free.\n\nFree assessments, when you want to look deeper:\n· The EQ Dividend: https://exploraself.com/eq\n· The Two-Week Test: https://exploraself.com/two-week-test\n· First 100 Clients: https://exploraself.com/first-100-clients\n—\nYou finished The Leader’s North Star in your free ExploraSelf account and told us what hurts most. These letters follow that, for ten days.\nUnsubscribe: https://linktolead.exploraself.com/api/unsubscribe?u=…\nExploraSelf · [postal address]"
 },
 {
  "id": "time-1",
  "g": "time",
  "n": 1,
  "day": 1,
  "subject": "Every decision still waits for you?",
  "hook": "approved hook",
  "link": {
   "url": "https://linktolead.exploraself.com/ground-plan/#programme",
   "label": "Open Level 01 →",
   "move": "Blueprint · Level 01 SEED · Settled"
  },
  "ps": "The Leader’s Growth Planner 2027 (free, library)",
  "paid": false,
  "text": "Hi ⟦Sam⟧,\n\nThank you for finishing your Leader’s North Star. You told me what hurts most right now: no time for yourself. So my next few letters are about that, and only that.\n\nSometimes “no time” isn’t a calendar problem. It’s a rule. Something like: “If I work harder than everyone, then I’m worth something.” While a rule like that runs your day, rest feels like failing.\n\nIf the rule keeps running, what will your evenings look like a year from now?\n\nYou told me you want ⟦more free time⟧. The road there starts with one evening, not a new calendar.\n\nYour step, ⟦by Thursday⟧: finish this sentence honestly: “If I ___, then I’m worth something.” Then choose one evening and do one thing the rule forbids, like taking the evening off with your phone in a drawer.\nDone when the evening happened, and you wrote one line about what really happened.\n\nIt’s the Settled move in Level 01 of your free Blueprint: one tap, one slide, one sentence.\n\nOpen Level 01 →: https://linktolead.exploraself.com/ground-plan/#programme\n\nTell me in one line: how does your sentence end?\n\nEvery honest answer you write makes the next decision lighter. Keep going, you’re further along than you feel.\n\nAny question at all, big or small? Just reply to this email. It comes straight to me, and I read every one.\n· How my sentence ends\n· I’m stuck on this step. Can you help?\n\nSee you soon. Have a good morning.\n\nAlexandru\nAlexandru Cojocari · ExploraSelf\n\nP.S. The Leader’s Growth Planner 2027 is free in your library: an agenda with a weekly check-in, so your plan and your week live in one place. https://linktolead.exploraself.com/ground-plan/#library\n\nFree assessments, when you want to look deeper:\n· The Inner Boardroom: https://exploraself.com/unbound\n· Allow Yourself to Rise: https://exploraself.com/rise\n· The EQ Dividend: https://exploraself.com/eq\n—\nYou finished The Leader’s North Star in your free ExploraSelf account and told us what hurts most. These letters follow that, for ten days.\nUnsubscribe: https://linktolead.exploraself.com/api/unsubscribe?u=…\nExploraSelf · [postal address]"
 },
 {
  "id": "time-2",
  "g": "time",
  "n": 2,
  "day": 3,
  "subject": "Half a day without you",
  "hook": "",
  "link": {
   "url": "https://linktolead.exploraself.com/northstar/#growth-plan",
   "label": "Open my Growth Plan →",
   "move": "North Star · Massive Growth Plan · step 15, A half-day without you"
  },
  "ps": "The Two-Week Test (free assessment)",
  "paid": false,
  "text": "Hi ⟦Sam⟧,\n\nThank you for reading, ⟦Sam⟧. However your evening went, it taught you something.\n\nTime for yourself doesn’t appear. It goes in the calendar before the week fills it. Your Growth Plan puts it in one line: a business that needs you every day owns you.\n\nYour step, ⟦by Thursday⟧: choose a half-day in the next few weeks when the business runs without you. Put it in your calendar now, with your name on it.\nDone when the first half-day away is in your calendar.\n\nIt’s step 15 of your Massive Growth Plan, at the end of your North Star. Tick it there when it’s done.\n\nOpen my Growth Plan →: https://linktolead.exploraself.com/northstar/#growth-plan\n\nTell me in one line: which half-day did you choose, and what will you do with it?\n\nYou showed up for your business today, and that is how every real change begins. I’m proud of the work you’re doing.\n\nAny question at all, big or small? Just reply to this email. It comes straight to me, and I read every one.\n· My half-day\n· I’m stuck on this step. Can you help?\n\nSee you soon. Have a good morning.\n\nAlexandru\nAlexandru Cojocari · ExploraSelf\n\nP.S. If you stepped away for two weeks, what would break first? The Two-Week Test shows you, free, in about six minutes: https://exploraself.com/two-week-test\n\nFree assessments, when you want to look deeper:\n· First 100 Clients: https://exploraself.com/first-100-clients\n· The Inner Boardroom: https://exploraself.com/unbound\n· Allow Yourself to Rise: https://exploraself.com/rise\n—\nYou finished The Leader’s North Star in your free ExploraSelf account and told us what hurts most. These letters follow that, for ten days.\nUnsubscribe: https://linktolead.exploraself.com/api/unsubscribe?u=…\nExploraSelf · [postal address]"
 },
 {
  "id": "time-3",
  "g": "time",
  "n": 3,
  "day": 6,
  "subject": "What a camera would see",
  "hook": "",
  "link": {
   "url": "https://linktolead.exploraself.com/ground-plan/#programme",
   "label": "Open my Blueprint →",
   "move": "Blueprint · Level 02 VIEW · Verify"
  },
  "ps": "Built to Lead, 99 tools (free, existing line)",
  "paid": false,
  "text": "Hi ⟦Sam⟧,\n\nThank you for staying with me. Today, a small experiment with one ordinary day.\n\n“I have no time” is a story. It may be true. But stories are fast and feel true, so check this one against the facts first.\n\nYour step, ⟦by Monday⟧: pick one day this week. Write what a camera would have seen, hour by hour, from morning to evening. Then your story about that day. Then one truer reading.\nDone when three parts are on one page: the facts, your story, the truer reading.\n\nIt’s the Verify move in Level 02 of your free Blueprint. It opens as soon as Level 01 is done, and the step works on paper today.\n\nOpen my Blueprint →: https://linktolead.exploraself.com/ground-plan/#programme\n\nTell me in one line: which hour surprised you most?\n\nSmall steps, taken every week, build a business that runs and a life worth living. You’re on that road now.\n\nAny question at all, big or small? Just reply to this email. It comes straight to me, and I read every one.\n· The hour that surprised me\n· I’m stuck on this step. Can you help?\n\nSee you soon. Have a good morning.\n\nAlexandru\nAlexandru Cojocari · ExploraSelf\n\nP.S. While you’re in, open Built to Lead in your library: 99 practical tools, free with your account. https://linktolead.exploraself.com/ground-plan/#library\n\nFree assessments, when you want to look deeper:\n· The EQ Dividend: https://exploraself.com/eq\n· The Two-Week Test: https://exploraself.com/two-week-test\n· First 100 Clients: https://exploraself.com/first-100-clients\n—\nYou finished The Leader’s North Star in your free ExploraSelf account and told us what hurts most. These letters follow that, for ten days.\nUnsubscribe: https://linktolead.exploraself.com/api/unsubscribe?u=…\nExploraSelf · [postal address]"
 },
 {
  "id": "time-4",
  "g": "time",
  "n": 4,
  "day": 10,
  "subject": "Unbalance for the balance",
  "hook": "",
  "link": {
   "url": "https://linktolead.exploraself.com/northstar/",
   "label": "Open my North Star →",
   "move": "North Star · Lead yourself reading"
  },
  "ps": "PAID · The Boardroom, $27, gentle",
  "paid": true,
  "text": "Hi ⟦Sam⟧,\n\nTen days ago you told me you have no time for yourself. Thank you for reading every letter since.\n\nOne thing I live by: unbalance for the balance. You can’t give everything to everything every week. So choose a season of focus, on purpose, and own the trade-off. What you protect, you protect no matter what.\n\nYour step, ⟦by Thursday⟧: write two lines: “This season I push on ___. What I protect, no matter what: ___.” Put them where you’ll see them every morning.\nDone when both lines are written where you see them every morning.\n\nYour North Star keeps your Lead yourself reading, in your own answers.\n\nOpen my North Star →: https://linktolead.exploraself.com/northstar/\n\nTell me in one line: what will you protect, no matter what?\n\nYou don’t have to carry all of it alone anymore. We’re right here with you, and we believe in what you’re building.\n\nAny question at all, big or small? Just reply to this email. It comes straight to me, and I read every one.\n· What I will protect\n· What happens in a 1:1 in The Boardroom?\n\nSee you soon. Have a good morning.\n\nAlexandru\nAlexandru Cojocari · ExploraSelf\n\nP.S. If you’d like to plan this season together: The Boardroom is one 1:1 with me, plus levels 04 and 05 and your full North Star. It’s $27. If you want it, tell me a time that suits you, and I’ll write back to confirm: https://forms.gle/opnxfhFTJJg69Qy77 If now isn’t the time, that’s a good answer. The first three levels stay free.\n\nFree assessments, when you want to look deeper:\n· The Two-Week Test: https://exploraself.com/two-week-test\n· First 100 Clients: https://exploraself.com/first-100-clients\n· The Inner Boardroom: https://exploraself.com/unbound\n—\nYou finished The Leader’s North Star in your free ExploraSelf account and told us what hurts most. These letters follow that, for ten days.\nUnsubscribe: https://linktolead.exploraself.com/api/unsubscribe?u=…\nExploraSelf · [postal address]"
 },
 {
  "id": "clients-1",
  "g": "clients",
  "n": 1,
  "day": 1,
  "subject": "Busy is not the same as chosen",
  "hook": "approved hook",
  "link": {
   "url": "https://linktolead.exploraself.com/ground-plan/#programme",
   "label": "Open Level 01 →",
   "move": "Blueprint · Level 01 SEED · Dignity"
  },
  "ps": "First 100 Clients (free, existing line)",
  "paid": false,
  "text": "Hi ⟦Sam⟧,\n\nThank you for finishing your Leader’s North Star. You told me what hurts most right now: not enough clients. So my next few letters are about that, and only that.\n\nBeing good and waiting is not a plan. Clients come from asking. And when asking feels like begging, we stop asking, and call it being busy.\n\nIf nobody new hears from you this month, what does next month look like?\n\nYou told me you want ⟦steady clients⟧. That starts with three names, not a campaign.\n\nYour step, ⟦by Thursday⟧: write one line: “My offer helps ___ with ___.” Then name three people and ask each one, directly, to buy or to book.\nDone when three people were asked, by name, whatever they said.\n\nIt’s the Dignity move in Level 01 of your free Blueprint: one tap, one slide, one sentence.\n\nOpen Level 01 →: https://linktolead.exploraself.com/ground-plan/#programme\n\nTell me in one line: when you ask someone to buy, does it feel like begging, bothering, showing off, or helping?\n\nBuilding something that matters takes courage, and you have more of it than you think. One step this week is enough.\n\nAny question at all, big or small? Just reply to this email. It comes straight to me, and I read every one.\n· How asking feels to me\n· I’m stuck on this step. Can you help?\n\nSee you soon. Have a good morning.\n\nAlexandru\nAlexandru Cojocari · ExploraSelf\n\nP.S. If clients are the next thing on your mind, the First 100 Clients assessment is free and takes ten minutes: https://exploraself.com/first-100-clients\n\nFree assessments, when you want to look deeper:\n· Allow Yourself to Rise: https://exploraself.com/rise\n· The EQ Dividend: https://exploraself.com/eq\n· The Two-Week Test: https://exploraself.com/two-week-test\n—\nYou finished The Leader’s North Star in your free ExploraSelf account and told us what hurts most. These letters follow that, for ten days.\nUnsubscribe: https://linktolead.exploraself.com/api/unsubscribe?u=…\nExploraSelf · [postal address]"
 },
 {
  "id": "clients-2",
  "g": "clients",
  "n": 2,
  "day": 3,
  "subject": "Your story, in under a minute",
  "hook": "",
  "link": {
   "url": "https://linktolead.exploraself.com/northstar/#growth-plan",
   "label": "Open my Growth Plan →",
   "move": "North Star · Massive Growth Plan · step 18, Your story, out loud"
  },
  "ps": "Worth Building, 32 frameworks (free, library)",
  "paid": false,
  "text": "Hi ⟦Sam⟧,\n\nThank you for reading, ⟦Sam⟧. Did you ask your three? Every answer, even a no, is information.\n\nPeople trust someone who has walked the road. Your story is the proof. If people can’t tell why you do this work, they have to guess, and a guess is hard to say yes to.\n\nYour step, ⟦by Saturday⟧: write a few lines: the problem you solve, and how you lived it yourself. Then tell it out loud, in under a minute, to one person.\nDone when you told your story once, out loud, in under a minute.\n\nIt’s step 18 of your Massive Growth Plan, at the end of your North Star. Tick it there when it’s done.\n\nOpen my Growth Plan →: https://linktolead.exploraself.com/northstar/#growth-plan\n\nTell me in one line: who did you tell, and what did they say?\n\nSmall steps, taken every week, build a business that runs and a life worth living. You’re on that road now.\n\nAny question at all, big or small? Just reply to this email. It comes straight to me, and I read every one.\n· Who I told, and what they said\n· I’m stuck on this step. Can you help?\n\nSee you soon. Have a good morning.\n\nAlexandru\nAlexandru Cojocari · ExploraSelf\n\nP.S. Worth Building is free in your library: 32 frameworks for the decisions in front of you. https://linktolead.exploraself.com/ground-plan/#library\n\nFree assessments, when you want to look deeper:\n· The EQ Dividend: https://exploraself.com/eq\n· The Two-Week Test: https://exploraself.com/two-week-test\n· First 100 Clients: https://exploraself.com/first-100-clients\n—\nYou finished The Leader’s North Star in your free ExploraSelf account and told us what hurts most. These letters follow that, for ten days.\nUnsubscribe: https://linktolead.exploraself.com/api/unsubscribe?u=…\nExploraSelf · [postal address]"
 },
 {
  "id": "clients-3",
  "g": "clients",
  "n": 3,
  "day": 6,
  "subject": "Praise is interest. Payment is evidence.",
  "hook": "",
  "link": {
   "url": "https://linktolead.exploraself.com/ground-plan/#programme",
   "label": "Open my Blueprint →",
   "move": "Blueprint · Level 02 VIEW · Watch signals"
  },
  "ps": "Built to Lead, 99 tools (free, existing line)",
  "paid": false,
  "text": "Hi ⟦Sam⟧,\n\nThank you for staying with me. Today is about reading the market, not your mood.\n\nWhen a customer goes quiet, it’s easy to decide why: they didn’t like it, I was too pushy. Silence has many reasons. Praise is interest. Payment is evidence.\n\nYour step, ⟦by Tuesday⟧: choose one signal to test. For example: when someone asks for the price twice, it means they are close to yes. Then check it with one real person, by asking.\nDone when you checked one signal with one person, and wrote down what they said.\n\nIt’s the Watch signals move in Level 02 of your free Blueprint. It opens as soon as Level 01 is done, and the step works on paper today.\n\nOpen my Blueprint →: https://linktolead.exploraself.com/ground-plan/#programme\n\nTell me in one line: of your last ten interested people, how many paid?\n\nYou don’t have to carry all of it alone anymore. We’re right here with you, and we believe in what you’re building.\n\nAny question at all, big or small? Just reply to this email. It comes straight to me, and I read every one.\n· My signal, and what I found\n· I’m stuck on this step. Can you help?\n\nSee you soon. Have a good morning.\n\nAlexandru\nAlexandru Cojocari · ExploraSelf\n\nP.S. While you’re in, open Built to Lead in your library: 99 practical tools, free with your account. https://linktolead.exploraself.com/ground-plan/#library\n\nFree assessments, when you want to look deeper:\n· The Two-Week Test: https://exploraself.com/two-week-test\n· First 100 Clients: https://exploraself.com/first-100-clients\n· The Inner Boardroom: https://exploraself.com/unbound\n—\nYou finished The Leader’s North Star in your free ExploraSelf account and told us what hurts most. These letters follow that, for ten days.\nUnsubscribe: https://linktolead.exploraself.com/api/unsubscribe?u=…\nExploraSelf · [postal address]"
 },
 {
  "id": "clients-4",
  "g": "clients",
  "n": 4,
  "day": 10,
  "subject": "Their fear, in their words",
  "hook": "",
  "link": {
   "url": "https://linktolead.exploraself.com/ground-plan/#programme",
   "label": "Open my Blueprint →",
   "move": "Blueprint · Level 03 CALM · Meet their fear"
  },
  "ps": "PAID · The Boardroom, $27, gentle",
  "paid": true,
  "text": "Hi ⟦Sam⟧,\n\nTen days ago you told me you need more clients. Thank you for reading every letter since.\n\nPeople feel first and explain later. Your next client has a fear and a hope. Speak to them in their words, not yours, and they feel understood before you explain anything.\n\nYour step, ⟦by Friday⟧: ask one client: “Before we worked together, what were you afraid of? What did you hope for?” Write their words down, exactly.\nDone when one fear and one hope are written down, word for word.\n\nIt’s the Meet their fear move in Level 03, the last free level of your Blueprint. It opens once Levels 01 and 02 are done, and the step works on paper today.\n\nOpen my Blueprint →: https://linktolead.exploraself.com/ground-plan/#programme\n\nTell me in one line: what did they fear?\n\nYou showed up for your business today, and that is how every real change begins. I’m proud of the work you’re doing.\n\nAny question at all, big or small? Just reply to this email. It comes straight to me, and I read every one.\n· What my client feared\n· What happens in a 1:1 in The Boardroom?\n\nSee you soon. Have a good morning.\n\nAlexandru\nAlexandru Cojocari · ExploraSelf\n\nP.S. If you’d like to look at your market together: The Boardroom is one 1:1 with me, plus levels 04 and 05 and your full North Star. It’s $27. If you want it, tell me a time that suits you, and I’ll write back to confirm: https://forms.gle/opnxfhFTJJg69Qy77 If now isn’t the time, that’s a good answer. The first three levels stay free.\n\nFree assessments, when you want to look deeper:\n· First 100 Clients: https://exploraself.com/first-100-clients\n· The Inner Boardroom: https://exploraself.com/unbound\n· Allow Yourself to Rise: https://exploraself.com/rise\n—\nYou finished The Leader’s North Star in your free ExploraSelf account and told us what hurts most. These letters follow that, for ten days.\nUnsubscribe: https://linktolead.exploraself.com/api/unsubscribe?u=…\nExploraSelf · [postal address]"
 },
 {
  "id": "price-1",
  "g": "price",
  "n": 1,
  "day": 1,
  "subject": "Booked solid. Still capped?",
  "hook": "approved hook",
  "link": {
   "url": "https://linktolead.exploraself.com/ground-plan/#programme",
   "label": "Open Level 01 →",
   "move": "Blueprint · Level 01 SEED · Enough"
  },
  "ps": "First 100 Clients, offer angle (free)",
  "paid": false,
  "text": "Hi ⟦Sam⟧,\n\nThank you for finishing your Leader’s North Star. You told me what hurts most right now: your prices feel too low. So my next few letters are about that, and only that.\n\nA price set by fear has no floor. So before you change a price, give money a finish line: your enough, as one monthly number. Your enough is a plan, not your worth.\n\nIf your prices stay where they are, how long can you stay booked solid and still capped?\n\nYou told me you want ⟦higher income⟧. That starts with one number.\n\nYour step, ⟦by Wednesday⟧: write your enough: the amount a month the business must leave you. Then choose one money move with a day, like a new rate for new clients.\nDone when the number is written, and the money move has a day.\n\nIt’s the Enough move in Level 01 of your free Blueprint: one tap, one slide, one sentence.\n\nOpen Level 01 →: https://linktolead.exploraself.com/ground-plan/#programme\n\nTell me in one line: what is your enough, as a number?\n\nEvery honest answer you write makes the next decision lighter. Keep going, you’re further along than you feel.\n\nAny question at all, big or small? Just reply to this email. It comes straight to me, and I read every one.\n· My enough, as a number\n· I’m stuck on this step. Can you help?\n\nSee you soon. Have a good morning.\n\nAlexandru\nAlexandru Cojocari · ExploraSelf\n\nP.S. How strong is your offer, really? The First 100 Clients assessment scores you, your brand, your offer, your customers and your sales. Free, about six minutes: https://exploraself.com/first-100-clients\n\nFree assessments, when you want to look deeper:\n· The Inner Boardroom: https://exploraself.com/unbound\n· Allow Yourself to Rise: https://exploraself.com/rise\n· The EQ Dividend: https://exploraself.com/eq\n—\nYou finished The Leader’s North Star in your free ExploraSelf account and told us what hurts most. These letters follow that, for ten days.\nUnsubscribe: https://linktolead.exploraself.com/api/unsubscribe?u=…\nExploraSelf · [postal address]"
 },
 {
  "id": "price-2",
  "g": "price",
  "n": 2,
  "day": 3,
  "subject": "Your worth, out loud",
  "hook": "",
  "link": {
   "url": "https://linktolead.exploraself.com/northstar/#growth-plan",
   "label": "Open my Growth Plan →",
   "move": "North Star · Massive Growth Plan · step 13, Your worth, out loud"
  },
  "ps": "Built to Lead, 99 tools (free, existing line)",
  "paid": false,
  "text": "Hi ⟦Sam⟧,\n\nThank you for reading, ⟦Sam⟧. You have a number now, or you’re close to one. Today is about saying a price.\n\nIf you say your price with an apology, the client hears the apology, not the price. The hardest part isn’t the number. It’s the silence after it.\n\nYour step, ⟦by Sunday⟧: say your price to one new client, plainly, once. No discount and no sorry. Then stop talking and let them answer.\nDone when you said it once, then stayed silent and let them answer.\n\nIt’s step 13 of your Massive Growth Plan, at the end of your North Star. Tick it there when it’s done.\n\nOpen my Growth Plan →: https://linktolead.exploraself.com/northstar/#growth-plan\n\nTell me in one line: what happened in the silence?\n\nYou don’t have to carry all of it alone anymore. We’re right here with you, and we believe in what you’re building.\n\nAny question at all, big or small? Just reply to this email. It comes straight to me, and I read every one.\n· What happened in the silence\n· I’m stuck on this step. Can you help?\n\nSee you soon. Have a good morning.\n\nAlexandru\nAlexandru Cojocari · ExploraSelf\n\nP.S. While you’re in, open Built to Lead in your library: 99 practical tools, free with your account. https://linktolead.exploraself.com/ground-plan/#library\n\nFree assessments, when you want to look deeper:\n· The Two-Week Test: https://exploraself.com/two-week-test\n· First 100 Clients: https://exploraself.com/first-100-clients\n· The Inner Boardroom: https://exploraself.com/unbound\n—\nYou finished The Leader’s North Star in your free ExploraSelf account and told us what hurts most. These letters follow that, for ten days.\nUnsubscribe: https://linktolead.exploraself.com/api/unsubscribe?u=…\nExploraSelf · [postal address]"
 },
 {
  "id": "price-3",
  "g": "price",
  "n": 3,
  "day": 6,
  "subject": "Where you play small",
  "hook": "",
  "link": {
   "url": "https://linktolead.exploraself.com/northstar/#growth-plan",
   "label": "Open my Growth Plan →",
   "move": "North Star · Massive Growth Plan · step 11, Where you play small"
  },
  "ps": "Worth Building, 32 frameworks (free, library)",
  "paid": false,
  "text": "Hi ⟦Sam⟧,\n\nThank you for staying with me. Today, one honest look at where you hold back.\n\nSomewhere in your business you charge, ask or decide smaller than you know you should. It feels humble. It is fear. Naming it is the first step out.\n\nYour step, ⟦by Monday⟧: write two lines, side by side. Where you play small: a price, a client you keep, a cost you accept. And what it looks like at your true size.\nDone when you wrote both, side by side, and did not soften the second.\n\nIt’s step 11 of your Massive Growth Plan, at the end of your North Star. Tick it there when it’s done.\n\nOpen my Growth Plan →: https://linktolead.exploraself.com/northstar/#growth-plan\n\nTell me in one line: where do you play small?\n\nYou showed up for your business today, and that is how every real change begins. I’m proud of the work you’re doing.\n\nAny question at all, big or small? Just reply to this email. It comes straight to me, and I read every one.\n· Where I play small\n· I’m stuck on this step. Can you help?\n\nSee you soon. Have a good morning.\n\nAlexandru\nAlexandru Cojocari · ExploraSelf\n\nP.S. Worth Building is free in your library: 32 frameworks for the decisions in front of you. https://linktolead.exploraself.com/ground-plan/#library\n\nFree assessments, when you want to look deeper:\n· First 100 Clients: https://exploraself.com/first-100-clients\n· The Inner Boardroom: https://exploraself.com/unbound\n· Allow Yourself to Rise: https://exploraself.com/rise\n—\nYou finished The Leader’s North Star in your free ExploraSelf account and told us what hurts most. These letters follow that, for ten days.\nUnsubscribe: https://linktolead.exploraself.com/api/unsubscribe?u=…\nExploraSelf · [postal address]"
 },
 {
  "id": "price-4",
  "g": "price",
  "n": 4,
  "day": 10,
  "subject": "Confidence from evidence",
  "hook": "",
  "link": {
   "url": "https://linktolead.exploraself.com/ground-plan/#programme",
   "label": "Open my Blueprint →",
   "move": "Blueprint · Level 02 VIEW · Evidence"
  },
  "ps": "PAID · The Boardroom, $27, gentle",
  "paid": true,
  "text": "Hi ⟦Sam⟧,\n\nTen days ago you told me your prices feel too low. Thank you for reading every letter since.\n\nIn 2019 I competed in Classic Physique, IFBB, and won. What it taught me: confidence comes from evidence. The discipline nobody sees is what you stand on when it counts.\n\nA price works the same way. It feels low or high against a feeling. Against your own numbers, it is simply right or wrong.\n\nYour step, ⟦by Saturday⟧: choose a fixed day and time each week to read five numbers: money in, money out, cash left, unpaid invoices, hours worked. Read them once this week. Money in next to hours worked shows what your hour really earns.\nDone when the day and time are in your calendar, and you read all five once.\n\nIt’s the Evidence move in Level 02 of your free Blueprint. It opens as soon as Level 01 is done, and the step works on paper today.\n\nOpen my Blueprint →: https://linktolead.exploraself.com/ground-plan/#programme\n\nTell me in one line: what does your hour really earn?\n\nEvery honest answer you write makes the next decision lighter. Keep going, you’re further along than you feel.\n\nAny question at all, big or small? Just reply to this email. It comes straight to me, and I read every one.\n· What my hour earns\n· What happens in a 1:1 in The Boardroom?\n\nSee you soon. Have a good morning.\n\nAlexandru\nAlexandru Cojocari · ExploraSelf\n\nP.S. If you’d like to look at your prices together, with your own numbers: The Boardroom is one 1:1 with me, plus levels 04 and 05 and your full North Star. It’s $27. If you want it, tell me a time that suits you, and I’ll write back to confirm: https://forms.gle/opnxfhFTJJg69Qy77 If now isn’t the time, that’s a good answer. The first three levels stay free.\n\nFree assessments, when you want to look deeper:\n· The Inner Boardroom: https://exploraself.com/unbound\n· Allow Yourself to Rise: https://exploraself.com/rise\n· The EQ Dividend: https://exploraself.com/eq\n—\nYou finished The Leader’s North Star in your free ExploraSelf account and told us what hurts most. These letters follow that, for ten days.\nUnsubscribe: https://linktolead.exploraself.com/api/unsubscribe?u=…\nExploraSelf · [postal address]"
 },
 {
  "id": "direction-1",
  "g": "direction",
  "n": 1,
  "day": 1,
  "subject": "What is your business for?",
  "hook": "approved hook",
  "link": {
   "url": "https://linktolead.exploraself.com/northstar/",
   "label": "Open my North Star →",
   "move": "North Star · Lead yourself reading"
  },
  "ps": "Allow Yourself to Rise (free assessment)",
  "paid": false,
  "text": "Hi ⟦Sam⟧,\n\nThank you for finishing your Leader’s North Star. You told me what hurts most right now: an unclear direction. So my next few letters are about that, and only that.\n\nWhen the business has no clear purpose for your life, every opportunity looks urgent. So start with limits, not goals: the hours, the money and the risk you will not go past. Clear limits make every next decision faster.\n\nIf you keep saying yes to everything, where does that road end?\n\nYou told me you want ⟦clarity on direction⟧. That starts with three lines.\n\nYour step, ⟦by Wednesday⟧: write three lines: what success must protect in your life, no matter what.\nDone when three lines are on one page, where you will see them.\n\nYour North Star keeps your Lead yourself reading, in your own answers.\n\nOpen my North Star →: https://linktolead.exploraself.com/northstar/\n\nTell me in one line: what must this business protect in your life, no matter what?\n\nYou don’t have to carry all of it alone anymore. We’re right here with you, and we believe in what you’re building.\n\nAny question at all, big or small? Just reply to this email. It comes straight to me, and I read every one.\n· What my business must protect\n· I’m stuck on this step. Can you help?\n\nSee you soon. Have a good morning.\n\nAlexandru\nAlexandru Cojocari · ExploraSelf\n\nP.S. Which of your five forces is the lid on your potential: clarity, strategy, emotional command, discipline or drive? Allow Yourself to Rise is free and takes about four minutes: https://exploraself.com/rise\n\nFree assessments, when you want to look deeper:\n· The Two-Week Test: https://exploraself.com/two-week-test\n· First 100 Clients: https://exploraself.com/first-100-clients\n· The Inner Boardroom: https://exploraself.com/unbound\n—\nYou finished The Leader’s North Star in your free ExploraSelf account and told us what hurts most. These letters follow that, for ten days.\nUnsubscribe: https://linktolead.exploraself.com/api/unsubscribe?u=…\nExploraSelf · [postal address]"
 },
 {
  "id": "direction-2",
  "g": "direction",
  "n": 2,
  "day": 3,
  "subject": "The drive behind your desire",
  "hook": "",
  "link": {
   "url": "https://linktolead.exploraself.com/northstar/#growth-plan",
   "label": "Open my Growth Plan →",
   "move": "North Star · Massive Growth Plan · step 2, The drive behind your desire"
  },
  "ps": "The Inner Boardroom (free assessment)",
  "paid": false,
  "text": "Hi ⟦Sam⟧,\n\nThank you for reading, ⟦Sam⟧. Today we go one level down: not where you’re going, but why you want it.\n\nSomething happened to you that made you want this so much, and think this way. Find it. Direction is easier to hold when you know where it comes from.\n\nYour step, ⟦by Saturday⟧: write two lines. What happened to you that made you want this. And the result you will never let go of.\nDone when you can say both in one breath, without notes.\n\nIt’s step 2 of your Massive Growth Plan, at the end of your North Star. Tick it there when it’s done.\n\nOpen my Growth Plan →: https://linktolead.exploraself.com/northstar/#growth-plan\n\nTell me in one line: what is the result you will never let go of?\n\nBuilding something that matters takes courage, and you have more of it than you think. One step this week is enough.\n\nAny question at all, big or small? Just reply to this email. It comes straight to me, and I read every one.\n· The result I will never let go of\n· I’m stuck on this step. Can you help?\n\nSee you soon. Have a good morning.\n\nAlexandru\nAlexandru Cojocari · ExploraSelf\n\nP.S. Who really makes the decisions inside your head? The Inner Boardroom is free and takes about five minutes: https://exploraself.com/unbound\n\nFree assessments, when you want to look deeper:\n· Allow Yourself to Rise: https://exploraself.com/rise\n· The EQ Dividend: https://exploraself.com/eq\n· The Two-Week Test: https://exploraself.com/two-week-test\n—\nYou finished The Leader’s North Star in your free ExploraSelf account and told us what hurts most. These letters follow that, for ten days.\nUnsubscribe: https://linktolead.exploraself.com/api/unsubscribe?u=…\nExploraSelf · [postal address]"
 },
 {
  "id": "direction-3",
  "g": "direction",
  "n": 3,
  "day": 6,
  "subject": "The rule that chooses for you",
  "hook": "",
  "link": {
   "url": "https://linktolead.exploraself.com/ground-plan/#programme",
   "label": "Open Level 01 →",
   "move": "Blueprint · Level 01 SEED · Settled"
  },
  "ps": "The Leader’s Growth Planner 2027 (free, library)",
  "paid": false,
  "text": "Hi ⟦Sam⟧,\n\nThank you for staying with me. Today, the rule that may have been choosing your direction for you.\n\nFinish this sentence: “If I ___, then I’m worth something.” Hit my numbers. Prove them wrong. Get it perfect. Whatever your ending, that rule was learned. So it can be tested.\n\nYour step, ⟦by Tuesday⟧: write your sentence. Then choose one day when you do one thing the rule forbids, on purpose, and write what really happened.\nDone when you tested the rule once, and wrote one line about it.\n\nIt’s the Settled move in Level 01 of your free Blueprint: one tap, one slide, one sentence.\n\nOpen Level 01 →: https://linktolead.exploraself.com/ground-plan/#programme\n\nTell me in one line: how does your sentence end?\n\nEvery honest answer you write makes the next decision lighter. Keep going, you’re further along than you feel.\n\nAny question at all, big or small? Just reply to this email. It comes straight to me, and I read every one.\n· How my sentence ends\n· I’m stuck on this step. Can you help?\n\nSee you soon. Have a good morning.\n\nAlexandru\nAlexandru Cojocari · ExploraSelf\n\nP.S. The Leader’s Growth Planner 2027 is free in your library: an agenda with a weekly check-in, so your plan and your week live in one place. https://linktolead.exploraself.com/ground-plan/#library\n\nFree assessments, when you want to look deeper:\n· The Inner Boardroom: https://exploraself.com/unbound\n· Allow Yourself to Rise: https://exploraself.com/rise\n· The EQ Dividend: https://exploraself.com/eq\n—\nYou finished The Leader’s North Star in your free ExploraSelf account and told us what hurts most. These letters follow that, for ten days.\nUnsubscribe: https://linktolead.exploraself.com/api/unsubscribe?u=…\nExploraSelf · [postal address]"
 },
 {
  "id": "direction-4",
  "g": "direction",
  "n": 4,
  "day": 10,
  "subject": "Twelve weeks of truth",
  "hook": "",
  "link": {
   "url": "https://linktolead.exploraself.com/northstar/#growth-plan",
   "label": "Open my Growth Plan →",
   "move": "North Star · Massive Growth Plan · step 5, Twelve weeks of truth"
  },
  "ps": "PAID · The Boardroom, $27, gentle",
  "paid": true,
  "text": "Hi ⟦Sam⟧,\n\nTen days ago you told me your direction feels unclear. Thank you for reading every letter since.\n\nFeeling in control is not control. Writing it down and measuring it is. Direction becomes clear by walking it, one written week at a time.\n\nYour step, ⟦by Friday⟧: choose a start date. Write your first goal and when you estimate it will be done. Then write week 1 in your Leader’s Growth Planner.\nDone when week 1 is written in your Leader’s Growth Planner.\n\nIt’s step 5 of your Massive Growth Plan, at the end of your North Star. Tick it there when it’s done.\n\nOpen my Growth Plan →: https://linktolead.exploraself.com/northstar/#growth-plan\n\nTell me in one line: what is your first goal, and when will it be done?\n\nBuilding something that matters takes courage, and you have more of it than you think. One step this week is enough.\n\nAny question at all, big or small? Just reply to this email. It comes straight to me, and I read every one.\n· My first goal and my date\n· What happens in a 1:1 in The Boardroom?\n\nSee you soon. Have a good morning.\n\nAlexandru\nAlexandru Cojocari · ExploraSelf\n\nP.S. If you’d like to talk your direction through with someone who has walked the road: The Boardroom is one 1:1 with me, plus levels 04 and 05 and your full North Star. It’s $27. If you want it, tell me a time that suits you, and I’ll write back to confirm: https://forms.gle/opnxfhFTJJg69Qy77 If now isn’t the time, that’s a good answer. The first three levels stay free.\n\nFree assessments, when you want to look deeper:\n· Allow Yourself to Rise: https://exploraself.com/rise\n· The EQ Dividend: https://exploraself.com/eq\n· The Two-Week Test: https://exploraself.com/two-week-test\n—\nYou finished The Leader’s North Star in your free ExploraSelf account and told us what hurts most. These letters follow that, for ten days.\nUnsubscribe: https://linktolead.exploraself.com/api/unsubscribe?u=…\nExploraSelf · [postal address]"
 },
 {
  "id": "cash-1",
  "g": "cash",
  "n": 1,
  "day": 1,
  "subject": "Open the statement",
  "hook": "proposal (pain has no hook yet)",
  "link": {
   "url": "https://linktolead.exploraself.com/ground-plan/#programme",
   "label": "Open Level 01 →",
   "move": "Blueprint · Level 01 SEED · Enough"
  },
  "ps": "First 100 Clients, offer angle (free)",
  "paid": false,
  "text": "Hi ⟦Sam⟧,\n\nThank you for finishing your Leader’s North Star. You told me what hurts most right now: cash is tight. So my next few letters are about that, and only that.\n\nTight cash is loud at night and quiet on paper, until you open it. A guess becomes a number the day you open the statement. Don’t fight the fear. Open it.\n\nIf you keep guessing, which decision will the guess make for you next month?\n\nYou told me you want ⟦higher income⟧. That starts with three true numbers.\n\nYour step, ⟦by Wednesday⟧: open last month’s statement. Write three numbers: money in, fixed costs, and what was left.\nDone when three numbers are on paper, and none of them is a guess.\n\nIt’s the Enough move in Level 01 of your free Blueprint: one tap, one slide, one sentence.\n\nOpen Level 01 →: https://linktolead.exploraself.com/ground-plan/#programme\n\nTell me in one line: which of the three surprised you?\n\nEvery honest answer you write makes the next decision lighter. Keep going, you’re further along than you feel.\n\nAny question at all, big or small? Just reply to this email. It comes straight to me, and I read every one.\n· The number that surprised me\n· I’m stuck on this step. Can you help?\n\nSee you soon. Have a good morning.\n\nAlexandru\nAlexandru Cojocari · ExploraSelf\n\nP.S. How strong is your offer, really? The First 100 Clients assessment scores you, your brand, your offer, your customers and your sales. Free, about six minutes: https://exploraself.com/first-100-clients\n\nFree assessments, when you want to look deeper:\n· The Inner Boardroom: https://exploraself.com/unbound\n· Allow Yourself to Rise: https://exploraself.com/rise\n· The EQ Dividend: https://exploraself.com/eq\n—\nYou finished The Leader’s North Star in your free ExploraSelf account and told us what hurts most. These letters follow that, for ten days.\nUnsubscribe: https://linktolead.exploraself.com/api/unsubscribe?u=…\nExploraSelf · [postal address]"
 },
 {
  "id": "cash-2",
  "g": "cash",
  "n": 2,
  "day": 3,
  "subject": "The number you fear most",
  "hook": "",
  "link": {
   "url": "https://linktolead.exploraself.com/ground-plan/#programme",
   "label": "Open my Blueprint →",
   "move": "Blueprint · Level 02 VIEW · Evidence"
  },
  "ps": "Built to Lead, 99 tools (free, existing line)",
  "paid": false,
  "text": "Hi ⟦Sam⟧,\n\nThank you for reading, ⟦Sam⟧. Opening the numbers takes courage. Today we make it a habit, so it stops being a shock.\n\nNumbers feel like a verdict when money is tight. They are information. Read them on a fixed day, and they get quieter.\n\nYour step, ⟦by Saturday⟧: choose a fixed day and time each week to read five numbers: money in, money out, cash left, unpaid invoices, hours worked. Start with the one you fear most.\nDone when the day and time are in your calendar, and you read all five once.\n\nIt’s the Evidence move in Level 02 of your free Blueprint. It opens as soon as Level 01 is done, and the step works on paper today.\n\nOpen my Blueprint →: https://linktolead.exploraself.com/ground-plan/#programme\n\nTell me in one line: which of the five do you fear most?\n\nEvery honest answer you write makes the next decision lighter. Keep going, you’re further along than you feel.\n\nAny question at all, big or small? Just reply to this email. It comes straight to me, and I read every one.\n· The number I fear most\n· I’m stuck on this step. Can you help?\n\nSee you soon. Have a good morning.\n\nAlexandru\nAlexandru Cojocari · ExploraSelf\n\nP.S. While you’re in, open Built to Lead in your library: 99 practical tools, free with your account. https://linktolead.exploraself.com/ground-plan/#library\n\nFree assessments, when you want to look deeper:\n· The Inner Boardroom: https://exploraself.com/unbound\n· Allow Yourself to Rise: https://exploraself.com/rise\n· The EQ Dividend: https://exploraself.com/eq\n—\nYou finished The Leader’s North Star in your free ExploraSelf account and told us what hurts most. These letters follow that, for ten days.\nUnsubscribe: https://linktolead.exploraself.com/api/unsubscribe?u=…\nExploraSelf · [postal address]"
 },
 {
  "id": "cash-3",
  "g": "cash",
  "n": 3,
  "day": 6,
  "subject": "Don’t decide about money in a storm",
  "hook": "",
  "link": {
   "url": "https://linktolead.exploraself.com/ground-plan/#programme",
   "label": "Open my Blueprint →",
   "move": "Blueprint · Level 03 CALM · Lag"
  },
  "ps": "Worth Building, 32 frameworks (free, library)",
  "paid": false,
  "text": "Hi ⟦Sam⟧,\n\nThank you for staying with me. Today is about the decisions tight cash pushes you into.\n\nWhen money is tight, the storm comes: a sudden cut, a discount, a yes to the wrong client. The storm will come again. Decide your rule now, while you are calm.\n\nYour step, ⟦by Monday⟧: finish this sentence: “When I feel ___ above 7 out of 10, I wait ___ hours before I decide about money.” Put it where you make money decisions.\nDone when the rule is written, and you used it once.\n\nIt’s the Lag move in Level 03, the last free level of your Blueprint. It opens once Levels 01 and 02 are done, and the step works on paper today.\n\nOpen my Blueprint →: https://linktolead.exploraself.com/ground-plan/#programme\n\nTell me in one line: which money decision did you make in a hurry that you’d make differently today?\n\nBuilding something that matters takes courage, and you have more of it than you think. One step this week is enough.\n\nAny question at all, big or small? Just reply to this email. It comes straight to me, and I read every one.\n· My storm rule\n· I’m stuck on this step. Can you help?\n\nSee you soon. Have a good morning.\n\nAlexandru\nAlexandru Cojocari · ExploraSelf\n\nP.S. Worth Building is free in your library: 32 frameworks for the decisions in front of you. https://linktolead.exploraself.com/ground-plan/#library\n\nFree assessments, when you want to look deeper:\n· Allow Yourself to Rise: https://exploraself.com/rise\n· The EQ Dividend: https://exploraself.com/eq\n· The Two-Week Test: https://exploraself.com/two-week-test\n—\nYou finished The Leader’s North Star in your free ExploraSelf account and told us what hurts most. These letters follow that, for ten days.\nUnsubscribe: https://linktolead.exploraself.com/api/unsubscribe?u=…\nExploraSelf · [postal address]"
 },
 {
  "id": "cash-4",
  "g": "cash",
  "n": 4,
  "day": 10,
  "subject": "What money means to you",
  "hook": "",
  "link": {
   "url": "https://linktolead.exploraself.com/northstar/#growth-plan",
   "label": "Open my Growth Plan →",
   "move": "North Star · Massive Growth Plan · step 12, What money means to you"
  },
  "ps": "PAID · The Boardroom, $27, gentle",
  "paid": true,
  "text": "Hi ⟦Sam⟧,\n\nTen days ago you told me cash is tight. Thank you for reading every letter since, on a subject that isn’t easy.\n\nYour prices often come from your childhood, not from your market. The same goes for the invoices you wait to send. What you learned about money growing up still sits in the room when you decide.\n\nYour step, ⟦by Saturday⟧: write what you learned about money growing up. Ask: is it true for my business today? Then send one invoice, or raise one price, because of your answer.\nDone when you acted once on the new belief.\n\nIt’s step 12 of your Massive Growth Plan, at the end of your North Star. Tick it there when it’s done.\n\nOpen my Growth Plan →: https://linktolead.exploraself.com/northstar/#growth-plan\n\nTell me in one line: what did you learn about money growing up?\n\nSmall steps, taken every week, build a business that runs and a life worth living. You’re on that road now.\n\nAny question at all, big or small? Just reply to this email. It comes straight to me, and I read every one.\n· What I learned about money\n· What happens in a 1:1 in The Boardroom?\n\nSee you soon. Have a good morning.\n\nAlexandru\nAlexandru Cojocari · ExploraSelf\n\nP.S. If you’d like to look at your numbers together, calmly: The Boardroom is one 1:1 with me, plus levels 04 and 05 and your full North Star. It’s $27. If you want it, tell me a time that suits you, and I’ll write back to confirm: https://forms.gle/opnxfhFTJJg69Qy77 If money is tight right now, that’s a good reason to wait. The first three levels are free and stay free.\n\nFree assessments, when you want to look deeper:\n· The EQ Dividend: https://exploraself.com/eq\n· The Two-Week Test: https://exploraself.com/two-week-test\n· First 100 Clients: https://exploraself.com/first-100-clients\n—\nYou finished The Leader’s North Star in your free ExploraSelf account and told us what hurts most. These letters follow that, for ten days.\nUnsubscribe: https://linktolead.exploraself.com/api/unsubscribe?u=…\nExploraSelf · [postal address]"
 },
 {
  "id": "team-1",
  "g": "team",
  "n": 1,
  "day": 1,
  "subject": "Room to step into",
  "hook": "proposal (pain has no hook yet)",
  "link": {
   "url": "https://linktolead.exploraself.com/ground-plan/#programme",
   "label": "Open Level 01 →",
   "move": "Blueprint · Level 01 SEED · Entrust"
  },
  "ps": "The EQ Dividend (free assessment)",
  "paid": false,
  "text": "Hi ⟦Sam⟧,\n\nThank you for finishing your Leader’s North Star. You told me what hurts most right now: your team isn’t stepping up. So my next few letters are about that, and only that.\n\nFinish it honestly: “People usually ___.” Let me down. Do it worse than I would. Need me to check everything. Whatever your ending, it shapes what you hand over, and how. People can only step up into room you leave for them.\n\nIf you keep checking everything, what will your team never learn to do?\n\nYou told me you want ⟦a team I trust⟧. Trust is built in steps, starting with one.\n\nYour step, ⟦by Wednesday⟧: choose one person and one clear task. Tell them the day and what “done” means. Then check once, not every hour.\nDone when the task was handed over with a day and a “done”, and you checked only once.\n\nIt’s the Entrust move in Level 01 of your free Blueprint: one tap, one slide, one sentence.\n\nOpen Level 01 →: https://linktolead.exploraself.com/ground-plan/#programme\n\nTell me in one line: how do you finish “People usually ___”?\n\nYou don’t have to carry all of it alone anymore. We’re right here with you, and we believe in what you’re building.\n\nAny question at all, big or small? Just reply to this email. It comes straight to me, and I read every one.\n· How my sentence ends\n· I’m stuck on this step. Can you help?\n\nSee you soon. Have a good morning.\n\nAlexandru\nAlexandru Cojocari · ExploraSelf\n\nP.S. Is your emotional intelligence paying you back, or leaking? The EQ Dividend is free and takes about five minutes: https://exploraself.com/eq\n\nFree assessments, when you want to look deeper:\n· The Two-Week Test: https://exploraself.com/two-week-test\n· First 100 Clients: https://exploraself.com/first-100-clients\n· The Inner Boardroom: https://exploraself.com/unbound\n—\nYou finished The Leader’s North Star in your free ExploraSelf account and told us what hurts most. These letters follow that, for ten days.\nUnsubscribe: https://linktolead.exploraself.com/api/unsubscribe?u=…\nExploraSelf · [postal address]"
 },
 {
  "id": "team-2",
  "g": "team",
  "n": 2,
  "day": 3,
  "subject": "The conversation you call patience",
  "hook": "",
  "link": {
   "url": "https://linktolead.exploraself.com/northstar/#growth-plan",
   "label": "Open my Growth Plan →",
   "move": "North Star · Massive Growth Plan · step 6, The conversation you call patience"
  },
  "ps": "Worth Building, 32 frameworks (free, library)",
  "paid": false,
  "text": "Hi ⟦Sam⟧,\n\nThank you for reading, ⟦Sam⟧. Today, one name.\n\nThere is one person in your work you avoid a real conversation with. You call it patience. It is protection. Nothing changes in a team until that conversation happens.\n\nYour step, ⟦by Friday⟧: write the person’s name and the conversation you avoid. Then write what you tell yourself so you don’t have to have it.\nDone when you named the person and the conversation.\n\nIt’s step 6 of your Massive Growth Plan, at the end of your North Star. Tick it there when it’s done.\n\nOpen my Growth Plan →: https://linktolead.exploraself.com/northstar/#growth-plan\n\nTell me in one line: what do you tell yourself so you don’t have to have it?\n\nBuilding something that matters takes courage, and you have more of it than you think. One step this week is enough.\n\nAny question at all, big or small? Just reply to this email. It comes straight to me, and I read every one.\n· The conversation I avoid\n· I’m stuck on this step. Can you help?\n\nSee you soon. Have a good morning.\n\nAlexandru\nAlexandru Cojocari · ExploraSelf\n\nP.S. Worth Building is free in your library: 32 frameworks for the decisions in front of you. https://linktolead.exploraself.com/ground-plan/#library\n\nFree assessments, when you want to look deeper:\n· Allow Yourself to Rise: https://exploraself.com/rise\n· The EQ Dividend: https://exploraself.com/eq\n· The Two-Week Test: https://exploraself.com/two-week-test\n—\nYou finished The Leader’s North Star in your free ExploraSelf account and told us what hurts most. These letters follow that, for ten days.\nUnsubscribe: https://linktolead.exploraself.com/api/unsubscribe?u=…\nExploraSelf · [postal address]"
 },
 {
  "id": "team-3",
  "g": "team",
  "n": 3,
  "day": 6,
  "subject": "Ask what happened",
  "hook": "",
  "link": {
   "url": "https://linktolead.exploraself.com/ground-plan/#programme",
   "label": "Open my Blueprint →",
   "move": "Blueprint · Level 02 VIEW · Inquire"
  },
  "ps": "Built to Lead, 99 tools (free, existing line)",
  "paid": false,
  "text": "Hi ⟦Sam⟧,\n\nThank you for staying with me. Today, the conversation itself.\n\nWhen someone lets us down, it’s easy to decide why without asking, say nothing and remember, or fix it ourselves. Each one feels quicker. None of them helps the person step up.\n\nYour step, ⟦by Monday⟧: start the conversation you named with a question, not a verdict: “When this happened, what was going on for you?” Then only listen. End with: “What do you need from me?”\nDone when you asked, you listened to the end, and you heard what they need.\n\nIt’s the Inquire move in Level 02 of your free Blueprint. It opens as soon as Level 01 is done, and the step works on paper today.\n\nOpen my Blueprint →: https://linktolead.exploraself.com/ground-plan/#programme\n\nTell me in one line: what did they need from you?\n\nSmall steps, taken every week, build a business that runs and a life worth living. You’re on that road now.\n\nAny question at all, big or small? Just reply to this email. It comes straight to me, and I read every one.\n· What they needed from me\n· I’m stuck on this step. Can you help?\n\nSee you soon. Have a good morning.\n\nAlexandru\nAlexandru Cojocari · ExploraSelf\n\nP.S. While you’re in, open Built to Lead in your library: 99 practical tools, free with your account. https://linktolead.exploraself.com/ground-plan/#library\n\nFree assessments, when you want to look deeper:\n· The EQ Dividend: https://exploraself.com/eq\n· The Two-Week Test: https://exploraself.com/two-week-test\n· First 100 Clients: https://exploraself.com/first-100-clients\n—\nYou finished The Leader’s North Star in your free ExploraSelf account and told us what hurts most. These letters follow that, for ten days.\nUnsubscribe: https://linktolead.exploraself.com/api/unsubscribe?u=…\nExploraSelf · [postal address]"
 },
 {
  "id": "team-4",
  "g": "team",
  "n": 4,
  "day": 10,
  "subject": "A time to push, a time to help",
  "hook": "",
  "link": {
   "url": "https://linktolead.exploraself.com/ground-plan/#programme",
   "label": "Open my Blueprint →",
   "move": "Blueprint · Level 03 CALM · Atmosphere"
  },
  "ps": "PAID · The Boardroom, $27, gentle",
  "paid": true,
  "text": "Hi ⟦Sam⟧,\n\nTen days ago you told me your team isn’t stepping up. Thank you for reading every letter since.\n\nWhen I worked as a personal trainer, I learned there is a time to push and a time to help. Leadership is serving. Your team reads your face before your plan, so the first five seconds of your reaction decide which one they feel.\n\nYour step, ⟦by Saturday⟧: write one sentence: “Under pressure, I will ___ instead of ___.” Then ask one person on your team to tell you when you slip.\nDone when your sentence is written, and one person has agreed to tell you.\n\nIt’s the Atmosphere move in Level 03, the last free level of your Blueprint. It opens once Levels 01 and 02 are done, and the step works on paper today.\n\nOpen my Blueprint →: https://linktolead.exploraself.com/ground-plan/#programme\n\nTell me in one line: what will you do in the first five seconds, from now on?\n\nYou don’t have to carry all of it alone anymore. We’re right here with you, and we believe in what you’re building.\n\nAny question at all, big or small? Just reply to this email. It comes straight to me, and I read every one.\n· My new first reaction\n· What happens in a 1:1 in The Boardroom?\n\nSee you soon. Have a good morning.\n\nAlexandru\nAlexandru Cojocari · ExploraSelf\n\nP.S. If you’d like to look at your team together: The Boardroom is one 1:1 with me, plus levels 04 and 05 and your full North Star. It’s $27. If you want it, tell me a time that suits you, and I’ll write back to confirm: https://forms.gle/opnxfhFTJJg69Qy77 If now isn’t the time, that’s a good answer. The first three levels stay free.\n\nFree assessments, when you want to look deeper:\n· The Two-Week Test: https://exploraself.com/two-week-test\n· First 100 Clients: https://exploraself.com/first-100-clients\n· The Inner Boardroom: https://exploraself.com/unbound\n—\nYou finished The Leader’s North Star in your free ExploraSelf account and told us what hurts most. These letters follow that, for ten days.\nUnsubscribe: https://linktolead.exploraself.com/api/unsubscribe?u=…\nExploraSelf · [postal address]"
 },
 {
  "id": "switch-1",
  "g": "switch",
  "n": 1,
  "day": 1,
  "subject": "Give the noise a meeting",
  "hook": "proposal (pain has no hook yet)",
  "link": {
   "url": "https://linktolead.exploraself.com/northstar/#growth-plan",
   "label": "Open my Growth Plan →",
   "move": "North Star · Massive Growth Plan · step 21, Sit your inner boardroom every week"
  },
  "ps": "The Inner Boardroom (free assessment)",
  "paid": false,
  "text": "Hi ⟦Sam⟧,\n\nThank you for finishing your Leader’s North Star. You told me what hurts most right now: you can’t switch off. So my next few letters are about that, and only that.\n\nInside you, four voices argue about every decision. The Dreamer wants. The Critic doubts. The Realist counts. Only the Leader decides. When they never get a meeting, they argue all night.\n\nIf the voices keep talking at midnight, what are they costing you in the morning?\n\nYou told me you want ⟦more free time⟧. That starts with ten minutes, on paper.\n\nYour step, ⟦today⟧: try it once, tonight. Ten minutes, four questions, written down. What do I want, and for whom? What am I avoiding? What will it really take? What is the one move this week? Then put Sunday in your calendar for the next one.\nDone when four answers are on paper, and Sunday is in your calendar.\n\nIt’s step 21 of your Massive Growth Plan, at the end of your North Star. Tick it there when it’s done.\n\nOpen my Growth Plan →: https://linktolead.exploraself.com/northstar/#growth-plan\n\nTell me in one line: which of the four voices is loudest for you?\n\nBuilding something that matters takes courage, and you have more of it than you think. One step this week is enough.\n\nAny question at all, big or small? Just reply to this email. It comes straight to me, and I read every one.\n· The loudest voice\n· I’m stuck on this step. Can you help?\n\nSee you soon. Have a good morning.\n\nAlexandru\nAlexandru Cojocari · ExploraSelf\n\nP.S. Who really makes the decisions inside your head? The Inner Boardroom is free and takes about five minutes: https://exploraself.com/unbound\n\nFree assessments, when you want to look deeper:\n· Allow Yourself to Rise: https://exploraself.com/rise\n· The EQ Dividend: https://exploraself.com/eq\n· The Two-Week Test: https://exploraself.com/two-week-test\n—\nYou finished The Leader’s North Star in your free ExploraSelf account and told us what hurts most. These letters follow that, for ten days.\nUnsubscribe: https://linktolead.exploraself.com/api/unsubscribe?u=…\nExploraSelf · [postal address]"
 },
 {
  "id": "switch-2",
  "g": "switch",
  "n": 2,
  "day": 3,
  "subject": "The rule that won’t let you rest",
  "hook": "",
  "link": {
   "url": "https://linktolead.exploraself.com/ground-plan/#programme",
   "label": "Open Level 01 →",
   "move": "Blueprint · Level 01 SEED · Settled"
  },
  "ps": "The Leader’s Growth Planner 2027 (free, library)",
  "paid": false,
  "text": "Hi ⟦Sam⟧,\n\nThank you for reading, ⟦Sam⟧. Today, the rule behind the noise.\n\nSometimes we can’t switch off because a rule won’t let us: “If I ___, then I’m worth something.” Never let anyone down. Get it perfect. That rule was learned. So it can be tested.\n\nYour step, ⟦by Saturday⟧: write your sentence. Then choose one evening: phone in a drawer at a fixed time, and nothing for work after it. Before bed, write one line about what really happened.\nDone when the evening happened, and you wrote your one line.\n\nIt’s the Settled move in Level 01 of your free Blueprint: one tap, one slide, one sentence.\n\nOpen Level 01 →: https://linktolead.exploraself.com/ground-plan/#programme\n\nTell me in one line: how does your sentence end?\n\nSmall steps, taken every week, build a business that runs and a life worth living. You’re on that road now.\n\nAny question at all, big or small? Just reply to this email. It comes straight to me, and I read every one.\n· How my sentence ends\n· I’m stuck on this step. Can you help?\n\nSee you soon. Have a good morning.\n\nAlexandru\nAlexandru Cojocari · ExploraSelf\n\nP.S. The Leader’s Growth Planner 2027 is free in your library: an agenda with a weekly check-in, so your plan and your week live in one place. https://linktolead.exploraself.com/ground-plan/#library\n\nFree assessments, when you want to look deeper:\n· The EQ Dividend: https://exploraself.com/eq\n· The Two-Week Test: https://exploraself.com/two-week-test\n· First 100 Clients: https://exploraself.com/first-100-clients\n—\nYou finished The Leader’s North Star in your free ExploraSelf account and told us what hurts most. These letters follow that, for ten days.\nUnsubscribe: https://linktolead.exploraself.com/api/unsubscribe?u=…\nExploraSelf · [postal address]"
 },
 {
  "id": "switch-3",
  "g": "switch",
  "n": 3,
  "day": 6,
  "subject": "Name it to tame it",
  "hook": "",
  "link": {
   "url": "https://linktolead.exploraself.com/ground-plan/#programme",
   "label": "Open my Blueprint →",
   "move": "Blueprint · Level 03 CALM · Call it"
  },
  "ps": "Allow Yourself to Rise (free assessment)",
  "paid": false,
  "text": "Hi ⟦Sam⟧,\n\nThank you for staying with me. Today, what sits under the noise.\n\nUnder “stressed” there is usually a truer feeling: afraid, ashamed, angry, lonely, tired. A named feeling loosens its grip. Don’t fight it. Name it, then breathe, then decide.\n\nYour step, ⟦by Monday⟧: the next time your mind won’t stop, write one line: “Under my stress is ___.” Then do one thing that helps, like a ten-minute walk, before you reply to anything.\nDone when you named the feeling once, and did the thing that helps before you decided anything.\n\nIt’s the Call it move in Level 03, the last free level of your Blueprint. It opens once Levels 01 and 02 are done, and the step works on paper today.\n\nOpen my Blueprint →: https://linktolead.exploraself.com/ground-plan/#programme\n\nTell me in one line: what was under the stress?\n\nYou don’t have to carry all of it alone anymore. We’re right here with you, and we believe in what you’re building.\n\nAny question at all, big or small? Just reply to this email. It comes straight to me, and I read every one.\n· What was under the stress\n· I’m stuck on this step. Can you help?\n\nSee you soon. Have a good morning.\n\nAlexandru\nAlexandru Cojocari · ExploraSelf\n\nP.S. Which of your five forces is the lid on your potential: clarity, strategy, emotional command, discipline or drive? Allow Yourself to Rise is free and takes about four minutes: https://exploraself.com/rise\n\nFree assessments, when you want to look deeper:\n· The Two-Week Test: https://exploraself.com/two-week-test\n· First 100 Clients: https://exploraself.com/first-100-clients\n· The Inner Boardroom: https://exploraself.com/unbound\n—\nYou finished The Leader’s North Star in your free ExploraSelf account and told us what hurts most. These letters follow that, for ten days.\nUnsubscribe: https://linktolead.exploraself.com/api/unsubscribe?u=…\nExploraSelf · [postal address]"
 },
 {
  "id": "switch-4",
  "g": "switch",
  "n": 4,
  "day": 10,
  "subject": "It can wait until morning",
  "hook": "",
  "link": {
   "url": "https://linktolead.exploraself.com/ground-plan/#programme",
   "label": "Open my Blueprint →",
   "move": "Blueprint · Level 03 CALM · Lag"
  },
  "ps": "PAID · The Boardroom, $27, gentle",
  "paid": true,
  "text": "Hi ⟦Sam⟧,\n\nTen days ago you told me you can’t switch off. Thank you for reading every letter since.\n\nI believe business is life, and life is business. So rest is part of the work, not a break from it. And the decisions that keep you awake are better made calm, in the morning.\n\nYour step, ⟦by Friday⟧: write your night rule: “When I feel ___ above 7 out of 10, I wait ___ hours before I decide about ___.” Keep it by your bed.\nDone when the rule is written, and one night decision waited until morning.\n\nIt’s the Lag move in Level 03, the last free level of your Blueprint. It opens once Levels 01 and 02 are done, and the step works on paper today.\n\nOpen my Blueprint →: https://linktolead.exploraself.com/ground-plan/#programme\n\nTell me in one line: which decision will wait until morning?\n\nYou showed up for your business today, and that is how every real change begins. I’m proud of the work you’re doing.\n\nAny question at all, big or small? Just reply to this email. It comes straight to me, and I read every one.\n· The decision that will wait\n· What happens in a 1:1 in The Boardroom?\n\nSee you soon. Have a good morning.\n\nAlexandru\nAlexandru Cojocari · ExploraSelf\n\nP.S. If you’d like to talk it through, out loud, with someone: The Boardroom is one 1:1 with me, plus levels 04 and 05 and your full North Star. It’s $27. If you want it, tell me a time that suits you, and I’ll write back to confirm: https://forms.gle/opnxfhFTJJg69Qy77 If now isn’t the time, that’s a good answer. The first three levels stay free.\n\nFree assessments, when you want to look deeper:\n· First 100 Clients: https://exploraself.com/first-100-clients\n· The Inner Boardroom: https://exploraself.com/unbound\n· Allow Yourself to Rise: https://exploraself.com/rise\n—\nYou finished The Leader’s North Star in your free ExploraSelf account and told us what hurts most. These letters follow that, for ten days.\nUnsubscribe: https://linktolead.exploraself.com/api/unsubscribe?u=…\nExploraSelf · [postal address]"
 },
 {
  "id": "never-1",
  "g": "never",
  "n": 1,
  "day": 2,
  "subject": "One tap to start",
  "hook": "",
  "link": {
   "url": "https://linktolead.exploraself.com/ground-plan/#programme",
   "label": "Open Level 01 →",
   "move": "Blueprint · Level 01 SEED · Settled"
  },
  "ps": "The Leader’s North Star (free)",
  "paid": false,
  "text": "Hi ⟦Sam⟧,\n\nThank you for making your free account two days ago. I’m glad you’re here.\n\nYour Founder’s Blueprint hasn’t started yet, and that’s all right. The first step is smaller than it looks.\n\nLevel 01 begins with one sentence: “If I ___, then I’m worth something.” You don’t write anything yet. You tap the ending that sounds like you, and slide one honest number.\n\nYour step, ⟦by Wednesday⟧: open Level 01 and do only the first tap and the first slide. Nothing else.\nDone when your first tap and slide are saved.\n\nOpen Level 01 →: https://linktolead.exploraself.com/ground-plan/#programme\n\nTell me in one line: what would you like to be different in twelve weeks?\n\nSmall steps, taken every week, build a business that runs and a life worth living. You’re on that road now.\n\nAny question at all, big or small? Just reply to this email. It comes straight to me, and I read every one.\n· What I want different in twelve weeks\n· Where should I start this week?\n\nSee you soon. Have a good morning.\n\nAlexandru\nAlexandru Cojocari · ExploraSelf\n\nP.S. If you haven’t yet, open The Leader’s North Star: eight plain questions and your rough numbers, and you’ll see where you stand in all four domains. Free: https://linktolead.exploraself.com/northstar/\n\nFree assessments, when you want to look deeper:\n· The EQ Dividend: https://exploraself.com/eq\n· The Two-Week Test: https://exploraself.com/two-week-test\n· First 100 Clients: https://exploraself.com/first-100-clients\n—\nYou created a free ExploraSelf account at linktolead.exploraself.com.\nUnsubscribe: https://linktolead.exploraself.com/api/unsubscribe?u=…\nExploraSelf · [postal address]"
 },
 {
  "id": "never-2",
  "g": "never",
  "n": 2,
  "day": 5,
  "subject": "What got in the way?",
  "hook": "",
  "link": {
   "url": "https://linktolead.exploraself.com/ground-plan/#programme",
   "label": "Open Level 01 →",
   "move": "Blueprint · Level 01 SEED"
  },
  "ps": "Leadionaire (free game, existing line)",
  "paid": false,
  "text": "Hi ⟦Sam⟧,\n\nThank you for still being here. I noticed your Blueprint hasn’t started yet. No guilt, and no hurry. I’d just like to understand.\n\nIt might be one of three things: there isn’t time, it isn’t clear where to start, or now simply isn’t the moment. All three are honest answers.\n\nIf it’s time: the first move is one tap and one slide. If it’s where to start: start with Level 01, what you believe, and the rest follows in order. If it’s the moment: that’s fine. Your account stays open and free.\n\nYour step, ⟦by Sunday⟧: tap one of the answers under this letter, so I know how to help.\nDone when your one-tap answer is on its way to me.\n\nAnd if you’d rather just begin:\n\nOpen Level 01 →: https://linktolead.exploraself.com/ground-plan/#programme\n\nTell me in one line: which one is it for you?\n\nYou don’t have to carry all of it alone anymore. We’re right here with you, and we believe in what you’re building.\n\nAny question at all, big or small? Just reply to this email. It comes straight to me, and I read every one.\n· Time is the problem\n· I’m not sure where to start\n· Not now, maybe later\n\nSee you soon. Have a good morning.\n\nAlexandru\nAlexandru Cojocari · ExploraSelf\n\nP.S. Got ten minutes? Play Leadionaire: fifteen decisions, thirty seconds each. It shows how you choose under pressure: https://exploraself.com/play\n\nFree assessments, when you want to look deeper:\n· The Two-Week Test: https://exploraself.com/two-week-test\n· First 100 Clients: https://exploraself.com/first-100-clients\n· The Inner Boardroom: https://exploraself.com/unbound\n—\nYou created a free ExploraSelf account at linktolead.exploraself.com.\nUnsubscribe: https://linktolead.exploraself.com/api/unsubscribe?u=…\nExploraSelf · [postal address]"
 },
 {
  "id": "never-3",
  "g": "never",
  "n": 3,
  "day": 9,
  "subject": "Should I keep writing?",
  "hook": "",
  "link": {
   "url": "https://linktolead.exploraself.com/ground-plan/#programme",
   "label": "Open Level 01 →",
   "move": "Blueprint · Level 01 SEED"
  },
  "ps": "Built to Lead, 99 tools (free, existing line)",
  "paid": false,
  "text": "Hi ⟦Sam⟧,\n\nThank you for reading my letters. This is the last one about starting. I don’t want to fill your inbox with things you didn’t ask for.\n\nYour account stays open, and the first three levels stay free. Everything waits for you, exactly as you left it.\n\nIf you do want to start, give it a place in your week. An action plan is not a memoir. It needs a day.\n\nYour step, ⟦by Friday⟧: choose one evening and put “Level 01” in your calendar, with a time.\nDone when it’s in your calendar.\n\nOpen Level 01 →: https://linktolead.exploraself.com/ground-plan/#programme\n\nKeep writing, check back in a month, or not now? One tap below is enough.\n\nBuilding something that matters takes courage, and you have more of it than you think. One step this week is enough.\n\nAny question at all, big or small? Just reply to this email. It comes straight to me, and I read every one.\n· Yes, keep writing to me\n· Check back in a month\n· Not for me right now\n\nSee you soon. Have a good morning.\n\nAlexandru\nAlexandru Cojocari · ExploraSelf\n\nP.S. While you’re in, open Built to Lead in your library: 99 practical tools, free with your account. https://linktolead.exploraself.com/ground-plan/#library\n\nFree assessments, when you want to look deeper:\n· Allow Yourself to Rise: https://exploraself.com/rise\n· The EQ Dividend: https://exploraself.com/eq\n· The Two-Week Test: https://exploraself.com/two-week-test\n—\nYou created a free ExploraSelf account at linktolead.exploraself.com.\nUnsubscribe: https://linktolead.exploraself.com/api/unsubscribe?u=…\nExploraSelf · [postal address]"
 },
 {
  "id": "level3-1",
  "g": "level3",
  "n": 1,
  "day": 1,
  "subject": "Sam, you finished your first three levels",
  "hook": "",
  "link": {
   "url": "https://forms.gle/opnxfhFTJJg69Qy77",
   "label": "Tell me a good time →",
   "move": "The Boardroom · booking form (Google Form, confirmed by hand)"
  },
  "ps": "Growth Plan step 21, the Sunday boardroom (free)",
  "paid": false,
  "text": "Hi ⟦Sam⟧,\n\nYou finished Level 03. That’s the whole free part of your Blueprint: what you believe, how you read it, what you feel. Thank you for the honest work. I don’t take it lightly.\n\nOne line you wrote, in your own words: “When I feel ⟦panic⟧ above 7 out of 10, I wait ⟦24⟧ hours before I decide about ⟦money⟧.” That’s a storm rule, written while calm. Keep it where you can see it.\n\nThe next step, if you want it, is The Boardroom. It’s one 1:1 with me. Before we meet, I read your North Star and your three levels, so we don’t start from zero. You talk most; I ask. At the end, we choose one road together. Levels 04 and 05 open with it, and your full North Star. It’s $27.\n\nYour step, ⟦by Monday⟧: if you want it, tell me a time that suits you in this short form. I’ll write back myself to confirm.\nDone when the form is sent, or you’ve decided “not now”, which is a good answer too.\n\nTell me a good time →: https://forms.gle/opnxfhFTJJg69Qy77\n\nTell me in one line: what would make that hour worth it for you?\n\nSmall steps, taken every week, build a business that runs and a life worth living. You’re on that road now.\n\nAny question at all, big or small? Just reply to this email. It comes straight to me, and I read every one.\n· What happens in a 1:1 in The Boardroom?\n· What would make the hour worth it\n· Not now, thank you\n\nSee you soon. Have a good morning.\n\nAlexandru\nAlexandru Cojocari · ExploraSelf\n\nP.S. Whatever you decide, keep one habit: ten minutes every Sunday with your four voices, written down. It’s step 21 of your Massive Growth Plan: https://linktolead.exploraself.com/northstar/#growth-plan\n\nFree assessments, when you want to look deeper:\n· The EQ Dividend: https://exploraself.com/eq\n· The Two-Week Test: https://exploraself.com/two-week-test\n· First 100 Clients: https://exploraself.com/first-100-clients\n—\nYou finished Level 03 of The Founder’s Blueprint in your free ExploraSelf account.\nUnsubscribe: https://linktolead.exploraself.com/api/unsubscribe?u=…\nExploraSelf · [postal address]"
 },
 {
  "id": "level3-2",
  "g": "level3",
  "n": 2,
  "day": 4,
  "subject": "Not now is a good answer",
  "hook": "",
  "link": {
   "url": "https://linktolead.exploraself.com/ground-plan/#library",
   "label": "Open my library →",
   "move": "Base Camp · Library (the free road)"
  },
  "ps": "The Two-Week Test (free assessment)",
  "paid": false,
  "text": "Hi ⟦Sam⟧,\n\nThank you for reading my letter about The Boardroom. I want to make it easy to say no.\n\nIf the timing, the money or the fit isn’t right, just tell me which one. I won’t chase you.\n\nYour free road stays open. Everything you wrote is yours. Your library stays open. And your Growth Plan has 21 steps that need no one but you.\n\nOne favour, only if you want: what changed for you in these three levels? Two lines are enough. I’ll only ever share them with your written yes.\n\nYour step, ⟦by Wednesday⟧: reply with one word: now, later, or not for me. If it’s “now”, I’ll send you times myself.\nDone when I know, so I can help in the right way.\n\nOpen my library →: https://linktolead.exploraself.com/ground-plan/#library\n\nAnd if you’re willing, tell me in two lines: what changed for you in three levels?\n\nEvery honest answer you write makes the next decision lighter. Keep going, you’re further along than you feel.\n\nAny question at all, big or small? Just reply to this email. It comes straight to me, and I read every one.\n· Now: please send me times\n· Later: write to me in a month\n· Not for me, thank you\n· My two lines: what changed\n\nSee you soon. Have a good morning.\n\nAlexandru\nAlexandru Cojocari · ExploraSelf\n\nP.S. If you stepped away for two weeks, what would break first? The Two-Week Test shows you, free, in about six minutes: https://exploraself.com/two-week-test\n\nFree assessments, when you want to look deeper:\n· The Inner Boardroom: https://exploraself.com/unbound\n· Allow Yourself to Rise: https://exploraself.com/rise\n· The EQ Dividend: https://exploraself.com/eq\n—\nYou finished Level 03 of The Founder’s Blueprint in your free ExploraSelf account.\nUnsubscribe: https://linktolead.exploraself.com/api/unsubscribe?u=…\nExploraSelf · [postal address]"
 }
];
