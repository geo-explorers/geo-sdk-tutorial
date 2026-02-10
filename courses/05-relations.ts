/**
 * ============================================================================
 * COURSE 5: Connecting Entities with Relations
 * ============================================================================
 *
 * OBJECTIVE: Learn to create semantic relations between entities,
 * transforming isolated data into an interconnected knowledge graph.
 *
 * KEY CONCEPTS:
 * - Relations as connections between entities
 * - Graph.createRelation() function
 * - Relation types and semantics
 * - Building a connected graph
 *
 * ============================================================================
 */

import { Graph } from "@geoprotocol/geo-sdk";
import type { Id } from "@geoprotocol/geo-sdk";

/**
 * EXPLANATION:
 *
 * Relations are what make a knowledge graph a GRAPH.
 * They connect entities with meaningful semantic relationships.
 *
 * Examples:
 * - Book "is located in" Library
 * - Person "authored" Book
 * - Book "belongs to genre" Genre
 *
 * Each relation has:
 * 1. A relation type - What kind of connection (also an entity!)
 * 2. A source entity (fromEntity) - Where the relation starts
 * 3. A target entity (toEntity) - Where the relation points
 *
 * Relations are directional but can be traversed both ways in queries.
 */

console.log("=== Course 5: Connecting Entities with Relations ===\n");

// =============================================================================
// SETUP: Create schema and entities from previous courses
// =============================================================================

console.log("--- Setting up from previous courses ---\n");

// Properties
const titleResult = Graph.createProperty({ name: "Title", dataType: "TEXT" });
const authorResult = Graph.createProperty({ name: "Author", dataType: "TEXT" });
const libraryNameResult = Graph.createProperty({ name: "Library Name", dataType: "TEXT" });
const relationNameResult = Graph.createProperty({ name: "Relation Name", dataType: "TEXT" });

// Types
const bookTypeResult = Graph.createType({
  name: "Book",
  properties: [titleResult.id, authorResult.id],
});

const libraryTypeResult = Graph.createType({
  name: "Library",
  properties: [libraryNameResult.id],
});

const relationTypeResult = Graph.createType({
  name: "Relation Type",
  properties: [relationNameResult.id],
});

console.log("Schema ready\n");

// =============================================================================
// EXAMPLE: Understanding Relation Types
// =============================================================================

console.log("--- Understanding Relation Types ---\n");
console.log(`
  In Geo SDK, a relation type is itself an ENTITY!

  This means "Located In" is not just a string - it's a real entity
  with its own ID that can have properties and be referenced.

  This allows for rich, queryable relationship semantics.
`);

// =============================================================================
// CHALLENGE: Build a Connected Library Graph
// =============================================================================
/**
 * CHALLENGE:
 * 1. Create a "Located In" relation type entity
 * 2. Create a library entity
 * 3. Create three book entities
 * 4. Connect all books to the library using relations
 *
 * The graph should show: Book --[Located In]--> Library
 *
 * Try it yourself first, then scroll down for the solution!
 */

// YOUR CODE HERE:
// function buildConnectedLibrary() {
//   // Create relation type
//   // Create library
//   // Create books
//   // Connect with relations
// }

// =============================================================================
// SOLUTION
// =============================================================================

console.log("--- Challenge Solution: Connected Library Graph ---\n");

