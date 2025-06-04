import { useState } from "react";
import { useSendCalls } from "wagmi";
import { useAccount } from "wagmi";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

export const ExperimentalSection = () => {
  const { address: connectedAddress } = useAccount();
  const { sendCalls, data: sendCallsData, error: sendCallsError } = useSendCalls();
  const [useExperimentalFallback, setUseExperimentalFallback] = useState(true);
  const [callCount, setCallCount] = useState(2);

  return (
    <div className="collapse collapse-arrow bg-base-200 mt-4">
      <input type="checkbox" />
      <div className="collapse-title text-sm text-base-content/70">Experimental</div>
      <div className="collapse-content space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold">sendCalls</h3>
            <div className="tooltip" data-tip="This sends an empty call to your connected address">
              <InformationCircleIcon className="w-5 h-5 text-base-content/60" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="toggle toggle-sm"
                checked={useExperimentalFallback}
                onChange={e => setUseExperimentalFallback(e.target.checked)}
              />
              <span className="text-sm">Use experimental fallback</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm">Number of calls:</span>
              <div className="join">
                <button className="join-item btn btn-sm" onClick={() => setCallCount(Math.max(1, callCount - 1))}>
                  -
                </button>
                <input
                  type="number"
                  className="join-item input input-sm w-16 text-center"
                  value={callCount}
                  onChange={e => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value)) {
                      setCallCount(Math.min(10, Math.max(1, value)));
                    }
                  }}
                  min="1"
                  max="10"
                />
                <button className="join-item btn btn-sm" onClick={() => setCallCount(Math.min(10, callCount + 1))}>
                  +
                </button>
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={async () => {
                try {
                  sendCalls({
                    calls: Array(callCount).fill({
                      to: connectedAddress,
                      value: 0n,
                    }),
                    experimental_fallback: useExperimentalFallback,
                  });
                } catch (error) {
                  console.error("sendCalls error:", error);
                }
              }}
              disabled={!connectedAddress}
            >
              Send {callCount} call{callCount > 1 ? "s" : ""}
            </button>
          </div>
        </div>

        {sendCallsData && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Response Data:</h4>
            <pre className="bg-base-100 p-4 rounded text-sm overflow-x-auto">
              {JSON.stringify(sendCallsData, null, 2)}
            </pre>
          </div>
        )}

        {sendCallsError && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2 text-error">Error:</h4>
            <pre className="bg-base-100 p-4 rounded text-sm overflow-x-auto text-error">
              {JSON.stringify(sendCallsError, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
