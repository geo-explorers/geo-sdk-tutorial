/**
 * ============================================================================
 * COURSE 11: Advanced Blocks - Text, Data, and Images
 * ============================================================================
 *
 * OBJECTIVE: Learn to create rich content using blocks - text blocks with
 * markdown, data blocks with queries or collections, and images.
 *
 * KEY CONCEPTS:
 * - Text Blocks: Markdown content attached to entities
 * - Data Blocks: Query-based or collection-based entity displays
 * - Images: Media entities with IPFS URLs
 * - Position ordering: `Position.generateBetween()` for block order
 * - Views: Table, List, Gallery, Bullets
 *
 * REQUIREMENTS:
 * - Set PRIVATE_KEY environment variable (export from https://www.geobrowser.io/export-wallet)
 *
 * ============================================================================
 */

import "dotenv/config";
import { Graph, Position } from "@geoprotocol/geo-sdk";
import type { Op } from "@geoprotocol/geo-sdk";

// Import well-known ontology IDs
import {
  TYPES,
  PROPERTIES,
  VIEWS,
  QUERY_DATA_SOURCE,
  COLLECTION_DATA_SOURCE,
} from "../src/constants.js";

// Import shared utilities
import {
  publishOps,
  printOpsSummary,
  prompt,
  queryEntityByName,
} from "../src/functions.js";

console.log("=== Course 11: Advanced Blocks - Text, Data, and Images ===\n");

/**
 * EXPLANATION:
 *
 * Blocks are a powerful way to add rich content to entity pages in the
 * Geo Browser. There are three main types of blocks:
 *
 * 1. TEXT BLOCKS - Render markdown content (headings, lists, code, etc.)
 * 2. DATA BLOCKS - Display entity collections or query results
 * 3. IMAGES - Display images stored on IPFS
 *
 * Blocks are attached to parent entities via the "Blocks" relation property.
 * You can order blocks using Position.generateBetween() for fractional ordering.
 */

// =============================================================================
// DEMO 1: Text Blocks
// =============================================================================

console.log("═══════════════════════════════════════════════════════════════");
console.log("  Demo 1: Text Blocks (Markdown Content)");
console.log("═══════════════════════════════════════════════════════════════\n");

