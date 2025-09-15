import React, { useState } from 'react';

const SimpleBlackjackGame = () => {
  const [message, setMessage] = useState('Place your bet to start!');
  const [playerChips, setPlayerChips] = useState(200);
  const [currentBet, setCurrentBet] = useState(5);

  const gameContainerStyle = {
    minHeight: '100vh',
    background: '#1a3a1a url("/table.png") center/cover no-repeat',
    color: 'white',
    fontFamily: 'Trebuchet MS, Lucida Sans Unicode, Lucida Grande, Arial, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px'
  };

  const titleStyle = {
    color: 'goldenrod',
    fontSize: '3rem',
    marginBottom: '20px',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)'
  };

  const buttonStyle = {
    background: 'goldenrod',
    color: '#016f32',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '5px',
    fontWeight: 'bold',
    fontSize: '1rem',
    cursor: 'pointer',
    margin: '5px'
  };

  const chipButtonStyle = {
    ...buttonStyle,
    borderRadius: '50%',
    minWidth: '60px',
    minHeight: '60px'
  };

  return (
    <div style={gameContainerStyle}>
      <h1 style={titleStyle}>BlackJack</h1>
      
      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <p style={{ fontSize: '1.3rem', fontStyle: 'italic' }}>
          {message}
        </p>
      </div>

      {/* Dealer Area */}
      <div style={{ margin: '20px 0' }}>
        <h3 style={{ color: 'goldenrod' }}>Dealer</h3>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          minHeight: '165px',
          alignItems: 'center' 
        }}>
          <div style={{
            width: '110px',
            height: '165px',
            background: 'url("/back_black.png") center/cover',
            borderRadius: '8px',
            margin: '0 5px'
          }}></div>
          <div style={{
            width: '110px',
            height: '165px',
            background: 'url("/back_red.png") center/cover',
            borderRadius: '8px',
            margin: '0 5px'
          }}></div>
        </div>
      </div>

      {/* Player Area */}
      <div style={{ margin: '20px 0' }}>
        <h3 style={{ color: 'goldenrod' }}>Player</h3>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          minHeight: '165px',
          alignItems: 'center' 
        }}>
          <div style={{
            width: '110px',
            height: '165px',
            background: 'url("/Heart_A.png") center/cover',
            borderRadius: '8px',
            margin: '0 5px'
          }}></div>
          <div style={{
            width: '110px',
            height: '165px',
            background: 'url("/spade_K.png") center/cover',
            borderRadius: '8px',
            margin: '0 5px'
          }}></div>
        </div>
      </div>

      {/* Betting Interface */}
      <div style={{ 
        background: 'rgba(0, 0, 0, 0.3)', 
        padding: '20px', 
        borderRadius: '10px',
        textAlign: 'center' 
      }}>
        <p style={{ color: 'goldenrod', fontSize: '1.1rem', fontWeight: 'bold' }}>
          Chips: ${playerChips}
        </p>
        <p style={{ color: 'white', fontSize: '1.2rem', fontWeight: 'bold' }}>
          Current Bet: ${currentBet}
        </p>
        
        <div style={{ margin: '15px 0' }}>
          {[1, 5, 25, 100].map(value => (
            <button 
              key={value}
              style={{
                ...chipButtonStyle,
                background: currentBet === value ? '#ffd700' : 'goldenrod'
              }}
              onClick={() => setCurrentBet(value)}
            >
              ${value}
            </button>
          ))}
        </div>

        <div>
          <button 
            style={buttonStyle}
            onClick={() => setMessage('Game started! (This is just a demo)')}
          >
            START GAME
          </button>
          <button 
            style={buttonStyle}
            onClick={() => setPlayerChips(Math.min(playerChips + 200, 1000))}
          >
            REFILL CHIPS
          </button>
        </div>
      </div>

      {/* Game Actions */}
      <div style={{ 
        background: 'rgba(0, 0, 0, 0.3)', 
        padding: '20px', 
        borderRadius: '10px',
        marginTop: '20px',
        textAlign: 'center' 
      }}>
        <button style={buttonStyle}>HIT</button>
        <button style={buttonStyle}>STAND</button>
        <button style={buttonStyle}>DOUBLE DOWN</button>
        <button style={buttonStyle}>SPLIT</button>
      </div>

      {/* Stats */}
      <p style={{ 
        color: 'goldenrod', 
        fontWeight: 'bold', 
        marginTop: '20px' 
      }}>
        Wins: 0 | Losses: 0 | Pushes: 0 | Blackjacks: 0
      </p>
    </div>
  );
};

export default SimpleBlackjackGame;
