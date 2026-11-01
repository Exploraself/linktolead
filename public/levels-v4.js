// The Founder's Blueprint, Version 4 (Option C, chosen by Alexandru on
// 31 Oct 2026): twelve levels in three chapters, the same for every stage.
// Each level is a four-letter word, one letter per domain (yourself, people,
// business, market). Each domain is four moves: tap the line that sounds like
// you, slide to the honest number, write one sentence, and read four lines
// back: where you were (admit it), where you struggle (don't fight it), where
// you shine (don't ignore it), what you will do (exactly). Every line is built
// only from the founder's own answers.
//
// Answers save with the worksheets (state.work), keyed w.v4.level.domain.key,
// so the earlier seven-step answers stay where they are, untouched.

const DOM = [
  { k: 'self', n: 'Lead yourself', c: 'var(--self)' }, { k: 'people', n: 'Lead your people', c: 'var(--people)' },
  { k: 'work', n: 'Lead your business', c: 'var(--work)' }, { k: 'market', n: 'Lead the market', c: 'var(--market)' }];
const DAYS = [[2, 'rarely'], [5, 'some days'], [8, 'most days'], [10, 'every day']];
const SURE = [[3, 'mostly guessing'], [6, 'roughly'], [8, 'quite sure'], [10, 'certain']];
const SAFE = [[3, 'not safe'], [6, 'sometimes safe'], [8, 'mostly safe'], [10, 'safe']];
const OF10 = [[2, 'almost none'], [5, 'a few'], [8, 'most'], [10, 'all of them']];
const N = (unit) => (v) => `${v} ${unit}`;

/* ── The twelve levels, Option C ─────────────────────────────────────────
 * Each domain: a tap, a slide, one sentence, then four lines back.
 * t = tap {q, o[]}; s = slide {q, min, max, step, d, w (words or fn), e[ends], up (true: higher is better), sfx}
 * f = sentence parts, fields as [key, hint, example]; tool = the framework it fills;
 * fb = [admit, struggle, [shine if strong, shine if not], exactly]; tokens {t} {s} {w} {field}
 * x = the example founder: [tap index, slide value]. */
