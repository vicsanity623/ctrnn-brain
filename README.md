# Elden Earth

A personal, real-world tile-collecting game. Walk around, find diamonds within a
mile of you, spend them on a spin wheel for Elden Bucks (EB), then use EB to
claim real 10×10 ft tiles on the map beneath you. Every tile you own earns EB
automatically, forever, ticking up once a second.

Pure static HTML/CSS/JS — no build step, no server, no API keys required to run.

## Host it on GitHub Pages

1. Create a new GitHub repository (public or private, either works with Pages).
2. Upload every file in this folder, keeping the same structure:
   ```
   index.html
   css/style.css
   js/config.js
   js/geo.js
   js/storage.js
   js/auth.js
   js/diamonds.js
   js/grid.js
   js/wheel.js
   js/main.js
   README.md
   ```
3. In the repo, go to **Settings → Pages**, set **Source** to your default
   branch (e.g. `main`) and folder `/ (root)`, then save.
4. GitHub gives you a URL like `https://yourname.github.io/your-repo/`.
   Open it on your phone — location access requires **HTTPS**, which GitHub
   Pages provides automatically.

That's it. Progress is saved to the browser's local storage on whatever
device you play on.

## Optional: real Google sign-in

By default the game only offers "Play as Guest" (data stored on-device).
To add "Sign in with Google":

1. Go to the [Google Cloud Console credentials page](https://console.cloud.google.com/apis/credentials).
2. Create an **OAuth 2.0 Client ID** of type **Web application**.
3. Under **Authorized JavaScript origins**, add your GitHub Pages URL,
   e.g. `https://yourname.github.io`.
4. Copy the generated Client ID into `js/config.js`:
   ```js
   GOOGLE_CLIENT_ID: "your-id-here.apps.googleusercontent.com",
   ```
5. Commit and push. The Google button will now appear on the sign-in screen.

Without this step the game still works fully in guest mode.

## How the mechanics map to the code

| Mechanic | File | Notes |
|---|---|---|
| Real-world grid of ~10×10 ft tiles | `js/geo.js`, `js/grid.js` | Uses the same Web Mercator projection as the map itself, snapped into fixed-size meter cells, so tiles line up perfectly at any location on Earth. |
| Diamonds spawn within 1 mile, collect within 20 yards | `js/diamonds.js` | Sampled uniformly over the disk around your last known GPS fix; tapping one checks your live distance with the Haversine formula before allowing collection. |
| Spin wheel (1 diamond per spin, 10 equal-odds slots) | `js/wheel.js`, `js/config.js` | 5 slots return your diamond, 5 pay out 1 / 2 / 5 / 25 / 50 EB. Edit `WHEEL_SLICES` in `config.js` to rebalance. |
| Buying land (100 EB, random rarity) | `js/grid.js`, `js/config.js` | Tap any empty tile once zoomed in close enough to see the grid. Rarity odds and payout rates live in `PLOT_RARITIES`. |
| Passive income ticking every second, with offline catch-up | `js/storage.js`, `js/main.js` | Balance updates once a second in the UI, and on reopening the app it back-fills whatever time passed while it was closed. |

## Tuning the game

Every number a player would feel — spawn radius, collection radius, plot
cost, per-second rates, rarity odds, wheel payouts — lives in one place:
`js/config.js`. Nothing else in the codebase needs to change to rebalance it.

## Notes & limitations

- Location accuracy depends entirely on the device's GPS; indoors or in dense
  cities it can drift by tens of meters, which affects whether a diamond
  reads as "in range."
- The tile grid only renders once you're zoomed in close (tiles are tiny —
  10 real feet across), by design, so the map doesn't choke on drawing
  thousands of polygons at city zoom.
- This is a from-scratch, personal-use fan implementation of the "walk
  around and claim real-world tiles" idea — it doesn't use any code, assets,
  or backend from Atlas Earth or any other existing app.
