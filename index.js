// Clean Blackjack logic with bet locking and auto-stand on 21
// Uses the HTML IDs from your index.html

// ───────────────────────── STATE ─────────────────────────
const SUITS = ["♠","♥","♦","♣"];
const RANKS = [
  {name:"A", val:11},{name:"2", val:2},{name:"3", val:3},{name:"4", val:4},
  {name:"5", val:5},{name:"6", val:6},{name:"7", val:7},{name:"8", val:8},
  {name:"9", val:9},{name:"10", val:10},{name:"J", val:10},{name:"Q", val:10},{name:"K", val:10}
];

const el = {
  msg: document.getElementById("message-el"),
  sum: document.getElementById("sum-el"),
  cards: document.getElementById("cards-el"),
  split: document.getElementById("split-el"),
  dealerLabel: document.getElementById("dealer-el"),
  dealerCards: document.getElementById("dealer-cards"),
  stats: document.getElementById("stats-el"),
  player: document.getElementById("player-el"),
  betDisplay: document.getElementById("bet-display"),
  startBtn: document.getElementById("start-game-btn"),
  hitBtn: document.getElementById("new-card-btn"),
  standBtn: document.getElementById("stand-btn"),
  splitBtn: document.getElementById("split-btn"),
  refillBtn: document.getElementById("refill-btn"),
  chipBtns: Array.from(document.querySelectorAll(".chip-btn"))
};

const MAX_CHIPS = 1000;
const GameState = { BETTING:"Betting", PLAYER:"PlayerTurn", DEALER:"DealerTurn", SETTLE:"Settlement" };

let player = { name:"Player", chips:200 };
let wins=0, losses=0, pushes=0;
let currentBet = 1;
let lockedBet = 0;
let gameState = GameState.BETTING;

// hands
let playerHand = [];
let splitHand = [];
let dealerHand = []; // [up, hole, ...]

let playingSplit = false; // which hand is active in PLAYER state
let splitMode = false;
let dealt = false;

// ───────────────────────── HELPERS ─────────────────────────
function calcTotals(cards){
  let totals=[0], aces=0;
  for(const c of cards){
    totals = totals.map(t=> t + (c.rank==="A"?11:c.val));
    if (c.rank==="A") aces++;
  }
  while(aces>0 && Math.min(...totals)>21){
    totals = totals.map(t=> t-10); // convert an Ace from 11 to 1
    aces--;
  }
  totals = Array.from(new Set(totals)).sort((a,b)=>a-b);
  return totals;
}
function bestTotal(cards){
  const totals = calcTotals(cards).filter(t=>t<=21);
  return totals.length? Math.max(...totals) : Math.min(...calcTotals(cards));
}
function isBlackjack(cards){ return cards.length===2 && bestTotal(cards)===21; }
function isBust(cards){ return Math.min(...calcTotals(cards))>21; }

function drawCard(){
  const r = RANKS[Math.floor(Math.random()*RANKS.length)];
  const s = SUITS[Math.floor(Math.random()*SUITS.length)];
  return { rank:r.name, suit:s, val:r.val };
}

// ───────────────────────── RENDERING ─────────────────────────
function cardImg(card){
  // expects files like assets/spade_A.png etc.
  const map = {"♠":"spade","♥":"heart","♦":"diamond","♣":"club"};
  return `assets/${map[card.suit]}_${card.rank}.png`;
}
function renderHand(cards, containerId){
  const cont = document.getElementById(containerId);
  cont.innerHTML = "";
  cards.forEach(c=>{
    const outer = document.createElement("div");
    outer.className = "card-outer";
    const inner = document.createElement("div");
    inner.className = "card-inner flipped";
    const front = document.createElement("img");
    front.className = "card-face card-front";
    front.src = cardImg(c);
    const back = document.createElement("img");
    back.className = "card-face card-back";
    back.src = (c.suit==="♠"||c.suit==="♣")? "assets/back_black.png":"assets/back_red.png";
    inner.appendChild(back); inner.appendChild(front);
    outer.appendChild(inner);
    cont.appendChild(outer);
  });
}
function renderDealer(showAll=false){
  const cont = el.dealerCards;
  cont.innerHTML = "";
  dealerHand.forEach((c, idx)=>{
    const outer = document.createElement("div");
    outer.className = "card-outer";
    const inner = document.createElement("div");
    inner.className = "card-inner" + ((showAll||idx===0)? " flipped" : "");
    const front = document.createElement("img");
    front.className = "card-face card-front";
    front.src = cardImg(c);
    const back = document.createElement("img");
    back.className = "card-face card-back";
    back.src = (c.suit==="♠"||c.suit==="♣")? "assets/back_black.png":"assets/back_red.png";
    inner.appendChild(back); inner.appendChild(front);
    outer.appendChild(inner);
    cont.appendChild(outer);
  });
  // show total if revealed or round ended
  const showTotal = showAll || gameState!==GameState.PLAYER;
  if (showTotal){
    let t = document.createElement("span");
    t.className = "dealer-total";
    t.textContent = ` (Total: ${bestTotal(dealerHand)})`;
    cont.appendChild(t);
  }
}