export const LEVELS4 = [
{ n: 1, promise: 'One old rule tested, one task handed over, your enough as a number, three people asked to buy.', word: 'SEED', ch: 0, floor: 'Conviction · what you believe', title: 'What you believe', old: 'This is just who I am.', neu: 'What I believe was learned. It can be tested and renewed.',
  d: [
  { l: 'S', name: 'Settled', t: { q: 'Finish the sentence that runs your work: <em>“If I ___, then I’m worth something.”</em>', o: ['hit my numbers', 'work harder than everyone', 'never let anyone down', 'prove them wrong', 'get it perfect'] },
    s: { q: 'Last month, how often did that rule decide your day?', min: 0, max: 10, step: 1, d: 5, w: DAYS, e: ['Never', 'Every day'], up: false },
    f: ['I am ', ['who', 'worth it, enough…', 'enough'], ' before I achieve anything. On ', ['day', 'which day', 'Thursday'], ' I will ', ['act', 'one thing the old rule forbids', 'take the evening off, phone in a drawer'], '.'],
    tool: 'The worth rule', x: [0, 8],
    fb: ['Last month the rule <mark>If I {t}, then I’m worth something</mark> ran your day {w}.', 'It was learned, so it can be tested. Don’t argue with it. Test it once, on purpose.',
      ['It ran {w}, not every day. Part of your week is already free of it.', 'You named your rule in one sentence. That is the first lever, and you pulled it.'],
      'On {day} you will {act}, and write what really happened. You are {who} before you achieve anything.'] },
  { l: 'E', name: 'Entrust', t: { q: 'Finish it honestly: <em>“People usually ___.”</em>', o: ['let me down', 'do it worse than I would', 'need me to check everything', 'rise when they are trusted'] },
    s: { q: 'How much of last week’s work did you hold because “nobody else can do it right”?', min: 0, max: 100, step: 10, d: 50, sfx: '%', w: function (v) { return v >= 70 ? 'almost all of it' : v >= 40 ? 'a lot' : 'some'; }, e: ['None', 'All of it'], up: false },
    f: ['I hand ', ['task', 'one task', 'the weekly invoices'], ' to ', ['who', 'a name', 'Marta'], ' on ', ['day', 'which day', 'Monday'], '. Done means ', ['done', 'what finished looks like', 'all sent by 5 pm'], '.'],
    tool: 'Trust in steps', x: [1, 60],
    fb: ['About {s} of last week, you held work because nobody else could do it right.', 'You believe people usually {t}. Don’t fight the feeling. Test it in one small step.',
      ['Most of your week is already shared. Build on that.', 'You named one task to let go. That is where trust starts.'], 'On {day} you hand {task} to {who}. Done means {done}. You check once, not every hour.'] },
  { l: 'E', name: 'Enough', t: { q: 'Which money sentence did you hear most growing up?', o: ['There is never enough', 'Money is for greedy people', 'We don’t talk about money', 'Money proves you are someone', 'Work hard and it will come'] },
    s: { q: 'Money in, fixed costs, what was left last month: how sure are you of all three?', min: 0, max: 10, step: 1, d: 4, w: SURE, e: ['Guessing', 'Exactly'], up: true },
    f: ['My enough is ', ['enough', 'an amount', '€4,200'], ' a month. On ', ['day', 'which day', 'Wednesday'], ' I will ', ['move', 'one money move', 'raise my rate for new clients to €75'], '.'],
    tool: 'Your enough, as a number', x: [0, 3],
    fb: ['You grew up with <mark>{t}</mark>, and you are {w} about your own numbers.', 'A guess becomes a number the day you open the statement. Don’t fight the fear; open it.',
      ['You know your numbers better than most guesses. Use them.', 'You wrote your enough as one number. Now money has a finish line.'], 'On {day} you will {move}. Your enough is {enough} a month: a plan, not your worth.'] },
  { l: 'D', name: 'Dignity', t: { q: 'When I ask someone to buy, I feel like I am…', o: ['begging', 'bothering them', 'showing off', 'helping'] },
    s: { q: 'In the last 30 days, how many times did you directly ask someone to buy or to book?', min: 0, max: 20, step: 1, d: 2, w: N('asks'), e: ['None', '20 or more'], up: true },
    f: ['My offer helps ', ['whom', 'who', 'café owners'], ' with ', ['prob', 'which problem', 'empty tables on weekday afternoons'], '. By ', ['day', 'which day', 'Friday'], ' I ask ', ['names', 'three names', 'Luca, Sara and the bakery on Via Roma'], '.'],
    tool: 'Selling is serving', x: [1, 2],
    fb: ['{s} in 30 days, and asking feels like {t}.', 'That feeling decides how often you ask. Don’t fight it. Let three real answers speak louder.',
      ['That many asks takes courage. Keep the rhythm.', 'You can say who you help, in one line: {whom}, with {prob}.'], 'By {day} you ask {names}. Write what each one says, word for word.'] }] },

{ n: 2, promise: 'One event written as facts, one person asked instead of judged, your five numbers read, one customer signal tested.', word: 'VIEW', ch: 0, floor: 'Reading · how you read what happens', title: 'How you read it', old: 'I know what happened.', neu: 'I know what I saw. The rest is a story I can check.',
  d: [
  { l: 'V', name: 'Verify', t: { q: 'When something goes wrong, my first story is…', o: ['it’s my fault', 'they did it on purpose', 'it will all collapse', 'I’ll never get this right'] },
    s: { q: 'Last week, how often did the story come before the facts?', min: 0, max: 10, step: 1, d: 5, w: DAYS, e: ['Never', 'Every time'], up: false },
    f: ['The facts: ', ['facts', 'what a camera saw', 'the client cancelled by email'], '. My story: ', ['story', 'what I told myself', 'I’m not good enough'], '. The truer reading: ', ['truer', 'what else could be true', 'their budget was cut'], '.'],
    tool: 'Facts, then story', x: [0, 7],
    fb: ['Your first story is <mark>{t}</mark>, and it came before the facts {w}.', 'Stories are fast and feel true. Don’t fight that. Slow it down: facts first.',
      ['Most days you already see the facts first. That is a clear mind.', 'You wrote facts and story apart. That is the whole skill.'], 'Next time: facts “{facts}”, story “{story}”, and the truer reading, “{truer}”, before you act.'] },
  { l: 'I', name: 'Inquire', t: { q: 'When someone lets me down, I usually…', o: ['decide why, without asking', 'say nothing and remember', 'fix it myself', 'ask what happened'] },
    s: { q: 'Out of 10 conclusions you drew about people last week, how many did you check by asking?', min: 0, max: 10, step: 1, d: 3, w: OF10, e: ['None', 'All ten'], up: true },
    f: ['By ', ['day', 'which day', 'Tuesday'], ' I ask ', ['who', 'a name', 'Andrea'], ': “When ', ['what', 'what happened', 'the order was late'], ', what was going on for you?”'],
    tool: 'Ask before you assume', x: [0, 2],
    fb: ['When people let you down, you {t}. Last week you checked {w} of your conclusions.', 'Mind-reading feels quicker than asking. Don’t fight the habit. Ask once and compare.',
      ['You already check most of your conclusions. People feel that.', 'You chose one person and one real question. That is how trust is repaired.'], 'By {day} you ask {who}: “When {what}, what was going on for you?” Then you only listen.'] },
  { l: 'E', name: 'Evidence', t: { q: 'Most money decisions, I make…', o: ['by feel', 'by today’s bank balance', 'by a number I check', 'by avoiding them'] },
    s: { q: 'How many of these five do you know for last month: money in, money out, cash left, unpaid invoices, hours worked?', min: 0, max: 5, step: 1, d: 2, w: function (v) { return v + ' of 5'; }, e: ['None', 'All five'], up: true },
    f: ['Every ', ['day', 'which day', 'Monday'], ' at ', ['time', 'what time', '8:30'], ' I read my five numbers. The one I fear most is ', ['fear', 'which one', 'cash left'], '.'],
    tool: 'The five numbers', x: [1, 2],
    fb: ['You decide {t}, and you know {w} of your numbers.', 'Numbers feel like a verdict when worth is shaky. Don’t fight that. Read them anyway; they are information.',
      ['You know most of your numbers. Now read them on a fixed day.', 'You named the number you fear most. That is the first one to read.'], 'Every {day} at {time} you read your five numbers, starting with {fear}.'] },
  { l: 'W', name: 'Watch signals', t: { q: 'When a customer goes quiet, I think…', o: ['they didn’t like it', 'I was too pushy', 'it’s timing', 'I don’t know, I never asked'] },
    s: { q: 'Of your last 10 “interested” people, how many paid?', min: 0, max: 10, step: 1, d: 2, w: N('paid'), e: ['None', 'All ten'], up: true },
    f: ['The signal I’m testing: when a customer ', ['does', 'does what', 'asks for the price twice'], ', it means ', ['means', 'what you think', 'they are close to yes'], '. I check by ', ['check', 'how', 'asking them on Friday'], '.'],
    tool: 'Praise is interest, payment is evidence', x: [0, 2],
    fb: ['Of 10 interested people, {s}. When one goes quiet, you think {t}.', 'Silence has many reasons. Don’t fight the worry. Test one signal this week.',
      ['Your interest turns into payment. Find out why, and do more of it.', 'You chose one signal to test. That is reading the market, not your mood.'], 'You watch for “{does}”, you believe it means {means}, and you check by {check}.'] }] },

{ n: 3, promise: 'One feeling named under the stress, one new first reaction, a storm rule written, one client’s fear in their own words.', word: 'CALM', ch: 0, floor: 'Emotion · what you feel, and do with it', title: 'What you feel', old: 'Feelings get in the way.', neu: 'Feelings carry information. I name them, then I decide.',
  d: [
  { l: 'C', name: 'Call it', t: { q: 'Under “stressed”, the real feeling is most often…', o: ['afraid', 'ashamed', 'angry', 'lonely', 'tired'] },
    s: { q: 'How strong is it on most days?', min: 0, max: 10, step: 1, d: 6, w: [[3, 'calm'], [6, 'present'], [8, 'heavy'], [10, 'a storm']], e: ['Calm', 'Storm'], up: false },
    f: ['Under my ', ['surface', 'stress, anger…', 'stress'], ' is ', ['feeling', 'the real feeling', 'fear of not paying the rent'], '. When it comes, I ', ['help', 'one thing that helps', 'walk ten minutes before I reply'], '.'],
    tool: 'Name it to tame it', x: [0, 7],
    fb: ['Under the stress you mostly feel {t}, and most days it is {w}.', 'A named feeling loosens its grip. Don’t fight it. Name it, then breathe, then decide.',
      ['It stays manageable most days. You have more steadiness than you think.', 'You found the feeling under the word. That is the hardest step.'], 'When {feeling} comes, you {help}. Then you decide, not before.'] },
  { l: 'A', name: 'Atmosphere', t: { q: 'Under pressure, the people around me see me…', o: ['snap', 'go silent', 'work alone', 'stay steady'] },
    s: { q: 'How safe is it for someone to bring you bad news?', min: 0, max: 10, step: 1, d: 5, w: SAFE, e: ['Not safe', 'Safe'], up: true },
    f: ['Under pressure, I will ', ['will', 'what you’ll do', 'say “thank you for telling me” first'], ' instead of ', ['instead', 'what you do now', 'sighing'], '. I ask ', ['who', 'a name', 'Marta'], ' to tell me when I slip.'],
    tool: 'The room’s weather', x: [0, 4],
    fb: ['Under pressure you {t}, and bringing you bad news feels {w}.', 'People read your face before your plan. Don’t fight the pressure. Change the first five seconds.',
      ['People already feel safe telling you hard things. Protect that.', 'You chose one new first reaction. The room will notice in a week.'], 'You will {will} instead of {instead}, and {who} will tell you when you slip.'] },
  { l: 'L', name: 'Lag', t: { q: 'The decision I most often make in a storm', o: ['spending', 'pricing', 'hiring or firing', 'quitting a project', 'saying yes to everything'] },
    s: { q: 'When you are upset, how many hours do you wait before a big decision?', min: 0, max: 48, step: 2, d: 0, w: function (v) { return v === 0 ? 'none' : v + ' hours'; }, e: ['None', 'Two days'], up: true },
    f: ['When I feel ', ['feel', 'which feeling', 'panic'], ' above 7 out of 10, I wait ', ['hours', 'how many hours', '24'], ' hours before I decide about ', ['about', 'what', 'money'], '.'],
    tool: 'The storm rule', x: [4, 0],
    fb: ['In a storm you most often decide about {t}, and you wait {w} first.', 'The storm will come again. Don’t fight it. Decide your rule now, while you are calm.',
      ['You already wait before deciding. That is rare discipline.', 'You wrote a storm rule while calm. That is the lag.'], 'When you feel {feel} above 7, you wait {hours} hours before you decide about {about}.'] },
  { l: 'M', name: 'Meet their fear', t: { q: 'My clients’ biggest fear is…', o: ['wasting money', 'looking foolish', 'losing time', 'being let down again', 'I don’t know'] },
    s: { q: 'How sure are you, from their own words?', min: 0, max: 10, step: 1, d: 3, w: SURE, e: ['Guessing', 'Their exact words'], up: true },
    f: ['My clients fear ', ['fear', 'their fear', 'paying for nothing'], ' and hope for ', ['hope', 'their hope', 'full tables, without discounts'], '. By ', ['day', 'which day', 'Thursday'], ' I ask ', ['who', 'a client', 'Luca'], ' in their words.'],
    tool: 'Fear and hope, in their words', x: [0, 3],
    fb: ['You think your clients fear {t}, and you are {w}.', 'People feel first and explain later. Don’t guess. Ask, and write their words.',
      ['You already know their fear in their words. Speak to it.', 'You named their fear and their hope. That is the start of every good message.'], 'By {day} you ask {who}. Then you speak to their fear of {fear} and their hope for {hope}, honestly.'] }] },

{ n: 4, promise: 'One if–then plan kept, one clear ask with a date, your hour priced, a weekly selling hour booked.', word: 'STEP', ch: 0, floor: 'Deeds · how you manage action', title: 'What you do', old: 'I’ll do it when I feel ready.', neu: 'I decide once, in advance, and the day carries me.',
  d: [
  { l: 'S', name: 'Set it in advance', t: { q: 'What breaks my plans most', o: ['messages', 'other people’s urgencies', 'my mood', 'perfectionism', 'tiredness'] },
    s: { q: 'Out of 10 plans you made last week, how many did you keep?', min: 0, max: 10, step: 1, d: 5, w: OF10, e: ['None', 'All ten'], up: true },
    f: ['When ', ['when', 'a moment', 'I open my laptop'], ', I will ', ['will', 'the action', 'write for 45 minutes first'], '. If ', ['if', 'the obstacle', 'a message pings'], ' shows up, then I ', ['then', 'your answer', 'answer at 11'], '.'],
    tool: 'If–then plan', x: [0, 4],
    fb: ['{t} break your plans, and you kept {w} of them last week.', 'Willpower runs out by noon. Don’t fight it. Decide in advance.',
      ['You keep most of your plans. Now make the hard one automatic.', 'You wrote an if–then for your obstacle. That plan works on tired days too.'], 'When {when}, you {will}. If {if}, then you {then}.'] },
  { l: 'T', name: 'Tell it clearly', t: { q: 'My frustration with people is usually that they…', o: ['don’t finish', 'do it differently', 'don’t tell me', 'wait for me'] },
    s: { q: 'Out of 10 requests you made last week, how many had a clear “done” and a date?', min: 0, max: 10, step: 1, d: 3, w: OF10, e: ['None', 'All ten'], up: true },
    f: ['I ask ', ['who', 'a name', 'Andrea'], ' for ', ['what', 'what', 'the supplier list'], ' by ', ['when', 'a date', 'Wednesday noon'], '. Done looks like ', ['done', 'done', 'one page, prices included'], '.'],
    tool: 'What, by when, done', x: [0, 3],
    fb: ['You get frustrated when people {t}, and {w} of your requests were clear.', 'A frustration is often a request you never made. Don’t fight it. Make the ask clear.',
      ['Your asks are mostly clear. Keep the date in every one.', 'You wrote one ask with a date and a “done”. Watch what changes.'], 'You ask {who} for {what} by {when}. Done looks like {done}.'] },
  { l: 'E', name: 'Essential first', t: { q: 'Where my hours go that are not mine', o: ['admin', 'messages', 'fixing others’ work', 'low-paid jobs'] },
    s: { q: 'Hours a week on work someone cheaper could do', min: 0, max: 40, step: 1, d: 10, w: N('hours'), e: ['None', '40 hours'], up: false },
    f: ['My hour is worth ', ['hour', 'enough ÷ hours you want', '€35'], '. First, every day: ', ['first', 'your one priority', 'two sales calls'], '. I hand back ', ['back', 'one task', 'the bookkeeping'], '.'],
    tool: 'Price your hour', x: [0, 12],
    fb: ['{s} a week go to {t}.', 'Busy feels like progress. Don’t fight that. Put a price on the hour.',
      ['Few of your hours leak. Guard the first one of the day.', 'You priced your hour. Every task now has a cost.'], 'Your hour is worth {hour}. First comes {first}. You hand back {back}.'] },
  { l: 'P', name: 'Pace', t: { q: 'I look for clients…', o: ['only when it’s empty', 'when I feel brave', 'at a fixed time each week', 'never, they find me'] },
    s: { q: 'Buyer conversations per week right now', min: 0, max: 20, step: 1, d: 1, w: N('a week'), e: ['None', '20 a week'], up: true },
    f: ['Every ', ['day', 'which day', 'Tuesday'], ' at ', ['time', 'what time', '9:00'], ' I talk with ', ['n', 'how many', '3'], ' potential buyers. Everyone hears from me twice.'],
    tool: 'A selling rhythm', x: [0, 1],
    fb: ['You look for clients {t}, about {s}.', 'Delivery fills every free hour and the pipeline empties quietly. Don’t fight it. Book the hour.',
      ['You already have a rhythm. Keep the number small enough to keep.', 'You set a day, a time and a number. That is a rhythm.'], 'Every {day} at {time} you talk with {n} potential buyers, and everyone hears from you twice.'] }] },

{ n: 5, promise: 'One dated proof of who you are becoming, one person thanked specifically, one number read, three clients asked for their words.', word: 'FACT', ch: 0, floor: 'Outcome · what your results make of you', title: 'What you became', old: 'Results decide who I am.', neu: 'Results are feedback on who I am becoming.',
  d: [
  { l: 'F', name: 'Fruit is feedback', t: { q: 'The proof I see most since Level 01', o: ['I rest without guilt', 'I decide faster', 'I ask for money', 'I stay calmer', 'not yet'] },
    s: { q: 'How much do you believe your new sentence from Level 01 today?', min: 0, max: 10, step: 1, d: 6, w: [[3, 'a little'], [6, 'half'], [8, 'mostly'], [10, 'fully']], e: ['Not at all', 'Fully'], up: true },
    f: ['I am becoming someone who ', ['who', 'who you are becoming', 'decides calmly and asks for money'], '. My proof: ', ['proof', 'one dated example', '14 Nov, I raised my rate and kept the client'], '.'],
    tool: 'Identity from evidence', x: [2, 6],
    fb: ['Since Level 01: {t}. You believe your new sentence {w}.', 'Old identities fade slowly. Don’t fight that. Keep collecting proof.',
      ['You believe it more than half. Proof did that.', 'You wrote one dated proof. One is how every identity starts.'], 'You are becoming someone who {who}. Proof: {proof}. Add one more this week.'] },
  { l: 'A', name: 'Applaud', t: { q: 'When people do well, I…', o: ['rarely say it', 'say a quick thanks', 'name exactly what they did', 'pay them, that’s enough'] },
    s: { q: 'Specific thanks you gave last week', min: 0, max: 10, step: 1, d: 1, w: N('given'), e: ['None', 'Ten'], up: true },
    f: ['I thank ', ['who', 'a name', 'Marta'], ' for ', ['what', 'what they did', 'chasing the unpaid invoices'], '. It changed ', ['changed', 'what changed', 'our cash this month'], '.'],
    tool: 'Name the win', x: [1, 1],
    fb: ['When people do well, you {t}. Last week: {s}.', 'People repeat what gets noticed. Don’t wait for big wins. Name the small ones.',
      ['You already name wins. Make them more specific.', 'You named one win and what it changed. That is how people grow.'], 'You thank {who} for {what}, and tell them it changed {changed}.'] },
  { l: 'C', name: 'Count', t: { q: 'The one number that tells the truth now', o: ['cash left', 'money in', 'profit per job', 'hours worked', 'new clients'] },
    s: { q: 'Weeks in a row you have read it', min: 0, max: 12, step: 1, d: 2, w: N('weeks'), e: ['Never', '12 weeks'], up: true },
    f: ['Every ', ['day', 'which day', 'Monday'], ' I read ', ['num', 'the number', 'cash left'], '. When it misses, I question ', ['belief', 'the belief behind it', 'my fear of asking'], ', not only the tactic.'],
    tool: 'One true number', x: [0, 2],
    fb: ['Your truth number is {t}, read {s} in a row.', 'A missed number is information, not a verdict. Don’t fight it. Ask what belief sits behind it.',
      ['You read it every week. That is leadership by evidence.', 'You chose one number. One, read weekly, beats ten read never.'], 'Every {day} you read {num}. When it misses, you question {belief}.'] },
  { l: 'T', name: 'Testimony', t: { q: 'Why clients really choose me (best guess)', o: ['price', 'trust', 'speed', 'results', 'I don’t know'] },
    s: { q: 'Testimonials you have in writing', min: 0, max: 20, step: 1, d: 1, w: N('in writing'), e: ['None', '20'], up: true },
    f: ['When ', ['when', 'their situation', 'tables are empty midweek'], ', my clients want to ', ['want', 'what they want', 'fill them without discounts'], ', so they can ', ['so', 'the result', 'stop worrying about rent'], '.'],
    tool: 'Their words are your message', x: [1, 1],
    fb: ['You think clients choose you for {t}, and you have {s}.', 'Your words sound like selling. Theirs sound like proof. Don’t write it yourself. Ask.',
      ['You have real proof. Put it where buyers decide.', 'You wrote their sentence. Now ask three clients to confirm it.'], 'When {when}, they want to {want}, so they can {so}. You ask three clients by Friday.'] }] },

{ n: 6, promise: 'One postponed conversation held, one talk where you listened more, one late payment asked for, one kind no said.', word: 'TALK', ch: 1, floor: 'Communication · the conversations you avoid', title: 'The conversations you avoid', old: 'If I say it, it will get worse.', neu: 'What is unsaid costs more every week.',
  d: [
  { l: 'T', name: 'Truth first', t: { q: 'The conversation I keep postponing is about…', o: ['money owed', 'a price', 'a person’s work', 'a partner', 'my own limits'] },
    s: { q: 'How many weeks have you postponed it?', min: 0, max: 26, step: 1, d: 4, w: N('weeks'), e: ['This week', 'Six months'], up: false },
    f: ['On ', ['day', 'which day', 'Monday'], ' I say to ', ['who', 'a name', 'Andrea'], ': “I need to talk about ', ['about', 'the topic', 'deadlines'], '. What I see is ', ['see', 'the facts', 'three late orders'], '. What I need is ', ['need', 'your ask', 'a date you can keep'], '.”'],
    tool: 'See · Need · Ask', x: [2, 6],
    fb: ['You have postponed a talk about {t} for {s}.', 'It feels safer to wait. It isn’t; the cost grows. Don’t fight the fear. Say the first sentence.',
      ['It’s only been {s}. Say it before it hardens.', 'You wrote the opening line. Most of the courage is in that line.'], 'On {day} you tell {who}: “What I see is {see}. What I need is {need}.”'] },
  { l: 'A', name: 'Ask, then listen', t: { q: 'In hard talks I usually…', o: ['defend', 'go quiet', 'explain too much', 'listen first'] },
    s: { q: 'In your last hard talk, how much of the time did you speak?', min: 0, max: 100, step: 10, d: 70, sfx: '%', w: function (v) { return v > 60 ? 'most of it' : v > 40 ? 'half' : 'less than half'; }, e: ['None', 'All of it'], up: false },
    f: ['In my next talk with ', ['who', 'a name', 'Marta'], ' I ask “', ['ask', 'one open question', 'What would make this easier for you?'], '” and speak less than half.'],
    tool: 'Two ears, one mouth', x: [2, 70],
    fb: ['In hard talks you {t}, and you spoke {w} of the time.', 'Talking feels like control. Don’t fight that urge. Ask, then count to three.',
      ['You already listen more than you speak. People trust that.', 'You chose one open question. Questions open people.'], 'With {who}, you ask “{ask}” and speak less than half.'] },
  { l: 'L', name: 'Late money', t: { q: 'The money talk I avoid is about…', o: ['an unpaid invoice', 'a discount I regret', 'extra work for free', 'a supplier price'] },
    s: { q: 'How much money is stuck there?', min: 0, max: 10000, step: 250, d: 1500, w: function (v) { return '€' + v.toLocaleString('en-US'); }, e: ['€0', '€10,000'], up: false, raw: true },
    f: ['By ', ['day', 'which day', 'Tuesday'], ' I write to ', ['who', 'a name', 'Studio Rossi'], ': “Invoice ', ['inv', 'which invoice', '0412'], ' was due on ', ['due', 'the date', '1 Oct'], '. Please pay by ', ['by', 'a new date', '8 Nov'], '.”'],
    tool: 'The polite, firm invoice', x: [0, 1500],
    fb: ['{w} are stuck in {t}.', 'Asking for your own money feels rude. It isn’t. Don’t fight the discomfort. Send it.',
      ['The amount is small. Clear it before it grows.', 'You wrote the message in one line. Firm and polite.'], 'By {day} you write to {who}: invoice {inv}, due {due}, please pay by {by}.'] },
  { l: 'K', name: 'Kind no', t: { q: 'The yes I should turn into a no', o: ['a client who isn’t a fit', 'a free favour', 'a discount request', 'a project I don’t believe in'] },
    s: { q: 'Hours a week on work you should have said no to', min: 0, max: 30, step: 1, d: 6, w: N('hours'), e: ['None', '30 hours'], up: false },
    f: ['I say no to ', ['what', 'what', 'the 30% discount'], ', kindly: “This isn’t the right fit for ', ['fit', 'what', 'what you need'], '. What I suggest is ', ['suggest', 'an alternative', 'the smaller package'], '.”'],
    tool: 'The kind no', x: [2, 6],
    fb: ['{s} a week go to {t}.', 'Every wrong yes is a no to the right client. Don’t fight the guilt. Offer an alternative.',
      ['Few hours leak to wrong yeses. Keep that line.', 'You wrote a kind no with an alternative. That protects them and you.'], 'You say no to {what}, and suggest {suggest}.'] }] },

{ n: 7, promise: 'Protected hours in your calendar, one task one step up the ladder, your price floor, one marketing hour booked.', word: 'HOUR', ch: 1, floor: 'Time · your week as an asset', title: 'Your week', old: 'There is never enough time.', neu: 'My hours have a price, and I decide who gets them.',
  d: [
  { l: 'H', name: 'Hold the line', t: { q: 'What eats my best hours', o: ['messages', 'meetings', 'delivery', 'admin', 'other people’s urgencies'] },
    s: { q: 'Hours of deep, focused work last week', min: 0, max: 30, step: 1, d: 4, w: N('hours'), e: ['None', '30 hours'], up: true },
    f: ['My best hours are ', ['from', 'from', '8:00'], ' to ', ['to', 'to', '10:30'], ' on ', ['days', 'which days', 'Monday to Thursday'], '. Nothing goes there but ', ['what', 'what', 'selling and building'], '.'],
    tool: 'Protected hours', x: [0, 4],
    fb: ['{t} eat your best hours. Last week you had {s} of deep work.', 'The urgent always shouts. Don’t fight it. Give it a later hour.',
      ['You protect real focus already. Now guard the start of the day.', 'You named your best hours. Now they have a guard.'], 'From {from} to {to}, {days}, only {what}.'] },
  { l: 'O', name: 'Own it', t: { q: 'The task I hold most is at this step', o: ['I do it', 'I do it, they watch', 'they do it, I check', 'they own it'] },
    s: { q: 'Hours a week that task takes', min: 0, max: 20, step: 1, d: 5, w: N('hours'), e: ['None', '20 hours'], up: false },
    f: ['By ', ['day', 'a date', '30 Nov'], ', ', ['task', 'the task', 'the weekly orders'], ' moves up one step: from “', ['from', 'the step now', 'I do it'], '” to “', ['to', 'the next step', 'they do it, I check'], '”.'],
    tool: 'The delegation ladder', x: [0, 5],
    fb: ['Your biggest task is at “{t}”, and it takes {s} a week.', 'Letting go feels like losing quality. Don’t fight that. Move up one step, not four.',
      ['It’s already shared. Finish the last step.', 'You moved one task up one step. That is how a team is built.'], 'By {day}, {task} moves from “{from}” to “{to}”.'] },
  { l: 'U', name: 'Unit cost', t: { q: 'What I sell most is priced…', o: ['by the hour', 'per job', 'as a package', 'by guess'] },
    s: { q: 'Hours a typical job really takes, start to finish', min: 0, max: 40, step: 1, d: 6, w: N('hours'), e: ['0', '40 hours'], up: false },
    f: ['One job costs me ', ['mat', 'materials and fees', '€80'], ' plus ', ['hrs', 'hours', '6'], ' hours × ', ['rate', 'my hour', '€35'], ' = ', ['total', 'the total', '€290'], '. I never sell it below ', ['floor', 'your floor', '€350'], '.'],
    tool: 'The price floor', x: [3, 6],
    fb: ['You price {t}, and a job really takes {s}.', 'Most underpricing hides in the hours you don’t count. Don’t fight the number. Write it down.',
      ['You know the real hours. Now price from them.', 'You wrote your price floor. Below it, you pay to work.'], 'One job costs you {total}. You never sell it below {floor}.'] },
  { l: 'R', name: 'Rhythm', t: { q: 'Where my buyers already gather', o: ['Instagram', 'LinkedIn', 'my neighbourhood', 'other businesses', 'I don’t know'] },
    s: { q: 'Hours a week you spend finding buyers', min: 0, max: 10, step: 1, d: 1, w: N('hours'), e: ['None', '10 hours'], up: true },
    f: ['Every ', ['day', 'which day', 'Wednesday'], ' from ', ['from', 'from', '9:00'], ' to ', ['to', 'to', '10:00'], ' I ', ['act', 'one marketing action', 'post one client story'], ' on ', ['where', 'where', 'Instagram'], '.'],
    tool: 'One marketing hour', x: [0, 1],
    fb: ['Your buyers gather on {t}, and you give it {s} a week.', 'Marketing done only when it’s empty comes too late. Don’t fight that. Fix the hour.',
      ['You give it real time. Make it the same hour every week.', 'You booked one hour with one action. That compounds.'], 'Every {day}, {from} to {to}, you {act} on {where}.'] }] },

{ n: 8, promise: 'Your gift named and one thing dropped, three clear client steps, three price levels, your offer in one line.', word: 'GOLD', ch: 1, floor: 'Value · your offer and its price', title: 'Your offer', old: 'I do a bit of everything.', neu: 'I am paid for what I do best, at a price that respects both of us.',
  d: [
  { l: 'G', name: 'Gift', t: { q: 'What people thank me for most', o: ['solving problems', 'teaching', 'making things', 'organising', 'calming people down'] },
    s: { q: 'How much of your paid work uses that gift?', min: 0, max: 100, step: 10, d: 40, sfx: '%', w: function (v) { return v >= 70 ? 'most of it' : v >= 40 ? 'part of it' : 'little of it'; }, e: ['None', 'All of it'], up: true },
    f: ['I am best at ', ['best', 'your gift', 'turning chaos into a plan'], '. People pay me for ', ['pay', 'what they pay for', 'calm, organised openings'], '. I stop selling ', ['stop', 'one thing', 'one-off logo jobs'], '.'],
    tool: 'Half what you’re good at, half what earns', x: [0, 40],
    fb: ['People thank you for {t}, and {s} of your paid work uses it.', 'Doing everything feels safe. It hides your best work. Don’t fight that. Drop one thing.',
      ['Most of your work already uses your gift. Charge for it.', 'You named your gift and what to stop. That is an offer forming.'], 'You sell {pay}, built on {best}, and stop selling {stop}.'] },
  { l: 'O', name: 'Others in it', t: { q: 'Where clients wait or get confused', o: ['at the start', 'during delivery', 'at payment', 'after it’s done'] },
    s: { q: 'Steps from “yes” to delivered', min: 1, max: 15, step: 1, d: 7, w: N('steps'), e: ['1', '15'], up: false },
    f: ['After a client says yes, they get: 1 ', ['s1', 'step one', 'a welcome call'], ', 2 ', ['s2', 'step two', 'a plan in 48 hours'], ', 3 ', ['s3', 'step three', 'a weekly update'], '. ', ['who', 'a name', 'Marta'], ' handles step ', ['which', 'which step', '3'], '.'],
    tool: 'The client journey', x: [0, 9],
    fb: ['Clients get confused {t}, across {s}.', 'Confusion costs referrals. Don’t fight it. Show them three clear steps.',
      ['Your journey is short. Make every step visible.', 'You wrote three steps and an owner. Clients feel led.'], 'Yes, then {s1}, {s2}, {s3}. {who} owns step {which}.'] },
  { l: 'L', name: 'Levels', t: { q: 'How I set prices now', o: ['same as others', 'by the hour', 'by feel', 'from my costs and value'] },
    s: { q: 'How confident are you saying your price out loud?', min: 0, max: 10, step: 1, d: 4, w: SURE, e: ['I mumble', 'I say it calmly'], up: true },
    f: ['Essential: ', ['e1', 'what’s in it', 'the plan'], ' at ', ['p1', 'price', '€390'], '. Complete: ', ['e2', 'what’s in it', 'plan and launch'], ' at ', ['p2', 'price', '€890'], '. Premium: ', ['e3', 'what’s in it', 'done with you, 3 months'], ' at ', ['p3', 'price', '€2,400'], '.'],
    tool: 'Three price levels', x: [2, 4],
    fb: ['You price {t}, and you say it out loud {w}.', 'A single price forces a yes or no. Don’t fight that. Give three choices.',
      ['You say your price calmly. Now add a higher level.', 'You built three levels. Most people choose the middle.'], 'Essential at {p1}, Complete at {p2}, Premium at {p3}.'] },
  { l: 'D', name: 'Desire', t: { q: 'What my customer wants most', o: ['time back', 'more money', 'less worry', 'to look good', 'better health'] },
    s: { q: 'Could a customer repeat your offer after hearing it once?', min: 0, max: 10, step: 1, d: 4, w: [[3, 'not really'], [6, 'roughly'], [8, 'mostly'], [10, 'word for word']], e: ['No', 'Word for word'], up: true },
    f: ['For ', ['who', 'who', 'café owners'], ' who ', ['pain', 'their problem', 'have empty weekdays'], ', I ', ['do', 'what you do', 'fill tables with local events'], ', so they ', ['gain', 'their result', 'stop discounting'], ', within ', ['time', 'how long', '60 days'], '.'],
    tool: 'The one-line offer', x: [2, 4],
    fb: ['Your customer wants {t}, and could repeat your offer {w}.', 'A clever offer gets admired. A clear one gets bought. Don’t fight for clever.',
      ['They can repeat it. That means they can recommend it.', 'You wrote your offer in one line. Say it the same way every time.'], 'For {who} who {pain}: you {do}, so they {gain}, within {time}.'] }] },

{ n: 9, promise: 'A weekly review held, one area with an owner, one page of cash, your warm list written down.', word: 'FLOW', ch: 1, floor: 'Systems · a business that runs without you', title: 'Your systems', old: 'If I’m not there, it stops.', neu: 'A good system carries the business on my worst day.',
  d: [
  { l: 'F', name: 'First things weekly', t: { q: 'When I plan my week', o: ['never', 'as it comes', 'Monday morning', 'Sunday evening'] },
    s: { q: 'Weekly promises to yourself kept last week, out of 10', min: 0, max: 10, step: 1, d: 5, w: OF10, e: ['None', 'All ten'], up: true },
    f: ['Every ', ['day', 'which day', 'Friday'], ' at ', ['time', 'what time', '16:00'], ' I spend 30 minutes: look back, read the numbers, choose ', ['three', 'how many priorities', 'three'], ' priorities.'],
    tool: 'The weekly review', x: [1, 5],
    fb: ['You plan {t}, and kept {w} of your promises.', 'Without a review, the week plans you. Don’t fight the mess. Give it 30 minutes.',
      ['You keep most promises. A review will make it all of them.', 'You set a weekly review. It is the steering wheel.'], 'Every {day} at {time}: look back, read the numbers, choose {three} priorities.'] },
  { l: 'L', name: 'Lean on roles', t: { q: 'If I were sick for a week…', o: ['the business stops', 'things slow down', 'most of it runs', 'it runs fine'] },
    s: { q: 'Tasks only you can do today', min: 0, max: 20, step: 1, d: 9, w: N('tasks'), e: ['None', '20'], up: false },
    f: ['', ['who', 'a name', 'Marta'], ' owns ', ['owns', 'an area', 'orders and suppliers'], '. They decide alone up to ', ['limit', 'a limit', '€500'], '. They call me when ', ['call', 'when', 'a client complains'], '.'],
    tool: 'Owner, limit, call', x: [0, 9],
    fb: ['If you were sick, {t}. {s} sit with you alone.', 'Being needed feels good. It is also a ceiling. Don’t fight it. Give one area an owner.',
      ['Most things run without you. Write it down so it lasts.', 'You gave one area an owner and a limit. That is a system.'], '{who} owns {owns}, decides up to {limit}, and calls you when {call}.'] },
  { l: 'O', name: 'One page of cash', t: { q: 'What I check every week', o: ['nothing', 'the bank balance', 'sales', 'money in, out and left'] },
    s: { q: 'Months you could pay all costs if sales stopped today', min: 0, max: 12, step: 1, d: 2, w: N('months'), e: ['0', '12 months'], up: true },
    f: ['Every ', ['day', 'which day', 'Monday'], ': money in ', ['in', 'amount', '€6,200'], ', money out ', ['out', 'amount', '€4,900'], ', left ', ['left', 'amount', '€1,300'], '. My alert line is ', ['alert', 'the minimum', '€3,000 in the bank'], '.'],
    tool: 'The weekly cash view', x: [1, 2],
    fb: ['You check {t}, and you have {s} of runway.', 'Cash surprises kill good businesses. Don’t fight the number. Look every week.',
      ['You have real runway. Protect it with an alert line.', 'You wrote one page of cash and an alert line. No more surprises.'], 'Every {day}: in {in}, out {out}, left {left}. Below {alert}, you act that day.'] },
  { l: 'W', name: 'Warm list', t: { q: 'Where my last five clients came from', o: ['referrals', 'social media', 'ads', 'my network', 'repeat clients'] },
    s: { q: 'Warm conversations open right now', min: 0, max: 30, step: 1, d: 3, w: N('open'), e: ['None', '30'], up: true },
    f: ['My warm list has ', ['n', 'how many names', '12'], ' names. Every ', ['day', 'which day', 'Tuesday'], ' I move ', ['m', 'how many', '3'], ' of them one step closer, from ', ['from', 'a step', 'met'], ' to ', ['to', 'the next step', 'a call booked'], '.'],
    tool: 'A pipeline you can see', x: [0, 3],
    fb: ['Your clients come from {t}, and you have {s}.', 'A list in your head is a list you forget. Don’t fight that. Write it down.',
      ['You have a real pipeline. Move it every week.', 'You wrote your warm list. It is now a system, not a hope.'], 'Every {day} you move {m} of your {n} names from {from} to {to}.'] }] },

{ n: 10, promise: 'Ten people contacted, one partner asked, your best client described, three customer conversations booked.', word: 'NAME', ch: 2, floor: 'Reach · your first hundred names', title: 'Your first hundred names', old: 'I don’t know anyone.', neu: 'I know more people than I think, and each knows more.',
  d: [
  { l: 'N', name: 'Network', t: { q: 'What stops me reaching out', o: ['fear of a no', 'not wanting to bother', 'no time', 'not knowing who'] },
    s: { q: 'People in your phone who fit your client, or know one', min: 0, max: 100, step: 5, d: 20, w: N('people'), e: ['None', '100'], up: true },
    f: ['This week I contact ', ['n', 'how many', '10'], ' people I already know, starting with ', ['first', 'a name', 'Giulia'], '. I say: “', ['say', 'your opening line', 'I’m helping cafés fill midweek tables. Who do you know?'], '”'],
    tool: 'The hundred names list', x: [0, 20],
    fb: ['{t} stops you, and you know {s} who fit.', 'Reaching out feels like begging. It is service. Don’t fight the nerves. Send the first ten.',
      ['You know many people already. Your list is ready.', 'You wrote your opening line. The rest is repetition.'], 'This week, {n} people, starting with {first}: “{say}”'] },
  { l: 'A', name: 'Ambassadors', t: { q: 'Who already meets my clients', o: ['an accountant', 'a supplier', 'another professional', 'past clients'] },
    s: { q: 'Possible partners you could name today', min: 0, max: 20, step: 1, d: 2, w: N('partners'), e: ['None', '20'], up: true },
    f: ['I ask ', ['who', 'a name', 'Paolo, the coffee supplier'], ' to introduce me to two people who ', ['need', 'what they need', 'want busier weekdays'], '. In return I ', ['give', 'what you give', 'send clients his way'], '.'],
    tool: 'The referral partner', x: [1, 2],
    fb: ['{t} already meets your clients, and you can name {s}.', 'Asking for introductions feels like a favour. It is a trade. Don’t fight that. Offer first.',
      ['You have partners to call. Start with the warmest.', 'You wrote one partner ask with something in return. That is fair.'], 'You ask {who} for two introductions to people who {need}, and you {give}.'] },
  { l: 'M', name: 'Map the money', t: { q: 'Most of my money comes from', o: ['a few big clients', 'many small ones', 'one client', 'I don’t know'] },
    s: { q: 'Share of sales from your top three clients', min: 0, max: 100, step: 5, d: 50, sfx: '%', w: function (v) { return v >= 60 ? 'risky' : v >= 35 ? 'concentrated' : 'spread'; }, e: ['0%', '100%'], up: false },
    f: ['My best clients share three things: ', ['a', 'one', 'own their place'], ', ', ['b', 'two', 'pay on time'], ', ', ['c', 'three', 'refer others'], '. I want ', ['more', 'how many more', 'five'], ' more of them by ', ['by', 'a date', 'March'], '.'],
    tool: 'The best-client profile', x: [0, 55],
    fb: ['Most of your money comes from {t}; {s} is from three clients.', 'Depending on few feels fine until one leaves. Don’t fight that. Find more like them.',
      ['Your sales are spread. Now grow the best kind.', 'You described your best client in three words. Now you can find them.'], 'You look for clients who {a}, {b} and {c}: {more} more by {by}.'] },
  { l: 'E', name: 'Engage', t: { q: 'The first thing I’ll ask a customer', o: ['what they struggle with', 'what they tried', 'what it costs them', 'what they want instead'] },
    s: { q: 'Customer conversations you can hold per week', min: 0, max: 15, step: 1, d: 3, w: N('a week'), e: ['None', '15'], up: true },
    f: ['I ask ', ['n', 'how many', '10'], ' people: “When did you last ', ['last', 'the problem', 'have an empty Tuesday'], '? What did you try? What did it cost you?” I write their exact words.'],
    tool: 'The customer interview', x: [0, 3],
    fb: ['You’ll start with {t}, at {s}.', 'You want to pitch. Don’t. Ask about their past, not your idea.',
      ['That pace finds the truth in a month.', 'You wrote three questions about their past. That is how real demand shows.'], 'You ask {n} people: “When did you last {last}? What did you try? What did it cost you?”'] }] },

{ n: 11, promise: 'Three people asked for honest feedback, one open question in a meeting, your advantage written with proof, three testimonials asked for.', word: 'EDGE', ch: 2, floor: 'Advantage · why you, and not them', title: 'Your advantage', old: 'Everyone does what I do.', neu: 'I am chosen for a reason I can name and prove.',
  d: [
  { l: 'E', name: 'Ego check', t: { q: 'When I get criticism, I…', o: ['defend myself', 'shut down', 'overthink for days', 'use it'] },
    s: { q: 'People who told you something hard this month', min: 0, max: 10, step: 1, d: 1, w: N('people'), e: ['None', 'Ten'], up: true },
    f: ['I ask ', ['a', 'one person', 'Luca'], ', ', ['b', 'another', 'Sara'], ' and ', ['c', 'a third', 'my accountant'], ': “What’s one thing I do that makes working with me harder?” I only say thank you.'],
    tool: 'Feedback, asked for', x: [0, 1],
    fb: ['With criticism you {t}, and {s} told you something hard this month.', 'Feedback stings because worth is involved. Yours is settled (Level 01). Don’t fight it. Collect it.',
      ['People tell you the truth. That is an advantage few have.', 'You chose three people to ask. You’ll hear what competitors never hear.'], 'You ask {a}, {b} and {c} the one question, and only say thank you.'] },
  { l: 'D', name: 'Dialogue', t: { q: 'What my team or partners avoid telling me', o: ['bad news', 'their ideas', 'that they’re overloaded', 'nothing, they tell me'] },
    s: { q: 'How safe is it to disagree with you?', min: 0, max: 10, step: 1, d: 5, w: SAFE, e: ['Not safe', 'Safe'], up: true },
    f: ['In every ', ['meet', 'which meeting', 'Monday check-in'], ' I ask: “What isn’t working that I don’t know?” and I ', ['do', 'what you do first', 'write it down'], ' before I answer.'],
    tool: 'The open question', x: [0, 5],
    fb: ['People avoid telling you {t}, and disagreeing feels {w}.', 'Silence looks like agreement. It isn’t. Don’t fight that. Ask the question every week.',
      ['Disagreement is safe with you. That is how good ideas surface.', 'You set one question in one meeting. Habits beat speeches.'], 'Every {meet} you ask what isn’t working, and you {do} before you answer.'] },
  { l: 'G', name: 'Gap', t: { q: 'Customers compare me with', o: ['a competitor', 'doing nothing', 'doing it themselves', 'a cheaper option'] },
    s: { q: 'How different do you look to a buyer?', min: 0, max: 10, step: 1, d: 3, w: [[3, 'the same'], [6, 'a bit different'], [8, 'clearly different'], [10, 'one of a kind']], e: ['The same', 'One of a kind'], up: true },
    f: ['Others offer ', ['others', 'what others offer', 'discount cards'], '. I offer ', ['mine', 'what you offer', 'events that bring regulars'], ', because ', ['because', 'why you can', 'I know the neighbourhood'], '. Proof: ', ['proof', 'one fact', 'Bar Lina, +40% on Tuesdays'], '.'],
    tool: 'The advantage map', x: [0, 3],
    fb: ['You are compared with {t}, and you look {w}.', 'If you look the same, price decides. Don’t fight on price. Name the gap.',
      ['Buyers see a difference. Put the proof next to it.', 'You named your difference and its proof. That is an edge.'], 'Others offer {others}. You offer {mine}, because {because}. Proof: {proof}.'] },
  { l: 'E', name: 'Echo', t: { q: 'Where my proof lives', o: ['nowhere', 'in my head', 'screenshots on my phone', 'public reviews'] },
    s: { q: 'Written testimonials you could show today', min: 0, max: 20, step: 1, d: 2, w: N('testimonials'), e: ['None', '20'], up: true },
    f: ['By ', ['day', 'a date', '15 Nov'], ' I ask ', ['n', 'how many', '3'], ' clients for two sentences: what changed for them, and who they would recommend me to.'],
    tool: 'The two-sentence testimonial', x: [2, 2],
    fb: ['Your proof lives {t}, and you have {s}.', 'Asking for praise feels vain. It is evidence for the next client. Don’t fight that. Ask.',
      ['You have proof. Put it where buyers decide.', 'You set a date to collect proof. Your clients will speak for you.'], 'By {day} you ask {n} clients for two sentences, and you put them where buyers decide.'] }] },

{ n: 12, promise: 'Your leader sentence written, one person given something to own, a 90-day number with checkpoints, one market test set.', word: 'RISE', ch: 2, floor: 'Leadership · your next ninety days', title: 'Your ninety days', old: 'I am a person with a business.', neu: 'I am a leader who builds people and serves a market.',
  d: [
  { l: 'R', name: 'Rule of life', t: { q: 'What changed most in me since Level 01', o: ['what I believe', 'how calm I stay', 'how I decide', 'how I handle money', 'how I sell'] },
    s: { q: 'How much do you trust yourself to decide now?', min: 0, max: 10, step: 1, d: 7, w: [[3, 'a little'], [6, 'more than before'], [8, 'a lot'], [10, 'fully']], e: ['Not at all', 'Fully'], up: true },
    f: ['I am a leader who ', ['who', 'who you are', 'decides calmly and serves first'], '. In 90 days I will be known for ', ['known', 'what for', 'the busiest Tuesdays in Rome'], '.'],
    tool: 'Your credo, rewritten', x: [2, 7],
    fb: ['What changed most is {t}, and you trust yourself {w}.', 'Old doubts return on hard days. Don’t fight them. Read your proof.',
      ['You trust your decisions. That is leadership.', 'You wrote who you are now. Read it every Monday.'], 'You are a leader who {who}. In 90 days, you are known for {known}.'] },
  { l: 'I', name: 'Invest in people', t: { q: 'Who could lead with me', o: ['someone on my team', 'a partner', 'a client', 'nobody yet'] },
    s: { q: 'Hours a week you will invest in them', min: 0, max: 10, step: 1, d: 1, w: N('hours'), e: ['None', '10 hours'], up: true },
    f: ['I grow ', ['who', 'a name', 'Marta'], ' by giving them ', ['own', 'something to own', 'all supplier decisions'], ' to own. Every ', ['day', 'which day', 'Thursday'], ' I ask: “', ['ask', 'your coaching question', 'What did you decide, and why?'], '”'],
    tool: 'Grow one leader', x: [0, 1],
    fb: ['{t} could lead with you, and you’ll give it {s}.', 'Doing it yourself is faster today and slower forever. Don’t fight that. Hand over ownership.',
      ['That is real time for a leader. Keep the day fixed.', 'You chose a person and a question. That is how leaders grow leaders.'], 'You give {who} {own} to own, and every {day} you ask: “{ask}”'] },
  { l: 'S', name: 'Scale the number', t: { q: 'The one number that matters most for 90 days', o: ['profit', 'clients', 'price', 'cash', 'my hours'] },
    s: { q: 'Growth you aim for in 90 days', min: 0, max: 100, step: 5, d: 20, sfx: '%', w: function (v) { return v >= 50 ? 'bold' : v >= 20 ? 'stretching' : 'steady'; }, e: ['0%', '100%'], up: true },
    f: ['In 90 days: ', ['num', 'the number', 'profit'], ' from ', ['from', 'today', '€1,300'], ' to ', ['to', 'the target', '€2,000'], ' a month. Checkpoints: ', ['c1', 'day 30', '€1,500'], ', ', ['c2', 'day 60', '€1,750'], '.'],
    tool: 'The 90-day plan', x: [0, 50],
    fb: ['You chose {t}, and a {w} target of {s}.', 'Big targets scare, small ones bore. Don’t fight the fear. Break it into checkpoints.',
      ['Bold, with checkpoints. That is how growth stays honest.', 'You wrote a number and two checkpoints. Progress you can see.'], '{num} from {from} to {to}, via {c1} and {c2}.'] },
  { l: 'E', name: 'Expand', t: { q: 'My next market move', o: ['raise my price', 'a new customer group', 'a new channel', 'a partnership', 'a new product'] },
    s: { q: 'How confident are you it will work?', min: 0, max: 10, step: 1, d: 5, w: SURE, e: ['Not at all', 'Certain'], up: true },
    f: ['By ', ['day', 'a date', '31 Jan'], ' I test ', ['test', 'the move', 'a supper club for offices'], ' with ', ['n', 'how many people', '10'], ' people. Success means ', ['win', 'what counts', '4 bookings'], '. If not, I ', ['else', 'plan B', 'try lunch instead'], '.'],
    tool: 'The small market test', x: [1, 5],
    fb: ['Your next move is {t}, and you feel {w} about it.', 'Certainty comes after the test, not before. Don’t fight the doubt. Test small.',
      ['You’re confident. Test it anyway; confidence isn’t data.', 'You set a test with a number for success. That is how markets are entered.'], 'By {day} you test {test} with {n} people. Success: {win}. If not, {else}.'] }] }
];

