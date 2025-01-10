import zkeSDK from "@zk-email/sdk";

interface VerificationResult {
    success: boolean;
    emailHash?: string;
    error?: string;
    proofData?: any;
    externalInputs?: any;
    publicOutputs?: any;
}

class ZkEmailVerifier {
    private sdk: ReturnType<typeof zkeSDK>;

    constructor() {
        this.sdk = zkeSDK();
    }

    async verifyEmail(emlFile: string): Promise<VerificationResult> {
        try {
            console.log('emlFile', emlFile);
            // Get the blueprint for email verification
            const blueprint = await this.sdk.getBlueprint("Bisht13/SuccinctZKResidencyInvite@v1");

            // Create a prover
            const prover = blueprint.createProver();
            
            // Generate the proof
            const generatedProof = await prover.generateProof(emlFile);
            const { proofData, publicData, externalInputs, publicOutputs } = generatedProof.getProofData();
            console.log('proofData', proofData);
            console.log('publicData', publicData);
            console.log('externalInputs', externalInputs);
            console.log('publicOutputs', publicOutputs);

            return {
                success: true,
                emailHash: publicData,
                proofData,
                externalInputs,
                publicOutputs,
            };
        } catch (error) {
            console.error('Error verifying email:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
}

export const zkEmailVerifier = new ZkEmailVerifier(); 