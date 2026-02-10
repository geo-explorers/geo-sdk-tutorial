/**
 * ============================================================================
 * COURSE 7: Publishing to IPFS and Personal Spaces
 * ============================================================================
 *
 * OBJECTIVE: Learn to publish edits to IPFS and submit them to a personal
 * space, making your data permanent on the decentralized network.
 *
 * KEY CONCEPTS:
 * - IPFS as content-addressed storage
 * - Content IDs (CIDs)
 * - Personal Spaces as data domains
 * - personalSpace.publishEdit() function
 * - getWalletClient() for EOA wallets
 * - Wallet clients and authentication
 *
 * REQUIREMENTS:
 * - Set PRIVATE_KEY environment variable (export from https://www.geobrowser.io/export-wallet)
 * - Testnet ETH from faucet: https://faucet.conduit.xyz/geo-test-zc16z3tcvf
 *
 * ============================================================================
 */

import { createPublicClient, type Hex, http } from "viem";
import {
  Graph,
  personalSpace,
  getWalletClient,
  TESTNET_RPC_URL,
} from "@geoprotocol/geo-sdk";
import { SpaceRegistryAbi } from "@geoprotocol/geo-sdk/abis";
import { TESTNET } from "@geoprotocol/geo-sdk/contracts";
import type { Op } from "@geoprotocol/geo-sdk";

/**
 * EXPLANATION:
 *
 * To make your edits permanent, they go through a two-step process:
 *
 * STEP 1: PUBLISH TO IPFS
 * The personalSpace.publishEdit() function handles uploading your edit to IPFS
 * and returns a CID (Content Identifier) along with the calldata needed for
 * on-chain submission.
 *
 * STEP 2: SUBMIT ON-CHAIN
 * Use the wallet client to send the transaction with the calldata returned
 * from publishEdit(). This registers your edit in your personal space.
 *
 * The architecture flow:
 * 1. Create operations locally
 * 2. Call personalSpace.publishEdit() → uploads to IPFS, returns calldata
 * 3. Send transaction with walletClient.sendTransaction()
 * 4. Indexer reads and makes data queryable
 */

console.log("=== Course 7: Publishing to IPFS and Personal Spaces ===\n");

// =============================================================================
// UNDERSTANDING THE ARCHITECTURE
// =============================================================================

console.log("--- Publishing Architecture ---");
console.log(`
  ┌─────────────────────────────────────────────────────────────────┐
  │                    DATA FLOW DIAGRAM                            │
  ├─────────────────────────────────────────────────────────────────┤
  │                                                                 │
  │  Local Machine              IPFS Network           Blockchain   │
  │  ─────────────              ────────────           ──────────   │
  │                                                                 │
  │  ┌───────────┐              ┌──────────┐          ┌──────────┐  │
  │  │Operations │   publish    │   IPFS   │   CID    │  Smart   │  │
  │  │ - Create  │ ──────────►  │  Nodes   │ ───────► │ Contract │  │
  │  │ - Update  │              │          │          │  (Geo)   │  │
  │  │ - Delete  │              └──────────┘          └──────────┘  │
  │  └───────────┘                   │                      │       │
  │        │                         │                      │       │
  │        ▼                         ▼                      ▼       │
  │  ┌───────────┐              ┌──────────┐          ┌──────────┐  │
  │  │   Edit    │              │   CID    │          │ Indexed  │  │
  │  │  Object   │              │ Content  │          │   Data   │  │
  │  └───────────┘              │Addressed │          │   API    │  │
  │                             └──────────┘          └──────────┘  │
  │                                                                 │
  └─────────────────────────────────────────────────────────────────┘
`);

// =============================================================================
// SETUP: Create operations for publishing
// =============================================================================

console.log("--- Creating Operations ---\n");

// Create a simple book schema and entity
const titlePropResult = Graph.createProperty({
  name: "Title",
  dataType: "TEXT",
});

const bookTypeResult = Graph.createType({
  name: "Book",
  properties: [titlePropResult.id],
});

const bookEntityResult = Graph.createEntity({
  name: "Moby Dick",
  types: [bookTypeResult.id],
  values: [
    { property: titlePropResult.id, type: "text", value: "Moby Dick" },
  ],
});

// Collect all operations
const allOps: Op[] = [
  ...titlePropResult.ops,
  ...bookTypeResult.ops,
  ...bookEntityResult.ops,
];

