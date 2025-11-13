import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { ConnectWallet } from '@coinbase/onchainkit/wallet';

export function Wallet() {
  const { context } = useMiniKit();

  return (
    <div className="flex items-center gap-4 p-4 bg-sand border-b-2 border-brown">
      {context?.user ? (
        <div className="flex items-center gap-3">
          {context.user.pfpUrl && (
            <img
              src={context.user.pfpUrl}
              alt="Avatar"
              className="w-10 h-10 rounded-full border-2 border-gold"
            />
          )}
          <div>
            <p className="font-rye text-brown text-sm">
              {context.user.displayName || 'Utilisateur'}
            </p>
            <p className="text-brown text-xs opacity-75">
              Connecté
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-brown bg-parchment flex items-center justify-center">
            <span className="text-brown text-lg">👤</span>
          </div>
          <div>
            <p className="font-rye text-brown text-sm">
              Non connecté
            </p>
            <p className="text-brown text-xs opacity-75">
              Connectez-vous pour jouer
            </p>
          </div>
        </div>
      )}

      <div className="ml-auto">
        <ConnectWallet />
      </div>
    </div>
  );
}
