interface NobleConfig {
    chainId: string;
    rpc: string;
    // IBC Configuration
    nobleChannel: string;    
    xionChannel: string;     
    portId: string;
    // Token denominations
    usdcDenom: string;       
    xionDenom: string;       
}

const NOBLE_CONFIG = {
    chainId: 'grand-1',  // Testnet chain ID
    rpc: 'https://noble-testnet-rpc.polkachu.com',  // Correct testnet RPC
    // IBC channels based on provided configuration
    nobleChannel: 'channel-147',
    xionChannel: 'channel-489',
    portId: 'transfer',
    // Token denominations
    usdcDenom: 'ibc/57097251ED81A232CE3C9D899E7C8096D6D87EF84BA203E12E424AA4C9B57A64',
    xionDenom: 'ibc/475ED5117C702EF62A36D41F1EB50AF2770427251920C605CA34014895FF10EC',
} as const;

export class NobleConnection {
    // Transfer USDC from Noble to Xion
    static async transferUSDC(
        amount: string,
        senderAddress: string,
        recipientAddress: string,
    ) {
        return {
            typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
            value: {
                sourcePort: NOBLE_CONFIG.portId,
                sourceChannel: NOBLE_CONFIG.nobleChannel,
                token: {
                    denom: "uusdc", // Native USDC denom on Noble
                    amount: amount,
                },
                sender: senderAddress,
                receiver: recipientAddress,
                timeoutHeight: {
                    revisionNumber: "1",
                    revisionHeight: "0", // Will be filled by chain
                },
                timeoutTimestamp: "0", // Will be filled by chain
            },
        };
    }

    // Get USDC balance on Xion (using IBC denom)
    static async getUSDCBalance(address: string) {
        try {
            // Query all balances and find the IBC USDC balance
            const response = await fetch(
                `${NOBLE_CONFIG.rpc}/cosmos/bank/v1beta1/balances/${address}`
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch Xion USDC balance');
            }

            const data = await response.json();
            // Find the IBC USDC balance in the balances array
            const usdcBalance = data.balances?.find(
                (balance: { denom: string }) => balance.denom === NOBLE_CONFIG.usdcDenom
            );

            return {
                typeUrl: "/cosmos.bank.v1beta1.Query/Balance",
                value: {
                    address,
                    denom: NOBLE_CONFIG.usdcDenom,
                    amount: usdcBalance?.amount || "0"
                }
            };
        } catch (error) {
            console.error('Error fetching Xion USDC balance:', error);
            return {
                typeUrl: "/cosmos.bank.v1beta1.Query/Balance",
                value: {
                    address,
                    denom: NOBLE_CONFIG.usdcDenom,
                    amount: "0"
                }
            };
        }
    }

    // Get native USDC balance on Noble
    static async getNativeUSDCBalance(address: string) {
        try {
            // Query all balances and find the native USDC balance
            const response = await fetch(
                `${NOBLE_CONFIG.rpc}/cosmos/bank/v1beta1/balances/${address}`
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch Noble USDC balance');
            }

            const data = await response.json();
            // Find the native USDC balance in the balances array
            const usdcBalance = data.balances?.find(
                (balance: { denom: string }) => balance.denom === 'uusdc'
            );

            return {
                typeUrl: "/cosmos.bank.v1beta1.Query/Balance",
                value: {
                    address,
                    denom: "uusdc",
                    amount: usdcBalance?.amount || "0"
                }
            };
        } catch (error) {
            console.error('Error fetching Noble USDC balance:', error);
            return {
                typeUrl: "/cosmos.bank.v1beta1.Query/Balance",
                value: {
                    address,
                    denom: "uusdc",
                    amount: "0"
                }
            };
        }
    }
}