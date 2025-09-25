import { SUITS, RANKS, GameState, drawCard, calcTotals, bestTotal, isBlackjack, isBust, canSplit } from './blackjackCore.js';
import { cardImg, renderHand, renderDealer } from './blackjackUI.js';

// ───────────────────────── STATE ─────────────────────────

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
  chipBtns: Array.from(document.querySelectorAll(".chip-btn")),
  doubleBtn: document.getElementById("double-btn"),
  surrenderBtn: document.getElementById("surrender-btn"),
  insuranceBtn: document.getElementById("insurance-btn")
};

const MAX_CHIPS = 1000;

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

let insuranceOffered = false;
let insuranceBet = 0;
let doubleDownUsed = false;
let surrendered = false;
let splitAces = false;
let dealerHitsSoft17 = false; // configurable

// ───────────────────────── HELPERS ─────────────────────────

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
  el.doubleBtn.disabled = !canPlay;
}

function renderAll(){
  renderDealer(dealerHand, gameState!==GameState.PLAYER, gameState, GameState);
  renderHand(playerHand, "cards-el");
  if (splitMode) renderHand(splitHand, "split-el"); else document.getElementById("split-el").innerHTML="";
  updateStats();
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

function offerInsurance() {
  if (gameState !== GameState.PLAYER) return;
  const up = dealerHand[0];
  if (up.rank === 'A' && !insuranceOffered) {
    setMessage('Dealer shows Ace. Insurance?');
    insuranceOffered = true;
    // Show insurance button, handle insurance bet
    el.insuranceBtn.style.display = 'inline-block';
    el.insuranceBtn.onclick = () => {
      insuranceBet = Math.floor(lockedBet / 2);
      if (player.chips < insuranceBet) {
        setMessage('Not enough chips for insurance.');
        return;
      }
      player.chips -= insuranceBet;
      setMessage('Insurance placed.');
      el.insuranceBtn.style.display = 'none';
    };
  }
}

function doubleDown() {
  if (gameState !== GameState.PLAYER || doubleDownUsed) return;
  if (player.chips < lockedBet) {
    setMessage('Not enough chips to double down.');
    return;
  }
  player.chips -= lockedBet;
  lockedBet *= 2;
  doubleDownUsed = true;
  hit();
  stand();
}

function surrender() {
  if (gameState !== GameState.PLAYER || surrendered) return;
  surrendered = true;
  setMessage('You surrendered. Half bet returned.');
  player.chips += Math.floor(lockedBet / 2);
  losses++;
  gameState = GameState.SETTLE;
  renderAll();
  endRound();
}

function doSplitAces() {
  if (!canSplit(playerHand, player.chips, lockedBet)) return;
  if (playerHand[0].rank === 'A' && playerHand[1].rank === 'A') {
    splitAces = true;
    splitMode = true;
    splitHand = [playerHand.pop()];
    playerHand.push(drawCard());
    splitHand.push(drawCard());
    // Only one card per Ace
    setMessage('Split Aces: Only one card per hand.');
    renderAll();
    updateButtons();
    stand(); // auto-stand after one card
    return;
  }
  doSplit();
}

// dealer draws to 17 (stand on all 17s for simplicity here; can make S17/H17 configurable)
function dealerFinishAndSettle(){
  gameState = GameState.DEALER;
  // Dealer hits to 17, configurable for soft 17
  while (true) {
    let total = bestTotal(dealerHand);
    let hasAce = dealerHand.some(c => c.rank === 'A');
    if (total < 17) {
      dealerHand.push(drawCard());
    } else if (dealerHitsSoft17 && total === 17 && hasAce) {
      dealerHand.push(drawCard());
    } else {
      break;
    }
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
  insuranceOffered = false;
  insuranceBet = 0;
  doubleDownUsed = false;
  surrendered = false;
  splitAces = false;
  updateStats();
  updateButtons();
  // back to betting
  gameState = GameState.BETTING;
  el.insuranceBtn.style.display = 'none';
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
el.doubleBtn.onclick = doubleDown;
el.surrenderBtn.onclick = surrender;
el.insuranceBtn.style.display = 'none';
el.splitBtn.onclick = doSplitAces;
el.startBtn.onclick = startGame;
el.hitBtn.onclick = hit;
el.standBtn.onclick = stand;
el.refillBtn.onclick = function(){
  if (player.chips >= MAX_CHIPS) { setMessage(`Max $${MAX_CHIPS} reached.`); return; }
  player.chips = Math.min(player.chips + 200, MAX_CHIPS);
  updateStats();
};
// initialize
startBetting();
