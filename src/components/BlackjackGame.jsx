import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Hand from './Hand';
import BettingInterface from './BettingInterface';
import GameControls from './GameControls';
import GameSettings from './GameSettings';
import { useBlackjackGame } from '../hooks/useBlackjackGame';
import { GAME_STATES } from '../utils/gameUtils';
import { soundManager, initializeSounds } from '../utils/soundManager';

const GameContainer = styled.div`
  min-height: 100vh;
  background: #1a3a1a url('/table.png') center/cover no-repeat;
  color: white;
  font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', Arial, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const GameTitle = styled.h1`
  color: goldenrod;
  font-size: 3rem;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  position: relative;
`;

const SettingsButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: goldenrod;
  border: 2px solid goldenrod;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: goldenrod;
    color: #016f32;
    transform: rotate(90deg);
  }
`;

const HeaderContainer = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const GameBoard = styled.div`
  max-width: 1200px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const HandsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin: 20px 0;
`;

const PlayerHandsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 40px;
  margin: 20px 0;
`;

const ControlsSection = styled.div`
  width: 100%;
  max-width: 600px;
  margin-top: 20px;
`;

const LoadingMessage = styled.div`
  color: goldenrod;
  font-size: 1.5rem;
  text-align: center;
  margin: 40px 0;
`;

const BlackjackGame = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [gameSettings, setGameSettings] = useState({
    soundEnabled: true,
    autoStandOn21: true,
    showHandTotals: true,
    fastAnimations: false
  });

  const {
    gameState,
    playerHands,
    dealerHand,
    activeHandIndex,
    playerChips,
    currentBet,
    totalBet,
    stats,
    message,
    showDealerCard,
    availableActions,
    canTakeInsurance,
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
  } = useBlackjackGame();

  // Initialize sounds on first user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      initializeSounds();
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  const handleHit = () => {
    if (gameSettings.soundEnabled) soundManager.playButtonClick();
    hit(activeHandIndex);
  };

  const handleStand = () => {
    if (gameSettings.soundEnabled) soundManager.playButtonClick();
    stand(activeHandIndex);
  };

  const handleStartRound = () => {
    if (gameSettings.soundEnabled) {
      soundManager.playButtonClick();
      setTimeout(() => soundManager.playCardDeal(), 200);
    }
    startRound();
  };

  const handleDoubleDown = () => {
    if (gameSettings.soundEnabled) soundManager.playButtonClick();
    doubleDown();
  };

  const handleSplit = () => {
    if (gameSettings.soundEnabled) soundManager.playButtonClick();
    split();
  };

  const handleSurrender = () => {
    if (gameSettings.soundEnabled) soundManager.playButtonClick();
    surrender();
  };

  const handleTakeInsurance = () => {
    if (gameSettings.soundEnabled) soundManager.playButtonClick();
    takeInsurance();
  };

  const handleBetChange = (amount) => {
    if (gameSettings.soundEnabled) soundManager.playChipClick();
    setBet(amount);
  };

  const getHandStatus = (handIndex, hand) => {
    // This would be enhanced to show specific hand outcomes
    // For now, we'll keep it simple
    return null;
  };

  const isBettingPhase = gameState === GAME_STATES.BETTING;
  const isDealing = gameState === GAME_STATES.DEALING;

  return (
    <GameContainer>
      <HeaderContainer>
        <GameTitle>BlackJack</GameTitle>
        <SettingsButton 
          onClick={() => setShowSettings(true)}
          title="Game Settings"
        >
          ⚙️
        </SettingsButton>
      </HeaderContainer>
      
      <GameBoard>
        {/* Dealer Hand */}
        <HandsContainer>
          <Hand
            cards={dealerHand}
            label="Dealer"
            isDealerHand={true}
            hideSecondCard={!showDealerCard && dealerHand.length > 1}
            showValue={dealerHand.length > 0 && gameSettings.showHandTotals}
          />
        </HandsContainer>

        {/* Player Hands */}
        <HandsContainer>
          <PlayerHandsContainer>
            {playerHands.map((hand, index) => (
              <Hand
                key={index}
                cards={hand}
                label={playerHands.length > 1 ? `Hand ${index + 1}` : 'Player'}
                isActive={index === activeHandIndex && gameState === GAME_STATES.PLAYER_TURN}
                status={getHandStatus(index, hand)}
                showValue={hand.length > 0 && gameSettings.showHandTotals}
              />
            ))}
          </PlayerHandsContainer>
        </HandsContainer>

        {/* Controls Section */}
        <ControlsSection>
          {isBettingPhase && (
            <BettingInterface
              currentBet={currentBet}
              playerChips={playerChips}
              onBetChange={handleBetChange}
              onStartGame={handleStartRound}
              onRefillChips={refillChips}
              disabled={isDealing}
            />
          )}

          {!isBettingPhase && (
            <GameControls
              gameState={gameState}
              message={message}
              availableActions={availableActions}
              stats={stats}
              onHit={handleHit}
              onStand={handleStand}
              onDoubleDown={handleDoubleDown}
              onSplit={handleSplit}
              onSurrender={handleSurrender}
              onTakeInsurance={handleTakeInsurance}
              onNewRound={newRound}
              playerChips={playerChips}
              currentBet={currentBet}
              canTakeInsurance={canTakeInsurance}
            />
          )}
        </ControlsSection>
      </GameBoard>

      {isDealing && (
        <LoadingMessage>
          Dealing cards...
        </LoadingMessage>
      )}

      <GameSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={gameSettings}
        onSettingsChange={setGameSettings}
      />
    </GameContainer>
  );
};

export default BlackjackGame;