/* ── The action plan of every domain (Blueprint skeleton, Phase 3) ─────────
 * Inform, reform, transform. Per domain, keyed 'level.domain' (domain 0 to 3):
 *   topic   what the domain is about, in plain words
 *   on      null when the sentence already holds the action's day (its field
 *           is dayKey, default 'day'); else the question of the added day
 *           screen, saved as the new key `on` (onEx: its example)
 *   bp      the section of the founder's Blueprint this domain writes
 *   ins     the insight: the principle, never the technique (rule 9)
 *   done    "Done when", checkable on Sunday; {key} is the founder's answer
 *   take    what the founder keeps: [title, ...lines], filled with their own
 *           words; ____ is a line to fill in on paper
 *   notyet  the smaller step, after a Sunday "Partly" or "Not yet"
 *   stage   a note only where a stage is truly different (Leading reads
 *           Scaling)
 *   gp      where the founder already wrote this in their Growth Plan (full
 *           accounts): shown back on the screen `at` ('t', the tap, or a
 *           field), never asked twice
 * New saved keys, beside the Version 4 ones (none changes meaning):
 *   w.v4.L.d.on    the added day       w.v4.L.d.sure  how sure, 0 to 100
 *   w.v4.L.d.got   0 Done, 1 Partly, 2 Not yet (asked when level L+1 opens)
 *   w.v4.L.r.carry 'level.domain' carried forward from a chapter reading,
 *   w.v4.L.r.on    and its day (L = 5, 9, 12) */
