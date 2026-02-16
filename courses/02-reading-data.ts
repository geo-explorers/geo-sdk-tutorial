/**
 * ============================================================================
 * COURSE 2: Reading Data with GraphQL
 * ============================================================================
 *
 * OBJECTIVE: Learn to query the knowledge graph using GraphQL. Understanding
 * how to read data helps you understand the data model before writing.
 *
 * KEY CONCEPTS:
 * - GraphQL API endpoint and query structure
 * - Querying spaces, entities, values, and relations
 * - Filtering and pagination
 * - UUID format (32-char hex, no dashes)
 *
 * "Read before write" - seeing how data is structured in queries helps
 * you understand how to create data correctly.
 *
 * ============================================================================
 */

import "dotenv/config";
import { gql } from "../src/functions.js";
import { ROOT_SPACE_ID, TYPES } from "../src/constants.js";

/**
 * EXPLANATION:
 *
 * The Geo Knowledge Graph provides a GraphQL API for querying data:
 *
 * TESTNET: https://testnet-api.geobrowser.io/graphql
 * MAINNET: https://api.geobrowser.io/graphql
 *
 * Key API patterns:
 * - UUID scalar types: 32-character hex strings (no dashes)
 * - UUIDFilter uses `is`/`isNot` (NOT `equalTo`)
 * - UUIDListFilter uses `anyEqualTo`
 * - Pagination: `first`, `after` for cursor-based pagination
 * - Ordering: CREATED_AT_ASC, CREATED_AT_DESC, UPDATED_AT_ASC, etc.
 */

console.log("=== Course 2: Reading Data with GraphQL ===\n");
console.log("API Endpoint: https://testnet-api.geobrowser.io/graphql\n");

// =============================================================================
// DEMO 1: Query a Space
// =============================================================================

async function demo1_querySpace() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("Demo 1: Query a Space");
  console.log("═══════════════════════════════════════════════════════════════\n");

  console.log(`A SPACE is where data lives. Each space has an owner and can`);
  console.log(`contain entities, types, and relations.\n`);

  const data = await gql(`{
    space(id: "${ROOT_SPACE_ID}") {
      id
      type
      address
      topicId
      page {
        id
        name
        description
      }
    }
  }`);

  console.log("Root Space Info:");
  console.log(JSON.stringify(data.space, null, 2));
  console.log();
}

// =============================================================================
// DEMO 2: List Entities
// =============================================================================

async function demo2_listEntities() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("Demo 2: List Entities in a Space");
  console.log("═══════════════════════════════════════════════════════════════\n");

  console.log(`ENTITIES are the actual data items in the knowledge graph.`);
  console.log(`Each entity has a name, types, and property values.\n`);

  const data = await gql(`{
    entities(
      spaceId: "${ROOT_SPACE_ID}"
      first: 10
      filter: { name: { isNull: false } }
      orderBy: UPDATED_AT_DESC
    ) {
      id
      name
      description
      typeIds
      createdAt
      updatedAt
    }
  }`);

  console.log("Recently updated entities (first 10):\n");
  for (const entity of data.entities) {
    console.log(`  ${entity.name}`);
    console.log(`    ID: ${entity.id}`);
    if (entity.description) {
      const desc =
        entity.description.length > 80
          ? entity.description.slice(0, 80) + "..."
          : entity.description;
      console.log(`    Description: ${desc}`);
    }
    console.log(`    Types: [${entity.typeIds.join(", ")}]`);
    console.log();
  }
}

// =============================================================================
// DEMO 3: Filter by Type
// =============================================================================

async function demo3_filterByType() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("Demo 3: Filter Entities by Type");
  console.log("═══════════════════════════════════════════════════════════════\n");

  console.log(`TYPES categorize entities. You can filter queries to only`);
  console.log(`return entities of a specific type.\n`);

  const data = await gql(`{
    entities(
      spaceId: "${ROOT_SPACE_ID}"
      typeId: "${TYPES.type}"
      first: 15
      filter: { name: { isNull: false } }
    ) {
      id
      name
      description
    }
  }`);

  console.log("Schema Types (entities of type 'Type'):\n");
  for (const entity of data.entities) {
    const desc = entity.description
      ? ` - ${entity.description.slice(0, 50)}...`
      : "";
    console.log(`  ${entity.name} (${entity.id.slice(0, 8)}...)${desc}`);
  }
  console.log();
}

// =============================================================================
// DEMO 4: Query Entity Values
// =============================================================================

async function demo4_queryValues() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("Demo 4: Query Entity Values (Property Data)");
  console.log("═══════════════════════════════════════════════════════════════\n");

  console.log(`VALUES store the actual data for entity properties.`);
  console.log(`Each value links: Entity + Property + typed data\n`);

  const personTypeId = TYPES.person;

  const data = await gql(`{
    values(
      filter: {
        entityId: { is: "${personTypeId}" }
        spaceId: { is: "${ROOT_SPACE_ID}" }
      }
    ) {
      propertyId
      text
      integer
      float
      boolean
      date
      datetime
      propertyEntity { name }
    }
  }`);

  console.log(`Values for "Person" type definition:\n`);
  for (const v of data.values) {
    const propName = v.propertyEntity?.name || v.propertyId;
    const value =
      v.text ?? v.integer ?? v.float ?? v.boolean ?? v.date ?? v.datetime ?? "(complex)";
    console.log(`  ${propName}: ${value}`);
  }
  console.log();
}

