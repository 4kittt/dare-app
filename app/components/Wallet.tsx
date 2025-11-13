import { ConnectWallet } from '@coinbase/onchainkit/wallet';

export function Wallet() {
  return (
    <div className="flex items-center justify-end p-4 bg-sand border-b-2 border-brown">
      <ConnectWallet />
    </div>
  );
}
