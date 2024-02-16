import { bot } from '../index.js';
import { buyToken } from '../actions/buy.js';
import { getTokenSymbolAndPool } from '../helpers/getTokenSymbolAndPool.js';
import { cache } from '../helpers/cache.js';
import { getTokenDetails } from '../helpers/getTokenDetails.js';
import { blockExplorer, customRouterAddress } from '../config/network.js';
import { approveToken } from '../actions/approve.js';

export const handleAwaitingBuyTokenAddress = async (msg) => {
    const chatId = msg.chat.id
    const address = msg.text.trim()
    // Validate token address and buy
    const { tokenAddress, symbol, hasPool } = await getTokenSymbolAndPool(address)
    // console.log(tokenAddress, symbol, hasPool)
    if (hasPool) {
        const { symbol, pricePerTokenInWei, marketCapInWei } = await getTokenDetails(tokenAddress)

        // Add marketcap
        const loadingMessage = await bot.sendMessage(chatId, `Buying ${symbol}..`)
        const msgId = loadingMessage.message_id
        cache[chatId].loading = msgId
        // BUY HERE
        const purchaseValue = cache[chatId].buyAmount
        const userWalletIdx = cache[chatId].buyWallet
        const pk = cache[chatId].pks[userWalletIdx]
        const userSlippage = cache[chatId].buySlippage
        const result = await buyToken(pk, tokenAddress, purchaseValue, userSlippage);

        if (result.status === 'success') {
            const hashUrl = `${blockExplorer}/tx/${result.hash}`;
            await bot.sendMessage(chatId, `Success. [Hash](${hashUrl})`, { parse_mode: 'Markdown', disable_web_page_preview: true });
            await bot.deleteMessage(chatId, cache[chatId].loading);
            // Approval
            const approvalResult = await approveToken(pk, tokenAddress, customRouterAddress)
            if (approvalResult.status === 'success') {
                console.log(`Approval successful. TxHash: ${approvalResult.hash}`);
            } else {
                console.error(`Approval failed: ${approvalResult.error}`);
            }
        } else {
            await bot.sendMessage(chatId, `Failed to buy: ${result.error}`);
            await bot.deleteMessage(chatId, cache[chatId].loading);
        }
        
    } else {
        await bot.sendMessage(chatId, "Invalid token address.")
    }
}