// =============================================================================
// DEMO 5: Query Relations
// =============================================================================

async function demo5_queryRelations() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("Demo 5: Query Relations (Entity Connections)");
  console.log("═══════════════════════════════════════════════════════════════\n");

  console.log(`RELATIONS connect entities together with typed edges.`);
  console.log(`They have: fromEntity --[type]--> toEntity\n`);

  const personTypeId = TYPES.person;

  const data = await gql(`{
    relations(
      filter: {
        fromEntityId: { is: "${personTypeId}" }
        spaceId: { is: "${ROOT_SPACE_ID}" }
      }
      first: 20
    ) {
      id
      typeId
      toEntityId
      position
      typeEntity { name }
      toEntity { name }
    }
  }`);

  console.log(`Relations from "Person" type (schema properties):\n`);
  for (const r of data.relations) {
    const relType = r.typeEntity?.name || r.typeId;
    const target = r.toEntity?.name || r.toEntityId;
    console.log(`  --[${relType}]--> ${target}`);
  }
  console.log();
}

// =============================================================================
// DEMO 6: Backlinks (Reverse Relations)
// =============================================================================

async function demo6_backlinks() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("Demo 6: Backlinks (Who References an Entity?)");
  console.log("═══════════════════════════════════════════════════════════════\n");

  console.log(`You can also query in reverse: find all entities that`);
  console.log(`point TO a specific entity.\n`);

  const typeEntityId = TYPES.type;

  const data = await gql(`{
    relations(
      filter: {
        toEntityId: { is: "${typeEntityId}" }
        spaceId: { is: "${ROOT_SPACE_ID}" }
      }
      first: 15
    ) {
      fromEntityId
      typeId
      fromEntity { name }
      typeEntity { name }
    }
  }`);

  console.log(`Entities that reference "Type" (backlinks):\n`);
  for (const r of data.relations) {
    const from = r.fromEntity?.name || r.fromEntityId;
    const relType = r.typeEntity?.name || r.typeId;
    console.log(`  ${from} --[${relType}]--> Type`);
  }
  console.log();
}

// =============================================================================
// CHALLENGE: Build a Search Function
// =============================================================================
/**
 * CHALLENGE:
 * Build a function that searches for entities by name in a given space.
 * Use the `name` filter with `startsWithInsensitive` for case-insensitive search.
 *
 * Try it yourself first, then scroll down for the solution!
 */

// YOUR CODE HERE:
// async function searchEntities(spaceId: string, searchTerm: string) {
//   // Query entities where name starts with searchTerm
//   // Return matching entities with their types
// }

// =============================================================================
// SOLUTION
// =============================================================================

async function searchEntities(spaceId: string, searchTerm: string) {
  console.log(`Searching for "${searchTerm}" in space ${spaceId.slice(0, 8)}...\n`);

  const data = await gql(`{
    entities(
      spaceId: "${spaceId}"
      first: 20
      filter: {
        name: {
          isNull: false
          startsWithInsensitive: "${searchTerm}"
        }
      }
      orderBy: UPDATED_AT_DESC
    ) {
      id
      name
      description
      typeIds
    }
  }`);

  if (data.entities.length === 0) {
    console.log("  No entities found matching that search term.\n");
    return [];
  }

  console.log(`Found ${data.entities.length} entities:\n`);
  for (const entity of data.entities) {
    console.log(`  ${entity.name}`);
    console.log(`    ID: ${entity.id.slice(0, 16)}...`);
    if (entity.description) {
      console.log(`    Description: ${entity.description.slice(0, 60)}...`);
    }
    console.log();
  }

  return data.entities;
}

// =============================================================================
// RUN ALL DEMOS
// =============================================================================

async function main() {
  try {
    await demo1_querySpace();
    await demo2_listEntities();
    await demo3_filterByType();
    await demo4_queryValues();
    await demo5_queryRelations();
    await demo6_backlinks();

    // Run the challenge solution
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("Challenge: Search for entities starting with 'P'");
    console.log("═══════════════════════════════════════════════════════════════\n");
    await searchEntities(ROOT_SPACE_ID, "P");

    console.log("=== Course Complete ===\n");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();

// =============================================================================
// GRAPHQL QUICK REFERENCE
// =============================================================================

console.log("--- GraphQL Quick Reference ---\n");
console.log(`
  Common Query Patterns:

  1. Get a space:
     space(id: "UUID") { id type page { name } }

  2. List entities:
     entities(
       spaceId: "UUID"
       typeId: "UUID"              # Optional filter
       first: 10                   # Pagination
       orderBy: UPDATED_AT_DESC
       filter: { name: { isNull: false } }
     ) { id name typeIds }

  3. Get values:
     values(filter: { entityId: { is: "UUID" } }) {
       propertyId text integer propertyEntity { name }
     }

  4. Get relations:
     relations(filter: { fromEntityId: { is: "UUID" } }) {
       typeId toEntityId typeEntity { name } toEntity { name }
     }

  Filter Operators:
  - is / isNot           (UUID equality)
  - isNull               (null check)
  - contains             (text search)
  - startsWithInsensitive (prefix match)
`);

// =============================================================================
// WHAT'S NEXT?
// =============================================================================
console.log("\n--- What's Next? ---");
console.log("Now that you can read data, Course 3 explains the CORE CONCEPTS");
console.log("in depth: IDs, Properties, Types, Entities, and Relations.");
console.log("Understanding these will prepare you to create your own data.");
console.log("\nRun: npm run course3");
