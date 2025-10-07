# Assets Folder

This folder contains media assets for the QR Scanner application.

## Sound Files

### beep.mp3 (Optional)
You can place a custom beep sound file here to replace the programmatic beep sound.

**To use a custom sound file:**
1. Add your sound file to this folder (e.g., `beep.mp3`, `beep.wav`, or `beep.ogg`)
2. Update `src/utils/soundEffects.js`:
   - Comment out the `playBeep` function
   - Uncomment the `playBeepFromFile` function
   - Update the file path/name if needed
3. Import and use `playBeepFromFile` instead of `playBeep` in QRScanner.js

**Recommended sound specifications:**
- Format: MP3 or WAV
- Duration: 100-300ms (short and sharp)
- Volume: Normalized (not too loud)
- File size: < 50KB

## Other Assets
You can add other assets here such as:
- Images
- Icons
- Fonts
- Other sound effects

