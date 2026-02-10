/**
 * ============================================================================
 * COURSE 2: Defining Data with Properties
 * ============================================================================
 *
 * OBJECTIVE: Learn to create properties that define the attributes
 * entities can have, understanding data types and their configurations.
 *
 * KEY CONCEPTS:
 * - Properties as attribute definitions
 * - Data types (TEXT, INT64, FLOAT64, BOOLEAN, DATE, etc.)
 * - Graph.createProperty() function
 *
 * ============================================================================
 */

import { Graph } from "@geoprotocol/geo-sdk";

/**
 * EXPLANATION:
 *
 * Properties define WHAT KIND OF INFORMATION entities can store.
 * Think of properties as column definitions in a database, but for a
 * knowledge graph.
 *
 * Each property has:
 * 1. A unique ID - Generated using IdUtils.generate() (optional, auto-generated if not provided)
 * 2. A name - Human-readable identifier
 * 3. A data type - What kind of value it holds
 *
 * SUPPORTED DATA TYPES:
 * ┌───────────┬────────────────────────────────────────────────┐
 * │ Type      │ Description                                    │
 * ├───────────┼────────────────────────────────────────────────┤
 * │ TEXT      │ String values                                  │
 * │ INT64     │ 64-bit integer numbers                         │
 * │ FLOAT64   │ 64-bit floating point numbers                  │
 * │ DECIMAL   │ Arbitrary precision decimal numbers            │
 * │ BOOLEAN   │ True/false values                              │
 * │ BYTES     │ Raw byte data                                  │
 * │ DATE      │ Calendar dates (YYYY-MM-DD)                    │
 * │ TIME      │ Time of day (HH:MM:SSZ)                        │
 * │ DATETIME  │ Date + time combined (ISO 8601)                │
 * │ POINT     │ Geographic coordinates (lat/lon)               │
 * │ EMBEDDING │ ML vector embeddings                           │
 * │ SCHEDULE  │ iCalendar RRULE patterns                       │
 * └───────────┴────────────────────────────────────────────────┘
 */

console.log("=== Course 2: Defining Data with Properties ===\n");

// =============================================================================
// EXAMPLE: Creating a Simple Property
// =============================================================================

console.log("--- Example: Creating a Text Property ---\n");

// createProperty returns { id, ops } - the id is auto-generated if not provided
const namePropertyResult = Graph.createProperty({
  name: "Name",
  dataType: "TEXT",
});

console.log("Created property:");
console.log(`  ID: ${namePropertyResult.id}`);
console.log(`  Name: "Name"`);
console.log(`  Type: TEXT`);
console.log(`  Operations: ${namePropertyResult.ops.length} op(s)`);

// =============================================================================
// CHALLENGE: Property Schema for a Book
// =============================================================================
/**
 * CHALLENGE:
 * Create properties that would define a book in a library system.
 * A book should have:
 * - title (text)
 * - author (text)
 * - publication year (integer)
 * - price (decimal)
 * - available (boolean)
 *
 * Try it yourself first, then scroll down for the solution!
 */

// YOUR CODE HERE:
// function createBookProperties() {
//   // Create 5 properties for a book
//   // Return the IDs and operations
// }

// =============================================================================
// SOLUTION
// =============================================================================

console.log("\n--- Challenge Solution: Book Properties ---\n");

function createBookProperties() {
  // Property 1: Title (text)
  const titleResult = Graph.createProperty({
    name: "Title",
    dataType: "TEXT",
  });
  console.log(`1. Title Property`);
  console.log(`   ID: ${titleResult.id}`);
  console.log(`   Type: TEXT`);

  // Property 2: Author (text)
  const authorResult = Graph.createProperty({
    name: "Author",
    dataType: "TEXT",
  });
  console.log(`\n2. Author Property`);
  console.log(`   ID: ${authorResult.id}`);
  console.log(`   Type: TEXT`);

  // Property 3: Publication Year (integer)
  const yearResult = Graph.createProperty({
    name: "Publication Year",
    dataType: "INT64",
  });
  console.log(`\n3. Publication Year Property`);
  console.log(`   ID: ${yearResult.id}`);
  console.log(`   Type: INT64 (integer)`);

  // Property 4: Price (decimal)
  const priceResult = Graph.createProperty({
    name: "Price",
    dataType: "FLOAT64",
  });
  console.log(`\n4. Price Property`);
  console.log(`   ID: ${priceResult.id}`);
  console.log(`   Type: FLOAT64 (decimal)`);

  // Property 5: Available (boolean)
  const availableResult = Graph.createProperty({
    name: "Available",
    dataType: "BOOLEAN",
  });
  console.log(`\n5. Available Property`);
  console.log(`   ID: ${availableResult.id}`);
  console.log(`   Type: BOOLEAN`);

  // Collect all operations
  const allOps = [
    ...titleResult.ops,
    ...authorResult.ops,
    ...yearResult.ops,
    ...priceResult.ops,
    ...availableResult.ops,
  ];

  console.log(`\n--- Summary ---`);
  console.log(`Total properties created: 5`);
  console.log(`Total operations: ${allOps.length}`);

  return {
    propertyIds: {
      title: titleResult.id,
      author: authorResult.id,
      year: yearResult.id,
      price: priceResult.id,
      available: availableResult.id,
    },
    operations: allOps,
  };
}

const bookSchema = createBookProperties();

// Show what we'll use in the next course
console.log(`\n--- Property IDs (save for next course) ---`);
console.log(JSON.stringify(bookSchema.propertyIds, null, 2));

// =============================================================================
// WHAT'S NEXT?
// =============================================================================
console.log("\n--- What's Next? ---");
console.log("Properties define what data CAN exist, but we need TYPES to");
console.log("group properties together into meaningful schemas.");
console.log("\nRun: npm run course3");
