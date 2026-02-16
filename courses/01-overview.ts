/**
 * ============================================================================
 * COURSE 1: Knowledge Graph Overview
 * ============================================================================
 *
 * OBJECTIVE: Understand what Geo Protocol is, how the knowledge graph works,
 * and see real data before you start writing your own.
 *
 * KEY CONCEPTS:
 * - What is a decentralized knowledge graph?
 * - Architecture: Spaces, IPFS, Blockchain, Indexer, API
 * - The data model: Entities, Properties, Types, Relations
 * - Querying the graph to see real data
 *
 * This course focuses on understanding the system before building.
 * We'll query live data from the network to see how everything connects.
 *
 * ============================================================================
 */

import "dotenv/config";
import { gql } from "../src/functions.js";
import { ROOT_SPACE_ID, TYPES } from "../src/constants.js";

console.log("=== Course 1: Knowledge Graph Overview ===\n");

// =============================================================================
// WHAT IS GEO PROTOCOL?
// =============================================================================

console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                        WHAT IS GEO PROTOCOL?                              ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  Geo Protocol is a decentralized KNOWLEDGE GRAPH - a way to store and    ║
║  share interconnected information without a central authority.            ║
║                                                                           ║
║  Think of it like Wikipedia, but:                                         ║
║    • Anyone can contribute structured data (not just text)                ║
║    • Data is interconnected with meaningful relationships                 ║
║    • Changes are tracked on a blockchain                                  ║
║    • You own your data in your own "Space"                                ║
║    • Communities can govern shared data via DAOs                          ║
║                                                                           ║
║  Instead of documents, we have ENTITIES connected by RELATIONS:           ║
║                                                                           ║
║      ┌─────────┐        ┌─────────┐        ┌─────────┐                   ║
║      │  Book   │──────▶│ Author  │──────▶│  Topic  │                   ║
║      └─────────┘ wrote  └─────────┘ knows  └─────────┘                   ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
`);

// =============================================================================
// ARCHITECTURE OVERVIEW
// =============================================================================

console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                           ARCHITECTURE                                     ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  The data flows through several layers:                                   ║
║                                                                           ║
║     YOU (Geo SDK)                                                         ║
║        │                                                                  ║
║        │ 1. Create entities, properties, relations locally                ║
║        ▼                                                                  ║
║     ┌──────────────┐                                                      ║
║     │    IPFS      │ ◄── 2. Publish your "Edit" to IPFS                   ║
║     │  (Storage)   │     Gets a CID (content hash)                        ║
║     └──────┬───────┘                                                      ║
║            │                                                              ║
║            │ 3. Submit CID to blockchain                                  ║
║            ▼                                                              ║
║     ┌──────────────┐                                                      ║
║     │  Blockchain  │ ◄── Records the edit in your Space                   ║
║     │   (Proof)    │     Immutable, verifiable history                    ║
║     └──────┬───────┘                                                      ║
║            │                                                              ║
║            │ 4. Indexer processes the blockchain                          ║
║            ▼                                                              ║
║     ┌──────────────┐                                                      ║
║     │   Indexer    │ ◄── Reads IPFS, builds queryable database            ║
║     │  (Process)   │                                                      ║
║     └──────┬───────┘                                                      ║
║            │                                                              ║
║            │ 5. Data available via GraphQL API                            ║
║            ▼                                                              ║
║     ┌──────────────┐                                                      ║
║     │ GraphQL API  │ ◄── Query entities, relations, values                ║
║     │  (Read)      │     https://testnet-api.geobrowser.io/graphql        ║
║     └──────────────┘                                                      ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
`);

// =============================================================================
// THE DATA MODEL
// =============================================================================

