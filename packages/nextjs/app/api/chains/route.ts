import { NextResponse } from "next/server";
import { db } from "../../../db/client";
import { chains as chainsTable } from "../../../db/schema";
import scaffoldConfig from "../../../scaffold.config";
import { checkChainIs7702Enabled } from "../../../utils/checkChainIs7702Enabled";

const REFRESH_INTERVAL = 60 * 1000 * 2;

export async function GET() {
  // 1. Get all chains from DB
  const dbChains = await db.select().from(chainsTable);

  // 2. Use only the target networks from config
  const allViemChains = scaffoldConfig.targetNetworks;

  // 3. Prepare updates/results in parallel
  const now = new Date();

  const results = await Promise.all(
    allViemChains.map(async chain => {
      const dbEntry = dbChains.find(c => c.id === chain.id);
      let needsCheck = false;

      if (!dbEntry) {
        needsCheck = true;
      } else if (
        !dbEntry.eip7702Enabled &&
        now.getTime() - new Date(dbEntry.lastUpdatedAt).getTime() > REFRESH_INTERVAL
      ) {
        needsCheck = true;
      }

      let eip7702Enabled = dbEntry?.eip7702Enabled ?? false;
      let lastUpdatedAt = dbEntry?.lastUpdatedAt ?? now;

      if (needsCheck) {
        try {
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
          // Upsert for this chain
          await db.insert(chainsTable).values({ id: chain.id, eip7702Enabled, lastUpdatedAt }).onConflictDoUpdate({
            target: chainsTable.id,
            set: { eip7702Enabled, lastUpdatedAt },
          });
        } catch (e) {
          console.error(e);
        }
      }

      return {
        id: chain.id,
        name: chain.name,
        eip7702Enabled,
        lastUpdatedAt,
        testnet: chain.testnet ?? false,
      };
    }),
  );

  // 4. Return the up-to-date list
  return NextResponse.json(results);
}
