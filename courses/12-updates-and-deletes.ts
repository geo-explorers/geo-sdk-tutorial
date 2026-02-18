/**
 * ============================================================================
 * COURSE 12: Updates & Deletes - Modifying and Removing Data
 * ============================================================================
 *
 * OBJECTIVE: Learn how to update property values, remove values, and
 * delete relations from the knowledge graph.
 *
 * KEY CONCEPTS:
 * - Graph.updateEntity({ values: [...] }) - Update property values
 * - Graph.updateEntity({ unset: [...] }) - Remove property values
 * - Graph.deleteRelation({ id }) - Remove relations
 * - Cleanup patterns for published data
 *
 * REQUIREMENTS:
 * - Set PRIVATE_KEY environment variable (export from https://www.geobrowser.io/export-wallet)
 *
 * NOTE: Operations in the knowledge graph are additive. "Deletes" create new
 * operations that mark previous values as removed. The history is preserved on IPFS.
 *
 * ============================================================================
 */

import "dotenv/config";
import { Graph } from "@geoprotocol/geo-sdk";
import type { Op, Id as IdType } from "@geoprotocol/geo-sdk";

// Import shared utilities
import {
  publishOps,
  printOpsSummary,
  prompt,
  promptProperty,
  promptType,
  queryEntityByName,
} from "../src/functions.js";

console.log("=== Course 12: Updates & Deletes ===\n");

/**
 * EXPLANATION:
 *
 * The knowledge graph supports three main modification patterns:
 *
 * 1. UPDATE PROPERTY VALUES
 *    Change existing property values using Graph.updateEntity() with values.
 *
 * 2. UNSET PROPERTY VALUES
 *    Remove specific property values while keeping the entity.
 *    Uses Graph.updateEntity() with the `unset` parameter.
 *
 * 3. DELETE RELATIONS
 *    Remove relations between entities using Graph.deleteRelation().
 *    The entities themselves remain intact.
 *
 * Important: All operations are additive. The previous state is preserved
 * in IPFS history, but the current queryable state reflects the changes.
 */

// =============================================================================
// DEMO 1: Updating Property Values
// =============================================================================

console.log("═══════════════════════════════════════════════════════════════");
console.log("  Demo 1: Updating Property Values");
console.log("═══════════════════════════════════════════════════════════════\n");

async function createAndUpdateDemo(): Promise<{ createOps: Op[]; updateOps: Op[]; entityId: string }> {
  console.log("Step 1: Create an entity with initial values\n");

  // Create property definitions
  const nameProp = await promptProperty("Name");
  const statusProp = await promptProperty("Status");
  const versionProp = await promptProperty("Version");
  const projectType = await promptType("Project", [nameProp.id, statusProp.id, versionProp.id]);

  // Create entity with initial values
  let projectEntityName = await prompt("Enter entity name (e.g. My Project): ");
  while (await queryEntityByName(projectEntityName)) {
    console.warn(`  ⚠ "${projectEntityName}" already exists. Please enter a different name.`);
    projectEntityName = await prompt("Enter a different name: ");
  }
  const projectEntity = Graph.createEntity({
    name: projectEntityName,
    types: [projectType.id],
    values: [
      { property: nameProp.id, type: "text", value: projectEntityName },
      { property: statusProp.id, type: "text", value: "Draft" },
      { property: versionProp.id, type: "int64", value: 1 },
    ],
  });

  const createOps: Op[] = [
    ...nameProp.ops,
    ...statusProp.ops,
    ...versionProp.ops,
    ...projectType.ops,
    ...projectEntity.ops,
  ];

  console.log(`  Created project entity with values:`);
  console.log(`    - Name: "${projectEntityName}"`);
  console.log(`    - Status: "Draft"`);
  console.log(`    - Version: 1`);

  console.log("\nStep 2: Update the entity values\n");

  // Update the entity - change status and increment version
  const updateResult = Graph.updateEntity({
    id: projectEntity.id,
    values: [
      { property: statusProp.id, type: "text", value: "Published" },
      { property: versionProp.id, type: "int64", value: 2 },
    ],
  });

  console.log(`  Updated entity values:`);
  console.log(`    - Name: "My Project" (unchanged)`);
  console.log(`    - Status: "Draft" -> "Published"`);
  console.log(`    - Version: 1 -> 2`);

  console.log(`
  Before Update:                  After Update:
  ---------------                 -------------
  +---------------------+         +---------------------+
  | My Project          |         | My Project          |
  +---------------------+         +---------------------+
  | Name: My Project    |         | Name: My Project    |
  | Status: Draft       |  --->   | Status: Published   |
  | Version: 1          |         | Version: 2          |
  +---------------------+         +---------------------+
  `);

  return {
    createOps,
    updateOps: updateResult.ops,
    entityId: projectEntity.id,
  };
}

