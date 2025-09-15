// Sound effects utility
class SoundManager {
  constructor() {
    this.sounds = {};
    this.enabled = true;
  }

  // Load sound files (you can add actual sound files later)
  loadSounds() {
    // For now, we'll use Web Audio API to create simple beeps
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  // Create a simple beep sound
  createBeep(frequency = 440, duration = 200, type = 'sine') {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration / 1000);
  }

  // Play different game sounds
  playCardDeal() {
    this.createBeep(220, 100, 'square');
  }

  playCardFlip() {
    this.createBeep(330, 150, 'sine');
  }

  playWin() {
    // Happy ascending notes
    setTimeout(() => this.createBeep(523, 150), 0);
    setTimeout(() => this.createBeep(659, 150), 100);
    setTimeout(() => this.createBeep(784, 200), 200);
  }

  playLose() {
    // Sad descending notes
    setTimeout(() => this.createBeep(392, 200), 0);
    setTimeout(() => this.createBeep(330, 200), 150);
    setTimeout(() => this.createBeep(262, 300), 300);
  }

  playBlackjack() {
    // Exciting winning sound
    setTimeout(() => this.createBeep(523, 100), 0);
    setTimeout(() => this.createBeep(659, 100), 50);
    setTimeout(() => this.createBeep(784, 100), 100);
    setTimeout(() => this.createBeep(1047, 300), 150);
  }

  playBust() {
    // Dramatic fail sound
    this.createBeep(185, 500, 'sawtooth');
  }

  playChipClick() {
    this.createBeep(800, 50, 'square');
  }

  playButtonClick() {
    this.createBeep(600, 75, 'sine');
  }

  toggle() {
    this.enabled = !this.enabled;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }
}

export const soundManager = new SoundManager();

// Initialize sounds when user first interacts with the page
export const initializeSounds = () => {
  if (!soundManager.audioContext) {
    soundManager.loadSounds();
  }
};
