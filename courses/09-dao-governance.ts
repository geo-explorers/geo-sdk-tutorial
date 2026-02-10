/**
 * ============================================================================
 * COURSE 9: DAO Spaces and Collaborative Governance
 * ============================================================================
 *
 * OBJECTIVE: Learn to propose edits to DAO-governed spaces and understand
 * the voting mechanism for community-curated knowledge.
 *
 * KEY CONCEPTS:
 * - DAO Spaces vs Personal Spaces
 * - Community governance
 * - daoSpace.proposeEdit() function
 * - Voting on proposals
 * - Pluralistic knowledge curation
 *
 * REQUIREMENTS:
 * - Set PRIVATE_KEY environment variable (export from https://www.geobrowser.io/export-wallet)
 * - Set DAO_SPACE_ADDRESS environment variable (the DAO space contract address)
 * - Set DAO_SPACE_ID environment variable (the DAO space ID as bytes16 hex)
 * - Your personal space ID is needed as the caller (proposer)
 *
 * ============================================================================
 */

import { createPublicClient, type Hex, http } from "viem";
import {
  Graph,
  personalSpace,
  daoSpace,
  getSmartAccountWalletClient,
  TESTNET_RPC_URL,
} from "@geoprotocol/geo-sdk";
import { SpaceRegistryAbi } from "@geoprotocol/geo-sdk/abis";
import { TESTNET } from "@geoprotocol/geo-sdk/contracts";
import type { Op } from "@geoprotocol/geo-sdk";

/**
 * EXPLANATION:
 *
 * PERSONAL SPACES = Full control, single owner
 * DAO SPACES = Community-governed, democratic curation
 *
 * DAO (Decentralized Autonomous Organization) Spaces allow communities
 * to collaboratively build knowledge with:
 *
 * 1. PROPOSALS - Anyone can propose an edit
 * 2. VOTING - Community members vote on proposals
 * 3. EXECUTION - Approved proposals are applied automatically
 * 4. PLURALISM - Different perspectives can coexist
 */

console.log("=== Course 9: DAO Spaces and Collaborative Governance ===\n");

// =============================================================================
// COMPARING SPACE TYPES
// =============================================================================

console.log("--- Personal vs DAO Spaces ---");
console.log(`
  ┌─────────────────────────────────────────────────────────────────┐
  │                      PERSONAL SPACE                             │
  ├─────────────────────────────────────────────────────────────────┤
  │                                                                 │
  │  Control: Single owner (you)                                    │
  │  Publishing: Immediate (no voting required)                     │
  │  Use case: Personal projects, individual data                   │
  │                                                                 │
  │  Code:                                                          │
  │  await personalSpace.publishEdit({ spaceId, ops, author })      │
  │                                                                 │
  └─────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────┐
  │                        DAO SPACE                                │
  ├─────────────────────────────────────────────────────────────────┤
  │                                                                 │
  │  Control: Community governance                                  │
  │  Publishing: Requires proposal + voting                         │
  │  Use case: Shared knowledge bases, community curation           │
  │                                                                 │
  │  Code:                                                          │
  │  await daoSpace.proposeEdit({                                   │
  │    daoSpaceAddress, daoSpaceId, callerSpaceId, ops, author      │
  │  })                                                             │
  │                                                                 │
  └─────────────────────────────────────────────────────────────────┘
`);

// =============================================================================
// GOVERNANCE FLOW
// =============================================================================

