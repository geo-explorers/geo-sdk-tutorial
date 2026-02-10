/**
 * ============================================================================
 * COURSE 3: Organizing with Types
 * ============================================================================
 *
 * OBJECTIVE: Learn to create Types that group properties together,
 * defining schemas for categorizing entities in the knowledge graph.
 *
 * KEY CONCEPTS:
 * - Types as entity categories/schemas
 * - Graph.createType() function
 * - Associating properties with types
 *
 * ============================================================================
 */

import { Graph } from "@geoprotocol/geo-sdk";

/**
 * EXPLANATION:
 *
 * Types are like CLASSES or BLUEPRINTS in the knowledge graph.
 * They define:
 * 1. What category an entity belongs to
 * 2. What properties an entity can have
 *
 * Examples:
 * - A "Book" type might have properties: title, author, year, price
 * - A "Person" type might have properties: name, birthdate, email
 * - A "Library" type might have properties: name, location, capacity
 *
 * Types serve two purposes:
 * 1. CATEGORIZATION - What kind of thing is this entity?
 * 2. SCHEMA DEFINITION - What properties can this entity have?
 */

console.log("=== Course 3: Organizing with Types ===\n");

// =============================================================================
// EXAMPLE: Creating a Simple Type
// =============================================================================

console.log("--- Example: Creating a Person Type ---\n");

// First, create properties for Person
const personNameResult = Graph.createProperty({
  name: "Person Name",
  dataType: "TEXT",
});

const emailResult = Graph.createProperty({
  name: "Email",
  dataType: "TEXT",
});

// Now create the Person type with these properties
const personTypeResult = Graph.createType({
  name: "Person",
  properties: [personNameResult.id, emailResult.id],
});

console.log("Created type:");
console.log(`  ID: ${personTypeResult.id}`);
console.log(`  Name: "Person"`);
console.log(`  Properties: Person Name, Email`);

// =============================================================================
// CHALLENGE: Complete Book Type Schema
// =============================================================================
/**
 * CHALLENGE:
 * Build on Course 2 by creating a complete "Book" type that includes
 * all the book properties. Also create a "Library" type with properties
 * for library name and location.
 *
 * Try it yourself first, then scroll down for the solution!
 */

// YOUR CODE HERE:
// function createLibrarySchema() {
//   // Create all properties
//   // Create Book type
//   // Create Library type
//   // Return everything
// }

// =============================================================================
// SOLUTION
// =============================================================================

console.log("\n--- Challenge Solution: Library System Schema ---\n");

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
  };
}

const schema = createLibrarySchema();

console.log("--- Schema Ready ---");
console.log("Types:", Object.keys(schema.types).join(", "));
console.log("Properties:", Object.keys(schema.properties).length);

// =============================================================================
// WHAT'S NEXT?
// =============================================================================
console.log("\n--- What's Next? ---");
console.log("You have properties and types defined. Now it's time to create");
console.log("actual ENTITIES - the real data instances that populate your graph.");
console.log("\nRun: npm run course4");
