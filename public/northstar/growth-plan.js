/* The Massive Growth Plan: 20 + 1 steps at the end of the North Star.
 * Approved by Alexandru on 31 Oct 2026 (steps 1 to 5 are his own words,
 * English polished). Every word of the plan lives in this one file: change
 * the text here, never in the code that draws it.
 *
 * Blanks are runs of underscores (draw them as a line to write on).
 * "(day)" and "(date)" after a blank are hints, drawn small.
 * Step ids mgp-1 to mgp-21 are what a tick saves. Never renumber them.
 * "item" is a Library key (functions/api/library.js): the plan itself (mgp)
 * and plus.downloads (lgp, The Leader's Growth Planner 2027). Every download
 * goes through /api/library?item=<key>&t=<token>, never the PDF directly. */
(function () {
  window.GrowthPlan = {
    "name": "Massive Growth Plan",
    "item": "mgp",
    "subtitle": "20 + 1 steps to accelerate your growth and win with grace",
    "tagline": "For leaders who are dreamers at heart, critics in the head, <i>realistic</i> sometimes, and always ready to serve.",
    "mantra": "Inform. Reform. Transform.",
    "lead": "An action plan is not a memoir.",
    "moves": [
      "The truth you hide",
      "The root",
      "Out loud",
      "The fear",
      "Twelve weeks, measured"
    ],
    "domains": [
      {
        "k": "self",
        "name": "Lead yourself",
        "sub": "Personal · inside",
        "col": "#A8623A",
        "steps": [
          {
            "id": "mgp-1",
            "move": "The truth you hide",
            "title": "The exception you make for yourself",
            "truth": "You hold others to a standard you excuse in yourself, because you think your situation is different.",
            "lines": [
              "The standard I hold others to, but do not keep myself: ______________________________",
              "Why I tell myself I am the exception: ______________________________",
              "From today it applies to me first. The first time I keep it: ______________ (day)"
            ],
            "done": "you kept your own standard once, on the day you wrote."
          },
          {
            "id": "mgp-2",
            "move": "The root",
            "title": "The drive behind your desire",
            "truth": "Something happened to you that made you want this so much, and think this way. Find it.",
            "lines": [
              "What happened to me that made me desire this, and think this way: ______________________________",
              "The result I will never let go of: ______________________________"
            ],
            "done": "you can say both in one breath, without notes."
          },
          {
            "id": "mgp-3",
            "move": "Out loud",
            "title": "Unleash it: two habits out",
            "truth": "You play with the desire and the drive, but you never fully go after your mission: serving the people who have the problem you have the solution for.",
            "lines": [
              "Say it out loud. The two habits I keep because I only play with my drive: 1 ______________ 2 ______________",
              "What I do instead, starting ______________ (day): ______________________________"
            ],
            "done": "you said it out loud to one person, and replaced one habit for one week."
          },
          {
            "id": "mgp-4",
            "move": "The fear",
            "title": "The voice that says you are not good enough",
            "truth": "Somebody’s voice is still yelling at you. It is not yours, but you have been obeying it.",
            "lines": [
              "Whose voice is still telling me I am not good enough: ______________",
              "What it says: “______________________________”",
              "What I answer from now on: “______________________________”"
            ],
            "done": "you wrote your answer and read it aloud the next time the voice came."
          },
          {
            "id": "mgp-5",
            "move": "Twelve weeks, measured",
            "title": "Twelve weeks of truth (mandatory)",
            "truth": "Feeling in control is not control. Writing it down and measuring it is.",
            "lines": [
              "For the next 12 weeks I write down what I work on, measure my goals and estimate when each will be achieved.",
              "I start on ______________ (date). My first goal: ______________ · I estimate it done by ______________"
            ],
            "done": "week 1 is written in your Leader’s Growth Planner."
          }
        ]
      },
      {
        "k": "people",
        "name": "Lead your people",
        "sub": "Personal · outside",
        "col": "#4C7355",
        "steps": [
          {
            "id": "mgp-6",
            "move": "The truth you hide",
            "title": "The conversation you call patience",
            "truth": "There is one person in your work you avoid a real conversation with. You call it patience. It is protection.",
            "lines": [
              "The person: ______________ The conversation I avoid: ______________________________",
              "What I tell myself, so I do not have to have it: “______________________________”"
            ],
            "done": "you named the person and the conversation."
          },
          {
            "id": "mgp-7",
            "move": "The root",
            "title": "Who taught you how to lead",
            "truth": "You lead the way you were led, or exactly against it. Find which.",
            "lines": [
              "The first person who led me: ______________ What I copied from them: ______________",
              "What I swore I would never do, and still do: ______________________________",
              "I tell ______________ one thing I am changing in how I lead, by ______________ (day)."
            ],
            "done": "one person on your team has heard what you are changing."
          },
          {
            "id": "mgp-8",
            "move": "Out loud",
            "title": "Have it, face to face",
            "truth": "Said kindly and plainly, the hard sentence is a gift, not an attack.",
            "lines": [
              "The sentence I have avoided: “______________________________”",
              "I say it face to face on ______________ (day), and end with: “What do you need from me?”",
              "They answered: “______________________________”"
            ],
            "done": "the conversation happened this week."
          },
          {
            "id": "mgp-9",
            "move": "The fear",
            "title": "The fear of not being needed",
            "truth": "If they can do it without you, who are you? Answer that, and you can finally let go.",
            "lines": [
              "If my team did not need me for ______________, I would feel: ______________",
              "Who I am beyond being needed: ______________________________",
              "This week I let ______________ decide ______________ without me."
            ],
            "done": "one decision was made without you, and you let it stand."
          },
          {
            "id": "mgp-10",
            "move": "Twelve weeks, measured",
            "title": "Twelve weeks: one person grows",
            "truth": "Leadership shows in what others can do without you.",
            "lines": [
              "For 12 weeks ______________ takes on ______________ (no team yet: a tool, a template, a freelancer).",
              "Every Friday we check it in 10 minutes. Week 12, it runs without me: yes / not yet"
            ],
            "done": "the first Friday check is in your calendar."
          }
        ]
      },
      {
        "k": "work",
        "name": "Lead your business",
        "sub": "Business · inside",
        "col": "#36607F",
        "steps": [
          {
            "id": "mgp-11",
            "move": "The truth you hide",
            "title": "Where you play small",
            "truth": "Somewhere in your business you charge, ask or decide smaller than you know you should. It feels humble. It is fear.",
            "lines": [
              "Where I play small (a price, a client I keep, a cost I accept): ______________________________",
              "What it looks like at my true size: ______________________________"
            ],
            "done": "you wrote both, side by side, and did not soften the second."
          },
          {
            "id": "mgp-12",
            "move": "The root",
            "title": "What money means to you",
            "truth": "Your prices often come from your childhood, not from your market.",
            "lines": [
              "What I learned about money growing up: “______________________________”",
              "Is it true for my business today? ______________ What I believe from now on: ______________",
              "The price I raise, or the invoice I send, because of it: ______________ by ______________ (day)"
            ],
            "done": "you acted once on the new belief."
          },
          {
            "id": "mgp-13",
            "move": "Out loud",
            "title": "Your worth, out loud",
            "truth": "If you say your price with an apology, the client hears the apology, not the price.",
            "lines": [
              "My price, said plainly: “______________________________”",
              "I say it out loud, with no discount and no sorry, to ______________ by ______________ (day)."
            ],
            "done": "you said it once, then stayed silent and let them answer."
          },
          {
            "id": "mgp-14",
            "move": "The fear",
            "title": "The fear of it really working",
            "truth": "Some founders keep the business small because success would change something they are afraid to lose.",
            "lines": [
              "If this business really worked, what I am afraid would change: ______________________________",
              "What I protect on purpose from now on, so the business can grow: ______________",
              "I protect it this week on ______________ (day)."
            ],
            "done": "you named what you protect, and protected it once."
          },
          {
            "id": "mgp-15",
            "move": "Twelve weeks, measured",
            "title": "Twelve weeks: a half-day without you",
            "truth": "A business that needs you every day owns you.",
            "lines": [
              "For 12 weeks I take one half-day a week away from the business. My day: ______________",
              "After each one I write: what broke ______________ · what did not ______________"
            ],
            "done": "the first half-day away is in your calendar."
          }
        ]
      },
      {
        "k": "market",
        "name": "Lead the market",
        "sub": "Business · outside",
        "col": "#9A7418",
        "steps": [
          {
            "id": "mgp-16",
            "move": "The truth you hide",
            "title": "The people you are hiding from",
            "truth": "The people with the problem you solve are waiting for someone to ask.",
            "lines": [
              "The people who have the problem I solve, and whom I am not talking to: ______________________________",
              "Why I am not: ______________________________",
              "Three of them, by name: 1 ______________ 2 ______________ 3 ______________ I write to all three by ______________ (day)."
            ],
            "done": "three names, three messages sent."
          },
          {
            "id": "mgp-17",
            "move": "The root",
            "title": "Why asking feels like begging",
            "truth": "If selling feels like begging, you learned that asking is taking. Serving is giving, and asking is how it starts.",
            "lines": [
              "Where I learned that asking makes me a burden: ______________________________",
              "What the people I do not ask are left with: ______________________________",
              "I ask ______________ this week, as a gift, not a favor. By ______________ (day)."
            ],
            "done": "you asked one person, and meant it as service."
          },
          {
            "id": "mgp-18",
            "move": "Out loud",
            "title": "Your story, out loud",
            "truth": "People trust someone who has walked the road. Your story is the proof.",
            "lines": [
              "The problem I solve, and how I lived it myself: ______________________________",
              "I tell it out loud, in under a minute, to ______________ by ______________ (day). What they said: “______________”"
            ],
            "done": "you told your story once, out loud, in under a minute."
          },
          {
            "id": "mgp-19",
            "move": "The fear",
            "title": "The no you are afraid of",
            "truth": "A no is information, not a verdict on you.",
            "lines": [
              "What I am afraid they will say: “______________________________”",
              "What I will answer: “______________________________”"
            ],
            "done": "you heard one no, and answered it calmly."
          },
          {
            "id": "mgp-20",
            "move": "Twelve weeks, measured",
            "title": "Twelve weeks: one brave move a week",
            "truth": "Courage is a muscle. It grows only when you use it in public.",
            "lines": [
              "For 12 weeks, one brave move a week: an ask, a price, a post, a no.",
              "Every week I write: the move ______________ · what I feared ______________ · what happened ______________"
            ],
            "done": "week 1’s brave move is written in your Leader’s Growth Planner."
          }
        ]
      }
    ],
    "plus": {
      "id": "mgp-21",
      "move": "Every week",
      "title": "The Leader’s step: sit your inner boardroom every week",
      "truth": "Inside you, four voices argue about every decision. The Dreamer wants. The Critic doubts. The Realist counts. Only the Leader decides.",
      "voices": [
        {
          "name": "Dreamer",
          "q": "What do I want, and for whom?"
        },
        {
          "name": "Critic",
          "q": "What am I avoiding, and what could go wrong?"
        },
        {
          "name": "Realist",
          "q": "What will it really take: hours, money, people?"
        },
        {
          "name": "Leader",
          "q": "What is the one move this week, and who do I serve?"
        }
      ],
      "done": "every Sunday for 12 weeks, ten minutes, written down.",
      "downloads": [
        {
          "title": "The Leader’s Growth Planner 2027",
          "item": "lgp",
          "text": "Your year, your months and 52 weeks. Each week, plan it on the left and hold your Sunday boardroom on the right: what you planned, what really happened, and your one move for the week ahead."
        }
      ],
      "library": "https://linktolead.exploraself.com/ground-plan/#library"
    }
  };
})();
