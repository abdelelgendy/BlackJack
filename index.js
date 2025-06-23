// GLOBAL VARIABLES & ELEMENT REFERENCES
let player = { name: "Player", chips: 200 };
let wins = 0, losses = 0, pushes = 0;

const statsEl   = document.getElementById('stats-el');
const messageEl = document.getElementById("message-el");
const sumEl     = document.getElementById("sum-el");
const cardsEl   = document.getElementById("cards-el");
const playerEl  = document.getElementById("player-el");
const dealerEl  = document.getElementById("dealer-el");

let dealerHand = [], cards = [], splitHandArr = [];
let sum = 0, splitSum = 0;
let hasBlackJack = false, isAlive = false;
let message = "";
let currentBet = 1;
let splitActive = false;
let playingMain = true;
let mainHandDone = false;
let splitHandDone = false;

playerEl.textContent = player.name + ": $" + player.chips;

const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = [
  { name: "A", value: 11 }, { name: "2", value: 2 }, { name: "3", value: 3 },
  { name: "4", value: 4 }, { name: "5", value: 5 }, { name: "6", value: 6 },
  { name: "7", value: 7 }, { name: "8", value: 8 }, { name: "9", value: 9 },
  { name: "10", value: 10 }, { name: "J", value: 10 }, { name: "Q", value: 10 },
  { name: "K", value: 10 },
];

// ────────────── HELPERS ──────────────
function calculate(hand) {
  let total = hand.reduce((sum, card) => sum + card.value, 0);
  let aces = hand.filter(c => c.value === 11).length;
  while (total > 21 && aces--) total -= 10;
  return total;
}

function getCardImage(card) {
  let suitName = "";
  switch (card.suit) {
    case "♠": suitName = "spade"; break;
    case "♣": suitName = "club"; break;
    case "♥": suitName = "Heart"; break;
    case "♦": suitName = "Diamond"; break;
  }
  return `assets/${suitName}_${card.rankName}.png`;
}

function getCardBack(card) {
  return (card.suit === "♠" || card.suit === "♣")
    ? "assets/back_black.png"
    : "assets/back_red.png";
}

function drawCard() {
  const rank = RANKS[Math.floor(Math.random() * RANKS.length)];
  const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
  return { rankName: rank.name, suit, value: rank.value };
}

// ────────────── RENDERING ──────────────
function renderCard(card, delay, parent) {
  const dealDuration = 0.38; // seconds
  const outer = document.createElement('div');
  outer.className = 'card-outer';
  outer.style.animationDelay = `${delay}s`;

  const inner = document.createElement('div');
  inner.className = 'card-inner';

  inner.innerHTML = `
    <img class="card-face card-back"  src="${getCardBack(card)}" alt="Card Back" />
    <img class="card-face card-front" src="${getCardImage(card)}" alt="${card.rankName}${card.suit}" />
  `;

  outer.appendChild(inner);
  parent.appendChild(outer);

  setTimeout(() => {
    inner.classList.add('flipped');
  }, (delay + dealDuration) * 1000);
}

// Only add the new card (for hit)
function renderHand(hand, parentId) {
  const parent = document.getElementById(parentId);
  if (parent.children.length < hand.length) {
    const i = hand.length - 1;
    renderCard(hand[i], 0, parent);
  }
}

// Render all cards (for new game/split)
function renderFullHand(hand, parentId) {
  const parent = document.getElementById(parentId);
  parent.innerHTML = '';
  hand.forEach((card, i) => {
    renderCard(card, i * 0.18, parent);
  });
}

// Dealer hand rendering
function renderDealerHand(showAll = false) {
  dealerEl.innerHTML = '';
  if (!showAll && isAlive) {
    renderCard(dealerHand[0], 0, dealerEl);
    // Render a facedown card (back only)
    const backCard = { ...dealerHand[1], suit: dealerHand[1].suit };
    renderCard({ ...backCard }, 0.18, dealerEl);
  } else {
    dealerHand.forEach((card, i) => renderCard(card, i * 0.18, dealerEl));
    const totalSpan = document.createElement('span');
    totalSpan.textContent = ` (Total: ${calculate(dealerHand)})`;
    dealerEl.appendChild(totalSpan);
  }
}

function updateBetDisplay() {
  document.getElementById('bet-display').textContent = `Bet: $${currentBet}`;
  document.querySelectorAll('.chip-btn').forEach(btn => {
    btn.classList.toggle('selected-chip', parseInt(btn.dataset.value, 10) === currentBet);
  });
}

function updateStats() {
  sumEl.textContent     = "Sum: " + calculate(cards);
  messageEl.textContent = message;
  statsEl.textContent   = `Wins: ${wins} Losses: ${losses} Pushes: ${pushes}`;
  playerEl.textContent  = player.name + ": $" + player.chips;
  document.getElementById('new-card-btn').disabled   = !isAlive || hasBlackJack;
  document.getElementById('stand-btn').disabled      = !isAlive || hasBlackJack;
  document.getElementById('start-game-btn').disabled = isAlive;
  document.getElementById('split-btn').disabled = !(isAlive && cards.length === 2 && cards[0].value === cards[1].value && !splitActive);
  document.getElementById('switch-hand-btn').disabled = !splitActive || !isAlive;
}