export const PLAN4 = {
  '1.0': { topic: 'The rule that decides your worth', on: null, bp: 'self',
    ins: 'A rule like this was learned early, often from someone you wanted to please. It still decides how you rest, price and say no. You do not argue a rule away; you test it once and look at what really happens.',
    done: 'on {day} you did “{act}”, and wrote one line on what really happened.',
    take: ['The test card', 'Old rule: If I {t}, then I’m worth something.', 'The test: on {day} I {act}.', 'What I feared would happen: ____', 'What really happened: ____'],
    notyet: 'Make it smaller: one hour of it, not a whole evening, on the next free day. Then write the line.' },
  '1.1': { topic: 'One task out of your hands', on: null, bp: 'people',
    ins: 'Every task you keep because “nobody does it right” costs you an hour you needed for the work only you can do. Trust is built in small, checked steps, not in one leap. A clear “done” protects both of you.',
    done: '{who} did {task} once, to “{done}”, and you checked it only once.',
    take: ['The hand-over note', '{who}, from {day}, {task} is yours.', 'Done means: {done}.', 'I will check it once, on ____. Ask me anything before you start.'],
    notyet: 'Make it smaller: hand over one part of {task}, or do it once side by side, then let them do the next one.',
    stage: { building: 'No team yet? Hand it to a tool, a template, or a freelancer for two hours.' } },
  '1.2': { topic: 'Money: the sentence you grew up with, and your enough', on: null, bp: 'money',
    gp: { at: 't', step: 12, ids: ['mgp-12.1'] },
    ins: 'Without a number for enough, every month feels short and every price feels too high. Enough is a finish line, not a ceiling: it tells you when to stop chasing and what to charge. The sentence you grew up with is not your business plan.',
    done: 'on {day} you made one money move: {move}.',
    take: ['My money line', 'Enough: {enough} a month.', 'Last month in: ____ · fixed costs: ____ · left: ____', 'The money move: {move}, on {day}.'],
    notyet: 'Make it smaller: open last month’s statement and write the three numbers. The move can wait a week; the looking cannot.' },
  '1.3': { topic: 'Asking someone to buy', on: null, bp: 'sales',
    gp: { at: 'names', step: 16, ids: ['mgp-16.3', 'mgp-16.4', 'mgp-16.5'] },
    ins: 'If your offer helps, then not asking keeps help from the people who need it. Asking is service; the answer belongs to them. A no tells you something true about the offer or the timing, never about your worth.',
    done: 'you asked {names} by {day}, and wrote each answer word for word. A yes and a no both count.',
    take: ['The ask, ready to send', 'Hi ____, I help {whom} with {prob}.', 'I think it could help you. Would you like to talk for twenty minutes this week?', 'Asked: {names}. Their answers, word for word: ____'],
    notyet: 'Make it smaller: ask one of the three today, by message, with the two lines above.' },
  '2.0': { topic: 'Facts before the story', on: 'By which day will one more event be written this way?', bp: 'self',
    ins: 'Your mind writes a story in a second, then acts on it as if it were fact. Most bad decisions in a hard week come from the story, not from the facts. Separate them on paper and the next step usually becomes plain.',
    done: 'by {on}, one more event (the next thing that goes wrong, or the hardest moment of the week) is written as facts, story and a truer reading, before you acted on it.',
    take: ['The three-line check, for any hard moment', 'What a camera would have seen: ____', 'The story I told myself: ____', 'What else could be true: ____'],
    notyet: 'Make it smaller: take the last thing that annoyed you, even a small one, and write the three lines tonight.' },
  '2.1': { topic: 'Ask before you judge', on: null, bp: 'people',
    ins: 'When you decide why someone let you down without asking, you lead the person in your head, not the real one. One honest question takes five minutes and saves weeks of quiet resentment. Ask, then only listen.',
    done: 'by {day} you asked {who} the question, only listened, and wrote one line of what you heard.',
    take: ['The question, ready to ask', '{who}, when {what}, what was going on for you?', 'Then: “What would help next time?”', 'What I heard: ____'],
    notyet: 'Make it smaller: send the question as a message today, and read the answer twice before you reply.' },
  '2.2': { topic: 'Your five numbers, on a fixed day', on: null, bp: 'money',
    ins: 'Numbers are not a verdict on you. They are the business telling you the truth early, while it is still cheap to act. A machine can add them up in seconds; only you can decide what they mean and what you do on Monday.',
    done: 'on {day} at {time} you read all five numbers, {fear} first, and wrote them down.',
    take: ['My five numbers, every {day} at {time}', 'Money in: ____ · money out: ____ · cash left: ____', 'Unpaid invoices: ____ · hours worked: ____', '{fear}, read first. What it tells me: ____'],
    notyet: 'Make it smaller: read only {fear} this week, on {day}, and write it down.',
    stage: { building: 'No sales yet? Money in is zero: read it anyway, and add one more number, conversations held.' } },
  '2.3': { topic: 'One customer signal, tested', on: 'By which day will you have checked it once?', bp: 'sales',
    ins: 'Praise feels like progress, but only payment is proof. A signal you test turns guessing into knowing, and knowing is what a sales rhythm is built on. One honest check beats a week of worry.',
    done: 'by {on} you checked the signal once, by {check}, and wrote what the customer actually said.',
    take: ['The signal test', 'When a customer {does}, I think it means {means}.', 'I check by {check}.', 'What they actually said: ____ · Was I right? ____'],
    notyet: 'Make it smaller: ask the next person who shows interest one question: “What would make this a yes for you?”' },
  '3.0': { topic: 'The feeling under the stress', on: 'By which day will you have used it once?', bp: 'self',
    ins: '“Stressed” is a cover word. The feeling under it (fear, shame, anger, loneliness, tiredness) each asks for something different. Name it and you can answer it; leave it unnamed and it decides for you.',
    done: 'by {on}, the next time {feeling} came, you did this first: {help}. You wrote the day it happened.',
    take: ['When it comes', 'Under my {surface} is {feeling}.', 'What helps: {help}.', 'Then I decide. Not before.'],
    notyet: 'Make it smaller: the next time you feel tense, say the real word to yourself, even silently. That counts as the first time.' },
  '3.1': { topic: 'Your first five seconds under pressure', on: 'Which day will you ask {who}?', bp: 'people',
    ins: 'People watch your face in the first five seconds after bad news, and decide whether to bring you the next one. If bad news is not safe with you, you hear it late, when it is expensive. Change the first reaction and the room changes with it.',
    done: 'you asked {who} on {on} to tell you when you slip, and under pressure you did this at least once: {will}.',
    take: ['My first five seconds', 'Under pressure I will {will}, instead of {instead}.', '{who} tells me when I slip.', 'Times I slipped this week: ____ · times I kept it: ____'],
    notyet: 'Make it smaller: tell {who} today, in one sentence, what you are practising. Asking is the first step.',
    stage: { building: 'No team yet? The people around you are clients, partners and family. Ask one of them.' } },
  '3.2': { topic: 'A rule for decisions in a storm', on: 'By which day will the rule be where you see it?', bp: 'self',
    ins: 'The decisions made in a storm are usually the ones you pay for longest: a price cut, a hire, a quit. A rule written while you are calm is a gift to the person you will be on a bad day. You do not have to win the feeling; you only have to wait it out.',
    done: 'by {on}, the rule is on your phone’s lock screen or on your desk, and one person knows it.',
    take: ['The rule I wrote while calm', 'When I feel {feel} above 7 out of 10,', 'I wait {hours} hours before I decide about {about}.', 'Who I call while I wait: ____'],
    notyet: 'Make it smaller: write the rule on a note today and put it where you work.' },
  '3.3': { topic: 'Your client’s fear, in their words', on: null, bp: 'marketing',
    ins: 'People buy to move away from a fear and towards a hope, then explain it with logic afterwards. If you guess the fear, your message speaks to the wrong thing. Their own words, written down, are the best marketing you will ever have.',
    done: 'you asked {who} by {day}, and wrote their fear and their hope in their own words.',
    take: ['Their fear, their hope', '{who} fears: ____ (their words)', 'And hopes for: ____ (their words)', 'The first line of my next message: “If you’re worried about ____, …”'],
    notyet: 'Make it smaller: ask one client one question by message: “What almost stopped you from working with me?”' },
  '4.0': { topic: 'Decide once, in advance', on: 'Which day will you use it first?', bp: 'self',
    ins: 'Willpower runs out by the afternoon; a decision made in advance does not. An if–then plan works because the hard choice is already made when the moment comes. Plan for the obstacle you know will show up, not for a perfect day.',
    done: 'you used the plan on {on} and on two more days, and wrote “kept” or “not kept” each time.',
    take: ['My if–then', 'When {when}, I will {will}.', 'If {if}, then I {then}.', 'Kept: Mon ☐ Tue ☐ Wed ☐ Thu ☐ Fri ☐'],
    notyet: 'Make it smaller: use the plan once, tomorrow, for ten minutes. One kept plan is the start of the habit.' },
  '4.1': { topic: 'One ask with a date and a done', on: null, dayKey: 'when', bp: 'people',
    ins: 'Most frustration with people is a request that was never made clearly: no date, no picture of done. A clear ask is a kindness, because it lets people succeed. If it matters, write it down.',
    done: '{who} has the ask in writing, with the date and the done, and on {when} you checked it once.',
    take: ['The clear ask, ready to send', '{who}, could you do {what} by {when}?', 'Done looks like: {done}.', 'Is there anything you need from me to do it?'],
    notyet: 'Make it smaller: take one request you already made this week, add a date and a “done”, and send it again.' },
  '4.2': { topic: 'Your hour has a price', on: 'Which day will you hand back {back}?', bp: 'offer',
    ins: 'Your hour has a price whether you name it or not. Once you know it, cheap work stops looking free: every hour of admin you keep is paid at your rate. The first hour of the day decides what kind of week it becomes.',
    done: '{first} came first on three days, and {back} was handed back by {on}.',
    take: ['My hour', 'My hour is worth {hour}.', 'First, every day: {first}.', 'Handed back: {back}. Hours it gives me each week: ____'],
    notyet: 'Make it smaller: protect the first hour on two days, not every day, and do {first} in it.',
    stage: { scaling: 'Price your team’s hour too: what one hour of their work costs you.' } },
  '4.3': { topic: 'A weekly selling hour', on: null, bp: 'sales',
    ins: 'Delivery fills every free hour, so selling only happens when the work runs out, which is the worst time to start. A fixed selling hour keeps the pipeline full while you are busy. Everyone hears from you twice, because people are busy, not uninterested.',
    done: 'on {day} at {time} you talked with {n} potential buyers, and everyone heard from you twice.',
    take: ['My selling hour', 'Every {day} at {time}: {n} buyer conversations.', 'Everyone hears from me twice.', 'This week: talked ____ · asked ____ · yes ____'],
    notyet: 'Make it smaller: one conversation this week, at the same day and time, and put next week’s in the calendar now.' },
  '5.0': { topic: 'Proof of who you are becoming', on: 'By which day will you add one more proof?', bp: 'self',
    ins: 'Identity changes after the evidence, not before it. Every dated proof is a vote for who you are becoming, and on a hard day it is the list you read. One proof is a start; a habit is a long list.',
    done: 'by {on}, a second dated proof is written under the first.',
    take: ['My proof list', 'I am becoming someone who {who}.', '1. {proof}', '2. ____ (date) · 3. ____ (date)'],
    notyet: 'Make it smaller: look back at the last four weeks, write one thing you did that the old you would not have done, and date it.' },
  '5.1': { topic: 'Thanks that names the thing', on: 'Which day will you tell {who}?', bp: 'people',
    ins: 'People repeat what gets noticed. A quick thanks is polite; naming exactly what someone did and what it changed teaches them what good looks like. It takes a minute and builds a team that knows your standard.',
    done: 'you told {who} on {on}, face to face or in writing, what they did and what it changed.',
    take: ['The thank-you, ready to send', '{who}, thank you for {what}.', 'It changed {changed}.', 'Next person to thank: ____'],
    notyet: 'Make it smaller: send the two lines above as a message today. In writing counts.' },
  '5.2': { topic: 'One number that tells the truth', on: null, bp: 'money',
    ins: 'One number read every week is worth more than ten read once. When it misses, the tactic is rarely the whole story: a belief often sits behind it, like a fear of asking or a price you are ashamed of. Ask both questions.',
    done: 'on {day} you read {num}, wrote it on your Planner’s Monday page, and, if it missed, one line on the belief behind it.',
    take: ['My Monday number', 'Every {day}: {num}. This week: ____ · last week: ____', 'If it missed, the belief behind it: ____', 'The one thing I change: ____'],
    notyet: 'Make it smaller: read {num} once this week and write it on your Planner’s Monday page.' },
  '5.3': { topic: 'Their words, not yours', on: 'By which day will you ask three clients?', bp: 'marketing',
    ins: 'When you describe your work, it sounds like selling; when a client describes it, it sounds like proof. Their words also tell you why you are really chosen, which is often not what you think. Ask, and write it down word for word.',
    done: 'you asked three clients by {on}, and wrote their answers word for word.',
    take: ['The question for three clients', '“When you came to me, what was going on? What did you want instead? What changed?”', 'My guess: when {when}, they want to {want}, so they can {so}.', 'What they actually said: ____'],
    notyet: 'Make it smaller: ask one client, by message, the first question only.' },
  '6.0': { topic: 'The conversation you keep postponing', on: null, bp: 'people',
    gp: { at: 't', step: 6, ids: ['mgp-6.1', 'mgp-6.2'] },
    ins: 'A conversation you postpone does not wait. It costs more each week, in rework, tension and decisions left hanging. Saying what you see and what you need, kindly and plainly, is respect, not attack; the first sentence carries most of the courage.',
    done: 'the talk with {who} happened on {day}, and you said the first sentence as you wrote it.',
    take: ['The first sentence', '{who}, I need to talk about {about}.', 'What I see is {see}. What I need is {need}.', 'Then: “What do you need from me?”'],
    notyet: 'Make it smaller: book it today. Send {who} one line asking for twenty minutes, with a day.' },
  '6.1': { topic: 'Ask, then listen', on: 'Which day is the talk with {who}?', bp: 'people',
    ins: 'In a hard talk, the one who speaks most usually learns least. A good open question shows respect and gives you what you cannot learn any other way. Ask, then count to three before you speak.',
    done: 'in the talk with {who} on {on} you asked “{ask}”, and spoke less than half the time.',
    take: ['The listening card', 'My question: “{ask}”', 'After they answer: “Tell me more.”', 'What I learned that I didn’t know: ____'],
    notyet: 'Make it smaller: in your next ordinary conversation, ask one open question and let the silence sit for three seconds.' },
  '6.2': { topic: 'Money that is yours', on: null, bp: 'money',
    ins: 'Money you earned and did not collect is a loan you never agreed to give. Asking for it is part of the work, not a rudeness. A short, polite, firm message with a date works better than a long apology.',
    done: 'the message went to {who} on {day}. Being paid by {by} is theirs to do; sending it was yours.',
    take: ['The payment message, ready to send', 'Hi {who}, invoice {inv} was due on {due}.', 'Please pay by {by}. Thank you.', 'If it is not paid by {by}, I call on ____.'],
    notyet: 'Make it smaller: send the two lines exactly as written. No extra sentences, no apology.',
    stage: { building: 'Nothing unpaid? Take the work you did for free, and ask to be paid for it from now on.' } },
  '6.3': { topic: 'A kind no, with an alternative', on: 'By which day will you say it?', bp: 'sales',
    ins: 'Every wrong yes is a quiet no to the right client, and often to your own evening. A kind no with an alternative protects the relationship and your standard. You do not need a long reason; you need a better suggestion.',
    done: 'you said the kind no about {what} by {on}, offered {suggest}, and added no discount.',
    take: ['The kind no, ready to say', '“This isn’t the right fit for {fit}.', 'What I suggest is {suggest}.”', 'Hours I get back each week: ____'],
    notyet: 'Make it smaller: the next time a small extra is asked for, say the same two lines.' },
  '7.0': { topic: 'Your best hours, guarded', on: null, dayKey: 'days', bp: 'self',
    ins: 'Your best hours are the most valuable thing you own, and the urgent will always try to take them. What you protect on the calendar shows what you really believe matters. Give the urgent a later hour, not your best one.',
    done: 'the hours from {from} to {to} are in your calendar for the next four weeks, and you kept them this week, {days}.',
    take: ['My best hours, guarded', '{from} to {to}, {days}: only {what}.', 'If someone asks for that time: “I can do ____ instead.”', 'Kept this week: ____ of ____'],
    notyet: 'Make it smaller: protect one morning this week, not four, and put it in the calendar now.' },
  '7.1': { topic: 'One task, one step up', on: 'Which day this week will it run that way for the first time?', bp: 'systems',
    ins: 'Delegation fails when it jumps from “I do it” to “they own it” in one step. Move one step at a time: I do it, they watch; they do it, I check; they own it. Each step builds the trust the next one needs.',
    done: 'on {on}, {task} ran once at “{to}”, and {day} is in your calendar as the day it stays there.',
    take: ['The ladder for {task}', 'Now: “{from}”. Next: “{to}”, by {day}.', 'What I check, and when: ____', 'What they decide alone: ____'],
    notyet: 'Make it smaller: do {task} once side by side this week, and let them do the last part.',
    stage: { building: 'No team? The next step is a template or a tool doing it, and you checking.' } },
  '7.2': { topic: 'The price you never go below', on: 'By which day will the floor be written next to your prices?', bp: 'offer',
    ins: 'Most underpricing hides in the hours you don’t count: the calls, the changes, the travel. Write down the real cost of one job once, and you know the line you must never sell below; below it, you pay to work. A calculator does the sum in a minute; holding the line is the part only you can do.',
    done: '{floor} is written next to your price list by {on}, and your next quote was at or above it.',
    take: ['The line I never sell below', 'One job: {mat} + {hrs} hours × {rate} = {total}.', 'I never sell it below {floor}.', 'If a client asks for less: “At that price I can offer ____ instead.”'],
    notyet: 'Make it smaller: take your last job, count every hour it really took, and write the real cost.' },
  '7.3': { topic: 'A fixed hour for marketing', on: null, bp: 'marketing',
    ins: 'Marketing done only when the diary is empty arrives too late, because buyers take time to decide. One fixed hour a week, where your buyers already gather, adds up. Show your clients’ results more than yourself.',
    done: 'on {day}, from {from} to {to}, you did “{act}” on {where}, and the hour is in your calendar for four weeks.',
    take: ['My hour for marketing, every week', 'Every {day}, {from} to {to}: {act} on {where}.', 'Ideas for the next four weeks: 1 ____ 2 ____ 3 ____ 4 ____', 'Replies or enquiries this week: ____'],
    notyet: 'Make it smaller: one post or message this week, in the same hour, and book next week’s hour now.' },
  '8.0': { topic: 'What you are best at, and what to stop', on: 'By which day will you stop selling {stop}?', bp: 'offer',
    ins: 'Doing a bit of everything feels safe, but it hides your best work and makes you hard to recommend. Half what you are best at, half what the market will pay for, is a good place to stand. Dropping one thing makes room for the better one.',
    done: 'by {on}, {stop} came off your price list or offer page, or you said no to one request.',
    take: ['My best work', 'I am best at {best}.', 'People pay me for {pay}.', 'I stop selling {stop}. When asked: “I don’t do that any more; ____ does it well.”'],
    notyet: 'Make it smaller: decline the next request for {stop}, kindly, with a name to send them to.' },
  '8.1': { topic: 'Three clear steps after yes', on: 'By which day will the three steps be written?', bp: 'systems',
    ins: 'Clients judge you most in the days right after they say yes. Confusion there costs referrals; clear steps make people feel led and safe. Write the steps once, and anyone on your team can give the same good start.',
    done: 'by {on}, the three steps are in the message every new client gets, and {who} knows step {which} is theirs.',
    take: ['The welcome message, ready to send', 'Thank you for saying yes. Here is what happens now:', '1. {s1} · 2. {s2} · 3. {s3}', '{who} looks after step {which}. Any question, just reply.'],
    notyet: 'Make it smaller: send the three steps to your next client, even if the message is not perfect yet.',
    stage: { building: 'No clients yet? Write the three steps for your first one, and walk a friend through them.' } },
  '8.2': { topic: 'Your price, in three levels', on: 'By which day will the three levels be on your offer page?', bp: 'offer',
    ins: 'One price asks for a yes or a no; three levels ask “which one?”. A higher level shows what your work is worth, even to people who do not buy it. Say the price once, calmly, and then stop talking.',
    done: 'by {on}, the three levels are on your offer page or price list, and you said them out loud once to a buyer.',
    take: ['My three levels', 'Essential: {e1}, {p1}.', 'Complete: {e2}, {p2}.', 'Premium: {e3}, {p3}.'],
    notyet: 'Make it smaller: say the three levels out loud to one person you trust, then to one buyer.' },
  '8.3': { topic: 'Your offer in one line', on: 'By which day will you have said it to three people?', bp: 'offer',
    ins: 'A clever offer gets admired; a clear one gets bought and recommended. If a customer can repeat it after hearing it once, they can sell it for you. Say it the same way every time.',
    done: 'by {on}, you said the line to three people the same way, and one could say it back.',
    take: ['My offer in one line', 'For {who} who {pain}, I {do}, so they {gain}, within {time}.', 'Said to: 1 ____ 2 ____ 3 ____', 'Who could say it back: ____'],
    notyet: 'Make it smaller: say the line to one person today and ask them to say it back.' },
  '9.0': { topic: 'A weekly review you keep', on: null, bp: 'systems',
    ins: 'Without a weekly review, the week plans you. A short, honest look back (what you promised, what happened, what the numbers say) is how you steer. A short review kept every week beats a long one skipped.',
    done: 'on {day} at {time} you held the review and wrote {three} priorities on your Planner’s Monday page.',
    take: ['My weekly review, every {day} at {time}', 'Promised: ____ · happened: ____', 'The numbers: in ____ · out ____ · left ____', 'Next week’s {three} priorities: 1 ____ 2 ____ 3 ____'],
    notyet: 'Make it smaller: this week, answer only the first line, on paper.' },
  '9.1': { topic: 'One area with an owner', on: 'By which day will {who} know?', bp: 'systems',
    ins: 'Being needed for everything feels good, and it is a ceiling on your business. An area with a named owner, a spending limit and a clear “call me when” keeps running on your worst day. Write it down, so it lasts longer than your mood.',
    done: 'by {on}, {who} has it in writing: they own {owns} up to {limit}, and one decision was made without you.',
    take: ['The owner note', '{who} owns {owns}.', 'They decide alone up to {limit}.', 'They call me when {call}. Otherwise, I trust their decision.'],
    notyet: 'Make it smaller: give {who} one decision this week, up to {limit}, and let it stand.',
    stage: { building: 'No team? Name the tool, template or freelancer that owns the area, and what you still check.' } },
  '9.2': { topic: 'One page of cash', on: null, bp: 'money',
    ins: 'Cash surprises end good businesses, and almost every surprise was visible weeks earlier on a simple page: in, out, left, every week, with an alert line you act on the same day. Software can fill the page; only you can act on it.',
    done: 'on {day} the page shows this week’s in, out and left, and you know what you do below {alert}.',
    take: ['My cash page, every {day}', 'In: {in} · out: {out} · left: {left}', 'Alert line: {alert}. Below it, the same day I: ____', 'Next four weeks, expected in: ____ · out: ____'],
    notyet: 'Make it smaller: fill only the first line this week, from the bank, on {day}.' },
  '9.3': { topic: 'A warm list you can see', on: null, bp: 'sales',
    ins: 'A pipeline in your head is a pipeline you forget. Written down, every name has a next step, and you can see the list getting thin before the work runs out. Move a few people one step each week.',
    done: 'the {n} names are written down, and on {day} you moved {m} of them one step.',
    take: ['My warm list', 'Name · where they are (met → talked → offer → yes) · next step · by when', '{n} names. Every {day}: move {m} from {from} to {to}.', 'The list is thin when fewer than ____ names are open.'],
    notyet: 'Make it smaller: write down ten names today, with one next step each.',
    stage: { scaling: 'Each person who sells keeps their own list; you read the total every week.' } },
  '10.0': { topic: 'People you already know', on: 'By which day will the messages be sent?', bp: 'marketing',
    gp: { at: 'first', step: 16, ids: ['mgp-16.3', 'mgp-16.4', 'mgp-16.5'] },
    ins: 'You know more people than you think, and each of them knows people you don’t. First clients usually come from someone who already trusts you. Asking “who do you know?” is an invitation to help, not a favour.',
    done: 'by {on}, {n} messages are sent, starting with {first}, and you counted the replies.',
    take: ['The message to people you know', '“{say}”', 'Sent to: {first}, ____, ____ … ({n} in all)', 'Replies: ____ · introductions: ____'],
    notyet: 'Make it smaller: send the message to three people today, starting with {first}.' },
  '10.1': { topic: 'One partner asked', on: 'By which day will you ask {who}?', bp: 'marketing',
    ins: 'Someone already meets your clients every week: an accountant, a supplier, a past client. One good partner can send more work than months of posting. Make it a fair trade, and offer something first.',
    done: 'you asked {who} by {on}, and offered your part first.',
    take: ['The partner ask, ready to send', 'Hi {who}, could you introduce me to two people who {need}?', 'In return, I {give}.', 'Introductions received: ____'],
    notyet: 'Make it smaller: send the message to {who} today. A no is fine; ask the next partner.' },
  '10.2': { topic: 'Your best client, described', on: 'By which day will you list them?', bp: 'marketing',
    ins: 'Your best clients are not random; they share things you can name. Describe them, and you know where to look and what to say. Depending on very few clients feels fine until one leaves.',
    done: 'by {on}, every current client who shares all three is listed by name.',
    take: ['My best client', 'They {a}, {b} and {c}.', 'Today they are: ____ (names)', 'I want {more} more by {by}. Where I find them: ____'],
    notyet: 'Make it smaller: list your current clients and tick those who share all three.',
    stage: { building: 'Fewer than three clients? Describe the one you want most, and the first one who paid.' } },
  '10.3': { topic: 'Customer conversations about their past', on: 'By which day will three be booked?', bp: 'grow',
    ins: 'People are polite about your idea and honest about their past. Ask when they last had the problem, what they tried and what it cost them. Their exact words show you what to build next, and how to sell it.',
    done: 'by {on}, three of the {n} conversations are booked or held, and you wrote their exact words.',
    take: ['The three questions', '“When did you last {last}? What did you try? What did it cost you?”', 'What I heard most: 1 ____ 2 ____ 3 ____', 'What I build or change because of it: ____'],
    notyet: 'Make it smaller: hold one conversation this week and write their words the same day.' },
  '11.0': { topic: 'Asking for honest feedback', on: 'By which day will you have asked all three?', bp: 'people',
    ins: 'The people around you see what you cannot see in yourself, and most will only say it if you ask. Asking for feedback, and only saying thank you, is how you hear what competitors never hear. You decide later what to do with it.',
    done: 'by {on} you asked {a}, {b} and {c}, wrote each answer down, and only said thank you.',
    take: ['The feedback question', '“What’s one thing I do that makes working with me harder?”', 'Asked: {a}, {b}, {c}.', 'What I heard: ____ · the one thing I change: ____'],
    notyet: 'Make it smaller: ask one of the three today, and only say thank you.' },
  '11.1': { topic: 'One open question, every meeting', on: 'Which day is the next {meet}?', onEx: 'Monday', bp: 'people',
    ins: 'Silence in a meeting looks like agreement, but often it is fear. A question asked every week tells people that bad news and new ideas are welcome. Write down what you hear before you answer, so they see you took it in.',
    done: 'at the {meet} on {on} you asked “What isn’t working that I don’t know?”, and did this before you answered: {do}.',
    take: ['The open question, every {meet}', '“What isn’t working that I don’t know?”', 'Before I answer: {do}.', 'What came up this week: ____'],
    notyet: 'Make it smaller: ask the question once, to one person, at the end of any conversation this week.',
    stage: { building: 'No team meeting? Ask it of a partner, a supplier, or a client at the end of each job.' } },
  '11.2': { topic: 'Your advantage, with proof', on: 'By which day will it be where buyers see it?', bp: 'marketing',
    ins: 'If you look the same as everyone else, price decides. Your advantage is what you do differently, why you can do it, and proof that it works. Put the proof right next to the claim, where buyers decide.',
    done: 'by {on}, the sentence and its proof are on your offer page or in your next proposal.',
    take: ['My advantage', 'Others offer {others}. I offer {mine}, because {because}.', 'Proof: {proof}.', 'Where buyers see it: ____'],
    notyet: 'Make it smaller: add the one proof line to your next proposal or message.' },
  '11.3': { topic: 'Testimonials asked for', on: null, bp: 'marketing',
    ins: 'Two sentences in a client’s own words do more than any line you write about yourself. Most clients are glad to help when asked simply, with two clear questions. Put their words where the next buyer decides.',
    done: 'you asked {n} clients by {day}, and every answer you got is where buyers decide.',
    take: ['The testimonial ask, ready to send', '“Could you write two sentences: what changed for you, and who you would recommend me to?”', 'Asked: {n} clients, by {day}. Received: ____', 'Where I put them: ____'],
    notyet: 'Make it smaller: ask one happy client today, by message.' },
  '12.0': { topic: 'Who you are now', on: 'By which day will you read it aloud to someone?', bp: 'self',
    ins: 'After twelve weeks you have proof, not only hope. Write who you are now in one sentence and read it every Monday: old doubts come back on hard days, and the sentence and your proof list are the answer. Leadership starts with the leader.',
    done: 'by {on}, the sentence is on the first page of your Planner, and you read it aloud to one person.',
    take: ['Who I am now', 'I am a leader who {who}.', 'In 90 days I will be known for {known}.', 'I read it every Monday, with my proof list.'],
    notyet: 'Make it smaller: read the sentence aloud to yourself every morning this week. Then to one person.' },
  '12.1': { topic: 'Growing the next leader', on: null, bp: 'people',
    ins: 'Doing it yourself is faster today and slower for ever. A leader grows leaders by giving real ownership and asking questions instead of handing out answers. One person, one area, one question a week.',
    done: '{who} knows, in writing, that they own {own}, and on {day} you asked “{ask}”',
    take: ['Growing {who}', '{who} owns {own}.', 'Every {day} I ask: “{ask}”', 'What they decided well this month: ____'],
    notyet: 'Make it smaller: ask {who} the question once this week, and only listen.',
    stage: { building: 'Nobody yet? Pick the freelancer you use most, or the first person you would hire, and give them one decision.' } },
  '12.2': { topic: 'One number for the next ninety days', on: 'By which day will it be in your Planner?', bp: 'grow',
    ins: 'A big target scares and a small one bores; checkpoints make a big one honest. One number, two checkpoints, read every week, tell you early whether to push on or change course. The number serves the decision, never the other way round.',
    done: 'by {on}, your Planner’s twelve-week contract holds the number ({num}, from {from} to {to}) and both checkpoints with their dates.',
    take: ['My next 90 days', '{num}: from {from} to {to} a month.', 'Day 30: {c1} · day 60: {c2}.', 'If day 30 misses, the first thing I look at: ____'],
    notyet: 'Make it smaller: write the number and the first checkpoint in your Planner today; the second can wait a week.',
    stage: { scaling: 'Give each owner from Level 09 their own checkpoint, and read all of them on the same day.' } },
  '12.3': { topic: 'Testing your next market move', on: 'By which day will the first invitations go out?', bp: 'grow',
    ins: 'Certainty comes after a test, not before it. A small test with a clear number for success protects your money and your confidence. If it fails, you learned cheaply; if it works, you know what to do next.',
    done: 'by {on}, the first invitations are out, and success ({win} by {day}) is written in your Planner.',
    take: ['My market test', 'Test: {test}, with {n} people, by {day}.', 'Success means {win}. If not: {else}.', 'Result: ____'],
    notyet: 'Make it smaller: invite the first three people this week.' },
};

