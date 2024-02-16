import TelegramBot from 'node-telegram-bot-api';
import 'dotenv/config';
import { initMempoolListener } from './listeners/mempool.js';
import { startCommand } from "./commands/start.js";
import { buyCommand } from "./commands/buy.js";
import { sellCommand } from './commands/sell.js';
import { snipeCommand } from './commands/snipe.js';
import { logCommand } from './commands/log.js';
import { handleBuyCallback } from './callbacks/buy.js';
import { handleSellCallback } from './callbacks/sell.js';
import { cache, initCache } from './helpers/cache.js';
import { handleAwaitingBuyTokenAddress } from './awaiting/buy_tokenAddress.js';
import { handleAwaitingSellTokenAddress } from './awaiting/sell_tokenAddress.js';
import { handleSnipeCallback } from './callbacks/snipe.js';
import { handleAwaitingSnipeTokenAddress } from './awaiting/snipe_tokenAddress.js';
import { positionsCommand } from './commands/positions.js';
import { feeDataUpdater } from './listeners/updater.js';

initMempoolListener()
feeDataUpdater()

let token;
if (process.env.ENVIRONMENT === 'PRODUCTION') {
    token = process.env.PRODUCTION_BOT_TOKEN;
} else {
    token = process.env.DEVELOPMENT_BOT_TOKEN;
}

export const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, startCommand);
bot.onText(/\/positions/, positionsCommand)
bot.onText(/\/buy/, buyCommand);
bot.onText(/\/sell/, sellCommand);
bot.onText(/\/snipe/, snipeCommand);
bot.onText(/\/log/, logCommand);

bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;
    // console.log(data)
    // console.log(callbackQuery)
    initCache(chatId);

    if (data.startsWith('buy_')) {
        await handleBuyCallback(callbackQuery);
    } else if (data.startsWith('sell_')) {
        await handleSellCallback(callbackQuery);
    } else if (data.startsWith('snipe_')) {
        await handleSnipeCallback(callbackQuery);
    } else {
        // Check if the callback data is 'buy' and invoke buyCommand
        switch (data) {
            case 'buy':
                await buyCommand({ chat: { id: chatId } });
                break
            case 'sell':
                await sellCommand({ chat: { id: chatId } });
                break
            case 'snipe':
                await snipeCommand({ chat: { id: chatId } });
                break
            case 'positions':
                await positionsCommand({ chat: { id: chatId } });
                break
        }
    }

    bot.answerCallbackQuery(callbackQuery.id);
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id
    // console.log(data)
    // console.log(callbackQuery)
    initCache(chatId);
    if (msg.reply_to_message) {
        if (cache[chatId].awaiting === 'buy_tokenAddress') {
            await handleAwaitingBuyTokenAddress(msg);
        } else if (cache[chatId].awaiting === 'sell_tokenAddress') {
            await handleAwaitingSellTokenAddress(msg)
        } else if (cache[chatId].awaiting === 'snipe_tokenAddress') {
            await handleAwaitingSnipeTokenAddress(msg)
        }
    } else {

    }
})