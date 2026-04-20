/**
 * Geo SDK Constants
 *
 * Re-exports well-known IDs from the SDK so scripts can use:
 *   import { SystemIds, ContentIds } from "@geoprotocol/geo-sdk";
 *
 * SystemIds  — core protocol IDs (types, properties, views, data types, blocks)
 * ContentIds — common content IDs (Topic, Article, Skill, Tag, etc.)
 *
 * These IDs are verified against the live testnet API.
 * Using SDK imports ensures IDs stay correct as the protocol evolves.
 *
 * Quick reference (most-used by curators):
 *
 *   SystemIds.NAME_PROPERTY          — "Name" property
 *   SystemIds.DESCRIPTION_PROPERTY   — "Description" property
 *   SystemIds.PROPERTY               — meta-type for property entities
 *   SystemIds.SCHEMA_TYPE            — meta-type for type entities
 *   SystemIds.PERSON_TYPE            — Person type
 *   SystemIds.PROJECT_TYPE           — Project type
 *   SystemIds.BLOCKS                 — Blocks relation property
 *   SystemIds.TEXT_BLOCK             — Text Block type
 *   SystemIds.DATA_BLOCK             — Data Block type
 *   SystemIds.IMAGE_TYPE             — Image type
 *   SystemIds.MARKDOWN_CONTENT       — Markdown content property
 *   SystemIds.QUERY_DATA_SOURCE      — Query data source singleton
 *   SystemIds.COLLECTION_DATA_SOURCE — Collection data source singleton
 *   SystemIds.TABLE_VIEW             — Table view
 *   SystemIds.LIST_VIEW              — List view
 *   SystemIds.GALLERY_VIEW           — Gallery view
 *   SystemIds.BULLETED_LIST_VIEW     — Bulleted list view
 *   SystemIds.FILTER                 — Filter property for data blocks
 *   SystemIds.VIEW_PROPERTY          — View preference property
 *   SystemIds.IMAGE_URL_PROPERTY     — Image/media source URL
 *   SystemIds.IMAGE_WIDTH_PROPERTY   — Image width
 *   SystemIds.IMAGE_HEIGHT_PROPERTY  — Image height
 *   SystemIds.COVER_PROPERTY         — Cover image property
 *
 *   ContentIds.TOPIC_TYPE            — Topic type
 *   ContentIds.TAG_TYPE              — Tag type
 *   ContentIds.SKILL_TYPE            — Skill type (named "Practice" on testnet)
 *   ContentIds.WEBSITE_PROPERTY      — Website/URL property
 *   ContentIds.TOPICS_PROPERTY       — Topics relation property
 *   ContentIds.AUTHORS_PROPERTY      — Authors relation property
 *   ContentIds.AVATAR_PROPERTY       — Avatar property
 */

export { SystemIds, ContentIds } from "@geoprotocol/geo-sdk";

// ─── API Configuration ───────────────────────────────────────────────────────

export const TESTNET_API_URL = "https://testnet-api.geobrowser.io/graphql";
export const MAINNET_API_URL = "https://api.geobrowser.io/graphql";

/** Default API URL — testnet */
export const API_URL = TESTNET_API_URL;
