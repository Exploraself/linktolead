// Twenty actions a level (Alexandru, 2 Nov 2026). In each of the four areas,
// five actions in one order: Look (open and count), Decide (write the line),
// Do (the level's own action, from the founder's sentence), Involve (one
// person or customer), Keep (make it weekly). Each is written for the four
// sizes "Where are you now?" finds: before the first sale, selling alone, a
// team with payroll, sixteen people or more (AGENTS.md 12 and 16).
//
// How the material is organised (for whoever writes it, never shown):
// Inform → Reform → Transform. Look and Decide inform and reform; Do, Involve
// and Keep transform. Every action can be done and checked this week
// (AGENTS.md 1 and 10). Every example is marked as one.
//
// One action is { t, ex?, exLabel? }: t is a sentence for every size, or
// { start, solo, team, company }; ex is an example in the same shape. The
// founder's ticks are kept as w.v4.<level>.<area>.a<0-4> = the date.

export const STEPS5 = ['Look', 'Decide', 'Do', 'Involve', 'Keep'];
export const STEP_SAYS = ['open and count', 'write the line', 'the level’s own action', 'one person or customer', 'make it weekly'];
export const SIZES4 = [['start', 'Before the first sale'], ['solo', 'Selling alone'], ['team', 'A team with payroll'], ['company', '16 people or more']];
/** The "Where are you now?" stage that stands for each size, when a founder switches it. */
export const SIZE_STAGE = { start: 1, solo: 2, team: 3, company: 4 };
const S = (start, solo, team, company) => ({ start, solo, team, company });

