// ── API Response Types ──

export interface SearchResponse {
  status: 'success' | 'error';
  data: DocumentResult[];
  searchTags: string[];
  message?: string;
}

export interface DocumentResult {
  id: string;
  title: string;
  description: string;
  filePath: string | null;
  authorId: number | null;
  authorName?: string | null;
  statusId: number | null;
  companyId: number | null;
  companyName?: string | null;
  parentId: number | null;
  versionNumber: number;
  isLatest: boolean;
  syncedAt: string;
  metadata: DocumentMetadata;
  _matchCount: number;
}

export interface DocumentMetadata {
  fileSize: string;
  mimeType: string;
  extension: string;
  checksum: string;
  sha256: string;
  createdOnDisk: string;
  modifiedOnDisk: string;
  category: 'document' | 'image' | 'cad' | string;
  specific?: DocumentSpecific | ImageSpecific | CadSpecific | Record<string, unknown>;
  tags: string[];
}

export interface DocumentSpecific {
  authorOriginal?: string | null;
  pageCount?: number | null;
  hasImages?: boolean;
  language?: string | null;
}

export interface ImageSpecific {
  dimensions?: string | null;
  width?: number | null;
  height?: number | null;
  colorSpace?: string | null;
  exifData?: {
    make?: string;
    model?: string;
    dateTaken?: string;
    gps?: {
      lat: number | null;
      lng: number | null;
    };
    orientation?: number;
  };
}

export interface CadSpecific {
  softwareVersion?: string | null;
  layers?: string[];
}
