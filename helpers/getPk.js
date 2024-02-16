import { cache } from "./cache.js";
import { ethers } from 'ethers';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { splitString } from "./utils.js";
import { getOrCreateAlias } from "./getAlias.js";

const client = new SecretManagerServiceClient();

export const getOrCreatePk = async (telegramId) => {
    // Check cache
    if (cache[telegramId]?.pks.length > 0) {
        return cache[telegramId].pks
    }

    // If there isn't, retrieve from secret manager.
    let alias
    if (cache[telegramId]?.alias) {
        alias = cache[telegramId].alias
    } else {
        alias = await getOrCreateAlias(telegramId)
    }
    
    try {
        // Look for version
        const [version] = await client.accessSecretVersion({
            name: `projects/148578752520/secrets/${alias}/versions/latest`,
        });
        const payload = version.payload?.data?.toString();
        const pks = splitString(payload);
        // console.log("here", pks[0], pks[1])
        const wallet0 = (new ethers.Wallet(pks[0])).address;
        const wallet1 = (new ethers.Wallet(pks[1])).address;
        cache[telegramId].pks = pks
        cache[telegramId].wallets = [wallet0, wallet1]
        return cache[telegramId].pks;
    } catch (error) {
        // Error code if version does not exist
        if (error.code === 5) {
            console.error(`Secret version not found, creating a new one: ${error.message}`);
            // Create PK
            const newPks = generatePrivateKeys()
            const pk0 = newPks.pks[0]
            const pk1 = newPks.pks[1]
            const pk = pk0 + '-' + pk1
            try {
                await createSecretAndAddVersion(alias, pk);
                cache[telegramId].pks = newPks.pks
                cache[telegramId].wallets = newPks.wallets
                return cache[telegramId].pks;
            } catch (error) {
                console.error(`Failed to create secret: ${error.message}`);
            }
        } else {
            console.error(`Error accessing secret version: ${error.message}`);
            throw error;
        }
    }
}

const createSecretAndAddVersion = async (secretId, secretData) => {
    const parent = `projects/148578752520`;
    try {
        const [secret] = await client.createSecret({
            parent: parent,
            secretId: secretId,
            secret: {
                replication: {
                    automatic: {},
                },
            },
        })
        console.log(`Created secret ${secret.name}`);

        // Add a version with the secret data.
        const [version] = await client.addSecretVersion({
            parent: secret.name,
            payload: {
                data: Buffer.from(secretData, 'utf8'),
            },
        });
        console.log(`Added secret version ${version.name}`);
    } catch (error) {
        console.error(`An error occurred while creating the secret or adding a version: ${error.message}`);
        throw error;
    }
}

const generatePrivateKeys = () => {
    const wallet0 = ethers.Wallet.createRandom();
    const wallet1 = ethers.Wallet.createRandom();
    return {
        pks: [wallet0.privateKey, wallet1.privateKey], 
        wallets: [wallet0.address, wallet1.address]
    }
}