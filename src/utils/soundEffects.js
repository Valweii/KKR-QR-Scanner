// Sound Effects Utility
// This file provides sound effects for the QR scanner


/**
 * Alternative: Play beep from an audio file
 * Uncomment and use this function if you want to use a real audio file
 * Make sure to place your audio file in src/assets/beep.mp3
 */

export const playBeepFromFile = () => {
  try {
    const audio = new Audio(require('../assets/Beep.wav'));
    audio.volume = 0.5; // Adjust volume (0.0 to 1.0)
    audio.play().catch(error => {
      console.error('Error playing sound:', error);
    });
  } catch (error) {
    console.error('Error loading sound file:', error);
  }
};

