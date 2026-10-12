export interface ManifestFile {
  sha256: string;
  size: number;
  // UTC ISO 8601; only changes when the file's content changes.
  updated_at: string;
}

export interface DataManifest {
  files: Record<string, ManifestFile>;
}
