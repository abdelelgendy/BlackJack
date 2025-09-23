import React, { useState } from 'react';

function Card({ card, hidden }) {
  return (
    <div style={{
      width: 90,
      height: 130,
      background: '#fff',
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      display: 'inline-block',
      position: 'relative',
      marginRight: -30,
      border: '2px solid #eee',
      overflow: 'hidden',
    }}>
      {hidden ? (
        <img src="/assets/back_black.png" alt="Hidden" style={{ width: '100%', height: '100%' }} />
      ) : (
        <img src={card.image} alt={`${card.rank} of ${card.suit}`} style={{ width: '100%', height: '100%' }} />
      )}
      <div style={{
        position: 'absolute',
        right: 6,
        bottom: 6,
        background: '#111',
        color: '#fff',
        borderRadius: 4,
        fontSize: 16,
        padding: '2px 8px',
        minWidth: 24,
        textAlign: 'center',
      }}>
        {card.value}
      </div>
    </div>
  );
}

function ChipDisplay({ bet, chips }) {
  return (
    <div style={{ display: 'flex', gap: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
      <div style={{ textAlign: 'center' }}>
        <img src="/assets/back_blue.png" alt="Bet" style={{ width: 48, height: 48 }} />
        <div style={{ fontSize: 32, color: '#fff', marginTop: 8 }}>{bet}</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <img src="/assets/back_black.png" alt="Chips" style={{ width: 48, height: 48 }} />
        <div style={{ fontSize: 32, color: '#fff', marginTop: 8 }}>{chips}</div>
      </div>
    </div>
  );
}

export default function BlackJackGame() {
  // Demo state only
  const [playerHand] = useState([
    { rank: '6', suit: '♥', value: 6, image: '/assets/Heart_6.png' },
    { rank: '7', suit: '♥', value: 7, image: '/assets/Heart_7.png' },
  ]);
  const [dealerHand] = useState([
    { rank: '6', suit: '♦', value: 6, image: '/assets/Diamond_6.png' },
    { rank: 'X', suit: 'X', value: 0, image: '/assets/back_black.png' },
  ]);
  const [bet] = useState(50);
  const [chips] = useState(450);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #234d3c, #2e3d37 80%)',
      color: '#fff',
      fontFamily: 'serif',
      padding: 0,
    }}>
      <div style={{ height: 48, background: '#111', display: 'flex', alignItems: 'center', paddingLeft: 24, fontSize: 28, fontWeight: 600 }}>
        blackjack
        <div style={{ marginLeft: 'auto', marginRight: 16, fontSize: 22 }}>?</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', gap: 60, marginTop: 60 }}>
        {/* Left: Dealer & Player */}
        <div style={{ minWidth: 320 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 28, fontWeight: 500, marginBottom: 12 }}>Dealer</div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0 }}>
              <Card card={dealerHand[0]} hidden={false} />
              <Card card={dealerHand[1]} hidden={true} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 600, marginTop: 8, color: '#fff', background: 'rgba(0,0,0,0.7)', borderRadius: 6, display: 'inline-block', padding: '2px 12px' }}>6</div>
          </div>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 28, fontWeight: 500, marginBottom: 12 }}>Player</div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0 }}>
              <Card card={playerHand[0]} hidden={false} />
              <Card card={playerHand[1]} hidden={false} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 600, marginTop: 8, color: '#fff', background: 'rgba(0,0,0,0.7)', borderRadius: 6, display: 'inline-block', padding: '2px 12px' }}>13</div>
          </div>
        </div>
        {/* Right: Chips & Controls */}
        <div style={{ minWidth: 320, marginTop: 24 }}>
          <ChipDisplay bet={bet} chips={chips} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 30 }}>
            <button style={{ background: '#c33', color: '#fff', fontSize: 22, border: 'none', borderRadius: 8, padding: '18px 0', fontWeight: 500, cursor: 'pointer' }}>Hit</button>
            <button style={{ background: '#c33', color: '#fff', fontSize: 22, border: 'none', borderRadius: 8, padding: '18px 0', fontWeight: 500, cursor: 'pointer' }}>Double</button>
            <button style={{ background: '#c33', color: '#fff', fontSize: 22, border: 'none', borderRadius: 8, padding: '18px 0', fontWeight: 500, cursor: 'pointer' }}>Stand</button>
            <button style={{ background: '#222', color: '#fff', fontSize: 22, border: 'none', borderRadius: 8, padding: '18px 0', fontWeight: 500, cursor: 'pointer' }}>Split</button>
          </div>
        </div>
      </div>
    </div>
  );
}
