// GLOBAL VARIABLES & ELEMENT REFERENCES
let player = { name: "Player", chips: 200 };
let wins = 0, losses = 0, pushes = 0;

const statsEl   = document.getElementById('stats-el');
const messageEl = document.getElementById("message-el");
const sumEl     = document.getElementById("sum-el");
const cardsEl   = document.getElementById("cards-el");
const playerEl  = document.getElementById("player-el");
// We no longer treat #dealer-el as the container for card divs.
// Instead, it’s just a label. We'll create a dedicated <div id="dealer-cards">
const dealerEl  = document.getElementById("dealer-cards") || document.createElement("div");
dealerEl.id = "dealer-cards"; 
document.getElementById("dealer-el").after(dealerEl);

let dealerHand = [], cards = [], splitHandArr = [];
let hasBlackJack = false, isAlive = false;
let message = "";
let currentBet = 1;
let splitActive = false;
let playingMain = true;    // true if we’re hitting the main hand, false if we’re hitting the split
let mainHandDone = false;  // true if main hand has busted or stood
let splitHandDone = false; // true if split hand has busted or stood

playerEl.textContent = player.name + ": $" + player.chips;

// SUITS & RANKS
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
  let total = hand.reduce((sum, c) => sum + c.value, 0);
  let aces  = hand.filter(c => c.value === 11).length;
  while (total > 21 && aces--) total -= 10;
  return total;
}

// Return the correct card-face image path
function getCardImage(card) {
  let suitName = "";
  switch (card.suit) {
    case "♠": suitName = "spade";   break;
    case "♣": suitName = "club";    break;
    case "♥": suitName = "Heart";   break;
    case "♦": suitName = "Diamond"; break;
  }
  return `assets/${suitName}_${card.rankName}.png`;
}

// Return a red or black card-back
function getCardBack(card) {
  return (card.suit === "♠" || card.suit === "♣")
    ? "assets/back_black.png"
    : "assets/back_red.png";
}

// Draw a random card from RANKS & SUITS
function drawCard() {
  const rank = RANKS[Math.floor(Math.random() * RANKS.length)];
  const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
  return { rankName: rank.name, suit, value: rank.value };
}

// ────────────── RENDERING ──────────────
/**
 * Renders a single card element. 
 *  - If faceDown = true, we do NOT flip it immediately.
 */
function renderCard(card, delay, parent, faceDown = false) {
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

  // Flip face-up unless this card is intentionally facedown
  setTimeout(() => {
    if (!faceDown) inner.classList.add('flipped');
  }, (delay + dealDuration) * 1000);
}

// Renders a brand-new card for the player's main/split hand
function renderHand(hand, parentId) {
  const parent = document.getElementById(parentId);
  if (parent.children.length < hand.length) {
    const i = hand.length - 1;
    renderCard(hand[i], 0, parent);
  }
}

// Renders a full (fresh) hand (e.g., initial deal, new game)
function renderFullHand(hand, parentId) {
  const parent = document.getElementById(parentId);
  parent.innerHTML = '';
  hand.forEach((card, i) => {
    renderCard(card, i * 0.18, parent);
  });
}

/**
 * Renders the dealer’s hand:
 *   - If showAll or !isAlive → reveal all cards & show total
 *   - Otherwise, show the first card face-up, second facedown
 *   - Additional dealer draws only render newly added cards
 */
function renderDealerHand(showAll = false) {
  const existing = dealerEl.querySelectorAll('.card-outer');

  if (showAll || !isAlive) {
    // Reveal facedown card if it’s still hidden
    // (We do NOT clear everything, so old cards won't re-animate)
    if (existing.length >= 2) {
      const secondCardInner = existing[1].querySelector('.card-inner');
      if (secondCardInner && !secondCardInner.classList.contains('flipped')) {
        secondCardInner.classList.add('flipped');
      }
    }
    // Render only any newly drawn dealer cards
    for (let i = existing.length; i < dealerHand.length; i++) {
      renderCard(dealerHand[i], 0, dealerEl);
    }
    // Show or update dealer total
    let totalSpan = dealerEl.querySelector('.dealer-total');
    if (!totalSpan) {
      totalSpan = document.createElement('span');
      totalSpan.className = 'dealer-total';
      dealerEl.appendChild(totalSpan);
    }
    totalSpan.textContent = ` (Total: ${calculate(dealerHand)})`;

  } else {
    // PARTIAL: if no cards exist yet, render the first face-up & second facedown
    if (!existing.length) {
      dealerEl.innerHTML = '';
      renderCard(dealerHand[0], 0, dealerEl, false);
      // Face-down second card
      if (dealerHand.length > 1) {
        renderCard(dealerHand[1], 0.18, dealerEl, true);
      }
    } else {
      // If new cards have been added for the dealer, only draw the new ones
      for (let i = existing.length; i < dealerHand.length; i++) {
        renderCard(dealerHand[i], 0, dealerEl, false);
      }
    }
  }
}

