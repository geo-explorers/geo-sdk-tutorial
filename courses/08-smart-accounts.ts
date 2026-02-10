/**
 * ============================================================================
 * COURSE 8: Smart Accounts and Gas Sponsorship
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
 * ============================================================================
 */

import { createPublicClient, type Hex, http } from "viem";
import {
  Graph,
  personalSpace,
  getSmartAccountWalletClient,
  TESTNET_RPC_URL,
} from "@geoprotocol/geo-sdk";
import { SpaceRegistryAbi } from "@geoprotocol/geo-sdk/abis";
import { TESTNET } from "@geoprotocol/geo-sdk/contracts";
import type { Op } from "@geoprotocol/geo-sdk";

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

console.log("=== Course 8: Smart Accounts and Gas Sponsorship ===\n");

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
 * Try it yourself first, then scroll down for the solution!
 */

// YOUR CODE HERE:
// async function onboardNewUser(privateKey: `0x${string}`) {
//   // Create smart account using getSmartAccountWalletClient
//   // Check if personal space exists, create if not
//   // Look up space ID from registry
//   // Create welcome profile
//   // Publish with sponsored gas
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
 * This function follows the official SDK README pattern for smart accounts:
 * 1. Creates a smart account using getSmartAccountWalletClient
 * 2. Checks if personal space exists, creates one if not
 * 3. Creates a welcome profile with schema and entity
 * 4. Publishes to IPFS and submits on-chain (gas-free!)
 */
async function onboardNewUser(privateKey: `0x${string}`): Promise<OnboardingResult> {
  console.log("╔═══════════════════════════════════════════════════════════╗");
  console.log("║              NEW USER ONBOARDING                          ║");
  console.log("╚═══════════════════════════════════════════════════════════╝\n");

  console.log("Welcome! Let's set up your decentralized knowledge space.\n");

  try {
    // Step 1: Create Smart Account (gas-sponsored!)
    console.log("[Step 1/5] Creating Smart Account...");
    console.log("  - Setting up Safe smart account");
    console.log("  - Configuring Pimlico gas sponsorship");

    const smartAccount = await getSmartAccountWalletClient({ privateKey });
    const smartAccountAddress = smartAccount.account.address;

    console.log(`  ✓ Smart Account: ${smartAccountAddress.slice(0, 15)}...${smartAccountAddress.slice(-6)}`);
    console.log("  ✓ Gas sponsorship: ENABLED");

    // Create public client for reading contract state
    const publicClient = createPublicClient({
      transport: http(TESTNET_RPC_URL),
    });

    // Step 2: Check if personal space exists
    console.log("\n[Step 2/5] Checking for existing personal space...");
    const hasExistingSpace = await personalSpace.hasSpace({
      address: smartAccountAddress,
    });

    if (!hasExistingSpace) {
      console.log("  No space found. Creating personal space...");
      const { to, calldata } = personalSpace.createSpace();

      // Smart account sendTransaction doesn't need account/chain params
      const createSpaceTxHash = await smartAccount.sendTransaction({
        to,
        data: calldata,
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
      args: [smartAccountAddress],
    })) as Hex;

    // Convert bytes16 hex to UUID string (without dashes)
    const spaceId = spaceIdHex.slice(2, 34).toLowerCase();
    console.log(`  ✓ Space ID: ${spaceId}`);

    // Step 4: Create Welcome Profile schema and entity
    console.log("\n[Step 4/5] Setting up profile schema...");

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
    console.log("  ✓ Created profile entity");

    // Step 5: Publish to IPFS and submit on-chain (gas-free!)
    console.log("\n[Step 5/5] Publishing to blockchain (gas-free!)...");
    console.log("  Note: Gas is sponsored - this costs you nothing!");

    const { cid, editId, to, calldata } = await personalSpace.publishEdit({
      name: "Welcome Profile Setup",
      spaceId,
      ops: allOps,
      author: smartAccountAddress,
      network: "TESTNET",
    });

    console.log(`  ✓ Edit ID: ${editId}`);
    console.log(`  ✓ CID: ${cid}`);

    // Smart account sendTransaction - gas is sponsored!
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

    // Onboarding complete!
    console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                    ONBOARDING COMPLETE!                           ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Your Account:                                                    ║
║  ─────────────                                                    ║
║  Smart Account: ${smartAccountAddress.slice(0, 42).padEnd(44)}║
║  Personal Space: ${spaceId.padEnd(43)}║
║                                                                   ║
║  Your First Edit:                                                 ║
║  ────────────────                                                 ║
║  Edit ID: ${editId.padEnd(51)}║
║  CID: ${cid.padEnd(55)}║
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
      smartAccountAddress,
      personalSpaceId: spaceId,
      firstEditId: editId,
      firstEditCid: cid,
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

console.log("--- Code Summary (from official README) ---\n");
console.log(`
  import { createPublicClient, type Hex, http } from "viem";
  import {
    Graph,
    personalSpace,
    getSmartAccountWalletClient,
    SpaceRegistryAbi,
    TESTNET_RPC_URL,
  } from "@geoprotocol/geo-sdk";
  import { TESTNET } from "@geoprotocol/geo-sdk/contracts";

  // Get smart account wallet client (Safe + Pimlico paymaster)
  const smartAccount = await getSmartAccountWalletClient({ privateKey });
  const smartAccountAddress = smartAccount.account.address;

  // Check if personal space exists
  const hasSpace = await personalSpace.hasSpace({ address: smartAccountAddress });
  if (!hasSpace) {
    const { to, calldata } = personalSpace.createSpace();
    await smartAccount.sendTransaction({ to, data: calldata });
  }

  // Look up space ID
  const publicClient = createPublicClient({ transport: http(TESTNET_RPC_URL) });
  const spaceIdHex = await publicClient.readContract({
    address: TESTNET.SPACE_REGISTRY_ADDRESS,
    abi: SpaceRegistryAbi,
    functionName: "addressToSpaceId",
    args: [smartAccountAddress],
  });
  const spaceId = spaceIdHex.slice(2, 34).toLowerCase();

  // Publish to IPFS and get calldata
  const { cid, editId, to, calldata } = await personalSpace.publishEdit({
    name: "My Edit",
    spaceId,
    ops,
    author: smartAccountAddress,
    network: "TESTNET",
  });

  // Submit on-chain (gas-free!)
  const txHash = await smartAccount.sendTransaction({ to, data: calldata });
`);

// =============================================================================
// WHAT'S NEXT?
// =============================================================================
console.log("\n--- What's Next? ---");
console.log("Personal spaces are great for individual data. But what about");
console.log("collaborative knowledge? Course 9 introduces DAO SPACES with");
console.log("community governance and voting.");
console.log("\nRun: npm run course9");
