<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1J_zzcsmJWJWfTOlMQEqNKfAv2Z_NkGhx

## Run Locally

**Prerequisites:**  Node.js

### Quick Start
1. Set the `API_KEY` in `.env` to your Gemini API key.
2. Run the startup script:
   ```bash
   ./start.sh
   ```
   This will install dependencies, clear any existing processes on ports 3001/5173, and start both the backend and frontend servers.

### Manual Setup
1. Install dependencies:
   `npm install`
2. Set the `API_KEY` in `.env` to your Gemini API key.
3. Start the backend:
   `node server.js`
4. Start the frontend:
   `npm start`