/** The founder's Blueprint at week 12: eight sections, every domain in one. */
export const BLUEPRINT4 = [
  { k: 'self', n: 'You, as a leader', about: 'How you think, feel, decide and rest.' },
  { k: 'people', n: 'Your people', about: 'How you trust, ask, listen, thank and grow others.' },
  { k: 'offer', n: 'What you sell', about: 'Your best work, your offer in one line, your prices and the floor you never go below.' },
  { k: 'marketing', n: 'Your marketing', about: 'Who you serve, what they fear and hope, your advantage, your proof, and where they hear of you.' },
  { k: 'sales', n: 'Your sales', about: 'How you ask, follow up, read the signals and say a kind no.' },
  { k: 'money', n: 'Your money', about: 'Your enough, the numbers you read, the money owed to you and the cash you watch.' },
  { k: 'systems', n: 'Your systems', about: 'What runs without you: owners, steps, hand-overs and the weekly review.' },
  { k: 'grow', n: 'Your next ninety days', about: 'What customers told you, the number you aim for, and the test you run.' },
];

export const CHAPTERS4 = [
  { n: 'Chapter I', name: 'The Inner Pyramid', about: 'The founder, from the base up: what you believe, how you read it, what you feel, what you do, what it makes of you.', lv: [0, 1, 2, 3, 4] },
  { n: 'Chapter II', name: 'The Engine Room', about: 'The business inside: conversations, time, your offer and its price, and systems that run without you.', lv: [5, 6, 7, 8] },
  { n: 'Chapter III', name: 'The Open Market', about: 'The business outside: reach, advantage and leadership, so the market comes to you.', lv: [9, 10, 11] }];

