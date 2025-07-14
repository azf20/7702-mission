# EIP-7702 Mission

This tracks work done for the [EIP-7702 UX & Developer Tooling Mission](https://github.com/ethereum-optimism/ecosystem-contributions/issues/274) from the Optimism Foundation.

[Original proposal](https://github.com/ethereum-optimism/ecosystem-contributions/issues/274#issuecomment-2773076711)

## 📱 7702-checker

A dApp to check EIP-7702 support for chains, and EIP-5792 support for wallets, with the ability to trigger a smart account upgrade if the wallet supports it. Built with Scaffold-ETH 2.

Live at [7702checker.azfuller.com](https://7702-checker.azfuller.com)

[View detailed documentation →](packages/7702-checker/README.md)

## 📚 uxscout

A documentation site tracking ux adoption & innovation across the ecosystem with an emphasis on EIP-7702 and showcasing demos of apps using the new capabilities.

Live at [uxscout.xyz](https://uxscout.xyz)

## 🧦 SuperSocks

Onchain sock shop, demonstrating different purchase flows leveraging EIP-7702, EIP-5792 and other approaches for improved UX.

- Mainnet: https://supersocks.uxscout.xyz/
- [Code](https://github.com/azf20/supersocks)
- [Blogpost](https://www.azfuller.com/blog/supersocks)

## Support and advocacy

- [Pectra week blog](https://www.azfuller.com/blog/pectra-week)
- [13 thoughts about EIP-7702](https://www.azfuller.com/blog/13-thoughts-about-eip-7702)
- [Mega thread of EIP-7702 updates](https://x.com/azacharyf/status/1919421705556045870)
- [Conversation with Vivek from Kernel](https://x.com/Kernel0x/status/1923420052893606005)
- [Conversation with Austin Griffith from BuidlGuidl](https://x.com/austingriffith/status/1934617357370163370)
- [Speaker at the 7702 Casual Hackathon](https://x.com/LXDAO_Official/status/1930100085884399935)

## Open source contributions

- Burner connector: EIP-5792 Support ([initial PR](https://github.com/scaffold-eth/burner-connector/pull/39), [fix](https://github.com/scaffold-eth/burner-connector/pull/44))
- Viem EIP-5792: ancillary PRs ([docs](https://github.com/wevm/viem/pull/3692), [additional fallbacks](https://github.com/wevm/viem/pull/3717), [dataSuffix](https://github.com/wevm/viem/pull/3741))
- Across SDK: [initial EIP-5792 support](https://github.com/across-protocol/toolkit/pull/229)
- Kiwi News: [enable minting for EIP-7702-enabled EOAs](https://github.com/attestate/kiwistand/pull/168)

## Development

```bash
# Install dependencies
yarn install

# Start the 7702-checker dApp
cd packages/7702-checker
yarn start

# Start the uxscout docs site
cd packages/uxscout
yarn dev
```

---

Built with ❤️ by the BuidlGuidl | [Supported by the Optimism Foundation](https://github.com/ethereum-optimism/ecosystem-contributions/issues/274)