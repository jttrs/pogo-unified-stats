# Setup Instructions

If you're seeing a blank screen, here's how to get the Pokemon GO Unified Stats app running:

## Quick Fix Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open Browser
The terminal will show a URL like `http://localhost:3000` or `http://localhost:5173` - open this in your browser.

## Troubleshooting Blank Screen

### Check Browser Console
1. Open browser developer tools (F12)
2. Look for error messages in the Console tab
3. Common issues:
   - Missing dependencies
   - Import errors
   - CORS issues

### Common Solutions

**Problem: "npm command not found"**
```bash
# Install Node.js from nodejs.org, then:
npm install
npm run dev
```

**Problem: Dependencies missing**
```bash
npm install --force
npm run dev
```

**Problem: Port already in use**
```bash
npm run dev -- --port 3001
```

### Manual Verification

1. Check if `node_modules` folder exists - if not, run `npm install`
2. Check if `dist` folder is created when you run `npm run build`
3. Verify all files are present:
   - `package.json` ✓
   - `vite.config.js` ✓
   - `index.html` ✓
   - `src/main.jsx` ✓
   - `src/App.jsx` ✓

## Expected Result

Once working, you should see:
- Header with "Pokemon GO Unified Stats"
- Welcome message
- Three feature cards (PVP, Raid, Recommendations)
- Setup instructions

## Next Steps

After the basic app loads:
1. The app will show a simple interface
2. Full data loading will be implemented
3. PVPoke and DialGADex integration will be activated

## Need Help?

If still having issues:
1. Check the browser console for specific error messages
2. Ensure Node.js version 16+ is installed
3. Try deleting `node_modules` and running `npm install` again 