console.log(`Created ${allOps.length} operations`);
console.log("  1. Create Title property");
console.log("  2. Create Book type");
console.log('  3. Create "Moby Dick" entity');

// =============================================================================
// CHALLENGE: Complete Publish Flow
// =============================================================================
/**
 * CHALLENGE:
 * Write a complete function that takes a list of operations, creates an Edit,
 * publishes to IPFS, and submits to a personal space. Handle errors appropriately.
 *
 * Try it yourself first, then scroll down for the solution!
 */

// YOUR CODE HERE:
// async function publishToPersonalSpace(
//   operations: Op[],
//   editName: string,
//   privateKey: `0x${string}`
// ) {
//   // Get wallet client using getWalletClient from SDK
//   // Check if space exists, create if not
//   // Look up space ID from registry
//   // Call personalSpace.publishEdit() to get CID and calldata
//   // Send transaction with walletClient
// }

// =============================================================================
// SOLUTION
// =============================================================================

console.log("\n--- Challenge Solution: Complete Publish Flow ---\n");

interface PublishResult {
  success: boolean;
  editId?: string;
  cid?: string;
  transactionHash?: string;
  spaceId?: string;
  error?: string;
}

/**
 * Publish operations to a personal space (EOA wallet version).
 *
 * This function follows the official SDK README pattern:
 * 1. Gets wallet client using getWalletClient from the SDK
 * 2. Checks if personal space exists, creates one if not
 * 3. Looks up space ID from the registry
 * 4. Publishes edit to IPFS and gets calldata
 * 5. Sends transaction to register the edit on-chain
 */
async function publishToPersonalSpace(
  operations: Op[],
  editName: string,
  privateKey: `0x${string}`
): Promise<PublishResult> {
  console.log(`Publishing Edit: "${editName}"`);
  console.log(`Operations: ${operations.length}`);

  try {
    // Step 1: Get wallet client from SDK
    console.log("\n[Step 1/5] Getting wallet client...");
    const walletClient = await getWalletClient({
      privateKey,
    });
    const account = walletClient.account;
    if (!account) {
      throw new Error("Failed to get account from wallet client");
    }
    console.log(`  ✓ Address: ${account.address.slice(0, 10)}...${account.address.slice(-6)}`);

    // Create public client for reading contract state
    const publicClient = createPublicClient({
      transport: http(TESTNET_RPC_URL),
    });

    // Step 2: Check if personal space exists
    console.log("\n[Step 2/5] Checking for existing personal space...");
    const hasExistingSpace = await personalSpace.hasSpace({
      address: account.address,
    });

    if (!hasExistingSpace) {
      console.log("  No space found. Creating personal space...");
      const { to, calldata } = personalSpace.createSpace();

      const createSpaceTxHash = await walletClient.sendTransaction({
        account,
        to,
        data: calldata,
        chain: null, // viem requires this; null means "use client's chain"
      });

      await publicClient.waitForTransactionReceipt({ hash: createSpaceTxHash });
      console.log(`  ✓ Personal space created: ${createSpaceTxHash.slice(0, 20)}...`);
    } else {
      console.log("  ✓ Personal space exists");
    }

    // Step 3: Look up space ID from registry
    console.log("\n[Step 3/5] Looking up space ID...");
    const spaceIdHex = (await publicClient.readContract({
      address: TESTNET.SPACE_REGISTRY_ADDRESS,
      abi: SpaceRegistryAbi,
      functionName: "addressToSpaceId",
      args: [account.address],
    })) as Hex;

    // Convert bytes16 hex to UUID string (without dashes)
    const spaceId = spaceIdHex.slice(2, 34).toLowerCase();
    console.log(`  ✓ Space ID: ${spaceId}`);

    // Step 4: Publish to IPFS and get calldata
    console.log("\n[Step 4/5] Publishing to IPFS...");
    const { cid, editId, to, calldata } = await personalSpace.publishEdit({
      name: editName,
      spaceId,
      ops: operations,
      author: account.address,
      network: "TESTNET",
    });

    console.log(`  ✓ Edit ID: ${editId}`);
    console.log(`  ✓ CID: ${cid}`);

    // Step 5: Submit on-chain
    console.log("\n[Step 5/5] Submitting on-chain...");
    const txHash = await walletClient.sendTransaction({
      account,
      to,
      data: calldata,
      chain: null, // viem requires this; null means "use client's chain"
    });

    console.log(`  ✓ Transaction: ${txHash}`);

    // Wait for confirmation
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
    });
    console.log(`  ✓ Confirmed in block ${receipt.blockNumber}`);

    console.log(`
  ┌─────────────────────────────────────────────────────────────┐
  │                    PUBLISH COMPLETE                         │
  ├─────────────────────────────────────────────────────────────┤
  │                                                             │
  │  Edit Name: ${editName.padEnd(43)}│
  │  Space ID: ${spaceId.padEnd(44)}│
  │  Edit ID: ${editId.padEnd(45)}│
  │  CID: ${cid.padEnd(49)}│
  │  Status: SUCCESS                                            │
  │                                                             │
  └─────────────────────────────────────────────────────────────┘
    `);

    return {
      success: true,
      editId,
      cid,
      transactionHash: txHash,
      spaceId,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`\n[ERROR] Publish failed: ${errorMessage}`);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

