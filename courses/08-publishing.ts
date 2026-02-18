/**
 * ============================================================================
 * COURSE 8: Publishing to IPFS and Personal Spaces
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
 * - Using shared utilities for cleaner code
 *
 * REQUIREMENTS:
 * - Set PRIVATE_KEY environment variable (export from https://www.geobrowser.io/export-wallet)
 *
 * NOTE: This course uses the shared utilities from src/functions.ts.
 * See that file for the full implementation details of publishOps().
 *
 * ============================================================================
 */

import "dotenv/config";
import { Graph } from "@geoprotocol/geo-sdk";
import type { Op } from "@geoprotocol/geo-sdk";

// Import shared utilities - see src/functions.ts for implementation details
import {
  publishOps,
  printOpsSummary,
  prompt,
  promptProperty,
  promptType,
  queryEntityByName,
} from "../src/functions.js";

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
 *
 * The publishOps() helper in src/functions.ts handles all of this for you!
 */

console.log("=== Course 8: Publishing to IPFS and Personal Spaces ===\n");

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
const titlePropResult = await promptProperty("Title");
const bookTypeResult = await promptType("Book", [titlePropResult.id]);

let bookEntityName = await prompt("Enter entity name (e.g. Moby Dick): ");
while (await queryEntityByName(bookEntityName)) {
  console.warn(`  ⚠ "${bookEntityName}" already exists. Please enter a different name.`);
  bookEntityName = await prompt("Enter a different name: ");
}
const bookEntityResult = Graph.createEntity({
  name: bookEntityName,
  types: [bookTypeResult.id],
  values: [
    { property: titlePropResult.id, type: "text", value: bookEntityName },
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

// Print operation summary
console.log("\n--- Operation Summary ---");
printOpsSummary(allOps);

// =============================================================================
// CHALLENGE: Complete Publish Flow
// =============================================================================
/**
 * CHALLENGE:
 * Use the publishOps() helper from src/functions.ts to publish your operations.
 * The helper handles:
 * - Creating wallet client (smart account by default)
 * - Ensuring personal space exists
 * - Publishing to IPFS
 * - Submitting on-chain
 *
 * Try it yourself first, then scroll down for the solution!
 */

// YOUR CODE HERE:
// async function publishMyBook(privateKey: `0x${string}`) {
//   const result = await publishOps({
//     ops: allOps,
//     editName: "Add Moby Dick",
//     privateKey,
//   });
//   return result;
// }

// =============================================================================
// SOLUTION
// =============================================================================

console.log("\n--- Challenge Solution: Using publishOps() Helper ---\n");

/**
 * Publish operations using the shared helper.
 *
 * The publishOps() function in src/functions.ts handles:
 * 1. Creating smart account wallet client (gas-sponsored by default)
 * 2. Checking if personal space exists, creating if not
 * 3. Looking up space ID from registry
 * 4. Publishing to IPFS via personalSpace.publishEdit()
 * 5. Submitting transaction on-chain
 *
 * This is much simpler than implementing the full flow manually!
 */
async function publishMyBook(privateKey: `0x${string}`) {
  console.log("Using publishOps() helper from src/functions.ts\n");

  const result = await publishOps({
    ops: allOps,
    editName: "Add Moby Dick to Library",
    privateKey,
    useSmartAccount: true, // Use smart account with gas sponsorship
    network: "TESTNET",
  });

  if (result.success) {
    console.log(`
  ┌─────────────────────────────────────────────────────────────┐
  │                    PUBLISH COMPLETE                         │
  ├─────────────────────────────────────────────────────────────┤
  │                                                             │
  │  Space ID: ${(result.spaceId || "").padEnd(44)}│
  │  Edit ID: ${(result.editId || "").padEnd(45)}│
  │  CID: ${(result.cid || "").padEnd(49)}│
  │  Transaction: ${(result.transactionHash?.slice(0, 20) || "").padEnd(40)}│
  │  Status: SUCCESS                                            │
  │                                                             │
  └─────────────────────────────────────────────────────────────┘
    `);
  } else {
    console.error(`Publish failed: ${result.error}`);
  }

  return result;
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
  // Run the publish flow using the helper
  await publishMyBook(PRIVATE_KEY);
}

// =============================================================================
// CODE SUMMARY
// =============================================================================

console.log("--- Code Summary (using shared helper) ---\n");
console.log(`
  // Using the shared publishOps() helper (recommended):

  import { Graph } from "@geoprotocol/geo-sdk";
  import { publishOps } from "../src/functions.js";

  // Create your operations
  const { ops } = Graph.createEntity({
    name: "My Entity",
    description: "Created via SDK",
  });

  // Publish with one function call!
  const result = await publishOps({
    ops,
    editName: "My Edit",
    privateKey: PRIVATE_KEY,
    useSmartAccount: true,  // Gas-sponsored (no ETH needed)
    network: "TESTNET",
  });

  console.log("CID:", result.cid);
  console.log("Edit ID:", result.editId);
  console.log("Transaction:", result.transactionHash);

  // ─────────────────────────────────────────────────────────────
  // Under the hood, publishOps() does:
  // 1. getSmartAccountWalletClient() or getWalletClient()
  // 2. personalSpace.hasSpace() / personalSpace.createSpace()
  // 3. Look up space ID from SpaceRegistry contract
  // 4. personalSpace.publishEdit() → IPFS upload
  // 5. walletClient.sendTransaction() → on-chain
  //
  // See src/functions.ts for the full implementation!
  // ─────────────────────────────────────────────────────────────
`);

// =============================================================================
// WHAT'S NEXT?
// =============================================================================
console.log("\n--- What's Next? ---");
console.log("This course used a smart account with gas sponsorship.");
console.log("Course 9 goes deeper into SMART ACCOUNTS - how they work,");
console.log("account abstraction, and advanced wallet patterns.");
console.log("\nRun: npm run course9");