function updateStats(){
  el.stats.textContent = `Wins: ${wins}  Losses: ${losses}  Pushes: ${pushes}`;
  el.player.textContent = `${player.name}: $${player.chips}`;
  el.betDisplay.textContent = `Bet: $${currentBet}`;
}
function setMessage(m){ el.msg.textContent = m; }
function updateButtons(){
  const inBet = gameState===GameState.BETTING;
  // lock chip buttons during round
  el.chipBtns.forEach(b=> b.disabled = !inBet);
  el.startBtn.disabled = !inBet || currentBet<=0 || player.chips<currentBet;
  const canPlay = gameState===GameState.PLAYER;
  el.hitBtn.disabled = !canPlay;
  el.standBtn.disabled = !canPlay;
  el.splitBtn.disabled = !canPlay || !canSplit();
}

function canSplit(){
  if (splitMode) return false;
  if (playerHand.length!==2) return false;
  return playerHand[0].val === playerHand[1].val && player.chips>=lockedBet; // need same again to cover second hand
}

// ───────────────────────── ROUND FLOW ─────────────────────────
function startBetting(){
  gameState = GameState.BETTING;
  setMessage("Place your bet and start the round.");
  updateButtons(); updateStats();
  // Clear hands
  playerHand=[]; splitHand=[]; dealerHand=[]; splitMode=false; playingSplit=false; dealt=false;
  el.cards.innerHTML=""; el.split.innerHTML=""; el.dealerCards.innerHTML="";
}
function lockBet(){
  lockedBet = currentBet;
  player.chips -= lockedBet;
}
function unlockBet(){ lockedBet = 0; }

function startGame(){
  if (gameState!==GameState.BETTING) return;
  if (currentBet<=0 || player.chips<currentBet) { setMessage("Invalid bet."); return; }
  lockBet();
  // deal two each
  playerHand=[drawCard(), drawCard()];
  dealerHand=[drawCard(), drawCard()];
  dealt = true;
  gameState = GameState.PLAYER;

  // natural blackjack check
  if (isBlackjack(playerHand)){
    // peek dealer blackjack if upcard is A or 10
    const up = dealerHand[0];
    const isTen = ["10","J","Q","K"].includes(up.rank);
    const peek = (up.rank==="A" || isTen);
    if (peek && isBlackjack(dealerHand)){
      pushes++; // push
      player.chips += lockedBet; // return bet
      gameState = GameState.SETTLE;
      setMessage("Push: both have Blackjack.");
    } else {
      // player natural BJ
      const payout = Math.floor(lockedBet * 1.5); // 3:2 simplified
      player.chips += lockedBet + payout;
      wins++;
      gameState = GameState.SETTLE;
      setMessage("Blackjack! Paid 3:2.");
    }
    renderAll();
    endRound();
    return;
  }

  setMessage("Hit or Stand?");
  renderAll();
  updateButtons();
}

