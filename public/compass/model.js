(function(root){'use strict';
const domains=[
{id:'self',name:'Lead yourself',full:'Personal · Internal',icon:'◎',description:'Purpose, judgment, energy and the stories you tell yourself.',lens:'What are you building—and what is it building in you?'},
{id:'people',name:'Lead your people',full:'Personal · External',icon:'◇',description:'Trust, boundaries, support and the conversations that matter.',lens:'Which conversation would change what happens next?'},
{id:'work',name:'Lead your business',full:'Business · Internal',icon:'▥',description:'What you sell, what it costs and how the work gets done.',lens:'Does the business work when the effort is counted honestly?'},
{id:'market',name:'Lead the market',full:'Business · External',icon:'↗',description:'Customers, demand, positioning and your impact in the world.',lens:'What have customers shown you, beyond what you hope?'}];
const stages=[
 {
  "id": "building",
  "name": "Building",
  "role": "Get your first customers",
  "focus": "Turn your idea into something people buy.",
  "line": "Get clear on who you help, what you sell and what it takes to deliver it.",
  "gates": [
   "A real customer can explain the problem you solve.",
   "Someone has tried your paid offer and you know its costs.",
   "You have a clear limit for the time and money you can risk."
  ],
  "daily": "“I’m figuring out what people will pay for.”",
  "map": [
   "Your idea",
   "Your first sale",
   "A useful result"
  ],
  "next": "Next: learn how to make that sale happen again."
 },
 {
  "id": "growing",
  "name": "Growing",
  "role": "Make sales more regular",
  "focus": "Make good sales easier to repeat.",
  "line": "Find what brings customers back, keep enough money after costs and protect your time.",
  "gates": [
   "You know a way to bring in paying customers repeatedly.",
   "You check money left after costs, cash in the bank and work hours.",
   "The way you work leaves room for rest and clear agreements."
  ],
  "daily": "“Customers are buying. I need this to work more regularly.”",
  "map": [
   "Customers find you",
   "You deliver well",
   "They return or refer"
  ],
  "next": "Next: make the work easier to share with other people."
 },
 {
  "id": "scaling",
  "name": "Scaling",
  "role": "Get help. Share the work.",
  "focus": "Grow without doing everything yourself.",
  "line": "Give people clear roles, make the work easier to repeat and check that extra growth pays for itself.",
  "gates": [
   "Someone else can deliver good work or make decisions without waiting for you.",
   "You know what extra help costs and when you can pay for it.",
   "Customers still get good results as more work comes in."
  ],
  "daily": "“There is demand, but I can’t keep doing it all myself.”",
  "map": [
   "You show the way",
   "Others own the work",
   "More gets done well"
  ],
  "next": "Next: develop people who can lead and make good decisions."
 },
 {
  "id": "leading",
  "name": "Leading",
  "role": "Help others lead well",
  "focus": "Build a business that can thrive beyond you.",
  "line": "Develop other leaders, choose where money and attention go, and check the difference the business makes.",
  "gates": [
   "You compare how to use money and prepare for difficult months.",
   "People know who decides and who takes over when needed.",
   "You check results for customers, your people and the wider world."
  ],
  "daily": "“My job is to help people make good decisions and choose our direction.”",
  "map": [
   "Clear direction",
   "People who lead",
   "Lasting value"
  ],
  "next": "Keep reviewing what matters as your business and life change."
 }
];
// Questions are a proposed ExploraSelf planning structure, not a validated psychometric instrument.
const Q=[
 [
  "building",
  "self",
  "Do you know what you want this business to give you in life?",
  "Think about money, free time, health and the people you care about. What must success protect?",
  "Decide what a good business means for you",
  "Write down the income, time and relationships you want to protect. Give each one a clear limit or goal.",
  "Three clear signs that this business is good for your life."
 ],
 [
  "building",
  "self",
  "Do you know how much time and money you can afford to put at risk?",
  "What are you still guessing about? Decide how much you can spend finding out.",
  "Set a limit for your next test",
  "Choose one thing you need to learn. Set a spending limit, a deadline and a reason to stop.",
  "One small test with a clear limit."
 ],
 [
  "building",
  "people",
  "Have you talked with the people affected about the time and money this business needs?",
  "Think about your partner, family or anyone helping you. Do they know what to expect?",
  "Talk about the support you need",
  "Ask one person affected by the business what they need from you. Agree time, money and availability.",
  "One clear agreement and a date to check it."
 ],
 [
  "building",
  "people",
  "Do you ask someone you trust to tell you what might be wrong with your idea?",
  "Choose someone who can be honest with you. What would they warn you about?",
  "Ask for an honest challenge",
  "Show your offer to a trusted person. Ask why it might fail. Write down their answer before defending the idea.",
  "One concern you can check with a real test."
 ],
 [
  "building",
  "work",
  "Do you know what you sell, what it costs you and how long it takes?",
  "Count the work, materials, fees and time needed to serve one customer—including your own time.",
  "Work out the real cost of one sale",
  "List every step from the first message to the finished job. Add the money and time each step takes.",
  "One offer with its full delivery cost and time written down."
 ],
 [
  "building",
  "work",
  "Do you know how much you need to sell and keep in the bank each month?",
  "Check both the bills you need to cover and when customers actually pay you.",
  "Check next month’s money",
  "Add the numbers you know. List the money you expect to receive and pay during the next four weeks.",
  "A simple four-week money calendar."
 ],
 [
  "building",
  "market",
  "Have you asked customers about their problem and tried selling them a solution?",
  "A nice comment is encouraging. Has anyone actually agreed to pay?",
  "Talk to five possible customers",
  "Ask five people how they last tried to solve this problem. Then test a small paid offer.",
  "Five customer answers and one real sales test."
 ],
 [
  "building",
  "market",
  "Can you explain who your offer helps and what they will get?",
  "Could a customer explain it back to you? Be clear about what is included and what is not.",
  "Explain your offer in one simple sentence",
  "Write who it helps, the problem it solves, what they get and the price. Ask someone to explain it back.",
  "A possible customer can explain your offer correctly."
 ],
 [
  "growing",
  "self",
  "Do you check each week whether your time went to the right things?",
  "Which tasks helped customers or brought sales? Which kept you busy without moving things forward?",
  "See where your week goes",
  "Track your work for five days. Mark customer work, selling, improving the business and interruptions. Choose one change.",
  "One time-wasting task reduced or removed."
 ],
 [
  "growing",
  "self",
  "Can you work toward your income goal without wearing yourself out?",
  "Does your plan leave room for rest, relationships and the unexpected?",
  "Plan a week you can keep up",
  "Put rest and personal commitments in the calendar first. Check whether the customer work fits in the hours left.",
  "A weekly plan that fits your real life."
 ],
 [
  "growing",
  "people",
  "Do customers and people helping you know what is included and what happens if things change?",
  "Where do unclear expectations create extra work, delays or frustration?",
  "Make the next job clearer",
  "Review a recent difficult job. Write what is included, what costs extra and how changes will be agreed.",
  "One clearer agreement used with a real customer."
 ],
 [
  "growing",
  "people",
  "Do you ask for honest feedback and deal with difficult conversations early?",
  "Is there someone you need to talk with? What gets harder if you keep waiting?",
  "Have the conversation you are avoiding",
  "Explain what happened, how it affected the work and what you need. Ask for their view and agree a next step.",
  "One agreed next step and a date to follow up."
 ],
 [
  "growing",
  "work",
  "Do you check what is left after costs, what money arrived and how many hours you worked?",
  "Use the same month for all three. Selling more does not always mean having more cash or time.",
  "Check three numbers every week",
  "Track money left after delivery and selling costs, the lowest expected bank balance and your work hours.",
  "Four weekly check-ins in your calendar."
 ],
 [
  "growing",
  "work",
  "Can you deliver your main product or service well without starting from scratch each time?",
  "Which steps do you repeat? Where do mistakes or repeated work cost you time?",
  "Write down the steps that work",
  "Write the five main steps of your usual customer job. Add a simple way to check that each step is done well.",
  "One checklist used on the next customer job."
 ],
 [
  "growing",
  "market",
  "Do you know where new customers come from and what you spend to get them?",
  "For example: social media, referrals or ads. Count the spending and the customers from the same source.",
  "Track one way customers find you",
  "Pick one source. Record enquiries, new paying customers, money spent and money left after delivery and selling costs.",
  "One simple customer-source table, with guesses clearly marked."
 ],
 [
  "growing",
  "market",
  "Do you know why customers come back, recommend you or stop buying?",
  "Ask people who left too—not only your happiest customers.",
  "Ask three different customers",
  "Speak with a repeat buyer, someone who stopped buying and someone who chose not to buy. Compare their reasons.",
  "Three customer views and one change to try."
 ],
 [
  "scaling",
  "self",
  "Can you let someone else make a decision without taking it back?",
  "Have you explained the result you need? Different from your way does not always mean wrong.",
  "Hand over one real decision",
  "Choose a decision that is easy to change later. Explain the goal and limits, then let the other person decide.",
  "One decision completed without you stepping back in."
 ],
 [
  "scaling",
  "self",
  "Do you notice when wanting everything done your way slows the business?",
  "Where does work wait for you even though someone else could move it forward?",
  "Let one small thing move without you",
  "Choose one routine approval. Explain the limits, let the person act and review what happened afterward.",
  "One approval removed and the result reviewed."
 ],
 [
  "scaling",
  "people",
  "Does everyone know what they can decide and when they need your help?",
  "For five common decisions, could each person name who has the final say?",
  "Make five decisions easier",
  "List five recurring decisions. Agree who owns each one, their limits and when they should ask for help.",
  "Five decisions with clear owners and limits."
 ],
 [
  "scaling",
  "people",
  "Can people tell you something is going wrong and learn from mistakes?",
  "Would someone warn you early about a missed deadline or a wrong forecast?",
  "Learn from one recent mistake",
  "Talk through a recent problem without blaming anyone. Agree one change to the way you work and one skill to improve.",
  "One practical change and one learning step."
 ],
 [
  "scaling",
  "work",
  "Before taking on more work, do you check what extra help will cost and how you will pay for it?",
  "Include hiring, training and the time before new sales turn into money in the bank.",
  "Check the cost of your next growth step",
  "Compare working as you do now with hiring or outsourcing. Include the start-up costs and a slower-sales case.",
  "A simple comparison with a spending limit and decision date."
 ],
 [
  "scaling",
  "work",
  "Can the main work carry on for a while when you are not there?",
  "Has someone else actually used your process? Notice what still stops without you.",
  "Try a short break from the day-to-day work",
  "Choose a short, safe period away. Agree who covers what and when they may contact you. Record what gets stuck.",
  "A real list of tasks and decisions that still need you."
 ],
 [
  "scaling",
  "market",
  "Have you tested whether a new customer group or sales channel will still leave money after costs?",
  "What worked for your current customers may need changing for the next group.",
  "Test the next customer group on a small scale",
  "Choose one small test. Set a spending limit, the result you want customers to get and the money you need left after costs.",
  "One small test with clear signs to continue or stop."
 ],
 [
  "scaling",
  "market",
  "Do you know what would happen if your biggest customer or main sales channel disappeared?",
  "How much of your income depends on one customer, website, platform or relationship?",
  "Check your biggest dependency",
  "Work out the sales from your biggest customer and main channel. Imagine losing each one and write your first response.",
  "Two simple loss scenarios and what you would do first."
 ],
 [
  "leading",
  "self",
  "Do you know what enough looks like—and why you want the next goal?",
  "Is this goal yours? Would you still want it if nobody else knew about it?",
  "Choose what is still worth pursuing",
  "Write three things success must protect and three things you no longer need to prove. Compare them with your calendar.",
  "One goal kept, changed or dropped for a clear reason."
 ],
 [
  "leading",
  "self",
  "Do you make time to question your plans and stop work that no longer matters?",
  "Is anything continuing mainly because you have already put a lot into it?",
  "Decide what to stop, change or keep",
  "Choose one ongoing commitment. Look at its future costs and benefits. Write down what stopping would free up.",
  "One clear decision with the reason behind it."
 ],
 [
  "leading",
  "people",
  "Are you helping other people learn to lead and decide without you?",
  "Who could take a meaningful decision off your plate? What do they need to learn next?",
  "Help someone else make a bigger decision",
  "Give a future leader a useful decision with clear limits. Review their choices and what they learned afterward.",
  "One decision owned by someone else and a learning conversation."
 ],
 [
  "leading",
  "people",
  "If you were away, would people know who is responsible and who steps in?",
  "Think about customer calls, payments and difficult decisions—not just daily tasks.",
  "Rehearse who takes over",
  "Talk through a realistic absence. Check who handles decisions, bank access, customers and urgent problems.",
  "A list of gaps, who will fix them and by when."
 ],
 [
  "leading",
  "work",
  "Do you compare your options before committing money and time?",
  "What else could the same money or attention do? What is the most you can afford to lose?",
  "Compare three ways to use your resources",
  "Choose three ways to use the same money or time. Compare the likely benefit, risks and how easy each is to change.",
  "A first choice with a reason and a limit."
 ],
 [
  "leading",
  "work",
  "Have you tested how the business would handle a serious disruption?",
  "What happens if payments arrive late, delivery stops or a key person is away?",
  "Practise dealing with a disruption",
  "Walk through those three problems. Name who acts first and test one part of the response this month.",
  "Three first responses and one part actually tested."
 ],
 [
  "leading",
  "market",
  "Do you check how the business affects customers, your people and the wider world?",
  "Look for unwanted effects as well as good results. What does your usual dashboard miss?",
  "Check the real effects of your work",
  "Choose one result for customers, one for your people and one for the wider world. Find an actual example for each.",
  "Three results checked and one improvement to make."
 ],
 [
  "leading",
  "market",
  "Do you watch how customer needs are changing and adjust your plans?",
  "What might customers want next? Who is already noticing the change?",
  "Test one change in customer needs",
  "Choose one change you see coming. Talk to people experiencing it and try a small response.",
  "One small future-focused test and a date to review it."
 ]
].map((q,i)=>({id:'q'+(i+1),stage:q[0],domain:q[1],text:q[2],prompt:q[3],actionTitle:q[4],action:q[5],deliverable:q[6]}));
const evidenceSources={"building": {"self": "Open your calendar and budget. Write one dated example from them.", "people": "Open your recent messages or meeting notes. Name the person and the agreement or unanswered question.", "work": "Open your last quote, bill and job notes. Copy the costs and hours you can find.", "market": "Open your customer messages and sales records. Copy what someone asked for and whether they paid."}, "growing": {"self": "Open last week’s calendar or time log. Write the activity and hours you actually recorded.", "people": "Open the latest customer agreement or feedback message. Copy the expectation or issue you can point to.", "work": "Open this month’s sales, spending and delivery records. Copy the entry you checked.", "market": "Open your enquiry list, sales records and customer messages. Count the relevant entries and write what they show."}, "scaling": {"self": "Open your latest approval or handover messages. Name a decision that moved or waited for you.", "people": "Open your team’s task list and last review notes. Name an owner and the decision they could make.", "work": "Open the delivery schedule, supplier quotes and payment dates. Copy the hours and costs that support your answer.", "market": "Open sales by customer or channel. Copy the actual sales or test result you checked."}, "leading": {"self": "Open your calendar, commitments and budget. Name the entry you kept, changed or stopped.", "people": "Open role descriptions, handover notes and meeting decisions. Name who has actually taken ownership.", "work": "Open your spending decisions and disruption notes. Name the option compared or response tested.", "market": "Open customer outcomes, feedback and sales history. Copy an observed result or changed customer request."}};
for(const q of Q)q.prompt=evidenceSources[q.stage][q.domain]+' '+q.prompt;
const fields=[
{section:'economics',key:'revenue',label:"How much did you sell this month?",unit:'per month',help:"Count sales you have delivered, even if payment comes later. Take off refunds and sales tax/VAT."},
{section:'economics',key:'orders',label:"How many orders or client jobs did you finish?",unit:'per month',help:"Count the completed orders behind this month’s sales. One customer can place more than one order."},
{section:'economics',key:'variable',label:"What did it cost to deliver those orders?",unit:'per month',help:"Add materials, customer-job labour, fees and shipping. Leave out marketing and regular running costs."},
{section:'economics',key:'acquisition',label:"How much did you spend getting customers?",unit:'per month',help:"Add ads, marketing and sales spending for this month. Count these costs only here."},
{section:'economics',key:'fixed',label:"What were your regular running costs?",unit:'per month',help:"Rent, software and fixed wages, including any wage you pay yourself. Leave out costs already entered above, loan interest, tax and depreciation."},
{section:'economics',key:'newCustomers',label:"How many customers bought for the first time?",unit:'per month',help:"Count new paying customers this month. Use the same customer source as your marketing spending where possible."},
{section:'founder',key:'hours',label:"How many hours did you work this month?",unit:'hours / month',help:"Include selling, customer work and admin. Count your own hours only."},
{section:'founder',key:'unpaidHours',label:"How many of those hours were unpaid?",unit:'hours / month',help:"Count your hours with no wage already included in the costs above. This cannot be more than your total hours."},
{section:'founder',key:'hourValue',label:"What would you pay someone for each unpaid hour?",unit:'per hour',help:"Choose a fair hourly value for your work. This helps you see the cost of time the business does not yet pay for."},
{section:'founder',key:'availableHours',label:"How many hours can you work without overdoing it?",unit:'hours / month',help:"Choose a realistic monthly limit after rest, relationships and other commitments."},
{section:'cash',key:'cash',label:"How much business money is available today?",unit:'today',help:"Money you can actually use in the business now. Leave out personal savings and unused credit."},
{section:'cash',key:'cashIn',label:"How much money actually came in this month?",unit:'per month',help:"Customer payments received. Leave out loans and new investment. This can differ from what you sold."},
{section:'cash',key:'cashOut',label:"How much money actually went out this month?",unit:'per month',help:"Count every payment once: business costs, tax, equipment, loan payments and money you took out for yourself. Do not add the cost fields again."},
{section:'cash',key:'reserveMonths',label:"How many months of bills would you like saved?",unit:'months',help:"Choose your own safety target. There is no single right number for every business."},
{section:'market',key:'leads',label:"How many serious enquiries did you get?",unit:'per month',help:"People who showed real interest this month, from the same sources as the new customers above. Some may buy later."},
{section:'market',key:'repeatRevenue',label:"How much of your sales came from returning customers?",unit:'per month',help:"Sales this month to people who had bought from you before. This is part of your total sales, not extra."},
{section:'market',key:'largestCustomer',label:"How much did your biggest customer buy this month?",unit:'per month',help:"Sales to your single largest customer. This is part of your total sales, not extra."},
{section:'market',key:'founderDependency',label:"How much of the main work stops if you are away?",unit:'% estimate',help:"Give your best estimate from 0% to 100%. A short planned absence can help you check it."}
];

const moneyKeys=['revenue','variable','acquisition','fixed','cash','cashIn','cashOut','repeatRevenue','largestCustomer','hourValue'];
function bandsFor(key){return key==='hourValue'?[{id:'zero',low:0,high:0},{id:'h1',low:0,high:25},{id:'h2',low:25,high:50},{id:'h3',low:50,high:100},{id:'h4',low:100,high:200},{id:'h5',low:200,high:null}]:[{id:'zero',low:0,high:0},{id:'m1',low:0,high:1000},{id:'m2',low:1000,high:5000},{id:'m3',low:5000,high:10000},{id:'m4',low:10000,high:25000},{id:'m5',low:25000,high:50000},{id:'m6',low:50000,high:100000},{id:'m7',low:100000,high:null}];}
/* A chosen range is enough on its own: we use its middle (or its floor for an open top band) and mark every result that uses it with ≈. Typing the exact amount replaces it. */
function bandValue(b){return b.high===null?b.low:Math.round((b.low+b.high)/2);}
function applyMoneyChoice(state,key,choice){if(!moneyKeys.includes(key))return;state.moneyRanges=state.moneyRanges||{};if(choice==='exact'){if(state.moneyRanges[key]&&state.moneyRanges[key]!=='exact')state.numbers[key]='';state.moneyRanges[key]='exact';return;}if(choice==='unknown'){delete state.moneyRanges[key];state.numbers[key]='';return;}const band=bandsFor(key).find(x=>x.id===choice);if(!band)return;state.moneyRanges[key]=band.id;state.numbers[key]=bandValue(band);if(band.high===0&&state.legacyAmounts){delete state.legacyAmounts[key];state.needsAmountReview=Object.keys(state.legacyAmounts).length>0;}}
function estimatedKeys(state){return Object.keys(state.moneyRanges||{}).filter(key=>{const b=bandsFor(key).find(b=>b.id===state.moneyRanges[key]);return b&&(b.high===null?num(state.numbers[key])!==null:b.high>b.low);});}
const blank=()=>({version:1,profile:{name:'',business:'',type:'solo',currency:'USD',theme:'system'},stage:'building',goal:'',answers:{},evidence:{},numbers:Object.fromEntries(fields.map(f=>[f.key,''])),moneyRanges:{},entryVersion:2,needsAmountReview:false,legacyAmounts:{},scenario:{price:0,volume:0,cost:0},notes:{},strategy:{},done:{},demo:false});
const num=v=>v===''||v===null||v===undefined?null:(Number.isFinite(Number(v))?Number(v):null);
function calculate(input,scenario={price:0,volume:0,cost:0},moneyRanges={}){
 const n=Object.fromEntries(fields.map(f=>[f.key,num(input[f.key])]));const errors=[];
 for(const [key,value]of Object.entries(n)){if(value!==null&&value<0)errors.push(fields.find(f=>f.key===key).label+' cannot be negative.');}
 if(n.unpaidHours!==null&&n.hours!==null&&n.unpaidHours>n.hours)errors.push('Unpaid hours cannot exceed total founder work.');
 for(const key of ['repeatRevenue','largestCustomer'])if(n[key]!==null&&n.revenue!==null&&n[key]>n.revenue)errors.push((key==='repeatRevenue'?'Repeat-customer':'Largest customer')+' revenue cannot exceed total revenue.');
 if(n.founderDependency!==null&&n.founderDependency>100)errors.push('Founder dependency must be between 0 and 100%.');
 if(n.orders!==null&&!Number.isInteger(n.orders)||n.newCustomers!==null&&!Number.isInteger(n.newCustomers)||n.leads!==null&&!Number.isInteger(n.leads))errors.push('Orders, customers and enquiries must be whole numbers.');
 for(const key of moneyKeys){const b=bandsFor(key).find(b=>b.id===moneyRanges[key]);if(b&&n[key]!==null&&(n[key]<b.low||(b.high!==null&&n[key]>b.high)))errors.push(fields.find(f=>f.key===key).label+' The amount is outside the range you chose. Change the range or the amount.');}
 const has=(...keys)=>keys.every(k=>n[k]!==null&&n[k]>=0);const div=(a,b)=>a!==null&&b!==null&&b>0?a/b:null;
 const delivery=has('revenue','variable')?n.revenue-n.variable:null;
 const contribution=delivery!==null&&has('acquisition')?delivery-n.acquisition:null;
 const operating=contribution!==null&&has('fixed')?contribution-n.fixed:null;
 const contributionRate=div(contribution,n.revenue);
 const unpaid=has('unpaidHours','hourValue')&&(n.hours===null||n.unpaidHours<=n.hours)?n.unpaidHours*n.hourValue:null;
 const economic=operating!==null&&unpaid!==null?operating-unpaid:null;
 const cashFlow=has('cashIn','cashOut')?n.cashIn-n.cashOut:null;
 const burn=cashFlow!==null&&cashFlow<0?-cashFlow:0;
 const cashTarget=has('cashOut','reserveMonths')?n.cashOut*n.reserveMonths:null;
 const result={n,errors,delivery,contribution,contributionRate,operating,operatingMargin:div(operating,n.revenue),unpaid,economic,averageOrder:div(n.revenue,n.orders),cac:div(n.acquisition,n.newCustomers),orderContribution:div(contribution,n.orders),breakEven:contributionRate!==null&&contributionRate>0&&has('fixed')?n.fixed/contributionRate:null,hourReturn:div(operating,n.hours),capacity:div(n.hours,n.availableHours),cashFlow,burn,runway:burn>0&&has('cash')?n.cash/burn:null,buffer:div(n.cash,n.cashOut),cashTarget,bufferGap:cashTarget!==null&&has('cash')?Math.max(0,cashTarget-n.cash):null,conversion:div(n.newCustomers,n.leads),repeatShare:div(n.repeatRevenue,n.revenue),concentration:div(n.largestCustomer,n.revenue)};
 if(errors.length){for(const k of Object.keys(result))if(!['n','errors'].includes(k))result[k]=null;}
 const price=num(scenario.price)||0,volume=num(scenario.volume)||0,cost=num(scenario.cost)||0;
 result.scenario=null;
 if(!errors.length&&has('revenue','orders','variable','acquisition','fixed')&&n.orders>0){const revenue=n.revenue*(1+price/100)*(1+volume/100),variable=n.variable*(1+volume/100)*(1-cost/100);result.scenario={revenue,variable,orders:n.orders*(1+volume/100),operating:revenue-variable-n.acquisition-n.fixed,delta:revenue-variable-n.acquisition-n.fixed-operating};}
 return result;
}
function summary(state){const questions=Q.filter(q=>q.stage===state.stage),answered=questions.filter(q=>Number.isInteger(state.answers[q.id])),scores=domains.map(d=>{const qs=questions.filter(q=>q.domain===d.id),known=qs.filter(q=>Number.isInteger(state.answers[q.id])),evidenced=known.filter(q=>(state.evidence[q.id]||'').trim().length>0);return {...d,answered:known.length,total:qs.length,score:known.length===qs.length?Math.round(known.reduce((s,q)=>s+state.answers[q.id],0)/(qs.length*3)*100):null,evidenced:evidenced.length,weak:qs.filter(q=>!Number.isInteger(state.answers[q.id])||state.answers[q.id]<2||(state.evidence[q.id]||'').trim().length===0).map(q=>q.id)};});const missing=questions.filter(q=>!Number.isInteger(state.answers[q.id])||state.answers[q.id]<2||(state.evidence[q.id]||'').trim().length===0);return {questions,answered:answered.length,scores,missing,ready:missing.length===0};}
function patterns(state,c){const s=summary(state),out=[];const score=id=>s.scores.find(d=>d.id===id)?.score;
 if(c.operating!==null&&c.operating>0&&c.economic!==null&&c.economic<=0)out.push({title:'Unpaid time may be hiding the cost of delivery.',why:'The business shows money left after its costs, but that disappears when we allow for the hours you worked without a wage. Check whether your price really covers your time.',ask:'Would this offer still work if someone else had to do your unpaid hours?',action:'Cost one delivery with an honest allowance for your time.'});
 if(c.operating!==null&&c.operating>0&&c.cashFlow!==null&&c.cashFlow<0)out.push({title:'Profit and available cash tell different stories.',why:'Sales show money left after costs, yet more cash went out than came in. Late payments, equipment, loan payments or money you took out could explain it.',ask:'Which payments arrive before the customer money does?',action:'Prepare a dated four-week collection and payment forecast.'});
 if(c.capacity!==null&&c.capacity>1)out.push({title:'Your growth plan may be borrowing from your life.',why:'You worked more hours than the limit you chose. Check that both numbers cover the same month and leave room for rest and personal life.',ask:'What would you stop, change or delegate before selling more?',action:'Reduce one recurring task or redesign delivery before adding volume.'});
 if(s.scores.find(d=>d.id==='work').answered===2&&c.contribution!==null&&c.contribution<=0)out.push({title:'Check what each sale really leaves you.',why:'You have answered the business questions, but the sales you entered do not cover doing the work and getting customers. Check the numbers and what each offer costs.',ask:'What would have to be true for another sale to improve the business?',action:'Reconcile delivery cost and acquisition spending, then retest one offer.'});
 if(s.scores.find(d=>d.id==='market').answered===2&&c.cac===null)out.push({title:'Check what it costs to bring in a new customer.',why:'You have answered the market questions, but we still cannot work out spending per new customer. A spending amount or customer count is missing, or there were no first-time buyers this month.',ask:'Which evidence comes from paying customers rather than attention?',action:'Track one channel from enquiry to paying customer.'});
 if(c.concentration!==null&&c.concentration>.35)out.push({title:'A lot of your sales depend on one customer.',why:'The largest customer represents '+Math.round(c.concentration*100)+'% of the sales you entered. Alex chose a 35% prompt to ask the question below. This is not an industry benchmark or a verdict about your business.',ask:'If this customer paused for 60 days, what would you change first?',action:'Model the customer loss and identify a realistic replacement route.'});
 if(['scaling','leading'].includes(state.stage)&&c.n.founderDependency!==null&&c.n.founderDependency>50)out.push({title:'Your next stage still depends heavily on you.',why:'You estimate that more than half the main work stops without you. Alex chose the 50% prompt to ask what still needs you. This is not a verdict. Open your last delivery log and check what actually waited for you.',ask:'What must become clear so another person can act without you?',action:'Transfer one bounded decision and run a short absence test.'});
 const highWithoutNotes=s.questions.filter(q=>(state.answers[q.id]??-1)>=2&&(state.evidence[q.id]||'').trim().length===0);
 if(highWithoutNotes.length)out.push({title:'Check for confirmation bias before treating confidence as proof.',why:'You selected some evidence or tested evidence for '+highWithoutNotes.length+' reflection(s), but have not recorded an example there. The evidence may exist; the next step is to make it visible and seek a counterexample.',ask:'What observation would lead you to revise the belief you most want to be true?',action:'Record one supporting result and actively seek one disconfirming example.'});
 if(state.stage==='leading'&&Number.isInteger(state.answers.q26)&&state.answers.q26<2)out.push({title:'Check whether past investment is steering a future decision.',why:'Your response suggests that reviewing and stopping commitments is not yet a tested habit. This invites a check for sunk-cost reasoning; it does not establish that you have this bias.',ask:'If this project were offered to you for the first time today, would you choose its future costs and benefits?',action:'Compare the future value of continuing, changing or stopping one commitment.'});
 if(!out.length)out.push({title:s.answered===0?'Start with what is true today.':'Look for evidence that could change your mind.',why:s.answered===0?'You do not need a polished business to begin. Missing information is an honest starting point.':'No selected rule has flagged a tension in the data available. This is not proof that no blind spots exist.',ask:'What are you most confident about—and what would disprove it?',action:'Ask a candid peer or customer to challenge one important assumption.'});
 return out;
}
function actions(state,c){const s=summary(state),p=patterns(state,c),out=[];if(c.errors.length)return [{key:'fix-data',title:'Check the answers that do not fit together',text:c.errors.join(' '),deliverable:'A set of answers covering the same month.',domain:'work'}];
 if(c.contribution!==null&&c.contribution<=0)out.push({key:'contribution',title:'Make sure each sale leaves money after costs',text:'Pick one offer. Check its price, what it costs to deliver and what you spend to get customers. Try one small change and see how customers respond.',deliverable:'One tested offer that leaves money after delivery and selling costs.',domain:'work'});
 if(c.cashFlow!==null&&c.cashFlow<0)out.push({key:'cash',title:'Bring the cash dates into view',text:'List expected customer receipts and every payment for the next four weeks. Identify the lowest balance, then decide which collection, timing or spending change is realistic.',deliverable:'A four-week dated cash forecast.',domain:'work'});
 if(c.capacity!==null&&c.capacity>1)out.push({key:'capacity',title:'Protect the capacity you actually have',text:'Choose one recurring task to stop, simplify or transfer. Compare the hours recovered with your capacity gap before increasing sales commitments.',deliverable:'A working week inside your chosen hours.',domain:'self'});
 const ranked=[...s.questions].sort((a,b)=>((state.answers[a.id]??-1)-(state.answers[b.id]??-1))||a.id.localeCompare(b.id,undefined,{numeric:true}));
 for(const q of ranked){if(out.length>=3)break;out.push({key:q.id,title:q.actionTitle,text:q.action,deliverable:q.deliverable,domain:q.domain});}
 return out.slice(0,3);
}
function sanitize(raw){if(!raw||raw.version!==1||!raw.profile||!raw.numbers)throw Error('This is not a compatible Compass backup.');const s=blank();for(const key of ['name','business'])s.profile[key]=String(raw.profile[key]||'').slice(0,80);if(['USD','EUR','GBP','CAD','AUD'].includes(raw.profile.currency))s.profile.currency=raw.profile.currency;s.profile.type=raw.profile.type==='small'?'small':'solo';s.profile.theme=['light','dark'].includes(raw.profile.theme)?raw.profile.theme:'system';if(stages.some(x=>x.id===raw.stage))s.stage=raw.stage;{const gi=stages.findIndex(x=>x.id===raw.goal),si=stages.findIndex(x=>x.id===s.stage);s.goal=gi>=0&&(gi>si||(gi===si&&gi===stages.length-1))?raw.goal:'';}for(const q of Q){const v=raw.answers?.[q.id];if(Number.isInteger(v)&&v>=0&&v<=3)s.answers[q.id]=v;s.evidence[q.id]=String(raw.evidence?.[q.id]||'').slice(0,1500);}for(const f of fields){const v=raw.numbers[f.key];if(v===''||v==null)s.numbers[f.key]='';else if(num(v)!==null&&num(v)>=0&&num(v)<1e12)s.numbers[f.key]=num(v);else throw Error('Invalid numeric data in backup.');}for(const key of moneyKeys){const id=raw.moneyRanges?.[key];if(id==='exact'){s.moneyRanges[key]='exact';continue;}const band=bandsFor(key).find(b=>b.id===id);if(band){s.moneyRanges[key]=id;}}for(const key of ['price','volume','cost']){const v=num(raw.scenario?.[key]);s.scenario[key]=v===null?0:Math.max(key==='cost'?0:-50,Math.min(key==='volume'?100:50,v));}for(const key of ['commitment','stop','date','review','data'])s.notes[key]=String(raw.notes?.[key]||'').slice(0,2000);for(const [key,value]of Object.entries(raw.done||{}))if(value===true)s.done[key]=true;for(const st of stages){s.strategy[st.id]={};for(const d of domains){s.strategy[st.id][d.id]={};for(const key of ['goal','measure','gap','cost','decision','experiment','review'])s.strategy[st.id][d.id][key]=String(raw.strategy?.[st.id]?.[d.id]?.[key]||'').slice(0,1500);}}s.demo=raw.demo===true;s.entryVersion=2;s.legacyAmounts={};for(const key of moneyKeys){if(num(raw.legacyAmounts?.[key])!==null)s.legacyAmounts[key]=num(raw.legacyAmounts[key]);if(raw.entryVersion!==2&&s.moneyRanges[key]&&s.moneyRanges[key]!=='exact'&&bandsFor(key).find(b=>b.id===s.moneyRanges[key])?.high!==0&&s.numbers[key]!==''){s.legacyAmounts[key]=s.numbers[key];s.numbers[key]='';}}s.needsAmountReview=Object.keys(s.legacyAmounts).length>0;return s;}
const api={domains,stages,Q,fields,moneyKeys,bandsFor,bandValue,applyMoneyChoice,estimatedKeys,blank,num,calculate,summary,patterns,actions,sanitize};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Compass=api;
})(typeof globalThis!=='undefined'?globalThis:this);
