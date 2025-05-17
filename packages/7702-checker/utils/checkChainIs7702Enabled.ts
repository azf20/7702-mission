import { Chain, PublicClient, createPublicClient, encodeFunctionData, http } from "viem";

const DELEGATION_PREFIX = "0xef0100";
const DUMMY_DELEGATE_CODE =
  "0x6080604052348015600e575f5ffd5b50600436106026575f3560e01c8063c1cd785614602a575b5f5ffd5b60306044565b604051603b91906064565b60405180910390f35b5f6001905090565b5f8115159050919050565b605e81604c565b82525050565b5f60208201905060755f8301846057565b9291505056fea2646970667358221220265103185dec648e9bcac4dd322c8482f2923aa8ab542d2233f257916b73cd6a64736f6c634300081c0033" as `0x${string}`;
const DUMMY_DELEGATE_ADDRESS = "0x1234567890abcdef1234567890abcdef12345678" as `0x${string}`;

const isSevenSevenZeroTwoAbi = [
  {
    type: "function",
    name: "isSevenSevenZeroTwo",
    inputs: [],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "pure",
  },
];

export async function checkChainIs7702Enabled({
  publicClient,
  chain,
  address,
}: {
  publicClient?: PublicClient;
  chain?: Chain;
  address: `0x${string}`;
}): Promise<boolean> {
  let client = publicClient;
  if (!client && chain) {
    client = createPublicClient({
      chain,
      transport: http(),
    });
  }
  if (!client) throw new Error("No publicClient or chain provided");

  const connectedAccount7702Code = (DELEGATION_PREFIX + DUMMY_DELEGATE_ADDRESS.slice(2)) as `0x${string}`;
  const data = encodeFunctionData({
    abi: isSevenSevenZeroTwoAbi,
    functionName: "isSevenSevenZeroTwo",
  });

  try {
    const result = await client.call({
      to: address,
      data,
      stateOverride: [
        {
          address: DUMMY_DELEGATE_ADDRESS,
          code: DUMMY_DELEGATE_CODE,
        },
        {
          address,
          code: connectedAccount7702Code,
        },
      ],
    });
    return result.data === "0x0000000000000000000000000000000000000000000000000000000000000001";
  } catch (error: any) {
    console.error(`Error checking chain ${chain?.name} 7702 support:`, error.shortMessage);
    return false;
  }
}
