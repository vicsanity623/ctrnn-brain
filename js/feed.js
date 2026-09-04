// ============================================================
// Elden Earth — Live Activity Feed (Firestore Real-Time Sync)
// ============================================================
const Feed = (() => {
  let feedContainer = null;
  let feedText = null;
  let activeTimeout = null;
  let lastEventId = null;

  // City lookup helper (cached simple reverse geocode or fallback)
  let cachedCityName = null;

  // Converts ANY 2-letter country code ("us", "gb", "jp", "de", "ca", etc.) into its true country flag emoji
  function getFlagEmoji(countryCode) {
    if (!countryCode || countryCode.length !== 2) return "🌐";
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }

  async function resolveCity(lat, lon) {
    if (cachedCityName) return cachedCityName;
    if (!lat || !lon) return "the Realm";
    try {
      // Free open reverse geocoding
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`);
      const data = await res.json();
      
      const city = data.address?.city || data.address?.town || data.address?.municipality || data.address?.village || "the Realm";
      const state = data.address?.state ? `, ${data.address.state.slice(0, 2).toUpperCase()}` : "";
      const flag = getFlagEmoji(data.address?.country_code);

      cachedCityName = `${city}${state} ${flag}`;
      return cachedCityName;
    } catch (e) {
      return "the Realm 🌐";
    }
  }

  // Display notification on HUD
  function displayMessage(htmlContent) {
    if (!feedContainer || !feedText) return;

    feedText.innerHTML = htmlContent;
    feedContainer.classList.remove("feed-hidden");
    feedContainer.classList.add("feed-visible");

    clearTimeout(activeTimeout);
    // Stays visible for 5.5 seconds then softly fades
    activeTimeout = setTimeout(() => {
      feedContainer.classList.remove("feed-visible");
      feedContainer.classList.add("feed-hidden");
    }, 5500);
  }

  // Push an event to Firebase Firestore
  async function broadcast(type, details = {}) {
    const db = Store.getDb();
    const state = Store.get();
    const playerName = state?.player?.name || "Traveler";
    const avatar = state?.player?.avatar || "🙂";

    let message = "";
    if (type === "land") {
      const location = details.location || "the Realm";
      const rarityLabel = details.rarity || "land";
      message = `<strong>${playerName}</strong> just claimed a ${rarityLabel} plot in <em>${location}</em>`;
    } else if (type === "jackpot") {
      const amount = details.amount || 25;
      message = `🎉 <strong>${playerName}</strong> struck gold! Won <strong>${amount} EB</strong> on the Wheel!`;
    }

    // Local instant preview
    displayMessage(message);

    if (!db) return;

    try {
      await db.collection("feed").add({
        playerName,
        avatar,
        type,
        message,
        timestamp: Date.now(),
      });
    } catch (err) {
      console.warn("[Feed] Broadcast error:", err);
    }
  }

  // Listen for live worldwide events via Firestore
  function listen() {
    const db = Store.getDb();
    if (!db) return;

    const oneHourAgo = Date.now() - 3600000;

    try {
      db.collection("feed")
        .where("timestamp", ">=", oneHourAgo)
        .orderBy("timestamp", "desc")
        .limit(1)
        .onSnapshot((snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const docId = change.doc.id;
              const data = change.doc.data();

              // Prevent repeating events or showing ancient history on boot
              if (lastEventId === null) {
                lastEventId = docId;
                return;
              }

              if (docId !== lastEventId) {
                lastEventId = docId;
                displayMessage(data.message);
              }
            }
          });
        }, (err) => console.warn("[Feed] Listener notice:", err));
    } catch (e) {
      console.warn("[Feed] Setup error:", e);
    }
  }

  function init() {
    feedContainer = document.getElementById("live-feed-card");
    feedText = document.getElementById("live-feed-text");
    listen();
  }

  return { init, broadcast, resolveCity };
})();