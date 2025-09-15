import { useState, useCallback, useReducer } from 'react';
import {
  createDeck,
  shuffleDeck,
  calculateHandValue,
  isBlackjack,
  isBust,
  canSplit,
  determineOutcome,
  calculatePayout,
  GAME_STATES,
  HAND_OUTCOMES
} from '../utils/gameUtils';

// Game state reducer
const gameReducer = (state, action) => {
  switch (action.type) {
    case 'SET_GAME_STATE':
      return { ...state, gameState: action.payload };
    
    case 'SET_BET':
      return { ...state, currentBet: action.payload };
    
    case 'PLACE_BET':
      return {
        ...state,
        playerChips: state.playerChips - action.payload,
        currentBet: action.payload,
        totalBet: action.payload
      };
    
    case 'TAKE_INSURANCE':
      return {
        ...state,
        playerChips: state.playerChips - action.payload.amount,
        handActions: {
          ...state.handActions,
          [0]: {
            ...state.handActions[0],
            insurance: action.payload.amount
          }
        }
      };
    
    case 'DEAL_INITIAL_CARDS':
      return {
        ...state,
        playerHands: [action.payload.playerCards],
        dealerHand: action.payload.dealerCards,
        deck: action.payload.newDeck,
        activeHandIndex: 0,
        gameState: GAME_STATES.PLAYER_TURN
      };
    
    case 'ADD_CARD_TO_HAND':
      const newHands = [...state.playerHands];
      newHands[action.payload.handIndex] = [
        ...newHands[action.payload.handIndex],
        action.payload.card
      ];
      return {
        ...state,
        playerHands: newHands,
        deck: action.payload.newDeck
      };
    
    case 'ADD_CARD_TO_DEALER':
      return {
        ...state,
        dealerHand: [...state.dealerHand, action.payload.card],
        deck: action.payload.newDeck
      };
    
    case 'SPLIT_HAND':
      const handToSplit = state.playerHands[action.payload.handIndex];
      const newPlayerHands = [...state.playerHands];
      
      // Create two new hands from the split
      newPlayerHands[action.payload.handIndex] = [handToSplit[0], action.payload.newCard1];
      newPlayerHands.splice(action.payload.handIndex + 1, 0, [handToSplit[1], action.payload.newCard2]);
      
      return {
        ...state,
        playerHands: newPlayerHands,
        deck: action.payload.newDeck,
        playerChips: state.playerChips - state.currentBet,
        totalBet: state.totalBet + state.currentBet,
        handActions: {
          ...state.handActions,
          [action.payload.handIndex + 1]: { split: true }
        }
      };
    
    case 'DOUBLE_DOWN':
      return {
        ...state,
        playerChips: state.playerChips - state.currentBet,
        totalBet: state.totalBet + state.currentBet,
        handActions: {
          ...state.handActions,
          [action.payload.handIndex]: { doubledDown: true }
        }
      };
    
    case 'SET_ACTIVE_HAND':
      return { ...state, activeHandIndex: action.payload };
    
    case 'SET_HAND_ACTION':
      return {
        ...state,
        handActions: {
          ...state.handActions,
          [action.payload.handIndex]: {
            ...state.handActions[action.payload.handIndex],
            [action.payload.action]: action.payload.value
          }
        }
      };
    
    case 'SETTLE_ROUND':
      return {
        ...state,
        playerChips: state.playerChips + action.payload.totalPayout,
        gameState: GAME_STATES.GAME_OVER,
        roundResults: action.payload.results,
        stats: {
          wins: state.stats.wins + action.payload.stats.wins,
          losses: state.stats.losses + action.payload.stats.losses,
          pushes: state.stats.pushes + action.payload.stats.pushes,
          blackjacks: state.stats.blackjacks + action.payload.stats.blackjacks
        }
      };
    
    case 'RESET_ROUND':
      return {
        ...state,
        playerHands: [[]],
        dealerHand: [],
        activeHandIndex: 0,
        currentBet: 5,
        totalBet: 0,
        handActions: {},
        roundResults: [],
        gameState: GAME_STATES.BETTING,
        deck: shuffleDeck(createDeck())
      };
    
    case 'REFILL_CHIPS':
      return {
        ...state,
        playerChips: Math.min(state.playerChips + 200, 1000)
      };
    
    default:
      return state;
  }
};

const initialState = {
  gameState: GAME_STATES.BETTING,
  deck: shuffleDeck(createDeck()),
  playerHands: [[]],
  dealerHand: [],
  activeHandIndex: 0,
  playerChips: 200,
  currentBet: 5,
  totalBet: 0,
  handActions: {}, // Track actions per hand (split, doubleDown, etc.)
  roundResults: [],
  stats: {
    wins: 0,
    losses: 0,
    pushes: 0,
    blackjacks: 0
  },
  showDealerCard: false
};

