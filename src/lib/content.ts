// Educational content. Plain language, no promises.

export type Term = { term: string; short: string; long: string; example: string; myth: string };

export const GLOSSARY: Term[] = [
  {
    term: "SIP",
    short: "Systematic Investment Plan: investing a fixed amount on a fixed date, usually monthly, into a mutual fund.",
    long: "A SIP is a method, not a product. It automates a regular purchase of mutual fund units. When prices are low your money buys more units, when high it buys fewer. This averages out your purchase cost over time.",
    example: "₹2,000 every month on the 5th into an index fund. After 12 months you have put in ₹24,000. What it is worth depends on the market.",
    myth: "\"SIPs give guaranteed returns.\" They don't. A SIP into an equity fund can show a loss, especially over short periods.",
  },
  {
    term: "Mutual Fund",
    short: "A pool of money from many investors, managed by a professional, invested in stocks, bonds or both.",
    long: "You buy units of the fund at its NAV (net asset value). The fund charges a yearly fee called the expense ratio. Mutual funds in India are regulated by SEBI.",
    example: "You invest ₹10,000 when the NAV is ₹50, so you get 200 units. If NAV rises to ₹55, your units are worth ₹11,000.",
    myth: "\"A fund with a high NAV is expensive.\" NAV level says nothing about value. A ₹500 NAV fund is not costlier than a ₹20 one.",
  },
  {
    term: "ETF",
    short: "Exchange-Traded Fund: a fund that trades on the stock exchange like a share.",
    long: "Most ETFs track an index such as the Nifty 50. You buy and sell them through a demat account during market hours, at market price. Costs are usually low.",
    example: "A Nifty 50 ETF unit priced at ₹250. Buying 4 units costs about ₹1,000 plus small brokerage charges.",
    myth: "\"ETFs can't fall much because they're diversified.\" An equity ETF falls when the whole market falls.",
  },
  {
    term: "Diversification",
    short: "Spreading money across different investments so one bad outcome does not sink everything.",
    long: "Different assets react differently to the same event. Mixing equity, debt, gold and cash, and many companies within equity, reduces the damage from any single loss.",
    example: "Instead of ₹50,000 in one company, ₹50,000 split across an index fund, an FD and a gold ETF.",
    myth: "\"Owning 10 stocks from the same sector is diversified.\" If the sector falls, they usually fall together.",
  },
  {
    term: "Inflation",
    short: "The rise in prices over time, which reduces what your money can buy.",
    long: "If prices rise 6% a year, ₹100 today buys what ₹94 bought a year ago. Money that earns less than inflation loses purchasing power, even if the number grows.",
    example: "A ₹1,00,000 expense today could cost about ₹1,79,000 in 10 years at 6% inflation.",
    myth: "\"Keeping money in a savings account is risk-free.\" It is safe from market falls, but not from inflation.",
  },
  {
    term: "Risk",
    short: "The chance that an investment's value goes down, or that you can't get money out when you need it.",
    long: "Risk is not only losing money. It includes volatility (big swings), liquidity risk (can't sell quickly), and the risk of not reaching your goal.",
    example: "An equity fund could fall 30% in a bad year. An FD has low market risk but its interest may not beat inflation.",
    myth: "\"Higher risk always means higher returns.\" Higher risk means a wider range of outcomes, including worse ones.",
  },
  {
    term: "Return",
    short: "What you gain or lose on an investment, usually shown as a percentage per year.",
    long: "Past returns are history, not a forecast. Always check whether a return figure is before or after fees, taxes and inflation.",
    example: "You invested ₹10,000 and it is now ₹10,800. That is a ₹800 or 8% return.",
    myth: "\"This fund gave 25% last year, so it will again.\" Last year's return does not predict next year's.",
  },
  {
    term: "Compound Growth",
    short: "Earning returns on your earlier returns, not just on what you put in.",
    long: "Compounding needs time. In the early years most of your balance is your own contributions. Growth becomes a bigger share only after many years, and only if returns are positive.",
    example: "₹1,00,000 at an assumed 8% becomes ₹1,08,000 after a year and ₹1,16,640 after two, because year two earns on ₹1,08,000.",
    myth: "\"Compounding makes anyone rich quickly.\" Compounding works slowly at first and can work against you with debt.",
  },
  {
    term: "FD",
    short: "Fixed Deposit: you lend money to a bank for a fixed period at a fixed interest rate.",
    long: "Interest rate is locked when you open it. Breaking it early usually means a penalty. Bank deposits are insured by DICGC up to ₹5 lakh per depositor per bank.",
    example: "₹50,000 for 1 year at 7% gives about ₹3,500 interest before tax.",
    myth: "\"FD interest is tax-free.\" FD interest is added to your income and taxed at your slab rate.",
  },
  {
    term: "Portfolio",
    short: "The full collection of everything you have saved and invested.",
    long: "Your portfolio includes savings, FDs, funds, gold and shares. Looking at it as a whole helps you see whether the mix fits your goals and comfort with risk.",
    example: "₹30,000 savings + ₹40,000 FD + ₹30,000 in mutual funds = a ₹1,00,000 portfolio, 30% of it in equity.",
    myth: "\"A portfolio is only for rich people.\" Your first ₹500 in savings is already a portfolio.",
  },
];