function hit(){
  if (gameState!==GameState.PLAYER) return;
  if (!splitMode){
    playerHand.push(drawCard());
    const total = bestTotal(playerHand);
    if (total>21){
      setMessage("Bust!");
      losses++;
      gameState = splitMode? GameState.PLAYER : GameState.DEALER;
      // if there's a split hand later we would switch; here we don't auto add split
      renderAll();
      dealerFinishAndSettle();
      return;
    }
    if (total===21){
      // auto-stand on 21
      stand();
      return;
    }
  } else {
    splitHand.push(drawCard());
    const total = bestTotal(splitHand);
    if (total>21){
      // bust this hand; move to next/settle
      playingSplit = false;
      setMessage("Split hand busts. Back to main or dealer.");
      // if main already stood, go to dealer
      stand(); // reuse stand flow to advance
      return;
    }
    if (total===21){ stand(); return; }
  }
  renderAll();
  updateButtons();
}

function stand(){
  if (gameState!==GameState.PLAYER) return;
  if (splitMode){
    if (playingSplit){
      // finished split hand
      playingSplit=false;
      // now dealer plays
      dealerFinishAndSettle();
      return;
    } else {
      // finish main hand, move to split
      playingSplit=true;
      setMessage("Playing split hand.");
      updateButtons();
      return;
    }
  } else {
    // no split -> go to dealer
    dealerFinishAndSettle();
  }
}

function doSplit(){
  if (!canSplit()) return;
  splitMode = true;
  // move one card to split hand and draw one for each
  splitHand = [playerHand.pop()];
  playerHand.push(drawCard());
  splitHand.push(drawCard());
  // lock a second bet
  if (player.chips < lockedBet){ setMessage("Not enough chips to split."); splitMode=false; return; }
  player.chips -= lockedBet;
  playingSplit=false; // main first
  setMessage("Split: play main hand, then split.");
  renderAll();
  updateButtons();
}

// dealer draws to 17 (stand on all 17s for simplicity here; can make S17/H17 configurable)
function dealerFinishAndSettle(){
  gameState = GameState.DEALER;
  // reveal dealer hole and draw
  while (bestTotal(dealerHand) < 17){
    dealerHand.push(drawCard());
  }
  gameState = GameState.SETTLE;
  settle();
  renderAll();
  endRound();
}

function settle(){
  // Determine outcomes (support split: resolve main then split using lockedBet each)
  const hands = splitMode ? [playerHand, splitHand] : [playerHand];
  let totalPayout = 0;
  const dTotal = bestTotal(dealerHand);
  const dBust = isBust(dealerHand);

  hands.forEach(h=>{
    const pTotal = bestTotal(h);
    if (isBust(h)){
      losses++;
      // player already paid bet at lock time
      return;
    }
    if (dBust || pTotal > dTotal){
      // win pays 1:1
      wins++;
      totalPayout += lockedBet*2;
    } else if (pTotal === dTotal){
      pushes++;
      totalPayout += lockedBet; // return bet
    } else {
      losses++;
    }
  });

  player.chips += totalPayout;
  setMessage(`Round over. Dealer: ${dTotal}.`);
}

function endRound(){
  unlockBet();
  updateStats();
  updateButtons();
  // back to betting
  gameState = GameState.BETTING;
}

function renderAll(){
  renderDealer(gameState!==GameState.PLAYER);
  renderHand(playerHand, "cards-el");
  if (splitMode) renderHand(splitHand, "split-el"); else document.getElementById("split-el").innerHTML="";
  updateStats();
}

// ───────────────────────── UI HOOKS ─────────────────────────
el.chipBtns.forEach(btn=>{
  btn.addEventListener("click", ()=>{
    if (gameState!==GameState.BETTING) return; // lock during round
    const v = parseInt(btn.dataset.value,10);
    if (v > player.chips){ setMessage("Not enough chips for that bet!"); return; }
    currentBet = v;
    el.chipBtns.forEach(b=> b.classList.toggle("selected-chip", b===btn));
    updateStats(); updateButtons();
  });
});
window.startGame = startGame;
window.newCard = hit;
window.stand = stand;
window.splitHand = doSplit;
window.refillChips = function(){
  if (player.chips >= MAX_CHIPS) { setMessage(`Max $${MAX_CHIPS} reached.`); return; }
  player.chips = Math.min(player.chips + 200, MAX_CHIPS);
  updateStats();
};
// initialize
startBetting();
