// commands/sell.js
import { bot } from '../index.js';
import { cache, initCache } from '../helpers/cache.js';
import { sellKeyboard } from '../keyboards/sell.js';
import { getAssets } from '../helpers/getAssets.js';
import { formatToEther, indexToLetter } from '../helpers/utils.js';
import { blockExplorer } from '../config/network.js';

export const sellCommand = async (msg) => {
    const chatId = msg.chat.id;
    initCache(chatId)

    if (cache[chatId].pks.length === 0) {
        await bot.sendMessage(chatId, "Please type /start to activate your wallets"); 
        return
    }

    // Placeholder
    // const assets = [
    //     { wallet: 0, tokenAddress: '0x2382938293823', symbol: 'BOBO', balance: '1232', value: '0.12' },
    //     { wallet: 1, tokenAddress: '0x2382938293823', symbol: 'LOLO', balance: '3231', value: '0.23' },
    // ];

    const assets = await getAssets(chatId)
    // console.log("assets", assets)
    cache[chatId].assets = assets

    // We format ONLY when we want to display in chat. Otherwise keep everything in ether
    let message = "Here are your assets\n" +
    assets.map((asset, index) => {
        const fixedValueInEther = formatToEther(asset.tokenValue, 3)
        const walletUrl = `${blockExplorer}/address/${cache[chatId].wallets[asset.wallet]}`
        const assetUrl = `${blockExplorer}/token/${asset.tokenAddress}`
        return `💼 ${index}. [Wallet ${indexToLetter(asset.wallet)}](${walletUrl}): [${asset.symbol}](${assetUrl}) - ${fixedValueInEther} ETH\n`;
    }).join('');

    const opts = {
        reply_markup: sellKeyboard(chatId),
        parse_mode: 'Markdown',
        disable_web_page_preview: true
    }

    await bot.sendMessage(chatId, message, opts);
    const followUpMessage = "Please reply to this message with the line numbers of the tokens you wish to sell.";
    const followUpOpts = {
        reply_markup: {
            force_reply: true
        },
        parse_mode: 'Markdown',
    };

    await bot.sendMessage(chatId, followUpMessage, followUpOpts);
    cache[chatId].awaiting = 'sell_tokenAddress';
    // console.log(cache)
}