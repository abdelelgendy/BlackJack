import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'

// Complete BlackJack Game Component
const BlackJackGame = () => {
  // Game state
  const [gameState, setGameState] = useState('betting'); // betting, playing, dealer, gameOver
  const [playerChips, setPlayerChips] = useState(200);
  const [currentBet, setCurrentBet] = useState(5);
  const [message, setMessage] = useState('Place your bet and start the game!');
  
  // Cards and hands
  const [deck, setDeck] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [showDealerCard, setShowDealerCard] = useState(false);
  
  // Game stats
  const [stats, setStats] = useState({ wins: 0, losses: 0, pushes: 0, blackjacks: 0 });

  // Create and shuffle deck
  const createDeck = () => {
    const suits = ['♠', '♥', '♦', '♣'];
    const suitNames = { '♠': 'spade', '♥': 'Heart', '♦': 'Diamond', '♣': 'club' };
    const ranks = [
      { name: 'A', value: 11 }, { name: '2', value: 2 }, { name: '3', value: 3 },
      { name: '4', value: 4 }, { name: '5', value: 5 }, { name: '6', value: 6 },
      { name: '7', value: 7 }, { name: '8', value: 8 }, { name: '9', value: 9 },
      { name: '10', value: 10 }, { name: 'J', value: 10 }, { name: 'Q', value: 10 }, { name: 'K', value: 10 }
    ];
    
    const newDeck = [];
    suits.forEach(suit => {
      ranks.forEach(rank => {
        newDeck.push({
          suit,
          rank: rank.name,
          value: rank.value,
          image: `/${suitNames[suit]}_${rank.name}.png`
        });
      });
    });
    
    // Shuffle deck
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    
    return newDeck;
  };

  // Calculate hand value
  const getHandValue = (hand) => {
    let value = 0;
    let aces = 0;
    
    hand.forEach(card => {
      if (card.rank === 'A') {
        aces++;
        value += 11;
      } else {
        value += card.value;
      }
    });
    
    // Adjust for aces
    while (value > 21 && aces > 0) {
      value -= 10;
      aces--;
    }
    
    return value;
  };

  // Check for blackjack
  const isBlackjack = (hand) => hand.length === 2 && getHandValue(hand) === 21;

  // Initialize deck on component mount
  useEffect(() => {
    setDeck(createDeck());
  }, []);

  // Start new game
  const startGame = () => {
    if (currentBet > playerChips) {
      setMessage('Not enough chips for that bet!');
      return;
    }

    // Deduct bet
    setPlayerChips(prev => prev - currentBet);
    
    // Create new shuffled deck
    const newDeck = createDeck();
    
    // Deal initial cards
    const newPlayerHand = [newDeck.pop(), newDeck.pop()];
    const newDealerHand = [newDeck.pop(), newDeck.pop()];
    
    setDeck(newDeck);
    setPlayerHand(newPlayerHand);
    setDealerHand(newDealerHand);
    setShowDealerCard(false);
    setGameState('playing');
    
    // Check for natural blackjacks
    const playerBJ = isBlackjack(newPlayerHand);
    const dealerBJ = isBlackjack(newDealerHand);
    
    if (playerBJ || dealerBJ) {
      setShowDealerCard(true);
      setGameState('gameOver');
      
      if (playerBJ && dealerBJ) {
        setMessage('Push - Both have Blackjack!');
        setPlayerChips(prev => prev + currentBet); // Return bet
        setStats(prev => ({ ...prev, pushes: prev.pushes + 1 }));
      } else if (playerBJ) {
        setMessage('Blackjack! You win!');
        setPlayerChips(prev => prev + currentBet + Math.floor(currentBet * 1.5)); // 3:2 payout
        setStats(prev => ({ ...prev, blackjacks: prev.blackjacks + 1 }));
      } else {
        setMessage('Dealer has Blackjack. You lose.');
        setStats(prev => ({ ...prev, losses: prev.losses + 1 }));
      }
    } else {
      setMessage('Hit or Stand?');
    }
  };

  // Hit action
  const hit = () => {
    if (gameState !== 'playing') return;
    
    const newDeck = [...deck];
    const newCard = newDeck.pop();
    const newHand = [...playerHand, newCard];
    
    setDeck(newDeck);
    setPlayerHand(newHand);
    
    const handValue = getHandValue(newHand);
    
    if (handValue > 21) {
      setMessage('Bust! You lose.');
      setGameState('gameOver');
      setStats(prev => ({ ...prev, losses: prev.losses + 1 }));
    } else if (handValue === 21) {
      setMessage('21! Standing...');
      setTimeout(() => dealerTurn(newHand, newDeck), 1000);
    }
  };

  // Stand action
  const stand = () => {
    if (gameState !== 'playing') return;
    dealerTurn(playerHand, deck);
  };

  // Dealer's turn
  const dealerTurn = (finalPlayerHand, currentDeck) => {
    setGameState('dealer');
    setShowDealerCard(true);
    setMessage("Dealer's turn...");
    
    let newDealerHand = [...dealerHand];
    let newDeck = [...currentDeck];
    
    // Dealer hits on soft 17
    const dealerPlay = () => {
      const dealerValue = getHandValue(newDealerHand);
      
      if (dealerValue < 17) {
        setTimeout(() => {
          const newCard = newDeck.pop();
          newDealerHand = [...newDealerHand, newCard];
          setDealerHand(newDealerHand);
          setDeck(newDeck);
          dealerPlay();
        }, 1000);
      } else {
        // Determine winner
        setTimeout(() => {
          const playerValue = getHandValue(finalPlayerHand);
          const finalDealerValue = getHandValue(newDealerHand);
          
          if (finalDealerValue > 21) {
            setMessage('Dealer busts! You win!');
            setPlayerChips(prev => prev + currentBet * 2);
            setStats(prev => ({ ...prev, wins: prev.wins + 1 }));
          } else if (playerValue > finalDealerValue) {
            setMessage('You win!');
            setPlayerChips(prev => prev + currentBet * 2);
            setStats(prev => ({ ...prev, wins: prev.wins + 1 }));
          } else if (playerValue < finalDealerValue) {
            setMessage('You lose.');
            setStats(prev => ({ ...prev, losses: prev.losses + 1 }));
          } else {
            setMessage('Push - It\'s a tie!');
            setPlayerChips(prev => prev + currentBet);
            setStats(prev => ({ ...prev, pushes: prev.pushes + 1 }));
          }
          
          setGameState('gameOver');
        }, 1000);
      }
    };
    
    setTimeout(dealerPlay, 1000);
  };

  // New round
  const newRound = () => {
    setPlayerHand([]);
    setDealerHand([]);
    setShowDealerCard(false);
    setGameState('betting');
    setMessage('Place your bet and start the game!');
  };

  // Refill chips
  const refillChips = () => {
    setPlayerChips(Math.min(playerChips + 200, 1000));
    setMessage('Chips refilled!');
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#1a3a1a url("/table.png") center/cover no-repeat',
      color: 'white',
      fontFamily: 'Trebuchet MS, Lucida Sans Unicode, Lucida Grande, Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px'
    }}>
      {/* Header */}
      <h1 style={{ 
        color: 'goldenrod', 
        fontSize: '3rem', 
        marginBottom: '10px',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)'
      }}>
        🃏 BlackJack 🃏
      </h1>
      
      {/* Message */}
      <p style={{ 
        fontSize: '1.3rem', 
        fontStyle: 'italic', 
        marginBottom: '20px',
        textAlign: 'center',
        minHeight: '30px'
      }}>
        {message}
      </p>

      {/* Dealer Hand */}
      <div style={{ margin: '20px 0', textAlign: 'center' }}>
        <h3 style={{ color: 'goldenrod', marginBottom: '10px' }}>
          Dealer {showDealerCard ? `(${getHandValue(dealerHand)})` : ''}
        </h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          {dealerHand.map((card, index) => (
            <div key={index} style={{ position: 'relative' }}>
              {index === 1 && !showDealerCard ? (
                <img 
                  src="/back_black.png"
                  alt="Hidden card"
                  style={{ 
                    width: '110px', 
                    height: '165px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
                  }}
                />
              ) : (
                <img 
                  src={card.image}
                  alt={`${card.rank} of ${card.suit}`}
                  style={{ 
                    width: '110px', 
                    height: '165px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Player Hand */}
      <div style={{ margin: '20px 0', textAlign: 'center' }}>
        <h3 style={{ color: 'goldenrod', marginBottom: '10px' }}>
          Player {playerHand.length > 0 ? `(${getHandValue(playerHand)})` : ''}
        </h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          {playerHand.map((card, index) => (
            <img 
              key={index}
              src={card.image}
              alt={`${card.rank} of ${card.suit}`}
              style={{ 
                width: '110px', 
                height: '165px',
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                transform: `translateY(${index * -2}px)`,
                zIndex: index
              }}
            />
          ))}
        </div>
      </div>

      {/* Game Controls */}
      <div style={{ 
        background: 'rgba(0, 0, 0, 0.3)', 
        padding: '20px', 
        borderRadius: '15px',
        margin: '20px 0',
        minWidth: '600px',
        textAlign: 'center'
      }}>
        {gameState === 'betting' && (
          <>
            <div style={{ marginBottom: '20px' }}>
              <p style={{ color: 'goldenrod', fontSize: '1.1rem', fontWeight: 'bold' }}>
                Chips: ${playerChips}
              </p>
              <p style={{ color: 'white', fontSize: '1.2rem', fontWeight: 'bold' }}>
                Current Bet: ${currentBet}
              </p>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              {[1, 5, 25, 100].map(value => (
                <button 
                  key={value}
                  disabled={value > playerChips}
                  style={{
                    background: currentBet === value ? '#ffd700' : (value <= playerChips ? 'goldenrod' : '#666'),
                    color: '#016f32',
                    border: currentBet === value ? '3px solid #fff' : 'none',
                    padding: '10px 15px',
                    borderRadius: '50%',
                    fontWeight: 'bold',
                    cursor: value <= playerChips ? 'pointer' : 'not-allowed',
                    margin: '5px',
                    minWidth: '60px',
                    minHeight: '60px',
                    fontSize: '0.9rem'
                  }}
                  onClick={() => setCurrentBet(value)}
                >
                  ${value}
                </button>
              ))}
            </div>
            
            <div>
              <button 
                disabled={currentBet > playerChips}
                style={{
                  background: currentBet <= playerChips ? 'goldenrod' : '#666',
                  color: '#016f32',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  cursor: currentBet <= playerChips ? 'pointer' : 'not-allowed',
                  margin: '5px'
                }}
                onClick={startGame}
              >
                START GAME
              </button>
              
              <button 
                disabled={playerChips >= 1000}
                style={{
                  background: playerChips < 1000 ? '#4CAF50' : '#666',
                  color: 'white',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  cursor: playerChips < 1000 ? 'pointer' : 'not-allowed',
                  margin: '5px'
                }}
                onClick={refillChips}
              >
                REFILL CHIPS
              </button>
            </div>
          </>
        )}

        {gameState === 'playing' && (
          <div>
            <button 
              style={{
                background: 'goldenrod',
                color: '#016f32',
                border: 'none',
                padding: '15px 30px',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                cursor: 'pointer',
                margin: '5px'
              }}
              onClick={hit}
            >
              HIT
            </button>
            
            <button 
              style={{
                background: '#ff4444',
                color: 'white',
                border: 'none',
                padding: '15px 30px',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                cursor: 'pointer',
                margin: '5px'
              }}
              onClick={stand}
            >
              STAND
            </button>
          </div>
        )}

        {gameState === 'gameOver' && (
          <button 
            style={{
              background: 'goldenrod',
              color: '#016f32',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              cursor: 'pointer'
            }}
            onClick={newRound}
          >
            NEW ROUND
          </button>
        )}
      </div>

      {/* Stats */}
      <div style={{ 
        background: 'rgba(0, 0, 0, 0.3)', 
        padding: '15px', 
        borderRadius: '10px',
        textAlign: 'center'
      }}>
        <p style={{ color: 'goldenrod', fontWeight: 'bold', margin: 0 }}>
          Wins: {stats.wins} | Losses: {stats.losses} | Pushes: {stats.pushes} | Blackjacks: {stats.blackjacks}
        </p>
      </div>
    </div>
  );
};

console.log('Loading complete BlackJack game...');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BlackJackGame />
  </React.StrictMode>,
)
