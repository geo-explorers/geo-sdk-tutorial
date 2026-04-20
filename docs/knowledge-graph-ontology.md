# Knowledge Graph Ontology Reference

Reference for the well-known entities, types, and properties defined in the Geo Knowledge Graph root space. Using these IDs allows your entities to be recognized and rendered correctly by the Geo Browser and other clients.

All IDs below are exported as named constants from `@geoprotocol/geo-sdk` — prefer importing them rather than hardcoding. The **SDK Constant** column lists the import name:

```typescript
import { SystemIds, ContentIds } from "@geoprotocol/geo-sdk";
// or re-exported from our helper module:
import { SystemIds, ContentIds } from "../src/constants.js";
```

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

The knowledge graph supports these primitive data types for property values. The **SDK Constant** column shows the `SystemIds.*` import name.

| Name | ID | SDK Constant | Description |
|------|-----|--------------|-------------|
| `Bool` | `37a13ac05b6887ab83e772d4ece101ab` | `SystemIds.BOOLEAN` | Boolean value |
| `Int64` | `4258025c2fa481c3a7acc4cbde4b82c2` | `SystemIds.INTEGER` | 64-bit signed integer |
| `Float64` | `d1f0423c3165808d942ff929bf9fc4ce` | `SystemIds.FLOAT` | 64-bit floating point |
| `Decimal` | `ced1a1c416628b57b3df543ec8ed47b8` | `SystemIds.DECIMAL` | Arbitrary-precision decimal |
| `Text` | `db22a933c151866ca01a4d9e471d5797` | `SystemIds.TEXT` | UTF-8 string |
| `Bytes` | `cf14d6bcd4c683f19139ce65552e99e0` | `SystemIds.BYTES` | Opaque byte array |
| `Date` | `31cc314f1c168c1cb49e6396b7510ed8` | `SystemIds.DATE` | Calendar date with timezone |
| `Time` | `eef2373859108a4ba8251ad145fdc2f7` | `SystemIds.TIME` | Time of day with timezone |
| `Datetime` | `ef3ccb2d52bb8a31b4802b0e6305ac1e` | `SystemIds.DATETIME` | Timestamp with timezone |
| `Schedule` | `28df8e42d6f389828d0156c20a9ee183` | `SystemIds.SCHEDULE` | RFC 5545/7953 schedule |
| `Point` | `799dd1cff0068f7db65245cc6ace96ab` | `SystemIds.POINT` | WGS84 coordinate |
| `Embedding` | `128a4a5c75a48d2da3255ac7d25a1e11` | `SystemIds.EMBEDDING` | Dense vector embedding |

**Usage note:** When calling `Graph.createProperty({ dataType })`, the runtime expects the enum-style name in **UPPERCASE**: `"BOOLEAN"`, `"INTEGER"`, `"FLOAT"`, `"TEXT"`, etc. When writing an entity value with `{ property, type, value }`, the type is in **lowercase**: `"boolean"`, `"integer"`, `"float"`, `"text"`. See [`curator-courses/04-typed-values-reference.ts`](../curator-courses/04-typed-values-reference.ts) for the full correspondence.

---

## System Types

These are meta-types used to define the schema itself:

| Name | ID | SDK Constant | Description |
|------|-----|--------------|-------------|
| `Type` | `e7d737c536764c609fa16aa64a8c90ad` | `SystemIds.SCHEMA_TYPE` | Meta-type for type definitions |
| `Property` | `808a04ceb21c4d888ad12e240613e5ca` | `SystemIds.PROPERTY` | Meta-type for property definitions |

---

## Common Entity Types

| Name | ID | SDK Constant | Description |
|------|-----|--------------|-------------|
| `Person` | `7ed45f2bc48b419e8e4664d5ff680b0d` | `SystemIds.PERSON_TYPE` | Human being |
| `Project` | `484a18c5030a499cb0f2ef588ff16d50` | `SystemIds.PROJECT_TYPE` | Project or initiative |
| `Topic` | `5ef5a5860f274d8e8f6c59ae5b3e89e2` | `ContentIds.TOPIC_TYPE` | Subject or category |
| `Tag` | — | `ContentIds.TAG_TYPE` | Tag / label |
| `Skill` | — | `ContentIds.SKILL_TYPE` | Skill (named "Practice" on testnet) |
| `Article` | — | `ContentIds.ARTICLE_TYPE` | Long-form article |

