export type SmartAccountType =
  | { type: "EOA" }
  | { type: "7702_EOA"; delegatedAddress: `0x${string}` }
  | { type: "SMART_CONTRACT" };

const DELEGATION_PREFIX = "0xef0100";

export function getAccountTypeFromCode(code: string): SmartAccountType {
  if (!code || code === "0x") return { type: "EOA" };
  if (code.startsWith(DELEGATION_PREFIX)) {
    const delegatedAddress = ("0x" + code.slice(DELEGATION_PREFIX.length)) as `0x${string}`;
    return { type: "7702_EOA", delegatedAddress };
  }
  return { type: "SMART_CONTRACT" };
}