console.log("--- DAO Governance Flow ---");
console.log(`
  ┌───────────────────────────────────────────────────────────────────┐
  │                    GOVERNANCE WORKFLOW                            │
  ├───────────────────────────────────────────────────────────────────┤
  │                                                                   │
  │  Contributor                DAO Space              Community      │
  │  ───────────                ─────────              ─────────      │
  │                                                                   │
  │  ┌────────────┐            ┌──────────────┐                       │
  │  │Create Edit │            │              │                       │
  │  │(operations)│───────────►│  Proposal    │                       │
  │  └────────────┘  propose   │   Created    │                       │
  │                            │              │                       │
  │                            └──────┬───────┘                       │
  │                                   │                               │
  │                                   ▼ notify                        │
  │                            ┌──────────────┐     ┌──────────────┐  │
  │                            │   Voting     │◄────│   Members    │  │
  │                            │   Period     │vote │    Vote      │  │
  │                            │   (X hours)  │     │  FOR/AGAINST │  │
  │                            └──────┬───────┘     └──────────────┘  │
  │                                   │                               │
  │                      ┌────────────┴────────────┐                  │
  │                      ▼                         ▼                  │
  │               ┌──────────────┐         ┌──────────────┐           │
  │               │   PASSED     │         │  REJECTED    │           │
  │               │   (>50%)     │         │   (≤50%)     │           │
  │               └──────┬───────┘         └──────────────┘           │
  │                      │                                            │
  │                      ▼ auto-execute                               │
  │               ┌──────────────┐                                    │
  │               │    Edit      │                                    │
  │               │   Applied    │                                    │
  │               │   to Space   │                                    │
  │               └──────────────┘                                    │
  │                                                                   │
  └───────────────────────────────────────────────────────────────────┘
`);

// =============================================================================
// CHALLENGE: Complete DAO Contribution Workflow
// =============================================================================
/**
 * CHALLENGE:
 * Create a complete workflow for contributing to a DAO space:
 * 1. Prepare an edit with operations
 * 2. Propose it to the DAO using daoSpace.proposeEdit()
 * 3. Submit the proposal transaction
 *
 * Try it yourself first, then scroll down for the solution!
 */

// YOUR CODE HERE:
// async function proposeToDAO(
//   daoSpaceAddress: `0x${string}`,
//   daoSpaceId: `0x${string}`,
//   callerSpaceId: `0x${string}`,
//   ops: Op[],
//   author: `0x${string}`,
//   privateKey: `0x${string}`
// ) {
//   // Call daoSpace.proposeEdit() to publish edit and get proposal calldata
//   // Submit transaction via smart account
// }

// =============================================================================
// SOLUTION
// =============================================================================

console.log("--- Challenge Solution: DAO Contribution Workflow ---\n");

interface ContributionResult {
  success: boolean;
  proposalId?: string;
  editId?: string;
  cid?: string;
  txHash?: string;
  error?: string;
}

/**
 * Propose an edit to a DAO space.
 *
 * This function:
 * 1. Gets smart account for the proposer
 * 2. Looks up the proposer's personal space ID
 * 3. Calls daoSpace.proposeEdit() to publish to IPFS and get proposal calldata
 * 4. Submits the proposal transaction
 *
 * Note: The proposal then goes through the DAO's voting process.
 * If approved, the edit is automatically applied to the DAO space.
 */
