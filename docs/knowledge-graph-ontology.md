# Knowledge Graph Ontology Reference

This document describes the well-known entities, types, and properties defined in the Geo Knowledge Graph root space. Using these IDs allows your entities to be recognized and rendered correctly by the Geo Browser and other clients.

Source: [geo_tech_demo/knowledge-graph-ontology.md](https://github.com/geobrowser/geo_tech_demo/blob/main/knowledge-graph-ontology.md)

---

## Root Space

The root space contains the foundational ontology for the knowledge graph.

| Property | Value |
|----------|-------|
| Space ID | `a19c345ab9866679b001d7d2138d88a1` |
| Type | `PERSONAL` |
| Network | TESTNET |

---

## Data Types

The knowledge graph supports these primitive data types for property values:

| Type | ID | Description |
|------|-----|-------------|
| `Bool` | `37a13ac05b6887ab83e772d4ece101ab` | Boolean value |
| `Int64` | `4258025c2fa481c3a7acc4cbde4b82c2` | 64-bit signed integer |
| `Float64` | `d1f0423c3165808d942ff929bf9fc4ce` | 64-bit floating point |
| `Decimal` | `ced1a1c416628b57b3df543ec8ed47b8` | Arbitrary-precision decimal |
| `Text` | `db22a933c151866ca01a4d9e471d5797` | UTF-8 string |
| `Bytes` | `cf14d6bcd4c683f19139ce65552e99e0` | Opaque byte array |
| `Date` | `31cc314f1c168c1cb49e6396b7510ed8` | Calendar date with timezone |
| `Time` | `eef2373859108a4ba8251ad145fdc2f7` | Time of day with timezone |
| `Datetime` | `ef3ccb2d52bb8a31b4802b0e6305ac1e` | Timestamp with timezone |
| `Schedule` | `28df8e42d6f389828d0156c20a9ee183` | RFC 5545/7953 schedule |
| `Point` | `799dd1cff0068f7db65245cc6ace96ab` | WGS84 coordinate |
| `Rect` | `eb924b1b07ed818984c3596a979113b9` | Axis-aligned bounding box |
| `Embedding` | `128a4a5c75a48d2da3255ac7d25a1e11` | Dense vector embedding |

---

## System Types

These are meta-types used to define the schema itself:

| Type | ID | Description |
|------|-----|-------------|
| `Type` | `e7d737c536764c609fa16aa64a8c90ad` | Meta-type for type definitions |
| `Property` | `808a04ceb21c4d888ad12e240613e5ca` | Meta-type for property definitions |

---

## Common Entity Types

Well-known types for common entities:

| Type | ID | Description |
|------|-----|-------------|
| `Person` | `7ed45f2bc48b419e8e4664d5ff680b0d` | Human being |
| `Project` | `484a18c5030a499cb0f2ef588ff16d50` | Project or initiative |
| `Topic` | `5ef5a5860f274d8e8f6c59ae5b3e89e2` | Subject or category |

---

## Block Types

Blocks are used to add rich content to entity pages:

| Type | ID | Description |
|------|-----|-------------|
| `Text Block` | `76474f2f00894e77a0410b39fb17d0bf` | Markdown content block |
| `Data Block` | `b8803a8665de412bbb357e0c84adf473` | Query or collection results |
| `Image` | `ba4e41460010499da0a3caaa7f579d0e` | Image with IPFS URL |
| `Video` | `d7a4817c9795405b93e212df759c43f8` | Video media |
| `PDF` | `14a39e59d9874596956ac2dd4165c210` | PDF document |

---

## System Properties

### Core Properties

| Property | ID | Data Type | Description |
|----------|-----|-----------|-------------|
| `Name` | `a126ca530c8e48d5b88882c734c38935` | Text | Human-readable name |
| `Description` | `9b1f76ff9711404c861e59dc3fa7d037` | Text | Short description |
| `Types` | `8f151ba4de204e3c9cb499ddf96f48f1` | Relation | Type membership |

### Common Properties

| Property | ID | Data Type | Description |
|----------|-----|-----------|-------------|
| `Web URL` | `eed38e74e67946bf8a42ea3e4f8fb5fb` | Text | Website URL |
| `Birth Date` | `60f8b943d9a742109356fc108ee7212c` | Date | Person's birth date |
| `Date Founded` | `41aa3d9847b64a97b7ec427e575b910e` | Date | Organization founding |
| `Topics` | `458fbc070dbf4c928f5716f3fdde7c32` | Relation | Related topics |

### Block Properties

| Property | ID | Data Type | Description |
|----------|-----|-----------|-------------|
| `Blocks` | `beaba5cba67741a8b35377030613fc70` | Relation | Attaches blocks to parent |
| `Markdown Content` | `e3e363d1dd294ccb8e6ff3b76d99bc33` | Text | Markdown body for text blocks |
| `Data Source Type` | `1f69cc9880d444abad493df6a7b15ee4` | Relation | Query vs Collection marker |
| `Filter` | `14a46854bfd14b1882152785c2dab9f3` | Text | JSON-encoded filter |
| `Collection Item` | `a99f9ce12ffa4dac8c61f6310d46064a` | Relation | Points to entity in collection |
| `View` | `1907fd1c81114a3ca378b1f353425b65` | Relation | View preference |

### Media Properties

| Property | ID | Data Type | Description |
|----------|-----|-----------|-------------|
| `IPFS URL` | `8a743832c0944a62b6650c3cc2f9c7bc` | Text | Source URL for media |
| `Width` | `f7b33e08b76d4190aadacadaa9f561e1` | Int64 | Image/video width |
| `Height` | `7f6ad0433e214257a6d48bdad36b1d84` | Int64 | Image/video height |
| `Avatar` | `01412f8381894ab1836565c7fd358cc1` | Relation | Avatar image |
| `Cover` | `34f535072e6b42c5a84443981a77cfa2` | Relation | Cover image |

---

## Data Source Singletons

Used to indicate whether a Data Block uses a live query or fixed collection:

| Singleton | ID | Description |
|-----------|-----|-------------|
| `Query` | `3b069b04adbe4728917d1283fd4ac27e` | Live, declarative queries |
| `Collection` | `1295037a5d9c4d09b27c5502654b9177` | Fixed, enumerated entity sets |

---

## View Types

Available view modes for data blocks:

| View | ID | Description |
|------|-----|-------------|
| `Table` | `cba271cef7c140339047614d174c69f1` | Table view (default) |
| `List` | `7d497dba09c249b8968f716bcf520473` | List view |
| `Gallery` | `ccb70fc917f04a54b86e3b4d20cc7130` | Gallery / grid view |
| `Bullets` | `0aaac6f7c916403eaf6d2e086dc92ada` | Bulleted list view |

---

## Usage in Code

Import constants from `src/constants.ts`:

```typescript
import {
  TYPES,
  PROPERTIES,
  VIEWS,
  DATA_TYPES,
  ROOT_SPACE_ID,
  QUERY_DATA_SOURCE,
  COLLECTION_DATA_SOURCE,
} from "../src/constants.js";

// Use well-known Person type
const personResult = Graph.createEntity({
  name: "John Doe",
  types: [TYPES.person],
  values: [
    { property: PROPERTIES.description, type: "text", value: "Software engineer" },
  ],
});

// Create a text block
const textBlockResult = Graph.createEntity({
  name: "Introduction",
  types: [TYPES.text_block],
  values: [
    { property: PROPERTIES.markdown_content, type: "text", value: "# Hello World\n\nThis is **markdown** content." },
  ],
});
```

---

## Block Patterns

### Text Blocks

Text blocks render markdown content on entity pages:

```typescript
// Create text block
const textBlock = Graph.createEntity({
  name: "About Section",
  types: [TYPES.text_block],
  values: [
    { property: PROPERTIES.markdown_content, type: "text", value: "# About\n\nThis is content..." },
  ],
});

// Attach to parent entity via Blocks relation
const blocksRelation = Graph.createRelation({
  fromEntity: parentEntityId,
  toEntity: textBlock.id,
  type: PROPERTIES.blocks,
});
```

### Data Blocks (Query)

Data blocks with queries show live, filtered entity results:

```typescript
// Create query data block
const dataBlock = Graph.createEntity({
  name: "Recent Projects",
  types: [TYPES.data_block],
  values: [
    { property: PROPERTIES.filter, type: "text", value: JSON.stringify({ typeId: TYPES.project }) },
  ],
});

// Set data source to Query
const dataSourceRelation = Graph.createRelation({
  fromEntity: dataBlock.id,
  toEntity: QUERY_DATA_SOURCE,
  type: PROPERTIES.data_source_type,
});

// Set view type
const viewRelation = Graph.createRelation({
  fromEntity: dataBlock.id,
  toEntity: VIEWS.table,
  type: PROPERTIES.view,
});
```

### Data Blocks (Collection)

Data blocks with collections show hand-picked entities:

```typescript
// Create collection data block
const collectionBlock = Graph.createEntity({
  name: "Featured Items",
  types: [TYPES.data_block],
});

// Set data source to Collection
const dataSourceRelation = Graph.createRelation({
  fromEntity: collectionBlock.id,
  toEntity: COLLECTION_DATA_SOURCE,
  type: PROPERTIES.data_source_type,
});

// Add items to collection
for (const entityId of featuredEntityIds) {
  const itemRelation = Graph.createRelation({
    fromEntity: collectionBlock.id,
    toEntity: entityId,
    type: PROPERTIES.collection_item,
  });
}
```

---

## Position Ordering

Use `Position.generateBetween()` to order blocks:

```typescript
import { Position } from "@geoprotocol/geo-sdk";

// Generate positions for ordered blocks
const pos1 = Position.generateBetween(null, null);     // First item
const pos2 = Position.generateBetween(pos1, null);      // After first
const pos3 = Position.generateBetween(pos1, pos2);      // Between 1 and 2

// Create relation with position
const blocksRelation = Graph.createRelation({
  fromEntity: parentId,
  toEntity: blockId,
  type: PROPERTIES.blocks,
  position: pos1,
});
```

---

## API Endpoints

| Network | GraphQL Endpoint |
|---------|------------------|
| TESTNET | `https://testnet-api.geobrowser.io/graphql` |
| MAINNET | `https://api.geobrowser.io/graphql` |

---

## Resources

- [Geo SDK Repository](https://github.com/geobrowser/geo-sdk)
- [Official Demo Repository](https://github.com/geobrowser/geo_tech_demo)
- [Geo Browser](https://geobrowser.io)
