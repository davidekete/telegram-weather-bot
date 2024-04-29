const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const weather = require('./weather');
const cityManager = require('./cityManager');
const stateManager = require('./stateManager');

// Handle /start command
bot.onText(/\/start/, async (msg) => {
  const welcomeMessage =
    'Welcome to the Weather Bot! Use the commands below to interact:\n' +
    '/setCity - Set your preferred city for weather updates.\n' +
    '/getWeather - Get instant weather information for any city.\n';
  await bot.sendMessage(msg.chat.id, welcomeMessage);
  stateManager.ensureUserState(msg.chat.id);
});

// Handle /setCity command
bot.onText(/\/setCity$/, async (msg) => {
  stateManager.setUserState(msg.chat.id, { expect: 'SET_CITY' });
  bot.sendMessage(
    msg.chat.id,
    'Which city do you want to set as your preferred city for weather updates?'
  );
});

// Handle /getWeather command
bot.onText(/\/getWeather$/, async (msg) => {
  stateManager.setUserState(msg.chat.id, { expect: 'GET_WEATHER' });
  bot.sendMessage(
    msg.chat.id,
    'Which city do you want to get weather information for?'
  );
});

// Handle incoming messages
bot.on('message', async (msg) => {
  if (msg.text.startsWith('/')) {
    // If the message is a command, reset user state
    stateManager.resetUserState(msg.chat.id);
  } else {
    // If it's not a command, check user state
    const state = await stateManager.getUserState(msg.chat.id);
    if (state && state.expect === 'SET_CITY') {
      // If expecting SET_CITY, set city and reset state
      const city = msg.text;
      cityManager.setCity(msg.chat.id, city);
      bot.sendMessage(
        msg.chat.id,
        `City set to ${city}. You will receive weather updates every 6 hours.`
      );
      stateManager.resetUserState(msg.chat.id);
    } else if (state && state.expect === 'GET_WEATHER') {
      // If expecting GET_WEATHER, get weather and reset state
      const city = msg.text;
      weather
        .getWeather(city)
        .then((response) => {
          bot.sendMessage(msg.chat.id, response);
        })
        .catch((error) => {
          bot.sendMessage(msg.chat.id, 'Failed to retrieve weather.');
        });
      stateManager.resetUserState(msg.chat.id);
    }
  }
});

// Initialize cityManager for weather updates
cityManager.init(bot);
