import { ZkEmailClient } from "@zk-email/helpers";
import { ReclaimClient } from "@reclaimprotocol/js-sdk";

interface VerificationResult {
  isValid: boolean;
  emailHash: string;
  error?: string;
}

class ZkEmailVerifier {
  private zkEmailClient: ZkEmailClient;
  private reclaimClient: ReclaimClient;

  constructor() {
    this.zkEmailClient = new ZkEmailClient();
    this.reclaimClient = new ReclaimClient({
      appId: process.env.NEXT_PUBLIC_RECLAIM_APP_ID,
    });
  }

  async verifyEmail(email: string, proof: any): Promise<VerificationResult> {
    try {
      // Verify email ownership using zk-email
      const emailVerification = await this.zkEmailClient.verify(email, proof);

      if (!emailVerification.success) {
        return {
          isValid: false,
          emailHash: '',
          error: 'Email verification failed',
        };
      }

      // Additional verification using Reclaim Protocol
      const reclaimProof = await this.reclaimClient.verifyEmailOwnership({
        email,
        provider: 'gmail', // or other supported providers
      });

      return {
        isValid: true,
        emailHash: emailVerification.emailHash,
      };
    } catch (error) {
      console.error('Error verifying email:', error);
      return {
        isValid: false,
        emailHash: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const zkEmailVerifier = new ZkEmailVerifier(); 