export const STOCK_TERMS: Record<string, { title: string; body: string }> = {
  pe: { title: "P/E ratio", body: "Price-to-Earnings. Share price divided by yearly profit per share. A P/E of 25 means investors pay ₹25 for every ₹1 of yearly profit. High P/E can mean high expectations, not necessarily a better company." },
  mcap: { title: "Market cap", body: "Market capitalisation. Share price × total shares. It tells you how big the company is in the market's eyes, not how much profit it makes." },
  vol: { title: "Volatility", body: "How much the price swings. High volatility means bigger ups and downs in short periods. It is a measure of bumpiness, not of quality." },
  high52: { title: "52-week range", body: "The lowest and highest price in the last year. Useful context, but a price near its low is not automatically cheap." },
  div: { title: "Dividend yield", body: "Yearly dividend per share divided by price. Companies can cut or stop dividends at any time." },
};

export type Option = {
  key: string; name: string; tagline: string; volatility: number; liquidity: string; horizon: string;
  what: string; inputs: string[]; roadmap: string[]; pros: string[]; risks: string[]; note?: string;
};

export const OPTIONS: Option[] = [
  {
    key: "savings", name: "Savings Account", tagline: "Everyday safety and instant access", volatility: 1, liquidity: "Instant", horizon: "Any time",
    what: "A bank account that pays a small interest rate on your balance. Best for money you might need at short notice, like your emergency fund.",
    inputs: ["Usually ₹0–₹10,000 minimum balance", "KYC: PAN and Aadhaar", "Interest often around 2.5%–4% a year (varies by bank)"],
    roadmap: ["Pick a bank with low charges", "Keep 3–6 months of essential expenses here or in a sweep-in FD", "Turn on alerts and UPI limits", "Move surplus beyond your cushion to a goal"],
    pros: ["Money available any time", "Deposits insured by DICGC up to ₹5 lakh per bank", "No market swings"],
    risks: ["Interest often below inflation", "Easy access can make it easy to overspend"],
  },
  {
    key: "fd", name: "Fixed Deposits (FDs)", tagline: "Locked-in rate for a fixed time", volatility: 1, liquidity: "Low until maturity", horizon: "6 months – 5 years",
    what: "You deposit a lump sum with a bank for a fixed term at an interest rate agreed on day one.",
    inputs: ["Often from ₹1,000", "Choose a term: 7 days to 10 years", "Rates differ by bank, term and age"],
    roadmap: ["Decide when you'll need the money", "Compare rates across 2–3 banks", "Consider splitting into several smaller FDs (laddering)", "Check premature withdrawal penalty"],
    pros: ["Predictable outcome", "Insured by DICGC up to ₹5 lakh per bank", "Simple to understand"],
    risks: ["Penalty for breaking early", "Interest is taxable at your slab rate", "May not beat inflation after tax"],
  },
  {
    key: "mf", name: "Mutual Funds / SIPs", tagline: "Professional pooling, started small", volatility: 3, liquidity: "1–3 working days", horizon: "3+ years (equity: 5+)",
    what: "A mutual fund pools money from many people and invests it. A SIP is simply a way of investing in a fund regularly, such as ₹1,000 each month. SIP is the method; the fund is the asset.",
    inputs: ["SIPs from ₹100–₹500 a month", "KYC via any AMC, registrar or platform", "Choose fund type: equity, debt, hybrid, index"],
    roadmap: ["Complete KYC once", "Start with a simple index or hybrid fund", "Pick a SIP amount you can keep paying in bad months", "Review once a year, not every day"],
    pros: ["Diversified from small amounts", "Regulated by SEBI", "SIPs build a habit and average your buying price"],
    risks: ["Equity funds can fall 20–40% in a bad year", "Expense ratio reduces returns", "Past performance does not repeat reliably"],
    note: "SIP is not an asset class. You can run a SIP into a debt fund (lower swings) or an equity fund (bigger swings).",
  },
  {
    key: "gold", name: "Gold", tagline: "A traditional hedge, with its own swings", volatility: 3, liquidity: "Same day to a few days", horizon: "5+ years",
    what: "Owning gold as jewellery, coins, or digitally through gold ETFs and gold mutual funds. Prices move with global demand and the rupee.",
    inputs: ["Gold ETF from the price of 1 unit (often under ₹100)", "Gold mutual funds from ₹100–₹500", "Physical gold involves making charges and storage"],
    roadmap: ["Decide what share of savings, if any, goes to gold (often 5–10% in examples)", "Prefer ETFs or funds over jewellery for investing", "Check expense ratio and tracking", "Hold for the long term"],
    pros: ["Behaves differently from stocks at times", "Easy to buy in small amounts digitally", "Widely understood"],
    risks: ["Can stay flat or fall for years", "No interest or dividend", "Jewellery has making charges you don't get back"],
  },
  {
    key: "stocks", name: "Stocks / ETFs", tagline: "Part-ownership in companies", volatility: 5, liquidity: "Same day (T+1 settlement)", horizon: "7+ years",
    what: "A share is a small piece of a company. An ETF bundles many shares into one trade, like a whole index.",
    inputs: ["Demat and trading account", "KYC: PAN, Aadhaar, bank proof", "Price of 1 share or ETF unit, plus small charges"],
    roadmap: ["Learn with practice mode first", "Open a demat account with a SEBI-registered broker", "Start with a broad index ETF before single stocks", "Never invest money you need within 5 years"],
    pros: ["Highest long-term growth potential of these options", "Easy to buy and sell", "Index ETFs are low-cost"],
    risks: ["Single stocks can fall 50%+ or go to zero", "Emotional decisions in crashes", "Tips and 'sure shots' on social media are a common trap"],
  },
];

