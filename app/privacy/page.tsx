import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | DareUp',
  description: 'Privacy policy for DareUp - Community challenges on Farcaster',
};

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 min-h-screen">
      <div className="prose prose-lg dark:prose-invert mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Privacy Policy</h1>

        <div className="space-y-8">

          <section>
            <h2>What We Collect</h2>
            <p>DareUp collects minimal data to operate the community challenge platform:</p>

            <div className="ml-6">
              <h3>📱 Blockchain Data Only</h3>
              <ul>
        <li><strong>Wallet Addresses:</strong> Public blockchain data used for authentication and ETH rewards</li>
        <li><strong>Farcaster/Base Post URLs:</strong> Links to your challenge proofs (public posts only)</li>
        <li><strong>Challenge Content:</strong> Titles, descriptions, and reward amounts you create</li>
        <li><strong>Community Votes:</strong> Anonymous voting data for proof validation</li>
              </ul>

              <h3 className="mt-6">🚫 What We DON'T Collect</h3>
              <ul className="text-gray-600 dark:text-gray-400">
                <li>📧 Email addresses or contact information</li>
                <li>📱 Phone numbers or device identifiers</li>
                <li>🏠 Physical addresses or location data</li>
                <li>🖼️ Profile pictures, avatars, or personal photos</li>
                <li>📊 Browsing history or usage analytics</li>
              </ul>
            </div>
          </section>

          <section>
            <h2>How We Use Your Data</h2>
            <div className="ml-6">
              <h3>🏆 Challenge Management</h3>
              <p>Your wallet address is used to:</p>
              <ul>
                <li>Create and participate in challenges</li>
                <li>Receive ETH rewards for completed challenges</li>
                <li>Track your challenge completion history</li>
              </ul>

              <h3 className="mt-4">👥 Community Features</h3>
              <p>Public data is used to:</p>
              <ul>
                <li>Display challenges and proofs in the community feed</li>
                <li>Allow community voting on proof validation</li>
                <li>Maintain challenge integrity through peer review</li>
              </ul>
            </div>
          </section>

          <section>
            <h2>Data Storage & Retention</h2>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Automatic Data Deletion Policy</h3>
              <p className="text-blue-800 dark:text-blue-200">
                <strong>90-day retention limit:</strong> All challenges, proof submissions, and associated data are automatically deleted after 90 days.
                This minimizes data storage and respects participant privacy by not retaining challenge history indefinitely.
              </p>
            </div>

            <div className="mt-4">
              <h3>🔒 Storage Security</h3>
              <ul>
                <li>Data is encrypted at rest using industry-standard encryption</li>
                <li>Access is limited to authenticated wallet signatures only</li>
                <li>No personal data is stored - only wallet addresses and challenge content</li>
              </ul>
            </div>
          </section>

          <section>
            <h2>Your Rights & Control</h2>
            <div className="ml-6">
              <h3>🗑️ Data Deletion</h3>
              <p>You can request deletion of your data by:</p>
              <ul>
                <li>Disconnecting your wallet from the app</li>
                <li>Allowing automatic 90-day expiration</li>
                <li>Contacting us through Farcaster (@dareup) with your wallet address</li>
              </ul>

              <h3 className="mt-4">🛡️ Privacy by Design</h3>
              <p>DareUp is built with privacy as a core principle:</p>
              <ul>
                <li><strong>No login required:</strong> Use your wallet - no accounts or passwords</li>
                <li><strong>Blockchain transparency:</strong> All transactions are public on-chain</li>
                <li><strong>Zero marketing:</strong> We never sell or share user data</li>
              </ul>
            </div>
          </section>

          <section>
            <h2>Blockchain Transparency</h2>
            <p>Since DareUp uses blockchain technology for rewards and authentication:</p>
            <div className="ml-6">
              <h3>💎 Public Ledger</h3>
              <ul>
                <li>All ETH reward transactions are visible on the Base blockchain</li>
                <li>Wallet addresses are public blockchain data</li>
                <li>You control your own data through your wallet keys</li>
              </ul>

              <h3 className="mt-4">🔐 Your Control</h3>
              <p>
                <strong>You own your data.</strong> Disconnect your wallet anytime to stop all data collection.
                Your wallet keys give you complete control over your participation.
              </p>
            </div>
          </section>

          <section>
            <h2>Contact & Updates</h2>
            <p>
              For privacy questions or concerns, or to report issues with our app:
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mt-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Contact the Developer - KITK4T</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium text-blue-800 dark:text-blue-200">Farcaster:</span>
                  <br />
                  <a
                    href="https://farcaster.xyz/4kittt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
                  >
                    @4kittt
                  </a>
                </div>
                <div>
                  <span className="font-medium text-blue-800 dark:text-blue-200">Twitter/X:</span>
                  <br />
                  <a
                    href="https://x.com/4KITTT"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
                  >
                    @4KITTT
                  </a>
                </div>
                <div>
                  <span className="font-medium text-blue-800 dark:text-blue-200">Telegram:</span>
                  <br />
                  <a
                    href="https://t.me/KITTK4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
                  >
                    @KITTK4
                  </a>
                </div>
                <div>
                  <span className="font-medium text-blue-800 dark:text-blue-200">Discord:</span>
                  <br />
                  <span className="text-gray-600 dark:text-gray-400">@4kittt</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Last updated:</strong> {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                This privacy policy applies to the DareUp mini-app only. Third-party services like Farcaster and Base have their own privacy policies.
              </p>
            </div>
          </section>

        </div>
      </div>

      {/* Footer privacy notice */}
      <div className="text-center text-xs text-gray-500 mt-12 p-6 border-t border-gray-200 dark:border-gray-700">
        <p>🔒 This app uses blockchain wallet authentication only. No email or personal information is collected.</p>
        <p className="mt-2">Your privacy is protected by Web3 principles - you control your own data.</p>
      </div>
    </div>
  );
}
