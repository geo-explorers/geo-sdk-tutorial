/**
 * ============================================================================
 * COURSE 9: Smart Accounts and Gas Sponsorship
 * ============================================================================
 *
 * OBJECTIVE: Learn to use Smart Accounts with Pimlico for gas-sponsored
 * transactions, enabling seamless user onboarding without requiring users
 * to hold ETH.
 *
 * KEY CONCEPTS:
 * - Smart Accounts vs EOA (Externally Owned Accounts)
 * - Safe smart accounts
 * - Pimlico paymaster for gas sponsorship
 * - getSmartAccountWalletClient() function
 * - Account abstraction benefits
 *
 * REQUIREMENTS:
 * - Set PRIVATE_KEY environment variable (export from https://www.geobrowser.io/export-wallet)
 * - No testnet ETH required! Gas is sponsored by Pimlico.
 *
 * NOTE: This course uses the shared utilities from src/functions.ts.
 * The publishOps() helper uses smart accounts by default!
 *
 * ============================================================================
 */

import "dotenv/config";
import { Graph } from "@geoprotocol/geo-sdk";
import type { Op } from "@geoprotocol/geo-sdk";

// Import shared utilities - see src/functions.ts for implementation details
import { publishOps, printOpsSummary } from "../src/functions.js";

/**
 * EXPLANATION:
 *
 * Traditional blockchain wallets (EOAs) require users to:
 * 1. Acquire cryptocurrency (ETH) for gas
 * 2. Manage private keys
 * 3. Understand gas pricing
 *
 * SMART ACCOUNTS solve these problems through Account Abstraction:
 *
 * SAFE SMART ACCOUNTS:
 * - Multi-signature capable
 * - Programmable security rules
 * - Recoverable (no single point of failure)
 *
 * GAS SPONSORSHIP (PIMLICO):
 * - Application pays for gas, not users
 * - Users can transact without holding ETH
 * - Better onboarding experience
 */

console.log("=== Course 9: Smart Accounts and Gas Sponsorship ===\n");

// =============================================================================
// COMPARING ACCOUNT TYPES
// =============================================================================

console.log("--- Account Types Comparison ---");
console.log(`
  ┌─────────────────────────────────────────────────────────────────┐
  │                    EOA (Traditional Wallet)                     │
  ├─────────────────────────────────────────────────────────────────┤
  │                                                                 │
  │  • User must buy and hold ETH for gas fees                      │
  │  • Single private key (lose it = lose everything)               │
  │  • Every transaction costs the user gas                         │
  │  • Complex for new users                                        │
  │                                                                 │
  │  Code:                                                          │
  │  const wallet = await getWalletClient({ privateKey });          │
  │                                                                 │
  └─────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────┐
  │                 Smart Account (Recommended)                     │
  ├─────────────────────────────────────────────────────────────────┤
  │                                                                 │
  │  • No ETH required (gas is sponsored)                           │
  │  • Recoverable with social recovery options                     │
  │  • Programmable security rules                                  │
  │  • Great user experience                                        │
  │                                                                 │
  │  Code:                                                          │
  │  const wallet = await getSmartAccountWalletClient({             │
  │    privateKey,                                                  │
  │  });                                                            │
  │                                                                 │
  └─────────────────────────────────────────────────────────────────┘
`);

// =============================================================================
// CHALLENGE: User Onboarding Flow
// =============================================================================
/**
 * CHALLENGE:
 * Create an onboarding function that sets up a new user with a smart account
 * and publishes their first edit with sponsored gas. The function should
 * handle the complete flow from account creation to successful publish.
 *
 * HINT: Use publishOps() with useSmartAccount: true (this is the default!)
 *
 * Try it yourself first, then scroll down for the solution!
 */

// YOUR CODE HERE:
// async function onboardNewUser(privateKey: `0x${string}`) {
//   // Create a welcome profile entity
//   // Use publishOps() with smart account (default)
//   // Return the result
// }

// =============================================================================
// SOLUTION
// =============================================================================

console.log("--- Challenge Solution: User Onboarding Flow ---\n");

interface OnboardingResult {
  success: boolean;
  smartAccountAddress?: string;
  personalSpaceId?: string;
  firstEditId?: string;
  firstEditCid?: string;
  error?: string;
}

/**
 * Onboard a new user with a smart account and gas sponsorship.
 *
 * Using the publishOps() helper makes this incredibly simple:
 * - Smart accounts are used by default (useSmartAccount: true)
 * - Personal space is created automatically if needed
 * - Gas is sponsored by Pimlico - no ETH required!
 */
