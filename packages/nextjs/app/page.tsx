"use client";

import { useState } from "react";
import { useAccount, useBalance } from "wagmi";
import { useDisconnect } from "wagmi";
import { ArrowPathIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth/RainbowKitCustomConnectButton";
import { NetworkOptions } from "~~/components/scaffold-eth/RainbowKitCustomConnectButton/NetworkOptions";
import { useSmartAccount } from "~~/hooks/scaffold-eth/useSmartAccount";

const Home = () => {
  const { address: connectedAddress, chain, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const {
    accountType,
    activateAccount,
    readyForUpgrade,
    isBatchEnabled,
    isPending,
    waitStatus,
    refreshStatus,
    rawCode,
    capability,
    capabilitiesResponse,
    capabilitiesStatus,
  } = useSmartAccount();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showDebugModal, setShowDebugModal] = useState(false);
  const balance = useBalance({ address: connectedAddress });
  const pillClass = "px-3 py-1 text-xs font-semibold rounded tooltip tooltip-bottom flex items-center gap-1";

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5 w-full max-w-3xl">
          {!connectedAddress ? (
            <>
              <div className="flex flex-col items-center gap-4">
                <p className="text-xl font-medium">Connect your wallet to check yourself</p>
                <RainbowKitCustomConnectButton />
              </div>
              <div className="mt-8 flex flex-col items-center gap-2 text-sm text-base-content/60">
                <a
                  href="https://www.eip5792.xyz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-primary"
                >
                  About EIP-5792 (Wallet Capabilities)
                </a>
                <a
                  href="https://eip7702.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-primary"
                >
                  About EIP-7702 (Smart Account Upgrades)
                </a>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-6">
                {/* Account Info Section */}
                <div className="bg-base-300 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Account Information</h2>
                    <button className="btn btn-ghost btn-xs" onClick={() => setShowDebugModal(true)}>
                      Debug
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-base-content/70 mb-1">Connected Address</p>
                      <div className="flex items-center gap-2">
                        <Address address={connectedAddress} />
                        {capabilitiesStatus === "supported" && (
                          <span
                            className={`${pillClass} bg-green-500 text-white`}
                            data-tip="The connected wallet supports EIP-5792 (Wallet Capabilities)"
                          >
                            5792 supported
                          </span>
                        )}
                        {capabilitiesStatus === "not_supported" && (
                          <span
                            className={`${pillClass} bg-red-500 text-white`}
                            data-tip="The connected wallet does not support EIP-5792 (Wallet Capabilities)"
                          >
                            5792 not supported
                          </span>
                        )}
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => disconnect()}
                          title="Disconnect Wallet"
                        >
                          Disconnect
                        </button>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-base-content/70 mb-1">Current Network</p>
                      <div className="flex items-center gap-2">
                        {chain ? (
                          <span className="font-medium">{chain.name}</span>
                        ) : (
                          <span className="text-warning font-semibold text-sm">Unconfigured Network</span>
                        )}
                        <div className="dropdown dropdown-end">
                          <div tabIndex={0} role="button" className="btn btn-secondary btn-sm">
                            Switch Network
                          </div>
                          <ul
                            tabIndex={0}
                            className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                          >
                            <NetworkOptions />
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm text-base-content/70 mb-1">Account Type</p>
                        <button className="btn btn-ghost btn-xs" title="Refresh status" onClick={refreshStatus}>
                          <ArrowPathIcon className="w-3 h-3" />
                        </button>
                      </div>
                      {accountType.type === "EOA" && (
                        <div className="flex flex-row items-center gap-x-3">
                          <span className="font-medium">Regular Account</span>
                          {!readyForUpgrade && (
                            <span
                              className={`${pillClass} bg-gray-400 text-white`}
                              data-tip="Cannot initiate an upgrade. Your wallet or network may not support EIP-7702 yet. Check with your wallet provider for more information."
                            >
                              <InformationCircleIcon className="w-4 h-4" />
                              <span>Cannot initiate upgrade</span>
                            </span>
                          )}
                          {readyForUpgrade && (
                            <>
                              <button
                                className="btn btn-primary btn-sm shadow-lg font-bold"
                                onClick={() => setShowUpgradeModal(true)}
                                disabled={isPending || !balance.data || balance.data.value === 0n}
                              >
                                {isPending ? (
                                  <span className="flex items-center gap-2">
                                    <span className="loading loading-spinner loading-xs"></span>
                                    Activating...
                                  </span>
                                ) : !balance.data || balance.data.value === 0n ? (
                                  "Insufficient balance to activate"
                                ) : (
                                  "Activate Smart Account"
                                )}
                              </button>
                              <span
                                className="tooltip tooltip-bottom"
                                data-tip="Initiate a transaction to upgrade to a smart account"
                              >
                                <InformationCircleIcon className="w-5 h-5 inline-block text-base-content/60 cursor-pointer" />
                              </span>
                              {isPending && waitStatus && waitStatus.data?.id && (
                                <div className="mt-2 p-2 rounded bg-base-200 text-sm flex items-center gap-4">
                                  <span>
                                    <b>id:</b> {`${waitStatus.data.id.slice(0, 6)}...${waitStatus.data.id.slice(-4)}`}
                                  </span>
                                  <span>
                                    <b>Status:</b> pending
                                  </span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                      {accountType.type === "7702_EOA" && (
                        <div className="flex flex-col">
                          <div className="flex flex-row items-center gap-x-3">
                            <span className="font-medium text-lg">Smart Account (7702-enabled)</span>
                            {isBatchEnabled && (
                              <span
                                className={`${pillClass} bg-green-500 text-white`}
                                data-tip="Your wallet can make batched transactions"
                              >
                                Batch-enabled
                              </span>
                            )}
                          </div>
                          {accountType.delegatedAddress && (
                            <div className="mt-2">
                              <p className="text-sm text-base-content/70 mb-1">Delegated to</p>
                              <Address address={accountType.delegatedAddress} />
                            </div>
                          )}
                        </div>
                      )}
                      {accountType.type === "SMART_CONTRACT" && (
                        <span className="font-medium text-lg">Smart Contract Account</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex flex-col items-center gap-2 text-sm text-base-content/60">
                  <a
                    href="https://eip7702.io/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-primary"
                  >
                    About EIP-7702 (Smart Account Upgrades)
                  </a>
                  <a
                    href="https://www.eip5792.xyz/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-primary"
                  >
                    About EIP-5792 (Wallet Capabilities)
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-base-100 p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-bold mb-2">Upgrade to Smart Account</h3>
            <p className="mb-4">
              This will prompt your wallet to upgrade your account. Approve the upgrade to proceed.
            </p>
            {connector?.name === "MetaMask" && (
              <div className="mb-4 p-3 rounded bg-warning/20 text-warning-content text-sm border border-warning flex items-center gap-2">
                <InformationCircleIcon className="w-5 h-5 inline-block text-warning" />
                <span>
                  <b>MetaMask users:</b> If you continue, but then reject the Smart Account option, you may not be able
                  to retry.
                </span>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button className="btn btn-ghost" onClick={() => setShowUpgradeModal(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={async () => {
                  setShowUpgradeModal(false);
                  activateAccount();
                }}
                disabled={isPending}
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="loading loading-spinner loading-xs"></span>
                    Activating...
                  </span>
                ) : (
                  "Continue"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Debug Modal */}
      {showDebugModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-base-100 p-6 rounded-lg shadow-lg max-w-lg w-full max-h-[80vh] overflow-y-auto relative">
            <button
              className="btn btn-ghost btn-xs absolute top-2 right-2 z-10"
              onClick={() => setShowDebugModal(false)}
              aria-label="Close debug modal"
            >
              Close
            </button>
            <h3 className="text-lg font-bold mb-2">Debug Info</h3>
            <div className="mb-4">
              <div className="mb-2 font-semibold">Raw Contract Code:</div>
              <pre className="bg-base-200 p-2 rounded text-xs overflow-x-auto break-all">{rawCode || "(none)"}</pre>
            </div>
            <div className="mb-4">
              <div className="mb-2 font-semibold">Current Chain Capability:</div>
              <pre className="bg-base-200 p-2 rounded text-xs overflow-x-auto break-all">
                {capability ? JSON.stringify(capability, null, 2) : "(none)"}
              </pre>
            </div>
            <div className="mb-4">
              <div className="mb-2 font-semibold">Connector Info:</div>
              <pre className="bg-base-200 p-2 rounded text-xs overflow-x-auto break-all">
                {connector
                  ? JSON.stringify({ name: connector.name, id: connector.id, type: connector.type }, null, 2)
                  : "(none)"}
              </pre>
            </div>
            <div className="mb-4">
              <div className="mb-2 font-semibold">All Capabilities Response:</div>
              <pre className="bg-base-200 p-2 rounded text-xs overflow-x-auto break-all">
                {capabilitiesResponse ? JSON.stringify(capabilitiesResponse, null, 2) : "(none)"}
              </pre>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
