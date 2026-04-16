// scripts/migrate-posts/types.ts

export interface MigratedPost {
  /** Absolute path to the source .md file */
  sourceFile: string;
  /** Output slug (post-rename if Chinese filename) */
  slug: string;
  /** Parsed & transformed frontmatter */
  frontmatter: {
    title: string;
    date: Date;
    tags: string[];
    description: string;
    [key: string]: unknown;
  };
  /** Transformed markdown body */
  body: string;
  /** Assets to copy into <slug>/. Map of source abs path → output filename */
  assets: Map<string, string>;
  /** Non-fatal warnings surfaced to Bolas at end of dry-run */
  warnings: string[];
}
