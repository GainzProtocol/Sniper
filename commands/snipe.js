import { bot } from '../index.js';
import { cache, initCache } from '../helpers/cache.js';
import { snipeKeyboard } from '../keyboards/snipe.js';
import { formatToEther, indexToLetter } from '../helpers/utils.js';

const displayTokensToSnipe = (snipe) => {
    let output = [];
    
    Object.entries(snipe).forEach(([tokenAddress, details], index) => {
        if (details.length > 0) {
            details.forEach(({symbol, wallet, amount, slippage}) => {
                const fixedAmountInEther = formatToEther(amount, 3)
                // output.push(`${index}. ${tokenAddress} - wallet ${indexToLetter(wallet)} - amount ${fixedAmountInEther} - slippage ${slippage}%`);
                output.push(`${index}. ${symbol} - Wallet ${indexToLetter(wallet)} - ${fixedAmountInEther} ETH - slippage ${slippage}%`);
                index++;
            });
        }
    });
  
    return output.join('\n');
}

export const snipeCommand = async (msg) => {
    const chatId = msg.chat.id;
    initCache(chatId)

    if (cache[chatId].pks.length === 0) {
        await bot.sendMessage(chatId, "Please type /start to activate your wallets"); 
        return
    }
    console.log(cache[chatId].snipe)
    const message = `Here are your current snipes.\n` +
    displayTokensToSnipe(cache[chatId].snipe) +
    `\nIf you want to add more, select the wallet you want to snipe with.`;
    const opts = {
        reply_markup: snipeKeyboard(chatId),
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
    cache[chatId].awaiting = 'snipe_tokenAddress';
}