let player = {
    name: "abdel",
    chips: 200
}

let wins = 0;
let losses = 0;
let pushes = 0;

const statsEl = document.getElementById('stats-el');



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


playerEl.textContent = player.name + ": $" + player.chips
// in index.js, at the top
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


function startGame() {
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
  sum = calculate(cards);
  splitSum = calculate(splitHandArr);

  // check for bj or bust 
   if (isAlive) {
    if (sum === 21) {
      message      = "You've got Blackjack!";
      hasBlackJack = true;
      isAlive      = false;
      wins++;
    } else if (sum > 21) {
      message = "You're out of the game!";
      isAlive = false;
      losses++;
    } else {
      message = "Do you want to draw a new card?";
    }
  }
  //  Render dealer’s cards
  if (isAlive) {
    const first    = dealerHand[0];
    const redClass = (first.suit === '♥' || first.suit === '♦') ? ' red' : '';
    dealerEl.innerHTML =
      'Dealer: ' +
      `<span class="card${redClass}">${first.rankName}${first.suit}</span> ` +
      `<span class="card">[?]</span>`;
  } else {
    let html = 'Dealer: ';
    for (let card of dealerHand) {
      const isRed = (card.suit === '♥' || card.suit === '♦');
      html += `<span class="card${isRed ? ' red' : ''}">`
           +  `${card.rankName}${card.suit}</span> `;
    }
    html += `(Total: ${calculate(dealerHand)})`;
    dealerEl.innerHTML = html;
  }

  // Render player's cards (main hand)
  let playerHtml = `<span class="hand-label">Main:</span>`;
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const isRed = (card.suit === '♥' || card.suit === '♦');
    // Only highlight main hand cards if main hand is active (not playingSplit)
    const activeClass = (splitActive && !playingSplit) ? ' active-card' : '';
    playerHtml += `<span class="card${isRed ? ' red' : ''}${activeClass}">` +
                  `${card.rankName}${card.suit}</span> `;
  }
  cardsEl.innerHTML = playerHtml;
  cardsEl.className = ""; // Remove hand highlight

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
      const isRed = (card.suit === '♥' || card.suit === '♦');
      // Only highlight split hand cards if split hand is active (playingSplit)
      const activeClass = (splitActive && playingSplit) ? ' active-card' : '';
      splitHtml += `<span class="card${isRed ? ' red' : ''}${activeClass}">` +
                   `${card.rankName}${card.suit}</span> `;
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
  // compute both totals
  const playerSum = sum;             // your global sum was just calculated in renderGame()
  let dealerSum  = calculate(dealerHand);

  // dealer draws to 17+
  while (dealerSum < 17) {
    dealerHand.push(drawCard());
    dealerSum = calculate(dealerHand);
  }

  // determine outcome
    if (dealerSum > 21 || playerSum > dealerSum) {
        message = "You win!";
        wins++;
      } else if (playerSum < dealerSum) {
        message = "Dealer wins...";
        losses++;
      } else {
        message = "Push (tie).";
        pushes++;                 // ⬅️ track the tie
      }

  isAlive = false;       // round over
  hasBlackJack = false;  // clear any blackjack flag
 
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