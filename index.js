// GLOBAL VARIABLES & ELEMENT REFERENCES
let player = { name: "Player", chips: 0 };
let wins = 0, losses = 0, pushes = 0;
const BET_AMOUNT = 20;

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
// New flag: when splitActive is true, playingMain distinguishes which hand is active.
let playingMain = true;

playerEl.textContent = player.name + ": $" + player.chips;

const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = [
  { name: "A", value: 11 }, { name: "2", value: 2 }, { name: "3", value: 3 },
  { name: "4", value: 4 }, { name: "5", value: 5 }, { name: "6", value: 6 },
  { name: "7", value: 7 }, { name: "8", value: 8 }, { name: "9", value: 9 },
  { name: "10", value: 10 }, { name: "J", value: 10 }, { name: "Q", value: 10 },
  { name: "K", value: 10 },
];

// HELPER FUNCTIONS
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

function updateBetDisplay() {
  document.getElementById('bet-display').textContent = `Bet: $${currentBet}`;
  document.querySelectorAll('.chip-btn').forEach(btn => {
    btn.classList.toggle('selected-chip', parseInt(btn.dataset.value, 10) === currentBet);
  });
}

function updateStats() {
  sumEl.textContent     = "Sum: " + sum;
  messageEl.textContent = message;
  statsEl.textContent   = `Wins: ${wins} Losses: ${losses} Pushes: ${pushes}`;
  playerEl.textContent  = player.name + ": $" + player.chips;
  // Disable/enable buttons based on game state.
  document.getElementById('new-card-btn').disabled   = !isAlive || hasBlackJack;
  document.getElementById('stand-btn').disabled      = !isAlive || hasBlackJack;
  document.getElementById('start-game-btn').disabled = isAlive;
}

/**
 * Helper to render the dealer's hand:
 *  – When isAlive, hide the second card with a card-back image.
 *  – Otherwise, show all cards.
 */
function renderDealerHand(isAlive) {
  const label = '<span class="hand-label">Dealer:</span>';
  if (isAlive) {
    // Show the first card, second is facedown
    const first = dealerHand[0];
    const cardBack = (first.suit === "♠" || first.suit === "♣")
      ? "assets/back_black.png"
      : "assets/back_red.png";
    return `
      ${label}
      <img class="card" src="${getCardImage(first)}" alt="${first.rankName}${first.suit}" />
      <img class="card" src="${cardBack}" alt="Card Back" />
    `;
  } else {
    // Reveal all dealer cards
    let html = label + " ";
    dealerHand.forEach((card, i) => {
      // We reuse your existing 'stand-deal' class for a flip or reveal animation
      html += `
        <img
          class="card stand-deal"
          style="animation-delay: ${i * 0.3}s"
          src="${getCardImage(card)}"
          alt="${card.rankName}${card.suit}"
        />
      `;
    });
    html += ` (Total: ${calculate(dealerHand)})`;
    return html;
  }
}

/**
 * DRY version of rendering any hand (player or split hand).
 * You already have 'renderHand', so we keep it – just ensure it’s used consistently
 * for both the main cards and split.
 */
function renderHand(el, hand, label, focusCondition, initial = false) {
  let html = `<span class="hand-label">${label}:</span> `;
  hand.forEach((card, i) => {
    let classes = "card";
    // Use 'initial-deal' to animate the initial dealing
    if (initial) {
      classes += " initial-deal";
    }
    // If this card is the last one drawn, highlight it
    if (focusCondition(i)) {
      classes += " focused-card";
    }
    html += `
      <img
        class="${classes}"
        style="animation-delay: ${i * 0.3}s"
        src="${getCardImage(card)}"
        alt="${card.rankName}${card.suit}"
        onanimationend="this.classList.remove('initial-deal')"
      />
    `;
  });
  return html;
}

/**
 * Single function to handle Blackjack/bust checks for any hand.
 */
function checkHandState(hand, bet) {
  const s = calculate(hand);
  if (s === 21) {
    message = "You've got Blackjack!";
    hasBlackJack = true;
    isAlive = false;
    wins++;
    player.chips += Math.floor(bet * 1.5);
  } else if (s > 21) {
    message = "You're out of the game!";
    isAlive = false;
    losses++;
    player.chips -= bet;
  } else {
    message = "Do you want to draw a new card?";
  }
  return s;
}