function buildConnectedLibrary() {
  // ========== STEP 1: Create Relation Type ==========
  console.log("Step 1: Creating 'Located In' Relation Type\n");

  const locatedInTypeResult = Graph.createEntity({
    name: "Located In",
    types: [relationTypeResult.id],
    values: [
      { property: relationNameResult.id, type: "text", value: "Located In" },
    ],
  });

  console.log(`  Relation Type: "Located In"`);
  console.log(`  ID: ${locatedInTypeResult.id.slice(0, 8)}...`);

  // ========== STEP 2: Create Library ==========
  console.log("\nStep 2: Creating Library\n");

  const libraryResult = Graph.createEntity({
    name: "Downtown Public Library",
    types: [libraryTypeResult.id],
    values: [
      { property: libraryNameResult.id, type: "text", value: "Downtown Public Library" },
    ],
  });

  console.log(`  Library: "Downtown Public Library"`);
  console.log(`  ID: ${libraryResult.id.slice(0, 8)}...`);

  // ========== STEP 3: Create Books ==========
  console.log("\nStep 3: Creating Books\n");

  const books = [
    { title: "1984", author: "George Orwell" },
    { title: "Brave New World", author: "Aldous Huxley" },
    { title: "Fahrenheit 451", author: "Ray Bradbury" },
  ];

  const bookIds: Id[] = [];

  books.forEach((book) => {
    const bookResult = Graph.createEntity({
      name: book.title,
      types: [bookTypeResult.id],
      values: [
        { property: titleResult.id, type: "text", value: book.title },
        { property: authorResult.id, type: "text", value: book.author },
      ],
    });
    bookIds.push(bookResult.id);

    console.log(`  "${book.title}" by ${book.author}`);
  });

  // ========== STEP 4: Create Relations ==========
  console.log("\nStep 4: Creating Relations\n");

  const relationIds: Id[] = [];

  bookIds.forEach((bookId, index) => {
    // createRelation connects fromEntity -> toEntity with a type
    const relationResult = Graph.createRelation({
      fromEntity: bookId,
      toEntity: libraryResult.id,
      type: locatedInTypeResult.id,
    });
    relationIds.push(relationResult.id);

    console.log(`  "${books[index].title}" --[Located In]--> Library`);
  });

  // ========== VISUALIZE THE GRAPH ==========
  console.log(`

  ┌─────────────────────────────────────────────────────────────────┐
  │                     KNOWLEDGE GRAPH                             │
  ├─────────────────────────────────────────────────────────────────┤
  │                                                                 │
  │                  ┌───────────────────────────┐                  │
  │                  │   Downtown Public Library │                  │
  │                  │        (Library)          │                  │
  │                  └─────────────▲─────────────┘                  │
  │                               │││                               │
  │              ┌────────────────┘│└────────────────┐              │
  │              │                 │                 │              │
  │         Located In        Located In        Located In          │
  │              │                 │                 │              │
  │              │                 │                 │              │
  │   ┌──────────┴───┐  ┌─────────┴────┐  ┌────────┴─────┐         │
  │   │    1984      │  │  Brave New   │  │ Fahrenheit   │         │
  │   │   (Book)     │  │    World     │  │    451       │         │
  │   │              │  │   (Book)     │  │   (Book)     │         │
  │   └──────────────┘  └──────────────┘  └──────────────┘         │
  │                                                                 │
  └─────────────────────────────────────────────────────────────────┘

  `);

  console.log("--- Graph Summary ---");
  console.log(`  Entities: 5 (1 library + 3 books + 1 relation type)`);
  console.log(`  Relations: ${relationIds.length}`);
  console.log(`  Structure: All books point to the library`);

  return {
    library: libraryResult.id,
    books: bookIds,
    relationType: locatedInTypeResult.id,
    relations: relationIds,
  };
}

const graph = buildConnectedLibrary();

// Show traversal potential
console.log("\n--- Query Potential ---");
console.log("From this graph, you could query:");
console.log("  - 'What books are in Downtown Public Library?'");
console.log("  - 'Where is the book 1984 located?'");
console.log("  - 'How many books does this library have?'");

// =============================================================================
// WHAT'S NEXT?
// =============================================================================
console.log("\n--- What's Next? ---");
console.log("You've built a complete local knowledge graph structure.");
console.log("In Course 6, you'll learn about OPERATIONS and EDITS -");
console.log("how to package your changes for submission to the network.");
console.log("\nRun: npm run course6");