---

## Block Types

Blocks add rich content to entity pages:

| Name | ID | SDK Constant | Description |
|------|-----|--------------|-------------|
| `Text Block` | `76474f2f00894e77a0410b39fb17d0bf` | `SystemIds.TEXT_BLOCK` | Markdown content block |
| `Data Block` | `b8803a8665de412bbb357e0c84adf473` | `SystemIds.DATA_BLOCK` | Query or collection results |
| `Image` | `ba4e41460010499da0a3caaa7f579d0e` | `SystemIds.IMAGE_TYPE` | Image with IPFS URL |
| `Video` | `d7a4817c9795405b93e212df759c43f8` | `SystemIds.VIDEO_TYPE` | Video media |

---

## Properties

### Core

| Name | ID | SDK Constant | Data Type | Description |
|------|-----|--------------|-----------|-------------|
| `Name` | `a126ca530c8e48d5b88882c734c38935` | `SystemIds.NAME_PROPERTY` | Text | Human-readable name |
| `Description` | `9b1f76ff9711404c861e59dc3fa7d037` | `SystemIds.DESCRIPTION_PROPERTY` | Text | Short description |
| `Types` | `8f151ba4de204e3c9cb499ddf96f48f1` | `SystemIds.TYPES_PROPERTY` | Relation | Type membership |

### Content

| Name | SDK Constant | Data Type | Description |
|------|--------------|-----------|-------------|
| `Web URL` | `ContentIds.WEB_URL_PROPERTY` | Text | Website URL |
| `Topics` | `ContentIds.TOPICS_PROPERTY` | Relation | Related topics |
| `Authors` | `ContentIds.AUTHORS_PROPERTY` | Relation | Authors |
| `Avatar` | `ContentIds.AVATAR_PROPERTY` | Relation | Avatar image |

### Blocks

| Name | SDK Constant | Data Type | Description |
|------|--------------|-----------|-------------|
| `Blocks` | `SystemIds.BLOCKS` | Relation | Attaches blocks to parent |
| `Markdown Content` | `SystemIds.MARKDOWN_CONTENT` | Text | Markdown body for text blocks |
| `Data Source` | `SystemIds.DATA_SOURCE_PROPERTY` | Relation | Query vs Collection marker |
| `Filter` | `SystemIds.FILTER` | Text | JSON-encoded filter |
| `Collection Item` | `SystemIds.COLLECTION_ITEM_RELATION_TYPE` | Relation | Points to entity in collection |
| `View` | `SystemIds.VIEW_PROPERTY` | Relation | View preference |

### Media

| Name | SDK Constant | Data Type | Description |
|------|--------------|-----------|-------------|
| `Image URL` | `SystemIds.IMAGE_URL_PROPERTY` | Text | Source URL for media |
| `Width` | `SystemIds.IMAGE_WIDTH_PROPERTY` | Integer | Image/video width |
| `Height` | `SystemIds.IMAGE_HEIGHT_PROPERTY` | Integer | Image/video height |
| `Cover` | `SystemIds.COVER_PROPERTY` | Relation | Cover image |

---

## Data Source Singletons

Used to indicate whether a Data Block uses a live query or fixed collection:

| Name | SDK Constant | Description |
|------|--------------|-------------|
| `Query` | `SystemIds.QUERY_DATA_SOURCE` | Live, declarative queries |
| `Collection` | `SystemIds.COLLECTION_DATA_SOURCE` | Fixed, enumerated entity sets |

---

## View Types

Available view modes for data blocks:

