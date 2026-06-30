import type { StorageAdapter, StorageObjectMetadata } from "./storage-adapter";

export class MockStorageAdapter implements StorageAdapter {
  private objects = new Map<string, StorageObjectMetadata>();

  async putObject(input: {
    path: string;
    bytes: Uint8Array;
    contentType: "application/pdf" | "text/plain";
  }): Promise<StorageObjectMetadata> {
    const metadata: StorageObjectMetadata = {
      path: input.path,
      contentType: input.contentType,
      sizeBytes: input.bytes.byteLength,
    };
    const objects = new Map(this.objects);
    objects.set(input.path, metadata);
    this.objects = objects;
    return metadata;
  }

  async deleteObject(path: string): Promise<void> {
    const objects = new Map(this.objects);
    objects.delete(path);
    this.objects = objects;
  }
}
