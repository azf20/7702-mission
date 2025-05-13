import { NextResponse } from "next/server";
import { db } from "../../../db/client";
import { chains as chainsTable } from "../../../db/schema";
import scaffoldConfig from "../../../scaffold.config";
import { checkChainIs7702Enabled } from "../../../utils/checkChainIs7702Enabled";

const ONE_MINUTE = 60 * 1000;

export async function GET() {
  // 1. Get all chains from DB
  const dbChains = await db.select().from(chainsTable);

  // 2. Use only the target networks from config
  const allViemChains = scaffoldConfig.targetNetworks;

  // 3. Prepare updates
  const now = new Date();
  const updates: any[] = [];
  const results: any[] = [];

  for (const chain of allViemChains) {
    const dbEntry = dbChains.find(c => c.id === chain.id);
    let needsCheck = false;

    if (!dbEntry) {
      needsCheck = true;
    } else if (!dbEntry.eip7702Enabled && now.getTime() - new Date(dbEntry.lastUpdatedAt).getTime() > ONE_MINUTE) {
      needsCheck = true;
    }

    let eip7702Enabled = dbEntry?.eip7702Enabled ?? false;
    let lastUpdatedAt = dbEntry?.lastUpdatedAt ?? now;

    if (needsCheck) {
      try {
        // Use a dummy address for the check (replace with a real address if needed)
        const dummyAddress = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" as `0x${string}`;
        const firstCheck = await checkChainIs7702Enabled({ chain, address: dummyAddress });
        if (firstCheck) {
          const [secondCheck, thirdCheck] = await Promise.all([
            checkChainIs7702Enabled({ chain, address: dummyAddress }),
            checkChainIs7702Enabled({ chain, address: dummyAddress }),
          ]);
          eip7702Enabled = secondCheck && thirdCheck;
          if (!eip7702Enabled) {
            console.log("Chain", chain.name, "returned inconsistent results");
          }
        } else {
          eip7702Enabled = false;
        }

        lastUpdatedAt = now;
        updates.push({
          id: chain.id,
          eip7702Enabled,
          lastUpdatedAt,
        });
      } catch (e) {
        // Optionally log error
        console.error(e);
      }
    }

    results.push({
      id: chain.id,
      name: chain.name,
      eip7702Enabled,
      lastUpdatedAt,
      testnet: chain.testnet ?? false,
    });
  }

  // 4. Update DB in one transaction
  if (updates.length > 0) {
    for (const update of updates) {
      await db
        .insert(chainsTable)
        .values(update)
        .onConflictDoUpdate({
          target: chainsTable.id,
          set: { eip7702Enabled: update.eip7702Enabled, lastUpdatedAt: update.lastUpdatedAt },
        });
    }
  }

  // 5. Return the up-to-date list
  return NextResponse.json(results);
}