async function createTextBlockDemo(): Promise<Op[]> {
  const allOps: Op[] = [];

  // Create a parent entity (e.g., a project page)
  let projectName = await prompt("Enter project name (e.g. My Awesome Project): ");
  while (await queryEntityByName(projectName)) {
    console.warn(`  ⚠ "${projectName}" already exists. Please enter a different name.`);
    projectName = await prompt("Enter a different name: ");
  }
  const projectResult = Graph.createEntity({
    name: projectName,
    types: [TYPES.project],
    values: [
      { property: PROPERTIES.description, type: "text", value: "A demo project for text blocks" },
    ],
  });
  allOps.push(...projectResult.ops);
  console.log(`  Created project: "${projectName}"`);

  // Create text block 1: Introduction
  let introBlockName = await prompt("Enter name for first text block (e.g. Introduction): ");
  while (await queryEntityByName(introBlockName)) {
    console.warn(`  ⚠ "${introBlockName}" already exists. Please enter a different name.`);
    introBlockName = await prompt("Enter a different name: ");
  }
  const introBlock = Graph.createEntity({
    name: introBlockName,
    types: [TYPES.text_block],
    values: [
      {
        property: PROPERTIES.markdown_content,
        type: "text",
        value: `# Welcome to My Project

This project demonstrates the power of **text blocks** in the Geo Knowledge Graph.

## Features

- Rich markdown support
- Code highlighting
- Lists and tables
- And much more!

\`\`\`typescript
// Example code block
const greeting = "Hello, Knowledge Graph!";
console.log(greeting);
\`\`\`
`,
      },
    ],
  });
  allOps.push(...introBlock.ops);
  console.log(`  Created text block: "${introBlockName}"`);

  // Create text block 2: Getting Started
  let gettingStartedName = await prompt("Enter name for second text block (e.g. Getting Started): ");
  while (await queryEntityByName(gettingStartedName)) {
    console.warn(`  ⚠ "${gettingStartedName}" already exists. Please enter a different name.`);
    gettingStartedName = await prompt("Enter a different name: ");
  }
  const gettingStartedBlock = Graph.createEntity({
    name: gettingStartedName,
    types: [TYPES.text_block],
    values: [
      {
        property: PROPERTIES.markdown_content,
        type: "text",
        value: `## Getting Started

1. Clone the repository
2. Install dependencies: \`npm install\`
3. Run the development server: \`npm run dev\`

> **Note:** Make sure you have Node.js 18+ installed.
`,
      },
    ],
  });
  allOps.push(...gettingStartedBlock.ops);
  console.log(`  Created text block: "${gettingStartedName}"`);

  // Generate positions for ordering
  const pos1 = Position.generateBetween(null, null); // First position
  const pos2 = Position.generateBetween(pos1, null); // Second position

  // Attach blocks to project using Blocks relation
  const introRelation = Graph.createRelation({
    fromEntity: projectResult.id,
    toEntity: introBlock.id,
    type: PROPERTIES.blocks,
    position: pos1,
  });
  allOps.push(...introRelation.ops);

  const gettingStartedRelation = Graph.createRelation({
    fromEntity: projectResult.id,
    toEntity: gettingStartedBlock.id,
    type: PROPERTIES.blocks,
    position: pos2,
  });
  allOps.push(...gettingStartedRelation.ops);

  console.log(`  Attached blocks to project with ordered positions\n`);

  console.log(`
  Text Block Structure:
  ---------------------

  +------------------------------------------+
  |         ${projectName.padEnd(32)}|
  |            (Project)                     |
  +------------------------------------------+
  |                                          |
  |  +------------------------------------+  |
  |  | # ${introBlockName.padEnd(35)}|  |  <- Text Block 1
  |  |                                    |  |     (Position: ${pos1.slice(0, 8)}...)
  |  | This project demonstrates...       |  |
  |  +------------------------------------+  |
  |                                          |
  |  +------------------------------------+  |
  |  | ## ${gettingStartedName.padEnd(33)}|  |  <- Text Block 2
  |  |                                    |  |     (Position: ${pos2.slice(0, 8)}...)
  |  | 1. Clone the repository...         |  |
  |  +------------------------------------+  |
  |                                          |
  +------------------------------------------+
  `);

  return allOps;
}

const textBlockOps = await createTextBlockDemo();

// =============================================================================
// DEMO 2: Data Blocks (Query-based)
// =============================================================================

console.log("═══════════════════════════════════════════════════════════════");
console.log("  Demo 2: Data Blocks (Query-based)");
console.log("═══════════════════════════════════════════════════════════════\n");

async function createQueryDataBlockDemo(): Promise<Op[]> {
  const allOps: Op[] = [];

  // Create a parent page
  let dashboardName = await prompt("Enter dashboard name (e.g. Project Dashboard): ");
  while (await queryEntityByName(dashboardName)) {
    console.warn(`  ⚠ "${dashboardName}" already exists. Please enter a different name.`);
    dashboardName = await prompt("Enter a different name: ");
  }
  const dashboardResult = Graph.createEntity({
    name: dashboardName,
    types: [TYPES.project],
    values: [
      { property: PROPERTIES.description, type: "text", value: "Dashboard showing recent projects" },
    ],
  });
  allOps.push(...dashboardResult.ops);
  console.log(`  Created dashboard: "${dashboardName}"`);

  // Create a query data block
  let queryDataBlockName = await prompt("Enter query data block name (e.g. Recent Projects): ");
  while (await queryEntityByName(queryDataBlockName)) {
    console.warn(`  ⚠ "${queryDataBlockName}" already exists. Please enter a different name.`);
    queryDataBlockName = await prompt("Enter a different name: ");
  }
  const queryDataBlock = Graph.createEntity({
    name: queryDataBlockName,
    types: [TYPES.data_block],
    values: [
      {
        property: PROPERTIES.filter,
        type: "text",
        value: JSON.stringify({
          typeId: TYPES.project,
        }),
      },
    ],
  });
  allOps.push(...queryDataBlock.ops);
  console.log(`  Created query data block: "${queryDataBlockName}"`);

  // Set data source type to Query (live results)
  const dataSourceRelation = Graph.createRelation({
    fromEntity: queryDataBlock.id,
    toEntity: QUERY_DATA_SOURCE,
    type: PROPERTIES.data_source_type,
  });
  allOps.push(...dataSourceRelation.ops);
  console.log(`  Set data source to QUERY (live results)`);

  // Set view type to Table
  const viewRelation = Graph.createRelation({
    fromEntity: queryDataBlock.id,
    toEntity: VIEWS.table,
    type: PROPERTIES.view,
  });
  allOps.push(...viewRelation.ops);
  console.log(`  Set view to TABLE`);

  // Attach to dashboard
  const blocksRelation = Graph.createRelation({
    fromEntity: dashboardResult.id,
    toEntity: queryDataBlock.id,
    type: PROPERTIES.blocks,
  });
  allOps.push(...blocksRelation.ops);

  console.log(`
  Query Data Block:
  -----------------

  Data Source: QUERY (${QUERY_DATA_SOURCE.slice(0, 8)}...)
  View: TABLE (${VIEWS.table.slice(0, 8)}...)

  This block will show LIVE query results filtered by typeId.
  `);

  return allOps;
}

