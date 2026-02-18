/**
 * ============================================================================
 * COURSE 10: DAO Spaces and Collaborative Governance
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
 * - Set DAO_SPACE_ID environment variable (the DAO space ID, 32-char hex without dashes)
 * - Your personal space ID is needed as the caller (proposer)
 *
 * NOTE: This course uses the shared utilities from src/functions.ts.
 * The publishOps() helper auto-detects DAO spaces and uses daoSpace.proposeEdit().
 *
 * ============================================================================
 */

import "dotenv/config";
import { Graph } from "@geoprotocol/geo-sdk";
import type { Op } from "@geoprotocol/geo-sdk";

// Import shared utilities and constants
import {
  publishOps,
  printOpsSummary,
  prompt,
  queryEntityByName,
} from "../src/functions.js";
import { TYPES, PROPERTIES } from "../src/constants.js";

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

console.log("=== Course 10: DAO Spaces and Collaborative Governance ===\n");

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
 * Create a complete workflow for contributing to a DAO space using
 * the publishOps() helper which auto-detects DAO spaces.
 *
 * The helper queries the API to detect if the target space is a DAO,
 * then uses daoSpace.proposeEdit() instead of personalSpace.publishEdit().
 *
 * Try it yourself first, then scroll down for the solution!
 */

// YOUR CODE HERE:
// async function proposeToDAO(
//   daoSpaceId: string,
//   ops: Op[],
//   editName: string,
//   privateKey: `0x${string}`
// ) {
//   const result = await publishOps({
//     ops,
//     editName,
//     privateKey,
//     spaceId: daoSpaceId, // Target the DAO space
//   });
//   return result;
// }

// =============================================================================
// SOLUTION
// =============================================================================

console.log("--- Challenge Solution: DAO Contribution Workflow ---\n");

/**
 * Propose an edit to a DAO space using the publishOps() helper.
 *
 * The publishOps() function in src/functions.ts handles:
 * 1. Creating wallet client (smart account by default)
 * 2. Ensuring caller has a personal space
 * 3. Querying the API to detect if target is a DAO space
 * 4. If DAO: uses daoSpace.proposeEdit() with proper membership checks
 * 5. If Personal: uses personalSpace.publishEdit()
 * 6. Submitting the transaction
 *
 * This is much simpler than the manual implementation!
 */
