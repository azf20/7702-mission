import { useCallback, useEffect, useMemo } from "react";
import { checkChainIs7702Enabled } from "../../utils/checkChainIs7702Enabled";
import { getAccountCode } from "../../utils/getAccountCode";
import { getAccountTypeFromCode } from "../../utils/getAccountTypeFromCode";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { parseEther } from "viem";
import { useAccount, useCapabilities, usePublicClient, useSendCalls, useWaitForCallsStatus } from "wagmi";

/**
 * useSmartAccount - fetches contract code, parses account type, and provides activation logic.
 */
export function useSmartAccount() {
  // --- Data Fetching ---
  const { address: connectedAddress, chain } = useAccount();
  const publicClient = usePublicClient();
  const capabilities = useCapabilities();
  const queryClient = useQueryClient();
  const { sendCalls, status, isPending: isSendCallsPending, data } = useSendCalls();

  // Contract code
  const contractCodeQueryKey = useMemo(
    () => ["contractCode", connectedAddress, chain?.id],
    [connectedAddress, chain?.id],
  );
  const { data: contractCode, isLoading: isCodeLoading } = useQuery({
    queryKey: contractCodeQueryKey,
    queryFn: async () => {
      if (!connectedAddress || !publicClient) return "";
      return getAccountCode({ publicClient, chain, address: connectedAddress as `0x${string}` });
    },
    enabled: !!connectedAddress && !!publicClient,
  });

  // Capabilities
  const { queryKey: capabilitiesQueryKey } = capabilities;

  // 7702 support check
  const { data: chainIs7702Enabled, isLoading: is7702Loading } = useQuery({
    queryKey: ["chainIs7702Enabled", chain?.id, connectedAddress],
    queryFn: async () => {
      if (!publicClient || !chain || !connectedAddress) return false;
      return checkChainIs7702Enabled({ publicClient, chain, address: connectedAddress as `0x${string}` });
    },
    enabled: !!publicClient && !!chain && !!connectedAddress,
  });

  // --- Derived Values ---
  const accountType = contractCode ? getAccountTypeFromCode(contractCode) : { type: "EOA" as const };
  const readyForUpgrade = chain && capabilities?.data?.[chain.id]?.atomic?.status === "ready";
  const isBatchEnabled = chain && capabilities?.data?.[chain.id]?.atomic?.status === "supported";
  const capability = chain ? capabilities?.data?.[chain.id] : undefined;
  const capabilitiesResponse = capabilities?.data;

  let capabilitiesStatus: "supported" | "not_supported" | "unknown" = "unknown";
  if (capabilities?.isSuccess) capabilitiesStatus = "supported";
  else if (capabilities?.isError) capabilitiesStatus = "not_supported";

  // --- Actions/Callbacks ---
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

  // Refetch capabilities when the chain changes
  useEffect(() => {
    if (chain && capabilities?.refetch) {
      capabilities.refetch();
    }
  }, [chain?.id]);

  // --- UI/Status Helpers ---
  const isWaiting = waitStatus.status === "pending";
  const isPending = isSendCallsPending || (!!data?.id && waitStatus.isPending);
  const isLoading = isCodeLoading;

  // --- Return ---
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
    is7702Loading,
  };
}
