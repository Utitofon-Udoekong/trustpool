"use client";

import {
  Abstraxion,
  useAbstraxionAccount,
  useModal
} from "@burnt-labs/abstraxion";
import { Button } from "@burnt-labs/ui";

export function WalletConnect() {
  const { data: { bech32Address }, isConnected } = useAbstraxionAccount();
  const [, setShow] = useModal();

  return (
    <div>
      <Button
        onClick={() => setShow(true)}
        structure="base"
        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
      >
        {bech32Address ? (
          <div className="flex items-center gap-2">
            <span className="text-sm opacity-75">Connected:</span>
            <code className="text-sm bg-gray-800 px-2 py-1 rounded">
              {bech32Address.slice(0, 6)}...{bech32Address.slice(-4)}
            </code>
          </div>
        ) : (
          "Connect Wallet"
        )}
      </Button>

      <Abstraxion onClose={() => setShow(false)} />
    </div>
  );
} 