export const DOMS = ['self', 'people', 'work', 'market'];
export const DOM_NAMES = DOM.map((x) => x.n);
/** Units of work in a level: per domain the tap, the slide and the sentence. */
export const UNITS = 12;
/** The moves of a level, in order; [-1, 'credo'] is the four-sentence credo. */
export const STEPS4 = [].concat(...[0, 1, 2, 3].map((d) => [[d, 'tap'], [d, 'slide'], [d, 'formula'], [d, 'lines']]), [[-1, 'credo']]);
/** Levels that close a chapter, and so end in the chapter reading. */
export const CLOSES = { 5: 0, 9: 1, 12: 2 };

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const wkey = (lv, d, k) => `w.v4.${lv}.${d}.${k}`;
const raw = (work, lv, d, k) => { const v = work && work[wkey(lv, d, k)]; return v == null ? '' : String(v); };
export const fieldsOf = (D) => D.f.filter((p) => typeof p !== 'string');

/** The word a slider value reads as ('most days', '6 weeks', '€1,500'). */
export function wordOf(sl, v) {
  if (typeof sl.w === 'function') return sl.w(v);
  for (const [max, w] of sl.w) if (v <= max) return w;
  return '';
}
/** The value as the big number shows it. */
export const shown = (sl, v) => (sl.raw ? wordOf(sl, v) : `${v}${sl.sfx || ''}`);
export function tapOf(work, lv, d) { const v = raw(work, lv, d, 't'); return v === '' ? null : Number(v); }
export function slideOf(work, lv, d) {
  const D = LEVELS4[lv - 1].d[d], v = raw(work, lv, d, 's');
  return v === '' ? null : Math.min(D.s.max, Math.max(D.s.min, Number(v)));
}
const slideOr = (work, lv, d) => { const v = slideOf(work, lv, d); return v == null ? LEVELS4[lv - 1].d[d].s.d : v; };

