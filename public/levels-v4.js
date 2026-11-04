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
/** A blank that needs a real name, not “someone”. */
const NOT_NAME = '\\b(someone|somebody|anyone|everyone|a person|the team)\\b';

/* ── The twelve levels, Option C ─────────────────────────────────────────
 * Each domain: a tap, a slide, one sentence, then four lines back.
 * t = tap {q, o[], why[]}; s = slide {q, min, max, step, d, w (words or fn), e[ends], up (true: higher is better), sfx, cost(v, w)}
 * f = sentence parts, fields as [key, hint, example]; ck = a check on a blank; tool = the framework it fills;
 * fb = [admit, struggle, [shine if strong, shine if not], exactly]; tokens {t} {s} {w} {field}
 * x = the example founder: [tap index, slide value]. sz = the size the
 * domain's examples speak to (start, solo, team, company): from Level 02
 * they alternate, so every size meets itself across the levels (AGENTS.md 12). */
export const LEVELS4 = [
{ n: 1, promise: 'One old rule tested, one task handed over, your enough as a number, three people asked to buy.', word: 'SEED', ch: 0, floor: 'Conviction · what you believe', title: 'What you believe', old: 'This is just who I am.', neu: 'What I believe was learned. It can be tested and renewed.',
  d: [
  { l: 'S', name: 'Settled', t: { q: 'Finish the sentence that runs your work: <em>“If I ___, then I’m worth something.”</em>', o: ['hit my numbers', 'work harder than everyone', 'never let anyone down', 'prove them wrong', 'get it perfect'],
      why: ['Numbers move with markets, seasons and luck. If your worth moves with them, every bad month becomes a verdict on you.',
        'Someone will always work longer. This rule has no finish line, so it never lets you rest.',
        'Someone is always let down: a client, your family, or you. The rule only chooses who.',
        'Then they still decide your week, even when they are not in the room.',
        'Perfect never ships. The rule keeps the work in your hands and off the market.'] },
    s: { q: 'Last month, how often did that rule decide your day?', min: 0, max: 10, step: 1, d: 5, w: DAYS, e: ['Never', 'Every day'], up: false,
      cost: (v, w) => (v === 0 ? 'Never: the rule is already quiet. Test it once anyway, on purpose.' : `The rule chose for you ${w}. Those are days you did not choose.`) },
    f: ['I am ', ['who', 'worth it, enough…', 'enough'], ' before I achieve anything. On ', ['day', 'which day', 'Thursday'], ' I will ', ['act', 'one thing the old rule forbids', 'take the evening off, phone in a drawer'], '.'],
    ck: { who: { ok: 'Good. That is who you are before any result.' },
      act: { words: 3, ok: 'Good: on {day} anyone could see you do it.', hint: 'Make it something someone could see you do. A few more words.' } },
    tool: 'The worth rule', x: [0, 8],
    fb: ['Last month the rule <mark>If I {t}, then I’m worth something</mark> ran your day {w}.', 'It was learned, so it can be tested. Don’t argue with it. Test it once, on purpose.',
      ['It ran {w}, not every day. Part of your week is already free of it.', 'You named your rule in one sentence. That is the first lever, and you pulled it.'],
      'On {day} you will {act}, and write what really happened. You are {who} before you achieve anything.'] },
  { l: 'E', name: 'Entrust', t: { q: 'Finish it honestly: <em>“People usually ___.”</em>', o: ['let me down', 'do it worse than I would', 'need me to check everything', 'rise when they are trusted'],
      why: ['Expecting it, you hand over half a task and check every hour. Nobody can rise to a task they were never fully given.',
        'At first, maybe. But your way can be written down. A task you never hand over can never get better without you.',
        'Checking everything makes you the bottleneck and leaves them unsure. One agreed “done”, checked once, does more.',
        'That belief works. Now give it one real task this week.'] },
    s: { q: 'How much of last week’s work did you hold because “nobody else can do it right”?', min: 0, max: 100, step: 10, d: 50, sfx: '%', w: function (v) { return v >= 70 ? 'almost all of it' : v >= 40 ? 'a lot' : 'some'; }, e: ['None', 'All of it'], up: false,
      cost: (v) => (v === 0 ? 'None. Your week is already shared; keep it that way.' : `${v}% of last week stayed with you. Every hour of it came out of the work only you can do.`) },
    f: ['I hand ', ['task', 'one task', 'the weekly invoices'], ' to ', ['who', 'a name', 'Jordan'], ' on ', ['day', 'which day', 'Monday'], '. Done means ', ['done', 'what finished looks like', 'all sent by 5 pm'], '.'],
    ck: { task: { words: 2, ok: 'One task, named.', hint: 'Name the task so they would know exactly what it is.' },
      who: { not: '\\b(someone|somebody|anyone|a person|the team)\\b', ok: 'Good: a real name.', hint: 'A real name, so it can happen on the day.' },
      done: { words: 3, ok: 'Good: they will know when it is finished, and you check once.', hint: 'Say what finished looks like, so you only check once.' } },
    tool: 'Trust in steps', x: [1, 60],
    fb: ['About {s} of last week, you held work because nobody else could do it right.', 'You believe people usually {t}. Don’t fight the feeling. Test it in one small step.',
      ['Most of your week is already shared. Build on that.', 'You named one task to let go. That is where trust starts.'], 'On {day} you hand {task} to {who}. Done means {done}. You check once, not every hour.'] },
  { l: 'E', name: 'Enough', t: { q: 'Which money sentence did you hear most growing up?', o: ['There is never enough', 'Money is for greedy people', 'We don’t talk about money', 'Money proves you are someone', 'Work hard and it will come'],
      why: ['Then no amount will ever feel like enough, because you never set one. A number ends the chase.',
        'Then charging fairly feels wrong, and your prices stay low. Fair pay is how the business keeps serving.',
        'Silence keeps the numbers vague, and vague numbers turn every decision into a guess.',
        'Then every price is a test of your worth. Money is a tool; your worth is not on the invoice.',
        'Hard work with no number can run forever. Enough tells you when the work has done its job.'] },
    s: { q: 'Money in, fixed costs, what was left last month: how sure are you of all three?', min: 0, max: 10, step: 1, d: 4, w: SURE, e: ['Guessing', 'Exactly'], up: true,
      cost: (v, w) => (v >= 8 ? 'You know your numbers. Now give them a finish line.' : `You are ${w} about the three numbers. From a guess, you cannot tell when you have enough.`) },
    f: ['My enough is ', ['enough', 'an amount', '$4,200'], ' a month. On ', ['day', 'which day', 'Wednesday'], ' I will ', ['move', 'one money move', 'raise my rate for new clients to $75'], '.'],
    ck: { enough: { digit: true, ok: 'A number. Now money has a finish line.', hint: 'Enough is a number: write an amount, like $4,200.',
        note: 'A spreadsheet adds money in, costs and what was left in seconds. Deciding what is enough is yours.' },
      move: { words: 3, ok: 'Good: one move you can make on {day}.', hint: 'One money move you could make on the day: a few more words.' } },
    tool: 'Your enough, as a number', x: [0, 3],
    fb: ['You grew up with <mark>{t}</mark>, and you are {w} about your own numbers.', 'A guess becomes a number the day you open the statement. Don’t fight the fear; open it.',
      ['You know your numbers better than most guesses. Use them.', 'You wrote your enough as one number. Now money has a finish line.'], 'On {day} you will {move}. Your enough is {enough} a month: a plan, not your worth.'] },
  { l: 'D', name: 'Dignity', t: { q: 'When I ask someone to buy, I feel like I am…', o: ['begging', 'bothering them', 'showing off', 'helping'],
      why: ['Begging asks for a favour. An offer that helps gives one. The feeling comes from an old story, not from the offer.',
        'A short, clear ask takes a minute and leaves them free to say no. Not asking decides for them.',
        'Saying who you help is information, not pride. They cannot choose you if they do not know.',
        'That belief works. Now let three real asks prove it this week.'] },
    s: { q: 'In the last 30 days, how many times did you directly ask someone to buy or to book?', min: 0, max: 20, step: 1, d: 2, w: N('asks'), e: ['None', '20 or more'], up: true,
      cost: (v) => (v === 0 ? 'No direct asks in 30 days. If your offer helps, someone who needed it never heard about it.' : `${v} ${v === 1 ? 'ask' : 'asks'} in 30 days. Each one let a person decide. Three more this week.`) },
    f: ['My offer helps ', ['whom', 'who', 'café owners'], ' with ', ['prob', 'which problem', 'empty tables on weekday afternoons'], '. By ', ['day', 'which day', 'Friday'], ' I ask ', ['names', 'three names', 'Mia, Sam and the bakery on Main Street'], '.'],
    ck: { whom: { ok: 'Good: one kind of person.' },
      prob: { words: 3, ok: 'One problem, in the words they would use.', hint: 'Say the problem the way they would say it: a few more words.' },
      names: { names: 3, ok: 'Three names. Three real answers by {day}.', hint: 'That’s {n} of 3. Who else?' } },
    tool: 'Selling is serving', x: [1, 2],
    fb: ['{s} in 30 days, and asking feels like {t}.', 'That feeling decides how often you ask. Don’t fight it. Let three real answers speak louder.',
      ['That many asks takes courage. Keep the rhythm.', 'You can say who you help, in one line: {whom}, with {prob}.'], 'By {day} you ask {names}. Write what each one says, word for word.'] }] },

{ n: 2, promise: 'One event written as facts, one person asked instead of judged, your five numbers read, one customer signal tested.', word: 'VIEW', ch: 0, floor: 'Reading · how you read what happens', title: 'How you read it', old: 'I know what happened.', neu: 'I know what I saw. The rest is a story I can check.',
  d: [
  { l: 'V', name: 'Verify', t: { q: 'When something goes wrong, my first story is…', o: ['it’s my fault', 'they did it on purpose', 'it will all collapse', 'I’ll never get this right'],
      why: ['Sometimes it is, often only in part. Take all the blame before the facts, and you fix the wrong thing, fast.',
        'Few people plan to let you down; most are busy, unclear or stuck. Decide their intent before you ask, and you answer someone who isn’t there.',
        'One bad event is one event. The story turns a late payment into the end of the business, and you decide from panic, not from the numbers.',
        '“Never” is a story about the future, and nobody has facts about the future. What went wrong today has a cause you can find and change.'] },
    s: { q: 'Last week, how often did the story come before the facts?', min: 0, max: 10, step: 1, d: 5, w: DAYS, e: ['Never', 'Every time'], up: false,
      cost: (v, w) => (v === 0 ? 'Never: the facts came first. Keep it that way on the hardest day of the week.' : `${w === 'rarely' ? 'Only rarely' : w[0].toUpperCase() + w.slice(1)}, the story came first. Each time, you answered a story, not what happened.`) },
    f: ['The facts: ', ['facts', 'what a camera saw', 'two people read my plan and neither replied for a week'], '. My story: ', ['story', 'what I told myself', 'the idea is no good'], '. The truer reading: ', ['truer', 'what else could be true', 'they were busy, and I never asked them a question'], '.'],
    ck: { facts: { words: 4, not: '\\b(always|never|everyone|nobody|useless|hopeless|disaster|ruined)\\b', ok: 'Good: a camera could have filmed that.', hint: 'Only what a camera would have seen or heard: who did what, and when. No “always”, no verdict.' },
      story: { ok: 'Good: the story is on paper now, where you can look at it.' },
      truer: { words: 3, ok: 'Two readings now. One question will tell you which is true.', hint: 'One other reading that could also be true: a few more words.' } },
    tool: 'Facts, then story', x: [3, 6], sz: 'start',
    fb: ['Your first story is <mark>{t}</mark>, and it came before the facts {w}.', 'Stories are fast and feel true. Don’t fight that. Slow it down: facts first.',
      ['Most days you already see the facts first. That is a clear mind.', 'You wrote facts and story apart. That is the whole skill.'], 'Next time: facts “{facts}”, story “{story}”, and the truer reading, “{truer}”, before you act.'] },
  { l: 'I', name: 'Inquire', t: { q: 'When someone lets me down, I usually…', o: ['decide why, without asking', 'say nothing and remember', 'fix it myself', 'ask what happened'],
      why: ['The reason feels obvious, and it is a guess. People act on what they knew that day, and you never asked what that was.',
        'Silence feels kind, but you keep a score they cannot see. It comes out later, bigger, about something else.',
        'It gets done tonight, and it comes back next week. They never learn what you needed, so you stay the only one who can.',
        'That habit works. Now use it with the person you have been quietest with.'] },
    s: { q: 'Out of 10 conclusions you drew about people last week, how many did you check by asking?', min: 0, max: 10, step: 1, d: 3, w: OF10, e: ['None', 'All ten'], up: true,
      cost: (v) => (v >= 8 ? 'You check most of what you conclude. People feel that, and they tell you more.' : v === 0 ? 'None checked. All ten were guesses you acted on as if they were facts.' : `${v} of 10 checked. The other ${10 - v} are guesses you act on as if they were facts.`) },
    f: ['By ', ['day', 'which day', 'Tuesday'], ' I ask ', ['who', 'a name', 'Chris'], ': “When ', ['what', 'what happened', 'the designs came two days late'], ', what was going on for you?”'],
    ck: { who: { not: NOT_NAME, ok: 'Good: one real person, and one real question.', hint: 'A real name, so the question has somewhere to go.' },
      what: { words: 3, not: '\\b(always|never|lazy|careless|useless|again)\\b', ok: 'Good: what happened, without the verdict.', hint: 'Say what happened the way a camera saw it: no “always”, no “careless”.' } },
    tool: 'Ask before you assume', x: [0, 2], sz: 'solo',
    fb: ['When people let you down, you {t}. Last week you checked {w} of your conclusions.', 'Mind-reading feels quicker than asking. Don’t fight the habit. Ask once and compare.',
      ['You already check most of your conclusions. People feel that.', 'You chose one person and one real question. That is how trust is repaired.'], 'By {day} you ask {who}: “When {what}, what was going on for you?” Then you only listen.'] },
  { l: 'E', name: 'Evidence', t: { q: 'Most money decisions, I make…', o: ['by feel', 'by today’s bank balance', 'by a number I check', 'by avoiding them'],
      why: ['Feel is quick, and it moves with your mood. On a good day you spend, on a bad day you cut, and the business pays for both.',
        'Today’s balance does not know about next week’s payroll, the tax bill or the invoice still unpaid. It looks like a number and is half a picture.',
        'That works. Now make it five, read on the same day, so no number surprises you.',
        'An avoided decision still gets made: by the bank, by the deadline, by whoever calls first. Looking takes ten minutes; not looking costs you the choice.'] },
    s: { q: 'How many of these five do you know for last month: money in, money out, cash left, unpaid invoices, hours worked?', min: 0, max: 5, step: 1, d: 2, w: function (v) { return v + ' of 5'; }, e: ['None', 'All five'], up: true,
      cost: (v) => (v === 5 ? 'You know all five. Now read them on the same day every week.' : v === 0 ? 'None of the five. Every money decision this month is a guess.' : `You know ${v} of 5. The ${5 - v} you guess at ${5 - v === 1 ? 'is' : 'are'} where the next surprise comes from.`) },
    f: ['Every ', ['day', 'which day', 'Monday'], ' at ', ['time', 'what time', '8:30'], ' I read my five numbers. The one I fear most is ', ['fear', 'which one', 'cash left after payroll'], '.'],
    ck: { time: { digit: true, ok: 'Good: a time that can go in the calendar.', hint: 'Write a time, like 8:30, so it can go in the calendar.' },
      fear: { ok: 'Good: that one is read first, before the others can soften it.', note: 'Your bank app or a spreadsheet adds the five up in seconds. Reading them, and deciding what they ask of you, is yours.' } },
    tool: 'The five numbers', x: [1, 2], sz: 'team',
    fb: ['You decide {t}, and you know {w} of your numbers.', 'Numbers feel like a verdict when worth is shaky. Don’t fight that. Read them anyway; they are information.',
      ['You know most of your numbers. Now read them on a fixed day.', 'You named the number you fear most. That is the first one to read.'], 'Every {day} at {time} you read your five numbers, starting with {fear}.'] },
  { l: 'W', name: 'Watch signals', t: { q: 'When a customer goes quiet, I think…', o: ['they didn’t like it', 'I was too pushy', 'it’s timing', 'I don’t know, I never asked'],
      why: ['Maybe. Or they are busy, waiting on someone, or comparing. Silence has many reasons, and you picked the one that hurts most.',
        'One clear follow-up is service, not pressure. Stop after one message, and the people who meant yes never hear from you again.',
        'Sometimes true, and also the easiest story to leave unchecked. Ask, and “timing” becomes a date you can write down.',
        'That is the honest answer, and the start of the fix: one question to the next customer who goes quiet.'] },
    s: { q: 'Of your last 10 “interested” people, how many paid?', min: 0, max: 10, step: 1, d: 2, w: N('paid'), e: ['None', 'All ten'], up: true,
      cost: (v) => (v === 0 ? 'None of the ten paid. Their interest has not yet told you what they need to say yes.' : v === 10 ? 'All ten paid. Find out what they saw, and say more of it.' : `${v} of 10 paid. The other ${10 - v} know something about your offer that you have not asked them yet.`) },
    f: ['The signal I’m testing: when a customer ', ['does', 'does what', 'brings their finance team to the second call'], ', it means ', ['means', 'what you think', 'they are ready to sign this quarter'], '. I check by ', ['check', 'how', 'reading our last ten deals with the sales lead'], '.'],
    ck: { does: { words: 3, ok: 'Good: something you could see a customer do.', hint: 'Make it something you could see them do or hear them say: a few more words.' },
      check: { words: 3, ok: 'Good: one check, and then you know.', hint: 'Say how you will check it: a question you ask, or a count you make.' } },
    tool: 'Praise is interest, payment is evidence', x: [0, 3], sz: 'company',
    fb: ['Of 10 interested people, {s}. When one goes quiet, you think {t}.', 'Silence has many reasons. Don’t fight the worry. Test one signal this week.',
      ['Your interest turns into payment. Find out why, and do more of it.', 'You chose one signal to test. That is reading the market, not your mood.'], 'You watch for “{does}”, you believe it means {means}, and you check by {check}.'] }] },

{ n: 3, promise: 'One feeling named under the stress, one new first reaction, a storm rule written, one client’s fear in their own words.', word: 'CALM', ch: 0, floor: 'Emotion · what you feel, and do with it', title: 'What you feel', old: 'Feelings get in the way.', neu: 'Feelings carry information. I name them, then I decide.',
  d: [
  { l: 'C', name: 'Call it', t: { q: 'Under “stressed”, the real feeling is most often…', o: ['afraid', 'ashamed', 'angry', 'lonely', 'tired'],
      why: ['Fear is not in the way: it points at a risk. Write the risk in one line, and it becomes a problem you can plan for.',
        'Shame says “I am wrong”, when the fact is “this went wrong”. Keep the two apart, and you can fix the thing without hiding.',
        'Anger says a line was crossed. Name the line, and you can say it plainly tomorrow instead of loudly today.',
        'Lonely says you carry decisions nobody shares. That is information: one person to think out loud with changes the weight.',
        'Tired is not weakness; it is a limit. Decisions made past it cost the most, so move the decision, not the limit.'] },
    s: { q: 'How strong is it on most days?', min: 0, max: 10, step: 1, d: 6, w: [[3, 'calm'], [6, 'present'], [8, 'heavy'], [10, 'a storm']], e: ['Calm', 'Storm'], up: false,
      cost: (v, w) => (v <= 3 ? 'Calm most days. Name it anyway on the hard day: that is when it decides for you.' : `Most days it is ${w}. At that weight it chooses some of your replies before you do.`) },
    f: ['Under my ', ['surface', 'stress, anger…', 'stress'], ' is ', ['feeling', 'the real feeling', 'fear that next month will be empty'], '. When it comes, I ', ['help', 'one thing that helps', 'write the reply, wait an hour, then send it'], '.'],
    ck: { feeling: { words: 2, not: '^\\s*(stress|stressed|busy|fine|ok|okay|bad)\\s*$', ok: 'Good: the real word, under the cover word.', hint: 'Go one word deeper than “stressed”: afraid of what, angry at what?' },
      help: { words: 3, not: '\\b(breathe|breathing|walk|relax|meditate|calm down)\\b', ok: 'Good: a step in the work, before the decision.', hint: 'Make it a step in the work, before you decide: like “write the reply, wait an hour, then send it”.' } },
    tool: 'Name it to tame it', x: [0, 7], sz: 'solo',
    fb: ['Under the stress you mostly feel {t}, and most days it is {w}.', 'A named feeling loosens its grip. Don’t fight it. Name it, then decide.',
      ['It stays manageable most days. You have more steadiness than you think.', 'You found the feeling under the word. That is the hardest step.'], 'When {feeling} comes, you {help}. Then you decide, not before.'] },
  { l: 'A', name: 'Atmosphere', t: { q: 'Under pressure, the people around me see me…', o: ['snap', 'go silent', 'work alone', 'stay steady'],
      why: ['It passes in a minute for you and stays for weeks with them. Next time they bring the news later, when it costs more.',
        'Silence reads as anger, or as giving up. People fill it with their own story, and stop telling you things.',
        'It feels responsible, and it tells everyone the problem is too big for them. They watch instead of helping.',
        'That works, and people feel it. Now make it something they can count on: one sentence you always say first.'] },
    s: { q: 'How safe is it for someone to bring you bad news?', min: 0, max: 10, step: 1, d: 5, w: SAFE, e: ['Not safe', 'Safe'], up: true,
      cost: (v, w) => (v >= 8 ? 'Bad news is safe with you. You hear it early, while it is still cheap to fix.' : `On your own scale: “${w}”. What people are not sure they can say reaches you late, when it costs more.`) },
    f: ['Under pressure, I will ', ['will', 'what you’ll do', 'say “thank you for telling me” first'], ' instead of ', ['instead', 'what you do now', 'asking who did it'], '. I ask ', ['who', 'a name', 'Taylor'], ' to tell me when I slip.'],
    ck: { will: { words: 3, ok: 'Good: something people will see in the first five seconds.', hint: 'Make it something they could see or hear you do: a few more words.' },
      who: { not: NOT_NAME, ok: 'Good: one person who will tell you the truth.', hint: 'A real name: one person who sees you under pressure.' } },
    tool: 'The room’s weather', x: [0, 4], sz: 'team',
    fb: ['Under pressure you {t}, and bringing you bad news feels {w}.', 'People read your face before your plan. Don’t fight the pressure. Change the first five seconds.',
      ['People already feel safe telling you hard things. Protect that.', 'You chose one new first reaction. The room will notice in a week.'], 'You will {will} instead of {instead}, and {who} will tell you when you slip.'] },
  { l: 'L', name: 'Lag', t: { q: 'The decision I most often make in a storm', o: ['spending', 'pricing', 'hiring or firing', 'quitting a project', 'saying yes to everything'],
      why: ['Money spent to calm a feeling buys a few good hours. The bill arrives when the feeling has gone.',
        'A price cut made in fear is hard to take back. Customers remember the lower number long after the storm.',
        'Decisions about people touch salaries, families and the whole team. They deserve your calmest day, not your worst.',
        'Some projects should end, but not on the day they hurt most. Decide on a calm day, with the facts in front of you.',
        'Yes calms the moment and fills next month. The storm passes; the promises stay.'] },
    s: { q: 'When you are upset, how many hours do you wait before a big decision?', min: 0, max: 48, step: 2, d: 0, w: function (v) { return v === 0 ? 'none' : v + ' hours'; }, e: ['None', 'Two days'], up: true,
      cost: (v) => (v === 0 ? 'No wait at all: the feeling decides, and you sign.' : v >= 24 ? `${v} hours: long enough for the feeling to settle. Write it down, so it holds on the worst day.` : `${v} hours. A storm can outlast that, so the feeling may still be the one deciding.`) },
    f: ['When I feel ', ['feel', 'which feeling', 'cornered by the bank'], ' above 7 out of 10, I wait ', ['hours', 'how many hours', '72'], ' hours before I decide about ', ['about', 'what', 'cutting jobs'], '.'],
    ck: { feel: { not: '^\\s*(stress|stressed|bad|upset)\\s*$', ok: 'Good: a feeling you will recognise when it comes.', hint: 'Name the one you would recognise: panic, anger, fear, cornered…' },
      hours: { digit: true, ok: 'Good: a wait you can count down.', hint: 'Write a number of hours, like 24.' } },
    tool: 'The storm rule', x: [2, 0], sz: 'company',
    fb: ['In a storm you most often decide about {t}, and you wait {w} first.', 'The storm will come again. Don’t fight it. Decide your rule now, while you are calm.',
      ['You already wait before deciding. That is rare discipline.', 'You wrote a storm rule while calm. That is the lag.'], 'When you feel {feel} above 7, you wait {hours} hours before you decide about {about}.'] },
  { l: 'M', name: 'Meet their fear', t: { q: 'My clients’ biggest fear is…', o: ['wasting money', 'looking foolish', 'losing time', 'being let down again', 'I don’t know'],
      why: ['Maybe. “Money” is often the word for a deeper fear: that it won’t work for them. Only their own words tell you which.',
        'A strong guess for anything new. If it is right, make the first step small and private. Ask one client to be sure.',
        'Then speed is what you sell, more than features. Check it with one question before you rewrite anything.',
        'Then they have been burned before, and proof matters more than promises. Ask what happened last time.',
        'That is honest, and the most useful answer here: the next step is one question, not a guess.'] },
    s: { q: 'How sure are you, from their own words?', min: 0, max: 10, step: 1, d: 3, w: SURE, e: ['Guessing', 'Their exact words'], up: true,
      cost: (v, w) => (v >= 8 ? 'You have their words. Use them in the first line of your next message.' : `You said “${w}”. A message built on a guess speaks to a fear they may not have.`) },
    f: ['My clients fear ', ['fear', 'their fear', 'trying one more thing that eats their evening'], ' and hope for ', ['hope', 'their hope', 'one calm hour with the children'], '. By ', ['day', 'which day', 'Thursday'], ' I ask ', ['who', 'a client', 'Emma'], ' in their words.'],
    ck: { fear: { words: 2, ok: 'Your guess, on paper. Now check it.', hint: 'Say their fear the way they would: a few words.' },
      who: { not: NOT_NAME, ok: 'Good: one real person to ask by {day}.', hint: 'A real name: someone who bought, tried it, or has the problem.' } },
    tool: 'Fear and hope, in their words', x: [4, 2], sz: 'start',
    fb: ['You think your clients fear {t}, and you are {w}.', 'People feel first and explain later. Don’t guess. Ask, and write their words.',
      ['You already know their fear in their words. Speak to it.', 'You named their fear and their hope. That is the start of every good message.'], 'By {day} you ask {who}. Then you speak to their fear of {fear} and their hope for {hope}, honestly.'] }] },

{ n: 4, promise: 'One if–then plan kept, one clear ask with a date, your hour priced, a weekly selling hour booked.', word: 'STEP', ch: 0, floor: 'Deeds · how you manage action', title: 'What you do', old: 'I’ll do it when I feel ready.', neu: 'I decide once, in advance, and the day carries me.',
  d: [
  { l: 'S', name: 'Set it in advance', t: { q: 'What breaks my plans most', o: ['messages', 'other people’s urgencies', 'my mood', 'perfectionism', 'tiredness'],
      why: ['Each message is small; together they take the morning. Answering at set times is a plan, not rudeness.',
        'Their urgent is not always your important. Decide in advance where their urgent goes, and your plan survives the day.',
        'Waiting to feel ready lets the mood choose. A plan made in advance does not ask how you feel.',
        'Perfect never starts on time. Decide in advance what “good enough for today” looks like, and stop there.',
        'Tired is real. Then put the hard plan where you are freshest, and decide now what you do when you are not.'] },
    s: { q: 'Out of 10 plans you made last week, how many did you keep?', min: 0, max: 10, step: 1, d: 5, w: OF10, e: ['None', 'All ten'], up: true,
      cost: (v) => (v >= 8 ? 'You keep most of your plans. Now make the hardest one automatic.' : v === 0 ? 'None kept. Every plan became a wish, and the week decided for you.' : `${v} of 10 kept. The other ${10 - v} became wishes, and the week decided for you.`) },
    f: ['When ', ['when', 'a moment', 'I sit down at 8, before the team arrives'], ', I will ', ['will', 'the action', 'plan the day’s three jobs'], '. If ', ['if', 'the obstacle', 'someone comes in with a question'], ' shows up, then I ', ['then', 'your answer', 'say “at 9, let’s talk then”'], '.'],
    ck: { when: { words: 3, ok: 'Good: a moment you will recognise when it comes.', hint: 'Make it a moment you can recognise: a time, or something that happens every day.' },
      then: { words: 3, ok: 'Good: the hard choice is already made.', hint: 'Write exactly what you do then: a few more words.' } },
    tool: 'If–then plan', x: [1, 4], sz: 'team',
    fb: ['{t} break your plans, and you kept {w} of them last week.', 'Willpower runs out by noon. Don’t fight it. Decide in advance.',
      ['You keep most of your plans. Now make the hard one automatic.', 'You wrote an if–then for your obstacle. That plan works on tired days too.'], 'When {when}, you {will}. If {if}, then you {then}.'] },
  { l: 'T', name: 'Tell it clearly', t: { q: 'My frustration with people is usually that they…', o: ['don’t finish', 'do it differently', 'don’t tell me', 'wait for me'],
      why: ['Finished needs a finish line. If “done” was never described, they stopped where it looked done to them.',
        'If the way matters, write it down. If only the result matters, describe the result and let the way be theirs.',
        'People tell you when they know you want to hear it, and when. Say when you want an update, and what it should say.',
        'Waiting is often what checking everything taught them. Say what they may decide alone, and they stop waiting.'] },
    s: { q: 'Out of 10 requests you made last week, how many had a clear “done” and a date?', min: 0, max: 10, step: 1, d: 3, w: OF10, e: ['None', 'All ten'], up: true,
      cost: (v) => (v >= 8 ? 'Your asks are clear. Keep the date in every one.' : v === 0 ? 'None had both. Every request left people to guess, and guesses come back as rework.' : `${v} of 10 had both. The other ${10 - v} left people to guess, and guesses come back as rework.`) },
    f: ['I ask ', ['who', 'a name', 'Andrea'], ' for ', ['what', 'what', 'the review of our twelve suppliers'], ' by ', ['when', 'a date', 'Friday noon'], '. Done looks like ', ['done', 'done', 'one page: each supplier, its cost, its risk, keep or change'], '.'],
    ck: { who: { not: NOT_NAME, ok: 'Good: one owner.', hint: 'A real name, so the ask has one owner.' },
      done: { words: 4, ok: 'Good: they can check it themselves before they hand it over.', hint: 'Describe what finished looks like, so they can check it: a few more words.' } },
    tool: 'What, by when, done', x: [0, 3], sz: 'company',
    fb: ['You get frustrated when people {t}, and {w} of your requests were clear.', 'A frustration is often a request you never made. Don’t fight it. Make the ask clear.',
      ['Your asks are mostly clear. Keep the date in every one.', 'You wrote one ask with a date and a “done”. Watch what changes.'], 'You ask {who} for {what} by {when}. Done looks like {done}.'] },
  { l: 'E', name: 'Essential first', t: { q: 'Where my hours go that are not mine', o: ['admin', 'messages', 'fixing others’ work', 'low-paid jobs'],
      why: ['Admin feels productive because it is busy. Priced at your hour, it is often the most expensive work you do.',
        'Each reply feels urgent and takes two minutes. Forty of them are an afternoon, paid at your rate.',
        'Fixing it yourself is quick today. It also teaches them it will be fixed, so it comes back.',
        'A low-paid job fills the hour you needed for a better one. The real price is the work you had no time to win.'] },
    s: { q: 'Hours a week on work someone cheaper could do', min: 0, max: 40, step: 1, d: 10, w: N('hours'), e: ['None', '40 hours'], up: false,
      cost: (v) => (v === 0 ? 'None. Every hour you work is worth your price. Guard that.' : `${v} ${v === 1 ? 'hour' : 'hours'} a week. Multiply by your hour’s price: that is what this cheap work really costs you.`) },
    f: ['My hour is worth ', ['hour', 'enough ÷ hours you want', '$30'], '. First, every day: ', ['first', 'your one priority', 'one conversation with a possible customer'], '. I hand back ', ['back', 'one task', 'the social media posts'], '.'],
    ck: { hour: { digit: true, ok: 'A price. Now every task has a cost.', hint: 'Write an amount, like $30: the money you want, divided by the hours you want to work.',
        note: 'A calculator divides in a second. Deciding which hours are worth your price is yours.' },
      first: { words: 3, ok: 'Good: the work only you can do, first.', hint: 'Name the one thing, so you know it when you see it: a few more words.' } },
    tool: 'Price your hour', x: [0, 12], sz: 'start',
    fb: ['{s} a week go to {t}.', 'Busy feels like progress. Don’t fight that. Put a price on the hour.',
      ['Few of your hours leak. Guard the first one of the day.', 'You priced your hour. Every task now has a cost.'], 'Your hour is worth {hour}. First comes {first}. You hand back {back}.'] },
  { l: 'P', name: 'Pace', t: { q: 'I look for clients…', o: ['only when it’s empty', 'when I feel brave', 'at a fixed time each week', 'never, they find me'],
      why: ['When it is empty, it is already late: buyers take time to decide, so the gap arrives before the new work does.',
        'Brave comes and goes. A fixed hour does not ask how you feel; it arrives on Tuesday at 9.',
        'That works. Now count how many conversations the hour holds, and keep the number.',
        'Until they don’t. Referrals are a gift you cannot schedule; a selling hour is a choice you can.'] },
    s: { q: 'Buyer conversations per week right now', min: 0, max: 20, step: 1, d: 1, w: N('a week'), e: ['None', '20 a week'], up: true,
      cost: (v) => (v === 0 ? 'None this week. Next month’s work starts in this week’s conversations, so next month is open.' : `${v} ${v === 1 ? 'conversation' : 'conversations'} a week. Next month’s work comes from these; when they stop, next month empties quietly.`) },
    f: ['Every ', ['day', 'which day', 'Tuesday'], ' at ', ['time', 'what time', '9:00'], ' I talk with ', ['n', 'how many', '3'], ' potential buyers. Everyone hears from me twice.'],
    ck: { time: { digit: true, ok: 'Good: a time that can go in the calendar.', hint: 'Write a time, like 9:00.' },
      n: { digit: true, ok: 'Good: a number small enough to keep every week.', hint: 'Write a number, like 3.' } },
    tool: 'A selling rhythm', x: [0, 1], sz: 'solo',
    fb: ['You look for clients {t}, about {s}.', 'Delivery fills every free hour and the pipeline empties quietly. Don’t fight it. Book the hour.',
      ['You already have a rhythm. Keep the number small enough to keep.', 'You set a day, a time and a number. That is a rhythm.'], 'Every {day} at {time} you talk with {n} potential buyers, and everyone hears from you twice.'] }] },

{ n: 5, promise: 'One dated proof of who you are becoming, one person thanked specifically, one number read, three clients asked for their words.', word: 'FACT', ch: 0, floor: 'Outcome · what your results make of you', title: 'What you became', old: 'Results decide who I am.', neu: 'Results are feedback on who I am becoming.',
  d: [
  { l: 'F', name: 'Fruit is feedback', t: { q: 'The proof I see most since Level 01', o: ['I rest without guilt', 'I decide faster', 'I ask for money', 'I stay calmer', 'not yet'],
      why: ['That is real, and the old rule fought it. Write the day it happened, so a hard week cannot erase it.',
        'Faster decisions are proof that the facts come first now. Date one, and write what you decided.',
        'Asking for money was the old rule’s favourite “no”. Write the date and the amount: that is proof.',
        'Calm is easy to forget once it is normal. Write down one day it held under pressure.',
        'Not yet is honest, and proof is often smaller than you expect. Look for one thing the old you would not have done.'] },
    s: { q: 'How much do you believe your new sentence from Level 01 today?', min: 0, max: 10, step: 1, d: 6, w: [[3, 'a little'], [6, 'half'], [8, 'mostly'], [10, 'fully']], e: ['Not at all', 'Fully'], up: true,
      cost: (v, w) => (v >= 7 ? 'You believe it more than half. The proof did that; keep adding to it.' : `Today: “${w}”. Belief follows proof, so the gap closes one dated example at a time.`) },
    f: ['I am becoming someone who ', ['who', 'who you are becoming', 'lets the leads decide, and backs them in front of the team'], '. My proof: ', ['proof', 'one dated example', '14 Nov, I stayed out of the pricing meeting and the team set the price'], '.'],
    ck: { who: { words: 3, ok: 'Good: something people could see you do.', hint: 'Make it something people could see you do: a few more words.' },
      proof: { words: 5, digit: true, ok: 'Good: dated, so it counts as evidence.', hint: 'Add the date and what you did, so it is evidence, not a feeling.' } },
    tool: 'Identity from evidence', x: [1, 6], sz: 'company',
    fb: ['Since Level 01: {t}. You believe your new sentence {w}.', 'Old identities fade slowly. Don’t fight that. Keep collecting proof.',
      ['You believe it more than half. Proof did that.', 'You wrote one dated proof. One is how every identity starts.'], 'You are becoming someone who {who}. Proof: {proof}. Add one more this week.'] },
  { l: 'A', name: 'Applaud', t: { q: 'When people do well, I…', o: ['rarely say it', 'say a quick thanks', 'name exactly what they did', 'pay them, that’s enough'],
      why: ['Silence after good work reads as “nobody noticed”. People stop doing what nobody notices.',
        'Polite, and soon forgotten. They know you are pleased, not what to do again.',
        'That works: they know what to repeat. Now add what it changed, for a customer or for the business.',
        'Pay is the agreement. Being seen is what makes someone go further than the agreement.'] },
    s: { q: 'Specific thanks you gave last week', min: 0, max: 10, step: 1, d: 1, w: N('given'), e: ['None', 'Ten'], up: true,
      cost: (v) => (v === 0 ? 'None last week. The good work happened anyway; next week, nobody knows to repeat it.' : `${v === 1 ? 'One' : v} last week. Each one told someone exactly what to do again.`) },
    f: ['I thank ', ['who', 'a name', 'Sam'], ' for ', ['what', 'what they did', 'writing down every step where the first version got stuck'], '. It changed ', ['changed', 'what changed', 'the sign-up: two steps instead of five'], '.'],
    ck: { what: { words: 4, not: '\\b(everything|all your help|being great|hard work)\\b', ok: 'Good: they will know exactly what to repeat.', hint: 'Name the exact thing they did, not “everything”: a few more words.' },
      changed: { words: 3, ok: 'Good: now they know why it mattered.', hint: 'Say what it changed: for a customer, the money or the week.' } },
    tool: 'Name the win', x: [1, 1], sz: 'start',
    fb: ['When people do well, you {t}. Last week: {s}.', 'People repeat what gets noticed. Don’t wait for big wins. Name the small ones.',
      ['You already name wins. Make them more specific.', 'You named one win and what it changed. That is how people grow.'], 'You thank {who} for {what}, and tell them it changed {changed}.'] },
  { l: 'C', name: 'Count', t: { q: 'The one number that tells the truth now', o: ['cash left', 'money in', 'profit per job', 'hours worked', 'new clients'],
      why: ['A good truth number: it tells you how long you can keep going. Watch what moved it, not only where it ended.',
        'Money in shows demand. It can rise while profit falls, so read it with one question: what did it cost to get?',
        'The sharpest of the five: it shows which work pays, and which only keeps you busy.',
        'Hours show what the business costs you. When they rise and money in does not, a price or a habit is wrong.',
        'New clients show that people still choose you. Read it next to who came back: keeping a client costs less than finding one.'] },
    s: { q: 'Weeks in a row you have read it', min: 0, max: 12, step: 1, d: 2, w: N('weeks'), e: ['Never', '12 weeks'], up: true,
      cost: (v) => (v === 0 ? 'Not read yet. A number you never read can only surprise you.' : v >= 4 ? `${v} weeks in a row. You see a change coming weeks before it lands.` : `${v} ${v === 1 ? 'week' : 'weeks'} in a row. At four, you start to see the trend, not just the week.`) },
    f: ['Every ', ['day', 'which day', 'Monday'], ' I read ', ['num', 'the number', 'profit per job'], '. When it misses, I question ', ['belief', 'the belief behind it', 'my fear of quoting high'], ', not only the tactic.'],
    ck: { num: { ok: 'One number. Read it every week.', note: 'Your bank or a spreadsheet gives you the number in seconds. Deciding what to change when it misses is yours.' },
      belief: { words: 3, ok: 'Good: now a miss teaches you something about you, not only about the market.', hint: 'Name a belief, like “my fear of quoting high”: a few more words.' } },
    tool: 'One true number', x: [2, 2], sz: 'solo',
    fb: ['Your truth number is {t}, read {s} in a row.', 'A missed number is information, not a verdict. Don’t fight it. Ask what belief sits behind it.',
      ['You read it every week. That is leadership by evidence.', 'You chose one number. One, read weekly, beats ten read never.'], 'Every {day} you read {num}. When it misses, you question {belief}.'] },
  { l: 'T', name: 'Testimony', t: { q: 'Why clients really choose me (best guess)', o: ['price', 'trust', 'speed', 'results', 'I don’t know'],
      why: ['If price is the reason, the next cheaper offer takes them. Ask: it is often something you have not noticed.',
        'Trust is a strong reason and a vague word. Their words say what built it: you called back, you told the truth.',
        'Then say it in the words they use, like “answered the same day”. Ask three clients to be sure.',
        'Results sell best in their numbers, not yours. Ask what changed for them, and by how much.',
        'Honest, and the best start: three clients can tell you this week.'] },
    s: { q: 'Testimonials you have in writing', min: 0, max: 20, step: 1, d: 1, w: N('in writing'), e: ['None', '20'], up: true,
      cost: (v) => (v === 0 ? 'None in writing. Every buyer has to take your word for it.' : `${v === 1 ? 'One' : v} in writing. Each one is a client speaking for you while you work.`) },
    f: ['When ', ['when', 'their situation', 'a supplier lets them down before a busy weekend'], ', my clients want to ', ['want', 'what they want', 'have one team that just shows up'], ', so they can ', ['so', 'the result', 'open on Friday without a crisis'], '.'],
    ck: { when: { words: 3, ok: 'Good: their situation, the way they would tell it.', hint: 'Describe the moment they come to you, as they would: a few more words.' },
      so: { words: 3, ok: 'Your guess, on paper. Three clients will tell you if it holds.', hint: 'Say the result they want, in their words: a few more words.' } },
    tool: 'Their words are your message', x: [1, 2], sz: 'team',
    fb: ['You think clients choose you for {t}, and you have {s}.', 'Your words sound like selling. Theirs sound like proof. Don’t write it yourself. Ask.',
      ['You have real proof. Put it where buyers decide.', 'You wrote their sentence. Now ask three clients to confirm it.'], 'When {when}, they want to {want}, so they can {so}. You ask three clients by Friday.'] }] },

{ n: 6, promise: 'One postponed conversation held, one talk where you listened more, one late payment asked for, one kind no said.', word: 'TALK', ch: 1, floor: 'Communication · the conversations you avoid', title: 'The conversations you avoid', old: 'If I say it, it will get worse.', neu: 'What is unsaid costs more every week.',
  d: [
  { l: 'T', name: 'Truth first', t: { q: 'The conversation I keep postponing is about…', o: ['money owed', 'a price', 'a person’s work', 'a partner', 'my own limits'],
      why: ['Unasked, the money stays theirs a little longer every week. Asking plainly is how the work you did gets finished.',
        'Every week at the old price is paid by you. One clear sentence, with a date, ends it.',
        'They cannot fix what nobody says. Silence lets them believe it is fine, and makes the later talk harder for both of you.',
        'Partners drift on what goes unsaid. One honest talk now costs less than a split later.',
        'Unsaid limits get crossed every week. Said once, kindly, they become something others can plan around.'] },
    s: { q: 'How many weeks have you postponed it?', min: 0, max: 26, step: 1, d: 4, w: N('weeks'), e: ['This week', 'Six months'], up: false,
      cost: (v) => (v === 0 ? 'Not postponed yet. Say it this week, while it is still small.' : `${v} ${v === 1 ? 'week' : 'weeks'}. Each week it waits, it costs more: in money, in rework, or in how hard the first sentence feels.`) },
    f: ['On ', ['day', 'which day', 'Monday'], ' I say to ', ['who', 'a name', 'Ben'], ': “I need to talk about ', ['about', 'the topic', 'how many hours we each give the idea'], '. What I see is ', ['see', 'the facts', 'I gave it 20 hours last week and you gave it 3'], '. What I need is ', ['need', 'your ask', 'ten hours a week from you until we launch'], '.”'],
    ck: { who: { not: NOT_NAME, ok: 'Good: one person, one conversation.', hint: 'A real name, so the talk has a day and a person.' },
      see: { words: 4, not: '\\b(always|never|lazy|useless|careless)\\b', ok: 'Good: facts they can agree with before you ask.', hint: 'Write what you saw, the way a camera would: no “always”, no verdict.' },
      need: { words: 3, ok: 'Good: a clear ask they can say yes to.', hint: 'Say what you need as something they can do: a few more words.' } },
    tool: 'See · Need · Ask', x: [3, 6], sz: 'start',
    fb: ['You have postponed a talk about {t} for {s}.', 'It feels safer to wait. It isn’t; the cost grows. Don’t fight the fear. Say the first sentence.',
      ['It’s only been {s}. Say it before it hardens.', 'You wrote the opening line. Most of the courage is in that line.'], 'On {day} you tell {who}: “What I see is {see}. What I need is {need}.”'] },
  { l: 'A', name: 'Ask, then listen', t: { q: 'In hard talks I usually…', o: ['defend', 'go quiet', 'explain too much', 'listen first'],
      why: ['Defending feels like protecting the truth. To them it sounds like not listening, so they push harder.',
        'Quiet without a question reads as a wall. Ask one thing, and the silence turns into listening.',
        'Every extra reason gives them one more thing to argue with. Say it once, then ask what they think.',
        'That works. Now bring the question that opens them up, and let the silence do the rest.'] },
    s: { q: 'In your last hard talk, how much of the time did you speak?', min: 0, max: 100, step: 10, d: 70, sfx: '%', w: function (v) { return v > 60 ? 'most of it' : v > 40 ? 'half' : 'less than half'; }, e: ['None', 'All of it'], up: false,
      cost: (v) => (v === 0 ? 'You hardly spoke. Add one open question, so they know you were listening.' : v <= 40 ? `${v}%. You left room for them, and that is where you learn.` : `${v}% of the talk was you. Most of what you needed to hear stayed with them.`) },
    f: ['In my next talk with ', ['who', 'a name', 'Grace'], ' I ask “', ['ask', 'one open question', 'What would make this work better for you?'], '” and speak less than half.'],
    ck: { who: { not: NOT_NAME, ok: 'Good: one person, one talk.', hint: 'A real name, so the talk has someone in it.' },
      ask: { words: 4, not: '^\\W*(do|did|does|can|could|would|will|is|are|was|have|has|should)\\b', ok: 'Good: an open question. It can’t be answered with yes or no.', hint: 'Start with what, how or when, so it can’t be answered with yes or no.' } },
    tool: 'Two ears, one mouth', x: [2, 70], sz: 'solo',
    fb: ['In hard talks you {t}, and you spoke {w} of the time.', 'Talking feels like control. Don’t fight that urge. Ask, then count to three.',
      ['You already listen more than you speak. People trust that.', 'You chose one open question. Questions open people.'], 'With {who}, you ask “{ask}” and speak less than half.'] },
  { l: 'L', name: 'Late money', t: { q: 'The money talk I avoid is about…', o: ['an unpaid invoice', 'a discount I regret', 'extra work for free', 'a supplier price'],
      why: ['The invoice is the agreement; asking only reminds them of it. Waiting teaches them your due date is a suggestion.',
        'A discount given once becomes the price. Say when it ends, and what the price is from then.',
        'Free extras teach clients that more is always included. Name the extra and its price before you do the next one.',
        'A supplier price you never question rises quietly. One call, with your numbers ready, is part of buying well.'] },
    s: { q: 'How much money is stuck there?', min: 0, max: 10000, step: 250, d: 1500, w: function (v) { return '$' + v.toLocaleString('en-US'); }, e: ['$0', '$10,000'], up: false, raw: true,
      cost: (v, w) => (v === 0 ? 'Nothing stuck. Keep it that way: a deposit before you start, a date on every invoice.' : `${w} you earned is still in someone else’s account. Every week it waits, it gets harder to ask for.`) },
    f: ['By ', ['day', 'which day', 'Tuesday'], ' I write to ', ['who', 'a name', 'Parker Studio'], ': “Invoice ', ['inv', 'which invoice', '0412'], ' was due on ', ['due', 'the date', '1 Oct'], '. Please pay by ', ['by', 'a new date', '8 Nov'], '.”'],
    ck: { who: { not: NOT_NAME, ok: 'Good: one client, one message.', hint: 'The client’s name, so the message can go today.' },
      due: { digit: true, ok: 'Good: the date it was due, plainly.', hint: 'Write the date it was due, like 1 Oct.' },
      by: { digit: true, ok: 'Good: a date they can keep. “Soon” can’t stretch now.', hint: 'Write a date, like 8 Nov, so “soon” cannot stretch.' } },
    tool: 'The polite, firm invoice', x: [0, 4500], sz: 'team',
    fb: ['{w} are stuck in {t}.', 'Asking for your own money feels rude. It isn’t. Don’t fight the discomfort. Send it.',
      ['The amount is small. Clear it before it grows.', 'You wrote the message in one line. Firm and polite.'], 'By {day} you write to {who}: invoice {inv}, due {due}, please pay by {by}.'] },
  { l: 'K', name: 'Kind no', t: { q: 'The yes I should turn into a no', o: ['a client who isn’t a fit', 'a free favour', 'a discount request', 'a project I don’t believe in'],
      why: ['A client who is not a fit costs more hours and gets less from you. A kind no sends them where they will be served better.',
        'A favour that becomes a habit becomes unpaid work. Say what it would cost, and let them choose.',
        'A discount says the price was never real. Offer less work at a lower price, not the same work for less.',
        'Work you don’t believe in shows in the result. A kind no now is better than a half-hearted yes.'] },
    s: { q: 'Hours a week on work you should have said no to', min: 0, max: 30, step: 1, d: 6, w: N('hours'), e: ['None', '30 hours'], up: false,
      cost: (v) => (v === 0 ? 'None. Your yes still means something; keep it that way.' : `${v} ${v === 1 ? 'hour' : 'hours'} a week that the right clients, or your own people, did not get.`) },
    f: ['I say no to ', ['what', 'what', 'the custom build for a client outside our market'], ', kindly: “This isn’t the right fit for ', ['fit', 'what', 'what you need now'], '. What I suggest is ', ['suggest', 'an alternative', 'our standard package, or a partner who builds custom'], '.”'],
    ck: { what: { words: 2, ok: 'Good: one no, named, so you know it when it comes back.', hint: 'Name the request, so you know it when it comes back.' },
      suggest: { words: 3, ok: 'Good: they leave with somewhere to go.', hint: 'Offer something they can take instead: a few more words.' } },
    tool: 'The kind no', x: [0, 8], sz: 'company',
    fb: ['{s} a week go to {t}.', 'Every wrong yes is a no to the right client. Don’t fight the guilt. Offer an alternative.',
      ['Few hours leak to wrong yeses. Keep that line.', 'You wrote a kind no with an alternative. That protects them and you.'], 'You say no to {what}, and suggest {suggest}.'] }] },

{ n: 7, promise: 'Protected hours in your calendar, one task one step up the ladder, your price floor, one marketing hour booked.', word: 'HOUR', ch: 1, floor: 'Time · your week as an asset', title: 'Your week', old: 'There is never enough time.', neu: 'My hours have a price, and I decide who gets them.',
  d: [
  { l: 'H', name: 'Hold the line', t: { q: 'What eats my best hours', o: ['messages', 'meetings', 'delivery', 'admin', 'other people’s urgencies'],
      why: ['Messages are other people’s plans for your time. Read them at set times after your best hours; what is truly urgent will call.',
        'A meeting in your best hours costs twice: the hour, and the work it pushed out. Move meetings to the afternoon.',
        'Delivery pays this month. Selling and building pay the next ones, and they need the clear hours.',
        'Admin needs a hand, not your best mind. Batch it into one tired hour of the week.',
        'Their urgent becomes yours when you answer at once. Give it a later hour, and see how much of it can wait.'] },
    s: { q: 'Hours of deep, focused work last week', min: 0, max: 30, step: 1, d: 4, w: N('hours'), e: ['None', '30 hours'], up: true,
      cost: (v) => (v === 0 ? 'None. The work that grows the business only happened in the gaps.' : v >= 10 ? `${v} hours of real focus. Now guard when they happen, not only how many.` : `${v} ${v === 1 ? 'hour' : 'hours'}. Everything that grows the business had to fit in there.`) },
    f: ['My best hours are ', ['from', 'from', '8:00'], ' to ', ['to', 'to', '10:30'], ' on ', ['days', 'which days', 'Monday to Thursday'], '. Nothing goes there but ', ['what', 'what', 'client proposals and selling'], '.'],
    ck: { from: { digit: true, ok: 'A start time.', hint: 'Write a time, like 8:00.' }, to: { digit: true, ok: 'An end time. Now the hours have edges.', hint: 'Write a time, like 10:30.' },
      what: { words: 2, not: '\\b(everything|anything|stuff)\\b', ok: 'Good: one kind of work, guarded.', hint: 'Name the work that goes there, so you know what to turn away.' } },
    tool: 'Protected hours', x: [0, 4], sz: 'solo',
    fb: ['{t} eat your best hours. Last week you had {s} of deep work.', 'The urgent always shouts. Don’t fight it. Give it a later hour.',
      ['You protect real focus already. Now guard the start of the day.', 'You named your best hours. Now they have a guard.'], 'From {from} to {to}, {days}, only {what}.'] },
  { l: 'O', name: 'Own it', t: { q: 'The task I hold most is at this step', o: ['I do it', 'I do it, they watch', 'they do it, I check', 'they own it'],
      why: ['Then it rises and falls with your week. The next step is small: let someone watch you do it once.',
        'Watching teaches the how. The next step is the one that frees you: they do it, you check once.',
        'Good, as long as you check once, at an agreed time. Checking all the way through puts you back at the first step.',
        'That works. Now pick the next task, and start it at the bottom of the ladder.'] },
    s: { q: 'Hours a week that task takes', min: 0, max: 20, step: 1, d: 5, w: N('hours'), e: ['None', '20 hours'], up: false,
      cost: (v) => (v === 0 ? 'No hours on it. The ladder is already working; pick the next task.' : `${v} ${v === 1 ? 'hour' : 'hours'} a week. One step up gives some of them back; the top step gives back all of them.`) },
    f: ['By ', ['day', 'a date', '30 Nov'], ', ', ['task', 'the task', 'the weekly staff rota'], ' moves up one step: from “', ['from', 'the step now', 'I do it, they watch'], '” to “', ['to', 'the next step', 'they do it, I check'], '”.'],
    ck: { task: { words: 2, ok: 'One task, named.', hint: 'Name the task so anyone would know what it is.' },
      to: { words: 3, ok: 'Good: one step up, written down.', hint: 'Use the ladder’s words: “I do it, they watch”, “they do it, I check”, “they own it”.' } },
    tool: 'The delegation ladder', x: [1, 5], sz: 'team',
    fb: ['Your biggest task is at “{t}”, and it takes {s} a week.', 'Letting go feels like losing quality. Don’t fight that. Move up one step, not four.',
      ['It’s already shared. Finish the last step.', 'You moved one task up one step. That is how a team is built.'], 'By {day}, {task} moves from “{from}” to “{to}”.'] },
  { l: 'U', name: 'Unit cost', t: { q: 'What I sell most is priced…', o: ['by the hour', 'per job', 'as a package', 'by guess'],
      why: ['By the hour, the faster you get, the less you earn. Know your floor, then price the result.',
        'Per job works when you know what a job really costs. Count every hour once, and the price stands on a floor.',
        'Packages sell well. Check that each one sits above its floor, or your best seller is the one that loses money.',
        'A guess leaves out the hours you forget, so it lands low. One honest count fixes it.'] },
    s: { q: 'Hours a typical job really takes, start to finish', min: 0, max: 40, step: 1, d: 6, w: N('hours'), e: ['0', '40 hours'], up: false,
      cost: (v) => (v === 0 ? 'Count it on the next job: calls, changes and travel included.' : `${v} ${v === 1 ? 'hour' : 'hours'}, start to finish. Price a job on fewer hours than that, and the difference comes out of your margin.`) },
    f: ['One job costs me ', ['mat', 'materials and fees', '$1,200'], ' plus ', ['hrs', 'hours', '30'], ' hours × ', ['rate', 'my hour', '$85'], ' = ', ['total', 'the total', '$3,750'], '. I never sell it below ', ['floor', 'your floor', '$4,500'], '.'],
    ck: { total: { digit: true, ok: 'The real cost of one job.', hint: 'Write the total as an amount.',
        note: 'A calculator does this sum in a minute. Holding the line when a client pushes is the part only you can do.' },
      floor: { digit: true, ok: 'Your floor. Below it, you pay to work.', hint: 'Write the floor as an amount, above the total.' } },
    tool: 'The price floor', x: [1, 30], sz: 'company',
    fb: ['You price {t}, and a job really takes {s}.', 'Most underpricing hides in the hours you don’t count. Don’t fight the number. Write it down.',
      ['You know the real hours. Now price from them.', 'You wrote your price floor. Below it, you pay to work.'], 'One job costs you {total}. You never sell it below {floor}.'] },
  { l: 'R', name: 'Rhythm', t: { q: 'Where my buyers already gather', o: ['Instagram', 'LinkedIn', 'my neighbourhood', 'other businesses', 'I don’t know'],
      why: ['Then show your clients’ results there, every week at the same hour. Showing up steadily does more than one clever post.',
        'Then one useful post, or ten good comments, at a fixed hour each week. People buy from the names they keep seeing.',
        'Then the hour is on foot or on the phone: one shop, one board, one local group each week.',
        'Then the hour goes to the people who already serve your buyers. One introduction can do more than a month of posts.',
        'Then the first marketing hour is three questions to three buyers: where did you hear of me, what do you read, who do you ask?'] },
    s: { q: 'Hours a week you spend finding buyers', min: 0, max: 10, step: 1, d: 1, w: N('hours'), e: ['None', '10 hours'], up: true,
      cost: (v) => (v === 0 ? 'None. The buyers of next season have not heard of you yet.' : `${v} ${v === 1 ? 'hour' : 'hours'} a week. Kept at the same time every week, it adds up.`) },
    f: ['Every ', ['day', 'which day', 'Wednesday'], ' from ', ['from', 'from', '9:00'], ' to ', ['to', 'to', '10:00'], ' I ', ['act', 'one marketing action', 'post one tip for new parents and answer every reply'], ' on ', ['where', 'where', 'the local parents’ group'], '.'],
    ck: { act: { words: 3, ok: 'Good: one action you can repeat every week.', hint: 'Name one action you can repeat: a few more words.' },
      where: { not: '^\\s*(online|social media|everywhere|the internet)\\s*$', ok: 'Good: one place, where they already are.', hint: 'Name one place, not “online”: the group, the page, the street.' } },
    tool: 'One marketing hour', x: [2, 1], sz: 'start',
    fb: ['Your buyers gather on {t}, and you give it {s} a week.', 'Marketing done only when it’s empty comes too late. Don’t fight that. Fix the hour.',
      ['You give it real time. Make it the same hour every week.', 'You booked one hour with one action. That compounds.'], 'Every {day}, {from} to {to}, you {act} on {where}.'] }] },

{ n: 8, promise: 'Your gift named and one thing dropped, three clear client steps, three price levels, your offer in one line.', word: 'GOLD', ch: 1, floor: 'Value · your offer and its price', title: 'Your offer', old: 'I do a bit of everything.', neu: 'I am paid for what I do best, at a price that respects both of us.',
  d: [
  { l: 'G', name: 'Gift', t: { q: 'What people thank me for most', o: ['solving problems', 'teaching', 'making things', 'organising', 'calming people down'],
      why: ['Then sell the solving, not the hours. People pay more for a problem gone than for time spent.',
        'Teaching is a gift people often get from you for free. Package it: a session, a guide, a course.',
        'Then the thing you make is the offer. Cut what pulls you away from making it.',
        'Order saves others time and mistakes, and that is worth paying for. Name it as a service, not a favour.',
        'Calm is rare, and easy to give away. Build it into the offer: the client who is looked after.'] },
    s: { q: 'How much of your paid work uses that gift?', min: 0, max: 100, step: 10, d: 40, sfx: '%', w: function (v) { return v >= 70 ? 'most of it' : v >= 40 ? 'part of it' : 'little of it'; }, e: ['None', 'All of it'], up: true,
      cost: (v) => (v === 0 ? 'None of your paid work uses it yet. People thank you for it, and nobody pays for it.' : v >= 70 ? `${v}% of your paid work uses it. Charge for it.` : `${v}% uses it. The other ${100 - v}% is work others could do as well as you.`) },
    f: ['I am best at ', ['best', 'your gift', 'getting a busy kitchen to open on time'], '. People pay me for ', ['pay', 'what they pay for', 'calm, on-time openings'], '. I stop selling ', ['stop', 'one thing', 'one-off catering for private parties'], '.'],
    ck: { pay: { words: 3, ok: 'Good: what they get, in their terms.', hint: 'Say what they get, not what you do: a few more words.' },
      stop: { words: 2, not: '^\\s*(nothing|none|n/?a)\\s*$', ok: 'Good: one thing dropped makes room for the better one.', hint: 'Name one thing to stop selling. One is enough.' } },
    tool: 'Half what you’re good at, half what earns', x: [3, 40], sz: 'team',
    fb: ['People thank you for {t}, and {s} of your paid work uses it.', 'Doing everything feels safe. It hides your best work. Don’t fight that. Drop one thing.',
      ['Most of your work already uses your gift. Charge for it.', 'You named your gift and what to stop. That is an offer forming.'], 'You sell {pay}, built on {best}, and stop selling {stop}.'] },
  { l: 'O', name: 'Others in it', t: { q: 'Where clients wait or get confused', o: ['at the start', 'during delivery', 'at payment', 'after it’s done'],
      why: ['The start is where doubt is loudest. A welcome with the next three steps answers questions before they are asked.',
        'Silence during delivery feels like nothing is happening. A short update at a fixed time keeps their trust.',
        'Confusion at payment costs money and goodwill. Say how and when they pay before the work starts.',
        'After it’s done is when they decide to come back or recommend you. One planned step there is where the next sale starts.'] },
    s: { q: 'Steps from “yes” to delivered', min: 1, max: 15, step: 1, d: 7, w: N('steps'), e: ['1', '15'], up: false,
      cost: (v) => (v <= 4 ? `${v} ${v === 1 ? 'step' : 'steps'}. Short enough to show a client on one page.` : `${v} steps. Each one is a place a client can wait, wonder or drop off. Write the first three clearly.`) },
    f: ['After a client says yes, they get: 1 ', ['s1', 'step one', 'a call with their account lead within a day'], ', 2 ', ['s2', 'step two', 'the plan in writing within a week'], ', 3 ', ['s3', 'step three', 'a review every month'], '. ', ['who', 'a name', 'Priya'], ' handles step ', ['which', 'which step', '1'], '.'],
    ck: { s1: { words: 3, ok: 'Good: they know what happens first, and when.', hint: 'Say what happens, and when: a few more words.' },
      who: { not: NOT_NAME, ok: 'Good: that step has one owner.', hint: 'A real name, so the step has an owner.' },
      which: { digit: true, ok: 'Good: one step, one owner.', hint: 'Write the step’s number: 1, 2 or 3.' } },
    tool: 'The client journey', x: [0, 9], sz: 'company',
    fb: ['Clients get confused {t}, across {s}.', 'Confusion costs referrals. Don’t fight it. Show them three clear steps.',
      ['Your journey is short. Make every step visible.', 'You wrote three steps and an owner. Clients feel led.'], 'Yes, then {s1}, {s2}, {s3}. {who} owns step {which}.'] },
  { l: 'L', name: 'Levels', t: { q: 'How I set prices now', o: ['same as others', 'by the hour', 'by feel', 'from my costs and value'],
      why: ['Then the buyer has no reason to choose you except price. Your costs and your value are not theirs.',
        'Hours tell you your floor, not your worth. Three levels let the client choose how much of you they want.',
        'Feel moves with confidence, so it drops on bad weeks. A price written down holds steady.',
        'That works. Now give it three levels, so the client chooses which one, not whether.'] },
    s: { q: 'How confident are you saying your price out loud?', min: 0, max: 10, step: 1, d: 4, w: SURE, e: ['I mumble', 'I say it calmly'], up: true,
      cost: (v) => (v >= 8 ? 'You say it calmly. Now add a higher level, and say that one too.' : 'Buyers hear the doubt before the number, and push on it. Three levels give you something to say after the price.') },
    f: ['Essential: ', ['e1', 'what’s in it', 'the guide and one call'], ' at ', ['p1', 'price', '$49'], '. Complete: ', ['e2', 'what’s in it', 'the guide and four weekly calls'], ' at ', ['p2', 'price', '$149'], '. Premium: ', ['e3', 'what’s in it', 'done with you for a month'], ' at ', ['p3', 'price', '$390'], '.'],
    ck: { p1: { digit: true, ok: 'A price.', hint: 'Write an amount, like $49.', note: 'A spreadsheet can check that each level sits above your floor from Level 07. Choosing what goes into each level is yours.' },
      p2: { digit: true, ok: 'A price for the middle, where many choose.', hint: 'Write an amount, like $149.' },
      p3: { digit: true, ok: 'Good: the top level shows what your work is worth, even to those who choose the middle.', hint: 'Write an amount, like $390.' } },
    tool: 'Three price levels', x: [2, 3], sz: 'start',
    fb: ['You price {t}, and you say it out loud {w}.', 'A single price forces a yes or no. Don’t fight that. Give three choices.',
      ['You say your price calmly. Now add a higher level.', 'You built three levels. Most people choose the middle.'], 'Essential at {p1}, Complete at {p2}, Premium at {p3}.'] },
  { l: 'D', name: 'Desire', t: { q: 'What my customer wants most', o: ['time back', 'more money', 'less worry', 'to look good', 'better health'],
      why: ['Then your line ends with the hours they get back. Time is easy to promise and easy to check, so be exact.',
        'Then say how much, or how soon. “More money” without a number sounds like every other offer.',
        'Worry is felt before it is explained. Name the worry in their words, then what is calm afterwards.',
        'Then the offer names the result others will see. Say who notices, and when.',
        'Then say what changes in a normal week. Health is bought for daily life, not for promises.'] },
    s: { q: 'Could a customer repeat your offer after hearing it once?', min: 0, max: 10, step: 1, d: 4, w: [[3, 'not really'], [6, 'roughly'], [8, 'mostly'], [10, 'word for word']], e: ['No', 'Word for word'], up: true,
      cost: (v, w) => (v >= 8 ? 'They can repeat it. That means they can recommend it.' : `Today: “${w}”. If they can’t repeat it, they can’t pass it on.`) },
    f: ['For ', ['who', 'who', 'café owners'], ' who ', ['pain', 'their problem', 'have empty weekday afternoons'], ', I ', ['do', 'what you do', 'run local events that bring regulars'], ', so they ', ['gain', 'their result', 'fill tables without discounts'], ', within ', ['time', 'how long', '60 days'], '.'],
    ck: { who: { words: 2, not: '\\b(everyone|anyone|all businesses)\\b', ok: 'Good: one kind of customer.', hint: 'Name one kind of customer, not “everyone”.' },
      gain: { words: 3, ok: 'Good: the result they would say themselves.', hint: 'Say the result in their words: a few more words.' },
      time: { digit: true, ok: 'Good: a time they can check.', hint: 'Say how long, like 60 days.' } },
    tool: 'The one-line offer', x: [1, 4], sz: 'solo',
    fb: ['Your customer wants {t}, and could repeat your offer {w}.', 'A clever offer gets admired. A clear one gets bought. Don’t fight for clever.',
      ['They can repeat it. That means they can recommend it.', 'You wrote your offer in one line. Say it the same way every time.'], 'For {who} who {pain}: you {do}, so they {gain}, within {time}.'] }] },

{ n: 9, promise: 'A weekly review held, one area with an owner, one page of cash, your warm list written down.', word: 'FLOW', ch: 1, floor: 'Systems · a business that runs without you', title: 'Your systems', old: 'If I’m not there, it stops.', neu: 'A good system carries the business on my worst day.',
  d: [
  { l: 'F', name: 'First things weekly', t: { q: 'When I plan my week', o: ['never', 'as it comes', 'Monday morning', 'Sunday evening'],
      why: ['Then the week is planned by whoever writes to you first. Ten minutes on a fixed day takes it back.',
        'As it comes means the loudest thing wins. A short review puts the important thing first.',
        'That works if it is protected. Make it the first thing on Monday, before any message.',
        'That works, if it stays at ten minutes. Part of Sunday belongs to rest.'] },
    s: { q: 'Weekly promises to yourself kept last week, out of 10', min: 0, max: 10, step: 1, d: 5, w: OF10, e: ['None', 'All ten'], up: true,
      cost: (v) => (v >= 8 ? 'You keep most of your promises. A weekly review makes it all of them.' : v === 0 ? 'None kept. Without a review, nobody notices until the month is gone.' : `${v} of 10 kept. A review shows you which ${10 - v} slipped, while there is still time.`) },
    f: ['Every ', ['day', 'which day', 'Friday'], ' at ', ['time', 'what time', '15:00'], ' I spend ten minutes: look back, read the numbers, choose ', ['three', 'how many priorities', 'three'], ' priorities.'],
    ck: { time: { digit: true, ok: 'Good: a time that can go in the calendar.', hint: 'Write a time, like 15:00.' },
      three: { not: '\\b([4-9]|[1-9]\\d|four|five|six|seven|eight|nine|ten)\\b', ok: 'Good: few enough to finish.', hint: 'Three or fewer. More than that, and none of them comes first.' } },
    tool: 'The weekly review', x: [2, 6], sz: 'company',
    fb: ['You plan {t}, and kept {w} of your promises.', 'Without a review, the week plans you. Don’t fight the mess. Give it ten minutes.',
      ['You keep most promises. A review will make it all of them.', 'You set a weekly review. It is the steering wheel.'], 'Every {day} at {time}: look back, read the numbers, choose {three} priorities.'] },
  { l: 'L', name: 'Lean on roles', t: { q: 'If I were sick for a week…', o: ['the business stops', 'things slow down', 'most of it runs', 'it runs fine'],
      why: ['Then every customer depends on your health. One area with an owner is the first thing that keeps going.',
        'Slow is where customers start to notice. Find the area that slows most, and give it an owner.',
        'Something already works. Write down who owns what, so it holds on tired days, not only sick ones.',
        'That works. Now write it down, so it keeps running when people change.'] },
    s: { q: 'Tasks only you can do today', min: 0, max: 20, step: 1, d: 9, w: N('tasks'), e: ['None', '20'], up: false,
      cost: (v) => (v === 0 ? 'None. The business can run without you, so now you can lead it.' : `${v} ${v === 1 ? 'task waits' : 'tasks wait'} for you alone. On your worst day, each one stops.`) },
    f: ['', ['who', 'a name', 'Jordan'], ' owns ', ['owns', 'an area', 'the inbox and the bookings'], '. They decide alone up to ', ['limit', 'a limit', '$100'], '. They call me when ', ['call', 'when', 'a customer asks for a refund'], '.'],
    ck: { who: { not: NOT_NAME, ok: 'Good: one owner.', hint: 'A real name: a person, a freelancer, or the tool that owns it.' },
      limit: { digit: true, ok: 'Good: they know where their decision ends.', hint: 'Write an amount, like $100, so they know where their decision ends.' },
      call: { words: 3, ok: 'Good: they know when to call you, and when not to.', hint: 'Say when they call you: a few more words.' } },
    tool: 'Owner, limit, call', x: [0, 6], sz: 'start',
    fb: ['If you were sick, {t}. {s} sit with you alone.', 'Being needed feels good. It is also a ceiling. Don’t fight it. Give one area an owner.',
      ['Most things run without you. Write it down so it lasts.', 'You gave one area an owner and a limit. That is a system.'], '{who} owns {owns}, decides up to {limit}, and calls you when {call}.'] },
  { l: 'O', name: 'One page of cash', t: { q: 'What I check every week', o: ['nothing', 'the bank balance', 'sales', 'money in, out and left'],
      why: ['Then the first warning comes from the bank. A page a week gives you the warning first.',
        'The balance is today. It doesn’t show the bills due next week, or the money still owed to you.',
        'Sales are half the page. Cash goes out on its own schedule, and that is where surprises live.',
        'That works. Now add an alert line, and what you do the same day you cross it.'] },
    s: { q: 'Months you could pay all costs if sales stopped today', min: 0, max: 12, step: 1, d: 2, w: N('months'), e: ['0', '12 months'], up: true,
      cost: (v) => (v === 0 ? 'Less than a month. One slow month becomes a crisis; the alert line is where you start.' : v >= 6 ? `${v} months. You can decide from choice, not from fear. Protect it.` : `${v} ${v === 1 ? 'month' : 'months'}. Every decision this month is made close to the edge; an alert line gives you notice.`) },
    f: ['Every ', ['day', 'which day', 'Monday'], ': money in ', ['in', 'amount', '$6,200'], ', money out ', ['out', 'amount', '$4,900'], ', left ', ['left', 'amount', '$1,300'], '. My alert line is ', ['alert', 'the minimum', '$3,000 in the bank'], '.'],
    ck: { left: { digit: true, ok: 'Three numbers, one page.', hint: 'Write an amount.', note: 'Your bank or accounting app fills these in seconds. What you do the day you cross the line is yours.' },
      alert: { digit: true, ok: 'Good: a line you will see the day you cross it.', hint: 'Write an amount, like $3,000, so the line is clear.' } },
    tool: 'The weekly cash view', x: [1, 2], sz: 'solo',
    fb: ['You check {t}, and you have {s} of runway.', 'Cash surprises kill good businesses. Don’t fight the number. Look every week.',
      ['You have real runway. Protect it with an alert line.', 'You wrote one page of cash and an alert line. No more surprises.'], 'Every {day}: in {in}, out {out}, left {left}. Below {alert}, you act that day.'] },
  { l: 'W', name: 'Warm list', t: { q: 'Where my last five clients came from', o: ['referrals', 'social media', 'ads', 'my network', 'repeat clients'],
      why: ['Referrals are warm, and they arrive when they want. Write down who referred, and ask them again.',
        'Then the people who reply there go on the list, each with a next step, not left in the comments.',
        'Ads bring names; the list turns them into conversations. Write each one down the day it arrives.',
        'Your network already knows you. On paper, you see who you haven’t spoken to in months.',
        'Repeat clients are the warmest names you have. Put them first, with the next thing they might need.'] },
    s: { q: 'Warm conversations open right now', min: 0, max: 30, step: 1, d: 3, w: N('open'), e: ['None', '30'], up: true,
      cost: (v) => (v === 0 ? 'None open. Next month’s work has no names yet.' : `${v} open. Written down, each with a next step, they become next month’s work.`) },
    f: ['My warm list has ', ['n', 'how many names', '25'], ' names. Every ', ['day', 'which day', 'Tuesday'], ' I move ', ['m', 'how many', '5'], ' of them one step closer, from ', ['from', 'a step', 'talked'], ' to ', ['to', 'the next step', 'an offer sent'], '.'],
    ck: { n: { digit: true, ok: 'A list you can count.', hint: 'Write a number, like 25.' },
      m: { digit: true, ok: 'Good: a number small enough to move every week.', hint: 'Write a number, like 5.' } },
    tool: 'A pipeline you can see', x: [4, 8], sz: 'team',
    fb: ['Your clients come from {t}, and you have {s}.', 'A list in your head is a list you forget. Don’t fight that. Write it down.',
      ['You have a real pipeline. Move it every week.', 'You wrote your warm list. It is now a system, not a hope.'], 'Every {day} you move {m} of your {n} names from {from} to {to}.'] }] },

{ n: 10, promise: 'Ten people contacted, one partner asked, your best client described, three customer conversations booked.', word: 'NAME', ch: 2, floor: 'Reach · your first hundred names', title: 'Your first hundred names', old: 'I don’t know anyone.', neu: 'I know more people than I think, and each knows more.',
  d: [
  { l: 'N', name: 'Network', t: { q: 'What stops me reaching out', o: ['fear of a no', 'not wanting to bother', 'no time', 'not knowing who'],
      why: ['A no to “who do you know?” costs nothing and teaches you something. Not asking is the only answer that is always no.',
        'A short, clear message takes a minute to answer. People who know you often want to help, and only need to be asked.',
        'Ten messages take thirty minutes. Put them in your marketing hour from Level 07.',
        'Open your phone and the last year of your email. The list starts with people who already trust you.'] },
    s: { q: 'People in your phone who fit your client, or know one', min: 0, max: 100, step: 5, d: 20, w: N('people'), e: ['None', '100'], up: true,
      cost: (v) => (v === 0 ? 'None you can see yet. Write ten names anyway, and ask who each of them knows.' : `${v} people who already know you. Each one knows people you don’t, and none of them can help until you ask.`) },
    f: ['This week I contact ', ['n', 'how many', '10'], ' people I already know, starting with ', ['first', 'a name', 'Emma'], '. I say: “', ['say', 'your opening line', 'I’m starting a service that gives new parents their evenings back. Who do you know with a baby under one?'], '”'],
    ck: { n: { digit: true, ok: 'A number you can count by Sunday.', hint: 'Write a number, like 10.' },
      first: { not: NOT_NAME, ok: 'Good: the first one, named.', hint: 'A real name, so the first message goes today.' },
      say: { words: 8, ok: 'Good: who you help, and a question they can answer with a name.', hint: 'Say who you help, then ask “Who do you know…?”: a few more words.' } },
    tool: 'The hundred names list', x: [1, 25], sz: 'start',
    fb: ['{t} stops you, and you know {s} who fit.', 'Reaching out feels like begging. It is service. Don’t fight the nerves. Send the first ten.',
      ['You know many people already. Your list is ready.', 'You wrote your opening line. The rest is repetition.'], 'This week, {n} people, starting with {first}: “{say}”'] },
  { l: 'A', name: 'Ambassadors', t: { q: 'Who already meets my clients', o: ['an accountant', 'a supplier', 'another professional', 'past clients'],
      why: ['Accountants often see a client’s problems first. Offer something useful for their clients, and ask for two introductions.',
        'A supplier wants your clients to do well too. Ask who could use you, and send work their way.',
        'Someone who serves the same people with something different is a natural partner. Agree a fair trade before you ask.',
        'Past clients who were happy are the warmest partners of all. Ask who else has the problem you solved for them.'] },
    s: { q: 'Possible partners you could name today', min: 0, max: 20, step: 1, d: 2, w: N('partners'), e: ['None', '20'], up: true,
      cost: (v) => (v === 0 ? 'None named yet. Look at who else your last five clients pay: that is where partners are.' : `${v === 1 ? 'One partner' : `${v} partners`} you could name. Each already has the trust of the people you want to serve.`) },
    f: ['I ask ', ['who', 'a name', 'Dan at Main Street Coffee'], ' to introduce me to two people who ', ['need', 'what they need', 'want busier weekdays'], '. In return I ', ['give', 'what you give', 'recommend Main Street Coffee to every café I work with'], '.'],
    ck: { who: { not: NOT_NAME, ok: 'Good: one partner, named.', hint: 'A real name: the person who already meets your clients.' },
      give: { words: 3, ok: 'Good: a fair trade, offered first.', hint: 'Say what you give in return: a few more words.' } },
    tool: 'The referral partner', x: [1, 3], sz: 'solo',
    fb: ['{t} already meets your clients, and you can name {s}.', 'Asking for introductions feels like a favour. It is a trade. Don’t fight that. Offer first.',
      ['You have partners to call. Start with the warmest.', 'You wrote one partner ask with something in return. That is fair.'], 'You ask {who} for two introductions to people who {need}, and you {give}.'] },
  { l: 'M', name: 'Map the money', t: { q: 'Most of my money comes from', o: ['a few big clients', 'many small ones', 'one client', 'I don’t know'],
      why: ['A few big clients are efficient until one leaves. Describe what makes them good, and find more like them before you need to.',
        'Many small clients spread the risk, and each takes time. Find the small ones that grow, and look for more of those.',
        'One client is one decision away from no business. The most urgent job this month is a second client like them.',
        'Then the first step is a list: last year’s sales by client. A spreadsheet sorts it in a minute; what you do about it is yours.'] },
    s: { q: 'Share of sales from your top three clients', min: 0, max: 100, step: 5, d: 50, sfx: '%', w: function (v) { return v >= 60 ? 'risky' : v >= 35 ? 'concentrated' : 'spread'; }, e: ['0%', '100%'], up: false,
      cost: (v) => (v === 0 ? 'No sales to count yet. Describe the client you want first, and the first one who would pay.' : v >= 60 ? `${v}% from three clients. If one of them leaves, a large part of your sales leaves too.` : v >= 35 ? `${v}% from three clients: good clients, and a risk. Find two more like them.` : `${v}%. Your sales are spread; now grow the kind of client that pays best.`) },
    f: ['My best clients share three things: ', ['a', 'one', 'have two or more locations'], ', ', ['b', 'two', 'pay within 30 days'], ', ', ['c', 'three', 'refer other owners'], '. I want ', ['more', 'how many more', 'five'], ' more of them by ', ['by', 'a date', 'March'], '.'],
    ck: { a: { words: 2, ok: 'Good: something you could check before you call them.', hint: 'Name something you could check, like “pay within 30 days”.' },
      more: { not: '^\\s*(more|some|a few|many|lots)\\s*$', ok: 'Good: a number you can count by the date.', hint: 'Write how many, like 5.' } },
    tool: 'The best-client profile', x: [0, 55], sz: 'team',
    fb: ['Most of your money comes from {t}; {s} is from three clients.', 'Depending on few feels fine until one leaves. Don’t fight that. Find more like them.',
      ['Your sales are spread. Now grow the best kind.', 'You described your best client in three words. Now you can find them.'], 'You look for clients who {a}, {b} and {c}: {more} more by {by}.'] },
  { l: 'E', name: 'Engage', t: { q: 'The first thing I’ll ask a customer', o: ['what they struggle with', 'what they tried', 'what it costs them', 'what they want instead'],
      why: ['A good start, if you ask about the last time, not in general. “When did it last happen?” gets a story; “what do you struggle with?” gets an opinion.',
        'The strongest question: what they tried shows what they will pay for, and what failed them.',
        'Cost shows how much the problem matters. Ask it after the story, not first, or it sounds like a sales question.',
        'Wants are easy to say and hard to pay for. Ask about the last time first; the want shows itself in the story.'] },
    s: { q: 'Customer conversations you can hold per week', min: 0, max: 15, step: 1, d: 3, w: N('a week'), e: ['None', '15'], up: true,
      cost: (v) => (v === 0 ? 'None this week. What you build next will rest on guesses.' : `${v} a week. ${v >= 3 ? 'In a month, you hear the same words twice, and you know they are real.' : 'Write each one down the same day; one written beats ten remembered.'}`) },
    f: ['I ask ', ['n', 'how many', '10'], ' people: “When did you last ', ['last', 'the problem', 'run out of stock on a best seller'], '? What did you try? What did it cost you?” I write their exact words.'],
    ck: { n: { digit: true, ok: 'A number of conversations you can count.', hint: 'Write a number, like 10.' },
      last: { words: 3, not: '\\b(our|my) (product|service|app|offer)\\b', ok: 'Good: their problem, in the past. No pitch in it.', hint: 'Ask about their problem, not your offer: a moment they would remember.' } },
    tool: 'The customer interview', x: [1, 3], sz: 'company',
    fb: ['You’ll start with {t}, at {s}.', 'You want to pitch. Don’t. Ask about their past, not your idea.',
      ['That pace finds the truth in a month.', 'You wrote three questions about their past. That is how real demand shows.'], 'You ask {n} people: “When did you last {last}? What did you try? What did it cost you?”'] }] },

{ n: 11, promise: 'Three people asked for honest feedback, one open question in a meeting, your advantage written with proof, three testimonials asked for.', word: 'EDGE', ch: 2, floor: 'Advantage · why you, and not them', title: 'Your advantage', old: 'Everyone does what I do.', neu: 'I am chosen for a reason I can name and prove.',
  d: [
  { l: 'E', name: 'Ego check', t: { q: 'When I get criticism, I…', o: ['defend myself', 'shut down', 'overthink for days', 'use it'],
      why: ['Defending ends the feedback in one sentence, and people learn not to give it again. “Thank you” keeps it coming.',
        'Shutting down protects you today and leaves you blind next month. Write it down; decide what to do with it tomorrow.',
        'Days of thinking give it more weight than it has. Write it down once, choose one thing to change, and close the page.',
        'That works. Now ask for it on purpose, from three people, before a problem forces it.'] },
    s: { q: 'People who told you something hard this month', min: 0, max: 10, step: 1, d: 1, w: N('people'), e: ['None', 'Ten'], up: true,
      cost: (v) => (v === 0 ? 'Nobody this month. Either all is well, or it is not safe to tell you. Asking finds out which.' : `${v === 1 ? 'One person' : `${v} people`} told you something hard: what a competitor never hears.`) },
    f: ['I ask ', ['a', 'one person', 'Mia'], ', ', ['b', 'another', 'Sam'], ' and ', ['c', 'a third', 'my accountant'], ': “What’s one thing I do that makes working with me harder?” I only say thank you.'],
    ck: { a: { not: NOT_NAME, ok: 'One.', hint: 'A real name, so the question goes to someone.' },
      c: { not: NOT_NAME, ok: 'Three people, each with a name.', hint: 'A real name for the third one too.' } },
    tool: 'Feedback, asked for', x: [0, 1], sz: 'solo',
    fb: ['With criticism you {t}, and {s} told you something hard this month.', 'Feedback stings because worth is involved. Yours is settled (Level 01). Don’t fight it. Collect it.',
      ['People tell you the truth. That is an advantage few have.', 'You chose three people to ask. You’ll hear what competitors never hear.'], 'You ask {a}, {b} and {c} the one question, and only say thank you.'] },
  { l: 'D', name: 'Dialogue', t: { q: 'What my team or partners avoid telling me', o: ['bad news', 'their ideas', 'that they’re overloaded', 'nothing, they tell me'],
      why: ['Bad news that waits grows. When it reaches you late, it is usually because bringing it early did not feel safe.',
        'Ideas held back are ideas you paid for and never used. A question every week tells people theirs are wanted.',
        'Overload hides until someone drops something important. Ask, and you can move work before it breaks.',
        'Good, if it holds when things are hard. Keep asking, so it stays true on a bad week too.'] },
    s: { q: 'How safe is it to disagree with you?', min: 0, max: 10, step: 1, d: 5, w: SAFE, e: ['Not safe', 'Safe'], up: true,
      cost: (v, w) => (v >= 8 ? 'Safe. People tell you what is not working while it is still cheap to fix.' : `You said “${w}”. What people won’t say in the meeting, they say after it, to someone else.`) },
    f: ['In every ', ['meet', 'which meeting', 'Monday team check-in'], ' I ask: “What isn’t working that I don’t know?” and I ', ['do', 'what you do first', 'write it on the board'], ' before I answer.'],
    ck: { do: { words: 2, not: '\\b(defend|explain|justify)\\b', ok: 'Good: they see you took it in before you reply.', hint: 'Something you do before you answer: write it down, thank them, ask “tell me more”.' } },
    tool: 'The open question', x: [2, 5], sz: 'team',
    fb: ['People avoid telling you {t}, and disagreeing feels {w}.', 'Silence looks like agreement. It isn’t. Don’t fight that. Ask the question every week.',
      ['Disagreement is safe with you. That is how good ideas surface.', 'You set one question in one meeting. Habits beat speeches.'], 'Every {meet} you ask what isn’t working, and you {do} before you answer.'] },
  { l: 'G', name: 'Gap', t: { q: 'Customers compare me with', o: ['a competitor', 'doing nothing', 'doing it themselves', 'a cheaper option'],
      why: ['Then say plainly what you do that they don’t, and show the proof. Never run them down; show your difference.',
        'Doing nothing is a real competitor. Show what waiting costs them, in their own words.',
        'Then your advantage is time, skill or certainty. Show what doing it themselves costs, and what they get back.',
        'Then don’t fight on price. Show what the cheaper option leaves out, and who it is not for.'] },
    s: { q: 'How different do you look to a buyer?', min: 0, max: 10, step: 1, d: 3, w: [[3, 'the same'], [6, 'a bit different'], [8, 'clearly different'], [10, 'one of a kind']], e: ['The same', 'One of a kind'], up: true,
      cost: (v, w) => (v >= 8 ? 'Buyers see a difference. Put the proof right next to it.' : `Today: “${w}”. When you look the same, the buyer decides on price.`) },
    f: ['Others offer ', ['others', 'what others offer', 'delivery next week'], '. I offer ', ['mine', 'what you offer', 'delivery every week, on the same day'], ', because ', ['because', 'why you can', 'we run our own trucks in the region'], '. Proof: ', ['proof', 'one fact', '40 stores, no missed delivery this year'], '.'],
    ck: { because: { words: 3, ok: 'Good: the reason it is hard to copy.', hint: 'Say why you can do it: a few more words.' },
      proof: { words: 3, digit: true, ok: 'Good: a fact a buyer can check.', hint: 'Make it a fact with a number in it: something a buyer could check.' } },
    tool: 'The advantage map', x: [0, 5], sz: 'company',
    fb: ['You are compared with {t}, and you look {w}.', 'If you look the same, price decides. Don’t fight on price. Name the gap.',
      ['Buyers see a difference. Put the proof next to it.', 'You named your difference and its proof. That is an edge.'], 'Others offer {others}. You offer {mine}, because {because}. Proof: {proof}.'] },
  { l: 'E', name: 'Echo', t: { q: 'Where my proof lives', o: ['nowhere', 'in my head', 'screenshots on my phone', 'public reviews'],
      why: ['Then every buyer takes your word for it. Two sentences from one person who tried it change that this week.',
        'Proof in your head can’t be read by a buyer. Write it down, with the person’s name and their permission.',
        'Screenshots are proof nobody sees. Ask permission, and put them where buyers decide.',
        'That works. Now put the best two next to your offer, where the decision is made.'] },
    s: { q: 'Written testimonials you could show today', min: 0, max: 20, step: 1, d: 2, w: N('testimonials'), e: ['None', '20'], up: true,
      cost: (v) => (v === 0 ? 'None you can show. The next buyer has only your word.' : `${v === 1 ? 'One' : v} you could show. ${v >= 3 ? 'Put the best ones next to the price.' : 'Three, next to your offer, start to speak for you.'}`) },
    f: ['By ', ['day', 'a date', '15 Nov'], ' I ask ', ['n', 'how many', '3'], ' clients for two sentences: what changed for them, and who they would recommend me to.'],
    ck: { n: { digit: true, ok: 'Good: a number of asks you can count.', hint: 'Write a number, like 3.' } },
    tool: 'The two-sentence testimonial', x: [0, 0], sz: 'start',
    fb: ['Your proof lives {t}, and you have {s}.', 'Asking for praise feels vain. It is evidence for the next client. Don’t fight that. Ask.',
      ['You have proof. Put it where buyers decide.', 'You set a date to collect proof. Your clients will speak for you.'], 'By {day} you ask {n} clients for two sentences, and you put them where buyers decide.'] }] },

{ n: 12, promise: 'Your leader sentence written, one person given something to own, a twelve-week number with checkpoints, one market test set.', word: 'RISE', ch: 2, floor: 'Leadership · your next twelve weeks', title: 'Your twelve weeks', old: 'I am a person with a business.', neu: 'I am a leader who builds people and serves a market.',
  d: [
  { l: 'R', name: 'Rule of life', t: { q: 'What changed most in me since Level 01', o: ['what I believe', 'how calm I stay', 'how I decide', 'how I handle money', 'how I sell'],
      why: ['The rule from Level 01 is tested now, not obeyed. Write the day you knew it, so you can read it on a hard one.',
        'Calm under pressure is what your people feel first. Name one day it held, and who noticed.',
        'Deciding with the facts in front of you is leadership. Write one decision you would have avoided twelve weeks ago.',
        'Money read every week stops being a fear. Write one number you now know that you once guessed.',
        'Asking became part of your week. Write how many asks you made, and one yes it brought.'] },
    s: { q: 'How much do you trust yourself to decide now?', min: 0, max: 10, step: 1, d: 7, w: [[3, 'a little'], [6, 'more than before'], [8, 'a lot'], [10, 'fully']], e: ['Not at all', 'Fully'], up: true,
      cost: (v, w) => (v >= 8 ? 'You trust your decisions. Others feel that, and follow it.' : `Today: “${w}”. Trust grows from proof, and your proof list is where it lives.`) },
    f: ['I am a leader who ', ['who', 'who you are', 'decides from the numbers and lets the team own the work'], '. In twelve weeks I will be known for ', ['known', 'what for', 'kitchens that open on time, every time'], '.'],
    ck: { who: { words: 4, ok: 'Good: something people could see you do.', hint: 'Make it something your people or clients could see you do: a few more words.' },
      known: { words: 3, ok: 'Good: something a customer could say about you.', hint: 'Say it the way a customer would: a few more words.' } },
    tool: 'Your credo, rewritten', x: [2, 7], sz: 'team',
    fb: ['What changed most is {t}, and you trust yourself {w}.', 'Old doubts return on hard days. Don’t fight them. Read your proof.',
      ['You trust your decisions. That is leadership.', 'You wrote who you are now. Read it every Monday.'], 'You are a leader who {who}. In twelve weeks, you are known for {known}.'] },
  { l: 'I', name: 'Invest in people', t: { q: 'Who could lead with me', o: ['someone on my team', 'a partner', 'a client', 'nobody yet'],
      why: ['Then give them something real to own, with a limit, and ask questions instead of giving answers.',
        'A partner who leads with you doubles what the business can carry. Agree in writing what each of you owns.',
        'A client can lead with you: a pilot, a seat on an advisory group, a case you build together. Ask the one who believes most.',
        'Then the first leader is the one you will hire or train. Write the one decision you would hand them first.'] },
    s: { q: 'Hours a week you will invest in them', min: 0, max: 10, step: 1, d: 1, w: N('hours'), e: ['None', '10 hours'], up: true,
      cost: (v) => (v === 0 ? 'None planned. Someone nobody invests in stays a helper.' : `${v} ${v === 1 ? 'hour' : 'hours'} a week. Kept on the same day, that is how someone grows into ownership.`) },
    f: ['I grow ', ['who', 'a name', 'Priya'], ' by giving them ', ['own', 'something to own', 'the whole southern region, up to $50,000 a decision'], ' to own. Every ', ['day', 'which day', 'Thursday'], ' I ask: “', ['ask', 'your coaching question', 'What did you decide, and why?'], '”'],
    ck: { who: { not: NOT_NAME, ok: 'Good: one person to grow.', hint: 'A real name: the person you will grow.' },
      own: { words: 3, ok: 'Good: something real to own, not a task to do.', hint: 'Give them an area or a decision to own, not a task: a few more words.' },
      ask: { words: 4, not: '^\\W*(did|do|does|can|could|would|will|is|are|have|has|should)\\b', ok: 'Good: a question that makes them think, not report.', hint: 'Start with what, how or why, so they explain their thinking.' } },
    tool: 'Grow one leader', x: [0, 2], sz: 'company',
    fb: ['{t} could lead with you, and you’ll give it {s}.', 'Doing it yourself is faster today and slower forever. Don’t fight that. Hand over ownership.',
      ['That is real time for a leader. Keep the day fixed.', 'You chose a person and a question. That is how leaders grow leaders.'], 'You give {who} {own} to own, and every {day} you ask: “{ask}”'] },
  { l: 'S', name: 'Scale the number', t: { q: 'The one number that matters most for the next twelve weeks', o: ['profit', 'clients', 'price', 'cash', 'my hours'],
      why: ['Profit shows whether the work pays. Read it with the hours it took, or it can rise while you burn out.',
        'Clients show demand. Count the ones who pay, not the ones who are interested.',
        'Price is the fastest lever you have. Raise it where your floor and your proof are strongest.',
        'Cash keeps you free to choose. Set the number with your alert line from Level 09 in mind.',
        'Your hours are the cost nobody invoices. Fewer hours for the same money is a real business goal.'] },
    s: { q: 'Growth you aim for in twelve weeks', min: 0, max: 100, step: 5, d: 20, sfx: '%', w: function (v) { return v >= 50 ? 'bold' : v >= 20 ? 'stretching' : 'steady'; }, e: ['0%', '100%'], up: true,
      cost: (v, w) => (v === 0 ? 'No growth set. Holding steady can be the goal: say so, and name what you protect.' : `${v}%: ${w}. Week 4 and week 8 tell you early whether it is on track.`) },
    f: ['In twelve weeks: ', ['num', 'the number', 'paying customers'], ' from ', ['from', 'today', '0'], ' to ', ['to', 'the target', '10'], ' a month. Checkpoints: ', ['c1', 'week 4', '3'], ', ', ['c2', 'week 8', '6'], '.'],
    ck: { from: { digit: true, ok: 'Where you start, as a number.', hint: 'Write today’s number, even if it is 0.' },
      to: { digit: true, ok: 'The target.', hint: 'Write the target as a number.', note: 'A spreadsheet draws the line from today to the target in seconds. Choosing the target, and what you do at week 4 if it misses, is yours.' },
      c1: { digit: true, ok: 'Week 4: a checkpoint you can read.', hint: 'Write the number you expect by week 4.' },
      c2: { digit: true, ok: 'Week 8. Now a miss shows early, while there is time to act.', hint: 'Write the number you expect by week 8.' } },
    tool: 'The 90-day plan', x: [1, 100], sz: 'start',
    fb: ['You chose {t}, and a {w} target of {s}.', 'Big targets scare, small ones bore. Don’t fight the fear. Break it into checkpoints.',
      ['Bold, with checkpoints. That is how growth stays honest.', 'You wrote a number and two checkpoints. Progress you can see.'], '{num} from {from} to {to}, via {c1} and {c2}.'] },
  { l: 'E', name: 'Expand', t: { q: 'My next market move', o: ['raise my price', 'a new customer group', 'a new channel', 'a partnership', 'a new product'],
      why: ['Test it on new clients first, with your three levels and your proof beside it. Count how many say yes.',
        'A new group has new fears and new words. Hold ten conversations before you build anything.',
        'A new channel needs a fixed hour, like your marketing hour. Test one for four weeks before you add another.',
        'A partnership is a trade. Test it with one shared client before you sign anything long.',
        'A new product is a guess until someone pays. Sell it to ten people before you build all of it.'] },
    s: { q: 'How confident are you it will work?', min: 0, max: 10, step: 1, d: 5, w: SURE, e: ['Not at all', 'Certain'], up: true,
      cost: (v, w) => (v >= 8 ? 'You’re confident. Test it anyway: confidence isn’t data.' : `You said “${w}”. Good: that is exactly what a small test is for.`) },
    f: ['By ', ['day', 'a date', '31 Jan'], ' I test ', ['test', 'the move', 'a supper club for local offices'], ' with ', ['n', 'how many people', '10'], ' people. Success means ', ['win', 'what counts', '4 bookings'], '. If not, I ', ['else', 'plan B', 'try lunch instead'], '.'],
    ck: { n: { digit: true, ok: 'A test small enough to run this month.', hint: 'Write how many people, like 10.' },
      win: { digit: true, ok: 'Good: you will know on the day whether it worked.', hint: 'Make success a number, like 4 bookings.' },
      else: { words: 2, ok: 'Good: plan B, decided while you are calm.', hint: 'Write what you do if it misses: a few more words.' } },
    tool: 'The small market test', x: [1, 5], sz: 'solo',
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
    idea: 'Somewhere you learned a rule for being worth something. It still runs your week, until you test it.',
    ins: 'A rule like this was learned early, often from someone you wanted to please. It still decides how you rest, price and say no. You do not argue a rule away; you test it once and look at what really happens.',
    done: 'on {day} you did “{act}”, and wrote one line on what really happened.',
    take: ['The test card', 'Old rule: If I {t}, then I’m worth something.', 'The test: on {day} I {act}.', 'What I feared would happen: ____', 'What really happened: ____'],
    notyet: 'Make it smaller: a short version of it, on the next free day. Then write the line.' },
  '1.1': { topic: 'One task out of your hands', on: null, bp: 'people',
    idea: 'Trust is built in small, checked steps. A clear “done” protects both of you.',
    ins: 'Every task you keep because “nobody does it right” costs you an hour you needed for the work only you can do. Trust is built in small, checked steps, not in one leap. A clear “done” protects both of you.',
    done: 'on {day} you handed {task} to {who}, with “{done}” in writing, and checked it only once.',
    take: ['The hand-over note', '{who}, from {day}, this is yours: {task}.', 'Done means: {done}.', 'I will check it once, on ____. Ask me anything before you start.'],
    notyet: 'Make it smaller: hand over one part of {task}, or do it once side by side, then let them do the next one.',
    stage: { growing: 'You already have help, but the work comes back to you. Hand over the task that comes back most often.', building: 'No team yet? Hand it to a tool, a template, or a freelancer for two hours.' } },
  '1.2': { topic: 'Money: the sentence you grew up with, and your enough', on: null, bp: 'money',
    idea: 'Enough is a finish line, not a ceiling. Without a number, every month feels short.',
    gp: { at: 't', step: 12, ids: ['mgp-12.1'] },
    ins: 'Without a number for enough, every month feels short and every price feels too high. Enough is a finish line, not a ceiling: it tells you when to stop chasing and what to charge. The sentence you grew up with is not your business plan.',
    done: 'on {day} you made the money move you wrote: “{move}”.',
    take: ['My money line', 'Enough: {enough} a month.', 'Last month in: ____ · fixed costs: ____ · left: ____', 'The money move: {move}, on {day}.'],
    notyet: 'Make it smaller: open last month’s statement and write the three numbers. The move can wait a week; the looking cannot.' },
  '1.3': { topic: 'Asking someone to buy', on: null, bp: 'sales',
    idea: 'If your offer helps, asking is service. The answer belongs to them.',
    gp: { at: 'names', step: 16, ids: ['mgp-16.3', 'mgp-16.4', 'mgp-16.5'] },
    ins: 'If your offer helps, then not asking keeps help from the people who need it. Asking is service; the answer belongs to them. A no tells you something true about the offer or the timing, never about your worth.',
    done: 'you asked {names} by {day}, and wrote each answer word for word. A yes, a no and no answer all count.',
    take: ['The ask, ready to send', 'Hi ____, I help {whom} with {prob}.', 'I think I can help you too. Could we talk for twenty minutes this week?', 'Asked: {names}. Their answers, word for word: ____'],
    notyet: 'Make it smaller: ask one of the three today, by message, with the two lines above.' },
  '2.0': { topic: 'Facts before the story', on: 'By which day will one more event be written this way?', bp: 'self',
    idea: 'Your mind writes a story in a second. Facts first, on paper, and the story stops deciding for you.',
    ins: 'Your mind writes a story in a second, then acts on it as if it were fact. Most bad decisions in a hard week come from the story, not from the facts. Separate them on paper and the next step usually becomes plain.',
    done: 'by {on}, one more event (the next thing that goes wrong, or the hardest moment of the week) is written as facts, story and a truer reading, before you acted on it.',
    take: ['The three-line check, for any hard moment', 'What a camera would have seen: ____', 'The story I told myself: ____', 'What else could be true: ____'],
    notyet: 'Make it smaller: take the last thing that annoyed you, even a small one, and write the three lines tonight.' },
  '2.1': { topic: 'Ask before you judge', on: null, bp: 'people',
    idea: 'Decide why someone let you down without asking, and you lead the person in your head. One question finds the real one.',
    ins: 'When you decide why someone let you down without asking, you lead the person in your head, not the real one. One honest question takes five minutes and saves weeks of quiet resentment. Ask, then only listen.',
    done: 'by {day} you asked {who} the question, only listened, and wrote one line of what you heard.',
    take: ['The question, ready to ask', '{who}, when {what}, what was going on for you?', 'Then: “What would help next time?”', 'What I heard: ____'],
    notyet: 'Make it smaller: send the question as a message today, and read the answer twice before you reply.' },
  '2.2': { topic: 'Your five numbers, on a fixed day', on: null, bp: 'money',
    idea: 'Numbers are not a verdict on you. Read weekly, they tell the truth while it is still cheap to act.',
    ins: 'Numbers are not a verdict on you. They are the business telling you the truth early, while it is still cheap to act. A machine can add them up in seconds; only you can decide what they mean and what you do on Monday.',
    done: 'on {day} at {time} you read all five numbers, {fear} first, and wrote them down.',
    take: ['My five numbers, every {day} at {time}', 'Money in: ____ · money out: ____ · cash left: ____', 'Unpaid invoices: ____ · hours worked: ____', '{fear}, read first. What it tells me: ____'],
    notyet: 'Make it smaller: read only {fear} this week, on {day}, and write it down.',
    stage: { building: 'No sales yet? Money in is zero: read it anyway, and add one more number, conversations held.' } },
  '2.3': { topic: 'One customer signal, tested', on: 'By which day will you have checked it once?', bp: 'sales',
    idea: 'Praise is interest; payment is evidence. A signal you test turns a guess about customers into something you know.',
    ins: 'Praise feels like progress, but only payment is proof. A signal you test turns guessing into knowing, and knowing is what a sales rhythm is built on. One honest check beats a week of worry.',
    done: 'by {on} you checked the signal once ({check}), and wrote what the customer actually said.',
    take: ['The signal test', 'When a customer {does}, I think it means {means}.', 'I check by {check}.', 'What they actually said: ____ · Was I right? ____'],
    notyet: 'Make it smaller: ask the next person who shows interest one question: “What would make this a yes for you?”' },
  '3.0': { topic: 'The feeling under the stress', on: 'By which day will you have used it once?', bp: 'self',
    idea: '“Stressed” is a cover word. Name the feeling under it, and you can answer it instead of being run by it.',
    ins: '“Stressed” is a cover word. Each feeling that can hide under it (fear, shame, anger, loneliness, tiredness) asks for something different. Name it and you can answer it; leave it unnamed and it decides for you.',
    done: 'by {on}, at the first tense moment, you did this before deciding: {help}. You wrote down the day.',
    take: ['When it comes', 'Under my {surface} is {feeling}.', 'What helps: {help}.', 'Then I decide. Not before.'],
    notyet: 'Make it smaller: the next time you feel tense, say the real word to yourself, even silently. That counts as the first time.' },
  '3.1': { topic: 'Your first five seconds under pressure', on: 'Which day will you ask {who}?', bp: 'people',
    idea: 'People watch your face in the first five seconds after bad news, and decide whether to bring you the next one.',
    ins: 'People watch your face in the first five seconds after bad news, and decide whether to bring you the next one. If bad news is not safe with you, you hear it late, when it is expensive. Change the first reaction and the room changes with it.',
    done: 'you asked {who} on {on} to tell you when you slip, and under pressure you did this at least once: {will}.',
    take: ['My first five seconds', 'Under pressure I will {will}, instead of {instead}.', '{who} tells me when I slip.', 'Times I slipped this week: ____ · times I kept it: ____'],
    notyet: 'Make it smaller: tell {who} today, in one sentence, what you are practising. Asking is the first step.',
    stage: { building: 'No team yet? The people around you are clients, partners and family. Ask one of them.' } },
  '3.2': { topic: 'A rule for decisions in a storm', on: 'By which day will the rule be where you see it?', bp: 'self',
    idea: 'Storm decisions are the ones you pay for longest. A rule written while calm waits the storm out for you.',
    ins: 'The decisions made in a storm are usually the ones you pay for longest: a price cut, a hire, a quit. A rule written while you are calm is a gift to the person you will be on a bad day. You do not have to win the feeling; you only have to wait it out.',
    done: 'by {on}, the rule is on your phone’s lock screen or on your desk, and one person knows it.',
    take: ['The rule I wrote while calm', 'When I feel {feel} above 7 out of 10,', 'I wait {hours} hours before I decide about {about}.', 'Who I call while I wait: ____'],
    notyet: 'Make it smaller: write the rule on a note today and put it where you work.' },
  '3.3': { topic: 'Your client’s fear, in their words', on: null, bp: 'marketing',
    idea: 'People buy to move away from a fear and towards a hope. Their own words for both are your best message.',
    ins: 'People buy to move away from a fear and towards a hope, then explain it with logic afterwards. If you guess the fear, your message speaks to the wrong thing. Their own words, written down, are the best marketing you will ever have.',
    done: 'you asked {who} by {day}, and wrote their fear and their hope in their own words, or that they have not answered yet.',
    take: ['Their fear, their hope', '{who} fears: ____ (their words)', 'And hopes for: ____ (their words)', 'The first line of my next message: “If you’re worried about ____, …”'],
    notyet: 'Make it smaller: ask one client one question by message: “What almost stopped you from working with me?”' },
  '4.0': { topic: 'Decide once, in advance', on: 'Which day will you use it first?', bp: 'self',
    idea: 'Willpower runs out by the afternoon. A plan decided in advance (when this, I do that) works on tired days too.',
    ins: 'Willpower is weakest when you are tired or rushed; a decision made in advance does not need it. An if–then plan works because the hard choice is already made when the moment comes. Plan for the obstacle you know will show up, not for a perfect day.',
    done: 'from {on} to Sunday, you used the plan every working day and marked each one “kept” or “not kept”.',
    take: ['My if–then', 'When {when}, I will {will}.', 'If {if}, then I {then}.', 'Kept: Mon ☐ Tue ☐ Wed ☐ Thu ☐ Fri ☐'],
    notyet: 'Make it smaller: use the plan once, tomorrow, for ten minutes. One kept plan is the start of the habit.' },
  '4.1': { topic: 'One ask with a date and a done', on: null, dayKey: 'when', bp: 'people',
    idea: 'Most frustration with people is a request never made clearly. A date and a picture of “done” let them succeed.',
    ins: 'Most frustration with people is a request that was never made clearly: no date, no picture of done. A clear ask is a kindness, because it lets people succeed. If it matters, write it down.',
    done: '{who} has the ask in writing, with the date and the done, and on {when} you checked it once.',
    take: ['The clear ask, ready to send', '{who}, could I have {what} by {when}?', 'Done looks like: {done}.', 'Is there anything you need from me to do it?'],
    notyet: 'Make it smaller: take one request you already made this week, add a date and a “done”, and send it again.' },
  '4.2': { topic: 'Your hour has a price', on: 'Which day will you hand back {back}?', bp: 'offer',
    idea: 'Your hour has a price whether you name it or not. Once you know it, cheap work stops looking free.',
    ins: 'Your hour has a price whether you name it or not. Once you know it, cheap work stops looking free: every hour of admin you keep is paid at your rate. The first hour of the day decides what kind of week it becomes.',
    done: '{first} came first on three days, and {back} was handed back by {on}.',
    take: ['My hour', 'My hour is worth {hour}.', 'First, every day: {first}.', 'Handed back: {back}. Hours it gives me each week: ____'],
    notyet: 'Make it smaller: protect the first hour on two days, not every day, and do {first} in it.',
    stage: { growing: 'Price the hours you spend fixing other people’s work too: they are the first ones to hand back.', scaling: 'Price your team’s hour too: what one hour of their work costs you.' } },
  '4.3': { topic: 'A weekly selling hour', on: null, bp: 'sales',
    idea: 'Delivery fills every free hour, so selling waits until the work runs out. A fixed selling hour keeps next month full.',
    ins: 'Delivery fills every free hour, so selling only happens when the work runs out, which is the worst time to start. A fixed selling hour keeps the pipeline full while you are busy. Everyone hears from you twice, because people are busy, not uninterested.',
    done: 'on {day} at {time} you contacted {n} potential buyers, and followed up once with everyone who was silent.',
    take: ['My selling hour', 'Every {day} at {time}: {n} buyer conversations.', 'Everyone hears from me twice.', 'When they say “let me think”: “Of course. What would you need to know to decide?” Then agree a day.', 'This week: talked ____ · asked ____ · yes ____'],
    notyet: 'Make it smaller: one conversation this week, at the same day and time, and put next week’s in the calendar now.' },
  '5.0': { topic: 'Proof of who you are becoming', on: 'By which day will you add one more proof?', bp: 'self',
    idea: 'Identity changes after the evidence, not before it. Every dated proof is evidence of who you are becoming.',
    ins: 'Identity changes after the evidence, not before it. Every dated proof is evidence of who you are becoming, and on a hard day it is the list you read. One proof is a start; a habit is a long list.',
    done: 'by {on}, a second dated proof is written under the first.',
    take: ['My proof list', 'I am becoming someone who {who}.', '1. {proof}', '2. ____ (date) · 3. ____ (date)'],
    notyet: 'Make it smaller: look back at the last four weeks, write one thing you did that the old you would not have done, and date it.' },
  '5.1': { topic: 'Thanks that names the thing', on: 'Which day will you tell {who}?', bp: 'people',
    idea: 'People repeat what gets noticed. Naming exactly what someone did, and what it changed, teaches them your standard.',
    ins: 'People repeat what gets noticed. A quick thanks is polite; naming exactly what someone did and what it changed teaches them what good looks like. It takes a minute and builds a team that knows your standard.',
    done: 'you told {who} on {on}, face to face or in writing, what they did and what it changed.',
    take: ['The thank-you, ready to send', '{who}, thank you for {what}.', 'It changed {changed}.', 'Next person to thank: ____'],
    notyet: 'Make it smaller: send the two lines above as a message today. In writing counts.' },
  '5.2': { topic: 'One number that tells the truth', on: null, bp: 'money',
    idea: 'One number read every week beats ten read once. When it misses, ask about the belief behind it, not only the tactic.',
    ins: 'One number read every week is worth more than ten read once. When it misses, the tactic is rarely the whole story: a belief often sits behind it, like a fear of asking or a price you are ashamed of. Ask both questions.',
    done: 'on {day} you read {num}, wrote it on your Planner’s Monday page (or on paper), and, if it missed, one line on the belief behind it.',
    take: ['My Monday number', 'Every {day}: {num}. This week: ____ · last week: ____', 'If it missed, the belief behind it: ____', 'The one thing I change: ____'],
    notyet: 'Make it smaller: read {num} once this week and write it on your Planner’s Monday page.' },
  '5.3': { topic: 'Their words, not yours', on: 'By which day will you ask three clients?', bp: 'marketing',
    idea: 'Your words about your work sound like selling. A client’s words sound like proof, and show why you are really chosen.',
    ins: 'When you describe your work, it sounds like selling; when a client describes it, it sounds like proof. Their words also tell you why you are really chosen, which is often not what you think. Ask, and write it down word for word.',
    done: 'you asked three clients by {on}, and wrote their answers word for word. No answer counts too: write that down.',
    take: ['The question for three clients', '“When you came to me, what was going on? What did you want instead? What changed?”', 'My guess: when {when}, they want to {want}, so they can {so}.', 'What they actually said: ____'],
    notyet: 'Make it smaller: ask one client, by message, the first question only.',
    stage: { building: 'No clients yet? Ask three people who tried it, or who have the problem you solve.' } },
  '6.0': { topic: 'The conversation you keep postponing', on: null, bp: 'people',
    idea: 'A conversation you postpone does not wait. It costs more each week, and the first sentence carries most of the courage.',
    gp: { at: 't', step: 6, ids: ['mgp-6.1', 'mgp-6.2'] },
    ins: 'A conversation you postpone does not wait. It costs more each week, in rework, tension and decisions left hanging. Saying what you see and what you need, kindly and plainly, is respect, not attack; the first sentence carries most of the courage.',
    done: 'the talk with {who} happened on {day}, and you said the first sentence as you wrote it.',
    take: ['The first sentence', '{who}, I need to talk about {about}.', 'What I see is {see}. What I need is {need}.', 'Then: “What do you need from me?”'],
    notyet: 'Make it smaller: book it today. Send {who} one line asking for twenty minutes, with a day.' },
  '6.1': { topic: 'Ask, then listen', on: 'Which day is the talk with {who}?', bp: 'people',
    idea: 'In a hard talk, the one who speaks most learns least. One open question, then silence, tells you what you cannot guess.',
    ins: 'In a hard talk, the one who speaks most usually learns least. A good open question shows respect and gives you what you cannot learn any other way. Ask, then count to three before you speak.',
    done: 'in the talk with {who} on {on} you asked “{ask}”, and spoke less than half the time.',
    take: ['The listening card', 'My question: “{ask}”', 'After they answer: “Tell me more.”', 'What I learned that I didn’t know: ____'],
    notyet: 'Make it smaller: in your next ordinary conversation, ask one open question and let the silence sit for three seconds.' },
  '6.2': { topic: 'Money that is yours', on: null, bp: 'money',
    idea: 'Money earned and not collected is a loan you never agreed to give. Asking for it is part of the work.',
    ins: 'Money you earned and did not collect is a loan you never agreed to give. Asking for it is part of the work, not a rudeness. A short, polite, firm message with a date works better than a long apology, and a deposit before you start means you ask less often.',
    done: 'the message went to {who} on {day}. Being paid by {by} is theirs to do; sending it was yours.',
    take: ['The payment message, ready to send', 'Hi {who}, invoice {inv} was due on {due}.', 'Please pay by {by}. Thank you.', 'If it is not paid by {by}, I call on ____.', 'From now on, new work starts with a deposit of ____.'],
    notyet: 'Make it smaller: send the two lines exactly as written. No extra sentences, no apology.',
    stage: { building: 'Nothing unpaid? Take the work you did for free, and ask to be paid for it from now on.' } },
  '6.3': { topic: 'A kind no, with an alternative', on: 'By which day will you say it?', bp: 'sales',
    idea: 'Every wrong yes is a quiet no to the right client. A kind no with an alternative protects them and your standard.',
    ins: 'Every wrong yes is a quiet no to the right client, and often to your own evening. A kind no with an alternative protects the relationship and your standard. You do not need a long reason; you need a better suggestion.',
    done: 'by {on} you said the kind no about {what}, offered {suggest}, and did not take it back.',
    take: ['The kind no, ready to say', '“This isn’t the right fit for {fit}.', 'What I suggest is {suggest}.”', 'Hours I get back each week: ____'],
    notyet: 'Make it smaller: the next time a small extra is asked for, say the same two lines.' },
  '7.0': { topic: 'Your best hours, guarded', on: null, dayKey: 'days', bp: 'self',
    idea: 'Your best hours are the most valuable thing you own. Give the urgent a later hour, not your best one.',
    ins: 'Your best hours are the most valuable thing you own, and the urgent will always try to take them. What you protect on the calendar shows what you really believe matters. Give the urgent a later hour, not your best one.',
    done: 'the hours from {from} to {to} are in your calendar for the next four weeks, and you kept them this week, {days}.',
    take: ['My best hours, guarded', '{from} to {to}, {days}: only {what}.', 'If someone asks for that time: “I can do ____ instead.”', 'Kept this week: ____ of ____'],
    notyet: 'Make it smaller: protect one morning this week, not four, and put it in the calendar now.' },
  '7.1': { topic: 'One task, one step up', on: 'Which day this week will it run that way for the first time?', bp: 'systems',
    idea: 'Delegation fails when it jumps from “I do it” to “they own it”. Move one task up one step at a time.',
    ins: 'Delegation fails when it jumps from “I do it” to “they own it” in one step. Move one step at a time: I do it, they watch; they do it, I check; they own it. Each step builds the trust the next one needs.',
    done: 'on {on}, {task} ran once at “{to}”, and you wrote down what you checked.',
    take: ['The ladder for {task}', 'Now: “{from}”. Next: “{to}”, by {day}.', 'What I check, and when: ____', 'What they decide alone: ____'],
    notyet: 'Make it smaller: do {task} once side by side this week, and let them do the last part.',
    stage: { building: 'No team? The next step is a template or a tool doing it, and you checking.' } },
  '7.2': { topic: 'The price you never go below', on: 'By which day will your lowest price be written next to your prices?', bp: 'offer',
    idea: 'Underpricing hides in the hours you don’t count. Write one job’s real cost once, and you know your floor.',
    ins: 'Most underpricing hides in the hours you don’t count: the calls, the changes, the travel. Write down the real cost of one job once, and you know the line you must never sell below; below it, you pay to work. A calculator does the sum in a minute; holding the line is the part only you can do.',
    done: '{floor} is written next to your price list by {on}, and every quote you sent this week was at or above it.',
    take: ['The line I never sell below', 'One job: {mat} + {hrs} hours × {rate} = {total}.', 'I never sell it below {floor}.', 'If a client asks for less: “At that price I can offer ____ instead.”'],
    notyet: 'Make it smaller: take your last job, count every hour it really took, and write the real cost.' },
  '7.3': { topic: 'A fixed hour for marketing', on: null, bp: 'marketing',
    idea: 'Marketing done only when the diary is empty arrives too late. One fixed hour a week, where buyers already gather, adds up.',
    ins: 'Marketing done only when the diary is empty arrives too late, because buyers take time to decide. One fixed hour a week, where your buyers already gather, adds up. Show your clients’ results more than yourself.',
    done: 'on {day}, from {from} to {to}, you did “{act}” on {where}, and the hour is in your calendar for four weeks.',
    take: ['My hour for marketing, every week', 'Every {day}, {from} to {to}: {act} on {where}.', 'Ideas for the next four weeks: 1 ____ 2 ____ 3 ____ 4 ____', 'Replies or enquiries this week: ____'],
    notyet: 'Make it smaller: one post or message this week, in the same hour, and book next week’s hour now.' },
  '8.0': { topic: 'What you are best at, and what to stop', on: 'By which day will you stop selling {stop}?', bp: 'offer',
    idea: 'Stand where what you do best meets what people will pay for. Dropping one thing makes room for the better one.',
    ins: 'Doing a bit of everything feels safe, but it hides your best work and makes you hard to recommend. Stand where what you do best meets what people will pay for. Dropping one thing makes room for the better one.',
    done: 'by {on}, {stop} came off your price list or offer page, or you said no to one request.',
    take: ['My best work', 'I am best at {best}.', 'People pay me for {pay}.', 'I stop selling {stop}. When asked: “I don’t do that any more; ____ does it well.”'],
    notyet: 'Make it smaller: decline the next request for {stop}, kindly, with a name to send them to.' },
  '8.1': { topic: 'Three clear steps after yes', on: 'By which day will the three steps be written?', bp: 'systems',
    idea: 'Clients judge you most in the days after they say yes. Three clear steps make them feel led.',
    ins: 'Clients judge you most in the days right after they say yes. Confusion there costs referrals; clear steps make people feel led and safe. Write the steps once, and anyone on your team can give the same good start.',
    done: 'by {on}, the three steps are in the message every new client gets, and {who} knows step {which} is theirs.',
    take: ['The welcome message, ready to send', 'Thank you for saying yes. Here is what happens now:', '1. {s1} · 2. {s2} · 3. {s3}', '{who} looks after step {which}. Any question, just reply.'],
    notyet: 'Make it smaller: send the three steps to your next client, even if the message is not perfect yet.',
    stage: { building: 'No clients yet? Write the three steps for your first one, and walk a friend through them.' } },
  '8.2': { topic: 'Your price, in three levels', on: 'By which day will the three levels be on your offer page?', bp: 'offer',
    idea: 'One price asks yes or no; three levels ask “which one?”. The highest shows what your work is worth.',
    ins: 'One price asks for a yes or a no; three levels ask “which one?”. A higher level shows what your work is worth, even to people who do not buy it. Say the price once, calmly, and then stop talking.',
    done: 'by {on}, the three levels are on your offer page, price list or a pinned post, and you said them out loud once to a buyer.',
    take: ['My three levels', 'Essential: {e1}, {p1}.', 'Complete: {e2}, {p2}.', 'Premium: {e3}, {p3}.', 'After the price: “Which one feels right for you?” Then stop talking.'],
    notyet: 'Make it smaller: say the three levels out loud to one person you trust, then to one buyer.' },
  '8.3': { topic: 'Your offer in one line', on: 'By which day will you have said it to three people?', bp: 'offer',
    idea: 'A clever offer gets admired; a clear one gets bought. If customers can repeat it, they can sell it for you.',
    ins: 'A clever offer gets admired; a clear one gets bought and recommended. If a customer can repeat it after hearing it once, they can sell it for you. Say it the same way every time.',
    done: 'by {on}, you said the line to three people the same way, and asked one of them to say it back.',
    take: ['My offer in one line', 'For {who} who {pain}, I {do}, so they {gain}, within {time}.', 'Said to: 1 ____ 2 ____ 3 ____', 'Who could say it back: ____'],
    notyet: 'Make it smaller: say the line to one person today and ask them to say it back.' },
  '9.0': { topic: 'A weekly review you keep', on: null, bp: 'systems',
    idea: 'Without a weekly review, the week plans you. Ten honest minutes, every week, is how you steer.',
    ins: 'Without a weekly review, the week plans you. A short, honest look back (what you promised, what happened, what the numbers say) is how you steer. A short review kept every week beats a long one skipped.',
    done: 'on {day} at {time} you held the review and wrote {three} priorities on your Planner’s Monday page (or on paper).',
    take: ['My weekly review, every {day} at {time}', 'Promised: ____ · happened: ____', 'The numbers: in ____ · out ____ · left ____', 'Next week’s {three} priorities: 1 ____ 2 ____ 3 ____'],
    notyet: 'Make it smaller: this week, answer only the first line, on paper.' },
  '9.1': { topic: 'One area with an owner', on: 'By which day will {who} know?', bp: 'systems',
    idea: 'Being needed for everything is a ceiling. An area with an owner and a limit keeps running on your worst day.',
    ins: 'Being needed for everything feels good, and it is a ceiling on your business. An area with a named owner, a spending limit and a clear “call me when” keeps running on your worst day. Write it down, so it lasts longer than your mood.',
    done: 'by {on}, {who} has it in writing: they own {owns} up to {limit}, and you passed them the next decision in that area.',
    take: ['The owner note', '{who} owns {owns}.', 'They decide alone up to {limit}.', 'They call me when {call}. Otherwise, I trust their decision.'],
    notyet: 'Make it smaller: give {who} one decision this week, up to {limit}, and let it stand.',
    stage: { growing: 'Start with the area that interrupts you most in a week, and give that one an owner first.', building: 'No team? Name the tool, template or freelancer that owns the area, and what you still check.' } },
  '9.2': { topic: 'One page of cash', on: null, bp: 'money',
    idea: 'Cash surprises end good businesses. A simple page, read every week with an alert line, shows them weeks early.',
    ins: 'Cash surprises end good businesses, and a surprise often shows weeks earlier on a simple page: in, out, left, every week, with an alert line you act on the same day. Software can fill the page; only you can act on it.',
    done: 'on {day} the page shows this week’s in, out and left, and the line “Below {alert}, the same day I …” is filled in.',
    take: ['My cash page, every {day}', 'In: {in} · out: {out} · left: {left}', 'Alert line: {alert}. Below it, the same day I: ____', 'Paid to myself this month: ____ · set aside for tax: ____', 'Next four weeks, expected in: ____ · out: ____'],
    notyet: 'Make it smaller: fill only the first line this week, from the bank, on {day}.' },
  '9.3': { topic: 'A warm list you can see', on: null, bp: 'sales',
    idea: 'A list in your head is a list you forget. Written down, every name has a next step you can take.',
    ins: 'A pipeline in your head is a pipeline you forget. Written down, every name has a next step, and you can see the list getting thin before the work runs out. Move a few people one step each week.',
    done: 'the {n} names are written down, and on {day} you took the next step with {m} of them.',
    take: ['My warm list', 'Name · where they are (met → talked → offer → yes) · next step · by when', '{n} names. Every {day}: move {m} from {from} to {to}.', 'The list is thin when fewer than ____ names are open.'],
    notyet: 'Make it smaller: write down ten names today, with one next step each.',
    stage: { growing: 'Your repeat clients are the warmest names on the list: put them first, and ask each one who else they know.', scaling: 'Each person who sells keeps their own list; you read the total every week.' } },
  '10.0': { topic: 'People you already know', on: 'By which day will the messages be sent?', bp: 'marketing',
    idea: 'You know more people than you think, and each knows people you don’t. Asking “who do you know?” invites them to help.',
    gp: { at: 'first', step: 16, ids: ['mgp-16.3', 'mgp-16.4', 'mgp-16.5'] },
    ins: 'You know more people than you think, and each of them knows people you don’t. First clients usually come from someone who already trusts you. Asking “who do you know?” is an invitation to help, not a favour.',
    done: 'by {on}, {n} messages are sent, starting with {first}, and you counted the replies.',
    take: ['The message to people you know', '“{say}”', 'Sent to: {first}, ____, ____ … ({n} in all)', 'Replies: ____ · introductions: ____'],
    notyet: 'Make it smaller: send the message to three people today, starting with {first}.' },
  '10.1': { topic: 'One partner asked', on: 'By which day will you ask {who}?', bp: 'marketing',
    idea: 'Someone already meets your clients every week. One good partner can send more work than months of posting.',
    ins: 'Someone already meets your clients every week: an accountant, a supplier, a past client. One good partner can send more work than months of posting. Make it a fair trade, and offer something first.',
    done: 'by {on}, you asked for two introductions from {who}, and offered your part first.',
    take: ['The partner ask, ready to send', 'Hi ____, could you introduce me to two people who {need}?', 'In return, I {give}.', 'Introductions received: ____'],
    notyet: 'Make it smaller: send the message today, to {who}. A no is fine; ask the next partner.' },
  '10.2': { topic: 'Your best client, described', on: 'By which day will you list them?', bp: 'marketing',
    idea: 'Your best clients share things you can name. Describe them, and you know where to look and what to say.',
    ins: 'Your best clients are not random; they share things you can name. Describe them, and you know where to look and what to say. Depending on very few clients feels fine until one leaves.',
    done: 'by {on}, every current client who shares all three is listed by name.',
    take: ['My best client', 'They {a}, {b} and {c}.', 'Today they are: ____ (names)', 'I want {more} more by {by}. Where I find them: ____'],
    notyet: 'Make it smaller: list your current clients and tick those who share all three.',
    stage: { building: 'Fewer than three clients? Describe the one you want most, and the first one who paid.' } },
  '10.3': { topic: 'Customer conversations about their past', on: 'By which day will the invitations be sent?', bp: 'grow',
    idea: 'People are polite about your idea and honest about their past. Ask what they tried and what it cost them.',
    ins: 'People are polite about your idea and honest about their past. Ask when they last had the problem, what they tried and what it cost them. Their exact words show you what to build next, and how to sell it.',
    done: 'by {on}, {n} people are invited, and every conversation held so far is written down the same day.',
    take: ['The three questions', '“When did you last {last}? What did you try? What did it cost you?”', 'What I heard most: 1 ____ 2 ____ 3 ____', 'What I build or change because of it: ____'],
    notyet: 'Make it smaller: hold one conversation this week and write their words the same day.' },
  '11.0': { topic: 'Asking for honest feedback', on: 'By which day will you have asked all three?', bp: 'people',
    idea: 'The people around you see what you cannot, and most only say it if you ask. Then you only say thank you.',
    ins: 'The people around you see what you cannot see in yourself, and most will only say it if you ask. Asking for feedback, and only saying thank you, is how you hear what competitors never hear. You decide later what to do with it.',
    done: 'by {on} you asked {a}, {b} and {c}, wrote each answer down, and only said thank you. No answer counts too.',
    take: ['The feedback question', '“What’s one thing I do that makes working with me harder?”', 'Asked: {a}, {b}, {c}.', 'What I heard: ____ · the one thing I change: ____'],
    notyet: 'Make it smaller: ask one of the three today, and only say thank you.' },
  '11.1': { topic: 'One open question, every meeting', on: 'Which day is the next {meet}?', onEx: 'Monday', bp: 'people',
    idea: 'Silence in a meeting looks like agreement, and is often fear. One question asked every week makes bad news welcome.',
    ins: 'Silence in a meeting looks like agreement, but often it is fear. A question asked every week tells people that bad news and new ideas are welcome. Write down what you hear before you answer, so they see you took it in.',
    done: 'at your next {meet} you asked the question, and before answering you did this: {do}.',
    take: ['The open question, every {meet}', '“What isn’t working that I don’t know?”', 'Before I answer: {do}.', 'What came up this week: ____'],
    notyet: 'Make it smaller: ask the question once, to one person, at the end of any conversation this week.',
    stage: { building: 'No team meeting? Ask it of a partner, a supplier, or a client at the end of each job.' } },
  '11.2': { topic: 'Your advantage, with proof', on: 'By which day will it be where buyers see it?', bp: 'marketing',
    idea: 'If you look the same as everyone else, price decides. Name what you do differently, and put the proof beside it.',
    ins: 'If you look the same as everyone else, price decides. Your advantage is what you do differently, why you can do it, and proof that it works. Put the proof right next to the claim, where buyers decide.',
    done: 'by {on}, the sentence and its proof are on your offer page, or in a message or proposal you sent this week.',
    take: ['My advantage', 'Others offer {others}. I offer {mine}, because {because}.', 'Proof: {proof}.', 'Where buyers see it: ____'],
    notyet: 'Make it smaller: add the one proof line to your next proposal or message.' },
  '11.3': { topic: 'Testimonials asked for', on: null, bp: 'marketing',
    idea: 'Two sentences in a client’s own words do more than any line you write about yourself. Ask simply, with two questions.',
    ins: 'Two sentences in a client’s own words do more than any line you write about yourself. Most clients are glad to help when asked simply, with two clear questions. Put their words where the next buyer decides.',
    done: 'you asked {n} clients by {day}, and every answer received is on your offer page, with their permission.',
    take: ['The testimonial ask, ready to send', '“Could you write two sentences: what changed for you, and who you would recommend me to? May I share them with your name?”', 'Asked: {n} clients, by {day}. Received: ____', 'Where I put them: ____'],
    notyet: 'Make it smaller: ask one happy client today, by message.',
    stage: { building: 'No clients yet? Ask three people who tried it, or who have the problem you solve.' } },
  '12.0': { topic: 'Who you are now', on: 'By which day will you read it aloud to someone?', bp: 'self',
    idea: 'After twelve weeks you have proof, not only hope. Write who you are now, and read it when old doubts return.',
    ins: 'After twelve weeks you have proof, not only hope. Write who you are now in one sentence and read it every Monday: old doubts come back on hard days, and the sentence and your proof list are the answer. Leadership starts with the leader.',
    done: 'by {on}, the sentence is on the first page of your Planner (or on paper where you see it), and you read it aloud to one person.',
    take: ['Who I am now', 'I am a leader who {who}.', 'In twelve weeks I will be known for {known}.', 'I read it every Monday, with my proof list.'],
    notyet: 'Make it smaller: read the sentence aloud to yourself every morning this week. Then to one person.' },
  '12.1': { topic: 'Growing the next leader', on: null, bp: 'people',
    idea: 'Doing it yourself is faster today and slower for ever. A leader grows leaders with real ownership and good questions.',
    ins: 'Doing it yourself is faster today and slower for ever. A leader grows leaders by giving real ownership and asking questions instead of handing out answers. One person, one area, one question a week.',
    done: '{who} knows, in writing, that they own {own}, and on {day} you asked “{ask}”',
    take: ['Growing {who}', '{who} owns {own}.', 'Every {day} I ask: “{ask}”', 'What they decided well this month: ____'],
    notyet: 'Make it smaller: ask {who} the question once this week, and only listen.',
    stage: { building: 'Nobody yet? Pick the freelancer you use most, or the first person you would hire, and give them one decision.' } },
  '12.2': { topic: 'One number for the next twelve weeks', on: 'By which day will it be in your Planner?', bp: 'grow',
    idea: 'A big target scares and a small one bores. Two checkpoints tell you early whether to push on or change course.',
    ins: 'A big target scares and a small one bores; checkpoints make a big one honest. One number, two checkpoints, read every week, tell you early whether to push on or change course. The number serves the decision, never the other way round.',
    done: 'by {on}, {num} (from {from} to {to}) and both dated checkpoints are in your Planner, or on paper where you see them.',
    take: ['My next twelve weeks', 'The number: {num}, from {from} to {to}.', 'Week 4: {c1} · week 8: {c2}.', 'If week 4 misses, the first thing I look at: ____'],
    notyet: 'Make it smaller: write the number and the first checkpoint in your Planner today; the second can wait a week.',
    stage: { scaling: 'Give each owner from Level 09 their own checkpoint, and read all of them on the same day.' } },
  '12.3': { topic: 'Testing your next market move', on: 'By which day will the first invitations go out?', bp: 'grow',
    idea: 'Certainty comes after a test, not before it. A small test with a number for success protects your money.',
    ins: 'Certainty comes after a test, not before it. A small test with a clear number for success protects your money and your confidence. If it fails, you learned cheaply; if it works, you know what to do next.',
    done: 'by {on}, the first invitations are out, and success ({win} by {day}) is written in your Planner or on paper.',
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
  { k: 'grow', n: 'Your next twelve weeks', about: 'What customers told you, the number you aim for, and the test you run.' },
];

export const CHAPTERS4 = [
  // Plain names (Alexandru, 2 Nov 2026). Levels 01–05 are about the founder:
  // their mindset, and the basics of a business seen from there. From Level
  // 06 the questions go deeper into the business itself.
  { n: 'Chapter I', name: 'Start with you', about: 'You, and the basics of a business: what you believe, how you read what happens, what you feel, what you do and what it makes of you, with the customer, serving, money and goals.', lv: [0, 1, 2, 3, 4] },
  { n: 'Chapter II', name: 'Run the business', about: 'Inside the business: the conversations, your time, your offer and its price, and systems that run without you.', lv: [5, 6, 7, 8] },
  { n: 'Chapter III', name: 'Grow the market', about: 'Outside the business: reach, advantage and leadership, so customers come to you.', lv: [9, 10, 11] }];

/* ── The elephant in the room, and the door ─────────────────────────────
 * Alexandru, 2 Nov 2026 (20:29). Before Levels 01, 04 (the Boardroom), 06
 * (the LAB) and 10 (the HUB), the welcome is THE ELEPHANT IN THE ROOM: the
 * thing every founder at that step carries and nobody names. Four screens,
 * one at a time and in rule 16's order (we understand you, it is possible,
 * the puzzle, here you are), in Alexandru's own voice ("I"), then three
 * questions answered with a tap or a slider, never a sentence. A Summit
 * founder gets GREATNESS at Level 01. Only Alexandru's own story and words
 * (his books, his profile, his messages): nothing invented.
 *   01 Your hidden potential · 04 The future you · 06 The customer, not the
 *   ego · 10 The money · The Summit: Greatness.
 * Saved as w.v4.<lv>.w.<k>, beside w.seen, so /mentor and the letters never
 * count them as a level written. */
export const WELCOME_AT = { 1: 0, 4: 1, 6: 2, 10: 3 };
const BIZ_DEF = 'A business is a system, a service or a product that solves people’s problem and that people are willing to pay for. The payment lets the system repeat, so it can keep solving the problem.';
/** What stops the founder most: asked at Level 01, and again at Level 04. */
const STOPS = ['Not enough time', 'Not enough money', 'Not knowing what to do first', 'Fear: of failing, or of what people say', 'Doing it all alone', 'I don’t know yet'];
export const WELCOME4 = [
  { lv: [1, 3], where: 'Levels 01 to 03 of 12', name: 'Your hidden potential',
    beats: [
      { t: 'We understand you', h: 'Welcome{, first}. I believe in you.',
        p: 'You carry a lot: the rent or the payroll, the customers who went quiet, the decisions nobody else can make for you. And a dream: the business you know it can become. The elephant in the room is not what you lack. It is the strength you already have, and do not use yet.', ns: true },
      { t: 'It is possible', h: 'I have been where you are.',
        p: 'In my late teens I built kitchens and wardrobes to measure. I loved the work and the clients. I did not manage the money, the orders ran late, and my father closed the business. Years later, in 2019, I won in Classic Physique at an IFBB competition. Then I found that helping other people grow stronger meant more to me than any trophy. Helping others win became my mission.' },
      { t: 'The puzzle', h: 'We all want encouragement and direction.',
        p: 'There is always more to do than hours, a habit that holds you back without a sound, and advice written for someone else’s business. My father was a great teacher, but he was not a mentor. In Rome, my first coach became one: he asked better questions and expected me to keep my word. Someone who has walked the path gives you accountability, not just information.' },
      { t: 'Here you are', h: 'So we start with you.',
        p: 'Three questions about you, then a few on where your business really is, so every example and action is written for your size. Answer every question fully: your answers become your plan. And go back to your North Star often: it is where you practise your numbers until they move.', q: BIZ_DEF }],
    asks: [
      { k: 'stops', q: 'What do you think stops you most?', hint: 'The first one that comes to mind. Level 04 asks again.', o: STOPS },
      { k: 'use', q: 'How much of what you could do with this business are you doing today?', hint: 'Your North Star measures the same thing from your answers.', s: { min: 0, max: 100, step: 10, d: 50, unit: '%', e: ['Very little of it', 'All of it'] } },
      { k: 'walk', q: 'Who walks the path with you today?', hint: 'The person who holds you to your word, if anyone does.', o: ['Nobody: I decide alone', 'Family or friends', 'A coach, a mentor or an adviser', 'A partner or a team'] }],
    summit: { name: 'Greatness',
      beats: [
        { t: 'We understand you', h: 'Welcome to The Summit{, first}.',
          p: 'You want more than a better month. You want to build something great, and you know the hardest part is not the plan: it is becoming the person who holds it, every week, on the bad weeks too.', ns: true },
        { t: 'It is possible', h: 'Only with great people do we pull out greatness.',
          p: 'We cannot build something great without great people, and without the greatest version of ourselves. In 2019 I won in Classic Physique at an IFBB competition: nobody can lift the weights for you. Then I found that helping other people grow stronger meant more to me than any trophy. That is why I am beside you at every level.' },
        { t: 'The puzzle', h: 'Greatness is not one decision. It is every week.',
          p: 'There is always more to do than hours, a habit that pulls you back, and advice written for someone else. Alone, a plan fades by Tuesday. My father was a great teacher, but he was not a mentor. My first coach in Rome was: he asked better questions and expected me to keep my word.' },
        { t: 'Here you are', h: 'All twelve levels, and me at each one.',
          p: 'One session for each level: 45 minutes, every week, online on Google Meet. First, three questions about you, then a few on where your business really is, so every example is written for your size. Answer every question fully: your answers become your plan.', q: BIZ_DEF }] } },
  { lv: [4, 5], where: 'Levels 04 and 05 of 12', name: 'The future you',
    beats: [
      { t: 'We understand you', h: 'Three levels in{, first}. You have seen things.',
        p: 'A rule that runs your week. A feeling that decides before you do. A number you were avoiding. That took courage. And the elephant is still in the room: where you are today was built by the past, by choices you made before you knew what you know now.', told: true },
      { t: 'It is possible', h: 'The future you is already in this room.',
        p: 'The person who decides calmly, asks plainly and keeps their word is not someone else. It is you, a few weeks of practice from here. For a decade and a half I have built teams, developed leaders and helped each person grow into the best version of themselves. From here, you move forward with me.' },
      { t: 'The puzzle', h: 'Knowing is not yet doing.',
        p: 'Under pressure the old habit comes back first, and a plan that lives only in your head is gone by Tuesday afternoon. A page cannot see what you cannot see about yourself. A mentor can: I read what you wrote, I understand your business at its size, and I ask the question you hoped nobody would.' },
      { t: 'Here you are', h: 'The Boardroom: you, and me.',
        p: 'Before we speak, my team and I read your first three levels. Then I go deeper with you than any page can. Two levels: what you do, and what it makes of you. Level 05 closes Start with you with a reading of your first five weeks. Answer every question fully.',
        summit: 'With The Summit, we meet at every level. Two levels: what you do, and what it makes of you. Level 05 closes Start with you with a reading of your first five weeks. Answer every question fully.' }],
    asks: [
      { k: 'stops', q: 'What stops you most today?', hint: 'Then you see what you said in Level 01.', o: STOPS, was: [1, 'stops'] },
      { k: 'past', q: 'How much of your week is still run by old habits and old promises?', hint: 'Last week, honestly.', s: { min: 0, max: 100, step: 10, d: 50, unit: '%', e: ['None of it', 'All of it'] } },
      { k: 'want', q: 'What do you want most from me?', hint: 'I read it before we speak.', o: ['Tell me straight what you see', 'Help me choose one decision', 'Hold me to my word', 'Show me what I can’t see'] }] },
  { lv: [6, 9], where: 'Levels 06 to 09 of 12', name: 'The customer, not the ego',
    beats: [
      { t: 'We understand you', h: 'You built this with your own hands{, first}.',
        p: 'You are proud of it, and you should be. But the elephant in this room is the ego: the offer you like more than your customers do, the price set by how you feel, the work you keep because it makes you feel needed. Too much of the business still waits for you.', told: true },
      { t: 'It is possible', h: 'Get over yourself, and the business grows.',
        p: 'The market does not owe you attention. It gives it to people who are useful. Stick to what you do best, and serve people: the money follows the service, not the other way round. A business that serves without you on every task is built one conversation, one hour and one system at a time.' },
      { t: 'The puzzle', h: 'The day-to-day always wins.',
        p: 'There is no time to fix the system, because the system takes all your time. We build what we like and call it what customers want. And the hard conversations are hard at every size: one customer, or five hundred.' },
      { t: 'Here you are', h: 'The LAB: build it to serve.',
        p: 'Four levels about the inside of your business: the conversations you avoid, your week, your offer and its price, your systems. Each one asks the same question: does this serve the customer, or me? Your second session with me comes after Level 09. Answer every question fully.',
        summit: 'Four levels about the inside of your business: the conversations you avoid, your week, your offer and its price, your systems. Each one asks the same question: does this serve the customer, or me? We meet at every level. Answer every question fully.' }],
    asks: [
      { k: 'asked', q: 'When did you last ask a customer what they would change?', hint: 'Asked them directly, and listened to the answer.', o: ['This month', 'This year', 'Longer ago', 'Never, not directly', 'No customers yet'] },
      { k: 'whose', q: 'Your main offer: whose idea was it?', hint: 'The one that brings in the most money.', o: ['Mine', 'Customers asked for it', 'Both', 'I copied what others sell'] },
      { k: 'only', q: 'How much of the work can only you do today?', hint: 'If you were away for a week, what would wait for you?', s: { min: 0, max: 100, step: 10, d: 50, unit: '%', e: ['None of it', 'All of it'] } }] },
  { lv: [10, 12], where: 'Levels 10 to 12 of 12', name: 'The money',
    beats: [
      { t: 'We understand you', h: 'Let us talk about money{, first}.',
        p: 'You want more of the right customers, without living on luck and referrals. And somewhere you still feel that asking to be paid well is asking for too much. That is the elephant in this room.', told: true },
      { t: 'It is possible', h: 'Money is how the service repeats.',
        p: 'Profit is not greed. It is proof that you solved a real problem well enough that people paid for it, and it is the fuel that lets you serve more people tomorrow.', q: BIZ_DEF },
      { t: 'The puzzle', h: 'The arithmetic is cheap. The choice is not.',
        p: 'A machine can add up your sales and draw the chart in seconds. It cannot decide which customer to let go, which price to say out loud, or what to stop doing. Growth brings more people to reach and competitors who look the same. What got you here will not take you further on its own.' },
      { t: 'Here you are', h: 'The HUB: grow the market.',
        p: 'Three levels about the outside of your business: your first hundred names, your advantage, your next twelve weeks. Every number you write asks for a decision only you can make. Level 12 ends with one twelve-week number and the checkpoints to hold it, and your third session with me. Answer every question fully.',
        summit: 'Three levels about the outside of your business: your first hundred names, your advantage, your next twelve weeks. We meet at every level. Level 12 ends with one twelve-week number and the checkpoints to hold it. Answer every question fully.' }],
    asks: [
      { k: 'know', q: 'Do you know what one sale leaves you, after its costs?', hint: 'The money that stays, not the price.', o: ['Yes, to the dollar', 'Roughly', 'No', 'No sales yet'] },
      { k: 'dear', q: 'A customer says “too expensive”. What do you do?', hint: 'What you did the last time.', o: ['Lower the price', 'Explain what they get', 'Let them go, politely', 'It hasn’t happened yet'] },
      { k: 'rather', q: 'In twelve weeks, which would you rather have?', hint: 'Each one is a different decision. Level 12 holds you to it.', o: ['More customers at today’s price', 'The same customers at a better price', 'More customers who come back', 'Fewer customers: the right ones'] }] }];
/** The welcome for level lv (01, 04, 06 or 10), or null. */
export const welcomeOf = (lv) => (WELCOME_AT[lv] != null ? WELCOME4[WELCOME_AT[lv]] : null);
/** The four screens of a welcome: the Summit's own at Level 01, and its own
 *  last words at 04, 06 and 10. */
export function beatsOf(lv, summit) {
  const W = welcomeOf(lv);
  if (!W) return [];
  if (summit && W.summit && W.summit.beats) return W.summit.beats;
  return W.beats.map((b) => (summit && b.summit ? { ...b, p: b.summit } : b));
}
/** One question of a welcome (a tap, or a slider with s). */
export const askOf = (lv, k) => { const W = welcomeOf(lv); return (W && W.asks.find((a) => a.k === k)) || null; };
/** The words of a welcome answer, or ''. */
export function askWords(work, lv, k) {
  const A = askOf(lv, k), v = raw(work, lv, 'w', k);
  if (!A || v === '') return '';
  return A.s ? `${v}${A.s.unit || ''}` : (A.o[Number(v)] || '');
}

/* ── The door: which of the four versions ───────────────────────────────
 * Alexandru, 2 Nov 2026: before the Launchpad we must know which of the four
 * a founder is, and only from taps and sliders ("we're not going to check
 * every founder"): customers, people paid, sales, how clear the offer is, how
 * many people it takes to win one customer, how many say yes, how many come
 * back, what a sale leaves. Every money question has its "not yet" answer.
 * The size follows the answers (Alexandru, 2 Nov 2026): no customer yet →
 * before the first sale; customers, and nobody else paid → selling alone
 * (working alone); 1 to 14 paid → a team with payroll; 15 or more → 16
 * people or more. Saved as w.v4.where.<k>; a question that
 * does not apply (no customers yet) is skipped. */
export const TYPES4 = [
  { k: 'start', n: 'Before the first sale', sub: 'An idea, or started with no paying customer yet',
    means: 'Every example and every action is written for a founder finding the first paying customers.' },
  { k: 'solo', n: 'Selling alone', sub: 'You have customers, and you work alone',
    means: 'Every example and every action is written for one person with customers, working alone.' },
  { k: 'team', n: 'A team with payroll', sub: 'You and 1 to 14 people you pay every month',
    means: 'Every example and every action is written for an owner who pays people every month.' },
  { k: 'company', n: '16 people or more', sub: 'A bigger team: one decision moves many salaries',
    means: 'Every example and every action is written for a leader whose decisions move many salaries.' }];
export const typeName = (k) => (TYPES4.find((t) => t.k === k) || {}).n || '';
/** Asked unless the founder said no customer yet. */
const sold = (a) => a.cust !== 0;
export const WHERE4 = [
  { k: 'cust', q: 'How many customers paid you in the last three months?', hint: 'Taps and sliders only, nothing to write. It decides which of the four versions you see.',
    o: ['None yet', '1 to 10', '11 to 50', '51 to 200', 'More than 200'] },
  { k: 'sales', q: 'Your sales in a usual month, roughly?', hint: 'Before costs. A range is enough.', if: sold,
    o: ['Under $2,000', '$2,000 to $10,000', '$10,000 to $50,000', '$50,000 to $250,000', 'More than $250,000'] },
  { k: 'team', q: 'How many people do you pay every month, apart from you?', hint: 'Staff, and freelancers you pay every month.',
    o: ['Nobody yet', '1 to 4', '5 to 14', '15 to 49', '50 or more'] },
  { k: 'offer', q: 'Someone asks what you sell. How clear is your answer?', hint: 'What it is, who it is for, and its price, in one breath.',
    s: { min: 0, max: 10, step: 1, d: 5, unit: ' of 10', e: ['I ramble, or I don’t know yet', 'One sentence, and they get it'] } },
  { k: 'reach', q: 'To win one new customer, how many people do you reach first?', hint: 'Messages, calls, ads seen, meetings: all of it.', if: sold,
    o: ['Fewer than 10', '10 to 30', '30 to 100', 'More than 100', 'I don’t know'] },
  { k: 'yes', q: 'The last ten people you offered it to, directly: how many said yes?', hint: 'On a call, in a meeting, face to face.',
    s: { min: 0, max: 10, step: 1, d: 3, unit: ' of 10', e: ['Nobody', 'All ten'] }, x: ['I haven’t offered it to ten people yet'] },
  { k: 'back', q: 'Out of ten customers, how many buy again or stay?', hint: 'The ones who come back without being chased.', if: sold,
    s: { min: 0, max: 10, step: 1, d: 5, unit: ' of 10', e: ['None', 'All ten'] }, x: ['I don’t know'] },
  { k: 'margin', q: 'Out of every $100 a customer pays you, how much is left after the costs of serving them?', hint: 'Materials, hours you pay for, fees. Roughly is fine.', if: sold,
    s: { min: 0, max: 100, step: 5, d: 30, pre: '$', e: ['Nothing', 'All of it'] }, x: ['I don’t know'] },
  { k: 'win', q: 'In twelve weeks, what would tell you it worked?', hint: 'It becomes the first draft of your business goal, in My Blueprint.',
    o: ['My first paying customers', 'Steady sales every month', 'A team that runs without me on every task', 'Room to grow: more customers, more people'] }];
const whereRaw = (work, k) => { const v = work && work[`w.v4.where.${k}`]; return v == null ? '' : String(v); };
/** The founder's answers: a number (a tap's index, or a slider's value), or
 *  'x0' for a slider's "not yet" or "I don't know". */
export function whereOf(work) {
  const out = {};
  for (const k of [...WHERE4.map((Q) => Q.k), 'stage']) { const v = whereRaw(work, k); if (v !== '') out[k] = /^-?\d+(\.\d+)?$/.test(v) ? Number(v) : v; }
  return out;
}
/** Does this door question apply to the founder? (Not before a first sale.) */
export const whereApplies = (work, k) => { const Q = WHERE4.find((x) => x.k === k); return !Q || !Q.if || Q.if(whereOf(work)); };
/** The words of one answer, or ''. The stage reads as one of the four. */
export function whereWords(work, k) {
  if (k === 'stage') return typeName(sizeOf(work));
  const a = whereOf(work), Q = WHERE4.find((x) => x.k === k);
  if (!Q || a[k] == null) return '';
  if (Q.s) return typeof a[k] === 'number' ? `${Q.s.pre || ''}${a[k]}${Q.s.unit || ''}` : (Q.x || [])[Number(String(a[k]).slice(1))] || '';
  return Q.o[a[k]] || '';
}
/** The version the answers point to: start, solo, team, company; '' before the door. */
export function typeOf(work) {
  const a = whereOf(work);
  if (typeof a.cust !== 'number') return '';
  if (a.cust === 0) return 'start';
  const t = typeof a.team === 'number' ? a.team : 0;
  return t === 0 ? 'solo' : t <= 2 ? 'team' : 'company';
}
/** The size the examples speak to: the version the founder said "That's me"
 *  to (w.v4.where.stage, also set by My Blueprint), else what the door's
 *  answers point to; '' unknown. Stages 0 to 5 are the six answers of the
 *  first "Where are you now?", kept for the founders who gave them. */
export function sizeOf(work) {
  const s = whereOf(work).stage;
  if (typeof s !== 'number') return typeOf(work);
  return s < 2 ? 'start' : s === 2 ? 'solo' : s === 3 ? 'team' : 'company';
}
/** Their numbers, read back: up to three lines, each pointing at a decision
 *  and the level that works on it, never at a benchmark (AGENTS.md 9). */
export function readBack(work) {
  const a = whereOf(work), out = [];
  if (a.margin === 'x0') out.push('You don’t know what a sale leaves you. Find that number first: it decides your price, and Level 07 starts there.');
  else if (typeof a.margin === 'number' && a.margin <= 20) out.push(`$${a.margin} of every $100 is left after serving. A thin margin quietly removes your choices: Level 07 puts your hours into your price.`);
  if (a.yes === 'x0') out.push('You haven’t offered it to ten people yet. That count comes first: Level 10 is your first hundred names.');
  else if (typeof a.yes === 'number' && a.yes <= 3) out.push(`${a.yes} of 10 said yes. Is it the offer, or the people you ask? Level 08 works on the offer, Level 10 on the people.`);
  if (a.reach === 3) out.push('More than 100 people for one customer. Before you reach more, decide who you reach: Level 10.');
  if (a.back === 'x0') out.push('You don’t know how many come back. Count them this month: the ones who left are the cheapest lesson you have.');
  else if (typeof a.back === 'number' && a.back <= 4) out.push(`${a.back} of 10 come back. Level 06 has you ask a customer what would make it better: a conversation you may be avoiding.`);
  if (typeof a.offer === 'number' && a.offer <= 5) out.push(`Your offer is ${a.offer} of 10 clear. Level 08 turns it into one sentence a customer can repeat.`);
  return out.slice(0, 3);
}

/** The switch (Alexandru, 2 Nov 2026): a founder may give the wrong answer at
 *  the door. When their own answers in the levels show they are further on,
 *  we tell them and offer the version that fits. Read only from what they
 *  tapped and slid; "Keep mine" is remembered (w.v4.where.keep). */
export function switchOf(work) {
  const now = sizeOf(work);
  let to = '', why = '';
  if (now === 'start') {
    const paid = slideOf(work, 2, 3);
    if (paid != null && paid > 0) { to = 'solo'; why = `In Level 02 you said ${paid} of your last ten “interested” people paid you.`; }
    else if (tapOf(work, 6, 2) === 0 && (slideOf(work, 6, 2) || 0) > 0) { to = 'solo'; why = 'In Level 06 you wrote about an unpaid invoice: someone bought from you.'; }
  } else if (now === 'solo') {
    if ((tapOf(work, 7, 1) ?? -1) >= 2) { to = 'team'; why = 'In Level 07 you said someone else now does the task you held most.'; }
    else if ((tapOf(work, 9, 1) ?? -1) >= 2) { to = 'team'; why = 'In Level 09 you said most of the business runs when you are away for a week.'; }
  }
  if (!to || whereRaw(work, 'keep') === to) return null;
  return { from: now, to, why };
}

/** My direction (Alexandru, 2 Nov 2026): written once, one field on screen,
 *  the way a sign-in asks one thing at a time. Each line is about the founder
 *  in relation to the business, and turned to the customer: who they serve,
 *  how they serve them better, what customers say about it. Two goals for the
 *  twelve weeks (one for the business, one for the leader) and two mini-goals
 *  for the week (work, personal). Saved as w.v4.dir.<k>. Every example is
 *  marked as one, and the sizes alternate (AGENTS.md 12). */
export const DIRECTION4 = [
  { k: 'mission', label: 'My mission', q: 'Who do you serve, and what do you make better for them?', ph: 'Who I serve, and what changes for them',
    hint: 'Start with the customer, not the product: who they are, and what is better for them because of you.',
    ask: 'Not sure? Ask three customers this week: “What is better for you since you started with us?” Use their words.',
    ex: ['a founder with an idea and no money yet', 'New parents get two hours of their evening back, without the guilt.'] },
  { k: 'vision', label: 'My vision', q: 'Three years from now, what do your customers say about you?', ph: 'What my customers say, and what the business looks like',
    hint: 'Then one line on what the business looks like, so it can keep serving them that way.',
    ask: 'Ask your best customer: “What would make you tell a friend about us?” The answer is a piece of your vision.',
    ex: ['a company with 50 people', '“They answer the same day, and they fix it the first time.” Three offices, each run by its own leader.'] },
  { k: 'values', label: 'My values', q: 'Which three values will you hold with every customer, even on a bad week?', ph: 'Three values, each one a customer could see',
    hint: 'Short, and each one something a customer could notice. Once written, they are locked in: change them only on purpose.',
    ask: 'Test each one: would a customer see it this week? If not, make it plainer.',
    ex: ['an owner with 12 people and payroll every month', 'On time · The plain truth, even when it costs us · We call back the same day'], lock: true },
  { k: 'goalBiz', label: 'My business goal for 12 weeks', q: 'By the end of these twelve weeks, what number will your business reach?', ph: 'One number, and the date',
    hint: 'One number that only customers can move: paying customers, monthly sales, or customers who came back. Twelve weeks from today is {by}.',
    ask: 'Pick the number you can count every Monday.',
    ex: ['a founder with an idea and no money yet', '10 paying customers by 31 January, each asked how it went.'] },
  { k: 'goalLead', label: 'My leadership goal for 12 weeks', q: 'As a leader, what will people see you do differently by then?', ph: 'One thing someone else could check',
    hint: 'Something your people, a partner or a customer could see, not a feeling. Twelve weeks from today is {by}.',
    ask: 'Ask one person who works with you: “What is one thing I could do that would help you serve customers better?”',
    ex: ['a company with 50 people or $50 million', 'Every Friday, 20 minutes with each of my six leads, and one customer call a week we listen to together.'] },
  { k: 'miniWork', label: 'My work mini-goal this week', q: 'This week, which one step moves your business goal?', ph: 'One step, with its day',
    hint: 'Small enough to finish by Sunday, and about a customer: one you call, ask, serve or win back.',
    ask: '',
    ex: ['an owner with 12 people and payroll every month', 'Call the three clients who did not reorder, by Wednesday, and ask what we missed.'] },
  { k: 'miniLife', label: 'My personal mini-goal this week', q: 'This week, which one personal step keeps you able to lead and serve?', ph: 'One personal step, with its day',
    hint: 'Tied to the business: the time, the rest or the people that keep you serving well next week.',
    ask: '',
    ex: ['a founder with an idea and no money yet', 'Phone off at 8 pm on weeknights, so the first hour of each morning goes to customers.'] }];
/** The founder's own direction, as saved: { mission, vision, … }, '' when not written. */
export function directionOf(work) {
  const out = {};
  for (const F of DIRECTION4) { const v = work && work[`w.v4.dir.${F.k}`]; out[F.k] = v == null ? '' : String(v).trim(); }
  return out;
}
/** The goal an action serves: yourself and your people serve the leadership
 *  goal; your business and the market serve the business goal. */
export const goalFor = (d) => (d < 2 ? 'goalLead' : 'goalBiz');

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

/** The word a slider value reads as ('most days', '6 weeks', '$1,500'). */
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
/* ── Inform → Reform → Transform (Alexandru, 2 Nov 2026) ─────────────────
 * Every domain carries them (Level 01 first, then 02–12, 2 Nov 2026): PLAN4 `idea` is the concept in one sentence, its own screen
 * before the tap, with `ins` folded under it (Inform); t.why[i] answers tap i
 * at once, why that old belief doesn't hold, and s.cost answers the slider as
 * it moves, what the number costs (Reform); ck[key] checks one blank as it is
 * written, and under SMALL_UNDER per cent sure the smaller step is offered
 * now, taken as the saved key `small` (Transform). */
export const SMALL_UNDER = 60;
const domOf = (lv, d) => (LEVELS4[lv - 1] ? LEVELS4[lv - 1].d[d] : null);
/** The reply to a tap: why that old belief doesn't hold. */
export function tapReply(lv, d, t) {
  const D = domOf(lv, d);
  return D && D.t.why && t != null ? D.t.why[t] || '' : '';
}
/** The reply to the slider: what the number costs. */
export function slideReply(lv, d, v) {
  const D = domOf(lv, d);
  return D && D.s.cost && v != null ? D.s.cost(v, wordOf(D.s, v)) : '';
}
const wordsIn = (t) => String(t || '').trim().split(/\s+/).filter(Boolean).length;
/** A check on one blank, as it is written: { good, text }, or null. */
export function blankCheck(work, lv, d, key) {
  const D = domOf(lv, d), c = D && D.ck && D.ck[key], v = raw(work, lv, d, key).trim();
  if (!c || !v) return null;
  const n = v.split(/,|\band\b|&|\n/).map((x) => x.trim()).filter(Boolean).length;
  const good = (!c.words || wordsIn(v) >= c.words) && (!c.digit || /\d/.test(v)) && (!c.names || n >= c.names) && (!c.not || !new RegExp(c.not, 'i').test(v));
  const text = (good ? c.ok : c.hint || c.ok).replace(/\{(\w+)\}/g, (_, k) => (k === 'n' ? String(n) : raw(work, lv, d, k).trim() || 'the day'));
  return { good, text };
}
/** A plain note under a blank (rule 9: what a machine can do, and what is theirs). */
export const blankNote = (lv, d, key) => { const D = domOf(lv, d); return (D && D.ck && D.ck[key] && D.ck[key].note) || ''; };
/** The founder took the smaller step for this week. */
export const smallOf = (work, lv, d) => raw(work, lv, d, 'small') === '1';

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
 *  whole level. Kinds: welcome (four, one per step), wask (its taps and
 *  sliders), door (the bridge into the door, Level 01), where (the door,
 *  Level 01), you (the version), still (04, 06,
 *  10), got, idea, tap, slide, blank, day, done, lines, week, reading, carry,
 *  carryday, and Build it's bask, bstep, bday, bpage. */
export function stepsOf(lv) {
  const L = LEVELS4[lv - 1];
  if (!L) return [];
  const out = [];
  if (WELCOME_AT[lv] != null) {
    for (let i = 0; i < 4; i++) out.push([-1, 'welcome', i]);
    for (const A of welcomeOf(lv).asks) out.push([-1, 'wask', A.k]);
    if (lv === 1) { out.push([-1, 'door']); for (const Q of WHERE4) out.push([-1, 'where', Q.k]); out.push([-1, 'you']); } else out.push([-1, 'still']);
  }
  if (lv > 1) for (let d = 0; d < 4; d++) out.push([d, 'got']);
  // The level begins (Alexandru, 3 Nov 2026): after the intro, one screen that
  // says the course starts now, so the move from the intro to the four parts is clear.
  if (WELCOME_AT[lv] != null) out.push([-1, 'begin']);
  L.d.forEach((D, d) => {
    const dk = dayKeyOf(lv, d), p = planOf(lv, d);
    if (p && p.idea) out.push([d, 'idea']);
    out.push([d, 'tap'], [d, 'slide']);
    for (const [k] of fieldsOf(D)) out.push([d, k === dk && DAYISH.includes(k) ? 'day' : 'blank', k]);
    if (p && p.on) out.push([d, 'day', 'on']);
    out.push([d, 'done'], [d, 'lines']);
  });
  out.push([-1, 'week']);
  // After each chapter reading, the founder reads their direction again
  // (Alexandru, 2 Nov 2026): it still holds, or they sharpen it.
  if (CLOSES[lv] != null) out.push([-1, 'reading'], [-1, 'carry'], [-1, 'carryday'], [-1, 'dirlook'], ...buildSteps(lv));
  return out;
}
const filled = (work, lv, d, k) => raw(work, lv, d, k).trim() !== '';
/** Has the founder answered this screen? Screens that only show are always done. */
export function stepDone(work, lv, s) {
  const [d, kind, k] = s;
  // The welcome and "Where are you now?": answered, or already behind the
  // founder (they had started this level before these screens existed).
  const begunHere = tapOf(work, lv, 0) != null;
  if (kind === 'welcome') return filled(work, lv, 'w', 'seen') || begunHere;
  if (kind === 'wask') return filled(work, lv, 'w', k) || begunHere;
  // The door: a question that does not apply is passed, and a founder who
  // gave their size before the door existed is not asked again.
  const toldBefore = whereRaw(work, 'stage') !== '' && whereRaw(work, 'cust') === '';
  if (kind === 'where') return whereRaw(work, k) !== '' || !whereApplies(work, k) || toldBefore || begunHere;
  if (kind === 'you') return whereRaw(work, 'stage') !== '' || begunHere;
  if (kind === 'still') return filled(work, lv, 'w', 'stage') || begunHere;
  if (kind === 'got') return raw(work, lv - 1, d, 'got') !== '';
  // The concept counts as seen once its domain's tap is answered, so a new
  // level opens on it and a returning founder picks up where they left off.
  if (kind === 'idea' || kind === 'tap') return tapOf(work, lv, d) != null;
  if (kind === 'slide') return slideOf(work, lv, d) != null;
  if (kind === 'blank' || kind === 'day') return filled(work, lv, d, k);
  if (kind === 'done') return raw(work, lv, d, 'sure') !== '';
  if (kind === 'carry') return filled(work, lv, 'r', 'carry');
  if (kind === 'carryday') return filled(work, lv, 'r', 'on');
  if (kind === 'dirlook') return filled(work, lv, 'r', 'dir');
  // Build it: the first three process steps are needed; after them, a gap is the end.
  if (kind === 'bask' || kind === 'bday') return filled(work, lv, 'b', k);
  if (kind === 'bstep') return Number(k.slice(1)) > 3 || filled(work, lv, 'b', k);
  return true;
}
/** A screen passed over: a door question that does not apply (no customers yet). */
export const skipsStep = (work, s) => s[1] === 'where' && !whereApplies(work, s[2]);
/** A slider on a welcome or the door: it keeps where it starts, like a level's slide. */
export function slideAt(lv, s) {
  if (s[1] === 'wask') { const A = askOf(lv, s[2]); return A && A.s ? A : null; }
  if (s[1] === 'where') { const Q = WHERE4.find((x) => x.k === s[2]); return Q && Q.s ? Q : null; }
  return null;
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
 *  Worth Building (the Library's free book, wb). */
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
  return BLUEPRINT4.map((S) => ({ ...S, builds: Object.entries(BUILD4).filter(([, B]) => B.part === S.k).map(([lv, B]) => ({ lv: +lv, title: B.title, started: buildStarted(work, +lv), page: buildPage(work, +lv) })),
    items: LEVELS4.flatMap((L) => L.d.map((D, d) => ({ L, D, d, p: planOf(L.n, d) })))
    .filter((x) => x.p && x.p.bp === S.k)
    .map(({ L, D, d, p }) => ({ lv: L.n, d, name: D.name, topic: p.topic, word: L.word,
      started: fieldsOf(D).some(([k]) => filled(work, L.n, d, k)), sentence: sentence(work, L.n, d), take: takeOf(work, L.n, d) })) }));
}

/* ── Build it: one page after each chapter reading (option C, 1 Nov 2026) ──
 * The two thinnest parts of the Blueprint (systems, the next twelve weeks)
 * get one page each, built mostly from answers already given. Saved as
 * w.v4.L.b.<key> (L = 5, 9, 12). Steps: the questions (one per screen), up
 * to ten process steps (Level 05 only), the day, then the page itself. */
export const BUILD4 = {
  5: { title: 'One process in ten lines', part: 'systems',
    ins: 'A business that lives in your head stops when you do. The first process on paper is the first job that can leave your hands, and the first thing a new person can learn without you.',
    asks: [['task', 'The thing you do most often that someone else could do', 'sending the weekly invoices'],
      ['when', 'It starts when…', 'the last order of the week is delivered']],
    steps: 10, day: 'By which day will someone else follow it once?',
    who: ['who', 'Who follows it first?', 'Jordan'],
    done: '{who} followed the steps once, by {day}, without asking you.' },
  9: { title: 'Your operations page', part: 'systems',
    ins: 'Everything Levels 07 to 09 wrote, on one page: who owns what, what happens after a client says yes, the cash you watch and the review you keep. A page someone else can run the week from.',
    asks: [['who', 'Who gets a copy of this page?', 'Jordan']],
    day: 'By which day will you read it together?',
    from: [[9, 1, 'Who owns what'], [8, 1, 'After a client says yes'], [7, 1, 'Moving up, one step'], [7, 0, 'Protected hours'], [9, 2, 'Cash, every week'], [9, 0, 'The weekly review'], [9, 3, 'The warm list']],
    done: '{who} has the page, and you read it together by {day}.' },
  12: { title: 'Your twelve-week page', part: 'grow',
    ins: 'A plan is as much what you stop as what you start, and a business is built by a whole person. One page for the next twelve weeks: who you are now, the number and its checkpoints, the test, the person you grow, the one thing you say no to, and the one thing you keep for your health, your family or your rest.',
    asks: [['no', 'The one thing you will say no to for these twelve weeks', 'new projects outside my offer'],
      ['life', 'One thing for your health, your family or your rest, these twelve weeks', 'Sunday afternoons with the children, phone off']],
    day: 'By which day will the page be on your wall?',
    from: [[12, 0, 'Who I am now'], [12, 2, 'The number'], [12, 3, 'The test'], [12, 1, 'The person I grow']],
    done: 'the page is on your wall or the first page of your Planner by {day}, and one person has heard your no.' },
};
const bRaw = (work, lv, k) => raw(work, lv, 'b', k);
/** A build line with the founder's words ({key} from w.v4.L.b.key). */
export function fillB(tpl, work, lv) {
  return String(tpl).replace(/\{(\w+)\}/g, (_, k) => { const x = bRaw(work, lv, k).trim(); return x ? `<mark>${esc(x)}</mark>` : '<mark class="blank">____</mark>'; });
}
/** The screens of a build page: [-1, kind, key]. */
export function buildSteps(lv) {
  const B = BUILD4[lv];
  if (!B) return [];
  const out = B.asks.map(([k]) => [-1, 'bask', k]);
  for (let i = 1; i <= (B.steps || 0); i++) out.push([-1, 'bstep', `s${i}`]);
  if (B.who) out.push([-1, 'bask', B.who[0]]);
  out.push([-1, 'bday', 'day'], [-1, 'bpage']);
  return out;
}
/** The process steps written so far, in order, stopping at the first gap. */
export function stepsWritten(work, lv) {
  const out = [];
  for (let i = 1; i <= ((BUILD4[lv] || {}).steps || 0); i++) { const v = bRaw(work, lv, `s${i}`).trim(); if (!v) break; out.push(v); }
  return out;
}
/** Is the build page started (its first question answered)? */
export const buildStarted = (work, lv) => !!(BUILD4[lv] && bRaw(work, lv, BUILD4[lv].asks[0][0]).trim());
/** The page itself, as sections of the founder's own sentences: [[label, html]]. */
export function buildPage(work, lv) {
  const B = BUILD4[lv];
  if (!B) return [];
  if (lv === 5) {
    const s = stepsWritten(work, lv);
    return [['The process', fillB('{task}. It starts when {when}.', work, lv)], ...s.map((x, i) => [`Step ${i + 1}`, esc(x)]), ['Who follows it first', fillB('{who}', work, lv)]];
  }
  const out = B.from.map(([l, d, label]) => [label, sentence(work, l, d)]);
  if (lv === 12) out.push(['My no, for twelve weeks', fillB('{no}', work, lv)], ['For my health, family or rest', fillB('{life}', work, lv)]);
  if (lv === 9) out.push(['A copy goes to', fillB('{who}', work, lv)]);
  return out;
}

/* ── The 1:1 sessions, and the brief for Alexandru and the team ───────────
 * Three in total, one per step, as the ladder sells them (Alexandru, 2 Nov
 * 2026): the Boardroom's, the LAB's (the second), the HUB's (the third). Session 1 opens Level 04; Session 2 follows
 * the Chapter II reading; Session 3 follows the Chapter III reading. The
 * brief is built only from the founder's own answers (rule 6): what they
 * promised, what happened on Sunday, how good their estimates were. */
export const SESSIONS4 = [
  { n: 1, at: 'Opens Level 04, before its first screen', after: 3, name: 'Set the twelve weeks', levels: [1, 2, 3],
    bring: 'The North Star result, the answers of Levels 01 to 03, and the Launchpad plan counts. Alexandru and the team read them before the call.',
    agenda: [
      'Read the first three weeks together: which actions were Done, Partly, Not yet.',
      'Name the one domain that costs the business most right now.',
      'Set one number for the twelve weeks, with a date. It goes into the Planner’s twelve-week contract (Growth Plan step 5).',
      'Write the first if–then plan of Level 04 together.',
    ],
    done: 'the number and its date are in your Planner’s twelve-week contract, and your first if–then is written.' },
  { n: 2, at: 'After the Chapter II reading (end of Level 09), before Level 10', after: 9, name: 'Open the market', levels: [5, 6, 7, 8, 9],
    bring: 'The Chapter II reading, your offer line (Level 08), your three price levels and your warm list (Level 09).',
    agenda: [
      'Read the Chapter II reading together: what moved, what did not.',
      'Say the offer line and the three prices out loud, and fix what stumbles.',
      'Choose the first ten names from the warm list for Level 10.',
      'Draft the twelve-week number that Level 12 makes final.',
    ],
    show: [[8, 3, 'Their offer in one line'], [8, 2, 'Their three levels'], [7, 2, 'Their price floor'], [9, 3, 'Their warm list'], [9, 2, 'Their cash page'], [9, 1, 'Who owns what']],
    done: 'ten names are chosen for Level 10, and a first draft of the twelve-week number is written.' },
  { n: 3, at: 'After the Chapter III reading (end of Level 12)', after: 12, name: 'The next twelve weeks', levels: [9, 10, 11, 12],
    bring: 'The Chapter III reading, your twelve-week page, your market test and your Blueprint.',
    agenda: [
      'Read the twelve weeks together: what you did, how good your estimates became, where you began and where you stand now.',
      'Read your Blueprint part by part, and mark the one part to strengthen next.',
      'Set the next twelve-week number and its first checkpoint, from your twelve-week page.',
      'Choose how you keep going: on your own with the Planner, or with Alexandru and the team.',
    ],
    show: [[12, 0, 'Who they are now'], [12, 2, 'Their number'], [12, 3, 'Their market test'], [11, 2, 'Their advantage'], [10, 2, 'Their best client']],
    done: 'the next twelve-week number and its first checkpoint are in your Planner, and you know how you keep going.' },
];
/** The furthest level a founder has written in (0 when none). */
export function reachedOf(work) {
  let top = 0;
  for (const k of Object.keys(work || {})) { const m = /^w\.v4\.(\d{1,2})\.[0-3]\./.exec(k); if (m && String(work[k]).trim()) top = Math.max(top, Number(m[1])); }
  return top;
}
/** The brief for the next session: its agenda, and the founder's record
 *  over the levels it reads. Nothing is guessed: a missing answer stays out. */
export function briefOf(work) {
  const reached = reachedOf(work), S = SESSIONS4[reached >= 10 ? 2 : reached >= 5 ? 1 : 0];
  const actions = S.levels.flatMap((lv) => [0, 1, 2, 3].map((d) => ({ lv, d, name: LEVELS4[lv - 1].d[d].name, line: fill(LEVELS4[lv - 1].d[d].fb[3], work, lv, d),
    written: fieldsOf(LEVELS4[lv - 1].d[d]).some(([k]) => raw(work, lv, d, k).trim()), got: gotOf(work, lv, d), sure: sureOf(work, lv, d), notyet: notyetOf(work, lv, d) })))
    .filter((a) => a.written);
  const t = tally(work, S.levels);
  const ask = actions.filter((a) => a.got === 2).concat(actions.filter((a) => a.got === 1)).slice(0, 3);
  const show = (S.show || []).map(([lv, d, label]) => ({ label, html: sentence(work, lv, d), written: fieldsOf(LEVELS4[lv - 1].d[d]).some(([k]) => raw(work, lv, d, k).trim()) })).filter((x) => x.written);
  return { session: S, reached, actions, tally: t, ask, show };
}
