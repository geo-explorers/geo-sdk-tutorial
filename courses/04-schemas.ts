/**
 * ============================================================================
 * COURSE 4: Defining Schemas with Properties and Types
 * ============================================================================
 *
 * OBJECTIVE: Learn to design complete schemas by creating Properties
 * (field definitions) and Types (entity schemas) that work together.
 *
 * KEY CONCEPTS:
 * - Properties as attribute definitions
 * - Data types (TEXT, INT64, FLOAT64, BOOLEAN, DATE, etc.)
 * - Types as entity schemas/categories
 * - Graph.createProperty() and Graph.createType() functions
 * - Building a complete schema
 *
 * This course combines properties and types because they work together
 * to define how data is structured in your knowledge graph.
 *
 * ============================================================================
 */

import { Graph } from "@geoprotocol/geo-sdk";

console.log("=== Course 4: Defining Schemas ===\n");

// =============================================================================
// PART 1: Properties
// =============================================================================

console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                      PART 1: PROPERTIES                                    ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  Properties define WHAT KIND OF INFORMATION entities can store.           ║
║                                                                           ║
║  Each property has:                                                       ║
║    1. A unique ID - Auto-generated or provided                            ║
║    2. A name - Human-readable identifier                                  ║
║    3. A data type - What kind of value it holds                           ║
║                                                                           ║
║  SUPPORTED DATA TYPES:                                                    ║
║  ┌───────────┬────────────────────────────────────────────────┐           ║
║  │ TEXT      │ String values                                  │           ║
║  │ INT64     │ 64-bit integer numbers                         │           ║
║  │ FLOAT64   │ 64-bit floating point numbers                  │           ║
║  │ DECIMAL   │ Arbitrary precision decimal numbers            │           ║
║  │ BOOLEAN   │ True/false values                              │           ║
║  │ BYTES     │ Raw byte data                                  │           ║
║  │ DATE      │ Calendar dates (YYYY-MM-DD)                    │           ║
║  │ TIME      │ Time of day (HH:MM:SSZ)                        │           ║
║  │ DATETIME  │ Date + time combined (ISO 8601)                │           ║
║  │ POINT     │ Geographic coordinates (lat/lon)               │           ║
║  │ EMBEDDING │ ML vector embeddings                           │           ║
║  │ SCHEDULE  │ iCalendar RRULE patterns                       │           ║
║  └───────────┴────────────────────────────────────────────────┘           ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
`);

console.log("--- Example: Creating Domain-Specific Properties ---\n");

/**
 * IMPORTANT: Before creating properties, check if they already exist!
 *
 * The root space has common properties like:
 *   - PROPERTIES.name
 *   - PROPERTIES.description
 *   - PROPERTIES.web_url
 *   - PROPERTIES.birth_date
 *
 * Only create NEW properties for domain-specific fields that don't exist.
 * Here we create properties for a hypothetical "Product" domain:
 */

// createProperty returns { id, ops }
const skuPropertyResult = Graph.createProperty({
  name: "SKU",
  dataType: "TEXT",
});

console.log("Created property:");
console.log(`  ID: ${skuPropertyResult.id}`);
console.log(`  Name: "SKU"`);
console.log(`  Type: TEXT`);
console.log(`  Operations: ${skuPropertyResult.ops.length} op(s)`);

// Create more domain-specific properties to show different data types
console.log("\n--- More Property Examples (Domain-Specific) ---\n");

const examples = [
  { name: "Stock Quantity", dataType: "INT64" as const, desc: "Integer number" },
  { name: "Unit Price", dataType: "FLOAT64" as const, desc: "Decimal number" },
  { name: "In Stock", dataType: "BOOLEAN" as const, desc: "True/false" },
  { name: "Release Date", dataType: "DATE" as const, desc: "Calendar date" },
  { name: "Warehouse Location", dataType: "POINT" as const, desc: "Lat/lon coordinates" },
];

for (const ex of examples) {
  const result = Graph.createProperty({ name: ex.name, dataType: ex.dataType });
  console.log(`  ${ex.name} (${ex.dataType}): ${result.id.slice(0, 12)}... - ${ex.desc}`);
}

// =============================================================================
// PART 2: Types
// =============================================================================

console.log(`