// =============================================================================
// RUN THE EXAMPLE
// =============================================================================

// Check for required environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}` | undefined;

if (!PRIVATE_KEY) {
  console.log(`
  ┌─────────────────────────────────────────────────────────────┐
  │                    CONFIGURATION NEEDED                     │
  ├─────────────────────────────────────────────────────────────┤
  │                                                             │
  │  To run this example, set the PRIVATE_KEY env variable:     │
  │                                                             │
  │  export PRIVATE_KEY="0x..."                                 │
  │                                                             │
  │  Get your private key from:                                 │
  │  https://www.geobrowser.io/export-wallet                    │
  │                                                             │
  │  Get testnet ETH from:                                      │
  │  https://faucet.conduit.xyz/geo-test-zc16z3tcvf             │
  │                                                             │
  │  Skipping live publishing demo...                           │
  │                                                             │
  └─────────────────────────────────────────────────────────────┘
  `);
} else {
  // Run the full publish flow
  await publishToPersonalSpace(
    allOps,
    "Add Moby Dick to Library",
    PRIVATE_KEY
  );
}

// =============================================================================
// CODE SUMMARY
// =============================================================================

console.log("--- Code Summary (from official README) ---\n");
console.log(`
  import { createPublicClient, type Hex, http } from "viem";
  import { privateKeyToAccount } from "viem/accounts";
  import {
    Graph,
    personalSpace,
    getWalletClient,
    SpaceRegistryAbi,
    TESTNET_RPC_URL,
  } from "@geoprotocol/geo-sdk";
  import { TESTNET } from "@geoprotocol/geo-sdk/contracts";

  // Get wallet client from SDK
  const walletClient = await getWalletClient({ privateKey });
  const account = walletClient.account;

  // Create operations
  const { ops, id: entityId } = Graph.createEntity({
    name: "Test Entity",
    description: "Created via SDK",
  });

  // Check/create personal space
  const hasSpace = await personalSpace.hasSpace({ address: account.address });
  if (!hasSpace) {
    const { to, calldata } = personalSpace.createSpace();
    await walletClient.sendTransaction({ account, to, data: calldata });
  }

  // Look up space ID
  const publicClient = createPublicClient({ transport: http(TESTNET_RPC_URL) });
  const spaceIdHex = await publicClient.readContract({
    address: TESTNET.SPACE_REGISTRY_ADDRESS,
    abi: SpaceRegistryAbi,
    functionName: "addressToSpaceId",
    args: [account.address],
  });
  const spaceId = spaceIdHex.slice(2, 34).toLowerCase();

  // Publish to IPFS and get calldata
  const { cid, editId, to, calldata } = await personalSpace.publishEdit({
    name: "My Edit",
    spaceId,
    ops,
    author: account.address,
    network: "TESTNET",
  });

  // Submit on-chain
  const txHash = await walletClient.sendTransaction({
    account: walletClient.account,
    to,
    data: calldata,
  });
`);

// =============================================================================
// WHAT'S NEXT?
// =============================================================================
console.log("\n--- What's Next? ---");
console.log("Personal spaces give you full control. But what about easier");
console.log("onboarding? Course 8 introduces SMART ACCOUNTS with gas");
console.log("sponsorship - users can transact without holding ETH!");
console.log("\nRun: npm run course8");