console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                          THE DATA MODEL                                    ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  Everything in the knowledge graph is built from 4 core concepts:         ║
║                                                                           ║
║  1. PROPERTIES - Define what data can be stored                           ║
║     ┌──────────────────────────────────────┐                              ║
║     │ Property: "Name"     (type: TEXT)    │                              ║
║     │ Property: "Age"      (type: INT64)   │                              ║
║     │ Property: "Birthday" (type: DATE)    │                              ║
║     └──────────────────────────────────────┘                              ║
║                                                                           ║
║  2. TYPES - Group properties into schemas (like classes)                  ║
║     ┌──────────────────────────────────────┐                              ║
║     │ Type: "Person"                       │                              ║
║     │   - Name (TEXT)                      │                              ║
║     │   - Age (INT64)                      │                              ║
║     │   - Birthday (DATE)                  │                              ║
║     └──────────────────────────────────────┘                              ║
║                                                                           ║
║  3. ENTITIES - Actual data instances                                      ║
║     ┌──────────────────────────────────────┐                              ║
║     │ Entity: "Albert Einstein"            │                              ║
║     │   Type: Person                       │                              ║
║     │   Name: "Albert Einstein"            │                              ║
║     │   Birthday: "1879-03-14"             │                              ║
║     └──────────────────────────────────────┘                              ║
║                                                                           ║
║  4. RELATIONS - Connect entities together                                 ║
║     ┌────────────┐                ┌────────────┐                          ║
║     │  Einstein  │──[worked at]──▶│ Princeton  │                          ║
║     └────────────┘                └────────────┘                          ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
`);

// =============================================================================
// LIVE DEMO: Query Real Data
// =============================================================================

async function exploreRootSpace() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  LIVE DEMO: Exploring the Root Space");
  console.log("═══════════════════════════════════════════════════════════════\n");

  console.log(`The "Root Space" is a shared space that contains common schemas`);
  console.log(`used across the knowledge graph - types like Person, Book, etc.\n`);
  console.log(`Root Space ID: ${ROOT_SPACE_ID}\n`);

  // Query 1: Get space info
  console.log("--- Querying Space Info ---\n");

  const spaceData = await gql(`{
    space(id: "${ROOT_SPACE_ID}") {
      id
      type
      page {
        name
        description
      }
    }
  }`);

  if (spaceData.space) {
    console.log(`  Space Type: ${spaceData.space.type}`);
    if (spaceData.space.page?.name) {
      console.log(`  Name: ${spaceData.space.page.name}`);
    }
    if (spaceData.space.page?.description) {
      const desc = spaceData.space.page.description.slice(0, 100);
      console.log(`  Description: ${desc}...`);
    }
  }

  // Query 2: List some type definitions
  console.log("\n--- Schema Types in Root Space ---\n");

  const typesData = await gql(`{
    entities(
      spaceId: "${ROOT_SPACE_ID}"
      typeId: "${TYPES.type}"
      first: 12
      filter: { name: { isNull: false } }
    ) {
      id
      name
      description
    }
  }`);

  console.log("  Types available for use in any space:\n");
  for (const entity of typesData.entities) {
    const desc = entity.description
      ? ` - ${entity.description.slice(0, 50)}...`
      : "";
    console.log(`    ${entity.name}${desc}`);
  }

  // Query 3: Show some entities
  console.log("\n--- Sample Entities ---\n");

  const entitiesData = await gql(`{
    entities(
      spaceId: "${ROOT_SPACE_ID}"
      first: 8
      filter: { name: { isNull: false } }
      orderBy: UPDATED_AT_DESC
    ) {
      id
      name
      typeIds
    }
  }`);

  console.log("  Recently updated entities:\n");
  for (const entity of entitiesData.entities) {
    console.log(`    ${entity.name}`);
    console.log(`      ID: ${entity.id.slice(0, 16)}...`);
    console.log(`      Types: [${entity.typeIds.length} type(s)]`);
  }
}

// =============================================================================
// WHAT YOU'LL LEARN
// =============================================================================

function showCurriculumOverview() {
  console.log(`

╔═══════════════════════════════════════════════════════════════════════════╗
║                        CURRICULUM OVERVIEW                                 ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  PHASE 1: Foundation (Courses 1-3)                                        ║
║  ─────────────────────────────────                                        ║
║    1. Knowledge Graph Overview     ◄── You are here!                      ║
║    2. Reading Data (GraphQL)       - Query entities, values, relations    ║
║    3. Core Concepts                - IDs, Properties, Types, Entities     ║
║                                                                           ║
║  PHASE 2: Creating Data (Courses 4-7)                                     ║
║  ────────────────────────────────────                                     ║
║    4. Schemas                      - Define Properties and Types          ║
║    5. Entities                     - Create data instances                ║
║    6. Relations                    - Connect entities together            ║
║    7. Edits & Operations           - Package changes for submission       ║
║                                                                           ║
║  PHASE 3: Publishing (Courses 8-10)                                       ║
║  ──────────────────────────────────                                       ║
║    8. Publishing                   - Personal spaces, IPFS, on-chain      ║
║    9. Smart Accounts               - Gas sponsorship for easy onboarding  ║
║   10. DAO Governance               - Community-governed spaces            ║
║                                                                           ║
║  PHASE 4: Advanced Patterns (Courses 11-13)                               ║
║  ──────────────────────────────────────────                               ║
║   11. Advanced Blocks              - Text, images, data visualizations    ║
║   12. Updates & Deletes            - Modify and remove data               ║
║   13. Batch Import                 - Import data from external sources    ║
║                                                                           ║
║  PHASE 5: Capstone (Course 14)                                            ║
║  ─────────────────────────────                                            ║
║   14. Recipe Book App              - Build a complete application!        ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
`);
}

// =============================================================================
// RUN
// =============================================================================

async function main() {
  try {
    await exploreRootSpace();
    showCurriculumOverview();
  } catch (error) {
    console.error("Error querying the API:", error);
    console.log("\nMake sure you have network connectivity to the Geo API.");
    process.exit(1);
  }
}

main();

// =============================================================================
// WHAT'S NEXT?
// =============================================================================
console.log("--- What's Next? ---");
console.log("Now that you understand the big picture, Course 2 will teach you");
console.log("how to QUERY the knowledge graph using GraphQL. Understanding how");
console.log("to read data helps you understand the data model before writing.");
console.log("\nRun: npm run course2");
