let player = {
    name: "Per",
    chips: 200
}

let wins = 0;
let losses = 0;
const statsEl = document.getElementById('stats-el');


let cards = []
let sum = 0
let hasBlackJack = false
let isAlive = false
let message = ""
let messageEl = document.getElementById("message-el")
let sumEl = document.getElementById("sum-el")
let cardsEl = document.getElementById("cards-el")
let playerEl = document.getElementById("player-el")

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

function startGame() {
    isAlive = true
    cards = [ drawCard(), drawCard() ];
    sum = firstCard + secondCard
    renderGame()
}

function renderGame() {
    cardsEl.textContent = "Cards: "
    //recompute sum:
    sum = 0;
    for (let card of cards) {
    sum += card.value;
    }

    // Adjust for Aces: convert any 11s to 1s while sum > 21
    for (let i = 0; i < cards.length && sum > 21; i++) {
      if (cards[i] === 11) {
        cards[i] = 1;
        sum -= 10;
      }
    }
    for (let i = 0; i < cards.length; i++) {
        cardsEl.textContent += cards[i] + " "
    }
    
    sumEl.textContent = "Sum: " + sum
    if (sum <= 20) {
      message = "Do you want to draw a new card?";
    } else if (sum === 21) {
      message = "You've got Blackjack!";
      hasBlackJack = true;
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
    //  Refresh the stats display
  statsEl.textContent = `Wins: ${wins} Losses: ${losses}`;
}


function newCard() {
    if (isAlive === true && hasBlackJack === false) {
        let card = drawCard();
        cards.push(card);
        sum += card
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
