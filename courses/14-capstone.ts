/**
 * ============================================================================
 * COURSE 14: CAPSTONE PROJECT - Collaborative Recipe Book
 * ============================================================================
 *
 * OBJECTIVE: Build a complete application that combines ALL concepts from
 * the Geo SDK curriculum - from reading data to DAO governance.
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
 * - Optionally set DAO_SPACE_ID for DAO proposal demo
 *
 * NOTE: This capstone uses the shared utilities from src/functions.ts.
 * See that file for the full implementation details of publishOps().
 *
 * ============================================================================
 */

import "dotenv/config";
import { Graph } from "@geoprotocol/geo-sdk";
import type { Op, Id } from "@geoprotocol/geo-sdk";

// Import shared utilities - see src/functions.ts for implementation details
import {
  publishOps,
  printOpsSummary,
  type PublishResult,
  prompt,
  promptProperty,
  promptType,
  queryEntityByName,
} from "../src/functions.js";

console.log("╔═══════════════════════════════════════════════════════════════╗");
console.log("║   COURSE 14: CAPSTONE PROJECT - Collaborative Recipe Book    ║");
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

async function createRecipeBookSchema(): Promise<SchemaResult> {
  console.log("Creating properties for Recipe Book...\n");

  /**
   * NOTE: Unlike earlier courses where we reuse root space types (TYPES.person,
   * TYPES.project, etc.), this capstone creates CUSTOM types and properties
   * because we're building a domain-specific Recipe Book application.
   *
   * When to REUSE (from root space):
   * - Generic concepts that exist: Person, Project, Topic, Organization
   * - Common properties: name, description, web_url
   *
   * When to CREATE NEW:
   * - Domain-specific types: Recipe, Ingredient, Chef
   * - Domain-specific properties: Prep Time, Servings, Difficulty
   */

  const allOps: Op[] = [];

  // ========== RECIPE PROPERTIES ==========
  const recipeNameResult = await promptProperty("Recipe Name");
  const descriptionResult = await promptProperty("Description");
  const prepTimeResult = await promptProperty("Prep Time (min)");
  const cookTimeResult = await promptProperty("Cook Time (min)");
  const servingsResult = await promptProperty("Servings");
  const difficultyResult = await promptProperty("Difficulty");
  const instructionsResult = await promptProperty("Instructions");

  // Ingredient properties
  const ingredientNameResult = await promptProperty("Ingredient Name");
  const quantityResult = await promptProperty("Quantity");
  const unitResult = await promptProperty("Unit");

  // Chef properties
  const chefNameResult = await promptProperty("Chef Name");
  const bioResult = await promptProperty("Bio");
  const specialtyResult = await promptProperty("Specialty");

  // Relation properties
  const relationNameResult = await promptProperty("Relation Name");

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

  console.log(`  Created 14 properties`);

  // ========== TYPES ==========
  console.log("\nCreating types...\n");

  const recipeTypeResult = await promptType("Recipe", [
    recipeNameResult.id,
    descriptionResult.id,
    prepTimeResult.id,
    cookTimeResult.id,
    servingsResult.id,
    difficultyResult.id,
    instructionsResult.id,
  ]);
  const ingredientTypeResult = await promptType("Ingredient", [
    ingredientNameResult.id,
    quantityResult.id,
    unitResult.id,
  ]);
  const chefTypeResult = await promptType("Chef", [
    chefNameResult.id,
    bioResult.id,
    specialtyResult.id,
  ]);
  const relationTypeResult = await promptType("Relation Type", [relationNameResult.id]);

  // Collect type ops
  allOps.push(
    ...recipeTypeResult.ops,
    ...ingredientTypeResult.ops,
    ...chefTypeResult.ops,
    ...relationTypeResult.ops
  );

  console.log(`  Recipe Type (7 properties)`);
  console.log(`  Ingredient Type (3 properties)`);
  console.log(`  Chef Type (3 properties)`);
  console.log(`  Relation Type (1 property)`);

  // ========== RELATION TYPES ==========
  console.log("\nCreating relation types...\n");

  let usesRelationName = await prompt("Enter relation type name (e.g. Uses Ingredient): ");
  while (await queryEntityByName(usesRelationName)) {
    console.warn(`  ⚠ "${usesRelationName}" already exists. Please enter a different name.`);
    usesRelationName = await prompt("Enter a different name: ");
  }
  const usesRelationResult = Graph.createEntity({
    name: usesRelationName,
    types: [relationTypeResult.id],
    values: [
      { property: relationNameResult.id, type: "text", value: usesRelationName },
    ],
  });

  let createdByRelationName = await prompt("Enter relation type name (e.g. Created By): ");
  while (await queryEntityByName(createdByRelationName)) {
    console.warn(`  ⚠ "${createdByRelationName}" already exists. Please enter a different name.`);
    createdByRelationName = await prompt("Enter a different name: ");
  }
  const createdByRelationResult = Graph.createEntity({
    name: createdByRelationName,
    types: [relationTypeResult.id],
    values: [
      { property: relationNameResult.id, type: "text", value: createdByRelationName },
    ],
  });

  // Collect relation type ops
  allOps.push(...usesRelationResult.ops, ...createdByRelationResult.ops);

  console.log(`  '${usesRelationName}' relation type`);
  console.log(`  '${createdByRelationName}' relation type`);

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

const schema = await createRecipeBookSchema();

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

async function createRecipe(
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
): Promise<RecipeResult> {
  const { properties, types, relationTypes } = schemaData;
  const allOps: Op[] = [];

  console.log(`Creating recipe: "${recipe.name}"\n`);

  // ========== CREATE CHEF ==========
  let chefName = chef.name;
  while (await queryEntityByName(chefName)) {
    console.warn(`  ⚠ "${chefName}" already exists. Please enter a different name.`);
    chefName = await prompt("Enter a different chef name: ");
  }
  const chefResult = Graph.createEntity({
    name: chefName,
    types: [types.chef],
    values: [
      { property: properties.chefName, type: "text", value: chefName },
      { property: properties.bio, type: "text", value: chef.bio },
      { property: properties.specialty, type: "text", value: chef.specialty },
    ],
  });
  allOps.push(...chefResult.ops);
  console.log(`  Chef: ${chefName}`);

  // ========== CREATE RECIPE ==========
  let recipeName = recipe.name;
  while (await queryEntityByName(recipeName)) {
    console.warn(`  ⚠ "${recipeName}" already exists. Please enter a different name.`);
    recipeName = await prompt("Enter a different recipe name: ");
  }
  const recipeResult = Graph.createEntity({
    name: recipeName,
    types: [types.recipe],
    values: [
      { property: properties.recipeName, type: "text", value: recipeName },
      { property: properties.description, type: "text", value: recipe.description },
      { property: properties.prepTime, type: "int64", value: recipe.prepTime },
      { property: properties.cookTime, type: "int64", value: recipe.cookTime },
      { property: properties.servings, type: "int64", value: recipe.servings },
      { property: properties.difficulty, type: "text", value: recipe.difficulty },
      { property: properties.instructions, type: "text", value: recipe.instructions },
    ],
  });
  allOps.push(...recipeResult.ops);
  console.log(`  Recipe: ${recipeName}`);

  // ========== CONNECT RECIPE TO CHEF ==========
  const recipeToChefRelation = Graph.createRelation({
    fromEntity: recipeResult.id,
    toEntity: chefResult.id,
    type: relationTypes.createdBy,
  });
  allOps.push(...recipeToChefRelation.ops);
  console.log(`  Relation: Recipe --[Created By]--> Chef`);

  // ========== CREATE INGREDIENTS AND RELATIONS ==========
  console.log(`\n  Creating ${ingredients.length} ingredients...`);

  const ingredientIds: Id[] = [];
  for (const ing of ingredients) {
    let ingName = ing.name;
    while (await queryEntityByName(ingName)) {
      console.warn(`  ⚠ "${ingName}" already exists. Please enter a different name.`);
      ingName = await prompt(`Enter a different name for ingredient "${ing.name}": `);
    }
    const ingResult = Graph.createEntity({
      name: ingName,
      types: [types.ingredient],
      values: [
        { property: properties.ingredientName, type: "text", value: ingName },
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

    console.log(`    ${ing.quantity} ${ing.unit} ${ingName}`);
  }

  return {
    recipeId: recipeResult.id,
    chefId: chefResult.id,
    ingredientIds,
    ops: allOps,
  };
}

// Create a delicious recipe!
const margheritaPizza = await createRecipe(
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

/**
 * Publish recipe to personal space using the shared helper.
 *
 * The publishOps() function handles:
 * 1. Creating smart account wallet client (gas-sponsored by default)
 * 2. Checking if personal space exists, creating if not
 * 3. Looking up space ID from registry
 * 4. Publishing to IPFS via personalSpace.publishEdit()
 * 5. Submitting transaction on-chain
 */
async function publishRecipeToPersonalSpace(
  schemaOps: Op[],
  recipeOps: Op[],
  privateKey: `0x${string}`
): Promise<PublishResult> {
  const allOperations = [...schemaOps, ...recipeOps];

  console.log(`Publishing ${allOperations.length} operations...`);
  console.log("\nUsing publishOps() helper from src/functions.ts\n");

  const result = await publishOps({
    ops: allOperations,
    editName: "Recipe Book: Classic Margherita Pizza",
    privateKey,
    useSmartAccount: true, // Gas-sponsored
    network: "TESTNET",
  });

  if (result.success) {
    console.log(`  Space ID: ${result.spaceId}`);
    console.log(`  Edit ID: ${result.editId}`);
    console.log(`  CID: ${result.cid}`);
    console.log(`  Transaction: ${result.transactionHash}`);
  } else {
    console.error(`\n[ERROR] Publishing failed: ${result.error}`);
  }

  return result;
}

// =============================================================================
// PART 4: PROPOSE TO COMMUNITY DAO
// =============================================================================

console.log("═══════════════════════════════════════════════════════════════");
console.log("  PART 4: Proposing to Community Recipe DAO");
console.log("═══════════════════════════════════════════════════════════════\n");

/**
 * Propose recipe to DAO using the shared helper.
 *
 * The publishOps() function auto-detects DAO spaces and:
 * 1. Queries the API to detect space type
 * 2. Looks up caller's personal space ID
 * 3. Verifies caller is member/editor of DAO
 * 4. Uses daoSpace.proposeEdit() for DAO spaces
 * 5. Submits the proposal transaction
 */
async function proposeRecipeToDAO(
  schemaOps: Op[],
  recipeOps: Op[],
  daoSpaceId: string,
  privateKey: `0x${string}`
): Promise<PublishResult> {
  const allOperations = [...schemaOps, ...recipeOps];

  console.log("Creating proposal for community featured recipes...");
  console.log("\nUsing publishOps() helper (auto-detects DAO space)\n");

  const result = await publishOps({
    ops: allOperations,
    editName: "Add Classic Margherita Pizza Recipe",
    privateKey,
    spaceId: daoSpaceId, // Target the DAO space
    useSmartAccount: true, // Gas-sponsored
    network: "TESTNET",
  });

  if (result.success) {
    console.log(`  Edit ID: ${result.editId}`);
    console.log(`  CID: ${result.cid}`);
    console.log(`  Transaction: ${result.transactionHash}`);
  } else {
    console.error(`\n[ERROR] Proposal failed: ${result.error}`);
  }

  return result;
}

// =============================================================================
// OPERATION SUMMARY
// =============================================================================

console.log("--- Operation Summary ---\n");
const allOperations = [...schema.ops, ...margheritaPizza.ops];
printOpsSummary(allOperations);

// =============================================================================
// RUN THE CAPSTONE
// =============================================================================

const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}` | undefined;
const DAO_SPACE_ID = process.env.DAO_SPACE_ID as string | undefined;

let personalResult: PublishResult = { success: false };
let daoProposalResult: PublishResult = { success: false };

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
  │  export DAO_SPACE_ID="..."  # 32-char hex (no dashes)       │
  │                                                             │
  │  Get your private key from:                                 │
  │  https://www.geobrowser.io/export-wallet                    │
  │                                                             │
  │  Schema and recipe created successfully (${allOperations.length} operations)   │
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
  if (personalResult.success && DAO_SPACE_ID) {
    console.log("\n");
    daoProposalResult = await proposeRecipeToDAO(
      schema.ops,
      margheritaPizza.ops,
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
║  - 14 Properties                                                  ║
║  - 4 Types (Recipe, Ingredient, Chef, Relation)                   ║
║  - 2 Relation Types (Uses, Created By)                            ║
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
${daoProposalResult.success ? `║  DAO Proposal: ${(daoProposalResult.editId || "").padEnd(45)}║` : "║  DAO Proposal: (not submitted)                                    ║"}
║                                                                   ║
║  Gas Used: $0 (Smart Account with sponsorship)                    ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
`);

// =============================================================================
// CURRICULUM COMPLETE!
// =============================================================================

console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                    CURRICULUM COMPLETE!                           ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Congratulations! You've completed all 14 courses!                ║
║                                                                   ║
║  PHASE 1 - FOUNDATION (Courses 1-3):                              ║
║  ────────────────────────────────────                             ║
║  - Knowledge Graph Overview & Architecture                        ║
║  - Reading Data with GraphQL                                      ║
║  - Core Concepts: IDs, Properties, Types, Entities, Relations     ║
║                                                                   ║
║  PHASE 2 - CREATING DATA (Courses 4-7):                           ║
║  ────────────────────────────────────                             ║
║  - Schemas (Properties + Types)                                   ║
║  - Entities & Values                                              ║
║  - Relations & Graph Building                                     ║
║  - Operations & Edits                                             ║
║                                                                   ║
║  PHASE 3 - PUBLISHING (Courses 8-10):                             ║
║  ─────────────────────────────────────                            ║
║  - Publishing to Personal Spaces                                  ║
║  - Smart Accounts with Gas Sponsorship                            ║
║  - DAO Governance & Proposals                                     ║
║                                                                   ║
║  PHASE 4 - ADVANCED PATTERNS (Courses 11-13):                     ║
║  ─────────────────────────────────────────                        ║
║  - Text/Data/Image Blocks                                         ║
║  - Updates & Deletes                                              ║
║  - Batch Import                                                   ║
║                                                                   ║
║  PHASE 5 - CAPSTONE (Course 14):                                  ║
║  ────────────────────────────────                                 ║
║  - Complete Recipe Book Application                               ║
║                                                                   ║
║  You're now ready to build production-grade applications on       ║
║  the Geo Knowledge Graph!                                         ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝

  Resources:
  ──────────
  - Geo SDK: https://github.com/geobrowser/geo-sdk
  - Official Demo: https://github.com/geobrowser/geo_tech_demo
  - Geo Browser: https://geobrowser.io
  - API Endpoint: https://testnet-api.geobrowser.io/graphql

`);