const updateDemo = await createAndUpdateDemo();

// =============================================================================
// DEMO 2: Unsetting Property Values
// =============================================================================

console.log("═══════════════════════════════════════════════════════════════");
console.log("  Demo 2: Unsetting Property Values");
console.log("═══════════════════════════════════════════════════════════════\n");

async function createAndUnsetDemo(): Promise<{ createOps: Op[]; unsetOps: Op[]; entityId: string }> {
  console.log("Step 1: Create an entity with multiple property values\n");

  // Create property definitions
  const nameProp = await promptProperty("Name");
  const emailProp = await promptProperty("Email");
  const phoneProp = await promptProperty("Phone");
  const notesProp = await promptProperty("Notes");
  const contactType = await promptType("Contact", [nameProp.id, emailProp.id, phoneProp.id, notesProp.id]);

  // Create entity with all properties filled
  let contactEntityName = await prompt("Enter contact entity name (e.g. John Doe): ");
  while (await queryEntityByName(contactEntityName)) {
    console.warn(`  ⚠ "${contactEntityName}" already exists. Please enter a different name.`);
    contactEntityName = await prompt("Enter a different name: ");
  }
  const contactEntity = Graph.createEntity({
    name: contactEntityName,
    types: [contactType.id],
    values: [
      { property: nameProp.id, type: "text", value: contactEntityName },
      { property: emailProp.id, type: "text", value: "john@example.com" },
      { property: phoneProp.id, type: "text", value: "+1-555-123-4567" },
      { property: notesProp.id, type: "text", value: "Met at conference 2024" },
    ],
  });

  const createOps: Op[] = [
    ...nameProp.ops,
    ...emailProp.ops,
    ...phoneProp.ops,
    ...notesProp.ops,
    ...contactType.ops,
    ...contactEntity.ops,
  ];

  console.log(`  Created contact entity with 4 property values`);
  console.log(`    - Name: "${contactEntityName}"`);
  console.log(`    - Email: "john@example.com"`);
  console.log(`    - Phone: "+1-555-123-4567"`);
  console.log(`    - Notes: "Met at conference 2024"`);

  console.log("\nStep 2: Unset specific property values (privacy cleanup)\n");

  // Unset the phone and notes properties
  const unsetResult = Graph.updateEntity({
    id: contactEntity.id,
    unset: [
      { property: phoneProp.id },
      { property: notesProp.id },
    ],
  });

  console.log(`  Unset 2 property values:`);
  console.log(`    - Phone: REMOVED`);
  console.log(`    - Notes: REMOVED`);
  console.log(`    - Name: still "John Doe"`);
  console.log(`    - Email: still "john@example.com"`);

  console.log(`
  Before Unset:                  After Unset:
  --------------                 ------------
  +---------------------+        +---------------------+
  | John Doe (Contact)  |        | John Doe (Contact)  |
  +---------------------+        +---------------------+
  | Name: John Doe      |        | Name: John Doe      |
  | Email: john@...     |  --->  | Email: john@...     |
  | Phone: +1-555-...   |        | Phone: (unset)      |
  | Notes: Met at...    |        | Notes: (unset)      |
  +---------------------+        +---------------------+
  `);

  return {
    createOps,
    unsetOps: unsetResult.ops,
    entityId: contactEntity.id,
  };
}

const unsetDemo = await createAndUnsetDemo();

// =============================================================================
// DEMO 3: Deleting Relations
// =============================================================================

console.log("═══════════════════════════════════════════════════════════════");
console.log("  Demo 3: Deleting Relations");
console.log("═══════════════════════════════════════════════════════════════\n");

