declare global {
  interface Window {
    ethereum: any;
  }
}

import { LIT_NETWORK } from '@lit-protocol/constants';
import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { ethers } from "ethers";
import { LIT_ABILITY } from "@lit-protocol/constants";
import {
  LitAccessControlConditionResource,
  createSiweMessageWithRecaps,
  generateAuthSig,
} from "@lit-protocol/auth-helpers";
import { encryptString, decryptToString } from "@lit-protocol/encryption";

interface EncryptedData {
  ciphertext: string;
  dataToEncryptHash: string;
}

class LitService {
  private client: LitJsSdk.LitNodeClient;
  private chain = 'xion';
  
  constructor() {
    this.client = new LitJsSdk.LitNodeClient({
      litNetwork: LIT_NETWORK.DatilTest,
    });
  }

  async connect() {
    // Clear any stale signatures first
    LitJsSdk.disconnectWeb3();
    await this.client.connect();
  }

  async disconnect() {
    await this.client.disconnect();
  }

  async encryptData(data: any): Promise<EncryptedData> {
    if (!this.client) {
      throw new Error('Lit client not initialized');
    }

    const accessControlConditions = [
        {
          contractAddress: "",
          standardContractType: "",
          chain: "ethereum",
          method: "eth_getBalance",
          parameters: [":userAddress", "latest"],
          returnValueTest: {
            comparator: ">=",
            value: "1000000000000", // 0.000001 ETH
          },
        },
      ];

    try {
      // Convert data to string if it's an object
      const dataToEncrypt = typeof data === 'object' ? JSON.stringify(data) : data;

      // Encrypt the data using Lit Protocol
      const { ciphertext, dataToEncryptHash } = await encryptString({
        accessControlConditions,
        dataToEncrypt,
      }, this.client);

      return {
        ciphertext,
        dataToEncryptHash,
      };
    } catch (error) {
      console.error('Error encrypting data:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  async decryptData(encryptedData: EncryptedData): Promise<any> {
    if (!this.client) {
      throw new Error('Lit client not initialized');
    }

    const accessControlConditions = [
        {
          contractAddress: "",
          standardContractType: "",
          chain: "ethereum",
          method: "eth_getBalance",
          parameters: [":userAddress", "latest"],
          returnValueTest: {
            comparator: ">=",
            value: "1000000000000", // 0.000001 ETH
          },
        },
      ];

    try {
      // Get session signatures
      const sessionSigs = await this.getSessionSignatures();

      // Decrypt the data
      const decryptedString = await decryptToString({
        accessControlConditions,
        ciphertext: encryptedData.ciphertext,
        dataToEncryptHash: encryptedData.dataToEncryptHash,
        chain: this.chain,
        sessionSigs,
      }, this.client);

      // Parse the decrypted string if it's JSON
      try {
        return JSON.parse(decryptedString);
      } catch {
        return decryptedString;
      }
    } catch (error) {
      console.error('Error decrypting data:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  private async getSessionSignatures() {
    if (typeof window === 'undefined') {
      throw new Error('Window object not available');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const walletAddress = await signer.getAddress();

    const latestBlockhash = await this.client.getLatestBlockhash();

    // Define the Lit resource
    const litResource = new LitAccessControlConditionResource('*');

    const sessionSigs = await this.client.getSessionSigs({
      chain: this.chain,
      resourceAbilityRequests: [
            {
                resource: litResource,
                ability: LIT_ABILITY.AccessControlConditionDecryption,
            },
        ],
      authNeededCallback: async (params) => {
        if (!params.uri) {
            throw new Error("uri is required");
          }
          if (!params.expiration) {
            throw new Error("expiration is required");
          }
     
          if (!params.resourceAbilityRequests) {
            throw new Error("resourceAbilityRequests is required");
          }

        const toSign = await createSiweMessageWithRecaps({
            uri: params.uri,
            expiration: params.expiration,
            resources: params.resourceAbilityRequests,
          walletAddress,
          nonce: latestBlockhash,
          litNodeClient: this.client   
        });

        return generateAuthSig({ signer, toSign });
      },
    });

    return sessionSigs;
  }

//   private async blobToBase64(blob: Blob): Promise<string> {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         if (typeof reader.result === 'string') {
//           resolve(reader.result.split(',')[1]);
//         } else {
//           reject(new Error('Failed to convert blob to base64'));
//         }
//       };
//       reader.onerror = reject;
//       reader.readAsDataURL(blob);
//     });
//   }

//   private async base64ToBlob(base64: string): Promise<Blob> {
//     const response = await fetch(`data:application/octet-stream;base64,${base64}`);
//     return response.blob();
//   }
}

export const litService = new LitService(); 