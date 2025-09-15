import React from 'react';
import styled from 'styled-components';
import { GAME_STATES } from '../utils/gameUtils';

const ControlsContainer = styled.div`
  background: rgba(0, 0, 0, 0.3);
  padding: 20px;
  border-radius: 10px;
  margin: 20px 0;
`;

const ActionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-bottom: 15px;
`;

const ActionButton = styled.button`
  background: ${props => {
    if (props.variant === 'primary') return 'goldenrod';
    if (props.variant === 'danger') return '#ff4444';
    if (props.variant === 'success') return '#44ff44';
    return 'goldenrod';
  }};
  color: ${props => props.variant === 'success' ? '#000' : '#016f32'};
  border: none;
  padding: 12px 24px;
  border-radius: 5px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 100px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    filter: brightness(1.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #bfa74a;
    color: #888;
    transform: none;
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const MessageDisplay = styled.div`
  text-align: center;
  color: white;
  font-weight: bold;
  font-size: 1.3rem;
  font-style: italic;
  margin-bottom: 15px;
  min-height: 30px;
`;

const StatsDisplay = styled.div`
  text-align: center;
  color: goldenrod;
  font-weight: bold;
  font-size: 1rem;
  margin-top: 15px;
`;

const GameControls = ({ 
  gameState,
  message,
  availableActions,
  stats,
  onHit,
  onStand,
  onDoubleDown,
  onSplit,
  onNewRound,
  playerChips,
  currentBet
}) => {
  const isPlayerTurn = gameState === GAME_STATES.PLAYER_TURN;
  const isGameOver = gameState === GAME_STATES.GAME_OVER;
  
  const canDoubleDown = availableActions.includes('doubleDown') && playerChips >= currentBet;
  const canSplit = availableActions.includes('split') && playerChips >= currentBet;

  return (
    <ControlsContainer>
      <MessageDisplay>
        {message}
      </MessageDisplay>

      {isPlayerTurn && (
        <ActionsContainer>
          <ActionButton
            variant="primary"
            disabled={!availableActions.includes('hit')}
            onClick={onHit}
          >
            HIT
          </ActionButton>

          <ActionButton
            variant="danger"
            disabled={!availableActions.includes('stand')}
            onClick={onStand}
          >
            STAND
          </ActionButton>

          <ActionButton
            variant="success"
            disabled={!canDoubleDown}
            onClick={onDoubleDown}
            title={!canDoubleDown && playerChips < currentBet ? 'Not enough chips' : ''}
          >
            DOUBLE DOWN
          </ActionButton>

          <ActionButton
            variant="primary"
            disabled={!canSplit}
            onClick={onSplit}
            title={!canSplit && playerChips < currentBet ? 'Not enough chips' : ''}
          >
            SPLIT
          </ActionButton>
        </ActionsContainer>
      )}

      {isGameOver && (
        <ActionsContainer>
          <ActionButton
            variant="primary"
            onClick={onNewRound}
          >
            NEW ROUND
          </ActionButton>
        </ActionsContainer>
      )}

      <StatsDisplay>
        Wins: {stats.wins} | Losses: {stats.losses} | Pushes: {stats.pushes} | Blackjacks: {stats.blackjacks}
      </StatsDisplay>
    </ControlsContainer>
  );
};

export default GameControls;