async function proposeToDAOSpace(
  daoSpaceAddress: `0x${string}`,
  daoSpaceId: `0x${string}`,
  operations: Op[],
  editName: string,
  privateKey: `0x${string}`
): Promise<ContributionResult> {
  console.log("╔═══════════════════════════════════════════════════════════╗");
  console.log("║              DAO SPACE CONTRIBUTION                       ║");
  console.log("╚═══════════════════════════════════════════════════════════╝\n");

  console.log(`Target DAO Space: ${daoSpaceAddress}`);
  console.log(`Proposal: "${editName}"`);

  try {
    // Step 1: Get smart account
    console.log("\n[Step 1/4] Preparing contributor account...");
    const smartAccount = await getSmartAccountWalletClient({ privateKey });
    const contributorAddress = smartAccount.account.address;
    console.log(`  ✓ Contributor: ${contributorAddress.slice(0, 15)}...${contributorAddress.slice(-6)}`);

    // Create public client for reading contract state
    const publicClient = createPublicClient({
      transport: http(TESTNET_RPC_URL),
    });

    // Step 2: Look up the contributor's personal space ID
    console.log("\n[Step 2/4] Looking up contributor's space ID...");

    // First check if contributor has a personal space
    const hasSpace = await personalSpace.hasSpace({ address: contributorAddress });
    if (!hasSpace) {
      throw new Error("Contributor must have a personal space to propose to a DAO");
    }

    const callerSpaceIdHex = (await publicClient.readContract({
      address: TESTNET.SPACE_REGISTRY_ADDRESS,
      abi: SpaceRegistryAbi,
      functionName: "addressToSpaceId",
      args: [contributorAddress],
    })) as Hex;

    // Ensure it's in the right format (0x + 32 hex chars)
    const callerSpaceId = callerSpaceIdHex.slice(0, 34).toLowerCase() as `0x${string}`;
    console.log(`  ✓ Caller Space ID: ${callerSpaceId}`);

    // Step 3: Create proposal using daoSpace.proposeEdit()
    console.log("\n[Step 3/4] Publishing edit and creating proposal...");
    console.log("  Note: This creates a governance proposal, not an immediate edit");

    const { editId, cid, to, calldata, proposalId } = await daoSpace.proposeEdit({
      name: editName,
      ops: operations,
      author: contributorAddress,
      daoSpaceAddress,
      callerSpaceId,
      daoSpaceId,
      votingMode: "FAST", // publish() is a valid fast-path action
      network: "TESTNET",
    });

    console.log(`  ✓ Edit ID: ${editId}`);
    console.log(`  ✓ CID: ${cid}`);
    console.log(`  ✓ Proposal ID: ${proposalId}`);

    // Step 4: Submit the proposal transaction
    console.log("\n[Step 4/4] Submitting proposal transaction...");
    const txHash = await smartAccount.sendTransaction({
      to,
      data: calldata,
    });

    console.log(`  ✓ Transaction: ${txHash}`);

    // Wait for confirmation
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
    });
    console.log(`  ✓ Confirmed in block ${receipt.blockNumber}`);

    console.log(`
  ┌─────────────────────────────────────────────────────────────────┐
  │                      PROPOSAL CREATED                           │
  ├─────────────────────────────────────────────────────────────────┤
  │                                                                 │
  │  Proposal ID: ${proposalId.padEnd(46)}│
  │  Edit ID: ${editId.padEnd(51)}│
  │  CID: ${cid.padEnd(55)}│
  │  Status: SUBMITTED (awaiting votes)                             │
  │                                                                 │
  │  Next Steps:                                                    │
  │  ───────────                                                    │
  │  1. Share proposal with community                               │
  │  2. Community members vote FOR or AGAINST                       │
  │  3. If passed, edit is automatically executed                   │
  │                                                                 │
  └─────────────────────────────────────────────────────────────────┘
    `);

    return {
      success: true,
      proposalId,
      editId,
      cid,
      txHash,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`\n[ERROR] Proposal failed: ${errorMessage}`);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

// =============================================================================
// RUN THE EXAMPLE
// =============================================================================

// Create sample operations for a book
const titlePropResult = Graph.createProperty({
  name: "Title",
  dataType: "TEXT",
});

const authorPropResult = Graph.createProperty({
  name: "Author",
  dataType: "TEXT",
});

const bookTypeResult = Graph.createType({
  name: "Book",
  properties: [titlePropResult.id, authorPropResult.id],
});

const bookEntityResult = Graph.createEntity({
  name: "Sapiens: A Brief History of Humankind",
  types: [bookTypeResult.id],
  values: [
    { property: titlePropResult.id, type: "text", value: "Sapiens: A Brief History of Humankind" },
    { property: authorPropResult.id, type: "text", value: "Yuval Noah Harari" },
  ],
});

// Collect all operations
const allOps: Op[] = [
  ...titlePropResult.ops,
  ...authorPropResult.ops,
  ...bookTypeResult.ops,
  ...bookEntityResult.ops,
];

console.log(`\nCreated ${allOps.length} operations for proposal\n`);

// Check for required environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}` | undefined;
const DAO_SPACE_ADDRESS = process.env.DAO_SPACE_ADDRESS as `0x${string}` | undefined;
const DAO_SPACE_ID = process.env.DAO_SPACE_ID as `0x${string}` | undefined;