const queryDataBlockOps = await createQueryDataBlockDemo();

// =============================================================================
// DEMO 3: Data Blocks (Collection-based)
// =============================================================================

console.log("═══════════════════════════════════════════════════════════════");
console.log("  Demo 3: Data Blocks (Collection-based)");
console.log("═══════════════════════════════════════════════════════════════\n");

async function createCollectionDataBlockDemo(): Promise<Op[]> {
  const allOps: Op[] = [];

  // Create some sample entities to feature
  let featuredItem1Name = await prompt("Enter name for featured item 1 (e.g. Featured Item 1): ");
  while (await queryEntityByName(featuredItem1Name)) {
    console.warn(`  ⚠ "${featuredItem1Name}" already exists. Please enter a different name.`);
    featuredItem1Name = await prompt("Enter a different name: ");
  }
  const entity1 = Graph.createEntity({
    name: featuredItem1Name,
    types: [TYPES.topic],
    values: [
      { property: PROPERTIES.description, type: "text", value: "A hand-picked featured item" },
    ],
  });
  allOps.push(...entity1.ops);

  let featuredItem2Name = await prompt("Enter name for featured item 2 (e.g. Featured Item 2): ");
  while (await queryEntityByName(featuredItem2Name)) {
    console.warn(`  ⚠ "${featuredItem2Name}" already exists. Please enter a different name.`);
    featuredItem2Name = await prompt("Enter a different name: ");
  }
  const entity2 = Graph.createEntity({
    name: featuredItem2Name,
    types: [TYPES.topic],
    values: [
      { property: PROPERTIES.description, type: "text", value: "Another featured item" },
    ],
  });
  allOps.push(...entity2.ops);

  let featuredItem3Name = await prompt("Enter name for featured item 3 (e.g. Featured Item 3): ");
  while (await queryEntityByName(featuredItem3Name)) {
    console.warn(`  ⚠ "${featuredItem3Name}" already exists. Please enter a different name.`);
    featuredItem3Name = await prompt("Enter a different name: ");
  }
  const entity3 = Graph.createEntity({
    name: featuredItem3Name,
    types: [TYPES.topic],
    values: [
      { property: PROPERTIES.description, type: "text", value: "Yet another featured item" },
    ],
  });
  allOps.push(...entity3.ops);

  console.log(`  Created 3 sample entities to feature`);

  // Create a collection data block
  let collectionBlockName = await prompt("Enter collection data block name (e.g. Featured Topics): ");
  while (await queryEntityByName(collectionBlockName)) {
    console.warn(`  ⚠ "${collectionBlockName}" already exists. Please enter a different name.`);
    collectionBlockName = await prompt("Enter a different name: ");
  }
  const collectionDataBlock = Graph.createEntity({
    name: collectionBlockName,
    types: [TYPES.data_block],
  });
  allOps.push(...collectionDataBlock.ops);
  console.log(`  Created collection data block: "${collectionBlockName}"`);

  // Set data source type to Collection (hand-picked items)
  const dataSourceRelation = Graph.createRelation({
    fromEntity: collectionDataBlock.id,
    toEntity: COLLECTION_DATA_SOURCE,
    type: PROPERTIES.data_source_type,
  });
  allOps.push(...dataSourceRelation.ops);
  console.log(`  Set data source to COLLECTION (hand-picked)`);

  // Set view type to Gallery
  const viewRelation = Graph.createRelation({
    fromEntity: collectionDataBlock.id,
    toEntity: VIEWS.gallery,
    type: PROPERTIES.view,
  });
  allOps.push(...viewRelation.ops);
  console.log(`  Set view to GALLERY`);

  // Add items to collection with ordered positions
  const pos1 = Position.generateBetween(null, null);
  const pos2 = Position.generateBetween(pos1, null);
  const pos3 = Position.generateBetween(pos2, null);

  const item1Relation = Graph.createRelation({
    fromEntity: collectionDataBlock.id,
    toEntity: entity1.id,
    type: PROPERTIES.collection_item,
    position: pos1,
  });
  allOps.push(...item1Relation.ops);

  const item2Relation = Graph.createRelation({
    fromEntity: collectionDataBlock.id,
    toEntity: entity2.id,
    type: PROPERTIES.collection_item,
    position: pos2,
  });
  allOps.push(...item2Relation.ops);

  const item3Relation = Graph.createRelation({
    fromEntity: collectionDataBlock.id,
    toEntity: entity3.id,
    type: PROPERTIES.collection_item,
    position: pos3,
  });
  allOps.push(...item3Relation.ops);

  console.log(`  Added 3 items to collection with ordered positions`);

  console.log(`
  Collection Data Block:
  ----------------------

  Data Source: COLLECTION (hand-picked items)
  View: GALLERY
  Items: 3 entities added with positions
  `);

  return allOps;
}

