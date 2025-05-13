import { Chain, PublicClient, createPublicClient, http } from "viem";

export async function getAccountCode({
  publicClient,
  chain,
  address,
}: {
  publicClient?: PublicClient;
  chain?: Chain;
  address: `0x${string}`;
}): Promise<string> {
  let client = publicClient;
  if (!client && chain) {
    client = createPublicClient({
      chain,
      transport: http(),
    });
  }
  if (!client) throw new Error("No publicClient or chain provided");
  const code = await client.getCode({ address });
  return code || "";
}