// ────────────── GAME LOGIC ──────────────
function startGame() {
  if (currentBet < 1 || player.chips < currentBet) {
    message = (currentBet < 1) ? "Bet must be at least $1!" : "You don't have enough chips to play!";
    isAlive = false;
    hasBlackJack = false;
    renderGame(true);
    return;
  }
  cards = [drawCard(), drawCard()];
  dealerHand = [drawCard(), drawCard()];
  splitHandArr = [];
  isAlive = true;
  hasBlackJack = false;
  splitActive = false;
  playingMain = true;
  mainHandDone = false;
  splitHandDone = false;
  message = "";
  renderGame(true);
}

function renderGame(full = false) {
  sum = calculate(cards);
  splitSum = calculate(splitHandArr);

  renderDealerHand(!isAlive);

  if (full) {
    renderFullHand(cards, 'cards-el');
    if (splitActive) renderFullHand(splitHandArr, 'split-el');
    else document.getElementById('split-el').innerHTML = '';
  } else {
    renderHand(cards, 'cards-el');
    if (splitActive) renderHand(splitHandArr, 'split-el');
  }

  updateStats();
}

function newCard() {
  if (!isAlive || hasBlackJack) return;
  if (splitActive) {
    if (playingMain) {
      cards.push(drawCard());
      if (calculate(cards) > 21) {
        mainHandDone = true;
        playingMain = false;
        message = "Main hand bust! Now playing split hand.";
      }
    } else {
      splitHandArr.push(drawCard());
      if (calculate(splitHandArr) > 21) {
        splitHandDone = true;
        message = "Split hand bust!";
      }
    }
    if (mainHandDone && splitHandDone) {
      finishSplitRound();
      return;
    }
  } else {
    cards.push(drawCard());
    if (calculate(cards) > 21) {
      message = "You're out of the game!";
      isAlive = false;
      losses++;
      player.chips -= currentBet;
    } else if (calculate(cards) === 21) {
      message = "You've got Blackjack!";
      hasBlackJack = true;
      isAlive = false;
      wins++;
      player.chips += Math.floor(currentBet * 1.5);
    } else {
      message = "Do you want to draw a new card?";
    }
  }
  renderGame();
}

function stand() {
  if (splitActive) {
    if (playingMain) {
      mainHandDone = true;
      playingMain = false;
      message = "Now playing split hand.";
      renderGame();
      return;
    } else {
      splitHandDone = true;
    }
    if (mainHandDone && splitHandDone) {
      finishSplitRound();
      return;
    }
  } else {
    finishSingleRound();
  }
  renderGame();
}

function finishSingleRound() {
  // Dealer plays out
  let dealerSum = calculate(dealerHand);
  while (dealerSum < 17) {
    dealerHand.push(drawCard());
    dealerSum = calculate(dealerHand);
  }
  let playerSum = calculate(cards);
  let dealerBust = dealerSum > 21;

  if (playerSum > 21) {
    message = "You bust!";
    losses++;
    player.chips -= currentBet;
  } else if (dealerBust || playerSum > dealerSum) {
    message = "You win!";
    wins++;
    player.chips += currentBet;
  } else if (playerSum < dealerSum) {
    message = "Dealer wins!";
    losses++;
    player.chips -= currentBet;
  } else {
    message = "Push!";
    pushes++;
  }
  isAlive = false;
}

function finishSplitRound() {
  // Dealer plays out
  let dealerSum = calculate(dealerHand);
  while (dealerSum < 17) {
    dealerHand.push(drawCard());
    dealerSum = calculate(dealerHand);
  }
  let mainSum = calculate(cards);
  let splitSumVal = calculate(splitHandArr);
  let dealerBust = dealerSum > 21;

  let results = [];
  [ {sum: mainSum, label: "Main"}, {sum: splitSumVal, label: "Split"} ].forEach((hand, idx) => {
    if (hand.sum > 21) {
      results.push(`${hand.label} hand busts.`);
      losses++;
      player.chips -= currentBet;
    } else if (dealerBust || hand.sum > dealerSum) {
      results.push(`${hand.label} hand wins!`);
      wins++;
      player.chips += currentBet;
    } else if (hand.sum < dealerSum) {
      results.push(`${hand.label} hand loses.`);
      losses++;
      player.chips -= currentBet;
    } else {
      results.push(`${hand.label} hand pushes.`);
      pushes++;
    }
  });

  message = results.join(" ");
  isAlive = false;
  renderGame(true);
}

function splitHand() {
  if (!isAlive || splitActive || cards.length !== 2 || cards[0].value !== cards[1].value) return;
  splitActive = true;
  splitHandArr = [cards.pop()];
  playingMain = true;
  mainHandDone = false;
  splitHandDone = false;
  message = "Playing main hand.";
  renderGame(true);
}

function switchHand() {
  if (!splitActive || !isAlive) return;
  playingMain = !playingMain;
  message = playingMain ? "Playing main hand." : "Playing split hand.";
  renderGame();
}

function refillChips() {
  player.chips += 200;
  updateStats();
  updateBetDisplay();
}

// Chip button event listeners
document.querySelectorAll('.chip-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    currentBet = parseInt(this.dataset.value, 10);
    updateBetDisplay();
  });
});