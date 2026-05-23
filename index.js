const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is running');
});

server.listen(process.env.PORT || 3000, () => {
  console.log('🌐 Web port opened');
});
const mineflayer = require('mineflayer');
const config = require('./config.json');

let lastUsername = null;

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateUsername() {

  const usernames = [
    '67Hunter',
    'TungTung',
    'FishingDuck'
  ];

  // Prevent same username twice in a row
  const available =
    usernames.filter(name => name !== lastUsername);

  const selected =
    randomChoice(available);

  lastUsername = selected;

  return selected;
}

function createBot() {

  const bot = mineflayer.createBot({
    host: config.serverHost,
    port: config.serverPort,
    username: generateUsername(),
    auth: 'offline',
    version: false,
    viewDistance: config.botChunk
  });

  const username = generateUsername();

console.log(`🤖 Starting bot as ${username}`);


  let movementLoop;
  let lookLoop;
  let chatLoop;
  let randomActionLoop;
  let antiAfkLoop;
  let leaveTimeout;

  // Human-like phrases
  const chatMessages = [
    'lol',
    'wait',
    'lag',
    'brb',
    'one sec',
    'yo',
    'what happened',
    'im back',
    'minecraft moment',
    'bro',
    'why is it lagging',
    'hi',
    'sup',
    'ok',
    'where is everyone',
    'bruh',
    'what',
    'real',
    'nah'
  ];

  // Movement actions
  const actions = [
    'forward',
    'back',
    'left',
    'right'
  ];

  bot.on('spawn', () => {

    console.log(`✅ ${selectedUsername} joined successfully`);

    // Random logout after 1-3 hours
    const leaveTime =
      (1 + Math.random() * 2) * 60 * 60 * 1000;

    leaveTimeout = setTimeout(() => {

      console.log('🚪 Simulating player leaving');

      bot.quit('brb');

    }, leaveTime);

    // Small delay after joining
    setTimeout(() => {

      // CONSTANT ANTI-AFK LOOP
      antiAfkLoop = setInterval(() => {

        if (!bot.entity) return;

        // Tiny head movement
        bot.look(
          bot.entity.yaw + ((Math.random() - 0.5) * 0.3),
          (Math.random() - 0.5) * 0.2,
          true
        );

        // Tiny movement tap
        const move =
          randomChoice(actions);

        bot.setControlState(move, true);

        setTimeout(() => {

          if (!bot.entity) return;

          bot.setControlState(move, false);

        }, 1200 + Math.random() * 1800);

        // Occasional jump
        if (Math.random() > 0.6) {

          bot.setControlState('jump', true);

          setTimeout(() => {

            if (!bot.entity) return;

            bot.setControlState('jump', false);

          }, 300);
        }

      }, 10000);

      // LOOK AROUND LOOP
      lookLoop = setInterval(() => {

        if (!bot.entity) return;

        const yaw =
          Math.random() * Math.PI * 2;

        const pitch =
          (Math.random() - 0.5) * 0.8;

        bot.look(yaw, pitch, true);

      }, 6000 + Math.random() * 7000);

      // MOVEMENT LOOP
      movementLoop = setInterval(() => {

        if (!bot.entity) return;

        bot.clearControlStates();

        // Random crouch
        if (Math.random() > 0.78) {
          bot.setControlState('sneak', true);
        }

        // Random sprint
        if (Math.random() > 0.65) {
          bot.setControlState('sprint', true);
        }

        // Random movement
        const move1 = randomChoice(actions);

        bot.setControlState(move1, true);

        // Sometimes diagonal movement
        if (Math.random() > 0.7) {

          const move2 = randomChoice(actions);

          if (move2 !== move1) {
            bot.setControlState(move2, true);
          }
        }

        // Random jump
        if (Math.random() > 0.65) {

          bot.setControlState('jump', true);

          setTimeout(() => {

            if (!bot.entity) return;

            bot.setControlState('jump', false);

          }, 200 + Math.random() * 500);
        }

        // Random arm swing
        if (Math.random() > 0.7) {
          bot.swingArm('right');
        }

        // Random stop time
        const stopTime =
          2000 + Math.random() * 5000;

        setTimeout(() => {

          if (!bot.entity) return;

          bot.clearControlStates();

        }, stopTime);

      }, 7000 + Math.random() * 8000);

      // CHAT LOOP
      chatLoop = setInterval(() => {

        if (!bot.entity) return;

        // MUCH lower chance to chat
        if (Math.random() > 0.96) {

          bot.clearControlStates();

          const msg =
            randomChoice(chatMessages);

          // Human typing speed
          const typingTime =
            1500 + (msg.length * 140) + Math.random() * 3500;

          console.log(`⌨️ Typing message: ${msg}`);

          // Small look movement while typing
          bot.look(
            Math.random() * Math.PI * 2,
            (Math.random() - 0.5) * 0.4,
            true
          );

          setTimeout(() => {

            if (!bot.entity) return;

            bot.chat(msg);

            console.log(`💬 Sent chat: ${msg}`);

          }, typingTime);
        }

      }, 45000);

      // RANDOM EXTRA ACTIONS
      randomActionLoop = setInterval(() => {

        if (!bot.entity) return;

        // Random crouch toggle
        if (Math.random() > 0.8) {

          bot.setControlState('sneak', true);

          setTimeout(() => {

            if (!bot.entity) return;

            bot.setControlState('sneak', false);

          }, 1000 + Math.random() * 2000);
        }

        // Small random camera movement
        if (Math.random() > 0.7) {

          bot.look(
            Math.random() * Math.PI * 2,
            (Math.random() - 0.5) * 0.4,
            true
          );
        }

      }, 30000);

    }, 4000);

  });

  bot.on('chat', (username, message) => {

    if (username === selectedUsername) return;

    // Very low chance to respond
    if (Math.random() > 0.93) {

      const replies = [
        'lol',
        'true',
        'ok',
        'what',
        'bruh',
        'real',
        'yea',
        'maybe',
        'idk',
        'nah',
        'bro',
        'wait'
      ];

      const reply =
        randomChoice(replies);

      const typingDelay =
        1500 + (reply.length * 130) + Math.random() * 4000;

      // Stop moving while replying
      bot.clearControlStates();

      console.log(`⌨️ Typing reply: ${reply}`);

      setTimeout(() => {

        if (!bot.entity) return;

        bot.chat(reply);

        console.log(`💬 Replied: ${reply}`);

      }, typingDelay);
    }

  });

  bot.on('health', () => {

    if (bot.food < 10) {
      console.log('🍖 Bot hunger low');
    }

  });

  bot.on('death', () => {

    console.log('☠️ Bot died');

  });

  bot.on('kicked', (reason) => {

    console.log('⛔️ Kicked:', reason);

  });

  bot.on('error', (err) => {

    console.log('⚠️ Error:', err.message);

    // Ignore common disconnect spam
    if (
      err.code === 'ECONNRESET' ||
      err.code === 'ETIMEDOUT'
    ) {
      return;
    }

  });

  bot.on('end', () => {

    console.log('⛔️ Bot disconnected');

    clearInterval(movementLoop);
    clearInterval(lookLoop);
    clearInterval(chatLoop);
    clearInterval(randomActionLoop);
    clearInterval(antiAfkLoop);

    clearTimeout(leaveTimeout);

    // Rejoin BEFORE Aternos fully sleeps
    const rejoinTime =
      15000 + Math.random() * 15000;

    console.log(`🔄 Rejoining in ${Math.floor(rejoinTime / 1000)} seconds...`);

    setTimeout(() => {

      createBot();

    }, rejoinTime);

  });

}

createBot();
