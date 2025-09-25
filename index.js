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
  insuranceBtn: document.getElementById("insurance-btn"),
  // New game status display elements
  dealerScoreDisplay: document.getElementById("dealer-score-display"),
  playerScoreDisplay: document.getElementById("player-score-display"),
  currentBetDisplay: document.getElementById("current-bet-display"),
  balanceDisplay: document.getElementById("balance-display"),
  outcomeMessage: document.getElementById("game-outcome-message"),
  // Split hands elements
  splitHandsContainer: document.getElementById("split-hands-container"),
  splitHand1: document.getElementById("split-hand-1"),
  splitHand2: document.getElementById("split-hand-2"),
  splitTotal1: document.getElementById("split-total-1"),
  splitTotal2: document.getElementById("split-total-2")
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

function updateGameStatusDisplay(){
  // Update dealer score (only show visible cards during player turn)
  let dealerScore = "";
  if (dealerHand.length > 0) {
    if (gameState === GameState.PLAYER) {
      // Only show first card during player turn
      dealerScore = `Dealer: ${dealerHand[0].val}`;
    } else {
      // Show full total during dealer turn and after
      dealerScore = `Dealer: ${bestTotal(dealerHand)}`;
    }
  } else {
    dealerScore = "Dealer: --";
  }
  el.dealerScoreDisplay.textContent = dealerScore;
  
  // Update player score
  let playerScore = "";
  if (playerHand.length > 0) {
    playerScore = `Player: ${bestTotal(playerHand)}`;
    if (splitMode && splitHand.length > 0) {
      playerScore = `Hand 1: ${bestTotal(playerHand)} | Hand 2: ${bestTotal(splitHand)}`;
    }
  } else {
    playerScore = "Player: --";
  }
  el.playerScoreDisplay.textContent = playerScore;
  
  // Update current bet and balance
  el.currentBetDisplay.textContent = `Bet: $${lockedBet || currentBet}`;
  el.balanceDisplay.textContent = `Balance: $${player.chips}`;
}
function setMessage(m){ el.msg.textContent = m; }

function showOutcomeMessage(message, type = "") {
  el.outcomeMessage.textContent = message;
  el.outcomeMessage.className = `outcome-message ${type}`;
}

function clearOutcomeMessage() {
  el.outcomeMessage.textContent = "";
  el.outcomeMessage.className = "outcome-message";
}
function updateButtons(){
  const inBet = gameState===GameState.BETTING;
  // lock chip buttons during round
  el.chipBtns.forEach(b=> b.disabled = !inBet);
  el.startBtn.disabled = !inBet || currentBet<=0 || player.chips<currentBet;
  const canPlay = gameState===GameState.PLAYER;
  el.hitBtn.disabled = !canPlay;
  el.standBtn.disabled = !canPlay;
  el.splitBtn.disabled = !canPlay || !canSplit(playerHand, player.chips, lockedBet);
  
  // Double down - only available on first two cards and if player has enough chips
  el.doubleBtn.disabled = !canPlay || doubleDownUsed || 
    (playerHand.length > 2) || (player.chips < lockedBet) ||
    (splitMode && ((playingSplit && splitHand.length > 2) || (!playingSplit && playerHand.length > 2)));
  
  // Surrender - only available on first turn with first two cards
  el.surrenderBtn.disabled = !canPlay || surrendered || 
    (playerHand.length > 2) || splitMode;
  
  // Insurance - only show when dealer shows Ace and not already offered
  const dealerShowsAce = dealerHand.length > 0 && dealerHand[0].rank === 'A';
  if (dealerShowsAce && gameState === GameState.PLAYER && !insuranceOffered) {
    el.insuranceBtn.style.display = 'inline-block';
    el.insuranceBtn.disabled = player.chips < Math.floor(lockedBet / 2);
  } else {
    el.insuranceBtn.style.display = 'none';
  }
}

