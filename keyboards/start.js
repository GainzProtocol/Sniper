export const startKeyboard = () => {
    return {
        inline_keyboard: [
            // [
            //     { text: '📘 Guide', callback_data: 'guide' }, 
            //     { text: '⚙️ Settings', callback_data: 'settings' }, 
            //     { text: '👛 Wallets', callback_data: 'wallets' }
            // ],
            // [
            //     { text: '👀 Copytrade', callback_data: 'copytrade' }, 
            //     { text: '📈 Simulator', callback_data: 'simulator' }, 
            //     { text: '📊 PnL', callback_data: 'pnl' }
            // ],
            [
                { text: '✅ Buy', callback_data: 'buy' }, 
                { text: '💰 Sell', callback_data: 'sell' }, 
                { text: '🎯 Snipe', callback_data: 'snipe' }
            ],
            [
                { text: '📊 Positions', callback_data: 'positions' }
            ],
            // [
            //     { text: 'Manage Tasks', callback_data: 'manage_tasks' }
            // ],
        ]
    }
}