if (!PRIVATE_KEY || !DAO_SPACE_ADDRESS || !DAO_SPACE_ID) {
  console.log(`
  ┌─────────────────────────────────────────────────────────────┐
  │                    CONFIGURATION NEEDED                     │
  ├─────────────────────────────────────────────────────────────┤
  │                                                             │
  │  To run this example, set these environment variables:      │
  │                                                             │
  │  export PRIVATE_KEY="0x..."                                 │
  │  export DAO_SPACE_ADDRESS="0x..."  # DAO contract address   │
  │  export DAO_SPACE_ID="0x..."       # DAO space ID (bytes16) │
  │                                                             │
  │  Get your private key from:                                 │
  │  https://www.geobrowser.io/export-wallet                    │
  │                                                             │
  │  The DAO space address and ID can be found in the           │
  │  Geo Browser for existing DAO spaces.                       │
  │                                                             │
  │  Skipping live proposal demo...                             │
  │                                                             │
  └─────────────────────────────────────────────────────────────┘
  `);
} else {
  // Run the proposal
  await proposeToDAOSpace(
    DAO_SPACE_ADDRESS,
    DAO_SPACE_ID,
    allOps,
    "Add 'Sapiens' by Yuval Noah Harari",
    PRIVATE_KEY
  );
}

// =============================================================================
// CODE SUMMARY
// =============================================================================

console.log("--- Code Summary (from official SDK) ---\n");
console.log(`
  import { createPublicClient, type Hex, http } from "viem";
  import {
    Graph,
    personalSpace,
    daoSpace,
    getSmartAccountWalletClient,
    TESTNET_RPC_URL,
  } from "@geoprotocol/geo-sdk";
  import { SpaceRegistryAbi } from "@geoprotocol/geo-sdk/abis";
  import { TESTNET } from "@geoprotocol/geo-sdk/contracts";

  // Get smart account
  const smartAccount = await getSmartAccountWalletClient({ privateKey });
  const contributorAddress = smartAccount.account.address;

  // Look up contributor's personal space ID (required to propose)
  const publicClient = createPublicClient({ transport: http(TESTNET_RPC_URL) });
  const callerSpaceIdHex = await publicClient.readContract({
    address: TESTNET.SPACE_REGISTRY_ADDRESS,
    abi: SpaceRegistryAbi,
    functionName: "addressToSpaceId",
    args: [contributorAddress],
  });
  const callerSpaceId = callerSpaceIdHex.slice(0, 34).toLowerCase();

  // Create operations
  const { ops } = Graph.createEntity({ name: "My Entity" });

  // Create proposal (publishes to IPFS and returns proposal calldata)
  const { editId, cid, to, calldata, proposalId } = await daoSpace.proposeEdit({
    name: "My Proposal",
    ops,
    author: contributorAddress,
    daoSpaceAddress,       // DAO space contract address
    callerSpaceId,         // Your personal space ID
    daoSpaceId,            // Target DAO space ID
    votingMode: "FAST",    // or "SLOW" for standard voting
    network: "TESTNET",
  });

  // Submit the proposal transaction
  const txHash = await smartAccount.sendTransaction({ to, data: calldata });
`);

// =============================================================================
// CURRICULUM COMPLETE!
// =============================================================================

console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                    CURRICULUM COMPLETE!                           ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  You've completed all 9 courses! You now understand:              ║
║                                                                   ║
║  1. IDs          - Global unique identifiers                      ║
║  2. Properties   - Data type definitions                          ║
║  3. Types        - Entity schemas                                 ║
║  4. Entities     - Actual data instances                          ║
║  5. Relations    - Connections between entities                   ║
║  6. Edits        - Grouped operations                             ║
║  7. Publishing   - IPFS + Personal Spaces                         ║
║  8. Smart Accts  - Gas-sponsored transactions                     ║
║  9. DAO Spaces   - Community governance                           ║
║                                                                   ║
║  Ready for the final challenge?                                   ║
║  Build a complete application in the Capstone Project!            ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
`);

console.log("Run: npm run capstone");