function renderGame(initial = false) {
  // Check player’s main hand
  sum = checkHandState(cards, currentBet);
  splitSum = calculate(splitHandArr); // handle splits separately or unify with checkHandState

  // Render the dealer area – now using our single helper
  dealerEl.innerHTML = renderDealerHand(isAlive);

  // Render the main hand
  cardsEl.innerHTML = renderHand(
    cardsEl,
    cards,
    "Main",
    i => (
      (!splitActive && isAlive && i === cards.length - 1) ||
      (splitActive && playingMain && isAlive && i === cards.length - 1)
    ),
    initial
  );

  // Render split if active
  const splitEl = document.getElementById('split-el');
  if (splitActive) {
    splitEl.innerHTML = renderHand(
      splitEl,
      splitHandArr,
      "Split",
      i => (!playingMain && isAlive && i === splitHandArr.length - 1),
      initial
    ) + `<span>(Sum: ${splitSum})</span>`;
  } else {
    splitEl.innerHTML = '';
  }

  // Re-enable/disable UI elements as needed
  document.getElementById('split-btn').disabled = !(isAlive && cards.length === 2 && cards[0].value === cards[1].value && !splitActive);
  updateStats();
}

function startGame() {
  const bet = currentBet;
  if (bet < 1 || player.chips < bet) {
    message = (bet < 1) ? "Bet must be at least $1!" : "You don't have enough chips to play!";
    isAlive = false;
    hasBlackJack = false;
    renderGame();
    return;
  }
  
  // Reset variables
  cards = []; dealerHand = []; splitHandArr = [];
  isAlive = true; hasBlackJack = false; splitActive = false; splitSum = 0; playingSplit = false;
  
  // Deal initial cards
  cards = [drawCard(), drawCard()];
  dealerHand = [drawCard(), drawCard()];
  renderGame(true); // Pass true to trigger the initial deal animations
}

function newCard() {
  if (!isAlive || hasBlackJack) return;
  if (splitActive) {
    if (playingMain) {
      cards.push(drawCard());
    } else {
      splitHandArr.push(drawCard());
    }
  } else {
    cards.push(drawCard());
  }
  renderGame();
}

function drawCard() {
  // Generate a card with random rank and suit.
  const rank = RANKS[Math.floor(Math.random() * RANKS.length)];
  const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
  return { rankName: rank.name, suit, value: rank.value };
}

function stand() {
  // If split is active and we're still on the main hand, finish main hand and switch.
  if (splitActive && playingMain) {
    playingMain = false;
    message = "Now playing your split hand.";
    renderGame();
    return;
  }
  
  // Otherwise, we finalize the active hand (either unsplit or split hand) and let dealer play.
  const bet = currentBet;
  const playerSum = splitActive ? calculate(splitHandArr) : sum;
  let dealerSum = calculate(dealerHand);
  while (dealerSum < 17) {
    dealerHand.push(drawCard());
    dealerSum = calculate(dealerHand);
  }
  
  if (dealerSum > 21 || playerSum > dealerSum) {
    message = "You win!";
    wins++;
    player.chips += bet;
  } else if (playerSum < dealerSum) {
    message = "Dealer wins...";
    losses++;
    player.chips -= bet;
  } else {
    message = "Push (tie).";
    pushes++;
  }
  
  isAlive = false;
  renderGame();
}

function splitHand() {
  if (isAlive && cards.length === 2 && cards[0].value === cards[1].value && !splitActive) {
    splitActive = true;
    playingMain = true; // Start with main hand
    // Move one card to create the split hand.
    splitHandArr = [cards.pop()];
    // Deal one extra card for each hand.
    cards.push(drawCard());
    splitHandArr.push(drawCard());
    renderGame();
    // Disable the split button in your UI as needed.
    document.getElementById('split-btn').disabled = true;
  }
}

function switchHand() {
  if (splitActive) {
    playingSplit = !playingSplit;
    message = playingSplit ? "Playing split hand" : "Playing main hand";
    renderGame();
  }
}

function refillChips() {
  const amount = 200;
  player.chips += amount;
  message = `Added $${amount} to your chips!`;
  renderGame();
}

// Chip button event listeners
document.querySelectorAll('.chip-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    currentBet = parseInt(this.dataset.value, 10);
    updateBetDisplay();
  });
});

function getBetAmount() {
  return currentBet;
}