import { ethers } from 'ethers';
import { TokenMessenger__factory, MessageTransmitter__factory } from '@circle/cctp-contracts';

interface CCTPConfig {
    tokenMessengerAddress: string;
    messageTransmitterAddress: string;
    usdcAddress: string;
    destinationDomain: number; // Domain identifier for the destination chain
}

const CCTP_CONFIG: Record<string, CCTPConfig> = {
    'ethereum': {
        tokenMessengerAddress: process.env.NEXT_PUBLIC_ETH_TOKEN_MESSENGER_ADDRESS!,
        messageTransmitterAddress: process.env.NEXT_PUBLIC_ETH_MESSAGE_TRANSMITTER_ADDRESS!,
        usdcAddress: process.env.NEXT_PUBLIC_ETH_USDC_ADDRESS!,
        destinationDomain: 0, // Ethereum domain
    },
    'xion': {
        tokenMessengerAddress: process.env.NEXT_PUBLIC_XION_TOKEN_MESSENGER_ADDRESS!,
        messageTransmitterAddress: process.env.NEXT_PUBLIC_XION_MESSAGE_TRANSMITTER_ADDRESS!,
        usdcAddress: process.env.NEXT_PUBLIC_XION_USDC_ADDRESS!,
        destinationDomain: 1, // Xion domain
    }
};

export class CCTPService {
    private provider: ethers.BrowserProvider;
    private sourceConfig: CCTPConfig;
    private destinationConfig: CCTPConfig;

    constructor(
        provider: ethers.BrowserProvider,
        sourceChain: 'ethereum' | 'xion',
        destinationChain: 'ethereum' | 'xion'
    ) {
        this.provider = provider;
        this.sourceConfig = CCTP_CONFIG[sourceChain];
        this.destinationConfig = CCTP_CONFIG[destinationChain];
    }

    async initiateCrossChainTransfer(
        amount: string,
        recipientAddress: string
    ) {
        const signer = await this.provider.getSigner();
        const tokenMessenger = TokenMessenger__factory.connect(
            this.sourceConfig.tokenMessengerAddress,
            signer
        );

        // Convert amount to USDC decimals (6)
        const amountInUSDC = ethers.parseUnits(amount, 6);

        // First approve TokenMessenger to spend USDC
        const usdcContract = new ethers.Contract(
            this.sourceConfig.usdcAddress,
            ['function approve(address spender, uint256 amount) public returns (bool)'],
            signer
        );

        const approveTx = await usdcContract.approve(
            this.sourceConfig.tokenMessengerAddress,
            amountInUSDC
        );
        await approveTx.wait();

        // Initiate the transfer
        const tx = await tokenMessenger.depositForBurn(
            amountInUSDC,
            this.destinationConfig.destinationDomain,
            ethers.hexZeroPad(recipientAddress, 32),
            this.sourceConfig.usdcAddress
        );

        return tx;
    }

    async receiveMessage(message: string, attestation: string) {
        const messageTransmitter = MessageTransmitter__factory.connect(
            this.destinationConfig.messageTransmitterAddress,
            this.provider.getSigner()
        );

        const tx = await messageTransmitter.receiveMessage(message, attestation);
        return tx;
    }

    async getMessageStatus(messageHash: string): Promise<boolean> {
        const messageTransmitter = MessageTransmitter__factory.connect(
            this.destinationConfig.messageTransmitterAddress,
            this.provider
        );

        return messageTransmitter.messageStatus(messageHash);
    }
} 