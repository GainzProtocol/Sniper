// commands/buy.js
import { bot } from '../index.js';
import { cache, initCache } from '../helpers/cache.js';
import { buyKeyboard } from '../keyboards/buy.js';

export const buyCommand = async (msg) => {
    const chatId = msg.chat.id;
    initCache(chatId)

    // Need to add a prompt to type /start in case user bypasses wallet creation
    if (cache[chatId].pks.length === 0) {
        await bot.sendMessage(chatId, "Please type /start to activate your wallets"); 
        return
    }

    const message = "Select the wallet you want to purchase with.";
    const opts = {
        reply_markup: buyKeyboard(chatId),
        parse_mode: 'Markdown',
    };
    await bot.sendMessage(chatId, message, opts);

    const followUpMessage = "Please enter the token address:";
    const followUpOpts = {
        reply_markup: {
            force_reply: true,
        },
    };
    await bot.sendMessage(chatId, followUpMessage, followUpOpts);
    cache[chatId].awaiting = 'buy_tokenAddress';
    // console.log(cache)
}
