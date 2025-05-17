"use client";

import { useEffect, useState } from "react";

type ChainInfo = {
  id: number;
  name: string;
  eip7702Enabled: boolean;
  lastUpdatedAt: string;
  testnet: boolean;
};

export default function ChainsPage() {
  const [chains, setChains] = useState<ChainInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/chains")
      .then(res => res.json())
      .then(data => {
        setChains(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Chain 7702 Status</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="table w-full">
          <thead>
            <tr>
              <th className="hidden sm:table-cell">ID</th>
              <th>Name</th>
              <th>Testnet</th>
              <th>7702 Enabled</th>
              <th className="hidden sm:table-cell">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {chains.map(chain => (
              <tr key={chain.id}>
                <td className="hidden sm:table-cell">{chain.id}</td>
                <td>{chain.name}</td>
                <td>{chain.testnet ? "✅" : ""}</td>
                <td>{chain.eip7702Enabled ? "✅" : "❌"}</td>
                <td className="hidden sm:table-cell">{new Date(chain.lastUpdatedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
