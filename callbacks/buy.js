import { bot } from '../index.js';
import { cache } from '../helpers/cache.js';
import { buyKeyboard } from '../keyboards/buy.js';
import { ethers } from 'ethers';

export const handleBuyCallback = async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const messageId = callbackQuery.message.message_id;
    const data = callbackQuery.data;

    // Extract specific action from the callback data, e.g., "buy_w0" -> "w0"
    const action = data.split('_')[1]; // Assuming the format is "buy_action"
    // console.log("action", action)

    // Based on the action, update the message or handle the buy logic
    switch (action) {
        case 'w0':
            cache[chatId].buyWallet = 0;
            break;
        case 'w1':
            cache[chatId].buyWallet = 1;
            break;
        case 'slippage10':
            cache[chatId].buySlippage = 10;
            break;
        case 'slippage20':
            cache[chatId].buySlippage = 20;
            break;
        case 'slippage50':
            cache[chatId].buySlippage = 50;
            break;
        case '0.01eth':
            cache[chatId].buyAmount = ethers.parseUnits('0.01', 'ether');
            break;
        case '0.1eth':
            cache[chatId].buyAmount = ethers.parseUnits('0.1', 'ether');
            break;
        case '0.5eth':
            cache[chatId].buyAmount = ethers.parseUnits('0.5', 'ether');
            break;
    }

    console.log("cache", cache)
    await bot.editMessageReplyMarkup(
        buyKeyboard(chatId), {
            chat_id: chatId,
            message_id: messageId
        }
    );

};