export const ACTIONS4 = {
  // ── Level 01 · What you believe ──────────────────────────────────────────
  '1.0': [
    { t: S('Open last month’s calendar. Mark every evening or weekend you gave the idea out of guilt, not by plan. Count them.',
      'Open last month’s calendar. Mark the days you worked past the hour you set, or said yes to work you did not want. Count them.',
      'Open last month’s calendar. Mark the days you redid someone’s work or stayed last “to be sure”. Count them.',
      'Open last month’s calendar. Mark the decisions you took back from your leads, and the meetings you joined “just in case”. Count them.') },
    { t: 'Write the old rule in one line (“If I ___, then I’m worth something”), the days it took, and the line you choose instead: “I am ___ before I achieve anything.”',
      ex: S('Your job pays the rent this month. Your worth is not on trial.', 'Your income moves every month. Your worth does not move with it.',
        'Your people need clear decisions on payday, not a founder proving something.', 'Fifty salaries need decisions taken from the plan, not from the need to prove yourself.'), exLabel: 'The pressure, named' },
    { t: 'On the day you chose, do one thing the old rule forbids, and write one line on what really happened.',
      ex: S('Saturday off the idea; Sunday, three planned hours on it.', 'Thursday evening off, phone in a drawer; the client email answered Friday at 9.',
        'Leave at 5 on Wednesday and let the team close the day.', 'Skip the Tuesday meeting you join “to be sure”, and read its notes on Wednesday.') },
    { t: S('Tell your partner or a friend what you are testing, and ask them on Monday: “Did anything break?”',
      'Tell one client you trust that replies now come in working hours. On Monday, ask if anything was missed.',
      'Tell your second-in-command what you are testing. On Monday ask: “What did you decide without me?”',
      'Tell your leadership team which meeting you are leaving, and who now decides there.') },
    { t: S('Book one evening a week off the idea for the next four weeks, in your calendar now.', 'Block the same evening every week for four weeks, as a recurring event.',
      'Put “I leave at 5 on Wednesdays” in the shared calendar, so the team plans for it.', 'Take yourself off one recurring meeting for good, in writing.') }],
  '1.1': [
    { t: S('List what you did for the idea last week that a tool, a template or a freelancer could do in two hours. Mark the one that took longest.',
      'List last week’s tasks someone else could do: invoices, bookings, posts. Mark the one that took the most hours.',
      'List the tasks that came back to your desk last week. Mark the one that comes back most often.',
      'List the decisions that reached you last week that a lead could have taken. Mark the one that came up most.') },
    { t: 'Write what “done” means for it, in one sentence a stranger could check.',
      ex: S('“Three logo options as PNG files, by Friday noon.”', '“Every invoice sent by 5 pm on Monday.”',
        '“All Monday invoices sent by 5 pm, and the list in the shared folder.”', '“Supplier orders under $5,000 approved within one day, and logged.”') },
    { t: 'Hand it over on the day you chose, with “done” in writing, and check it only once.',
      ex: S('A two-hour brief to a freelancer.', 'Invoices to a bookkeeper, two hours a week.', 'Monday invoices to Jordan.', 'Supplier approvals to your operations lead.') },
    { t: 'Ask the person: “What would you need from me to do this without asking me?” Write their answer down, and give it to them.' },
    { t: S('Save the brief as a template for the next hand-over.', 'Put the one check in your calendar, and write the hand-over as five steps in a shared note.',
      'Add the task, its owner and its “done” to the team’s process list.', 'Add it to the list of decisions your leads own, where everyone can see it.') }],
  '1.2': [
    { t: S('Write the money you need each month to live, and how many months your job or savings cover while you test the idea.',
      'Open last month’s bank statement and write three numbers: money in, fixed costs, what was left.',
      'Open last month’s statement: money in, payroll, what was left, and how many weeks of payroll are in the bank today.',
      'Ask whoever keeps your books for one page: cash today, payroll for the next three months, and your two largest clients’ share of sales.') },
    { t: S('Write your enough, and the price that would reach it with ten customers.', 'Write your enough: what the business pays you each month, on a set day.',
      'Write your enough, and the cushion that lets you sleep: how many weeks of payroll stay in the bank.', 'Write the cash floor where you change course, and who must hear it the day you reach it.') },
    { t: 'Make the one money move you wrote, on the day you chose.',
      ex: S('Check that price with one person who might buy.', 'Raise the rate for new clients.', 'Send the three late invoices a reminder on Monday.', 'Agree the cash floor with your finance lead.') },
    { t: S('Tell one person your enough number: a partner, a friend in business, a mentor.', 'Tell your accountant or your partner your enough number, and the day you pay yourself.',
      'Show your bookkeeper the cushion number, and ask them to warn you when you come near it.', 'Put the cash floor on the next leadership or board agenda.') },
    { t: S('Book twenty minutes every Monday to read the same three numbers. A machine can add them up; what they mean is your call.',
      'Book twenty minutes every Monday to read the same three numbers. A machine can add them up; what they mean is your call.',
      'Book twenty minutes every Monday for money in, payroll and the cushion. A machine can add them up; what they mean is your call.',
      'Ask for the same one page every Monday, and read it before your first meeting. The machine makes the page; the decision is yours.') }],
  '1.3': [
    { t: S('Count the people you told about the idea last month, and how many of them you asked to try it.', 'Count last month’s direct asks: the times you asked someone to buy or to book.',
      'Count the asks you made yourself last month, and the ones your team made.', 'Ask your sales lead for last month’s direct asks and their answers, client by client.') },
    { t: 'Write your offer in one line: who it helps, with which problem.',
      ex: S('“I help new parents get their evenings back.”', '“I help café owners fill their quiet afternoons.”', '“We help clinics stop losing patients between visits.”', '“We keep regional retailers’ shelves full, every week.”') },
    { t: S('By Friday, ask three people who might buy to try it, at a price. Write each answer word for word.',
      'By Friday, ask three people to buy or to book. Write each answer word for word: a yes, a no and no answer all count.',
      'By Friday, ask three past clients yourself to buy again.', 'By Friday, call three of your largest customers yourself and ask for the next order, or for one introduction.') },
    { t: S('Ask the three: “What would make this a yes for you?” Keep their exact words.', 'Ask three clients what almost stopped them buying. Put their exact words in the first line of your offer.',
      'Ask three clients what almost stopped them buying. Put their exact words in the first line of your offer.', 'Ask three customers what almost stopped them buying, and give their exact words to your sales team.') },
    { t: S('Book one hour a week to ask, the same day each week, for the next four weeks.', 'Book one hour a week to ask, on the same day, as a recurring event.',
      'Put one asking hour a week in your calendar, and one in each salesperson’s.', 'Make “Who did we ask for the next order?” the first line of your weekly sales meeting.') }],

  // ── Level 02 · How you read it ───────────────────────────────────────────
  '2.0': [
    { t: S('Open your notes and messages from last week. Find the moment the idea felt hopeless, and write what actually happened in one line a camera could film.',
      'Open last week’s messages. Find the one that spoiled your day, and write what it actually said, word for word.',
      'Open last week’s messages. Find the one from your team or a client that spoiled your day, and write what it actually said, word for word.',
      'Open last week’s board or leadership notes. Find the moment you reacted hardest, and write what was actually said, word for word.') },
    { t: 'Next to it, write the story you told yourself, and one other reading that could also be true.',
      ex: S('A friend did not reply about the idea: maybe busy, not a verdict.', 'A client cancelled: maybe their budget changed.',
        'Payroll is in four days and a client pays late: maybe their bank, not their intent.', 'The bank asked for a meeting: maybe routine, not a warning.') },
    { t: 'The next time something goes wrong, write the facts, the story and the truer reading before you reply or decide.' },
    { t: S('Before you act on the story, check one fact with the person involved: “Can I check what happened?”',
      'Before you act on the story, check one fact with the client: “Can I check what happened?”',
      'Before you act on the story, ask the person involved for the facts, face to face.',
      'Before the meeting where you decide, ask the person closest to it for the facts in writing.') },
    { t: S('Keep the three-line check (facts, story, truer reading) on your phone, and use it on the hardest moment of each week.',
      'Keep the three-line check on your phone, and use it on the hardest moment of each week.',
      'Keep the three-line check on your phone, and teach it to one person on your team.',
      'Open your weekly leadership meeting with one question: “What are the facts?”') }],
  '2.1': [
    { t: S('List the people helping you: a partner, a friend, a freelancer. Mark one you judged last week without asking.',
      'List the people you rely on: clients, suppliers, a freelancer. Mark one you judged last week without asking.',
      'List your team. Mark the person you judged last week without asking why.',
      'List your direct reports. Mark the one you drew a conclusion about last week without asking.') },
    { t: 'Write the question you will ask: “When ___ happened, what was going on for you?”',
      ex: S('“When the mock-up came late, what was going on for you?”', '“When the payment was late, what was going on for you?”', '“When the order went out late, what was going on for you?”', '“When the numbers came in late, what was going on for you?”') },
    { t: 'Ask it on the day you chose, then only listen. Write one line of what you heard.' },
    { t: 'Then ask: “What would help next time?” Do the part that is yours by Friday.' },
    { t: S('Before you judge anyone this month, ask first. Mark each time in your notes.', 'Put the question at the top of your client check-ins this month.',
      'Open every one-to-one this month with one question, before any judgement.', 'Ask each lead to open their one-to-ones the same way, and to tell you what changed.') }],
  '2.2': [
    { t: S('Write the five numbers of the idea: money spent so far, cost each month, months of savings left, people asked, people who said yes.',
      'Write last month’s five numbers: money in, money out, cash left, unpaid invoices, hours worked. Mark the ones you had to guess.',
      'Write last month’s five: money in, payroll and costs, cash left, unpaid invoices, your own hours. Mark the ones you had to guess.',
      'Ask for last month’s five on one page: sales, costs, cash, money owed to you, and your own hours. Mark the ones nobody could give you.') },
    { t: 'Choose the day and the time you read them every week, and the one you fear most, to read first.' },
    { t: 'Read all five on that day, the feared one first, and write them down.' },
    { t: S('Show the five to one person who will ask you about them next week.', 'Send each unpaid invoice a reminder the same day you read them.',
      'Ask your bookkeeper to send you the five every week, the day before you read them.', 'Ask your finance lead to send the five every week, with one line on what changed.') },
    { t: 'Put the reading in your calendar as a weekly event. The machine adds them up; what they ask of you is your decision.' }],
  '2.3': [
    { t: S('Count the people who said “interesting” about the idea last month, and how many asked the price or for a time.', 'Count your last ten “interested” people, and how many paid.',
      'Count the last ten leads that came in, and how many paid.', 'Ask your sales lead for the last twenty “interested” leads, and how many paid.') },
    { t: 'Write one signal you believe in (“when a customer ___, it means ___”) and how you will check it.',
      ex: S('When someone asks when it launches, they would pay.', 'When a client asks the price twice, they are close to yes.', 'When a client asks for a second quote, they compare on price.', 'When their finance team joins the call, the deal is real.') },
    { t: 'Check the signal once this week, and write what the customer actually said.' },
    { t: 'Ask the customer directly: “What would you need to decide?” Keep their words.' },
    { t: S('Keep a page of signals and what really happened. Read it before every ask.', 'Keep one page: the signal, what you thought, what they said. Add a line every week.',
      'Read the signal page with your team once a week.', 'Add “Which signal did we test?” to the weekly sales meeting.') }],

  // ── Level 03 · What you feel ─────────────────────────────────────────────
  '3.0': [
    { t: S('Write the three moments last week your stomach tightened about the idea. Next to each, name what was under it: afraid, ashamed, angry, lonely or tired.',
      'Write the three moments last week your stomach tightened. Next to each, name what was under it: afraid, ashamed, angry, lonely or tired.',
      'Write the three tense moments of last week, at least one about payroll or a person. Name what was under each.',
      'Write the three tense moments of last week, at least one in front of your team or board. Name what was under each.') },
    { t: 'Write what you will do first, before you decide, in one line you can do within ten minutes.',
      ex: S('Write my answer to my partner about money, then wait an hour before I say it.', 'Draft the client reply, wait an hour, then send it.',
        'Read the payroll numbers before I answer anyone about payroll.', 'Ask for the facts in writing before I reply to the board.') },
    { t: 'At the first tense moment this week, do that first, then decide. Write down the day.' },
    { t: S('Tell one person what you feel under the stress, in one sentence, and what you will do about it.', 'Tell one person you trust the feeling under the stress, in one sentence.',
      'Tell your second-in-command what you do before deciding under pressure, so they can remind you.', 'Tell your chair, a coach or one peer the feeling, and ask them to ask you about it next week.') },
    { t: 'Put the line on your phone’s lock screen, use it each time this week, and count the times.' }],
  '3.1': [
    { t: S('Ask the person closest to you how you react when the idea goes wrong. Write their words.', 'Ask a client or supplier you trust how you come across when something goes wrong. Write their words.',
      'Ask two people on your team: “When things go wrong, what do I do first?” Write their words.', 'Ask your leads in writing: “When we get bad news, what do I do first?” Read every answer.') },
    { t: 'Write what you will do in the first five seconds instead: one sentence you can say.', ex: S('“Thank you for telling me. What do we know?”', '“Thank you for telling me. What do we know?”', '“Thank you for telling me. What do we know?”', '“Thank you for telling me. What do we know?”') },
    { t: 'Use it at least once under pressure this week.' },
    { t: 'Ask one person to tell you when you slip, and thank them when they do.' },
    { t: S('Count this week’s slips and keeps in your notes.', 'Count this week’s slips and keeps on one line of your planner.',
      'Ask the team on Friday: “Was it easier to bring me bad news this week?”', 'Ask your leads to bring you the worst news first in Monday’s meeting, and answer with your sentence.') }],
  '3.2': [
    { t: S('Write the last money decision you made upset about the idea, and what it cost.', 'Write the last decision you made upset: what it was, and what it cost in money or time.',
      'Write the last decision you made upset about payroll, a hire or a client, and what it cost.', 'Write the last decision taken in a storm, by you or your leadership team, and what it cost.') },
    { t: 'Write your storm rule while you are calm: “When I feel ___ above 7 out of 10, I wait ___ hours before I decide about ___.”',
      ex: S('Panic: 24 hours before I spend savings.', 'Fear: 24 hours before I drop my price.', 'Anger: 48 hours before I let anyone go.', 'Pressure from the bank: one week before I cut a team.') },
    { t: 'Put the rule on your phone’s lock screen or your desk, and use it in the first storm this week.' },
    { t: S('Tell one person the rule, and agree they are the one you call while you wait.', 'Tell one person the rule, and agree they are the one you call while you wait.',
      'Tell one person the rule, and agree they are the one you call while you wait.', 'Agree the rule with your leadership team: no decision on it in the meeting where it is raised.') },
    { t: 'Every Friday this month, write the storm decisions you waited on, and what you decided after.' }],
  '3.3': [
    { t: S('Read three messages from people who might buy. Underline every worry.', 'Read your last three client conversations or emails. Underline every worry.',
      'Read three recent client emails or complaints. Underline every worry.', 'Read ten recent customer messages or complaints. Underline the worry that comes back most.') },
    { t: 'Write your guess, marked as a guess: “They fear ___ and hope for ___.”',
      ex: S('They fear wasting money on something new; they hope for an easier evening.', 'They fear paying for nothing; they hope for full tables without discounts.',
        'They fear being let down again; they hope for one supplier they can trust.', 'They fear a switch that breaks their operation; they hope for one partner for years.') },
    { t: 'On the day you chose, ask one client: “Before we started, what worried you most? What did you hope for?” Write their words.' },
    { t: S('Use their exact words in the first line of your next message: “If you’re worried about ___, …”', 'Use their exact words in the first line of your next message or offer: “If you’re worried about ___, …”',
      'Use their exact words in the first line of your next offer, and read them to your team.', 'Give their exact words to whoever writes your website and your sales emails.') },
    { t: 'Keep a page of their words, fears and hopes, word for word. Add one every week.' }],

  // ── Level 04 · What you do ───────────────────────────────────────────────
  '4.0': [
    { t: 'Count last week’s plans: how many you made, how many you kept, and what broke the rest.',
      ex: S('The evening hour on the idea, broken by tiredness.', 'The morning writing hour, broken by messages.', 'The planning hour, broken by questions from the team.', 'The strategy morning, broken by urgent meetings.') },
    { t: 'Write one if–then plan: “When ___, I will ___. If ___ shows up, then I ___.”' },
    { t: 'Use it every working day this week, and mark each day “kept” or “not kept”.' },
    { t: S('Tell the people you live with your plan, so they know when you work on the idea.', 'Tell your clients your reply hours.',
      'Tell your team when you are not to be interrupted, and who to ask instead.', 'Tell your assistant or your leads which hours are protected, and what counts as urgent.') },
    { t: 'Put the plan in your calendar as a recurring block for the next four weeks.' }],
  '4.1': [
    { t: S('Read the last three things you asked someone to do. Mark the ones with no date or no clear “done”.', 'Read your last three requests to a client, supplier or freelancer. Mark the ones with no date or no “done”.',
      'Read your last five requests to your team. Mark the ones with no date or no “done”.', 'Read your last five requests to your leads. Mark the ones with no date, no “done” or no owner.') },
    { t: 'Rewrite one of them in four parts: who, what, by when, and what “done” looks like.' },
    { t: 'Send the ask in writing, with the date and the “done”, and check it once on the day.' },
    { t: 'End the ask with: “Is there anything you need from me to do it?” Give them what they need.' },
    { t: S('Use who, what, when and “done” for every ask this month.', 'Save the ask as a template, and use it for every request this month.',
      'Make who, what, when and “done” the format of every task in your team’s list.', 'Ask your leads to use the same four lines for every request they send.') }],
  '4.2': [
    { t: S('Write the hours you gave the idea last week, and mark the ones that moved it toward a first sale.', 'Write last week’s hours: paid work, selling, admin, fixing. Mark the hours someone cheaper could do.',
      'Write last week’s hours: selling, leading, fixing others’ work, admin. Mark the hours someone else could do.', 'Ask for your last two weeks of calendar. Mark the hours spent on work below your role.') },
    { t: S('Write your hour’s price: the income you want, divided by the hours you can give.', 'Write your hour’s price: what you need to earn, divided by the hours you sell.',
      'Write your hour’s price: what you need to earn, divided by the hours you work. Then the work only you can do at that price.', 'Write what one hour of yours must move: a decision, a client, a leader. The rest goes to someone else.') },
    { t: 'Put the work only you can do first, every day this week, and hand one task back by the day you chose.' },
    { t: S('Ask a freelancer or a friend for a price on the task that steals the most hours.', 'Ask one person what they would charge to take your cheapest hour off you.',
      'Hand that task to the person whose job it should be, with a date and a “done”.', 'Give one recurring decision to a lead, in writing.') },
    { t: 'Block the first hour of every working day for the work only you can do, for the next four weeks.' }],
  '4.3': [
    { t: S('Count the conversations you had with possible buyers last week. Write their names.', 'Count last week’s conversations with buyers. Write their names.',
      'Count the buyer conversations you had yourself last week, and the team’s.', 'Count the customer conversations you had yourself last month. Write their names.') },
    { t: 'Choose your selling hour: the day, the time, and how many buyers you will talk to.' },
    { t: 'Hold the hour on the day, talk to the buyers you chose, and follow up once with everyone who stays silent.' },
    { t: 'When someone says “let me think”, ask: “What would you need to know to decide?” Then agree a day.' },
    { t: S('Book the hour every week for the next four weeks.', 'Book it as a recurring event, and never move it twice in a row.',
      'Book it for you and one person on your team, at the same hour.', 'Keep one customer hour a week for yourself, and ask each lead to keep one.') }],

  // ── Level 05 · What you became ───────────────────────────────────────────
  '5.0': [
    { t: 'Read what you wrote in Level 01. Mark one thing you do now that you did not do then.' },
    { t: 'Write the sentence “I am becoming someone who ___”, and your first proof, with its date.',
      ex: S('14 Nov: I asked a stranger to try it, at a price.', '14 Nov: I raised my rate and kept the client.', '14 Nov: I left at 5 and nothing broke.', '14 Nov: I let a lead decide, and backed the decision in front of the team.') },
    { t: 'Add one more dated proof this week, under the first.' },
    { t: 'Ask one person who works with you: “What have you seen me do differently lately?” Write their words.' },
    { t: 'Keep the proof list where you plan your week, and add one line every Friday.' }],
  '5.1': [
    { t: S('List who helped the idea move this month: a friend, a partner, a first tester.', 'List who helped your business this month: a client, a supplier, a freelancer.',
      'List who on your team did something that mattered this month.', 'Ask each lead for one person in their team who changed something this month.') },
    { t: 'Pick one. Write exactly what they did, and what it changed.' },
    { t: 'Tell them on the day you chose, face to face or in writing: what they did, and what it changed.' },
    { t: S('Send the same kind of thanks to one more person this week.', 'Send the same kind of thanks to one client who stayed with you.',
      'Say it again in front of the team, if they are comfortable with that.', 'Ask each lead to send one thanks like it in their team this week.') },
    { t: 'Put one specific thank-you in your calendar every Friday, for four weeks.' }],
  '5.2': [
    { t: S('Read your five numbers from Level 02. Mark the one that tells you most about whether the idea will work.', 'Read your five numbers from the last weeks. Mark the one that tells the truth about the business now.',
      'Read your five numbers from the last weeks. Mark the one that tells the truth about the business now.', 'Ask your finance lead which single number they would watch if they owned the business. Write it next to yours.') },
    { t: 'Write the one number you will read every week, and the belief you will question if it misses.',
      ex: S('People who said yes; the belief: “nobody pays for this”.', 'Cash left; the belief: my fear of asking for money.', 'Profit per job; the belief: “we must take every job”.', 'Cash from sales; the belief: “growth fixes everything”.') },
    { t: 'Read it on your day, write it down, and if it missed, write one line on the belief behind it.' },
    { t: S('Tell one person the number, and what you will change if it misses again.', 'Tell one person the number, and what you will change if it misses again.',
      'Tell your team the number, and what you will change together if it misses again.', 'Share it with your leadership team as the one number for this quarter.') },
    { t: 'Write it every week in the same place, so you can see four weeks side by side.' }],
  '5.3': [
    { t: S('Read the words people have used about the idea since Level 01. Underline the ones you would never have written yourself.', 'Read your website or your offer. Underline every line written in your words, not a client’s.',
      'Read your website or your offer. Underline every line written in your words, not a client’s.', 'Read your homepage and your main sales email. Underline every line no customer would say.') },
    { t: 'Write your guess: “When ___ happens, my clients want to ___, so they can ___.”' },
    { t: S('By Friday, ask three people who tried it or might buy: “What was going on when you heard of it? What did you want instead?” Write their answers word for word.',
      'By Friday, ask three clients: “When you came to me, what was going on? What did you want instead? What changed?” Write their answers word for word.',
      'By Friday, ask three clients: “When you came to us, what was going on? What did you want instead? What changed?” Write their answers word for word.',
      'By Friday, ask three customers yourself: “When you came to us, what was going on? What did you want instead? What changed?” Write their answers word for word.') },
    { t: 'Ask one of them: “May I use your words?” Keep the yes in writing.' },
    { t: S('Every month, replace one line of what you say about the idea with their words.', 'Every month, replace one line of your offer with a client’s words.',
      'Every month, replace one line of your offer with a client’s words.', 'Ask whoever writes your marketing to replace one line with customers’ words every month.') }],
};

/** The levels whose twenty actions are written. */
export const ACTION_LEVELS = [...new Set(Object.keys(ACTIONS4).map((k) => +k.split('.')[0]))];
const pick = (x, size) => (x == null ? '' : typeof x === 'string' ? x : x[size] || x.solo || '');
/** The five actions of one area, at one size: [{ step, says, t, ex, exLabel }]. */
export function actionsAt(lv, d, size) {
  const A = ACTIONS4[`${lv}.${d}`];
  if (!A) return [];
  return A.map((a, i) => ({ step: STEPS5[i], says: STEP_SAYS[i], t: pick(a.t, size), ex: pick(a.ex, size), exLabel: a.exLabel || 'Example' }));
}
/** The size the actions speak to: the founder's own, or "selling alone" until they say. */
export const sizeFor = (size) => (SIZE_STAGE[size] != null ? size : 'solo');
