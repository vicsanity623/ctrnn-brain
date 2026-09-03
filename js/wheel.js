// ============================================================
// Elden Earth — spin wheel
// Draws the 10-slice wheel and animates it to a weighted
// randomly chosen slice.
// ============================================================
const Wheel = (() => {
  let canvas, ctx;
  let rotation = 0; // current resting rotation, degrees

  function draw() {
    const slices = CONFIG.WHEEL_SLICES;
    const n = slices.length;
    const sliceAngle = (2 * Math.PI) / n;
    const cx = canvas.width / 2, cy = canvas.height / 2;
    const radius = Math.min(cx, cy) - 6;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < n; i++) {
      const start = -Math.PI / 2 + i * sliceAngle;
      const end = start + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = slices[i].color;
      ctx.fill();
      ctx.strokeStyle = "rgba(13,20,32,0.9)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // label
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + sliceAngle / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#0d1420";
      ctx.font = "bold 15px Manrope, sans-serif";
      ctx.fillText(slices[i].label, radius - 14, 5);
      ctx.restore();
    }

    // hub
    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, Math.PI * 2);
    ctx.fillStyle = "#0d1420";
    ctx.fill();
    ctx.strokeStyle = "#d4af61";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function init() {
    canvas = document.getElementById("wheel-canvas");
    ctx = canvas.getContext("2d");
    canvas.style.transition = "none";
    canvas.style.transform = "rotate(0deg)";
    draw();
  }

  // Helper to pick slice based on weighted odds
  function pickWeightedIndex() {
    const slices = CONFIG.WHEEL_SLICES;
    const totalWeight = slices.reduce((sum, s) => sum + (s.weight || 10), 0);
    let roll = Math.random() * totalWeight;

    for (let i = 0; i < slices.length; i++) {
      const w = slices[i].weight || 10;
      if (roll < w) return i;
      roll -= w;
    }
    return 0;
  }

  // Spins to weighted slice with realistic landing animation
  function spin(callback) {
    const n = CONFIG.WHEEL_SLICES.length;
    const sliceDeg = 360 / n;
    const targetIndex = pickWeightedIndex();

    // Add slight random offset within slice so needle doesn't always hit dead-center
    const jitter = (Math.random() - 0.5) * (sliceDeg * 0.7);
    const targetCenter = targetIndex * sliceDeg + sliceDeg / 2 + jitter;

    const extraSpins = 5 + Math.floor(Math.random() * 2);
    const neededRotation = (360 - targetCenter) % 360;

    // keep rotation monotonically increasing so it always spins "forward"
    const base = Math.ceil(rotation / 360) * 360;
    const finalRotation = base + extraSpins * 360 + neededRotation;

    canvas.style.transition = "transform 4.2s cubic-bezier(0.16, 0.85, 0.2, 1)";
    canvas.style.transform = `rotate(${finalRotation}deg)`;
    rotation = finalRotation;

    const onEnd = () => {
      canvas.removeEventListener("transitionend", onEnd);
      callback(CONFIG.WHEEL_SLICES[targetIndex]);
    };
    canvas.addEventListener("transitionend", onEnd);
  }

  return { init, spin };
})();
