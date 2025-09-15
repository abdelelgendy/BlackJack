import React from 'react';
import styled, { keyframes } from 'styled-components';
import { getCardImagePath, getBackCardImagePath } from '../utils/gameUtils';

const dealIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(-60px) rotate(-12deg);
  }
  60% {
    opacity: 1;
    transform: translateY(8px) rotate(4deg);
  }
  100% {
    opacity: 1;
    transform: translateY(0) rotate(0);
  }
`;

const CardOuter = styled.div`
  width: 110px;
  height: 165px;
  margin: 0 -20px;
  position: relative;
  animation: ${dealIn} 0.38s cubic-bezier(0.5, 1.5, 0.5, 1) forwards;
  animation-delay: ${props => props.delay || 0}s;
  opacity: 0;
`;

const CardInner = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.48s cubic-bezier(0.68, -0.6, 0.32, 1.6);
  transform: rotateY(${props => props.flipped ? '180deg' : '0'});
`;

const CardFace = styled.img`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
`;

const CardFront = styled(CardFace)`
  transform: rotateY(180deg);
`;

const CardBack = styled(CardFace)`
  transform: rotateY(0deg);
`;

const Card = ({ card, isRevealed = true, delay = 0, style = {} }) => {
  if (!card) return null;

  return (
    <CardOuter delay={delay} style={style}>
      <CardInner flipped={isRevealed}>
        <CardBack 
          src={getBackCardImagePath(card.suit)} 
          alt="Card back"
        />
        <CardFront 
          src={getCardImagePath(card)} 
          alt={`${card.rank} of ${card.suit}`}
        />
      </CardInner>
    </CardOuter>
  );
};

export default Card;