export type QuizQ = { q: string; answer: boolean; explain: string };

export const QUIZ: QuizQ[] = [
  { q: "A SIP guarantees you will never lose money.", answer: false, explain: "A SIP is just a regular way of investing. If the fund falls, your SIP value falls too." },
  { q: "You should build an emergency fund before investing in stocks.", answer: true, explain: "An emergency fund stops you from selling investments at a loss when life happens." },
  { q: "If a stock fell 50%, a 50% rise brings it back to where it started.", answer: false, explain: "₹100 falls to ₹50. A 50% rise takes it to ₹75. You'd need +100% to recover." },
  { q: "Money in a savings account can lose value even if the balance grows.", answer: true, explain: "If prices rise faster than your interest, you can buy less with it. That's inflation." },
  { q: "A mutual fund with a ₹10 NAV is cheaper and better than one with a ₹500 NAV.", answer: false, explain: "NAV is just the price per unit. It says nothing about value or future returns." },
  { q: "Bank deposits in India are insured up to ₹5 lakh per depositor per bank.", answer: true, explain: "DICGC insures deposits up to ₹5 lakh per depositor, per bank, including principal and interest." },
  { q: "Stock tips from a trusted Telegram group are a safe shortcut.", answer: false, explain: "Unregistered tips are a common route to scams and pump-and-dump schemes. Check SEBI registration." },
  { q: "Investing ₹500 more each month adds exactly ₹6,000 of your own money per year.", answer: true, explain: "₹500 × 12 months = ₹6,000 of contributions. Any growth is separate and not guaranteed." },
];