╔═══════════════════════════════════════════════════════════════════════════╗
║                         PART 2: TYPES                                      ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  Types are SCHEMAS that group properties together.                        ║
║  They define what kind of entity something is AND what data it can have.  ║
║                                                                           ║
║  IMPORTANT: Check if a type already exists before creating!               ║
║  The root space has: Person, Project, Topic, Image, etc.                  ║
║  Only create custom types for domain-specific concepts.                   ║
║                                                                           ║
║  Example - A custom "Product" type might include:                         ║
║    • SKU (TEXT)                                                           ║
║    • Unit Price (FLOAT64)                                                 ║
║    • Stock Quantity (INT64)                                               ║
║    • In Stock (BOOLEAN)                                                   ║
║                                                                           ║
║  Types serve TWO purposes:                                                ║
║    1. CATEGORIZATION - "This entity is a Product"                         ║
║    2. SCHEMA - "Products can have these properties"                       ║
║                                                                           ║
║  Important: Types reference property IDs, so properties must be           ║
║  created BEFORE the type that uses them.                                  ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
`);

console.log("--- Example: Creating a Domain-Specific Type ---\n");

// Create a domain-specific property for our Product type
const warrantyResult = Graph.createProperty({ name: "Warranty Period", dataType: "TEXT" });

// Then create the type using the properties we created above
const productTypeResult = Graph.createType({
  name: "Product",
  properties: [skuPropertyResult.id, warrantyResult.id],
});

console.log("Created type:");
console.log(`  ID: ${productTypeResult.id}`);
console.log(`  Name: "Product"`);
console.log(`  Properties: SKU, Warranty Period`);
console.log(`  Operations: ${productTypeResult.ops.length} op(s)`);

// =============================================================================
// CHALLENGE: Library System Schema
// =============================================================================

console.log(`

═══════════════════════════════════════════════════════════════════════════
  CHALLENGE: Build a Library System Schema
═══════════════════════════════════════════════════════════════════════════

  Create a schema for a library system with two types:

  BOOK TYPE:
    - Title (TEXT)
    - Author (TEXT)
    - Publication Year (INT64)
    - Price (FLOAT64)
    - Available (BOOLEAN)

  LIBRARY TYPE:
    - Library Name (TEXT)
    - Location (POINT)

  Try it yourself first, then scroll down for the solution!