const collectionDataBlockOps = await createCollectionDataBlockDemo();

// =============================================================================
// DEMO 4: Images
// =============================================================================

console.log("═══════════════════════════════════════════════════════════════");
console.log("  Demo 4: Images (IPFS Media)");
console.log("═══════════════════════════════════════════════════════════════\n");

async function createImageDemo(): Promise<Op[]> {
  const allOps: Op[] = [];

  // Create an image entity
  let imageName = await prompt("Enter image entity name (e.g. Project Logo): ");
  while (await queryEntityByName(imageName)) {
    console.warn(`  ⚠ "${imageName}" already exists. Please enter a different name.`);
    imageName = await prompt("Enter a different name: ");
  }
  const imageResult = Graph.createEntity({
    name: imageName,
    types: [TYPES.image],
    values: [
      { property: PROPERTIES.ipfs_url, type: "text", value: "ipfs://QmExample..." },
      { property: PROPERTIES.width, type: "int64", value: 512 },
      { property: PROPERTIES.height, type: "int64", value: 512 },
      { property: PROPERTIES.description, type: "text", value: "Project logo image" },
    ],
  });
  allOps.push(...imageResult.ops);
  console.log(`  Created image entity: "${imageName}"`);

  // Create a person entity with an avatar
  let personName = await prompt("Enter person name (e.g. Jane Developer): ");
  while (await queryEntityByName(personName)) {
    console.warn(`  ⚠ "${personName}" already exists. Please enter a different name.`);
    personName = await prompt("Enter a different name: ");
  }
  const personResult = Graph.createEntity({
    name: personName,
    types: [TYPES.person],
    values: [
      { property: PROPERTIES.description, type: "text", value: "Full-stack developer" },
    ],
  });
  allOps.push(...personResult.ops);
  console.log(`  Created person: "${personName}"`);

  // Create avatar image
  let avatarName = await prompt(`Enter avatar image name (e.g. ${personName}'s Avatar): `);
  while (await queryEntityByName(avatarName)) {
    console.warn(`  ⚠ "${avatarName}" already exists. Please enter a different name.`);
    avatarName = await prompt("Enter a different name: ");
  }
  const avatarResult = Graph.createEntity({
    name: avatarName,
    types: [TYPES.image],
    values: [
      { property: PROPERTIES.ipfs_url, type: "text", value: "ipfs://QmAvatar..." },
      { property: PROPERTIES.width, type: "int64", value: 256 },
      { property: PROPERTIES.height, type: "int64", value: 256 },
    ],
  });
  allOps.push(...avatarResult.ops);

  // Connect avatar to person
  const avatarRelation = Graph.createRelation({
    fromEntity: personResult.id,
    toEntity: avatarResult.id,
    type: PROPERTIES.avatar,
  });
  allOps.push(...avatarRelation.ops);
  console.log(`  Connected avatar image to person`);

  console.log(`
  Image Entity Structure:
  -----------------------

  Project Logo (Image)
  - IPFS URL: ipfs://QmExample...
  - Width: 512
  - Height: 512
  - Description: Project logo image

  Jane Developer (Person) --[Avatar]--> Jane's Avatar (Image)
  `);

  return allOps;
}

