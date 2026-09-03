// ============================================================
// Elden Earth — sign in
// Google Identity Services if a client ID is configured,
// otherwise a plain guest profile stored on-device.
// ============================================================
const Auth = (() => {

  function decodeJwt(token) {
    try {
      const payload = token.split(".")[1];
      const json = decodeURIComponent(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
        .split("").map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join(""));
      return JSON.parse(json);
    } catch (e) { return null; }
  }

  function init(onSignedIn) {
    const guestBtn = document.getElementById("guest-btn");
    const slot = document.getElementById("g_id_signin_slot");

    // Auto-login immediately if player has already started a save
    const state = Store.get();
    if (state && state.player && state.player.id) {
      onSignedIn(state.player);
      return;
    }

    guestBtn.addEventListener("click", () => {
      const s = Store.get();
      if (!s.player.id) {
        s.player.id = "guest-" + Math.random().toString(36).slice(2, 10);
        s.player.name = "Traveler";
        Store.save();
      }
      onSignedIn(s.player);
    });

    if (!CONFIG.GOOGLE_CLIENT_ID) {
      slot.innerHTML = `<p class="fine-print">Google sign-in isn't configured for this deployment — continue as a guest below.</p>`;
      return;
    }

    // Wait for the Google script to be ready, then render the button.
    const tryInit = () => {
      if (!window.google || !google.accounts || !google.accounts.id) {
        setTimeout(tryInit, 200);
        return;
      }
      google.accounts.id.initialize({
        client_id: CONFIG.GOOGLE_CLIENT_ID,
        callback: (resp) => {
          const payload = decodeJwt(resp.credential);
          if (!payload) return;
          const state = Store.get();
          state.player.id = "google-" + payload.sub;
          state.player.name = payload.given_name || payload.name || "Traveler";
          state.player.avatar = payload.picture ? "img:" + payload.picture : "🙂";
          Store.save();
          onSignedIn(state.player);
        },
      });
      google.accounts.id.renderButton(slot, {
        theme: "filled_black", shape: "pill", size: "large", width: 280,
      });
    };
    tryInit();
  }

  return { init };
})();
