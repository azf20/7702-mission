# EIP-7702 Checker

A simple dApp to check and upgrade your Ethereum account to a smart account (EIP-7702-enabled), built with 🏗 [Scaffold-ETH 2](https://github.com/scaffold-eth/scaffold-eth-2).

Live at [7702-checker.azfuller.com](https://7702-checker.azfuller.com)

## Features

- **Account Type Detection:**
  - Connect your wallet and instantly see if your account is:
    - Regular Account (EOA)
    - Smart Account (7702-enabled)
    - Smart Contract Account
  - If 7702-enabled, see the delegated address and whether batching is supported.

- **Upgrade Flow:**
  - If your wallet/network supports it, you can upgrade your EOA to a smart account with a single click.
  - The app uses wagmi's `sendCalls` to initiate the upgrade and tracks the status until confirmed on-chain.

- **Supported Chains:**
  - This dapp is enabled for chains where EIP-7702 is active
  - As of 2025-05-09, Ethereum, BSC, Gnosis and Sepolia are already live, and Superchain chains should be going live per the [Isthumus Hard Fork](https://docs.optimism.io/notices/upgrade-15)

## Development

```bash
yarn install
yarn start
```

Open [http://localhost:3000](http://localhost:3000) to use the app.

## About the `useSmartAccount` Hook

The core logic for account detection, capability fetching, and upgrade is encapsulated in the custom `useSmartAccount` React hook, found in `packages/nextjs/hooks/scaffold-eth/useSmartAccount.ts`.

**Responsibilities:**
- Detects the connected account type (EOA, 7702-enabled, or Smart Contract) by fetching and parsing the contract code.
- Fetches wallet capabilities using [EIP-5792](https://www.eip5792.xyz/introduction) (`wallet_getCapabilities`), allowing the app to:
  - Query the wallet for supported features (such as atomic batching, paymasters, and upgrade readiness)
  - Determine if your account/network is ready for upgrade (atomic capability = `ready`)
  - Show if batching is supported (atomic capability = `supported`)
- Provides an `activateAccount` function that triggers the upgrade using wagmi's `sendCalls`.
- Tracks the status of the upgrade (pending, confirmed, error) using `useSendCalls` and `useWaitForCallsStatus`.
- Exposes a `refreshStatus` callback to manually refetch account status and capabilities.
- Handles all query invalidation and status logic in one place for a clean UI experience.

**Returns:**
- `accountType`: The parsed account type and delegated address (if any)
- `readyForUpgrade`: Whether the account/network is ready for upgrade
- `isBatchEnabled`: Whether batching is supported on the current network
- `activateAccount`: Function to trigger the upgrade
- `isPending`: True if an upgrade is in progress or being confirmed
- `waitStatus`: Status and data for the current upgrade call
- `refreshStatus`: Function to manually refresh account status

---

Built with ❤️ by the BuidlGuidl