const imageOps = await createImageDemo();

// =============================================================================
// DEMO 5: View Types Reference
// =============================================================================

console.log("═══════════════════════════════════════════════════════════════");
console.log("  Demo 5: View Types Reference");
console.log("═══════════════════════════════════════════════════════════════\n");

console.log(`
  Available View Types for Data Blocks:
  -------------------------------------

  TABLE (${VIEWS.table})
  - Displays entities in a table with columns for properties
  - Best for: Structured data with multiple properties

  LIST (${VIEWS.list})
  - Displays entities as a vertical list with descriptions
  - Best for: Simple lists with names and descriptions

  GALLERY (${VIEWS.gallery})
  - Displays entities as visual cards in a grid
  - Best for: Collections with images

  BULLETS (${VIEWS.bullets})
  - Displays entities as bullet points
  - Best for: Simple checklists or short lists
`);

// =============================================================================
// OPERATION SUMMARY
// =============================================================================

console.log("═══════════════════════════════════════════════════════════════");
console.log("  Operation Summary");
console.log("═══════════════════════════════════════════════════════════════\n");

const allOps = [
  ...textBlockOps,
  ...queryDataBlockOps,
  ...collectionDataBlockOps,
  ...imageOps,
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
  |  To publish these blocks, set the PRIVATE_KEY env variable: |
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
  console.log("\n--- Publishing Block Demos ---\n");

  const result = await publishOps({
    ops: allOps,
    editName: "Advanced Blocks Demo",
    privateKey: PRIVATE_KEY,
    useSmartAccount: true,
    network: "TESTNET",
  });

  if (result.success) {
    console.log(`  Published successfully!`);
    console.log(`  Space ID: ${result.spaceId}`);
    console.log(`  Edit ID: ${result.editId}`);
    console.log(`  CID: ${result.cid}`);
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
  // Import well-known IDs
  import { TYPES, PROPERTIES, VIEWS, QUERY_DATA_SOURCE } from "../src/constants.js";
  import { Position } from "@geoprotocol/geo-sdk";

  // ---------------------------------------------------------
  // Text Blocks
  // ---------------------------------------------------------
  const textBlock = Graph.createEntity({
    name: "Introduction",
    types: [TYPES.text_block],
    values: [
      { property: PROPERTIES.markdown_content, type: "text", value: "# Hello\\n\\nMarkdown..." },
    ],
  });

  // Attach with position ordering
  const pos = Position.generateBetween(null, null);
  Graph.createRelation({
    fromEntity: parentId,
    toEntity: textBlock.id,
    type: PROPERTIES.blocks,
    position: pos,
  });

  // ---------------------------------------------------------
  // Query Data Blocks (live results)
  // ---------------------------------------------------------
  const queryBlock = Graph.createEntity({
    name: "Recent Items",
    types: [TYPES.data_block],
    values: [
      { property: PROPERTIES.filter, type: "text", value: JSON.stringify({ typeId: TYPES.project }) },
    ],
  });

  Graph.createRelation({ fromEntity: queryBlock.id, toEntity: QUERY_DATA_SOURCE, type: PROPERTIES.data_source_type });
  Graph.createRelation({ fromEntity: queryBlock.id, toEntity: VIEWS.table, type: PROPERTIES.view });

  // ---------------------------------------------------------
  // Images
  // ---------------------------------------------------------
  const image = Graph.createEntity({
    name: "My Image",
    types: [TYPES.image],
    values: [
      { property: PROPERTIES.ipfs_url, type: "text", value: "ipfs://Qm..." },
      { property: PROPERTIES.width, type: "int64", value: 800 },
      { property: PROPERTIES.height, type: "int64", value: 600 },
    ],
  });
`);

// =============================================================================
// WHAT'S NEXT?
// =============================================================================
console.log("--- What's Next? ---");
console.log("Now you know how to create rich content with blocks!");
console.log("Course 12 covers UPDATES & DELETES - how to modify and remove");
console.log("property values, relations, and entities.");
console.log("\nRun: npm run course12");
