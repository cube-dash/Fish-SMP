const http = require('http');
const mineflayer = require('mineflayer');
const mc = require('minecraft-protocol');
const config = require('./config.json');

//
// ─────────────────────────────────────────────
// KEEP RENDER ALIVE
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
// USERNAME SYSTEM
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
// SERVER CHECK (IMPORTANT FIX)
// ─────────────────────────────────────────────
//
function waitForServer(cb) {
  const check = setInterval(() => {
    mc.ping(
      {
        host: config.serverHost,
        port: config.serverPort
      },
      (err) => {
        if (!err) {
          clearInterval(check);
          console.log('✅ Server is reachable');
          cb();
        } else {
          console.log('⏳ Waiting for server...');
        }
      }
    );
  }, 10000);
}

//
// ─────────────────────────────────────────────
// BOT SYSTEM
// ─────────────────────────────────────────────
//
let reconnectDelay = 15000;

function createBot() {
  const username = generateUsername();

  const bot = mineflayer.createBot({
    host: config.serverHost,
    port: config.serverPort,
    username,
    auth: 'offline',
    version: false,
    viewDistance: config.botChunk
  });

  console.log(`🤖 Starting bot as ${username}`);

  let movementLoop, lookLoop, chatLoop, randomActionLoop, antiAfkLoop, leaveTimeout;

  const chatMessages = [
    'lol','wait','lag','brb','one sec','yo','what happened',
    'im back','minecraft moment','bro','why is it lagging',
    'hi','sup','ok','where is everyone','bruh','what','real','nah'
  ];

  const actions = ['forward', 'back', 'left', 'right'];

  function cleanup() {
    clearInterval(movementLoop);
    clearInterval(lookLoop);
    clearInterval(chatLoop);
    clearInterval(randomActionLoop);
    clearInterval(antiAfkLoop);
    clearTimeout(leaveTimeout);
  }

  //
  // ─────────────────────────────────────────────
  // SPAWN
  // ─────────────────────────────────────────────
  //
  bot.on('spawn', () => {
    console.log(`✅ ${username} joined successfully`);

    reconnectDelay = 15000;

    const leaveTime = (1 + Math.random() * 2) * 60 * 60 * 1000;

    leaveTimeout = setTimeout(() => {
      console.log('🚪 Leaving');
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
        }, 1200 + Math.random() * 1500);

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

  //
  // ─────────────────────────────────────────────
  // ERROR HANDLING
  // ─────────────────────────────────────────────
  //
  bot.on('error', (err) => {
    console.log('⚠️ Error:', err.message);
  });

  bot.on('end', () => {
    console.log('⛔️ Bot disconnected');

    cleanup();

    reconnectDelay = Math.min(reconnectDelay * 1.5, 120000);

    console.log(`🔄 Rejoining in ${reconnectDelay / 1000}s`);

    setTimeout(createBot, reconnectDelay);
  });
}

//
// ─────────────────────────────────────────────
// START ONLY WHEN SERVER IS READY
// ─────────────────────────────────────────────
//
waitForServer(createBot);
