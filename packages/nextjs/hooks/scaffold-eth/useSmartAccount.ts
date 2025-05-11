import { useCallback, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { encodeFunctionData, parseEther } from "viem";
import { useAccount, useCapabilities, usePublicClient, useSendCalls, useWaitForCallsStatus } from "wagmi";

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

export type SmartAccountType =
  | { type: "EOA" }
  | { type: "7702_EOA"; delegatedAddress: string }
  | { type: "SMART_CONTRACT" };

function getAccountType(code: string): SmartAccountType {
  if (!code || code === "0x") return { type: "EOA" };
  if (code.startsWith(DELEGATION_PREFIX)) {
    const delegatedAddress = "0x" + code.slice(DELEGATION_PREFIX.length);
    return { type: "7702_EOA", delegatedAddress };
  }
  return { type: "SMART_CONTRACT" };
}

/**
 * useSmartAccount - fetches contract code, parses account type, and provides activation logic.
 */
export function useSmartAccount() {
  const { address: connectedAddress, chain } = useAccount();
  const capabilities = useCapabilities();
  const publicClient = usePublicClient();
  const { sendCalls, status, isPending: isSendCallsPending, data } = useSendCalls();
  const queryClient = useQueryClient();

  const readyForUpgrade = chain && capabilities?.data?.[chain.id]?.atomic?.status === "ready";
  const isBatchEnabled = chain && capabilities?.data?.[chain.id]?.atomic?.status === "supported";

  const contractCodeQueryKey = useMemo(
    () => ["contractCode", connectedAddress, chain?.id],
    [connectedAddress, chain?.id],
  );
  const { data: contractCode, isLoading } = useQuery({
    queryKey: contractCodeQueryKey,
    queryFn: async () => {
      try {
        if (!connectedAddress || !publicClient) return "";
        const code = await publicClient.getCode({ address: connectedAddress });
        return code || "";
      } catch (error) {
        console.error("Error fetching contract code:", error);
        return "";
      }
    },
    enabled: !!connectedAddress && !!publicClient,
  });
  const { queryKey: capabilitiesQueryKey } = capabilities;

  const accountType = contractCode ? getAccountType(contractCode) : { type: "EOA" as const };

  const activateAccount = () => {
    if (!connectedAddress) return;
    sendCalls(
      {
        calls: [
          {
            to: connectedAddress,
            value: parseEther("0"),
          },
        ],
      },
      {
        onSuccess: () => {
          toast.success("Account upgrade initiated...");
          if (contractCodeQueryKey) queryClient.invalidateQueries({ queryKey: contractCodeQueryKey });
          if (capabilitiesQueryKey) queryClient.invalidateQueries({ queryKey: capabilitiesQueryKey });
        },
        onError: (error: any) => {
          toast.error("Failed to upgrade account: " + (error?.message || "Unknown error"));
        },
      },
    );
  };

  // Track confirmation of the batch call
  const waitStatus = useWaitForCallsStatus({
    id: data?.id,
    query: {
      enabled: !!data?.id,
    },
  });

  const invalidateQueriesCallback = useCallback(() => {
    if (contractCodeQueryKey) queryClient.invalidateQueries({ queryKey: contractCodeQueryKey });
    if (capabilitiesQueryKey) queryClient.invalidateQueries({ queryKey: capabilitiesQueryKey });
  }, [contractCodeQueryKey, capabilitiesQueryKey, queryClient]);

  const refreshStatus = invalidateQueriesCallback;

  useEffect(() => {
    if (waitStatus.isSuccess) {
      invalidateQueriesCallback();
    }
  }, [waitStatus.isSuccess, invalidateQueriesCallback]);

  const isWaiting = waitStatus.status === "pending";
  const isPending = isSendCallsPending || (!!data?.id && waitStatus.isPending);

  const capability = chain ? capabilities?.data?.[chain.id] : undefined;
  const capabilitiesResponse = capabilities?.data;

  console.log(capabilities.isError, capabilities.error);

  // Refetch capabilities when the chain changes
  useEffect(() => {
    if (chain && capabilities?.refetch) {
      capabilities.refetch();
    }
  }, [chain?.id]);

  let capabilitiesStatus: "supported" | "not_supported" | "unknown" = "unknown";
  if (capabilities?.isSuccess) capabilitiesStatus = "supported";
  else if (capabilities?.isError) capabilitiesStatus = "not_supported";

  // Add new query for chain 7702 support
  const { data: chainIs7702Enabled } = useQuery({
    queryKey: ["chainIs7702Enabled", chain?.id],
    queryFn: async () => {
      if (!publicClient || !chain || !connectedAddress) return false;

      try {
        const connectedAccount7702Code = (DELEGATION_PREFIX + DUMMY_DELEGATE_ADDRESS.slice(2)) as `0x${string}`;

        const data = encodeFunctionData({
          abi: isSevenSevenZeroTwoAbi,
          functionName: "isSevenSevenZeroTwo",
        });

        const result = await publicClient.call({
          to: connectedAddress,
          data,
          stateOverride: [
            {
              address: DUMMY_DELEGATE_ADDRESS,
              code: DUMMY_DELEGATE_CODE,
            },
            {
              address: connectedAddress,
              code: connectedAccount7702Code,
            },
          ],
        });
        // The result will be a hex string representing a boolean
        return result.data === "0x0000000000000000000000000000000000000000000000000000000000000001";
      } catch (error) {
        console.error("Error checking chain 7702 support:", error);
        return false;
      }
    },
    enabled: !!publicClient && !!chain,
  });

  return {
    accountType,
    contractCode,
    rawCode: contractCode,
    isLoading,
    activateAccount,
    readyForUpgrade,
    isBatchEnabled,
    status,
    isPending,
    waitStatus,
    isWaiting,
    refreshStatus,
    capability,
    capabilitiesResponse,
    capabilitiesStatus,
    chainIs7702Enabled,
  };
}