function renderAll(){
  renderDealer(dealerHand, gameState!==GameState.PLAYER, gameState, GameState);
  
  if (splitMode) {
    // Hide regular cards display, show split hands container
    el.cards.style.display = 'none';
    el.split.style.display = 'none';
    el.splitHandsContainer.style.display = 'flex';
    
    // Render both split hands
    renderHand(playerHand, "split-hand-1");
    renderHand(splitHand, "split-hand-2");
    
    // Update totals
    el.splitTotal1.textContent = `Total: ${bestTotal(playerHand)}`;
    el.splitTotal2.textContent = `Total: ${bestTotal(splitHand)}`;
    
    // Highlight active hand
    const hand1Container = el.splitHand1.closest('.split-hand-display');
    const hand2Container = el.splitHand2.closest('.split-hand-display');
    hand1Container.classList.toggle('active', !playingSplit);
    hand2Container.classList.toggle('active', playingSplit);
  } else {
    // Show regular cards display, hide split container
    el.cards.style.display = 'flex';
    el.splitHandsContainer.style.display = 'none';
    renderHand(playerHand, "cards-el");
    el.split.innerHTML = "";
  }
  
  updateStats();
  updateGameStatusDisplay();
}

// ───────────────────────── ROUND FLOW ─────────────────────────
function startBetting(){
  gameState = GameState.BETTING;
  setMessage("Place your bet and start the round.");
  clearOutcomeMessage();
  updateButtons(); updateStats(); updateGameStatusDisplay();
  // Clear hands
  playerHand=[]; splitHand=[]; dealerHand=[]; splitMode=false; playingSplit=false; dealt=false;
  el.cards.innerHTML=""; el.split.innerHTML=""; el.dealerCards.innerHTML="";
  // Reset split display
  el.splitHandsContainer.style.display = 'none';
  el.cards.style.display = 'flex';
  if (el.splitHand1) el.splitHand1.innerHTML="";
  if (el.splitHand2) el.splitHand2.innerHTML="";
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
  clearOutcomeMessage();
  
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
      setMessage("Both have Blackjack!");
      showOutcomeMessage("Push: Bet returned", "push");
    } else {
      // player natural BJ
      const payout = Math.floor(lockedBet * 1.5); // 3:2 simplified
      player.chips += lockedBet + payout;
      wins++;
      gameState = GameState.SETTLE;
      setMessage("Blackjack!");
      showOutcomeMessage(`Blackjack: +$${payout}`, "win");
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
      showOutcomeMessage(`Player busts: -$${lockedBet}`, "lose");
      losses++;
      gameState = splitMode? GameState.PLAYER : GameState.DEALER;
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
    const currentHand = playingSplit ? splitHand : playerHand;
    currentHand.push(drawCard());
    const total = bestTotal(currentHand);
    if (total>21){
      // bust this hand; move to next/settle
      if (playingSplit) {
        setMessage("Split hand busts.");
        showOutcomeMessage(`Split hand busts: -$${lockedBet}`, "lose");
        playingSplit = false;
        dealerFinishAndSettle();
      } else {
        setMessage("Main hand busts. Playing split hand.");
        playingSplit = true;
      }
      renderAll();
      updateButtons();
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
  if (!canSplit(playerHand, player.chips, lockedBet)) return;
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

function takeInsurance() {
  if (gameState !== GameState.PLAYER || insuranceOffered) return;
  
  const insuranceCost = Math.floor(lockedBet / 2);
  if (player.chips < insuranceCost) {
    setMessage('Not enough chips for insurance.');
    return;
  }
  
  player.chips -= insuranceCost;
  insuranceBet = insuranceCost;
  insuranceOffered = true;
  setMessage('Insurance placed.');
  el.insuranceBtn.style.display = 'none';
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
  
  // Check if it's valid to double down (first two cards only)
  const currentHand = (!splitMode) ? playerHand : (playingSplit ? splitHand : playerHand);
  if (currentHand.length > 2) {
    setMessage('Can only double down on first two cards.');
    return;
  }
  
  player.chips -= lockedBet;
  lockedBet *= 2;
  doubleDownUsed = true;
  setMessage('Doubled down! Drawing one card...');
  
  // Draw one card and stand
  hit();
  
  // Auto-stand after double down (unless busted)
  if (gameState === GameState.PLAYER) {
    setTimeout(() => stand(), 500);
  }
  
  renderAll();
  updateButtons();
}

function surrender() {
  if (gameState !== GameState.PLAYER || surrendered || splitMode) return;
  if (playerHand.length > 2) {
    setMessage('Can only surrender on first two cards.');
    return;
  }
  
  surrendered = true;
  const halfBet = Math.floor(lockedBet / 2);
  const lostAmount = lockedBet - halfBet;
  setMessage('You surrendered.');
  showOutcomeMessage(`Surrender: -$${lostAmount}`, "lose");
  player.chips += halfBet; // Return half the bet
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
  // Handle insurance payout first
  let insuranceMessage = "";
  if (insuranceBet > 0) {
    if (isBlackjack(dealerHand)) {
      player.chips += insuranceBet * 3; // Insurance pays 2:1 plus return of bet
      insuranceMessage = ` (Insurance pays $${insuranceBet * 2})`;
    } else {
      insuranceMessage = ` (Insurance lost: -$${insuranceBet})`;
    }
  }
  
  // Determine outcomes (support split: resolve main then split using lockedBet each)
  const hands = splitMode ? [playerHand, splitHand] : [playerHand];
  let totalPayout = 0;
  const dTotal = bestTotal(dealerHand);
  const dBust = isBust(dealerHand);
  
  let outcomeMessages = [];

  hands.forEach((h, index)=>{
    const pTotal = bestTotal(h);
    const handLabel = splitMode ? `Hand ${index + 1}` : "";
    const betAmount = lockedBet / (splitMode ? 2 : 1); // Split bet in half for split hands
    
    if (isBust(h)){
      losses++;
      outcomeMessages.push(`${handLabel} Bust: -$${betAmount}`);
      return;
    }
    
    if (dBust || pTotal > dTotal){
      // win pays 1:1
      wins++;
      totalPayout += betAmount * 2;
      outcomeMessages.push(`${handLabel} Win: +$${betAmount}`);
    } else if (pTotal === dTotal){
      pushes++;
      totalPayout += betAmount; // return bet
      outcomeMessages.push(`${handLabel} Push: Bet returned`);
    } else {
      losses++;
      outcomeMessages.push(`${handLabel} Lose: -$${betAmount}`);
    }
  });

  player.chips += totalPayout;
  
  // Show outcome message
  const mainMessage = outcomeMessages.join(" | ");
  const fullMessage = mainMessage + insuranceMessage;
  
  if (dBust) {
    setMessage(`Dealer busts with ${dTotal}!`);
    showOutcomeMessage(fullMessage, "win");
  } else if (outcomeMessages.some(msg => msg.includes("Win"))) {
    setMessage(`Final scores - Player vs Dealer: ${dTotal}`);
    showOutcomeMessage(fullMessage, "win");  
  } else if (outcomeMessages.every(msg => msg.includes("Push"))) {
    setMessage(`Push - tied with dealer at ${dTotal}`);
    showOutcomeMessage(fullMessage, "push");
  } else {
    setMessage(`Dealer wins with ${dTotal}`);
    showOutcomeMessage(fullMessage, "lose");
  }
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
  if (el.insuranceBtn) el.insuranceBtn.style.display = 'none';
}

// ───────────────────────── UI HOOKS ─────────────────────────
el.chipBtns.forEach(btn=>{
  btn.addEventListener("click", ()=>{
    if (gameState!==GameState.BETTING) return; // lock during round
    const v = parseInt(btn.dataset.value,10);
    if (v > player.chips){ setMessage("Not enough chips for that bet!"); return; }
    currentBet = v;
    el.chipBtns.forEach(b=> b.classList.toggle("selected-chip", b===btn));
    updateStats(); 
    updateGameStatusDisplay();
    updateButtons();
  });
});
window.startGame = startGame;
window.newCard = hit;
window.stand = stand;
window.splitHand = doSplitAces;
window.doubleDown = doubleDown;
window.surrender = surrender;
window.takeInsurance = takeInsurance;
window.refillChips = function(){
  if (player.chips >= MAX_CHIPS) { setMessage(`Max $${MAX_CHIPS} reached.`); return; }
  player.chips = Math.min(player.chips + 200, MAX_CHIPS);
  updateStats();
  updateGameStatusDisplay();
};
// Only set onclick for elements that exist
if (el.doubleBtn) el.doubleBtn.onclick = doubleDown;
if (el.surrenderBtn) el.surrenderBtn.onclick = surrender;
if (el.insuranceBtn) {
  el.insuranceBtn.style.display = 'none';
  el.insuranceBtn.onclick = null;
}
el.splitBtn.onclick = doSplitAces;
// initialize
startBetting();
