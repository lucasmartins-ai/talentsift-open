export type StorageObjectMetadata = {
  path: string;
  contentType: "application/pdf" | "text/plain";
  sizeBytes: number;
};

export interface StorageAdapter {
  putObject(input: {
    path: string;
    bytes: Uint8Array;
    contentType: "application/pdf" | "text/plain";
  }): Promise<StorageObjectMetadata>;
  deleteObject(path: string): Promise<void>;
}
