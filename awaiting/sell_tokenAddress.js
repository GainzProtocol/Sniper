import { bot } from '../index.js';
import { sellToken } from '../actions/sell.js';
import { cache } from '../helpers/cache.js';
import { blockExplorer } from '../config/network.js';

export const handleAwaitingSellTokenAddress = async (msg) => {
    const chatId = msg.chat.id
    const assetIndex = msg.text.trim()

    // Validate input
    const isValid = true
    if (isValid) {
        const asset = cache[chatId].assets[assetIndex]
        const loadingMessage = await bot.sendMessage(chatId, `Selling ${asset.symbol}..`)
        const msgId = loadingMessage.message_id
        cache[chatId].loading = msgId
        // SELL HERE
        const idx = asset.wallet;
        const pk = cache[chatId].pks[idx]
        const userSlippage = cache[chatId].sellSlippage
        const sellPercentage = cache[chatId].sellAmount
        const result = await sellToken(chatId, pk, asset, sellPercentage, userSlippage)
        if (result.status === 'success') {
            const hashUrl = `${blockExplorer}/tx/${result.hash}`;
            await bot.sendMessage(chatId, `Success. [Hash](${hashUrl})`, { parse_mode: 'Markdown', disable_web_page_preview: true });
        } else {
            await bot.sendMessage(chatId, `Failed to sell: ${result.error}`);
        }
        await bot.deleteMessage(chatId, cache[chatId].loading);
    } else {
        await bot.sendMessage(chatId, "Invalid asset.")
    }
}