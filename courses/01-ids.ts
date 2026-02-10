/**
 * ============================================================================
 * COURSE 1: Foundations - Understanding IDs
 * ============================================================================
 *
 * OBJECTIVE: Learn to generate globally unique identifiers that form the
 * foundation of all data in the knowledge graph.
 *
 * KEY CONCEPTS:
 * - What is The Graph's Knowledge Graph (decentralized, pluralistic knowledge)
 * - UUIDs and the `IdUtils` module
 * - Why globally unique IDs matter
 *
 * ============================================================================
 */

import { IdUtils } from "@geoprotocol/geo-sdk";

/**
 * EXPLANATION:
 *
 * The Geo SDK enables you to interact with a decentralized knowledge graph -
 * think of it as a global, shared database where knowledge is represented as
 * interconnected pieces of information.
 *
 * Every piece of data in this system needs a globally unique identifier.
 * The `IdUtils.generate()` function creates UUID-based identifiers that are
 * guaranteed to be unique across the entire knowledge graph.
 *
 * IDs are the foundation - everything else (properties, types, entities,
 * relations) needs an ID to exist.
 *
 * Note: IDs in the Geo SDK are dashless UUIDs (32 hex characters).
 */

// =============================================================================
// EXAMPLE: Basic ID Generation
// =============================================================================

console.log("=== Course 1: Understanding IDs ===\n");

// Generate a single ID
const myFirstId = IdUtils.generate();
console.log("Your first Geo ID:", myFirstId);
console.log("Format: Dashless UUID v4 (32 hex characters)\n");

// =============================================================================
// CHALLENGE: ID Generator Utility
// =============================================================================
/**
 * CHALLENGE:
 * Create a utility that generates 5 unique IDs and verifies they are all different.
 *
 * Try it yourself first, then scroll down for the solution!
 */

// YOUR CODE HERE:
// function exploreIds() {
//   // Generate 5 IDs
//   // Verify they are all unique
//   // Print results
// }

// =============================================================================
// SOLUTION
// =============================================================================

function exploreIds() {
  console.log("--- Challenge Solution ---\n");

  // Generate 5 unique IDs
  const ids: string[] = [];
  for (let i = 0; i < 5; i++) {
    const id = IdUtils.generate();
    ids.push(id);
    console.log(`ID ${i + 1}: ${id}`);
  }

  // Verify uniqueness using a Set
  const uniqueIds = new Set(ids);
  console.log(`\nGenerated: ${ids.length} IDs`);
  console.log(`Unique: ${uniqueIds.size} IDs`);
  console.log(
    `All unique: ${uniqueIds.size === ids.length ? "YES ✓" : "NO ✗"}`
  );

  // Demonstrate ID structure
  const sampleId = IdUtils.generate();
  console.log(`\n--- ID Format Analysis ---`);
  console.log(`Sample: ${sampleId}`);
  console.log(`Length: ${sampleId.length} characters`);
  console.log(`Format: 32 hex characters (dashless UUID)`);
}

exploreIds();

// =============================================================================
// WHAT'S NEXT?
// =============================================================================
console.log("\n--- What's Next? ---");
console.log("Now that you can generate unique identifiers, you'll learn about");
console.log("PROPERTIES - the building blocks that define what data entities can hold.");
console.log("\nRun: npm run course2");