| Name | SDK Constant | Description |
|------|--------------|-------------|
| `Table` | `SystemIds.TABLE_VIEW` | Table view (default) |
| `List` | `SystemIds.LIST_VIEW` | List view |
| `Gallery` | `SystemIds.GALLERY_VIEW` | Gallery / grid view |

---

## Usage in Code

```typescript
import { Graph, SystemIds, ContentIds } from "@geoprotocol/geo-sdk";

// Use well-known Person type
const person = Graph.createEntity({
  name: "John Doe",
  description: "Software engineer",
  types: [SystemIds.PERSON_TYPE],
});

// Create a text block
const textBlock = Graph.createEntity({
  name: "Introduction",
  types: [SystemIds.TEXT_BLOCK],
  values: [
    { property: SystemIds.MARKDOWN_CONTENT, type: "text", value: "# Hello World\n\nThis is **markdown** content." },
  ],
});
```

---

## Block Patterns

### Text Blocks

Text blocks render markdown content on entity pages:

```typescript
import { Graph, SystemIds } from "@geoprotocol/geo-sdk";

// Create text block
const textBlock = Graph.createEntity({
  name: "About Section",
  types: [SystemIds.TEXT_BLOCK],
  values: [
    { property: SystemIds.MARKDOWN_CONTENT, type: "text", value: "# About\n\nThis is content..." },
  ],
});

// Attach to parent entity via Blocks relation
const blocksRelation = Graph.createRelation({
  fromEntity: parentEntityId,
  toEntity: textBlock.id,
  type: SystemIds.BLOCKS,
});
```

### Data Blocks (Query)

Data blocks with queries show live, filtered entity results:

```typescript
import { Graph, SystemIds } from "@geoprotocol/geo-sdk";

// Create query data block
const dataBlock = Graph.createEntity({
  name: "Recent Projects",
  types: [SystemIds.DATA_BLOCK],
  values: [
    {
      property: SystemIds.FILTER,
      type: "text",
      value: JSON.stringify({ typeId: SystemIds.PROJECT_TYPE }),
    },
  ],
});

// Set data source to Query
const dataSourceRelation = Graph.createRelation({
  fromEntity: dataBlock.id,
  toEntity: SystemIds.QUERY_DATA_SOURCE,
  type: SystemIds.DATA_SOURCE_PROPERTY,
});

// Set view type
const viewRelation = Graph.createRelation({
  fromEntity: dataBlock.id,
  toEntity: SystemIds.TABLE_VIEW,
  type: SystemIds.VIEW_PROPERTY,
});
```

### Data Blocks (Collection)

Data blocks with collections show hand-picked entities:

```typescript
import { Graph, SystemIds } from "@geoprotocol/geo-sdk";

// Create collection data block
const collectionBlock = Graph.createEntity({
  name: "Featured Items",
  types: [SystemIds.DATA_BLOCK],
});

// Set data source to Collection
const dataSourceRelation = Graph.createRelation({
  fromEntity: collectionBlock.id,
  toEntity: SystemIds.COLLECTION_DATA_SOURCE,
  type: SystemIds.DATA_SOURCE_PROPERTY,
});

// Add items to collection
for (const entityId of featuredEntityIds) {
  const itemRelation = Graph.createRelation({
    fromEntity: collectionBlock.id,
    toEntity: entityId,
    type: SystemIds.COLLECTION_ITEM_RELATION_TYPE,
  });
}
```

---

## Position Ordering

Use `Position.generateBetween()` to order blocks:

```typescript
import { Position, Graph, SystemIds } from "@geoprotocol/geo-sdk";

// Generate positions for ordered blocks
const pos1 = Position.generateBetween(null, null);     // First item
const pos2 = Position.generateBetween(pos1, null);     // After first
const pos3 = Position.generateBetween(pos1, pos2);     // Between 1 and 2

// Create relation with position
const blocksRelation = Graph.createRelation({
  fromEntity: parentId,
  toEntity: blockId,
  type: SystemIds.BLOCKS,
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
- [Geo Browser](https://geobrowser.io)
- Script [`04-typed-values-reference.ts`](../curator-courses/04-typed-values-reference.ts) for a working example of every data type