export const useBlackjackGame = () => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [message, setMessage] = useState('Place your bet to start!');
  const [showDealerCard, setShowDealerCard] = useState(false);

  // Helper function to draw a card
  const drawCard = useCallback((deck) => {
    const newDeck = [...deck];
    const card = newDeck.pop();
    return { card, newDeck };
  }, []);

  // Start a new round
  const startRound = useCallback(() => {
    if (state.currentBet > state.playerChips) {
      setMessage('Not enough chips for that bet!');
      return;
    }

    // Place bet
    dispatch({ type: 'PLACE_BET', payload: state.currentBet });

    // Deal initial cards
    let currentDeck = [...state.deck];
    const playerCards = [];
    const dealerCards = [];

    // Deal 2 cards to player, 2 to dealer (alternating)
    for (let i = 0; i < 2; i++) {
      const { card: playerCard, newDeck: deck1 } = drawCard(currentDeck);
      playerCards.push(playerCard);
      currentDeck = deck1;

      const { card: dealerCard, newDeck: deck2 } = drawCard(currentDeck);
      dealerCards.push(dealerCard);
      currentDeck = deck2;
    }

    dispatch({
      type: 'DEAL_INITIAL_CARDS',
      payload: { playerCards, dealerCards, newDeck: currentDeck }
    });

    // Check for natural blackjacks
    const playerBlackjack = isBlackjack(playerCards);
    const dealerBlackjack = isBlackjack(dealerCards);

    if (playerBlackjack || dealerBlackjack) {
      setShowDealerCard(true);
      setTimeout(() => settleRound(), 1000);
      
      if (playerBlackjack && dealerBlackjack) {
        setMessage('Push - Both have Blackjack!');
      } else if (playerBlackjack) {
        setMessage('Blackjack! You win!');
      } else {
        setMessage('Dealer has Blackjack. You lose.');
      }
    } else {
      setMessage('Hit or Stand?');
      setShowDealerCard(false);
    }
  }, [state.currentBet, state.playerChips, state.deck, drawCard]);

  // Hit action
  const hit = useCallback((handIndex = null) => {
    const targetHandIndex = handIndex !== null ? handIndex : state.activeHandIndex;
    const { card, newDeck } = drawCard(state.deck);

    dispatch({
      type: 'ADD_CARD_TO_HAND',
      payload: { handIndex: targetHandIndex, card, newDeck }
    });

    const newHandValue = calculateHandValue([...state.playerHands[targetHandIndex], card]);
    
    if (newHandValue > 21) {
      setMessage('Bust!');
      // Move to next hand or dealer turn
      setTimeout(() => {
        if (targetHandIndex < state.playerHands.length - 1) {
          dispatch({ type: 'SET_ACTIVE_HAND', payload: targetHandIndex + 1 });
          setMessage('Playing next hand...');
        } else {
          dealerTurn();
        }
      }, 1000);
    } else if (newHandValue === 21) {
      setMessage('21!');
      // Auto-stand on 21
      setTimeout(() => stand(targetHandIndex), 1000);
    }
  }, [state.activeHandIndex, state.deck, state.playerHands, drawCard]);

  // Stand action
  const stand = useCallback((handIndex = null) => {
    const targetHandIndex = handIndex !== null ? handIndex : state.activeHandIndex;
    
    dispatch({
      type: 'SET_HAND_ACTION',
      payload: { handIndex: targetHandIndex, action: 'stood', value: true }
    });

    // Move to next hand or dealer turn
    if (targetHandIndex < state.playerHands.length - 1) {
      dispatch({ type: 'SET_ACTIVE_HAND', payload: targetHandIndex + 1 });
      setMessage('Playing next hand...');
    } else {
      dealerTurn();
    }
  }, [state.activeHandIndex, state.playerHands.length]);

  // Double down action
  const doubleDown = useCallback(() => {
    const handIndex = state.activeHandIndex;
    const currentHand = state.playerHands[handIndex];
    
    if (currentHand.length !== 2) return;
    if (state.playerChips < state.currentBet) {
      setMessage('Not enough chips to double down!');
      return;
    }

    dispatch({ type: 'DOUBLE_DOWN', payload: { handIndex } });
    
    // Hit exactly one card
    const { card, newDeck } = drawCard(state.deck);
    dispatch({
      type: 'ADD_CARD_TO_HAND',
      payload: { handIndex, card, newDeck }
    });

    const newHandValue = calculateHandValue([...currentHand, card]);
    
    if (newHandValue > 21) {
      setMessage('Doubled and bust!');
    } else {
      setMessage('Doubled down!');
    }

    // Automatically stand after double down
    setTimeout(() => {
      if (handIndex < state.playerHands.length - 1) {
        dispatch({ type: 'SET_ACTIVE_HAND', payload: handIndex + 1 });
        setMessage('Playing next hand...');
      } else {
        dealerTurn();
      }
    }, 1500);
  }, [state.activeHandIndex, state.playerHands, state.playerChips, state.currentBet, state.deck, drawCard]);

  // Insurance action
  const takeInsurance = useCallback(() => {
    const insuranceBet = Math.floor(state.currentBet / 2);
    if (state.playerChips < insuranceBet) {
      setMessage('Not enough chips for insurance!');
      return;
    }

    dispatch({
      type: 'TAKE_INSURANCE',
      payload: { amount: insuranceBet }
    });

    setMessage('Insurance taken!');
  }, [state.currentBet, state.playerChips]);

  // Surrender action
  const surrender = useCallback(() => {
    const handIndex = state.activeHandIndex;
    const currentHand = state.playerHands[handIndex];
    
    if (currentHand.length !== 2) return;

    dispatch({
      type: 'SET_HAND_ACTION',
      payload: { handIndex, action: 'surrendered', value: true }
    });

    setMessage('Hand surrendered!');
    
    // End the round immediately
    setTimeout(() => settleRound(), 1000);
  }, [state.activeHandIndex, state.playerHands, settleRound]);

  // Split action
  const split = useCallback(() => {
    const handIndex = state.activeHandIndex;
    const currentHand = state.playerHands[handIndex];
    
    if (!canSplit(currentHand)) return;
    if (state.playerChips < state.currentBet) {
      setMessage('Not enough chips to split!');
      return;
    }

    // Draw two new cards for the split hands
    let currentDeck = [...state.deck];
    const { card: newCard1, newDeck: deck1 } = drawCard(currentDeck);
    const { card: newCard2, newDeck: deck2 } = drawCard(deck1);

    dispatch({
      type: 'SPLIT_HAND',
      payload: { handIndex, newCard1, newCard2, newDeck: deck2 }
    });

    setMessage('Hand split! Playing first hand...');
  }, [state.activeHandIndex, state.playerHands, state.playerChips, state.currentBet, state.deck, drawCard]);

  // Dealer turn
  const dealerTurn = useCallback(() => {
    dispatch({ type: 'SET_GAME_STATE', payload: GAME_STATES.DEALER_TURN });
    setShowDealerCard(true);
    setMessage('Dealer\'s turn...');

    let currentDeck = [...state.deck];
    let dealerCards = [...state.dealerHand];

    // Dealer hits on soft 17, stands on hard 17
    const dealerDrawCards = () => {
      const dealerValue = calculateHandValue(dealerCards);
      
      if (dealerValue < 17) {
        const { card, newDeck } = drawCard(currentDeck);
        dealerCards.push(card);
        currentDeck = newDeck;
        
        dispatch({
          type: 'ADD_CARD_TO_DEALER',
          payload: { card, newDeck }
        });

        setTimeout(dealerDrawCards, 1000);
      } else {
        setTimeout(() => settleRound(), 1000);
      }
    };

    setTimeout(dealerDrawCards, 1000);
  }, [state.deck, state.dealerHand, drawCard]);

  // Settle the round
  const settleRound = useCallback(() => {
    const results = [];
    let totalPayout = 0;
    let wins = 0, losses = 0, pushes = 0, blackjacks = 0;

    state.playerHands.forEach((hand, index) => {
      const isDoubledDown = state.handActions[index]?.doubledDown || false;
      const hasSurrendered = state.handActions[index]?.surrendered || false;
      const handBet = isDoubledDown ? state.currentBet * 2 : state.currentBet;
      
      let outcome;
      if (hasSurrendered) {
        outcome = HAND_OUTCOMES.SURRENDER;
      } else {
        outcome = determineOutcome(hand, state.dealerHand, isDoubledDown, hasSurrendered);
      }
      
      let payout = 0;
      let returnBet = 0;

      switch (outcome) {
        case HAND_OUTCOMES.BLACKJACK:
          payout = calculatePayout(handBet, outcome);
          returnBet = handBet;
          blackjacks++;
          break;
        case HAND_OUTCOMES.WIN:
          payout = calculatePayout(handBet, outcome);
          returnBet = handBet;
          wins++;
          break;
        case HAND_OUTCOMES.PUSH:
          returnBet = handBet;
          pushes++;
          break;
        case HAND_OUTCOMES.SURRENDER:
          returnBet = Math.floor(handBet / 2); // Get half bet back
          losses++;
          break;
        default:
          losses++;
          break;
      }

      // Handle insurance payout
      const insuranceBet = state.handActions[index]?.insurance || 0;
      if (insuranceBet > 0) {
        const dealerHasBlackjack = isBlackjack(state.dealerHand);
        if (dealerHasBlackjack) {
          payout += insuranceBet * 2; // Insurance pays 2:1
        }
        // If dealer doesn't have blackjack, insurance bet is already lost
      }

      totalPayout += payout + returnBet;
      results.push({ hand, outcome, payout, returnBet, insuranceBet });
    });

    dispatch({
      type: 'SETTLE_ROUND',
      payload: {
        totalPayout,
        results,
        stats: { wins, losses, pushes, blackjacks }
      }
    });

    // Set appropriate message
    if (results.length === 1) {
      const result = results[0];
      switch (result.outcome) {
        case HAND_OUTCOMES.BLACKJACK:
          setMessage('Blackjack! You win!');
          break;
        case HAND_OUTCOMES.WIN:
          setMessage('You win!');
          break;
        case HAND_OUTCOMES.PUSH:
          setMessage('Push - It\'s a tie!');
          break;
        case HAND_OUTCOMES.BUST:
          setMessage('Bust! You lose.');
          break;
        case HAND_OUTCOMES.SURRENDER:
          setMessage('Surrendered - Half bet returned.');
          break;
        default:
          setMessage('You lose.');
      }
    } else {
      setMessage(`Round complete! ${wins} wins, ${losses} losses, ${pushes} pushes`);
    }
  }, [state.playerHands, state.dealerHand, state.handActions, state.currentBet]);

  // Reset for new round
  const newRound = useCallback(() => {
    dispatch({ type: 'RESET_ROUND' });
    setMessage('Place your bet to start!');
    setShowDealerCard(false);
  }, []);

  // Set bet amount
  const setBet = useCallback((amount) => {
    if (state.gameState === GAME_STATES.BETTING) {
      dispatch({ type: 'SET_BET', payload: amount });
    }
  }, [state.gameState]);

  // Refill chips
  const refillChips = useCallback(() => {
    dispatch({ type: 'REFILL_CHIPS' });
    setMessage('Chips refilled!');
  }, []);

  // Check what actions are available for current hand
  const getAvailableActions = useCallback(() => {
    if (state.gameState !== GAME_STATES.PLAYER_TURN) return [];

    const currentHand = state.playerHands[state.activeHandIndex];
    const actions = [];

    if (currentHand.length > 0 && !isBust(currentHand)) {
      actions.push('hit', 'stand');

      // Can double down on first two cards with enough chips
      if (currentHand.length === 2 && state.playerChips >= state.currentBet) {
        actions.push('doubleDown');
      }

      // Can split on first two cards of same value with enough chips
      if (currentHand.length === 2 && canSplit(currentHand) && state.playerChips >= state.currentBet) {
        actions.push('split');
      }

      // Can surrender on first two cards
      if (currentHand.length === 2) {
        actions.push('surrender');
      }
    }

    return actions;
  }, [state.gameState, state.playerHands, state.activeHandIndex, state.playerChips, state.currentBet]);

  // Check if insurance is available
  const canTakeInsurance = useCallback(() => {
    if (state.gameState !== GAME_STATES.PLAYER_TURN) return false;
    if (state.dealerHand.length === 0) return false;
    if (state.handActions[0]?.insurance) return false; // Already taken
    
    const dealerUpCard = state.dealerHand[0];
    const insuranceCost = Math.floor(state.currentBet / 2);
    
    return dealerUpCard.rank === 'A' && state.playerChips >= insuranceCost;
  }, [state.gameState, state.dealerHand, state.handActions, state.currentBet, state.playerChips]);

  return {
    // State
    gameState: state.gameState,
    playerHands: state.playerHands,
    dealerHand: state.dealerHand,
    activeHandIndex: state.activeHandIndex,
    playerChips: state.playerChips,
    currentBet: state.currentBet,
    totalBet: state.totalBet,
    stats: state.stats,
    message,
    showDealerCard,
    availableActions: getAvailableActions(),
    canTakeInsurance: canTakeInsurance(),

    // Actions
    startRound,
    hit,
    stand,
    doubleDown,
    split,
    surrender,
    takeInsurance,
    newRound,
    setBet,
    refillChips
  };
};
