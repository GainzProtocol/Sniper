// commands/start.js
import { bot } from '../index.js';
import { getOrCreatePk } from '../helpers/getPk.js';
import { cache, initCache } from '../helpers/cache.js';
import { startKeyboard } from '../keyboards/start.js';

export const startCommand = async (msg) => {
    const chatId = msg.chat.id;
    initCache(chatId);

    if (cache[chatId]?.pks.length === 0) {
        try {
            await getOrCreatePk(chatId);
            // pks = walletCache[chatId]
        } catch (error) {
            console.error('Failed to retrieve wallets:', error);
            await bot.sendMessage(chatId, "Sorry, I couldn't retrieve your wallets.");
            return;
        }
    }

    const wallets = cache[chatId].wallets
    const welcomeMessage = `
    👋 Welcome to Gainz 🌟
        
    Currently, the available commands are:
    /buy, /sell, /snipe
    You should start by funding your wallets with some ETH.

    🧾 My Wallets

    Wallet A:
    ${wallets[0]}

    Wallet B:
    ${wallets[1]}
    `;
  
    const opts = {
        reply_markup: startKeyboard(),
        parse_mode: 'Markdown',
    };
  
    await bot.sendMessage(chatId, welcomeMessage, opts);

};

