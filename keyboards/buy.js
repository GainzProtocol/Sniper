import { cache } from "../helpers/cache.js"
import { ethers } from "ethers";

// This function updates the inline keyboard based on the selected options
export const buyKeyboard = (user) => {
    return {
        inline_keyboard: [
            [{ text: 'Select Wallets', callback_data: 'select_wallets' }],
            [
                { text: cache[user]?.buyWallet === 0 ? '✅ A' : 'A', callback_data: 'buy_w0' },
                { text: cache[user]?.buyWallet === 1 ? '✅ B' : 'B', callback_data: 'buy_w1' }
            ],
            [{ text: 'Slippage', callback_data: 'buy_slippage' }],
            [
                { text: cache[user]?.buySlippage === 10 ? '✅ 10%' : '10%', callback_data: 'buy_slippage10' },
                { text: cache[user]?.buySlippage === 20 ? '✅ 20%' : '20%', callback_data: 'buy_slippage20' },
                { text: cache[user]?.buySlippage === 50 ? '✅ 50%' : '50%', callback_data: 'buy_slippage50' }
            ],
            [{ text: 'Buy Amount', callback_data: 'buy_amount' }],
            [
                { text: cache[user]?.buyAmount === ethers.parseUnits('0.01', 'ether') ? '✅ 0.01 ETH' : '0.01 ETH', callback_data: 'buy_0.01eth' },
                { text: cache[user]?.buyAmount === ethers.parseUnits('0.1', 'ether') ? '✅ 0.1 ETH' : '0.1 ETH', callback_data: 'buy_0.1eth' },
                { text: cache[user]?.buyAmount === ethers.parseUnits('0.5', 'ether') ? '✅ 0.5 ETH' : '0.5 ETH', callback_data: 'buy_0.5eth' }
            ],
        ],
    };
};