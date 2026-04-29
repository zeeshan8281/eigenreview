import { createHash } from 'crypto';
import { existsSync } from 'fs';
import { signMessage, mnemonicToAccount } from 'viem/accounts';
import { Hex } from 'viem';

const KMS_KEY_PATH = '/usr/local/bin/kms-signing-public-key.pem';
const IS_TEE = existsSync(KMS_KEY_PATH);

export interface TeeProof {
  hash: string;
  signature: string | null;
  signerAddress: string | null;
  processedInTee: boolean;
}

export function hashReview(id: string, content: string, timestamp: number): string {
  const data = JSON.stringify({ id, content, timestamp });
  return createHash('sha256').update(data).digest('hex');
}

interface WalletInfo {
  privateKey: Hex;
  address: string;
}

function getWalletFromMnemonic(): WalletInfo | null {
  const mnemonic = process.env.MNEMONIC;
  if (!mnemonic) {
    console.log('No MNEMONIC found in environment');
    return null;
  }

  try {
    // Derive using default Ethereum path (addressIndex 0 = m/44'/60'/0'/0/0)
    const account = mnemonicToAccount(mnemonic, {
      addressIndex: 0,
    });

    const hdKey = account.getHdKey();
    if (!hdKey.privateKey) {
      console.log('No private key in HD key');
      return null;
    }

    console.log('Derived wallet address:', account.address);
    return {
      privateKey: `0x${Buffer.from(hdKey.privateKey).toString('hex')}` as Hex,
      address: account.address,
    };
  } catch (error) {
    console.error('Failed to derive wallet from mnemonic:', error);
    return null;
  }
}

export async function createTeeProof(id: string, content: string, timestamp: number): Promise<TeeProof> {
  const hash = hashReview(id, content, timestamp);

  if (!IS_TEE) {
    return {
      hash,
      signature: null,
      signerAddress: null,
      processedInTee: false,
    };
  }

  const wallet = getWalletFromMnemonic();

  if (!wallet || !wallet.privateKey) {
    console.log('Could not derive wallet from mnemonic');
    return {
      hash,
      signature: null,
      signerAddress: null,
      processedInTee: true,
    };
  }

  try {
    const signature = await signMessage({
      message: hash,
      privateKey: wallet.privateKey,
    });

    console.log('Successfully signed with TEE wallet:', wallet.address);

    return {
      hash,
      signature,
      signerAddress: wallet.address,
      processedInTee: true,
    };
  } catch (error) {
    console.error('TEE signing failed:', error);
    return {
      hash,
      signature: null,
      signerAddress: null,
      processedInTee: true,
    };
  }
}
