// blackjackCore.js: Game logic and state
export const SUITS = ["♠","♥","♦","♣"];
export const RANKS = [
  {name:"A", val:11},{name:"2", val:2},{name:"3", val:3},{name:"4", val:4},
  {name:"5", val:5},{name:"6", val:6},{name:"7", val:7},{name:"8", val:8},
  {name:"9", val:9},{name:"10", val:10},{name:"J", val:10},{name:"Q", val:10},{name:"K", val:10}
];
export const GameState = { BETTING:"Betting", PLAYER:"PlayerTurn", DEALER:"DealerTurn", SETTLE:"Settlement", INSURANCE:"Insurance", SURRENDER:"Surrender" };

export function drawCard() {
  const r = RANKS[Math.floor(Math.random()*RANKS.length)];
  const s = SUITS[Math.floor(Math.random()*SUITS.length)];
  return { rank:r.name, suit:s, val:r.val };
}

export function calcTotals(cards){
  let totals=[0], aces=0;
  for(const c of cards){
    totals = totals.map(t=> t + (c.rank==="A"?11:c.val));
    if (c.rank==="A") aces++;
  }
  while(aces>0 && Math.min(...totals)>21){
    totals = totals.map(t=> t-10);
    aces--;
  }
  totals = Array.from(new Set(totals)).sort((a,b)=>a-b);
  return totals;
}
export function bestTotal(cards){
  const totals = calcTotals(cards).filter(t=>t<=21);
  return totals.length? Math.max(...totals) : Math.min(...calcTotals(cards));
}
export function isBlackjack(cards){ return cards.length===2 && bestTotal(cards)===21; }
export function isBust(cards){ return Math.min(...calcTotals(cards))>21; }
export function canSplit(hand, chips, bet){
  if (hand.length!==2) return false;
  return hand[0].val === hand[1].val && chips>=bet;
}
