const http = require('http');
const mineflayer = require('mineflayer');
const config = require('./config.json');

//
// ─────────────────────────────────────────────
// KEEP RENDER ALIVE (web server)
// ─────────────────────────────────────────────
//
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is running');
});

server.listen(process.env.PORT || 3000, () => {
  console.log('🌐 Web port opened');
});

//
// ─────────────────────────────────────────────
// USERNAME SYSTEM (NO REPEATS)
// ─────────────────────────────────────────────
//
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

//
// ─────────────────────────────────────────────
// BOT LOOP
// ─────────────────────────────────────────────
//
function createBot() {
  const selectedUsername = generateUsername();

  const bot = mineflayer.createBot({
    host: config.serverHost,
    port: config.serverPort,
    username: selectedUsername,
    auth: 'offline',
    version: '1.21.5',
    viewDistance: config.botChunk
  });

  console.log(`🤖 Starting bot as ${selectedUsername}`);

  let movementLoop;
  let lookLoop;
  let chatLoop;
  let randomActionLoop;
  let antiAfkLoop;
  let leaveTimeout;

  const chatMessages = [
    'lol','wait','lag','brb','one sec','yo','what happened',
    'im back','minecraft moment','bro','why is it lagging',
    'hi','sup','ok','where is everyone','bruh','what','real','nah'
  ];

  const actions = ['forward', 'back', 'left', 'right'];

  bot.on('spawn', () => {
    console.log(`✅ ${selectedUsername} joined successfully`);

    const leaveTime = (1 + Math.random() * 2) * 60 * 60 * 1000;

    leaveTimeout = setTimeout(() => {
      console.log('🚪 Simulating player leaving');
      bot.quit('brb');
    }, leaveTime);

    setTimeout(() => {

      antiAfkLoop = setInterval(() => {
        if (!bot.entity) return;

        bot.look(
          bot.entity.yaw + ((Math.random() - 0.5) * 0.3),
          (Math.random() - 0.5) * 0.2,
          true
        );

        const move = randomChoice(actions);

        bot.setControlState(move, true);

        setTimeout(() => {
          if (!bot.entity) return;
          bot.setControlState(move, false);
        }, 1000 + Math.random() * 1500);

        if (Math.random() > 0.6) {
          bot.setControlState('jump', true);

          setTimeout(() => {
            if (!bot.entity) return;
            bot.setControlState('jump', false);
          }, 250);
        }
      }, 10000);

      lookLoop = setInterval(() => {
        if (!bot.entity) return;

        bot.look(
          Math.random() * Math.PI * 2,
          (Math.random() - 0.5) * 0.8,
          true
        );
      }, 7000);

      movementLoop = setInterval(() => {
        if (!bot.entity) return;

        bot.clearControlStates();

        if (Math.random() > 0.78) bot.setControlState('sneak', true);
        if (Math.random() > 0.65) bot.setControlState('sprint', true);

        const move1 = randomChoice(actions);
        bot.setControlState(move1, true);

        if (Math.random() > 0.7) {
          const move2 = randomChoice(actions);
          if (move2 !== move1) bot.setControlState(move2, true);
        }

        if (Math.random() > 0.65) {
          bot.setControlState('jump', true);
          setTimeout(() => {
            if (!bot.entity) return;
            bot.setControlState('jump', false);
          }, 300);
        }

        if (Math.random() > 0.7) bot.swingArm('right');

        setTimeout(() => {
          if (!bot.entity) return;
          bot.clearControlStates();
        }, 3000 + Math.random() * 4000);

      }, 8000);

      chatLoop = setInterval(() => {
        if (!bot.entity) return;

        if (Math.random() > 0.96) {
          bot.clearControlStates();

          const msg = randomChoice(chatMessages);

          const typingTime =
            1500 + msg.length * 120 + Math.random() * 3000;

          setTimeout(() => {
            if (!bot.entity) return;
            bot.chat(msg);
          }, typingTime);
        }
      }, 45000);

      randomActionLoop = setInterval(() => {
        if (!bot.entity) return;

        if (Math.random() > 0.8) {
          bot.setControlState('sneak', true);

          setTimeout(() => {
            if (!bot.entity) return;
            bot.setControlState('sneak', false);
          }, 1500);
        }
      }, 30000);

    }, 4000);
  });

  bot.on('chat', (username, message) => {
    if (username === selectedUsername) return;

    if (Math.random() > 0.93) {
      const replies = ['lol','true','ok','what','bruh','real','yea','maybe','idk','nah'];

      const reply = randomChoice(replies);

      const typingDelay =
        1200 + reply.length * 120 + Math.random() * 2500;

      bot.clearControlStates();

      setTimeout(() => {
        if (!bot.entity) return;
        bot.chat(reply);
      }, typingDelay);
    }
  });

  bot.on('error', (err) => {
    console.log('⚠️ Error:', err.message);

    if (['ECONNRESET', 'ETIMEDOUT'].includes(err.code)) return;
  });

  function cleanup() {
    clearInterval(movementLoop);
    clearInterval(lookLoop);
    clearInterval(chatLoop);
    clearInterval(randomActionLoop);
    clearInterval(antiAfkLoop);
    clearTimeout(leaveTimeout);
  }

  bot.on('end', () => {
    console.log('⛔️ Bot disconnected');

    cleanup();

    const rejoinTime = 15000 + Math.random() * 15000;

    console.log(`🔄 Rejoining in ${Math.floor(rejoinTime / 1000)} seconds...`);

    setTimeout(() => {
      createBot();
    }, rejoinTime);
  });
}

createBot();
