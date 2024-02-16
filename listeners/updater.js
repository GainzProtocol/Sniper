import cron from 'node-cron'
import { getFeeData } from '../helpers/getFeeData.js'
import { retrieveFeeData, setFeeData } from '../helpers/cache.js'

export const feeDataUpdater = async () => {
    cron.schedule('*/5 * * * * *', async () => {
        const newFeeData = await getFeeData()
        setFeeData(newFeeData)
    })
}