/** 0–3: the tap, the slide and the whole sentence, each once done. */
export function domainUnits(work, lv, d) {
  const D = LEVELS4[lv - 1] && LEVELS4[lv - 1].d[d];
  if (!D) return 0;
  return (tapOf(work, lv, d) != null ? 1 : 0) + (slideOf(work, lv, d) != null ? 1 : 0)
    + (fieldsOf(D).every((p) => raw(work, lv, d, p[0]).trim()) ? 1 : 0);
}
export const levelUnits = (work, lv) => [0, 1, 2, 3].reduce((n, d) => n + domainUnits(work, lv, d), 0);

/** Where a founder picks up a level: the first move not yet done, else the credo. */
export function firstStep(work, lv) {
  const L = LEVELS4[lv - 1];
  for (let d = 0; d < 4; d++) {
    if (tapOf(work, lv, d) == null) return STEPS4.findIndex((s) => s[0] === d && s[1] === 'tap');
    if (slideOf(work, lv, d) == null) return STEPS4.findIndex((s) => s[0] === d && s[1] === 'slide');
    if (!fieldsOf(L.d[d]).every((p) => raw(work, lv, d, p[0]).trim())) return STEPS4.findIndex((s) => s[0] === d && s[1] === 'formula');
  }
  return STEPS4.length - 1;
}

