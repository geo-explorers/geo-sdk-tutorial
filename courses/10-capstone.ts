/**
 * ============================================================================
 * CAPSTONE PROJECT: Collaborative Recipe Book
 * ============================================================================
 *
 * OBJECTIVE: Build a complete application that combines ALL concepts from
 * the Geo SDK curriculum - from IDs to DAO governance.
 *
 * YOU WILL BUILD:
 * - Schema Design: Recipe, Ingredient, Chef types with properties
 * - Entity Creation: Recipes with ingredients and chef relations
 * - Personal Space: Users create their own recipes
 * - DAO Space: Community votes on featured recipes
 * - Smart Accounts: Easy onboarding with gas sponsorship
 *
 * REQUIREMENTS:
 * - Set PRIVATE_KEY environment variable (export from https://www.geobrowser.io/export-wallet)
 * - Optionally set DAO_SPACE_ADDRESS and DAO_SPACE_ID for DAO proposal demo
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
import type { Op, Id } from "@geoprotocol/geo-sdk";

console.log("╔═══════════════════════════════════════════════════════════════╗");
console.log("║        CAPSTONE PROJECT: Collaborative Recipe Book           ║");
console.log("╚═══════════════════════════════════════════════════════════════╝\n");

// =============================================================================
// PART 1: SCHEMA DESIGN
// =============================================================================

console.log("═══════════════════════════════════════════════════════════════");
console.log("  PART 1: Schema Design");
console.log("═══════════════════════════════════════════════════════════════\n");

interface SchemaResult {
  properties: {
    recipeName: Id;
    description: Id;
    prepTime: Id;
    cookTime: Id;
    servings: Id;
    difficulty: Id;
    instructions: Id;
    ingredientName: Id;
    quantity: Id;
    unit: Id;
    chefName: Id;
    bio: Id;
    specialty: Id;
    relationName: Id;
  };
  types: {
    recipe: Id;
    ingredient: Id;
    chef: Id;
    relationType: Id;
  };
  relationTypes: {
    uses: Id;
    createdBy: Id;
  };
  ops: Op[];
}

function createRecipeBookSchema(): SchemaResult {
  console.log("Creating properties for Recipe Book...\n");

  const allOps: Op[] = [];

  // ========== RECIPE PROPERTIES ==========
  const recipeNameResult = Graph.createProperty({ name: "Recipe Name", dataType: "TEXT" });
  const descriptionResult = Graph.createProperty({ name: "Description", dataType: "TEXT" });
  const prepTimeResult = Graph.createProperty({ name: "Prep Time (min)", dataType: "INT64" });
  const cookTimeResult = Graph.createProperty({ name: "Cook Time (min)", dataType: "INT64" });
  const servingsResult = Graph.createProperty({ name: "Servings", dataType: "INT64" });
  const difficultyResult = Graph.createProperty({ name: "Difficulty", dataType: "TEXT" });
  const instructionsResult = Graph.createProperty({ name: "Instructions", dataType: "TEXT" });

  // Ingredient properties
  const ingredientNameResult = Graph.createProperty({ name: "Ingredient Name", dataType: "TEXT" });
  const quantityResult = Graph.createProperty({ name: "Quantity", dataType: "FLOAT64" });
  const unitResult = Graph.createProperty({ name: "Unit", dataType: "TEXT" });

  // Chef properties
  const chefNameResult = Graph.createProperty({ name: "Chef Name", dataType: "TEXT" });
  const bioResult = Graph.createProperty({ name: "Bio", dataType: "TEXT" });
  const specialtyResult = Graph.createProperty({ name: "Specialty", dataType: "TEXT" });

  // Relation properties
  const relationNameResult = Graph.createProperty({ name: "Relation Name", dataType: "TEXT" });

  // Collect property ops
  allOps.push(
    ...recipeNameResult.ops,
    ...descriptionResult.ops,
    ...prepTimeResult.ops,
    ...cookTimeResult.ops,
    ...servingsResult.ops,
    ...difficultyResult.ops,
    ...instructionsResult.ops,
    ...ingredientNameResult.ops,
    ...quantityResult.ops,
    ...unitResult.ops,
    ...chefNameResult.ops,
    ...bioResult.ops,
    ...specialtyResult.ops,
    ...relationNameResult.ops
  );

  console.log(`  ✓ Created 14 properties`);

  // ========== TYPES ==========
  console.log("\nCreating types...\n");

  const recipeTypeResult = Graph.createType({
    name: "Recipe",
    properties: [
      recipeNameResult.id,
      descriptionResult.id,
      prepTimeResult.id,
      cookTimeResult.id,
      servingsResult.id,
      difficultyResult.id,
      instructionsResult.id,
    ],
  });

  const ingredientTypeResult = Graph.createType({
    name: "Ingredient",
    properties: [ingredientNameResult.id, quantityResult.id, unitResult.id],
  });

  const chefTypeResult = Graph.createType({
    name: "Chef",
    properties: [chefNameResult.id, bioResult.id, specialtyResult.id],
  });

  const relationTypeResult = Graph.createType({
    name: "Relation Type",
    properties: [relationNameResult.id],
  });

  // Collect type ops
  allOps.push(
    ...recipeTypeResult.ops,
    ...ingredientTypeResult.ops,
    ...chefTypeResult.ops,
    ...relationTypeResult.ops
  );

  console.log("  ✓ Recipe Type (7 properties)");
  console.log("  ✓ Ingredient Type (3 properties)");
  console.log("  ✓ Chef Type (3 properties)");
  console.log("  ✓ Relation Type (1 property)");

  // ========== RELATION TYPES ==========
  console.log("\nCreating relation types...\n");

  const usesRelationResult = Graph.createEntity({
    name: "Uses Ingredient",
    types: [relationTypeResult.id],
    values: [
      { property: relationNameResult.id, type: "text", value: "Uses Ingredient" },
    ],
  });

  const createdByRelationResult = Graph.createEntity({
    name: "Created By",
    types: [relationTypeResult.id],
    values: [
      { property: relationNameResult.id, type: "text", value: "Created By" },
    ],
  });

  // Collect relation type ops
  allOps.push(...usesRelationResult.ops, ...createdByRelationResult.ops);

  console.log("  ✓ 'Uses Ingredient' relation type");
  console.log("  ✓ 'Created By' relation type");

  console.log(`
  ┌─────────────────────────────────────────────────────────────────┐
  │                    RECIPE BOOK SCHEMA                           │
  ├─────────────────────────────────────────────────────────────────┤
  │                                                                 │
  │  ┌───────────────┐     Created By     ┌───────────────┐         │
  │  │    Recipe     │◄───────────────────│     Chef      │         │
  │  ├───────────────┤                    ├───────────────┤         │
  │  │ - Name        │                    │ - Name        │         │
  │  │ - Description │                    │ - Bio         │         │
  │  │ - Prep Time   │                    │ - Specialty   │         │
  │  │ - Cook Time   │                    └───────────────┘         │
  │  │ - Servings    │                                              │
  │  │ - Difficulty  │                                              │
  │  │ - Instructions│                                              │
  │  └───────┬───────┘                                              │
  │          │                                                      │
  │          │ Uses Ingredient                                      │
  │          ▼                                                      │
  │  ┌───────────────┐                                              │
  │  │  Ingredient   │                                              │
  │  ├───────────────┤                                              │
  │  │ - Name        │                                              │
  │  │ - Quantity    │                                              │
  │  │ - Unit        │                                              │
  │  └───────────────┘                                              │
  │                                                                 │
  └─────────────────────────────────────────────────────────────────┘
  `);

  return {
    properties: {
      recipeName: recipeNameResult.id,
      description: descriptionResult.id,
      prepTime: prepTimeResult.id,
      cookTime: cookTimeResult.id,
      servings: servingsResult.id,
      difficulty: difficultyResult.id,
      instructions: instructionsResult.id,
      ingredientName: ingredientNameResult.id,
      quantity: quantityResult.id,
      unit: unitResult.id,
      chefName: chefNameResult.id,
      bio: bioResult.id,
      specialty: specialtyResult.id,
      relationName: relationNameResult.id,
    },
    types: {
      recipe: recipeTypeResult.id,
      ingredient: ingredientTypeResult.id,
      chef: chefTypeResult.id,
      relationType: relationTypeResult.id,
    },
    relationTypes: {
      uses: usesRelationResult.id,
      createdBy: createdByRelationResult.id,
    },
    ops: allOps,
  };
}

const schema = createRecipeBookSchema();

// =============================================================================
// PART 2: CREATE A COMPLETE RECIPE WITH RELATIONS
// =============================================================================

console.log("═══════════════════════════════════════════════════════════════");
console.log("  PART 2: Creating a Recipe with Relations");
console.log("═══════════════════════════════════════════════════════════════\n");

interface RecipeResult {
  recipeId: Id;
  chefId: Id;
  ingredientIds: Id[];
  ops: Op[];
}

function createRecipe(
  schemaData: SchemaResult,
  recipe: {
    name: string;
    description: string;
    prepTime: number;
    cookTime: number;
    servings: number;
    difficulty: string;
    instructions: string;
  },
  ingredients: Array<{ name: string; quantity: number; unit: string }>,
  chef: { name: string; bio: string; specialty: string }
): RecipeResult {
  const { properties, types, relationTypes } = schemaData;
  const allOps: Op[] = [];

  console.log(`Creating recipe: "${recipe.name}"\n`);

  // ========== CREATE CHEF ==========
  const chefResult = Graph.createEntity({
    name: chef.name,
    types: [types.chef],
    values: [
      { property: properties.chefName, type: "text", value: chef.name },
      { property: properties.bio, type: "text", value: chef.bio },
      { property: properties.specialty, type: "text", value: chef.specialty },
    ],
  });
  allOps.push(...chefResult.ops);
  console.log(`  ✓ Chef: ${chef.name}`);

  // ========== CREATE RECIPE ==========
  const recipeResult = Graph.createEntity({
    name: recipe.name,
    types: [types.recipe],
    values: [
      { property: properties.recipeName, type: "text", value: recipe.name },
      { property: properties.description, type: "text", value: recipe.description },
      { property: properties.prepTime, type: "int64", value: recipe.prepTime },
      { property: properties.cookTime, type: "int64", value: recipe.cookTime },
      { property: properties.servings, type: "int64", value: recipe.servings },
      { property: properties.difficulty, type: "text", value: recipe.difficulty },
      { property: properties.instructions, type: "text", value: recipe.instructions },
    ],
  });
  allOps.push(...recipeResult.ops);
  console.log(`  ✓ Recipe: ${recipe.name}`);

  // ========== CONNECT RECIPE TO CHEF ==========
  const recipeToChefRelation = Graph.createRelation({
    fromEntity: recipeResult.id,
    toEntity: chefResult.id,
    type: relationTypes.createdBy,
  });
  allOps.push(...recipeToChefRelation.ops);
  console.log(`  ✓ Relation: Recipe --[Created By]--> Chef`);

  // ========== CREATE INGREDIENTS AND RELATIONS ==========
  console.log(`\n  Creating ${ingredients.length} ingredients...`);

  const ingredientIds: Id[] = [];
  for (const ing of ingredients) {
    const ingResult = Graph.createEntity({
      name: ing.name,
      types: [types.ingredient],
      values: [
        { property: properties.ingredientName, type: "text", value: ing.name },
        { property: properties.quantity, type: "float64", value: ing.quantity },
        { property: properties.unit, type: "text", value: ing.unit },
      ],
    });
    ingredientIds.push(ingResult.id);
    allOps.push(...ingResult.ops);

    const recipeToIngRelation = Graph.createRelation({
      fromEntity: recipeResult.id,
      toEntity: ingResult.id,
      type: relationTypes.uses,
    });
    allOps.push(...recipeToIngRelation.ops);

    console.log(`    ✓ ${ing.quantity} ${ing.unit} ${ing.name}`);
  }

  return {
    recipeId: recipeResult.id,
    chefId: chefResult.id,
    ingredientIds,
    ops: allOps,
  };
}

// Create a delicious recipe!
const margheritaPizza = createRecipe(
  schema,
  {
    name: "Classic Margherita Pizza",
    description: "A traditional Italian pizza with fresh tomatoes, mozzarella, and basil",
    prepTime: 30,
    cookTime: 15,
    servings: 4,
    difficulty: "medium",
    instructions: `
1. Prepare the dough and let it rise for 1 hour
2. Preheat oven to 475°F (245°C)
3. Stretch dough into a 12-inch circle
4. Spread crushed tomatoes evenly
5. Add torn mozzarella pieces
6. Drizzle with olive oil
7. Bake for 12-15 minutes until crust is golden
8. Top with fresh basil leaves
9. Slice and serve immediately`.trim(),
  },
  [
    { name: "Pizza Dough", quantity: 1, unit: "ball" },
    { name: "San Marzano Tomatoes", quantity: 1, unit: "cup" },
    { name: "Fresh Mozzarella", quantity: 8, unit: "oz" },
    { name: "Fresh Basil", quantity: 10, unit: "leaves" },
    { name: "Extra Virgin Olive Oil", quantity: 2, unit: "tbsp" },
    { name: "Sea Salt", quantity: 1, unit: "pinch" },
  ],
  {
    name: "Chef Maria",
    bio: "Italian cuisine expert with 20 years of experience",
    specialty: "Neapolitan Pizza",
  }
);

// =============================================================================
// PART 3: PUBLISH TO PERSONAL SPACE
// =============================================================================

console.log("\n═══════════════════════════════════════════════════════════════");
console.log("  PART 3: Publishing to Personal Space");
console.log("═══════════════════════════════════════════════════════════════\n");

interface PublishResult {
  success: boolean;
  spaceId?: string;
  editId?: string;
  cid?: string;
  txHash?: string;
  error?: string;
}

async function publishRecipeToPersonalSpace(
  schemaOps: Op[],
  recipeOps: Op[],
  privateKey: `0x${string}`
): Promise<PublishResult> {
  const allOperations = [...schemaOps, ...recipeOps];

  console.log(`Publishing ${allOperations.length} operations...\n`);

  try {
    // Step 1: Create smart account
    console.log("[1/4] Creating smart account...");
    const smartAccount = await getSmartAccountWalletClient({ privateKey });
    const smartAccountAddress = smartAccount.account.address;
    console.log(`  ✓ Smart Account: ${smartAccountAddress.slice(0, 15)}...${smartAccountAddress.slice(-6)}`);
    console.log("  ✓ Gas sponsorship: ENABLED");

    // Create public client
    const publicClient = createPublicClient({
      transport: http(TESTNET_RPC_URL),
    });

    // Step 2: Check/create personal space
    console.log("\n[2/4] Checking personal space...");
    const hasSpace = await personalSpace.hasSpace({ address: smartAccountAddress });

    if (!hasSpace) {
      console.log("  Creating personal space...");
      const { to, calldata } = personalSpace.createSpace();
      const createTx = await smartAccount.sendTransaction({ to, data: calldata });
      await publicClient.waitForTransactionReceipt({ hash: createTx });
      console.log(`  ✓ Personal space created`);
    } else {
      console.log("  ✓ Personal space exists");
    }

    // Look up space ID
    const spaceIdHex = (await publicClient.readContract({
      address: TESTNET.SPACE_REGISTRY_ADDRESS,
      abi: SpaceRegistryAbi,
      functionName: "addressToSpaceId",
      args: [smartAccountAddress],
    })) as Hex;
    const spaceId = spaceIdHex.slice(2, 34).toLowerCase();
    console.log(`  ✓ Space ID: ${spaceId}`);

    // Step 3: Publish to IPFS
    console.log("\n[3/4] Publishing to IPFS...");
    const { cid, editId, to, calldata } = await personalSpace.publishEdit({
      name: "Recipe Book: Classic Margherita Pizza",
      spaceId,
      ops: allOperations,
      author: smartAccountAddress,
      network: "TESTNET",
    });
    console.log(`  ✓ Edit ID: ${editId}`);
    console.log(`  ✓ CID: ${cid}`);

    // Step 4: Submit on-chain
    console.log("\n[4/4] Submitting to blockchain...");
    const txHash = await smartAccount.sendTransaction({ to, data: calldata });
    console.log(`  ✓ Transaction: ${txHash}`);

    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    console.log(`  ✓ Confirmed in block ${receipt.blockNumber}`);

    return {
      success: true,
      spaceId,
      editId,
      cid,
      txHash,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`\n[ERROR] Publishing failed: ${errorMessage}`);
    return { success: false, error: errorMessage };
  }
}

// =============================================================================
// PART 4: PROPOSE TO COMMUNITY DAO
// =============================================================================

console.log("═══════════════════════════════════════════════════════════════");
console.log("  PART 4: Proposing to Community Recipe DAO");
console.log("═══════════════════════════════════════════════════════════════\n");

interface DAOProposalResult {
  success: boolean;
  proposalId?: string;
  editId?: string;
  cid?: string;
  txHash?: string;
  error?: string;
}

async function proposeRecipeToDAO(
  schemaOps: Op[],
  recipeOps: Op[],
  daoSpaceAddress: `0x${string}`,
  daoSpaceId: `0x${string}`,
  privateKey: `0x${string}`
): Promise<DAOProposalResult> {
  const allOperations = [...schemaOps, ...recipeOps];

  console.log("Creating proposal for community featured recipes...\n");

  try {
    // Step 1: Get smart account
    console.log("[1/3] Preparing proposal...");
    const smartAccount = await getSmartAccountWalletClient({ privateKey });
    const contributorAddress = smartAccount.account.address;
    console.log(`  ✓ Contributor: ${contributorAddress.slice(0, 15)}...${contributorAddress.slice(-6)}`);

    // Create public client
    const publicClient = createPublicClient({
      transport: http(TESTNET_RPC_URL),
    });

    // Look up caller's space ID
    const hasSpace = await personalSpace.hasSpace({ address: contributorAddress });
    if (!hasSpace) {
      throw new Error("Must have a personal space to propose to DAO");
    }

    const callerSpaceIdHex = (await publicClient.readContract({
      address: TESTNET.SPACE_REGISTRY_ADDRESS,
      abi: SpaceRegistryAbi,
      functionName: "addressToSpaceId",
      args: [contributorAddress],
    })) as Hex;
    const callerSpaceId = callerSpaceIdHex.slice(0, 34).toLowerCase() as `0x${string}`;
    console.log(`  ✓ Caller Space: ${callerSpaceId}`);

    // Step 2: Create proposal
    console.log("\n[2/3] Submitting to DAO...");
    const { editId, cid, to, calldata, proposalId } = await daoSpace.proposeEdit({
      name: "Add Classic Margherita Pizza Recipe",
      ops: allOperations,
      author: contributorAddress,
      daoSpaceAddress,
      callerSpaceId,
      daoSpaceId,
      votingMode: "FAST",
      network: "TESTNET",
    });

    console.log(`  ✓ Edit ID: ${editId}`);
    console.log(`  ✓ CID: ${cid}`);
    console.log(`  ✓ Proposal ID: ${proposalId}`);

    // Step 3: Submit proposal transaction
    console.log("\n[3/3] Submitting proposal transaction...");
    const txHash = await smartAccount.sendTransaction({ to, data: calldata });
    console.log(`  ✓ Transaction: ${txHash}`);

    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    console.log(`  ✓ Confirmed in block ${receipt.blockNumber}`);

    return {
      success: true,
      proposalId,
      editId,
      cid,
      txHash,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`\n[ERROR] Proposal failed: ${errorMessage}`);
    return { success: false, error: errorMessage };
  }
}

// =============================================================================
// RUN THE CAPSTONE
// =============================================================================

const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}` | undefined;
const DAO_SPACE_ADDRESS = process.env.DAO_SPACE_ADDRESS as `0x${string}` | undefined;
const DAO_SPACE_ID = process.env.DAO_SPACE_ID as `0x${string}` | undefined;

let personalResult: PublishResult = { success: false };
let daoProposalResult: DAOProposalResult = { success: false };

if (!PRIVATE_KEY) {
  console.log(`
  ┌─────────────────────────────────────────────────────────────┐
  │                    CONFIGURATION NEEDED                     │
  ├─────────────────────────────────────────────────────────────┤
  │                                                             │
  │  To run the full capstone, set these environment variables: │
  │                                                             │
  │  export PRIVATE_KEY="0x..."                                 │
  │                                                             │
  │  Optionally for DAO proposal:                               │
  │  export DAO_SPACE_ADDRESS="0x..."                           │
  │  export DAO_SPACE_ID="0x..."                                │
  │                                                             │
  │  Get your private key from:                                 │
  │  https://www.geobrowser.io/export-wallet                    │
  │                                                             │
  │  Schema and recipe created successfully (${schema.ops.length + margheritaPizza.ops.length} operations)   │
  │  Skipping live blockchain interactions...                   │
  │                                                             │
  └─────────────────────────────────────────────────────────────┘
  `);
} else {
  // Publish to personal space
  personalResult = await publishRecipeToPersonalSpace(
    schema.ops,
    margheritaPizza.ops,
    PRIVATE_KEY
  );

  // Optionally propose to DAO
  if (personalResult.success && DAO_SPACE_ADDRESS && DAO_SPACE_ID) {
    console.log("\n");
    daoProposalResult = await proposeRecipeToDAO(
      schema.ops,
      margheritaPizza.ops,
      DAO_SPACE_ADDRESS,
      DAO_SPACE_ID,
      PRIVATE_KEY
    );
  }
}

// =============================================================================
// FINAL SUMMARY
// =============================================================================

const totalOps = schema.ops.length + margheritaPizza.ops.length;

console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                    CAPSTONE COMPLETE!                             ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Schema Created:                                                  ║
║  ───────────────                                                  ║
║  • 14 Properties                                                  ║
║  • 4 Types (Recipe, Ingredient, Chef, Relation)                   ║
║  • 2 Relation Types (Uses, Created By)                            ║
║                                                                   ║
║  Recipe Knowledge Graph:                                          ║
║  ───────────────────────                                          ║
║                                                                   ║
║         ┌────────────────────┐                                    ║
║         │    Chef Maria      │                                    ║
║         │      (Chef)        │                                    ║
║         └─────────▲──────────┘                                    ║
║                   │ Created By                                    ║
║         ┌─────────┴──────────┐                                    ║
║         │ Margherita Pizza   │                                    ║
║         │     (Recipe)       │                                    ║
║         └──┬──┬──┬──┬──┬──┬──┘                                    ║
║            │  │  │  │  │  │  Uses                                 ║
║            ▼  ▼  ▼  ▼  ▼  ▼                                       ║
║         [6 Ingredients]                                           ║
║                                                                   ║
║  Total Operations: ${String(totalOps).padEnd(47)}║
${personalResult.success ? `║  Personal Space: ${(personalResult.spaceId || "").padEnd(43)}║` : "║  Personal Space: (not published)                                  ║"}
${daoProposalResult.success ? `║  DAO Proposal: ${(daoProposalResult.proposalId || "").padEnd(45)}║` : "║  DAO Proposal: (not submitted)                                    ║"}
║                                                                   ║
║  Gas Used: $0 (Smart Account with sponsorship)                    ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝

                    CONGRATULATIONS!

  You've successfully completed the Geo SDK curriculum and built
  a complete decentralized application that:

  ✓ Designs schemas with properties, types, and relations
  ✓ Creates interconnected entities forming a knowledge graph
  ✓ Publishes to IPFS and personal spaces
  ✓ Uses smart accounts with gas sponsorship
  ✓ Proposes changes to DAO-governed spaces

  You're now ready to build real applications on The Graph's
  Knowledge Graph network!

  Resources:
  ──────────
  • Geo SDK: https://github.com/geobrowser/geo-sdk
  • Geo Browser: https://geobrowser.io
  • The Graph: https://thegraph.com

`);
