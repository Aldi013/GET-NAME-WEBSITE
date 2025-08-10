(async () => {
  // Elemen
  const video = document.getElementById('video');
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d', { alpha: true });

  // Atur ukuran canvas sesuai layar & device pixel ratio
  let DPR = window.devicePixelRatio || 1;
  function resize() {
    DPR = window.devicePixelRatio || 1;
    canvas.width = Math.floor(window.innerWidth * DPR);
    canvas.height = Math.floor(window.innerHeight * DPR);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  // Setup ular
  const segmentCount = 60;   // panjang ular
  const speed = 8;           // kecepatan kepala ular
  const followDist = 8;      // jarak antar segmen ular

  let pointer = { x: window.innerWidth/2, y: window.innerHeight/2, active: false };
  let segments = [];

  function resetSnake() {
    segments = [];
    const startX = window.innerWidth/2;
    const startY = window.innerHeight/2;
    for (let i=0; i<segmentCount; i++) {
      segments.push({ x: startX - i*6, y: startY });
    }
  }
  resetSnake();

  // Setup kamera
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
  } catch (e) {
    console.error("Gagal akses kamera", e);
    return;
  }
  await new Promise(r => video.onloadeddata = r);

  // Load model handpose
  const model = await handpose.load();

  // Fungsi deteksi tangan dan update pointer
  async function detectHand() {
    const predictions = await model.estimateHands(video);

    if (predictions.length > 0) {
      // Landmark ujung jari telunjuk index ke-8
      const [x, y] = predictions[0].landmarks[8];

      // Skala koordinat video ke layar penuh
      const scaleX = window.innerWidth / video.videoWidth;
      const scaleY = window.innerHeight / video.videoHeight;

      pointer.x = x * scaleX;
      pointer.y = y * scaleY;
      pointer.active = true;
    } else {
      pointer.active = false;
    }

    requestAnimationFrame(detectHand);
  }
  detectHand();

  // Fungsi interpolasi linear
  function lerp(a, b, t) { return a + (b - a) * t; }

  let lastTime = performance.now();
  let footPhase = 0;

  // Animasi frame
  function frame(now) {
    const dt = Math.min(40, now - lastTime) / 16.6667;
    lastTime = now;
    footPhase += dt * 0.3;

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    if (pointer.active) {
      const head = segments[0];
      const dx = pointer.x - head.x;
      const dy = pointer.y - head.y;
      const dist = Math.hypot(dx, dy) || 1;
      const maxStep = speed * dt;
      const step = Math.min(maxStep, dist);
      head.x += dx / dist * step;
      head.y += dy / dist * step;
    } else {
      // Kalau tangan tidak terdeteksi, kembalikan ke tengah
      const head = segments[0];
      head.x = lerp(head.x, window.innerWidth/2, 0.01*dt);
      head.y = lerp(head.y, window.innerHeight/2, 0.01*dt);
    }

    // Update posisi segmen ular mengikuti segmen sebelumnya
    for (let i = 1; i < segmentCount; i++) {
      const prev = segments[i-1];
      const cur = segments[i];
      const dx = prev.x - cur.x;
      const dy = prev.y - cur.y;
      const d = Math.hypot(dx, dy) || 1;
      const targetX = prev.x - (dx / d) * followDist;
      const targetY = prev.y - (dy / d) * followDist;
      cur.x = lerp(cur.x, targetX, 0.4 * dt);
      cur.y = lerp(cur.y, targetY, 0.4 * dt);
    }

    // Gambar segmen ular
    for (let i = segments.length - 1; i >= 0; i--) {
      const p = segments[i];
      const t = i / Math.max(1, segments.length - 1);
      const size = lerp(14, 4, t);
      const hue = lerp(140, 200, t);
      const light = lerp(60, 35, t);
      ctx.beginPath();
      ctx.fillStyle = `hsl(${hue} 60% ${light}%)`;
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Gambar lingkaran di posisi pointer
    if (pointer.active) {
      const pulse = 5 * Math.sin(now / 200) + 20;
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 2;
      ctx.arc(pointer.x, pointer.y, pulse, 0, Math.PI * 2);
      ctx.stroke();
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();