async function createAndDeleteRelationDemo(): Promise<{ createOps: Op[]; deleteOps: Op[] }> {
  console.log("Step 1: Create entities with relations\n");

  // Create property and types
  const relationNameProp = await promptProperty("Relation Name");
  const relationType = await promptType("Relation Type", [relationNameProp.id]);
  const projectType = await promptType("Project", []);
  const personType = await promptType("Team Member", []);

  // Create "Member Of" relation type
  let memberOfName = await prompt("Enter relation type entity name (e.g. Member Of): ");
  while (await queryEntityByName(memberOfName)) {
    console.warn(`  ⚠ "${memberOfName}" already exists. Please enter a different name.`);
    memberOfName = await prompt("Enter a different name: ");
  }
  const memberOfRelationType = Graph.createEntity({
    name: memberOfName,
    types: [relationType.id],
    values: [{ property: relationNameProp.id, type: "text", value: memberOfName }],
  });

  // Create entities
  let projectName = await prompt("Enter project name (e.g. Knowledge Graph Project): ");
  while (await queryEntityByName(projectName)) {
    console.warn(`  ⚠ "${projectName}" already exists. Please enter a different name.`);
    projectName = await prompt("Enter a different name: ");
  }
  const project = Graph.createEntity({
    name: projectName,
    types: [projectType.id],
  });

  let aliceName = await prompt("Enter team member 1 name (e.g. Alice): ");
  while (await queryEntityByName(aliceName)) {
    console.warn(`  ⚠ "${aliceName}" already exists. Please enter a different name.`);
    aliceName = await prompt("Enter a different name: ");
  }
  const alice = Graph.createEntity({
    name: aliceName,
    types: [personType.id],
  });

  let bobName = await prompt("Enter team member 2 name (e.g. Bob): ");
  while (await queryEntityByName(bobName)) {
    console.warn(`  ⚠ "${bobName}" already exists. Please enter a different name.`);
    bobName = await prompt("Enter a different name: ");
  }
  const bob = Graph.createEntity({
    name: bobName,
    types: [personType.id],
  });

  let charlieName = await prompt("Enter team member 3 name (e.g. Charlie): ");
  while (await queryEntityByName(charlieName)) {
    console.warn(`  ⚠ "${charlieName}" already exists. Please enter a different name.`);
    charlieName = await prompt("Enter a different name: ");
  }
  const charlie = Graph.createEntity({
    name: charlieName,
    types: [personType.id],
  });

  // Create relations
  const aliceRelation = Graph.createRelation({
    fromEntity: alice.id,
    toEntity: project.id,
    type: memberOfRelationType.id,
  });

  const bobRelation = Graph.createRelation({
    fromEntity: bob.id,
    toEntity: project.id,
    type: memberOfRelationType.id,
  });

  const charlieRelation = Graph.createRelation({
    fromEntity: charlie.id,
    toEntity: project.id,
    type: memberOfRelationType.id,
  });

  const createOps: Op[] = [
    ...relationNameProp.ops,
    ...relationType.ops,
    ...projectType.ops,
    ...personType.ops,
    ...memberOfRelationType.ops,
    ...project.ops,
    ...alice.ops,
    ...bob.ops,
    ...charlie.ops,
    ...aliceRelation.ops,
    ...bobRelation.ops,
    ...charlieRelation.ops,
  ];

  console.log(`  Created project: "${projectName}"`);
  console.log(`  Created 3 team members: ${aliceName}, ${bobName}, ${charlieName}`);
  console.log(`  Created 3 "${memberOfName}" relations`);

  console.log(`\nStep 2: Delete ${bobName}'s relation (they left the project)\n`);

  // Delete the second member's relation
  const deleteRelationResult = Graph.deleteRelation({
    id: bobRelation.id,
  });

  console.log(`  Deleted relation: ${bobName} --[${memberOfName}]--> ${projectName}`);
  console.log(`  ${bobName} entity still exists, just no longer linked`);

  console.log(`
  Before Delete:                  After Delete:
  ---------------                 -------------

    Alice --+                       Alice --+
            |                               |
    Bob ----+----> Project          Bob     +----> Project
            |                               |
  Charlie --+                     Charlie --+

  (3 relations)                  (2 relations)
  `);

  return {
    createOps,
    deleteOps: deleteRelationResult.ops,
  };
}

const relationDemo = await createAndDeleteRelationDemo();

// =============================================================================
// DEMO 4: Cleanup Patterns
// =============================================================================

console.log("═══════════════════════════════════════════════════════════════");
console.log("  Demo 4: Common Cleanup Patterns");
console.log("═══════════════════════════════════════════════════════════════\n");