async function onboardNewUser(privateKey: `0x${string}`): Promise<OnboardingResult> {
  console.log("╔═══════════════════════════════════════════════════════════╗");
  console.log("║              NEW USER ONBOARDING                          ║");
  console.log("╚═══════════════════════════════════════════════════════════╝\n");

  console.log("Welcome! Let's set up your decentralized knowledge space.\n");
  console.log("Note: Gas is sponsored - this costs you nothing!\n");

  try {
    // Step 1: Create Welcome Profile schema and entity
    console.log("[Step 1/2] Creating profile schema and entity...\n");

    const nameResult = Graph.createProperty({
      name: "Display Name",
      dataType: "TEXT",
    });

    const bioResult = Graph.createProperty({
      name: "Bio",
      dataType: "TEXT",
    });

    const joinDateResult = Graph.createProperty({
      name: "Join Date",
      dataType: "DATETIME",
    });

    const profileTypeResult = Graph.createType({
      name: "User Profile",
      properties: [nameResult.id, bioResult.id, joinDateResult.id],
    });

    const profileEntityResult = Graph.createEntity({
      name: "New User",
      types: [profileTypeResult.id],
      values: [
        { property: nameResult.id, type: "text", value: "New User" },
        { property: bioResult.id, type: "text", value: "Just joined the knowledge graph!" },
        { property: joinDateResult.id, type: "datetime", value: new Date().toISOString() },
      ],
    });

    // Collect all operations
    const allOps: Op[] = [
      ...nameResult.ops,
      ...bioResult.ops,
      ...joinDateResult.ops,
      ...profileTypeResult.ops,
      ...profileEntityResult.ops,
    ];

    console.log("  ✓ Created 3 profile properties");
    console.log("  ✓ Created User Profile type");
    console.log("  ✓ Created profile entity\n");

    printOpsSummary(allOps);

    // Step 2: Publish using smart account (gas-free!)
    console.log("\n[Step 2/2] Publishing to blockchain (gas-free!)...\n");
    console.log("  Using publishOps() with smart account (default)");
    console.log("  Gas is sponsored by Pimlico paymaster\n");

    const result = await publishOps({
      ops: allOps,
      editName: "Welcome Profile Setup",
      privateKey,
      useSmartAccount: true, // This is the default!
      network: "TESTNET",
    });

    if (!result.success) {
      throw new Error(result.error || "Publish failed");
    }

    // Onboarding complete!
    console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                    ONBOARDING COMPLETE!                           ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Your Account:                                                    ║
║  ─────────────                                                    ║
║  Personal Space: ${(result.spaceId || "").padEnd(43)}║
║                                                                   ║
║  Your First Edit:                                                 ║
║  ────────────────                                                 ║
║  Edit ID: ${(result.editId || "").padEnd(51)}║
║  CID: ${(result.cid || "").padEnd(55)}║
║                                                                   ║
║  What's Next:                                                     ║
║  ────────────                                                     ║
║  1. Customize your profile                                        ║
║  2. Create your first entities                                    ║
║  3. Connect with other spaces                                     ║
║                                                                   ║
║  Gas Status: ALL GAS SPONSORED                                    ║
║  You can publish more edits without holding ETH!                  ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
    `);

    return {
      success: true,
      personalSpaceId: result.spaceId,
      firstEditId: result.editId,
      firstEditCid: result.cid,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`\n[ERROR] Onboarding failed: ${errorMessage}`);

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
  │  NO TESTNET ETH REQUIRED!                                   │
  │  Gas is sponsored by Pimlico paymaster.                     │
  │                                                             │
  │  Skipping live onboarding demo...                           │
  │                                                             │
  └─────────────────────────────────────────────────────────────┘
  `);
} else {
  // Run the onboarding example
  await onboardNewUser(PRIVATE_KEY);
}

// =============================================================================
// WHY SMART ACCOUNTS MATTER
// =============================================================================

console.log("--- Why This Matters ---\n");
console.log(`
  Traditional Web3 Onboarding:
  ───────────────────────────
  1. User creates wallet → "What's a seed phrase?"
  2. User needs ETH → "How do I buy crypto?"
  3. User pays gas → "Why did that cost $5?"
  4. User loses key → "I lost everything!"

  With Smart Accounts:
  ────────────────────
  1. User signs up → Normal experience
  2. App sponsors gas → Free for users
  3. Social recovery → Never lose access
  4. Progressive security → Add 2FA, limits, etc.

  Result: Web2-like UX with Web3 benefits!
`);

// =============================================================================
// CODE SUMMARY
// =============================================================================

console.log("--- Code Summary (using shared helper) ---\n");
console.log(`
  import { Graph } from "@geoprotocol/geo-sdk";
  import { publishOps } from "../src/functions.js";

  // Create your operations
  const { ops } = Graph.createEntity({
    name: "My Entity",
    description: "Created with gas sponsorship!",
  });

  // Publish with smart account (gas-free!)
  // useSmartAccount: true is the DEFAULT
  const result = await publishOps({
    ops,
    editName: "My Edit",
    privateKey: PRIVATE_KEY,
    // useSmartAccount: true,  // This is the default!
    network: "TESTNET",
  });

  // That's it! No ETH needed.
  console.log("Edit published:", result.editId);

  // ─────────────────────────────────────────────────────────────
  // The publishOps() helper automatically:
  // 1. Creates a Safe smart account via getSmartAccountWalletClient()
  // 2. Uses Pimlico paymaster for gas sponsorship
  // 3. Creates personal space if needed
  // 4. Publishes to IPFS and submits on-chain
  //
  // See src/functions.ts for implementation details!
  // ─────────────────────────────────────────────────────────────
`);

// =============================================================================
// WHAT'S NEXT?
// =============================================================================
console.log("\n--- What's Next? ---");
console.log("Personal spaces are great for individual data. But what about");
console.log("collaborative knowledge? Course 10 introduces DAO SPACES with");
console.log("community governance and voting.");
console.log("\nRun: npm run course10");
