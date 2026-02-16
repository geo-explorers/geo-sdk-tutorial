/**
 * Well-Known Entity IDs from the Knowledge Graph Ontology
 *
 * These are system properties and types defined in the root space.
 * Using these IDs allows your entities to be recognized and rendered
 * correctly by the Geo Browser and other clients.
 *
 * Source: https://github.com/geobrowser/geo_tech_demo/blob/main/knowledge-graph-ontology.md
 */

export const ROOT_SPACE_ID = "a19c345ab9866679b001d7d2138d88a1";

// ─── Type IDs ────────────────────────────────────────────────────────────────

export const TYPES = {
  /** Type — meta-type for type definitions */
  type: "e7d737c536764c609fa16aa64a8c90ad",
  /** Property — meta-type for property definitions */
  property: "808a04ceb21c4d888ad12e240613e5ca",
  /** Person */
  person: "7ed45f2bc48b419e8e4664d5ff680b0d",
  /** Project */
  project: "484a18c5030a499cb0f2ef588ff16d50",
  /** Topic */
  topic: "5ef5a5860f274d8e8f6c59ae5b3e89e2",
  /** Text Block — rich markdown content */
  text_block: "76474f2f00894e77a0410b39fb17d0bf",
  /** Data Block — renders query or collection results */
  data_block: "b8803a8665de412bbb357e0c84adf473",
  /** Image — media entity with IPFS URL */
  image: "ba4e41460010499da0a3caaa7f579d0e",
  /** Video — media entity */
  video: "d7a4817c9795405b93e212df759c43f8",
  /** PDF — document entity */
  pdf: "14a39e59d9874596956ac2dd4165c210",
} as const;

// ─── Property IDs ────────────────────────────────────────────────────────────

export const PROPERTIES = {
  /** Human-readable name for the entity */
  name: "a126ca530c8e48d5b88882c734c38935",
  /** Short description used in previews and summaries */
  description: "9b1f76ff9711404c861e59dc3fa7d037",
  /** Relation type id for type membership */
  types: "8f151ba4de204e3c9cb499ddf96f48f1",
  /** Web URL property */
  web_url: "eed38e74e67946bf8a42ea3e4f8fb5fb",
  /** Birth date property */
  birth_date: "60f8b943d9a742109356fc108ee7212c",
  /** Date founded property */
  date_founded: "41aa3d9847b64a97b7ec427e575b910e",
  /** Topics relation property */
  topics: "458fbc070dbf4c928f5716f3fdde7c32",
  /** Blocks relation — attaches blocks to a parent entity */
  blocks: "beaba5cba67741a8b35377030613fc70",
  /** Markdown body for a text block */
  markdown_content: "e3e363d1dd294ccb8e6ff3b76d99bc33",
  /** Declares query vs collection data source */
  data_source_type: "1f69cc9880d444abad493df6a7b15ee4",
  /** JSON-encoded filter for data blocks */
  filter: "14a46854bfd14b1882152785c2dab9f3",
  /** Points to an entity in a collection */
  collection_item: "a99f9ce12ffa4dac8c61f6310d46064a",
  /** View preference on a Blocks relation */
  view: "1907fd1c81114a3ca378b1f353425b65",
  /** Source URL for images/media */
  ipfs_url: "8a743832c0944a62b6650c3cc2f9c7bc",
  /** Image/video width */
  width: "f7b33e08b76d4190aadacadaa9f561e1",
  /** Image/video height */
  height: "7f6ad0433e214257a6d48bdad36b1d84",
  /** Avatar relation property */
  avatar: "01412f8381894ab1836565c7fd358cc1",
  /** Cover image property */
  cover: "34f535072e6b42c5a84443981a77cfa2",
} as const;

// ─── Data Source Singletons ──────────────────────────────────────────────────

/** Marker entity for live, declarative queries */
export const QUERY_DATA_SOURCE = "3b069b04adbe4728917d1283fd4ac27e";
/** Marker entity for fixed, enumerated entity sets */
export const COLLECTION_DATA_SOURCE = "1295037a5d9c4d09b27c5502654b9177";

// ─── View Type IDs ───────────────────────────────────────────────────────────

export const VIEWS = {
  /** Table view (default) */
  table: "cba271cef7c140339047614d174c69f1",
  /** List view */
  list: "7d497dba09c249b8968f716bcf520473",
  /** Gallery / grid view */
  gallery: "ccb70fc917f04a54b86e3b4d20cc7130",
  /** Bulleted list view */
  bullets: "0aaac6f7c916403eaf6d2e086dc92ada",
} as const;

// ─── Data Types ──────────────────────────────────────────────────────────────

export const DATA_TYPES = {
  /** Boolean value */
  bool: "37a13ac05b6887ab83e772d4ece101ab",
  /** 64-bit signed integer */
  int64: "4258025c2fa481c3a7acc4cbde4b82c2",
  /** 64-bit floating point */
  float64: "d1f0423c3165808d942ff929bf9fc4ce",
  /** Arbitrary-precision decimal */
  decimal: "ced1a1c416628b57b3df543ec8ed47b8",
  /** UTF-8 string */
  text: "db22a933c151866ca01a4d9e471d5797",
  /** Opaque byte array */
  bytes: "cf14d6bcd4c683f19139ce65552e99e0",
  /** Calendar date with timezone */
  date: "31cc314f1c168c1cb49e6396b7510ed8",
  /** Time of day with timezone */
  time: "eef2373859108a4ba8251ad145fdc2f7",
  /** Timestamp with timezone */
  datetime: "ef3ccb2d52bb8a31b4802b0e6305ac1e",
  /** RFC 5545/7953 schedule */
  schedule: "28df8e42d6f389828d0156c20a9ee183",
  /** WGS84 coordinate */
  point: "799dd1cff0068f7db65245cc6ace96ab",
  /** Axis-aligned bounding box */
  rect: "eb924b1b07ed818984c3596a979113b9",
  /** Dense vector embedding */
  embedding: "128a4a5c75a48d2da3255ac7d25a1e11",
} as const;

// ─── API Configuration ───────────────────────────────────────────────────────

export const API_URL = "https://testnet-api.geobrowser.io/graphql";
