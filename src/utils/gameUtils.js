// Card and deck utilities
export const SUITS = ['♠', '♥', '♦', '♣'];
export const SUIT_NAMES = {
  '♠': 'spade',
  '♥': 'Heart',
  '♦': 'Diamond',
  '♣': 'club'
};

export const RANKS = [
  { name: 'A', value: 11 },
  { name: '2', value: 2 },
  { name: '3', value: 3 },
  { name: '4', value: 4 },
  { name: '5', value: 5 },
  { name: '6', value: 6 },
  { name: '7', value: 7 },
  { name: '8', value: 8 },
  { name: '9', value: 9 },
  { name: '10', value: 10 },
  { name: 'J', value: 10 },
  { name: 'Q', value: 10 },
  { name: 'K', value: 10 }
];

// Game states
export const GAME_STATES = {
  BETTING: 'betting',
  DEALING: 'dealing',
  PLAYER_TURN: 'player_turn',
  DEALER_TURN: 'dealer_turn',
  GAME_OVER: 'game_over'
};

// Game actions
export const GAME_ACTIONS = {
  HIT: 'hit',
  STAND: 'stand',
  DOUBLE_DOWN: 'double_down',
  SPLIT: 'split',
  SURRENDER: 'surrender',
  INSURANCE: 'insurance'
};

// Hand outcomes
export const HAND_OUTCOMES = {
  WIN: 'win',
  LOSE: 'lose',
  PUSH: 'push',
  BLACKJACK: 'blackjack',
  BUST: 'bust',
  SURRENDER: 'surrender'
};

// Create a standard 52-card deck
export const createDeck = () => {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        suit,
        rank: rank.name,
        value: rank.value,
        id: `${suit}${rank.name}`
      });
    }
  }
  return deck;
};

// Shuffle deck using Fisher-Yates algorithm
export const shuffleDeck = (deck) => {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

// Calculate hand value considering Aces
export const calculateHandValue = (cards) => {
  let value = 0;
  let aces = 0;

  // First pass: add up all non-ace values and count aces
  for (const card of cards) {
    if (card.rank === 'A') {
      aces++;
      value += 11; // Start with 11 for aces
    } else {
      value += card.value;
    }
  }

  // Adjust for aces if bust
  while (value > 21 && aces > 0) {
    value -= 10; // Convert ace from 11 to 1
    aces--;
  }

  return value;
};

// Check if hand is blackjack (21 with exactly 2 cards)
export const isBlackjack = (cards) => {
  return cards.length === 2 && calculateHandValue(cards) === 21;
};

// Check if hand is bust
export const isBust = (cards) => {
  return calculateHandValue(cards) > 21;
};

// Check if hand is soft (contains an ace counted as 11)
export const isSoftHand = (cards) => {
  let value = 0;
  let hasAce = false;

  for (const card of cards) {
    if (card.rank === 'A') {
      hasAce = true;
    }
    value += card.rank === 'A' ? 11 : card.value;
  }

  // If we have an ace and the value would be different if ace was 1
  if (hasAce && value <= 21) {
    let hardValue = 0;
    for (const card of cards) {
      hardValue += card.rank === 'A' ? 1 : card.value;
    }
    return hardValue !== value;
  }

  return false;
};

// Check if cards can be split
export const canSplit = (cards) => {
  if (cards.length !== 2) return false;
  
  // Can split if both cards have same value (not just rank)
  return cards[0].value === cards[1].value;
};

// Get card image path
export const getCardImagePath = (card) => {
  return `/${SUIT_NAMES[card.suit]}_${card.rank}.png`;
};

// Get back card image path
export const getBackCardImagePath = (suit) => {
  const isBlack = suit === '♠' || suit === '♣';
  return isBlack ? '/back_black.png' : '/back_red.png';
};

// Calculate payout for different outcomes
export const calculatePayout = (bet, outcome, isBlackjack = false) => {
  switch (outcome) {
    case HAND_OUTCOMES.BLACKJACK:
      return Math.floor(bet * 1.5); // 3:2 payout
    case HAND_OUTCOMES.WIN:
      return bet; // 1:1 payout
    case HAND_OUTCOMES.PUSH:
      return 0; // Return original bet (handled separately)
    case HAND_OUTCOMES.SURRENDER:
      return -Math.floor(bet / 2); // Lose half bet
    default:
      return -bet; // Lose full bet
  }
};

// Determine hand outcome
export const determineOutcome = (playerCards, dealerCards, hasDoubled = false, hasSurrendered = false) => {
  if (hasSurrendered) return HAND_OUTCOMES.SURRENDER;
  
  const playerValue = calculateHandValue(playerCards);
  const dealerValue = calculateHandValue(dealerCards);
  const playerBlackjack = isBlackjack(playerCards);
  const dealerBlackjack = isBlackjack(dealerCards);

  // Player bust
  if (isBust(playerCards)) return HAND_OUTCOMES.BUST;

  // Both have blackjack
  if (playerBlackjack && dealerBlackjack) return HAND_OUTCOMES.PUSH;

  // Only player has blackjack
  if (playerBlackjack && !dealerBlackjack) return HAND_OUTCOMES.BLACKJACK;

  // Only dealer has blackjack
  if (!playerBlackjack && dealerBlackjack) return HAND_OUTCOMES.LOSE;

  // Dealer bust
  if (isBust(dealerCards)) return HAND_OUTCOMES.WIN;

  // Compare values
  if (playerValue > dealerValue) return HAND_OUTCOMES.WIN;
  if (playerValue < dealerValue) return HAND_OUTCOMES.LOSE;
  return HAND_OUTCOMES.PUSH;
};
