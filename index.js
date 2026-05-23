const http = require('http');
const mineflayer = require('mineflayer');
const config = require('./config.json');

// ─────────────────────────────
// RENDER KEEP-ALIVE SERVER
// ─────────────────────────────
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is running');
});

server.listen(process.env.PORT || 3000, () => {
  console.log('🌐 Web port opened');
});

// ─────────────────────────────
// USERNAME SYSTEM
// ─────────────────────────────
let lastUsername = null;

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateUsername() {
  const usernames = ['67Hunter', 'TungTung', 'FishingDuck'];

  const available = usernames.filter(u => u !== lastUsername);
  const selected = randomChoice(available);

  lastUsername = selected;
  return selected;
}

// ─────────────────────────────
// BOT CREATION
// ─────────────────────────────
function createBot() {
  const username = generateUsername();

  const bot = mineflayer.createBot({
    host: config.serverHost,
    port: config.serverPort,
    username: username,
    auth: 'offline',
    version: config.version || false,
    viewDistance: config.botChunk || 2
  });

  console.log(`🤖 Starting bot as ${username}`);

  let intervals = [];
  let timeouts = [];

  const chatMessages = [
    'lol','wait','lag','brb','one sec','yo','what happened',
    'im back','minecraft moment','bro','why is it lagging',
    'hi','sup','ok','where is everyone','bruh','what','real','nah'
  ];

  const actions = ['forward', 'back', 'left', 'right'];

  function cleanup() {
    intervals.forEach(clearInterval);
    timeouts.forEach(clearTimeout);
    intervals = [];
    timeouts = [];
  }

  bot.on('spawn', () => {
    console.log(`✅ ${username} joined successfully`);

    // anti-afk
    intervals.push(setInterval(() => {
      if (!bot.entity) return;

      bot.look(
        bot.entity.yaw + (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.2,
        true
      );

      const move = randomChoice(actions);
      bot.setControlState(move, true);

      const t = setTimeout(() => {
        if (!bot.entity) return;
        bot.setControlState(move, false);
      }, 1000 + Math.random() * 1500);

      timeouts.push(t);
    }, 10000));

    // random movement loop
    intervals.push(setInterval(() => {
      if (!bot.entity) return;

      bot.clearControlStates();

      const move1 = randomChoice(actions);
      bot.setControlState(move1, true);

      if (Math.random() > 0.7) {
        const move2 = randomChoice(actions);
        if (move2 !== move1) bot.setControlState(move2, true);
      }

      if (Math.random() > 0.65) bot.setControlState('jump', true);
      if (Math.random() > 0.7) bot.swingArm('right');

      const t = setTimeout(() => {
        if (!bot.entity) return;
        bot.clearControlStates();
      }, 3000 + Math.random() * 4000);

      timeouts.push(t);
    }, 8000));

    // chat loop
    intervals.push(setInterval(() => {
      if (!bot.entity) return;

      if (Math.random() > 0.96) {
        const msg = randomChoice(chatMessages);

        const typingTime =
          1500 + msg.length * 120 + Math.random() * 3000;

        const t = setTimeout(() => {
          if (!bot.entity) return;
          bot.chat(msg);
        }, typingTime);

        timeouts.push(t);
      }
    }, 45000));
  });

  bot.on('chat', (player, message) => {
    if (player === username) return;

    if (Math.random() > 0.93) {
      const replies = ['lol','true','ok','what','bruh','real','yea','idk','nah'];

      const reply = randomChoice(replies);

      const delay = 1200 + reply.length * 120 + Math.random() * 2500;

      const t = setTimeout(() => {
        if (!bot.entity) return;
        bot.chat(reply);
      }, delay);

      timeouts.push(t);
    }
  });

  bot.on('error', (err) => {
    console.log('⚠️ Error:', err.message);
  });

  bot.on('end', () => {
    console.log('⛔️ Bot disconnected');

    cleanup();

    const rejoinTime = 15000 + Math.random() * 15000;

    console.log(`🔄 Rejoining in ${Math.floor(rejoinTime / 1000)}s...`);

    setTimeout(createBot, rejoinTime);
  });
}

// ─────────────────────────────
// START
// ─────────────────────────────
createBot();
