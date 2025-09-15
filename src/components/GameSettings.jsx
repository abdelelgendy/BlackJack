import React, { useState } from 'react';
import styled from 'styled-components';
import { soundManager } from '../utils/soundManager';

const SettingsOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const SettingsModal = styled.div`
  background: #1a3a1a;
  border: 2px solid goldenrod;
  border-radius: 10px;
  padding: 30px;
  max-width: 400px;
  width: 90%;
  color: white;
`;

const SettingsTitle = styled.h2`
  color: goldenrod;
  text-align: center;
  margin-bottom: 20px;
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 15px 0;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
`;

const SettingLabel = styled.label`
  font-weight: bold;
`;

const ToggleSwitch = styled.input.attrs({ type: 'checkbox' })`
  width: 50px;
  height: 25px;
  appearance: none;
  background: #ccc;
  border-radius: 25px;
  position: relative;
  cursor: pointer;
  transition: background 0.3s;

  &:checked {
    background: goldenrod;
  }

  &::before {
    content: '';
    position: absolute;
    width: 21px;
    height: 21px;
    border-radius: 50%;
    background: white;
    top: 2px;
    left: 2px;
    transition: transform 0.3s;
  }

  &:checked::before {
    transform: translateX(25px);
  }
`;

const CloseButton = styled.button`
  background: goldenrod;
  color: #016f32;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 20px;
  width: 100%;

  &:hover {
    background: #ffd700;
  }
`;

const RulesList = styled.ul`
  margin: 15px 0;
  padding-left: 20px;
  line-height: 1.6;
`;

const GameSettings = ({ isOpen, onClose, settings, onSettingsChange }) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleToggle = (setting) => {
    const newSettings = {
      ...localSettings,
      [setting]: !localSettings[setting]
    };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);

    // Handle sound toggle
    if (setting === 'soundEnabled') {
      soundManager.setEnabled(newSettings.soundEnabled);
    }
  };

  if (!isOpen) return null;

  return (
    <SettingsOverlay onClick={onClose}>
      <SettingsModal onClick={(e) => e.stopPropagation()}>
        <SettingsTitle>Game Settings</SettingsTitle>
        
        <SettingItem>
          <SettingLabel>Sound Effects</SettingLabel>
          <ToggleSwitch
            checked={localSettings.soundEnabled}
            onChange={() => handleToggle('soundEnabled')}
          />
        </SettingItem>

        <SettingItem>
          <SettingLabel>Auto-stand on 21</SettingLabel>
          <ToggleSwitch
            checked={localSettings.autoStandOn21}
            onChange={() => handleToggle('autoStandOn21')}
          />
        </SettingItem>

        <SettingItem>
          <SettingLabel>Show Hand Totals</SettingLabel>
          <ToggleSwitch
            checked={localSettings.showHandTotals}
            onChange={() => handleToggle('showHandTotals')}
          />
        </SettingItem>

        <SettingItem>
          <SettingLabel>Fast Animations</SettingLabel>
          <ToggleSwitch
            checked={localSettings.fastAnimations}
            onChange={() => handleToggle('fastAnimations')}
          />
        </SettingItem>

        <SettingsTitle style={{ fontSize: '1.2rem', marginTop: '25px' }}>
          Game Rules
        </SettingsTitle>
        
        <RulesList>
          <li>Dealer stands on all 17s</li>
          <li>BlackJack pays 3:2</li>
          <li>Double down on any first two cards</li>
          <li>Split any matching pairs</li>
          <li>Insurance available when dealer shows Ace</li>
          <li>Surrender available on first two cards</li>
          <li>No re-splitting aces</li>
        </RulesList>

        <CloseButton onClick={onClose}>
          Close Settings
        </CloseButton>
      </SettingsModal>
    </SettingsOverlay>
  );
};

export default GameSettings;
