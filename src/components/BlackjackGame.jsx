import React from 'react';
import styled from 'styled-components';
import Hand from './Hand';
import BettingInterface from './BettingInterface';
import GameControls from './GameControls';
import { useBlackjackGame } from '../hooks/useBlackjackGame';
import { GAME_STATES } from '../utils/gameUtils';

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
    startRound,
    hit,
    stand,
    doubleDown,
    split,
    newRound,
    setBet,
    refillChips
  } = useBlackjackGame();

  const handleHit = () => {
    hit(activeHandIndex);
  };

  const handleStand = () => {
    stand(activeHandIndex);
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
      <GameTitle>BlackJack</GameTitle>
      
      <GameBoard>
        {/* Dealer Hand */}
        <HandsContainer>
          <Hand
            cards={dealerHand}
            label="Dealer"
            isDealerHand={true}
            hideSecondCard={!showDealerCard && dealerHand.length > 1}
            showValue={dealerHand.length > 0}
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
                showValue={hand.length > 0}
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
              onBetChange={setBet}
              onStartGame={startRound}
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
              onDoubleDown={doubleDown}
              onSplit={split}
              onNewRound={newRound}
              playerChips={playerChips}
              currentBet={currentBet}
            />
          )}
        </ControlsSection>
      </GameBoard>

      {isDealing && (
        <LoadingMessage>
          Dealing cards...
        </LoadingMessage>
      )}
    </GameContainer>
  );
};

export default BlackjackGame;