export type Faq = { q: string; short: string; detail: string; keys: string[]; link?: string };

export const FAQ: Faq[] = [
  { q: "What is a SIP?", keys: ["sip", "systematic"], short: "A SIP is a way to invest a fixed amount into a mutual fund on a schedule, usually monthly.", detail: "It's a method, not a product. Because you buy every month, you buy more units when prices are low and fewer when high. It builds discipline. It does not remove risk: if the fund falls, so does your SIP value. Many funds allow SIPs from ₹100–₹500." },
  { q: "Saving vs. Investing?", keys: ["saving", "investing", "difference", "vs"], short: "Saving keeps money safe and available. Investing accepts risk for a chance of more growth.", detail: "Save for things within ~3 years and for emergencies: savings accounts, FDs. Invest for goals 5+ years away, where you can ride out falls: equity funds, ETFs. Most people need both, and saving usually comes first." },
  { q: "How much emergency fund do I need?", keys: ["emergency", "cushion", "buffer"], short: "A common guideline is 3–6 months of essential expenses.", detail: "Essentials means rent, food, bills, EMIs, insurance. If your income is irregular or you support family, lean toward 6 months or more. Keep it somewhere you can reach within a day, like a savings account or sweep-in FD." },
  { q: "Why do markets fall?", keys: ["fall", "crash", "drop", "down", "market"], short: "Prices fall when fear, bad news or weaker profits make more people want to sell than buy.", detail: "Triggers include recessions, interest-rate rises, global events, or simply prices having run ahead of profits. Falls are a normal part of investing. Nobody can reliably predict when they'll happen or how long they last. That's why money you need soon shouldn't be in equity." },
  { q: "Is an FD safe?", keys: ["fd", "fixed deposit", "safe"], short: "FDs have very low market risk, and bank deposits are insured up to ₹5 lakh per depositor per bank.", detail: "The main risks are inflation (your real return may be small after tax) and the penalty for breaking it early. Spreading large amounts across banks keeps each within the insurance limit." },
  { q: "How do I start investing with ₹500?", keys: ["500", "start", "begin", "small"], short: "Many mutual funds accept SIPs from ₹100–₹500 a month.", detail: "First: an emergency cushion and no high-interest debt. Then complete KYC, pick a simple diversified fund (an index fund is a common starting point), and set up a SIP you can keep paying. Use the Practice mode here to get comfortable first." },
  { q: "What is an index fund?", keys: ["index", "nifty", "sensex"], short: "A fund that copies a market index like the Nifty 50 instead of picking stocks.", detail: "Because it doesn't need analysts picking stocks, costs are usually low. You get the market's return minus small fees, which includes the market's falls too." },
  { q: "How do I spot a scam?", keys: ["scam", "fraud", "tip", "telegram", "guaranteed"], short: "Guaranteed high returns, pressure to act fast, and unregistered advisers are red flags.", detail: "Check if an adviser is registered on the SEBI website. Never share OTPs or move money to personal accounts. If something promises to double your money quickly, walk away." },
];

export const RESOURCES = [
  { org: "SEBI", title: "SEBI Investor Website", body: "Investor education, registered intermediaries and complaint filing.", url: "https://investor.sebi.gov.in/" },
  { org: "RBI", title: "RBI Kehta Hai", body: "RBI's public awareness campaign on safe banking and fraud.", url: "https://rbikehtahai.rbi.org.in/" },
  { org: "NISM", title: "NISM Investor Education", body: "SEBI's institute for securities markets education and certifications.", url: "https://www.nism.ac.in/" },
  { org: "AMFI", title: "Mutual Funds Sahi Hai", body: "AMFI's beginner explainers on mutual funds and SIPs.", url: "https://www.mutualfundssahihai.com/" },
  { org: "YouTube", title: "What is a SIP?", body: "Search results for beginner SIP explainers.", url: "https://www.youtube.com/results?search_query=what+is+SIP+explained+beginners+India" },
  { org: "YouTube", title: "Emergency fund basics", body: "Search results for emergency fund explainers.", url: "https://www.youtube.com/results?search_query=emergency+fund+explained+India" },
];
