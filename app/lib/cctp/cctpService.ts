import { ethers } from 'ethers';
import { TokenMessengerABI } from './abis/TokenMessenger';
import { MessageTransmitterABI } from './abis/MessageTransmitter';

interface CCTPConfig {
    tokenMessengerAddress: string;
    messageTransmitterAddress: string;
    usdcAddress: string;
    domainId: number;
    attestationApi: string;
}

// Testnet configuration based on Circle's documentation
const CCTP_CONFIG: Record<string, CCTPConfig> = {
    'ethereum-goerli': {
        tokenMessengerAddress: '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5',
        messageTransmitterAddress: '0x7865fAfC2db2093669d92c0F33AeEF291086BEFD',
        usdcAddress: '0x07865c6e87b9f70255377e024ace6630c1eaa37f',
        domainId: 0,
        attestationApi: 'https://iris-api-sandbox.circle.com',
    },
    'noble-testnet': {
        tokenMessengerAddress: 'noble12l2w4ugfz4m6dd73yysz477jszqnfughxvkss5',
        messageTransmitterAddress: 'noble12l2w4ugfz4m6dd73yysz477jszqnfughxvkss5',
        usdcAddress: 'uusdc',
        domainId: 4,
        attestationApi: 'https://iris-api-sandbox.circle.com',
    }
};

export class CCTPService {
    private provider: ethers.BrowserProvider;
    private sourceConfig: CCTPConfig;
    private destinationConfig: CCTPConfig;

    constructor(
        provider: ethers.BrowserProvider,
        sourceChain: keyof typeof CCTP_CONFIG,
        destinationChain: keyof typeof CCTP_CONFIG
    ) {
        this.provider = provider;
        this.sourceConfig = CCTP_CONFIG[sourceChain];
        this.destinationConfig = CCTP_CONFIG[destinationChain];
    }

    async initiateCrossChainTransfer(amount: string, recipientAddress: string) {
        const signer = await this.provider.getSigner();
        
        // Create contract instances
        const tokenMessenger = new ethers.Contract(
            this.sourceConfig.tokenMessengerAddress,
            TokenMessengerABI,
            signer
        );

        const usdcContract = new ethers.Contract(
            this.sourceConfig.usdcAddress,
            ['function approve(address spender, uint256 amount) public returns (bool)'],
            signer
        );

        // Convert amount to USDC decimals (6)
        const amountInUSDC = ethers.parseUnits(amount, 6);

        // First approve TokenMessenger to spend USDC
        const approveTx = await usdcContract.approve(
            this.sourceConfig.tokenMessengerAddress,
            amountInUSDC
        );
        console.log("approveTx", approveTx);
        await approveTx.wait();

        // Initiate burn
        const burnTx = await tokenMessenger.depositForBurn(
            amountInUSDC,
            this.destinationConfig.domainId,
            ethers.zeroPadValue(recipientAddress, 32),
            this.sourceConfig.usdcAddress
        );

        console.log("burnTx", burnTx);
        
        const receipt = await burnTx.wait();
        console.log("receipt", receipt);
        // Get MessageSent event
        const messageSentEvent = receipt.logs.find((log: any) => 
            log.address.toLowerCase() === this.sourceConfig.messageTransmitterAddress.toLowerCase()
        );

        if (!messageSentEvent) {
            throw new Error('MessageSent event not found');
        }

        return {
            transactionHash: receipt.hash,
            messageBytes: messageSentEvent.data,
            nonce: burnTx.nonce
        };
    }

    // Get attestation from Circle's API
    async getMessageAttestation(messageHash: string): Promise<string> {
        const response = await fetch(
            `${this.sourceConfig.attestationApi}/attestations/${messageHash}`,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CIRCLE_API_KEY}`
                }
            }
        );

        if (!response.ok) {
            throw new Error('Failed to get attestation');
        }

        const data = await response.json();
        return data.attestation;
    }

    // Receive message on destination chain
    async receiveMessage(message: string, attestation: string) {
        const signer = await this.provider.getSigner();
        const messageTransmitter = new ethers.Contract(
            this.destinationConfig.messageTransmitterAddress,
            MessageTransmitterABI,
            signer
        );

        const tx = await messageTransmitter.receiveMessage(message, attestation);
        return tx;
    }

    // Check if message has been processed
    async getMessageStatus(messageHash: string): Promise<boolean> {
        const messageTransmitter = new ethers.Contract(
            this.destinationConfig.messageTransmitterAddress,
            MessageTransmitterABI,
            this.provider
        );

        return messageTransmitter.messageStatus(messageHash);
    }
} 