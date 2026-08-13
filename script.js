// ---------- ตั้งค่า GIF และเพลงเริ่มต้นจากไฟล์ที่ฝังไว้ใน media.js ----------
const headerGif = document.getElementById('headerGif');
headerGif.src = EMBEDDED_GIF_SRC;

const bgAudio = new Audio(EMBEDDED_AUDIO_SRC);
bgAudio.loop = true;

function startBackgroundMusic() {
  const playPromise = bgAudio.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      // เบราว์เซอร์บางตัวบล็อก autoplay จนกว่าจะมีการโต้ตอบกับหน้าเว็บ
      const resumeAudio = () => {
        bgAudio.play();
        ['click', 'touchstart', 'keydown', 'scroll'].forEach(evt =>
          document.removeEventListener(evt, resumeAudio)
        );
      };
      ['click', 'touchstart', 'keydown', 'scroll'].forEach(evt =>
        document.addEventListener(evt, resumeAudio, { once: true })
      );
    });
  }
}

// ---------- หน้าจดหมาย: แตะเพื่อเปิด ----------
const envelopeScreen = document.getElementById('envelopeScreen');
const envelope = document.getElementById('envelope');
const tapHint = document.getElementById('tapHint');
const mainCardEl = document.getElementById('mainCard');
let envelopeOpened = false;

envelopeScreen.addEventListener('click', () => {
  if (envelopeOpened) return;
  envelopeOpened = true;

  envelope.classList.add('opened');
  tapHint.style.opacity = '0';

  // ตอนนี้เป็น user gesture จริง ๆ แล้ว เล่นเพลงได้แน่นอน
  startBackgroundMusic();

  setTimeout(() => {
    envelopeScreen.classList.add('hidden');
    mainCardEl.style.display = 'block';
  }, 850);
});

// ---------- ปุ่ม "ทิ้ง" กด -> ปุ่ม "ไม่ทิ้ง" โตขึ้นเรื่อย ๆ จนเต็มจอ / ปุ่ม "ทิ้ง" เล็กลงจนหาย ----------
const leaveBtn = document.getElementById('leaveBtn');
const stayBtn = document.getElementById('stayBtn');
const resultEl = document.getElementById('result');

const MAX_LEVEL = 10;
let level = 0;

const teasing = [
  "ใช่แล้ว ห้ามทิ้งกันเด็ดขาด 💗",
  "รักกันแบบนี้แหละ 🥹",
  "โตขึ้นอีกหน่อยละกัน 😆",
  "ไม่มีทางทิ้งกันหรอกเนอะ 💖",
  "ยิ่งกดยิ่งไม่ทิ้งนะ~",
  "ทิ้งไม่ได้หรอกก~",
  "ใกล้เต็มจอแล้วนะ~",
  "จะกดไปไหนอีกก 😆",
  "สู้ ๆ อีกนิดเดียว 💪",
  "ไม่ทิ้งกันตลอดไป 💕"
];

leaveBtn.addEventListener('click', () => {
  if (level >= MAX_LEVEL) return;

  // ครั้งแรกที่กด: เปลี่ยนปุ่ม "ทิ้ง" ให้หลุดออกจาก layout ปกติ
  // แล้วตรึงตำแหน่งเดิมไว้ก่อน เพื่อไม่ให้กระตุกตอนเริ่ม
  if (level === 0) {
    const rect = leaveBtn.getBoundingClientRect();
    // ย้ายปุ่มไปเป็นลูกของ <body> โดยตรงก่อน เพื่อไม่ให้ position:fixed
    // ไปอิงตำแหน่งกับ .card (ซึ่งมี animation แบบ transform ทำให้กลาย
    // เป็น containing block ชั่วคราว แล้วปุ่มจะกระเด็นออกนอกจอ)
    document.body.appendChild(leaveBtn);
    leaveBtn.style.position = 'fixed';
    leaveBtn.style.left = rect.left + 'px';
    leaveBtn.style.top = rect.top + 'px';
    leaveBtn.style.margin = '0';
    leaveBtn.classList.add('roaming');
    // บังคับ reflow ก่อน เพื่อให้การขยับตำแหน่งครั้งถัดไปมี transition
    void leaveBtn.offsetWidth;
  }

  level++;

  // ปุ่ม "ไม่ทิ้ง" ขยายขึ้นเรื่อย ๆ จนเต็มจอ
  const scale = 1 + level * 0.55;
  stayBtn.style.transform = `scale(${scale})`;

  // ปุ่ม "ทิ้ง" เล็กลงเรื่อย ๆ (ไม่จาง ไม่โปร่งใสระหว่างทาง) จนถึงขีดสุดค่อยหายไปทีเดียว
  const shrink = Math.max(0, 1 - level * (1 / MAX_LEVEL));
  leaveBtn.style.transform = `scale(${shrink})`;

  // สุ่มตำแหน่งใหม่ให้ปุ่ม "ทิ้ง" หนีไปเรื่อย ๆ ทั่วจอ
  const btnWidth = leaveBtn.offsetWidth || 100;
  const btnHeight = leaveBtn.offsetHeight || 50;
  const margin = 12; // เผื่อขอบจอไว้หน่อย กันโดนแถบเบราว์เซอร์บัง
  const maxLeft = Math.max(margin, window.innerWidth - btnWidth - margin);
  const maxTop = Math.max(margin, window.innerHeight - btnHeight - margin);
  const newLeft = margin + Math.random() * (maxLeft - margin);
  const newTop = margin + Math.random() * (maxTop - margin);
  leaveBtn.style.left = newLeft + 'px';
  leaveBtn.style.top = newTop + 'px';

  if (shrink <= 0.05) {
    leaveBtn.style.pointerEvents = 'none';
    leaveBtn.style.visibility = 'hidden';
  }

  resultEl.innerText = teasing[level - 1] || '';

  if (level === MAX_LEVEL) {
    // "ไม่ทิ้ง" ขยายจนเต็มจอ (เต็มทั้งจอมือถือด้วย)
    stayBtn.classList.add('fullscreen');
    stayBtn.style.transform = 'none';
  }
});

