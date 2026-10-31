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
