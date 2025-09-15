import React from 'react';
import styled from 'styled-components';

const BettingContainer = styled.div`
  background: rgba(0, 0, 0, 0.3);
  padding: 20px;
  border-radius: 10px;
  margin: 20px 0;
`;

const ChipSelector = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
`;

const ChipButton = styled.button`
  background: ${props => props.selected ? '#ffd700' : 'goldenrod'};
  color: ${props => props.selected ? '#016f32' : '#016f32'};
  border: ${props => props.selected ? '3px solid #fff' : 'none'};
  padding: 10px 15px;
  border-radius: 50%;
  font-weight: bold;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 60px;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background: #ffd700;
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const BetDisplay = styled.div`
  text-align: center;
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
  margin-bottom: 15px;
`;

const ChipsDisplay = styled.div`
  text-align: center;
  color: goldenrod;
  font-weight: bold;
  font-size: 1.1rem;
`;

const ActionButton = styled.button`
  background: goldenrod;
  color: #016f32;
  border: none;
  padding: 12px 24px;
  border-radius: 5px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  margin: 5px;
  min-width: 120px;

  &:hover:not(:disabled) {
    background: #ffd700;
    transform: translateY(-2px);
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

const ActionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 15px;
`;

const CHIP_VALUES = [1, 5, 25, 100];

const BettingInterface = ({ 
  currentBet, 
  playerChips, 
  onBetChange, 
  onStartGame, 
  onRefillChips,
  disabled = false 
}) => {
  const canAffordBet = (amount) => playerChips >= amount;

  return (
    <BettingContainer>
      <ChipsDisplay>
        Chips: ${playerChips}
      </ChipsDisplay>
      
      <BetDisplay>
        Current Bet: ${currentBet}
      </BetDisplay>

      <ChipSelector>
        {CHIP_VALUES.map(value => (
          <ChipButton
            key={value}
            selected={currentBet === value}
            disabled={disabled || !canAffordBet(value)}
            onClick={() => onBetChange(value)}
          >
            ${value}
          </ChipButton>
        ))}
      </ChipSelector>

      <ActionsContainer>
        <ActionButton
          disabled={disabled || !canAffordBet(currentBet)}
          onClick={onStartGame}
        >
          START GAME
        </ActionButton>
        
        <ActionButton
          disabled={playerChips >= 1000}
          onClick={onRefillChips}
        >
          REFILL CHIPS
        </ActionButton>
      </ActionsContainer>
    </BettingContainer>
  );
};

export default BettingInterface;
