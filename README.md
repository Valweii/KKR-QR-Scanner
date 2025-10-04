# KKR QR Scanner

A React web application for scanning QR tickets at events. The app allows users to scan QR codes containing ticket information, confirm registration, and maintain a history of scanned tickets.

## Features

- **QR Code Scanning**: Real-time QR code scanning using device camera
- **Ticket Validation**: Validates scanned tickets against Supabase database
- **Confirmation Popup**: Shows ticket details with confirm/cancel options
- **Scan History**: Maintains a local history of all scanned tickets
- **Responsive Design**: Mobile-first design matching the provided interface
- **Database Integration**: Updates ticket registration status in Supabase

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Create a `tickets` table with the following structure:

```sql
CREATE TABLE tickets (
  id SERIAL PRIMARY KEY,
  ticketId VARCHAR UNIQUE NOT NULL,
  name VARCHAR,
  instagram VARCHAR,
  phone VARCHAR,
  cgMember BOOLEAN DEFAULT FALSE,
  cgNumber VARCHAR,
  event VARCHAR,
  reregistered BOOLEAN DEFAULT FALSE,
  dateregistered TIMESTAMP WITH TIME ZONE
);
```

3. Update `src/supabase.js` with your Supabase credentials:

```javascript
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'
```

### 3. Run the Application

```bash
npm start
```

The app will open at `http://localhost:3000`

## QR Code Format

The app expects QR codes to contain JSON data in the following format:

```json
{
  "ticketId": "C2C-892076948",
  "name": "ad",
  "instagram": "@ad",
  "phone": "23213213213213",
  "cgMember": true,
  "cgNumber": "CG 47",
  "event": "Created 2 Connect - Youth Camp 2025"
}
```

## How It Works

1. **Scanning**: When a QR code is scanned, the app parses the JSON data
2. **Validation**: The app checks if the ticket exists in the database
3. **Confirmation**: If valid and not already registered, shows a popup with ticket details
4. **Registration**: Upon confirmation, updates the database with registration status and timestamp
5. **History**: Adds the scan to local history for tracking

## Browser Requirements

- Modern browser with camera access
- HTTPS connection (required for camera access in production)
- JavaScript enabled

## Security Notes

- The app requires HTTPS for camera access in production
- Database credentials should be kept secure
- Consider implementing additional validation for production use

## Troubleshooting

- **Camera not working**: Ensure HTTPS connection and camera permissions
- **Database errors**: Check Supabase credentials and table structure
- **QR code not scanning**: Ensure QR code contains valid JSON format
# KKR-QR-Scanner
