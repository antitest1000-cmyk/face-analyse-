# Face Portal

Classic web portal style face image analysis demo.

## Setup

1. Install Node.js 18+.
2. Copy `.env.example` to `.env`.
3. Put a NEW OpenRouter API key in `.env`.
4. Install dependencies:
   `npm install`
5. Start:
   `npm start`
6. Open:
   `http://localhost:3000`

The API key stays on the server. Do not put it in `app.js` or `index.html`.

The analyzer intentionally does not infer race, ethnicity, nationality, or gender from faces. It reports face presence/count, cautious apparent age range, image quality, and directly visible non-sensitive features.

The image is held in memory for the request and is not saved by this demo server.
