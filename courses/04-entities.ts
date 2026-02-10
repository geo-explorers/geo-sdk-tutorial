/**
 * ============================================================================
 * COURSE 4: Creating Entities - Your First Real Data
 * ============================================================================
 *
 * OBJECTIVE: Learn to create entities with values and understand how
 * entities instantiate types with actual data.
 *
 * KEY CONCEPTS:
 * - Entities as data instances
 * - Graph.createEntity() function
 * - Setting property values on entities
 * - Value types and formatting
 *
 * ============================================================================
 */

import { Graph } from "@geoprotocol/geo-sdk";
import type { Id } from "@geoprotocol/geo-sdk";

/**
 * EXPLANATION:
 *
 * Entities are the ACTUAL DATA in the knowledge graph.
 * If Types are blueprints, Entities are the houses built from those blueprints.
 *
 * Each entity:
 * 1. Has a unique ID - Auto-generated or provided
 * 2. Belongs to one or more Types - What kind of entity it is
 * 3. Has property values - Actual data for its properties
 *
 * When creating an entity, you specify:
 * - The type(s) it belongs to
 * - Values for its properties (using TypedValue format)
 */

console.log("=== Course 4: Creating Entities ===\n");

// =============================================================================
// SETUP: Create schema first (from previous courses)
// =============================================================================

console.log("--- Setting up schema from previous courses ---\n");

// Properties
const titleResult = Graph.createProperty({ name: "Title", dataType: "TEXT" });
const authorResult = Graph.createProperty({ name: "Author", dataType: "TEXT" });
const yearResult = Graph.createProperty({ name: "Year", dataType: "INT64" });
const priceResult = Graph.createProperty({ name: "Price", dataType: "FLOAT64" });
const availableResult = Graph.createProperty({ name: "Available", dataType: "BOOLEAN" });
const libraryNameResult = Graph.createProperty({ name: "Library Name", dataType: "TEXT" });

// Types
const bookTypeResult = Graph.createType({
  name: "Book",
  properties: [titleResult.id, authorResult.id, yearResult.id, priceResult.id, availableResult.id],
});

const libraryTypeResult = Graph.createType({
  name: "Library",
  properties: [libraryNameResult.id],
});

console.log("Schema ready: Book and Library types created\n");

// =============================================================================
// EXAMPLE: Creating a Single Entity
// =============================================================================

console.log("--- Example: Creating a Single Book ---\n");

// createEntity returns { id, ops }
// Values use TypedValue format: { property, type, value }
const singleBookResult = Graph.createEntity({
  name: "The Great Gatsby",
  types: [bookTypeResult.id],
  values: [
    { property: titleResult.id, type: "text", value: "The Great Gatsby" },
    { property: authorResult.id, type: "text", value: "F. Scott Fitzgerald" },
    { property: yearResult.id, type: "int64", value: 1925 },
    { property: priceResult.id, type: "float64", value: 12.99 },
    { property: availableResult.id, type: "bool", value: true },
  ],
});

console.log("Created entity:");
console.log(`  ID: ${singleBookResult.id}`);
console.log(`  Type: Book`);
console.log(`  Title: "The Great Gatsby"`);
console.log(`  Author: "F. Scott Fitzgerald"`);
console.log(`  Year: 1925`);
console.log(`  Price: $12.99`);
console.log(`  Available: Yes`);

// =============================================================================
// CHALLENGE: Create a Library with Books
// =============================================================================
/**
 * CHALLENGE:
 * Using the schema above, create:
 * - One library entity
 * - Three book entities with complete property values
 *
 * Try it yourself first, then scroll down for the solution!
 */

// YOUR CODE HERE:
// function createLibraryWithBooks() {
//   // Create 1 library
//   // Create 3 books
//   // Return all entity IDs
// }

// =============================================================================
// SOLUTION
// =============================================================================

console.log("\n--- Challenge Solution: Library with Books ---\n");

function createLibraryWithBooks() {
  const entityIds: { library: Id; books: Id[] } = {
    library: "" as Id,
    books: [],
  };

  // ========== CREATE LIBRARY ==========
  console.log("Creating Library...\n");

  const libraryResult = Graph.createEntity({
    name: "Downtown Public Library",
    types: [libraryTypeResult.id],
    values: [
      { property: libraryNameResult.id, type: "text", value: "Downtown Public Library" },
    ],
  });
  entityIds.library = libraryResult.id;

  console.log(`  Library: "Downtown Public Library"`);
  console.log(`  ID: ${libraryResult.id.slice(0, 8)}...`);

  // ========== CREATE BOOKS ==========
  console.log("\nCreating Books...\n");

  const books = [
    {
      title: "1984",
      author: "George Orwell",
      year: 1949,
      price: 14.99,
      available: true,
    },
    {
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      year: 1960,
      price: 12.50,
      available: true,
    },
    {
      title: "The Catcher in the Rye",
      author: "J.D. Salinger",
      year: 1951,
      price: 11.25,
      available: false, // Currently checked out
    },
  ];

  books.forEach((book, index) => {
    const bookResult = Graph.createEntity({
      name: book.title,
      types: [bookTypeResult.id],
      values: [
        { property: titleResult.id, type: "text", value: book.title },
        { property: authorResult.id, type: "text", value: book.author },
        { property: yearResult.id, type: "int64", value: book.year },
        { property: priceResult.id, type: "float64", value: book.price },
        { property: availableResult.id, type: "bool", value: book.available },
      ],
    });
    entityIds.books.push(bookResult.id);

    console.log(`  Book ${index + 1}: "${book.title}"`);
    console.log(`    Author: ${book.author}`);
    console.log(`    Year: ${book.year}`);
    console.log(`    Price: $${book.price.toFixed(2)}`);
    console.log(`    Available: ${book.available ? "Yes" : "No"}`);
    console.log(`    ID: ${bookResult.id.slice(0, 8)}...`);
    console.log("");
  });

  // ========== VISUALIZE ==========
  console.log(`
  ┌─────────────────────────────────────────────────────────────┐
  │                    ENTITIES CREATED                         │
  ├─────────────────────────────────────────────────────────────┤
  │                                                             │
  │  Library: Downtown Public Library                           │
  │                                                             │
  │  Books:                                                     │
  │    1. "1984" by George Orwell (1949) - $14.99 [Available]   │
  │    2. "To Kill a Mockingbird" by Harper Lee - $12.50        │
  │    3. "The Catcher in the Rye" by J.D. Salinger [Checked]   │
  │                                                             │
  │  Total Entities: 4 (1 library + 3 books)                    │
  │                                                             │
  └─────────────────────────────────────────────────────────────┘
  `);

  return entityIds;
}

const entities = createLibraryWithBooks();

console.log("--- Entity Summary ---");
console.log(`Library ID: ${entities.library.slice(0, 8)}...`);
console.log(`Book IDs: ${entities.books.length} books created`);

// =============================================================================
// WHAT'S NEXT?
// =============================================================================
console.log("\n--- What's Next? ---");
console.log("You have entities, but they're isolated. In Course 5, you'll learn");
console.log("to create RELATIONS - connections that link entities together into");
console.log("a true knowledge graph.");
console.log("\nRun: npm run course5");