/** A line with the founder's words in it. {t} the tap, {s} the slider value,
 *  {w} its word, {key} a field of the sentence. A gap shows as a blank. */
export function fill(tpl, work, lv, d) {
  const D = LEVELS4[lv - 1].d[d], v = slideOr(work, lv, d), t = tapOf(work, lv, d);
  return tpl.replace(/\{(\w+)\}/g, (_, k) => {
    const x = k === 't' ? (t == null ? '' : D.t.o[t])
      : k === 's' ? (D.s.raw || (typeof D.s.w === 'function' && !D.s.sfx) ? wordOf(D.s, v) : `${v}${D.s.sfx || ''}`)
      : k === 'w' ? wordOf(D.s, v) : raw(work, lv, d, k);
    return String(x).trim() ? `<mark>${esc(x)}</mark>` : '<mark class="blank">____</mark>';
  });
}
/** Strong in this domain, from the slider (some read better high, some low). */
export function strong(work, lv, d) {
  const D = LEVELS4[lv - 1].d[d], r = (slideOr(work, lv, d) - D.s.min) / (D.s.max - D.s.min);
  return D.s.up ? r >= 0.5 : r <= 0.4;
}
/** The four lines after a domain. */
export function lines4(work, lv, d) {
  const D = LEVELS4[lv - 1].d[d];
  return [['Where you were', 'Admit it.', fill(D.fb[0], work, lv, d)], ['Where you struggle', 'Don’t fight it.', fill(D.fb[1], work, lv, d)],
    ['Where you shine', 'Don’t ignore it.', fill(strong(work, lv, d) ? D.fb[2][0] : D.fb[2][1], work, lv, d)], ['What you will do', 'Exactly.', fill(D.fb[3], work, lv, d)]];
}
/** The domain's sentence, as written. */
export function sentence(work, lv, d) {
  return LEVELS4[lv - 1].d[d].f.map((p) => (typeof p === 'string' ? esc(p)
    : raw(work, lv, d, p[0]).trim() ? `<mark>${esc(raw(work, lv, d, p[0]))}</mark>` : '<mark class="blank">____</mark>')).join('');
}

/** The chapter reading: the four domains across the chapter's levels (0–1,
 *  from the founder's own sliders), the lowest and the highest, the exact
 *  moves of its last level, and the North Star sentence for what comes next. */
export function reading(work, ci) {
  const C = CHAPTERS4[ci], sum = [0, 0, 0, 0];
  for (const i of C.lv) {
    const lv = i + 1;
    LEVELS4[i].d.forEach((D, d) => { const r = (slideOr(work, lv, d) - D.s.min) / (D.s.max - D.s.min); sum[d] += D.s.up ? r : 1 - r; });
  }
  const scores = sum.map((s) => s / C.lv.length);
  const lo = scores.indexOf(Math.min(...scores)), hi = scores.indexOf(Math.max(...scores));
  const last = C.lv[C.lv.length - 1] + 1;
  return { chapter: C, scores, lo, hi, last,
    exact: LEVELS4[last - 1].d.map((D, d) => fill(D.fb[3], work, last, d)),
    star: sentence(work, last, 0), next: CHAPTERS4[ci + 1] || null };
}

/* ── The one-question flow (Phase 3) ──────────────────────────────────────
 * One field on screen. Per domain: tap, slide, one screen per blank (a day
 * is chosen from chips), the day if the sentence has none, then "Done when"
 * with how sure, then the four lines. From Level 02 a level opens with last
 * week's four actions (Done, Partly, Not yet). After the four domains: the
 * week, as four actions; after 05, 09 and 12, the chapter reading and one
 * action carried forward. Progress (UNITS) still counts only the tap, the
 * slide and the Version 4 sentence, so no founder already ahead is held back. */
export const planOf = (lv, d) => PLAN4[`${lv}.${d}`] || null;
/** The field that holds the action's day: the added `on`, or one of the sentence. */
export const dayKeyOf = (lv, d) => { const p = planOf(lv, d); return p && p.on ? 'on' : (p && p.dayKey) || 'day'; };
const DAYISH = ['day', 'when', 'on'];
/** Every screen of a level, in order: [domain, kind, key]. Domain -1: the
 *  whole level. Kinds: got, tap, slide, blank, day, done, lines, week,
 *  reading, carry, carryday. */
export function stepsOf(lv) {
  const L = LEVELS4[lv - 1];
  if (!L) return [];
  const out = [];
  if (lv > 1) for (let d = 0; d < 4; d++) out.push([d, 'got']);
  L.d.forEach((D, d) => {
    const dk = dayKeyOf(lv, d), p = planOf(lv, d);
    out.push([d, 'tap'], [d, 'slide']);
    for (const [k] of fieldsOf(D)) out.push([d, k === dk && DAYISH.includes(k) ? 'day' : 'blank', k]);
    if (p && p.on) out.push([d, 'day', 'on']);
    out.push([d, 'done'], [d, 'lines']);
  });
  out.push([-1, 'week']);
  if (CLOSES[lv] != null) out.push([-1, 'reading'], [-1, 'carry'], [-1, 'carryday']);
  return out;
}
const filled = (work, lv, d, k) => raw(work, lv, d, k).trim() !== '';
/** Has the founder answered this screen? Screens that only show are always done. */
export function stepDone(work, lv, s) {
  const [d, kind, k] = s;
  if (kind === 'got') return raw(work, lv - 1, d, 'got') !== '';
  if (kind === 'tap') return tapOf(work, lv, d) != null;
  if (kind === 'slide') return slideOf(work, lv, d) != null;
  if (kind === 'blank' || kind === 'day') return filled(work, lv, d, k);
  if (kind === 'done') return raw(work, lv, d, 'sure') !== '';
  if (kind === 'carry') return filled(work, lv, 'r', 'carry');
  if (kind === 'carryday') return filled(work, lv, 'r', 'on');
  return true;
}
/** Where a founder picks up a level: the first screen not yet answered, else the week. */
export function firstOf(work, lv) {
  const S = stepsOf(lv), i = S.findIndex((s) => !stepDone(work, lv, s));
  return i >= 0 ? i : S.findIndex((s) => s[1] === 'week');
}
/** A template with the founder's words, and its paper lines (____) drawn as lines. */
function fillPaper(tpl, work, lv, d) {
  return fill(String(tpl).replace(/_{4}/g, '\u0001'), work, lv, d).replace(/\u0001/g, '<span class="ln" aria-label="to fill in"></span>');
}
/** The same, as plain text for a heading: no marks, a gap as "…". */
export const plainOf = (tpl, work, lv, d) => fill(tpl, work, lv, d).replace(/<mark class="blank">____<\/mark>/g, '…').replace(/<\/?mark[^>]*>/g, '');
/** "Done when", with the founder's words. */
export const doneOf = (work, lv, d) => { const p = planOf(lv, d); return p ? fill(p.done, work, lv, d) : ''; };
/** What the founder keeps: the title, and its lines with their words. */
export function takeOf(work, lv, d) {
  const p = planOf(lv, d);
  return p ? { title: plainOf(p.take[0], work, lv, d), lines: p.take.slice(1).map((l) => fillPaper(l, work, lv, d)) } : null;
}
/** The smaller step, after "Partly" or "Not yet". */
export const notyetOf = (work, lv, d) => { const p = planOf(lv, d); return p ? fill(p.notyet, work, lv, d) : ''; };
/** How sure the founder was, 0 to 100, or null. */
export const sureOf = (work, lv, d) => { const v = raw(work, lv, d, 'sure'); return v === '' ? null : Math.max(0, Math.min(100, Number(v))); };
/** Sunday's answer about an action of level lv: 0 Done, 1 Partly, 2 Not yet, or null. */
export const gotOf = (work, lv, d) => { const v = raw(work, lv, d, 'got'); return v === '' ? null : Number(v); };
export const GOT = ['Done', 'Partly', 'Not yet'];

/** Actions done against actions promised, and how the estimates compare:
 *  "too hopeful", "about right" or "too careful" (the Planner's three words).
 *  Read only from the founder's own Sunday answers and their "how sure". */
export function tally(work, lvs) {
  let n = 0, done = 0, part = 0, not = 0, sure = 0, sn = 0;
  for (const lv of lvs) for (let d = 0; d < 4; d++) {
    const g = gotOf(work, lv, d);
    if (g == null) continue;
    n += 1; if (g === 0) done += 1; else if (g === 1) part += 1; else not += 1;
    const s = sureOf(work, lv, d);
    if (s != null) { sure += s; sn += 1; }
  }
  const real = n ? (done + part / 2) / n : null, hoped = sn ? sure / sn / 100 : null;
  const est = real == null || hoped == null ? null : hoped - real > 0.15 ? 'too hopeful' : real - hoped > 0.15 ? 'too careful' : 'about right';
  return { n, done, part, not, real, hoped, est };
}
/** The levels whose actions a chapter reading counts: those checked since the
 *  last reading (Level 05's four are checked when Level 06 opens). */
export function countedFor(ci) {
  const last = CHAPTERS4[ci].lv[CHAPTERS4[ci].lv.length - 1] + 1, from = ci ? CHAPTERS4[ci - 1].lv[CHAPTERS4[ci - 1].lv.length - 1] + 1 : 1;
  const out = [];
  for (let lv = from; lv < last; lv++) out.push(lv);
  return out;
}
/** One sentence of Alexandru's for each reading, word for word from his book
 *  Worth Building (public/library/worth-building.pdf). */
export const READ_QUOTES = [
  { q: 'The way you run your day is the way you run your company. If you avoid your numbers at home, you will avoid them at work.', src: 'Worth Building · Business is life, and life is business' },
  { q: 'Stick to what you do best, and serve people. The money follows the service, not the other way round.', src: 'Worth Building · The 50/50 rule' },
  { q: 'I believe each of us has been given talents, and that we are meant to multiply them, not bury them.', src: 'Worth Building · A word from Alexandru' },
];
/** The action a chapter reading carried forward, as [level, domain], or null. */
export function carriedFrom(work, lv) {
  const v = raw(work, lv, 'r', 'carry');
  const m = /^(\d+)\.(\d)$/.exec(v);
  return m && LEVELS4[+m[1] - 1] ? [+m[1], +m[2]] : null;
}
/** The founder's Blueprint: the eight sections, each with its domains, the
 *  founder's own sentence and what they keep. */
export function blueprint(work) {
  return BLUEPRINT4.map((S) => ({ ...S, items: LEVELS4.flatMap((L) => L.d.map((D, d) => ({ L, D, d, p: planOf(L.n, d) })))
    .filter((x) => x.p && x.p.bp === S.k)
    .map(({ L, D, d, p }) => ({ lv: L.n, d, name: D.name, topic: p.topic, word: L.word,
      started: fieldsOf(D).some(([k]) => filled(work, L.n, d, k)), sentence: sentence(work, L.n, d), take: takeOf(work, L.n, d) })) }));
}
