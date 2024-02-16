// commands/positions.js
import { bot } from '../index.js';
import { cache, initCache } from '../helpers/cache.js';
import { getAssets } from '../helpers/getAssets.js';
import { blockExplorer } from '../config/network.js';
import { indexToLetter, formatToEther } from '../helpers/utils.js';

export const positionsCommand = async (msg) => {
    const chatId = msg.chat.id;
    initCache(chatId)

    if (cache[chatId].pks.length === 0) {
        await bot.sendMessage(chatId, "Please type /start to activate your wallets"); 
        return
    }
    // console.log("Retrieving assets")
    const assets = await getAssets(chatId)
    // console.log("assets", assets)
    cache[chatId].assets = assets

    // We format ONLY when we want to display in chat. Otherwise keep everything in ether
    let message = "Current positions:\n" +
    assets.map((asset, index) => {
        const fixedValueInEther = formatToEther(asset.tokenValue, 3)
        const walletUrl = `${blockExplorer}/address/${cache[chatId].wallets[asset.wallet]}`
        const assetUrl = `${blockExplorer}/token/${asset.tokenAddress}`
        return `💼 ${index}. [Wallet ${indexToLetter(asset.wallet)}](${walletUrl}): [${asset.symbol}](${assetUrl}) - ${fixedValueInEther} ETH\n`;
    }).join('');

    const opts = {
        parse_mode: 'Markdown',
        disable_web_page_preview: true
    }
    await bot.sendMessage(chatId, message, opts);

}