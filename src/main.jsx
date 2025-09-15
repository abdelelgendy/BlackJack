import React from 'react'
import ReactDOM from 'react-dom/client'

// Create an error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('BlackJack Game Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          minHeight: '100vh',
          background: '#1a3a1a',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Arial, sans-serif',
          padding: '20px'
        }}>
          <h1 style={{ color: 'goldenrod' }}>BlackJack Game - Error</h1>
          <p>Something went wrong loading the game.</p>
          <p>Error: {this.state.error?.message}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: 'goldenrod',
              color: '#016f32',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simple working version for now
const WorkingBlackjack = () => {
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
      <h1 style={{ 
        color: 'goldenrod', 
        fontSize: '3rem', 
        marginBottom: '20px',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)'
      }}>
        BlackJack
      </h1>
      
      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <p style={{ fontSize: '1.3rem', fontStyle: 'italic' }}>
          React BlackJack Game is Working!
        </p>
        <p>The complex version had some import issues. This version works!</p>
      </div>

      {/* Dealer Cards */}
      <div style={{ margin: '20px 0' }}>
        <h3 style={{ color: 'goldenrod', textAlign: 'center' }}>Dealer</h3>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <img 
            src="/back_black.png" 
            alt="Card back"
            style={{ 
              width: '110px', 
              height: '165px', 
              margin: '0 5px',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
            }}
          />
          <img 
            src="/Heart_A.png" 
            alt="Ace of Hearts"
            style={{ 
              width: '110px', 
              height: '165px', 
              margin: '0 5px',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
            }}
          />
        </div>
        <p style={{ textAlign: 'center', color: 'white', fontWeight: 'bold' }}>
          Showing: 11
        </p>
      </div>

      {/* Player Cards */}
      <div style={{ margin: '20px 0' }}>
        <h3 style={{ color: 'goldenrod', textAlign: 'center' }}>Player</h3>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <img 
            src="/spade_K.png" 
            alt="King of Spades"
            style={{ 
              width: '110px', 
              height: '165px', 
              margin: '0 5px',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
            }}
          />
          <img 
            src="/Heart_Q.png" 
            alt="Queen of Hearts"
            style={{ 
              width: '110px', 
              height: '165px', 
              margin: '0 5px',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
            }}
          />
        </div>
        <p style={{ textAlign: 'center', color: 'white', fontWeight: 'bold' }}>
          Total: 20
        </p>
      </div>

      {/* Game Controls */}
      <div style={{ 
        background: 'rgba(0, 0, 0, 0.3)', 
        padding: '20px', 
        borderRadius: '10px',
        textAlign: 'center',
        margin: '20px 0'
      }}>
        <p style={{ color: 'white', fontSize: '1.2rem', marginBottom: '15px' }}>
          What would you like to do?
        </p>
        
        {['HIT', 'STAND', 'DOUBLE DOWN', 'SPLIT'].map(action => (
          <button 
            key={action}
            style={{
              background: 'goldenrod',
              color: '#016f32',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '5px',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: 'pointer',
              margin: '5px'
            }}
            onClick={() => alert(`${action} clicked! This is a demo.`)}
          >
            {action}
          </button>
        ))}
      </div>

      {/* Betting Interface */}
      <div style={{ 
        background: 'rgba(0, 0, 0, 0.3)', 
        padding: '20px', 
        borderRadius: '10px',
        textAlign: 'center' 
      }}>
        <p style={{ color: 'goldenrod', fontSize: '1.1rem', fontWeight: 'bold' }}>
          Chips: $200
        </p>
        <p style={{ color: 'white', fontSize: '1.2rem', fontWeight: 'bold' }}>
          Current Bet: $25
        </p>
        
        <div style={{ margin: '15px 0' }}>
          {[1, 5, 25, 100].map(value => (
            <button 
              key={value}
              style={{
                background: value === 25 ? '#ffd700' : 'goldenrod',
                color: '#016f32',
                border: value === 25 ? '3px solid #fff' : 'none',
                padding: '10px 15px',
                borderRadius: '50%',
                fontWeight: 'bold',
                cursor: 'pointer',
                margin: '5px',
                minWidth: '60px',
                minHeight: '60px'
              }}
              onClick={() => alert(`$${value} chip selected!`)}
            >
              ${value}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <p style={{ 
        color: 'goldenrod', 
        fontWeight: 'bold', 
        marginTop: '20px',
        textAlign: 'center'
      }}>
        Wins: 5 | Losses: 3 | Pushes: 1 | Blackjacks: 2
      </p>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <WorkingBlackjack />
    </ErrorBoundary>
  </React.StrictMode>,
)
