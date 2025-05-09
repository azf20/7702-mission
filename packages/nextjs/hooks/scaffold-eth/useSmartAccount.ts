import { useCallback, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { parseEther } from "viem";
import { useAccount, useCapabilities, usePublicClient, useSendCalls, useWaitForCallsStatus } from "wagmi";

const DELEGATION_PREFIX = "0xef0100";

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
  };
}
