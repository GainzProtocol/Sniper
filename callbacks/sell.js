import { bot } from '../index.js';
import { cache } from '../helpers/cache.js';
import { sellKeyboard } from '../keyboards/sell.js';

export const handleSellCallback = async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const messageId = callbackQuery.message.message_id;
    const data = callbackQuery.data;

    const action = data.split('_')[1]; // Assuming the format is "sell_action"
    // console.log("action", action)

    // Based on the action, update the message or handle the sell logic
    switch (action) {
        case '10%':
            cache[chatId].sellAmount = 10;
            break;
        case '25%':
            cache[chatId].sellAmount = 25;
            break;
        case '50%':
            cache[chatId].sellAmount = 50;
            break;
        case '100%':
            cache[chatId].sellAmount = 100;
            break;
        case 'slippage10':
            cache[chatId].sellSlippage = 10;
            break;
        case 'slippage20':
            cache[chatId].sellSlippage = 20;
            break;
        case 'slippage50':
            cache[chatId].sellSlippage = 50;
            break;
    }
    console.log("cache", cache)

    await bot.editMessageReplyMarkup(
        sellKeyboard(chatId), {
            chat_id: chatId,
            message_id: messageId
        }
    );

};
