import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom/client'

// Enhanced Classic BlackJack Game Component
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

  // Animation states
  const [dealingCards, setDealingCards] = useState(false);
  const [cardAnimations, setCardAnimations] = useState({});
  const [messageAnimation, setMessageAnimation] = useState('');
  const [chipAnimation, setChipAnimation] = useState('');

  // Game stats
  const [stats, setStats] = useState({ wins: 0, losses: 0, pushes: 0, blackjacks: 0 });

  // Refs for auto-scrolling
  const headerRef = useRef(null);
  const messageRef = useRef(null);
  const dealerRef = useRef(null);
  const playerRef = useRef(null);
  const controlsRef = useRef(null);
  const statsRef = useRef(null);

  // Auto-scrolling functions
  const scrollToElement = (ref, offset = -50) => {
    if (ref.current) {
      const elementTop = ref.current.offsetTop + offset;
      window.scrollTo({
        top: elementTop,
        behavior: 'smooth'
      });
    }
  };

  const scrollToMessage = () => scrollToElement(messageRef, -100);
  const scrollToDealer = () => scrollToElement(dealerRef, -80);
  const scrollToPlayer = () => scrollToElement(playerRef, -80);
  const scrollToControls = () => scrollToElement(controlsRef, -60);
  const scrollToStats = () => scrollToElement(statsRef, -40);

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
          image: `/assets/${suitNames[suit]}_${rank.name}.png`
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

  // Animation functions
  const animateMessage = (newMessage, type = '') => {
    setMessageAnimation('fade-out');
    setTimeout(() => {
      setMessage(newMessage);
      setMessageAnimation(type);
    }, 150);
  };

  const animateCardDeal = (handType, cardIndex, delay = 0) => {
    setTimeout(() => {
      setCardAnimations(prev => ({
        ...prev,
        [`${handType}-${cardIndex}`]: 'deal-in'
      }));
    }, delay);
  };

  const animateChipChange = (type) => {
    setChipAnimation(type);
    setTimeout(() => setChipAnimation(''), 1000);
  };

  // Start new game with animations
  const startGame = () => {
    if (currentBet > playerChips) {
      animateMessage('Not enough chips for that bet!', 'error');
      scrollToMessage();
      return;
    }

    console.log(`Starting game with bet: $${currentBet}, chips: $${playerChips}`);

    // Reset animations
    setCardAnimations({});
    setDealingCards(true);
    animateMessage('Dealing cards...', 'info');
    scrollToMessage();

    // Deduct bet
    setPlayerChips(prev => prev - currentBet);
    animateChipChange('bet');

    // Create new shuffled deck
    const newDeck = createDeck();

    // Deal initial cards with animation delays
    const newPlayerHand = [];
    const newDealerHand = [];

    // Deal player cards
    setTimeout(() => {
      newPlayerHand.push(newDeck.pop());
      setPlayerHand([...newPlayerHand]);
      animateCardDeal('player', 0, 0);
    }, 300);

    setTimeout(() => {
      newPlayerHand.push(newDeck.pop());
      setPlayerHand([...newPlayerHand]);
      animateCardDeal('player', 1, 0);
    }, 700);

    // Deal dealer cards
    setTimeout(() => {
      newDealerHand.push(newDeck.pop());
      setDealerHand([...newDealerHand]);
      animateCardDeal('dealer', 0, 0);
    }, 1100);

    setTimeout(() => {
      newDealerHand.push(newDeck.pop());
      setDealerHand([...newDealerHand]);
      animateCardDeal('dealer', 1, 0);

      // Finish dealing
      setTimeout(() => {
        setDealingCards(false);
        setDeck(newDeck);
        setPlayerHand(newPlayerHand);
        setDealerHand(newDealerHand);
        setShowDealerCard(false);
        setGameState('playing');

        // Check for natural blackjacks
        const playerBJ = isBlackjack(newPlayerHand);
        const dealerBJ = isBlackjack(newDealerHand);

        if (playerBJ || dealerBJ) {
          setTimeout(() => {
            setShowDealerCard(true);
            setGameState('gameOver');
            scrollToDealer();

            setTimeout(() => {
              if (playerBJ && dealerBJ) {
                animateMessage('Push - Both have Blackjack!', 'success');
                setPlayerChips(prev => prev + currentBet); // Return bet
                setStats(prev => ({ ...prev, pushes: prev.pushes + 1 }));
                animateChipChange('push');
                scrollToMessage();
                console.log('Result: Push - Both Blackjacks');
              } else if (playerBJ) {
                animateMessage('Blackjack! You win!', 'success');
                setPlayerChips(prev => prev + currentBet + Math.floor(currentBet * 1.5)); // 3:2 payout
                setStats(prev => ({ ...prev, blackjacks: prev.blackjacks + 1 }));
                animateChipChange('win');
                scrollToMessage();
                console.log('Result: Player Blackjack');
              } else {
                animateMessage('Dealer has Blackjack. You lose.', 'error');
                setStats(prev => ({ ...prev, losses: prev.losses + 1 }));
                animateChipChange('lose');
                scrollToMessage();
                console.log('Result: Dealer Blackjack');
              }
              setTimeout(() => scrollToControls(), 500);
            }, 600);
          }, 400);
        } else {
          animateMessage('Hit or Stand?', 'info');
          scrollToControls();
          console.log('Game continues - no natural blackjacks');
        }
      }, 300);
    }, 1500);
  };  // Hit action with animation
  const hit = () => {
    if (gameState !== 'playing') return;

    const newDeck = [...deck];
    const newCard = newDeck.pop();
    const newHand = [...playerHand, newCard];

    console.log(`Player hits: ${newCard.rank}${newCard.suit}`);

    // Animate new card
    setPlayerHand(newHand);
    animateCardDeal('player', newHand.length - 1, 0);
    scrollToPlayer();

    setTimeout(() => {
      setDeck(newDeck);

      const handValue = getHandValue(newHand);
      console.log(`Player hand value: ${handValue}`);

      if (handValue > 21) {
        animateMessage('Bust! You lose.', 'error');
        setGameState('gameOver');
        setStats(prev => ({ ...prev, losses: prev.losses + 1 }));
        animateChipChange('lose');
        scrollToMessage();
        setTimeout(() => scrollToControls(), 500);
        console.log('Result: Player bust');
      } else if (handValue === 21) {
        animateMessage('21! Standing...', 'success');
        console.log('Player got 21, auto-standing');
        setTimeout(() => dealerTurn(newHand, newDeck), 1000);
      }
    }, 400);
  };

  // Stand action
  const stand = () => {
    if (gameState !== 'playing') return;
    console.log('Player stands');
    animateMessage('Standing...', 'info');
    scrollToDealer();
    setTimeout(() => dealerTurn(playerHand, deck), 500);
  };

  // Dealer's turn
  const dealerTurn = (finalPlayerHand, currentDeck) => {
    setGameState('dealer');
    animateMessage("Dealer's turn...", 'info');
    scrollToMessage();

    console.log('Dealer reveals hole card');
    console.log('Dealer hand:', dealerHand.map(c => `${c.rank}${c.suit}`));

    // Animate dealer card flip
    setTimeout(() => {
      setCardAnimations(prev => ({
        ...prev,
        'dealer-1': 'flip'
      }));
      setTimeout(() => setShowDealerCard(true), 250);
    }, 400);

    let newDealerHand = [...dealerHand];
    let newDeck = [...currentDeck];

    // Dealer hits on soft 17
    const dealerPlay = () => {
      const dealerValue = getHandValue(newDealerHand);
      console.log(`Dealer hand value: ${dealerValue}`);

      if (dealerValue < 17) {
        setTimeout(() => {
          animateMessage(`Dealer hits... (${dealerValue})`, 'info');
          scrollToDealer();
          const newCard = newDeck.pop();
          newDealerHand = [...newDealerHand, newCard];
          setDealerHand(newDealerHand);
          animateCardDeal('dealer', newDealerHand.length - 1, 0);
          console.log(`Dealer hits: ${newCard.rank}${newCard.suit}`);

          setTimeout(() => {
            setDeck(newDeck);
            dealerPlay();
          }, 800);
        }, 1000);
      } else {
        // Determine winner
        setTimeout(() => {
          const playerValue = getHandValue(finalPlayerHand);
          const finalDealerValue = getHandValue(newDealerHand);

          console.log(`Final scores - Player: ${playerValue}, Dealer: ${finalDealerValue}`);

          if (finalDealerValue > 21) {
            animateMessage('Dealer busts! You win!', 'success');
            setPlayerChips(prev => prev + currentBet * 2);
            setStats(prev => ({ ...prev, wins: prev.wins + 1 }));
            animateChipChange('win');
            scrollToMessage();
            console.log('Result: Dealer bust - Player wins');
          } else if (playerValue > finalDealerValue) {
            animateMessage('You win!', 'success');
            setPlayerChips(prev => prev + currentBet * 2);
            setStats(prev => ({ ...prev, wins: prev.wins + 1 }));
            animateChipChange('win');
            scrollToMessage();
            console.log('Result: Player wins');
          } else if (playerValue < finalDealerValue) {
            animateMessage('You lose.', 'error');
            setStats(prev => ({ ...prev, losses: prev.losses + 1 }));
            animateChipChange('lose');
            scrollToMessage();
            console.log('Result: Dealer wins');
          } else {
            animateMessage('Push - It\'s a tie!', 'info');
            setPlayerChips(prev => prev + currentBet);
            setStats(prev => ({ ...prev, pushes: prev.pushes + 1 }));
            animateChipChange('push');
            scrollToMessage();
            console.log('Result: Push');
          }

          setGameState('gameOver');
          setTimeout(() => scrollToControls(), 500);
        }, 1000);
      }
    };

    setTimeout(dealerPlay, 1000);
  };

  // New round
  const newRound = () => {
    animateMessage('Starting new round...', 'info');
    scrollToMessage();
    setCardAnimations({});

    setTimeout(() => {
      setPlayerHand([]);
      setDealerHand([]);
      setShowDealerCard(false);
      setGameState('betting');
      animateMessage('Place your bet and start the game!', 'info');
      scrollToMessage();
    }, 500);
  };

  // Refill chips
  const refillChips = () => {
    setPlayerChips(Math.min(playerChips + 200, 1000));
    animateChipChange('refill');
    animateMessage('Chips refilled!', 'success');
    scrollToMessage();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: `
        radial-gradient(ellipse at center, rgba(26, 58, 26, 0.95) 0%, rgba(15, 30, 15, 0.98) 100%),
        url("/images/table.png") center/cover no-repeat
      `,
      color: 'white',
      fontFamily: '"Times New Roman", serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background elements */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 0
      }}>
        {[...Array(15)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: '3px',
            height: '3px',
            background: 'rgba(218, 165, 32, 0.4)',
            borderRadius: '50%',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${4 + Math.random() * 6}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 4}s`
          }} />
        ))}
      </div>

      {/* Enhanced Header */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        textAlign: 'center',
        marginBottom: '30px',
        padding: '20px',
        background: 'rgba(0, 0, 0, 0.4)',
        borderRadius: '15px',
        border: '2px solid rgba(218, 165, 32, 0.6)',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.5)'
      }}>
        <h1 style={{
          color: '#FFD700',
          fontSize: '3.5rem',
          marginBottom: '10px',
          textShadow: `
            0 0 10px rgba(255, 215, 0, 0.8),
            0 0 20px rgba(255, 215, 0, 0.6),
            2px 2px 4px rgba(0, 0, 0, 0.9)
          `,
          fontWeight: 'bold',
          letterSpacing: '3px',
          margin: 0,
          animation: 'gentleGlow 3s ease-in-out infinite alternate'
        }}>
          🃏 BLACKJACK 🃏
        </h1>

        <div style={{
          color: '#DAA520',
          fontSize: '1.1rem',
          fontStyle: 'italic',
          opacity: 0.9,
          textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
          animation: 'fadeInUp 2s ease-out'
        }}>
          Classic Las Vegas Style
        </div>
      </div>

      {/* Enhanced Message Display */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        margin: '20px 0',
        textAlign: 'center',
        minHeight: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'rgba(0, 0, 0, 0.7)',
          border: '2px solid rgba(218, 165, 32, 0.5)',
          borderRadius: '25px',
          padding: '15px 30px',
          boxShadow: `
            0 6px 20px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.1)
          `,
          animation: `${messageAnimation} 0.4s ease-out`,
          maxWidth: '600px',
          backdropFilter: 'blur(5px)'
        }}>
          <p style={{
            fontSize: '1.4rem',
            fontStyle: 'italic',
            margin: 0,
            fontWeight: 'bold',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
            color: messageAnimation === 'error' ? '#FF6B6B' :
                   messageAnimation === 'success' ? '#4ECDC4' :
                   messageAnimation === 'info' ? '#FFD700' : '#FFD700'
          }}>
            {message}
          </p>
        </div>
      </div>

      {/* Enhanced Dealer Hand */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        margin: '30px 0',
        textAlign: 'center'
      }}>
        <div style={{
          background: 'rgba(101, 67, 33, 0.8)',
          border: '3px solid #8B4513',
          borderRadius: '20px',
          padding: '25px',
          marginBottom: '20px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
          display: 'inline-block',
          backdropFilter: 'blur(8px)'
        }}>
          <h3 style={{
            color: '#FFD700',
            marginBottom: '20px',
            fontSize: '2rem',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)',
            fontWeight: 'bold',
            letterSpacing: '1px'
          }}>
            DEALER {showDealerCard ? `(${getHandValue(dealerHand)})` : ''}
          </h3>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '15px',
            minHeight: '180px',
            alignItems: 'center'
          }}>
            {dealerHand.map((card, index) => (
              <div key={index} style={{
                position: 'relative',
                animation: cardAnimations[`dealer-${index}`] === 'deal-in' ? 'dealIn 0.6s ease-out' :
                          cardAnimations[`dealer-${index}`] === 'flip' ? 'cardFlip 0.6s ease-in-out' : 'none'
              }}>
                {index === 1 && !showDealerCard ? (
                  <div style={{
                    width: '120px',
                    height: '175px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #2c2c2c, #1a1a1a)',
                    border: '3px solid #666',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    transform: 'rotateY(180deg)',
                    backfaceVisibility: 'hidden'
                  }}>
                    <img
                      src="/assets/back_black.png"
                      alt="Hidden card"
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '9px',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                ) : (
                  <div style={{
                    width: '120px',
                    height: '175px',
                    borderRadius: '12px',
                    background: 'white',
                    border: '2px solid #333',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.5)',
                    overflow: 'hidden',
                    transform: index === 1 && cardAnimations[`dealer-${index}`] === 'flip' ? 'rotateY(0deg)' : 'none',
                    transition: 'transform 0.6s ease-in-out'
                  }}>
                    <img
                      src={card.image}
                      alt={`${card.rank} of ${card.suit}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Player Hand */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        margin: '30px 0',
        textAlign: 'center'
      }}>
        <div style={{
          background: 'rgba(25, 25, 112, 0.8)',
          border: '3px solid #4169E1',
          borderRadius: '20px',
          padding: '25px',
          marginBottom: '20px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
          display: 'inline-block',
          backdropFilter: 'blur(8px)'
        }}>
          <h3 style={{
            color: '#FFD700',
            marginBottom: '20px',
            fontSize: '2rem',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)',
            fontWeight: 'bold',
            letterSpacing: '1px'
          }}>
            YOUR HAND {playerHand.length > 0 ? `(${getHandValue(playerHand)})` : ''}
          </h3>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '15px',
            minHeight: '180px',
            alignItems: 'center'
          }}>
            {playerHand.map((card, index) => (
              <div key={index} style={{
                position: 'relative',
                animation: cardAnimations[`player-${index}`] === 'deal-in' ? 'dealIn 0.6s ease-out' : 'none',
                transform: `translateY(${index * -4}px)`,
                zIndex: index
              }}>
                <div style={{
                  width: '120px',
                  height: '175px',
                  borderRadius: '12px',
                  background: 'white',
                  border: '2px solid #333',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.5)',
                  overflow: 'hidden',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                }}>
                  <img
                    src={card.image}
                    alt={`${card.rank} of ${card.suit}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Game Controls */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        background: 'rgba(0, 0, 0, 0.8)',
        border: '3px solid rgba(218, 165, 32, 0.6)',
        borderRadius: '25px',
        padding: '35px',
        margin: '30px 0',
        minWidth: '750px',
        textAlign: 'center',
        boxShadow: `
          0 15px 35px rgba(0, 0, 0, 0.6),
          inset 0 2px 0 rgba(255, 255, 255, 0.1)
        `,
        backdropFilter: 'blur(10px)',
        animation: 'slideUp 1s ease-out'
      }}>
        {gameState === 'betting' && (
          <>
            {/* Enhanced Chip Display */}
            <div style={{
              marginBottom: '30px',
              display: 'flex',
              justifyContent: 'center',
              gap: '40px',
              alignItems: 'center'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                borderRadius: '50px',
                padding: '20px 30px',
                boxShadow: chipAnimation === 'refill' ? '0 0 30px rgba(255, 215, 0, 0.8)' :
                          chipAnimation === 'win' ? '0 0 30px rgba(78, 205, 196, 0.8)' :
                          chipAnimation === 'lose' ? '0 0 30px rgba(255, 107, 107, 0.8)' :
                          '0 6px 20px rgba(255, 215, 0, 0.5)',
                border: '4px solid #FFD700',
                animation: chipAnimation ? `${chipAnimation} 0.8s ease-out` : 'none',
                transform: chipAnimation ? 'scale(1.1)' : 'scale(1)'
              }}>
                <p style={{
                  color: '#016f32',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  margin: 0,
                  textShadow: '1px 1px 2px rgba(255, 255, 255, 0.4)',
                  fontFamily: 'Arial, sans-serif'
                }}>
                  💰 ${playerChips}
                </p>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #FF6B6B, #FF4757)',
                borderRadius: '50px',
                padding: '20px 30px',
                boxShadow: chipAnimation === 'bet' ? '0 0 30px rgba(255, 107, 107, 0.8)' :
                          '0 6px 20px rgba(255, 107, 107, 0.5)',
                border: '4px solid #FF6B6B',
                animation: chipAnimation === 'bet' ? 'betPulse 0.6s ease-out' : 'none'
              }}>
                <p style={{
                  color: 'white',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  margin: 0,
                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)',
                  fontFamily: 'Arial, sans-serif'
                }}>
                  🎯 ${currentBet}
                </p>
              </div>
            </div>

            {/* Enhanced Bet Selection */}
            <div style={{ marginBottom: '35px' }}>
              <h4 style={{
                color: '#FFD700',
                marginBottom: '20px',
                fontSize: '1.4rem',
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
              }}>
                Select Your Bet:
              </h4>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                {[1, 5, 25, 100].map(value => (
                  <button
                    key={value}
                    disabled={value > playerChips}
                    onClick={() => setCurrentBet(value)}
                    style={{
                      background: currentBet === value ?
                        'linear-gradient(135deg, #FFD700, #FFA500)' :
                        (value <= playerChips ?
                          'linear-gradient(135deg, #228B22, #32CD32)' :
                          'linear-gradient(135deg, #666, #555)'
                        ),
                      color: currentBet === value ? '#016f32' : 'white',
                      border: currentBet === value ? '4px solid #FFF' : '3px solid rgba(255, 255, 255, 0.4)',
                      padding: '18px 25px',
                      borderRadius: '50%',
                      fontWeight: 'bold',
                      cursor: value <= playerChips ? 'pointer' : 'not-allowed',
                      minWidth: '75px',
                      minHeight: '75px',
                      fontSize: '1.2rem',
                      boxShadow: currentBet === value ?
                        '0 10px 30px rgba(255, 215, 0, 0.8)' :
                        '0 6px 20px rgba(0, 0, 0, 0.4)',
                      transition: 'all 0.3s ease',
                      transform: currentBet === value ? 'scale(1.15)' : 'scale(1)',
                      textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)',
                      fontFamily: 'Arial, sans-serif'
                    }}
                    onMouseEnter={(e) => {
                      if (value <= playerChips) {
                        e.target.style.transform = currentBet === value ? 'scale(1.2)' : 'scale(1.08)';
                        e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.5)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = currentBet === value ? 'scale(1.15)' : 'scale(1)';
                      e.target.style.boxShadow = currentBet === value ?
                        '0 10px 30px rgba(255, 215, 0, 0.8)' :
                        '0 6px 20px rgba(0, 0, 0, 0.4)';
                    }}
                  >
                    ${value}
                  </button>
                ))}
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '25px', flexWrap: 'wrap' }}>
              <button
                disabled={currentBet > playerChips || dealingCards}
                onClick={startGame}
                style={{
                  background: (currentBet <= playerChips && !dealingCards) ?
                    'linear-gradient(135deg, #FFD700, #FFA500)' :
                    'linear-gradient(135deg, #666, #555)',
                  color: (currentBet <= playerChips && !dealingCards) ? '#016f32' : '#999',
                  border: '4px solid rgba(255, 255, 255, 0.4)',
                  padding: '20px 40px',
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  fontSize: '1.4rem',
                  cursor: (currentBet <= playerChips && !dealingCards) ? 'pointer' : 'not-allowed',
                  boxShadow: (currentBet <= playerChips && !dealingCards) ?
                    '0 10px 30px rgba(255, 215, 0, 0.6)' :
                    '0 6px 20px rgba(0, 0, 0, 0.4)',
                  transition: 'all 0.3s ease',
                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)',
                  fontFamily: 'Arial, sans-serif',
                  animation: dealingCards ? 'pulse 1.5s infinite' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (currentBet <= playerChips && !dealingCards) {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 12px 35px rgba(255, 215, 0, 0.8)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = (currentBet <= playerChips && !dealingCards) ?
                    '0 10px 30px rgba(255, 215, 0, 0.6)' :
                    '0 6px 20px rgba(0, 0, 0, 0.4)';
                }}
              >
                🎮 {dealingCards ? 'DEALING...' : 'START GAME'}
              </button>

              <button
                disabled={playerChips >= 1000}
                onClick={refillChips}
                style={{
                  background: playerChips < 1000 ?
                    'linear-gradient(135deg, #4ECDC4, #44a08d)' :
                    'linear-gradient(135deg, #666, #555)',
                  color: playerChips < 1000 ? 'white' : '#999',
                  border: '4px solid rgba(255, 255, 255, 0.4)',
                  padding: '20px 40px',
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  fontSize: '1.4rem',
                  cursor: playerChips < 1000 ? 'pointer' : 'not-allowed',
                  boxShadow: playerChips < 1000 ?
                    '0 10px 30px rgba(78, 205, 196, 0.6)' :
                    '0 6px 20px rgba(0, 0, 0, 0.4)',
                  transition: 'all 0.3s ease',
                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)',
                  fontFamily: 'Arial, sans-serif'
                }}
                onMouseEnter={(e) => {
                  if (playerChips < 1000) {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 12px 35px rgba(78, 205, 196, 0.8)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = playerChips < 1000 ?
                    '0 10px 30px rgba(78, 205, 196, 0.6)' :
                    '0 6px 20px rgba(0, 0, 0, 0.4)';
                }}
              >
                💰 REFILL CHIPS
              </button>
            </div>
          </>
        )}

        {gameState === 'playing' && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>
            <button
              onClick={hit}
              style={{
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                color: '#016f32',
                border: '4px solid rgba(255, 255, 255, 0.6)',
                padding: '20px 40px',
                borderRadius: '20px',
                fontWeight: 'bold',
                fontSize: '1.4rem',
                cursor: 'pointer',
                boxShadow: '0 10px 30px rgba(255, 215, 0, 0.6)',
                transition: 'all 0.3s ease',
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)',
                fontFamily: 'Arial, sans-serif'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 12px 35px rgba(255, 215, 0, 0.8)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 10px 30px rgba(255, 215, 0, 0.6)';
              }}
            >
              🎯 HIT
            </button>

            <button
              onClick={stand}
              style={{
                background: 'linear-gradient(135deg, #FF6B6B, #FF4757)',
                color: 'white',
                border: '4px solid rgba(255, 255, 255, 0.6)',
                padding: '20px 40px',
                borderRadius: '20px',
                fontWeight: 'bold',
                fontSize: '1.4rem',
                cursor: 'pointer',
                boxShadow: '0 10px 30px rgba(255, 107, 107, 0.6)',
                transition: 'all 0.3s ease',
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)',
                fontFamily: 'Arial, sans-serif'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 12px 35px rgba(255, 107, 107, 0.8)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 10px 30px rgba(255, 107, 107, 0.6)';
              }}
            >
              🛑 STAND
            </button>
          </div>
        )}

        {gameState === 'gameOver' && (
          <button
            onClick={newRound}
            style={{
              background: 'linear-gradient(135deg, #4ECDC4, #44a08d)',
              color: 'white',
              border: '4px solid rgba(255, 255, 255, 0.6)',
              padding: '20px 40px',
              borderRadius: '20px',
              fontWeight: 'bold',
              fontSize: '1.4rem',
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(78, 205, 196, 0.6)',
              transition: 'all 0.3s ease',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)',
              fontFamily: 'Arial, sans-serif'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 12px 35px rgba(78, 205, 196, 0.8)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 10px 30px rgba(78, 205, 196, 0.6)';
            }}
          >
            🔄 NEW ROUND
          </button>
        )}
      </div>

      {/* Enhanced Stats */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        background: 'rgba(0, 0, 0, 0.8)',
        border: '3px solid rgba(218, 165, 32, 0.5)',
        borderRadius: '20px',
        padding: '25px',
        textAlign: 'center',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(8px)',
        animation: 'slideUp 1.2s ease-out 0.3s both'
      }}>
        <h4 style={{
          color: '#FFD700',
          marginBottom: '15px',
          fontSize: '1.3rem',
          textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
          fontFamily: 'Arial, sans-serif'
        }}>
          Game Statistics
        </h4>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '25px', flexWrap: 'wrap' }}>
          <span style={{
            color: '#4ECDC4',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)',
            fontFamily: 'Arial, sans-serif'
          }}>
            ✅ Wins: {stats.wins}
          </span>
          <span style={{
            color: '#FF6B6B',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)',
            fontFamily: 'Arial, sans-serif'
          }}>
            ❌ Losses: {stats.losses}
          </span>
          <span style={{
            color: '#FFD700',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)',
            fontFamily: 'Arial, sans-serif'
          }}>
            🤝 Pushes: {stats.pushes}
          </span>
          <span style={{
            color: '#9B59B6',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)',
            fontFamily: 'Arial, sans-serif'
          }}>
            🃏 Blackjacks: {stats.blackjacks}
          </span>
        </div>
      </div>

      {/* Enhanced CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.4; }
          50% { transform: translateY(-15px) rotate(180deg); opacity: 0.8; }
        }

        @keyframes gentleGlow {
          0%, 100% {
            text-shadow: 0 0 10px rgba(255, 215, 0, 0.6), 0 0 20px rgba(255, 215, 0, 0.4), 2px 2px 4px rgba(0, 0, 0, 0.9);
          }
          50% {
            text-shadow: 0 0 15px rgba(255, 215, 0, 0.8), 0 0 25px rgba(255, 215, 0, 0.6), 2px 2px 4px rgba(0, 0, 0, 0.9);
          }
        }

        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideUp {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes dealIn {
          0% {
            opacity: 0;
            transform: translateY(-120px) rotateY(-45deg) scale(0.8);
          }
          50% {
            opacity: 0.8;
            transform: translateY(-30px) rotateY(-22.5deg) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateY(0) rotateY(0deg) scale(1);
          }
        }

        @keyframes cardFlip {
          0% { transform: rotateY(180deg); }
          50% { transform: rotateY(90deg); }
          100% { transform: rotateY(0deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(0.98); }
        }

        @keyframes fade-out {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.98); }
        }

        @keyframes success {
          0% { opacity: 0; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }

        @keyframes error {
          0% { opacity: 0; transform: translateX(-15px); }
          25% { opacity: 1; transform: translateX(15px); }
          50% { opacity: 1; transform: translateX(-15px); }
          75% { opacity: 1; transform: translateX(15px); }
          100% { opacity: 1; transform: translateX(0); }
        }

        @keyframes info {
          0% { opacity: 0; transform: translateY(-15px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes win {
          0% { transform: scale(1); box-shadow: 0 6px 20px rgba(255, 215, 0, 0.5); }
          50% { transform: scale(1.2); box-shadow: 0 0 40px rgba(78, 205, 196, 1); }
          100% { transform: scale(1); box-shadow: 0 6px 20px rgba(255, 215, 0, 0.5); }
        }

        @keyframes lose {
          0% { transform: scale(1); box-shadow: 0 6px 20px rgba(255, 215, 0, 0.5); }
          50% { transform: scale(0.9); box-shadow: 0 0 40px rgba(255, 107, 107, 1); }
          100% { transform: scale(1); box-shadow: 0 6px 20px rgba(255, 215, 0, 0.5); }
        }

        @keyframes push {
          0% { transform: scale(1); box-shadow: 0 6px 20px rgba(255, 215, 0, 0.5); }
          50% { transform: scale(1.1); box-shadow: 0 0 40px rgba(255, 215, 0, 1); }
          100% { transform: scale(1); box-shadow: 0 6px 20px rgba(255, 215, 0, 0.5); }
        }

        @keyframes refill {
          0% { transform: scale(1); box-shadow: 0 6px 20px rgba(255, 215, 0, 0.5); }
          30% { transform: scale(1.15); box-shadow: 0 0 35px rgba(78, 205, 196, 0.8); }
          60% { transform: scale(0.95); box-shadow: 0 0 25px rgba(78, 205, 196, 0.6); }
          100% { transform: scale(1); box-shadow: 0 6px 20px rgba(255, 215, 0, 0.5); }
        }

        @keyframes betPulse {
          0% { transform: scale(1); box-shadow: 0 6px 20px rgba(255, 107, 107, 0.5); }
          50% { transform: scale(1.1); box-shadow: 0 0 30px rgba(255, 107, 107, 0.8); }
          100% { transform: scale(1); box-shadow: 0 6px 20px rgba(255, 107, 107, 0.5); }
        }

        /* Enhanced button hover effects */
        button:hover {
          filter: brightness(1.1);
        }

        /* Card hover effects */
        .card-container:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6);
        }

        /* Responsive design improvements */
        @media (max-width: 768px) {
          .game-container {
            padding: 15px;
          }

          .card {
            width: 90px !important;
            height: 135px !important;
          }

          button {
            padding: 15px 25px !important;
            font-size: 1.1rem !important;
            min-width: 120px !important;
          }

          h1 {
            font-size: 2.5rem !important;
          }
        }
          @media (max-width: 480px) {
            .game-container {
              padding: 5px !important;
              max-width: 100vw !important;
            }
            .card {
              width: 60px !important;
              height: 85px !important;
            }
            button {
              padding: 8px 12px !important;
              font-size: 0.85rem !important;
              min-width: 70px !important;
              border-radius: 10px !important;
            }
            h1 {
              font-size: 1.3rem !important;
            }
            h3 {
              font-size: 1rem !important;
            }
          }
      `}</style>
    </div>
  );
};

console.log('Loading classic BlackJack game...');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BlackJackGame />
  </React.StrictMode>,
)
