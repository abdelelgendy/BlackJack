let player = {
    name: "Per",
    chips: 200
}

let wins = 0;
let losses = 0;
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

// call this once at the start of each round:
function createDeck() {
  const deck = [];
  for (let suit of SUITS) {
    for (let rank of RANKS) {
      deck.push({ suit, rankName: rank.name, rankValue: rank.value });
    }
  }
  return deck;
}

function shuffle(deck) {
  // Fisher–Yates in-place shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}
// call this to get a random card from the deck:

function getRandomCard() {
    let randomNumber = Math.floor( Math.random()*13 ) + 1
    if (randomNumber > 10) {
        return 10
    } else if (randomNumber === 1) {
        return 11
    } else {
        return randomNumber
    }
}

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
  isAlive = true
  hasBlackJack = false

  // deal two card objects
  const firstCard  = drawCard()
  const secondCard = drawCard()
  cards = [ firstCard, secondCard ]
  dealerHand = [ drawCard(), drawCard() ];


  // we don’t set sum here any more; renderGame() will recompute it
  renderGame()
}


function renderGame() {
    //recompute sum using helper function:
    sum = calculate(cards)

    if (isAlive) {
    // mid-round: show first card + a face-down placeholder
    dealerEl.textContent = 'Dealer: '
      + `${dealerHand[0].rankName}${dealerHand[0].suit} `
      + '[hidden]';
    } else {
    // round over: reveal all cards and total
    const fullHand = dealerHand.map(c => `${c.rankName}${c.suit}`).join(' ');
    const dealerTotal = calculate(dealerHand);
    dealerEl.textContent = `Dealer: ${fullHand} (Total: ${dealerTotal})`;
    }


    let html = 'Cards: ';
    for (let card of cards) {
      const isRed = card.suit === '♥' || card.suit === '♦';
      html += `<span class="card${isRed ? ' red' : ''}">`
          + `${card.rankName}${card.suit}</span> `;
    }
    cardsEl.innerHTML = html;


    
    sumEl.textContent = "Sum: " + sum
    if (sum <= 20) {
      message = "Do you want to draw a new card?";
    } else if (sum === 21) {
      message = "You've got Blackjack!";
      hasBlackJack = true;
      isAlive = false;
      wins++;
    } else {
      message = "You're out of the game!";
      isAlive = false;
      losses++;
    }

    messageEl.textContent = message
    //  Disable/enable buttons based on game state
    document.getElementById('new-card-btn').disabled    = !isAlive || hasBlackJack;
    document.getElementById('start-game-btn').disabled  =  isAlive;
    document.getElementById('stand-btn').disabled = !isAlive || hasBlackJack;
    //  Refresh the stats display
  statsEl.textContent = `Wins: ${wins} Losses: ${losses}`;

}


function newCard() {
  if (isAlive && !hasBlackJack) {
    const card = drawCard()
    cards.push(card)
    renderGame()
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
    // no stat change
  }
  isAlive = false;       // round over
  hasBlackJack = false;  // clear any blackjack flag
  messageEl.textContent = message;
  renderGame();

}