console.log(`
  Pattern 1: REMOVE SENSITIVE DATA
  ---------------------------------
  // Remove personal information before sharing
  Graph.updateEntity({
    id: userId,
    unset: [
      { property: emailPropertyId },
      { property: phonePropertyId },
    ],
  });

  Pattern 2: SOFT DELETE (Archive)
  --------------------------------
  // Add "archived" flag instead of deleting
  const archivedProp = Graph.createProperty({
    name: "Archived",
    dataType: "BOOLEAN",
  });

  Graph.updateEntity({
    id: entityId,
    values: [
      { property: archivedProp.id, type: "bool", value: true },
    ],
  });

  Pattern 3: DISCONNECT ENTITY
  ----------------------------
  // Remove all relations to/from an entity
  for (const relationId of relationIds) {
    Graph.deleteRelation({ id: relationId });
  }

  Pattern 4: UPDATE + UNSET COMBINED
  ----------------------------------
  // Update some values while removing others
  Graph.updateEntity({
    id: entityId,
    values: [
      { property: statusProp, type: "text", value: "Inactive" },
    ],
    unset: [
      { property: sensitiveProp },
    ],
  });
`);

// =============================================================================
// OPERATION SUMMARY
// =============================================================================

console.log("═══════════════════════════════════════════════════════════════");
console.log("  Operation Summary");
console.log("═══════════════════════════════════════════════════════════════\n");

const allOps = [
  ...updateDemo.createOps,
  ...updateDemo.updateOps,
  ...unsetDemo.createOps,
  ...unsetDemo.unsetOps,
  ...relationDemo.createOps,
  ...relationDemo.deleteOps,
];

printOpsSummary(allOps);

// =============================================================================
// RUN THE EXAMPLE
// =============================================================================

const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}` | undefined;

if (!PRIVATE_KEY) {
  console.log(`
  +-------------------------------------------------------------+
  |                    CONFIGURATION NEEDED                     |
  +-------------------------------------------------------------+
  |                                                             |
  |  To publish these operations, set PRIVATE_KEY env variable: |
  |                                                             |
  |  export PRIVATE_KEY="0x..."                                 |
  |                                                             |
  |  Get your private key from:                                 |
  |  https://www.geobrowser.io/export-wallet                    |
  |                                                             |
  |  Created ${allOps.length} operations (not published)                   |
  |                                                             |
  +-------------------------------------------------------------+
  `);
} else {
  console.log("\n--- Publishing Updates & Deletes Demo ---\n");

  const result = await publishOps({
    ops: allOps,
    editName: "Updates & Deletes Demo",
    privateKey: PRIVATE_KEY,
    useSmartAccount: true,
    network: "TESTNET",
  });

  if (result.success) {
    console.log(`  Published successfully!`);
    console.log(`  Space ID: ${result.spaceId}`);
    console.log(`  Edit ID: ${result.editId}`);
    console.log(`  Transaction: ${result.transactionHash}`);
  } else {
    console.error(`  Publishing failed: ${result.error}`);
  }
}

// =============================================================================
// CODE SUMMARY
// =============================================================================

console.log("\n--- Code Summary ---\n");
console.log(`
  // ---------------------------------------------------------
  // Update Property Values
  // ---------------------------------------------------------
  import { Graph } from "@geoprotocol/geo-sdk";

  const { ops } = Graph.updateEntity({
    id: entityId,
    values: [
      { property: statusPropId, type: "text", value: "Published" },
      { property: versionPropId, type: "int64", value: 2 },
    ],
  });

  // ---------------------------------------------------------
  // Unset Property Values
  // ---------------------------------------------------------

  const { ops } = Graph.updateEntity({
    id: entityId,
    unset: [
      { property: phonePropId },
      { property: notesPropId },
    ],
  });

  // ---------------------------------------------------------
  // Delete Relations
  // ---------------------------------------------------------

  const { ops } = Graph.deleteRelation({
    id: relationId,
  });

  // ---------------------------------------------------------
  // Combined Update + Unset
  // ---------------------------------------------------------

  const { ops } = Graph.updateEntity({
    id: entityId,
    values: [
      { property: statusProp, type: "text", value: "Inactive" },
    ],
    unset: [
      { property: sensitiveProp },
    ],
  });
`);

// =============================================================================
// WHAT'S NEXT?
// =============================================================================
console.log("--- What's Next? ---");
console.log("Course 13 covers BATCH IMPORT - how to import data from");
console.log("JSON files using property registries and batch patterns.");
console.log("\nRun: npm run course13");
