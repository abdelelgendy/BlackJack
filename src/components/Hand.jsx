import React from 'react';
import styled from 'styled-components';
import Card from './Card';
import { calculateHandValue, isBlackjack, isBust } from '../utils/gameUtils';

const HandContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px 0;
`;

const HandLabel = styled.h3`
  color: goldenrod;
  margin-bottom: 10px;
  font-size: 1.2rem;
`;

const CardsContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: center;
  gap: 0.5ch;
  min-height: 165px;
`;

const HandValue = styled.div`
  color: white;
  font-weight: bold;
  margin-top: 10px;
  font-size: 1.1rem;
`;

const HandStatus = styled.div`
  color: ${props => {
    if (props.status === 'blackjack') return '#00ff00';
    if (props.status === 'bust') return '#ff4444';
    if (props.status === 'win') return '#00ff00';
    if (props.status === 'lose') return '#ff4444';
    return '#ffff00';
  }};
  font-weight: bold;
  margin-top: 5px;
`;

const ActiveIndicator = styled.div`
  width: 100%;
  height: 3px;
  background: ${props => props.isActive ? 'goldenrod' : 'transparent'};
  margin-bottom: 10px;
  border-radius: 2px;
`;

const Hand = ({ 
  cards = [], 
  label, 
  showValue = true, 
  isActive = false,
  status = null,
  isDealerHand = false,
  hideSecondCard = false
}) => {
  const handValue = calculateHandValue(cards);
  const isBlackjackHand = isBlackjack(cards);
  const isBustHand = isBust(cards);

  const getStatusText = () => {
    if (status) return status;
    if (isBlackjackHand) return 'BLACKJACK!';
    if (isBustHand) return 'BUST!';
    return '';
  };

  const getStatusType = () => {
    if (status === 'win') return 'win';
    if (status === 'lose') return 'lose';
    if (status === 'push') return 'push';
    if (isBlackjackHand) return 'blackjack';
    if (isBustHand) return 'bust';
    return '';
  };

  return (
    <HandContainer>
      <ActiveIndicator isActive={isActive} />
      {label && <HandLabel>{label}</HandLabel>}
      
      <CardsContainer>
        {cards.map((card, index) => {
          const shouldHide = isDealerHand && hideSecondCard && index === 1;
          return (
            <Card
              key={`${card.id}-${index}`}
              card={card}
              isRevealed={!shouldHide}
              delay={index * 0.2}
            />
          );
        })}
      </CardsContainer>

      {showValue && cards.length > 0 && (
        <HandValue>
          {isDealerHand && hideSecondCard 
            ? `Showing: ${cards[0]? calculateHandValue([cards[0]]) : 0}`
            : `Total: ${handValue}`
          }
        </HandValue>
      )}

      {getStatusText() && (
        <HandStatus status={getStatusType()}>
          {getStatusText()}
        </HandStatus>
      )}
    </HandContainer>
  );
};

export default Hand;