// ---------- ปุ่ม "ไม่ทิ้ง" กดเมื่อไหร่ก็ได้ (ไม่ว่าจะขนาดเท่าไหร่) -> ไปหน้าถัดไป ----------
const mainCard = document.getElementById('mainCard');
const nextPage = document.getElementById('nextPage');
const popGif = document.getElementById('popGif');

let hasTransitioned = false;

stayBtn.addEventListener('click', () => {
  if (hasTransitioned) return;
  hasTransitioned = true;
  goToNextPage();
});

function goToNextPage() {
  // ซ่อนการ์ดหน้าแรก
  mainCard.style.display = 'none';

  // ตั้งค่า gif ใหม่บนหน้าถัดไป
  popGif.src = EMBEDDED_GIF_SRC_2;

  // แสดงหน้าถัดไปพร้อมข้อความเด้ง
  nextPage.classList.add('show');

  // เปลี่ยนเพลงเป็นเพลงใหม่
  switchToNewSong();

  // เอฟเฟกต์หัวใจทะลักเต็มจอ
  createHeartBurst(150);
}

function switchToNewSong() {
  bgAudio.pause();
  bgAudio.src = EMBEDDED_AUDIO_SRC_2;
  bgAudio.currentTime = 0;
  bgAudio.loop = true;
  bgAudio.play().catch(() => {
    document.body.addEventListener('click', () => bgAudio.play(), { once: true });
  });
}

// ---------- หัวใจ: พุ่งขึ้นเหมือนน้ำพุ แล้วร่วงลงเหมือนสายฝน ----------
function createHeartBurst(count = 40) {
  const emojis = ['💖', '💕', '💗', '💓', '❤️', '💞'];

  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const heart = document.createElement('div');
      heart.classList.add('heart');
      heart.innerText = emojis[Math.floor(Math.random() * emojis.length)];

      const size = 16 + Math.random() * 30;               // ขนาดหัวใจ
      const dur = 2.6 + Math.random() * 2.2;               // ระยะเวลาทั้งหมด (วิ่งขึ้น + ตกลง)
      const x0 = (Math.random() * 30 - 15) + 'vw';         // จุดเริ่มใกล้กึ่งกลางจอ เหมือนพวยน้ำพุ
      const dir = Math.random() < 0.5 ? -1 : 1;
      const xPeak = dir * (10 + Math.random() * 40) + 'vw';   // กระจายออกด้านข้างตอนพุ่งขึ้นสุด
      const xEndDrift = (Math.random() * 20 - 10);
      const yPeak = -(40 + Math.random() * 45) + 'vh';     // ความสูงสุดของการพุ่งขึ้น
      const rot = (360 + Math.random() * 360) + 'deg';

      heart.style.fontSize = size + 'px';
      heart.style.setProperty('--dur', dur + 's');
      heart.style.setProperty('--x0', x0);
      heart.style.setProperty('--xPeak', xPeak);
      heart.style.setProperty('--xEnd', `calc(${xPeak} + ${xEndDrift}vw)`);
      heart.style.setProperty('--yPeak', yPeak);
      heart.style.setProperty('--rot', rot);

      document.body.appendChild(heart);
      setTimeout(() => heart.remove(), dur * 1000 + 300);
    }, i * 18);
  }
}
