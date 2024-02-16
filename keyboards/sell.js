import { cache } from "../helpers/cache.js"

// This function updates the inline keyboard based on the selected options
export const sellKeyboard = (user) => {
    return {
        inline_keyboard: [
            [{ text: 'Sell Amount', callback_data: 'sell_amount' }],
            [
                { text: cache[user]?.sellAmount === 10 ? '✅ 10%' : '10%', callback_data: 'sell_10%' },
                { text: cache[user]?.sellAmount === 25 ? '✅ 25%' : '25%', callback_data: 'sell_25%' }
            ],
            [
                { text: cache[user]?.sellAmount === 50 ? '✅ 50%' : '50%', callback_data: 'sell_50%' },
                { text: cache[user]?.sellAmount === 100 ? '✅ 100%' : '100%', callback_data: 'sell_100%' }
            ],
            [{ text: 'Slippage', callback_data: 'sell_slippage' }],
            [
                { text: cache[user]?.sellSlippage === 10 ? '✅ 10%' : '10%', callback_data: 'sell_slippage10' },
                { text: cache[user]?.sellSlippage === 20 ? '✅ 20%' : '20%', callback_data: 'sell_slippage20' },
                { text: cache[user]?.sellSlippage === 50 ? '✅ 50%' : '50%', callback_data: 'sell_slippage50' }
            ],
        ],
    };
};