// Update bet UI
function updateBetDisplay() {
  document.getElementById('bet-display').textContent = `Bet: $${currentBet}`;
  document.querySelectorAll('.chip-btn').forEach(btn => {
    btn.classList.toggle('selected-chip', parseInt(btn.dataset.value, 10) === currentBet);
  });
}

/**
 * Show stats, handle message, and highlight the active hand if split is active.
 * Also show both main & split sums if splitting
 */
function updateStats() {
  const mainSum = calculate(cards);
  const sSum    = calculate(splitHandArr);

  // Show main or main+split sums together
  if (splitActive) {
    sumEl.textContent = `Main: ${mainSum} | Split: ${sSum}`;
  } else {
    sumEl.textContent = `Sum: ${mainSum}`;
  }
  // Update message, stats, and player's chip count
  messageEl.textContent = message;
  statsEl.textContent   = `Wins: ${wins} Losses: ${losses} Pushes: ${pushes}`;
  playerEl.textContent  = player.name + ": $" + player.chips;

  // Disable/enable your action buttons
  document.getElementById('new-card-btn').disabled   = !isAlive || hasBlackJack;
  document.getElementById('stand-btn').disabled      = !isAlive || hasBlackJack;
  document.getElementById('start-game-btn').disabled = isAlive;
  document.getElementById('split-btn').disabled = !(isAlive && cards.length === 2 && cards[0].value === cards[1].value && !splitActive);
  document.getElementById('switch-hand-btn').disabled = !splitActive || !isAlive;

  // Highlight whichever hand is active if split
  cardsEl.classList.toggle('active-hand', splitActive &&  playingMain);
  document.getElementById('split-el').classList.toggle('active-hand', splitActive && !playingMain);
}

// ────────────── GAME LOGIC ──────────────
function startGame() {
  // Set up new round
  cards = [drawCard(), drawCard()];
  dealerHand = [drawCard(), drawCard()];
  // Clear the dealer-cards container so it’s fully refreshed:
  dealerEl.innerHTML = '';

  // Continue game initialization
  isAlive = true;
  hasBlackJack = false;
  splitActive = false;
  playingMain = true;    // true if we’re hitting the main hand, false if we’re hitting the split
  mainHandDone = false;  // true if main hand has busted or stood
  splitHandDone = false; // true if split hand has busted or stood

  playerEl.textContent = player.name + ": $" + player.chips;

  message = "";
  renderGame(true);
}

function renderGame(full = false) {
  renderDealerHand(!isAlive); // If game is no longer alive, show all dealer cards

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

/** Player hits (main or split) */
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
    // If both hands done, dealer finishes
    if (mainHandDone && splitHandDone) {
      finishSplitRound();
      return;
    }
  } else {
    // Single-hand
    cards.push(drawCard());
    let total = calculate(cards);
    if (total > 21) {
      message = "You're out of the game!";
      isAlive = false;
      losses++;
      player.chips -= currentBet;
    } else if (total === 21) {
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

/** Player stands (main or split) */
function stand() {
  if (splitActive) {
    if (playingMain) {
      mainHandDone = true;
      playingMain  = false;
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

/** Dealer finishes for single-hand mode */
function finishSingleRound() {
  // Dealer draws to >= 17
  let dealerSum = calculate(dealerHand);
  while (dealerSum < 17) {
    dealerHand.push(drawCard());
    dealerSum = calculate(dealerHand);
  }
  const playerSum = calculate(cards);
  const dealerBust = dealerSum > 21;

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

/** Dealer finishes for split mode */
function finishSplitRound() {
  let dealerSum = calculate(dealerHand);
  while (dealerSum < 17) {
    dealerHand.push(drawCard());
    dealerSum = calculate(dealerHand);
  }
  const mainSum  = calculate(cards);
  const splitSum = calculate(splitHandArr);
  const dealerBust = dealerSum > 21;

  let results = [];
  [ {sum: mainSum, label: "Main"}, {sum: splitSum, label: "Split"} ].forEach(hand => {
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

/** Split only if both cards have equal value (e.g., 8 & 8) */
function splitHand() {
  if (!isAlive || splitActive || cards.length !== 2 || cards[0].value !== cards[1].value) return;
  splitActive   = true;
  splitHandArr  = [cards.pop()];
  playingMain   = true;
  mainHandDone  = false;
  splitHandDone = false;
  message = "Playing main hand.";
  renderGame(true);
}


/** Refill player chips */
function refillChips() {
  player.chips += 200;
  updateStats();
  updateBetDisplay();
}

// Bet button event listeners
document.querySelectorAll('.chip-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    currentBet = parseInt(this.dataset.value, 10);
    updateBetDisplay();
  });
});