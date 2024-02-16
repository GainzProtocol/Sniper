import { bot } from '../index.js';
import { cache } from '../helpers/cache.js';
import { snipeKeyboard } from '../keyboards/snipe.js';
import { ethers } from 'ethers';

export const handleSnipeCallback = async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const messageId = callbackQuery.message.message_id;
    const data = callbackQuery.data;

    const action = data.split('_')[1]; // Assuming the format is "snipe_action"
    // console.log("action", action)
    switch (action) {
        case 'w0':
            cache[chatId].snipeWallet = 0;
            break;
        case 'w1':
            cache[chatId].snipeWallet = 1;
            break;
        case 'slippage10':
            cache[chatId].snipeSlippage = 10;
            break;
        case 'slippage20':
            cache[chatId].snipeSlippage = 20;
            break;
        case 'slippage50':
            cache[chatId].snipeSlippage = 50;
            break;
        case '0.01eth':
            cache[chatId].snipeAmount = ethers.parseUnits('0.01', 'ether');
            break;
        case '0.1eth':
            cache[chatId].snipeAmount = ethers.parseUnits('0.1', 'ether');
            break;
        case '0.5eth':
            cache[chatId].snipeAmount = ethers.parseUnits('0.5', 'ether');
            break;
    }
    console.log("cache", cache)
    await bot.editMessageReplyMarkup(
        snipeKeyboard(chatId), {
            chat_id: chatId,
            message_id: messageId
        }
    );
}