`);

// YOUR CODE HERE:
// function createLibrarySchema() {
//   // Create properties
//   // Create types
//   // Return everything
// }

// =============================================================================
// SOLUTION
// =============================================================================

console.log("--- Challenge Solution: Library System Schema ---\n");

function createLibrarySchema() {
  console.log("Step 1: Creating Properties\n");

  // ========== BOOK PROPERTIES ==========
  const titleResult = Graph.createProperty({
    name: "Title",
    dataType: "TEXT",
  });
  console.log(`  [Book] Title property: ${titleResult.id.slice(0, 8)}...`);

  const authorResult = Graph.createProperty({
    name: "Author",
    dataType: "TEXT",
  });
  console.log(`  [Book] Author property: ${authorResult.id.slice(0, 8)}...`);

  const yearResult = Graph.createProperty({
    name: "Publication Year",
    dataType: "INT64",
  });
  console.log(`  [Book] Year property: ${yearResult.id.slice(0, 8)}...`);

  const priceResult = Graph.createProperty({
    name: "Price",
    dataType: "FLOAT64",
  });
  console.log(`  [Book] Price property: ${priceResult.id.slice(0, 8)}...`);

  const availableResult = Graph.createProperty({
    name: "Available",
    dataType: "BOOLEAN",
  });
  console.log(`  [Book] Available property: ${availableResult.id.slice(0, 8)}...`);

  // ========== LIBRARY PROPERTIES ==========
  const libraryNameResult = Graph.createProperty({
    name: "Library Name",
    dataType: "TEXT",
  });
  console.log(`  [Library] Name property: ${libraryNameResult.id.slice(0, 8)}...`);

  const locationResult = Graph.createProperty({
    name: "Location",
    dataType: "POINT",
  });
  console.log(`  [Library] Location property: ${locationResult.id.slice(0, 8)}...`);

  console.log("\nStep 2: Creating Types\n");

  // ========== BOOK TYPE ==========
  const bookTypeResult = Graph.createType({
    name: "Book",
    properties: [
      titleResult.id,
      authorResult.id,
      yearResult.id,
      priceResult.id,
      availableResult.id,
    ],
  });
  console.log(`  Book Type: ${bookTypeResult.id.slice(0, 8)}...`);
  console.log(`    Properties: Title, Author, Year, Price, Available`);

  // ========== LIBRARY TYPE ==========
  const libraryTypeResult = Graph.createType({
    name: "Library",
    properties: [libraryNameResult.id, locationResult.id],
  });
  console.log(`\n  Library Type: ${libraryTypeResult.id.slice(0, 8)}...`);
  console.log(`    Properties: Library Name, Location`);

  // ========== VISUALIZE THE SCHEMA ==========
  console.log(`
  ┌─────────────────────────────────────────────────────────────┐
  │                    LIBRARY SYSTEM SCHEMA                    │
  ├─────────────────────────────────────────────────────────────┤
  │                                                             │
  │  ┌─────────────────────┐      ┌─────────────────────┐      │
  │  │       Book          │      │      Library        │      │
  │  ├─────────────────────┤      ├─────────────────────┤      │
  │  │ - Title (TEXT)      │      │ - Name (TEXT)       │      │
  │  │ - Author (TEXT)     │      │ - Location (POINT)  │      │
  │  │ - Year (INT64)      │      │                     │      │
  │  │ - Price (FLOAT64)   │      │                     │      │
  │  │ - Available (BOOL)  │      │                     │      │
  │  └─────────────────────┘      └─────────────────────┘      │
  │                                                             │
  └─────────────────────────────────────────────────────────────┘
  `);

  // Collect all operations
  const allOps = [
    ...titleResult.ops,
    ...authorResult.ops,
    ...yearResult.ops,
    ...priceResult.ops,
    ...availableResult.ops,
    ...libraryNameResult.ops,
    ...locationResult.ops,
    ...bookTypeResult.ops,
    ...libraryTypeResult.ops,
  ];

  console.log("--- Schema Summary ---");
  console.log(`  Properties: 7`);
  console.log(`  Types: 2`);
  console.log(`  Total Operations: ${allOps.length}`);

  return {
    types: {
      book: bookTypeResult.id,
      library: libraryTypeResult.id,
    },
    properties: {
      title: titleResult.id,
      author: authorResult.id,
      year: yearResult.id,
      price: priceResult.id,
      available: availableResult.id,
      libraryName: libraryNameResult.id,
      location: locationResult.id,
    },
    ops: allOps,
  };
}

const schema = createLibrarySchema();

// Show what we'll use in the next course
console.log(`\n--- Schema IDs (for next course) ---`);
console.log(`  Book Type: ${schema.types.book}`);
console.log(`  Library Type: ${schema.types.library}`);

// =============================================================================
// BEST PRACTICES
// =============================================================================

console.log(`

╔═══════════════════════════════════════════════════════════════════════════╗
║                        SCHEMA BEST PRACTICES                               ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  1. REUSE PROPERTIES                                                      ║
║     If multiple types need "Name", create one property and share it.      ║
║     This allows for consistent querying across types.                     ║
║                                                                           ║
║  2. USE THE RIGHT DATA TYPE                                               ║
║     - Use INT64 for whole numbers (counts, years)                         ║
║     - Use FLOAT64 for decimals (prices, measurements)                     ║
║     - Use DATE for dates without time                                     ║
║     - Use DATETIME when time matters                                      ║
║     - Use POINT for geographic locations                                  ║
║                                                                           ║
║  3. CONSIDER THE ROOT SPACE                                               ║
║     Common types like "Person", "Book", "Image" may already exist         ║
║     in the root space. Check before creating duplicates!                  ║
║                                                                           ║
║  4. THINK ABOUT RELATIONS                                                 ║
║     Book --[written by]--> Author                                         ║
║     Relations connect entities; you'll learn about these in Course 6.     ║
║                                                                           ║
║  5. KEEP IT SIMPLE                                                        ║
║     Start with essential properties. You can always add more later.       ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
`);

// =============================================================================
// WHAT'S NEXT?
// =============================================================================
console.log("--- What's Next? ---");
console.log("You have a schema defined! Now it's time to create actual data.");
console.log("Course 5 covers ENTITIES - creating instances with real values.");
console.log("\nRun: npm run course5");
