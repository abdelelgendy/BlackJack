let player = {
    name: "Player",
    chips: 0
}

let wins = 0;
let losses = 0;
let pushes = 0;

const statsEl = document.getElementById('stats-el');
const BET_AMOUNT = 20;



let dealerHand = [];
let cards = []
let sum = 0
let hasBlackJack = false
let isAlive = false
let message = ""
let messageEl = document.getElementById("message-el")
let sumEl = document.getElementById("sum-el")
let cardsEl = document.getElementById("cards-el")
let playerEl = document.getElementById("player-el")
let dealerEl  = document.getElementById("dealer-el")


playerEl.textContent = player.name + ": $" + player.chips;
const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = [
  { name: "A", value: 11 },
  { name: "2", value: 2 },
  { name: "3", value: 3 },
  { name: "4", value: 4 },
  { name: "5", value: 5 },
  { name: "6", value: 6 },
  { name: "7", value: 7 },
  { name: "8", value: 8 },
  { name: "9", value: 9 },
  { name: "10", value: 10 },
  { name: "J", value: 10 },
  { name: "Q", value: 10 },
  { name: "K", value: 10 },
];



function calculate(hand) {
  let total = 0;
  // sum raw values
  for (let card of hand) total += card.value;

  // count how many Aces we have
  let aces = hand.filter(c => c.value === 11).length;

  // downgrade Aces from 11 to 1 as needed
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

let currentBet = 1; // Default bet

function updateBetDisplay() {
    document.getElementById('bet-display').textContent = `Bet: $${currentBet}`;
    // Highlight selected chip
    document.querySelectorAll('.chip-btn').forEach(btn => {
        btn.classList.toggle('selected-chip', parseInt(btn.dataset.value, 10) === currentBet);
    });
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

function startGame() {
  const bet = getBetAmount();
  if (bet < 1) {
    message = "Bet must be at least $1!";
    isAlive = false;
    hasBlackJack = false;
    renderGame();
    return;
  }
  if (player.chips < bet) {
    message = "You don't have enough chips to play!";
    isAlive = false;
    hasBlackJack = false;
    renderGame();
    return;
  }

  cards = [];
  dealerHand = [];
  isAlive = true;
  hasBlackJack = false;
  splitActive = false;
  splitHandArr = [];
  splitSum = 0;
  playingSplit = false;

  // deal two card objects
  const firstCard  = drawCard()
  const secondCard = drawCard()
  cards = [ firstCard, secondCard ]
  dealerHand = [ drawCard(), drawCard() ];


  // we don’t set sum here any more; renderGame() will recompute it
  renderGame()
}


function renderGame() {
  const bet = getBetAmount();
  sum = calculate(cards);
  splitSum = calculate(splitHandArr);

  // check for bj or bust 
  if (isAlive) {
    if (sum === 21) {
      message      = "You've got Blackjack!";
      hasBlackJack = true;
      isAlive      = false;
      wins++;
      player.chips += Math.floor(bet * 1.5); // Blackjack pays 3:2
    } else if (sum > 21) {
      message = "You're out of the game!";
      isAlive = false;
      losses++;
      player.chips -= bet;
    } else {
      message = "Do you want to draw a new card?";
    }
  }

  // Render dealer’s cards
  if (isAlive) {
    const first = dealerHand[0];
    // Use black back for black suits, red back for red suits
    const backImg = (first.suit === "♠" || first.suit === "♣") ? "assets/back_black.png" : "assets/back_red.png";
    dealerEl.innerHTML =
      'Dealer: ' +
      `<img class="card" src="${getCardImage(first)}" alt="${first.rankName}${first.suit}" /> ` +
      `<img class="card" src="${backImg}" alt="Card Back" />`;
  } else {
    let html = 'Dealer: ';
    for (let card of dealerHand) {
      html += `<img class="card" src="${getCardImage(card)}" alt="${card.rankName}${card.suit}" /> `;
    }
    html += `(Total: ${calculate(dealerHand)})`;
    dealerEl.innerHTML = html;
  }

  // Render player's cards (main hand)
  let playerHtml = `<span class="hand-label">Main:</span>`;
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const activeClass = (splitActive && !playingSplit) ? ' active-card' : '';
    playerHtml += `<img class="card${activeClass}" src="${getCardImage(card)}" alt="${card.rankName}${card.suit}" /> `;
  }
  cardsEl.innerHTML = playerHtml;
  cardsEl.className = "";

  // Render split hand if active
  let splitEl = document.getElementById('split-el');
  if (!splitEl) {
    splitEl = document.createElement('p');
    splitEl.id = 'split-el';
    cardsEl.parentNode.insertBefore(splitEl, cardsEl.nextSibling);
  }
  if (splitActive) {
    let splitHtml = `<span class="hand-label">Split:</span>`;
    for (let i = 0; i < splitHandArr.length; i++) {
      const card = splitHandArr[i];
      const activeClass = (splitActive && playingSplit) ? ' active-card' : '';
      splitHtml += `<img class="card${activeClass}" src="${getCardImage(card)}" alt="${card.rankName}${card.suit}" /> `;
    }
    splitHtml += `<span>(Sum: ${splitSum})</span>`;
    splitEl.innerHTML = splitHtml;
    splitEl.className = '';
  } else {
    splitEl.innerHTML = '';
    splitEl.className = '';
  }

  // Enable Split button only if allowed
  const splitBtn = document.getElementById('split-btn');
  const canSplit =
    isAlive &&
    cards.length === 2 &&
    cards[0].value === cards[1].value &&
    !splitActive;
  splitBtn.disabled = !canSplit;

  // Enable Switch Hand only if split is active
  const switchBtn = document.getElementById('switch-hand-btn');
  switchBtn.disabled = !splitActive;

  // Update sum, message, buttons, and stats
  sumEl.textContent = "Sum: " + sum;
  messageEl.textContent = message;
  document.getElementById('new-card-btn').disabled    = !isAlive || hasBlackJack;
  document.getElementById('stand-btn').disabled       = !isAlive || hasBlackJack;
  document.getElementById('start-game-btn').disabled  =  isAlive;
  statsEl.textContent = `Wins: ${wins} Losses: ${losses} Pushes: ${pushes}`;

  // Always update player money display at the end
  playerEl.textContent = player.name + ": $" + player.chips;
}



function newCard() {
  if (isAlive && !hasBlackJack) {
    if (splitActive && !playingSplit) {
      cards.push(drawCard());
      renderGame();
    } else if (splitActive && playingSplit) {
      splitHandArr.push(drawCard());
      renderGame();
    } else {
      cards.push(drawCard());
      renderGame();
    }
  }
}


function drawCard() {
  // pick a random rank (0–12) and suit (0–3)
  const rankIndex = Math.floor(Math.random() * RANKS.length);
  const suitIndex = Math.floor(Math.random() * SUITS.length);

  const rank = RANKS[rankIndex];      // { name: "A", value: 11 } etc.
  const suit = SUITS[suitIndex];      // "♠", "♥", etc.

  return { rankName: rank.name, suit, value: rank.value };
}

function stand() {
  const bet = getBetAmount();
  const playerSum = sum;
  let dealerSum  = calculate(dealerHand);

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
    // No chip change on push
  }

  isAlive = false;
  hasBlackJack = false;
  renderGame();
}

let splitActive = false;
let splitHandArr = [];
let splitSum = 0;
let playingSplit = false;

function splitHand() {
  if (
    isAlive &&
    cards.length === 2 &&
    cards[0].value === cards[1].value &&
    !splitActive
  ) {
    splitActive = true;
    splitHandArr = [cards.pop()]; // Move one card to split hand
    cards.push(drawCard());       // Draw one card for main hand
    splitHandArr.push(drawCard()); // Draw one card for split hand
    playingSplit = false;
    renderGame();
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
  // You can prompt for a custom amount, or just add a fixed amount
  const amount = 200; // or prompt("How much to add?", 200);
  player.chips += amount;
  message = `Added $${amount} to your chips!`;
  playerEl.textContent = player.name + ": $" + player.chips;
  renderGame();
}

function getCardImage(card) {
    let suitName = "";
    switch (card.suit) {
        case "♠": suitName = "spade"; break;
        case "♣": suitName = "club"; break;
        case "♥": suitName = "Heart"; break;
        case "♦": suitName = "Diamond"; break;
    }
    let rank = card.rankName;
    return `assets/${suitName}_${rank}.png`;
}