async function proposeToDAOSpace(
  daoSpaceId: string,
  operations: Op[],
  editName: string,
  privateKey: `0x${string}`
) {
  console.log("╔═══════════════════════════════════════════════════════════╗");
  console.log("║              DAO SPACE CONTRIBUTION                       ║");
  console.log("╚═══════════════════════════════════════════════════════════╝\n");

  console.log(`Target DAO Space: ${daoSpaceId}`);
  console.log(`Proposal: "${editName}"`);
  console.log("\nUsing publishOps() helper from src/functions.ts\n");

  const result = await publishOps({
    ops: operations,
    editName,
    privateKey,
    spaceId: daoSpaceId, // Target the DAO space
    useSmartAccount: true, // Gas-sponsored
    network: "TESTNET",
  });

  if (result.success) {
    console.log(`
  ┌─────────────────────────────────────────────────────────────────┐
  │                      PROPOSAL CREATED                           │
  ├─────────────────────────────────────────────────────────────────┤
  │                                                                 │
  │  Edit ID: ${(result.editId || "").padEnd(51)}│
  │  CID: ${(result.cid || "").padEnd(55)}│
  │  Transaction: ${(result.transactionHash?.slice(0, 20) || "").padEnd(42)}│
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
  } else {
    console.error(`\n[ERROR] Proposal failed: ${result.error}`);
  }

  return result;
}

// =============================================================================
// CREATE SAMPLE OPERATIONS
// =============================================================================

// Create sample operations using ROOT SPACE types and properties
// This is the recommended pattern - reuse existing types!

// Create a topic entity
let topicName = await prompt("Enter topic name (e.g. Decentralized Governance): ");
while (await queryEntityByName(topicName)) {
  console.warn(`  ⚠ "${topicName}" already exists. Please enter a different name.`);
  topicName = await prompt("Enter a different name: ");
}
const topicResult = Graph.createEntity({
  name: topicName,
  types: [TYPES.topic],
  description: "Systems for community-driven decision making",
});

// Create a project entity with proper root space types
let projectName = await prompt("Enter project name (e.g. Community Wiki): ");
while (await queryEntityByName(projectName)) {
  console.warn(`  ⚠ "${projectName}" already exists. Please enter a different name.`);
  projectName = await prompt("Enter a different name: ");
}
const projectResult = Graph.createEntity({
  name: projectName,
  types: [TYPES.project],
  description: "A collaboratively curated knowledge base",
  values: [
    { property: PROPERTIES.web_url, type: "text", value: "https://example.com/wiki" },
  ],
});

// Create a relation connecting project to topic
const relationResult = Graph.createRelation({
  fromEntity: projectResult.id,
  toEntity: topicResult.id,
  type: PROPERTIES.topics,
});

// Collect all operations - note: no custom types or properties needed!
const allOps: Op[] = [
  ...topicResult.ops,
  ...projectResult.ops,
  ...relationResult.ops,
];

console.log(`Created ${allOps.length} operations for proposal`);
printOpsSummary(allOps);

// =============================================================================
// RUN THE EXAMPLE
// =============================================================================

// Check for required environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}` | undefined;
const DAO_SPACE_ID = process.env.DAO_SPACE_ID as string | undefined;

if (!PRIVATE_KEY || !DAO_SPACE_ID) {
  console.log(`
  ┌─────────────────────────────────────────────────────────────┐
  │                    CONFIGURATION NEEDED                     │
  ├─────────────────────────────────────────────────────────────┤
  │                                                             │
  │  To run this example, set these environment variables:      │
  │                                                             │
  │  export PRIVATE_KEY="0x..."                                 │
  │  export DAO_SPACE_ID="..."  # 32-char hex (no dashes)       │
  │                                                             │
  │  Get your private key from:                                 │
  │  https://www.geobrowser.io/export-wallet                    │
  │                                                             │
  │  The DAO space ID can be found in the Geo Browser URL       │
  │  for existing DAO spaces.                                   │
  │                                                             │
  │  Skipping live proposal demo...                             │
  │                                                             │
  └─────────────────────────────────────────────────────────────┘
  `);
} else {
  // Run the proposal
  await proposeToDAOSpace(
    DAO_SPACE_ID,
    allOps,
    "Add 'Sapiens' by Yuval Noah Harari",
    PRIVATE_KEY
  );
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

  // Propose to DAO with one function call!
  // The helper auto-detects DAO spaces and uses daoSpace.proposeEdit()
  const result = await publishOps({
    ops,
    editName: "My DAO Proposal",
    privateKey: PRIVATE_KEY,
    spaceId: DAO_SPACE_ID,     // Target the DAO space
    useSmartAccount: true,     // Gas-sponsored (default)
    network: "TESTNET",
  });

  console.log("Edit ID:", result.editId);
  console.log("CID:", result.cid);
  console.log("Transaction:", result.transactionHash);

  // ─────────────────────────────────────────────────────────────
  // Under the hood, publishOps() does:
  // 1. Query API to detect space type (PERSONAL vs DAO)
  // 2. If DAO: lookup caller's personal space ID
  // 3. Verify caller is member/editor of DAO
  // 4. Call daoSpace.proposeEdit() → creates governance proposal
  // 5. Submit transaction via smart account
  //
  // See src/functions.ts for the full implementation!
  // ─────────────────────────────────────────────────────────────
`);

// =============================================================================
// WHAT'S NEXT?
// =============================================================================

console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                    CORE CURRICULUM COMPLETE!                      ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  You've completed courses 1-10! You now understand:               ║
║                                                                   ║
║  1. Overview       - Knowledge Graph architecture                 ║
║  2. Reading Data   - GraphQL queries                              ║
║  3. Core Concepts  - IDs, Properties, Types, Entities, Relations  ║
║  4. Schemas        - Defining data structures                     ║
║  5. Entities       - Creating data instances                      ║
║  6. Relations      - Connecting entities                          ║
║  7. Edits          - Grouping operations                          ║
║  8. Publishing     - IPFS + Personal Spaces                       ║
║  9. Smart Accounts - Gas-sponsored transactions                   ║
║  10. DAO Spaces    - Community governance                         ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
`);

console.log("--- What's Next? ---");
console.log("Continue with ADVANCED PATTERNS in courses 11-13:");
console.log("  • Course 11: Advanced Blocks (text, data, images)");
console.log("  • Course 12: Updates & Deletes (modify and remove data)");
console.log("  • Course 13: Batch Import (external data sources)");
console.log("\nThen complete the CAPSTONE project in Course 14!");
console.log("\nRun: npm run course11");
