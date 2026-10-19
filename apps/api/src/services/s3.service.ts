import fs from 'node:fs/promises';
import path from 'node:path';
import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface StorageService {
  getUploadUrl(key: string, contentType: string): Promise<{ uploadUrl: string; key: string }>;
  getDownloadUrl(key: string): Promise<string>;
  getObjectMetadata(key: string): Promise<{ contentType?: string; size: number }>;
  /** Stores a file the API received itself (no browser-to-storage upload, so no storage CORS set-up is needed). */
  putObject(key: string, body: Buffer, contentType: string): Promise<void>;
  /** Reads a stored file back (for an administrator reviewing it). */
  getObject(key: string): Promise<Buffer>;
  deleteObject(key: string): Promise<void>;
}

export class StorageNotConfiguredError extends Error {
  constructor() {
    super('Document storage is not configured');
    this.name = 'StorageNotConfiguredError';
  }
}

/**
 * Files on the server's own disk, used when no S3 bucket is configured, so uploads work out of the box. The folder is UPLOADS_DIR
 * (default apps/api/uploads). It is never served as static files: a file only leaves it through an administrator's authenticated request.
 * Back it up with the database.
 */
class LocalStorageService implements StorageService {
  private readonly root = path.resolve(process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads'));
  private fileFor(key: string): string {
    const full = path.resolve(this.root, key);
    if (!full.startsWith(this.root + path.sep)) throw new Error('Invalid storage key');
    return full;
  }
  async getUploadUrl(): Promise<never> {
    throw new StorageNotConfiguredError(); // uploads go through putObject instead
  }
  async getDownloadUrl(): Promise<never> {
    throw new StorageNotConfiguredError();
  }
  async getObjectMetadata(key: string) {
    const stat = await fs.stat(this.fileFor(key));
    return { size: stat.size };
  }
  async putObject(key: string, body: Buffer) {
    const file = this.fileFor(key);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, body, { mode: 0o600 });
  }
  async getObject(key: string) {
    return fs.readFile(this.fileFor(key));
  }
  async deleteObject(key: string) {
    await fs.rm(this.fileFor(key), { force: true });
  }
}

class S3StorageService implements StorageService {
  private readonly client: S3Client;

  constructor(private readonly bucket: string, region: string, credentials: { accessKeyId: string; secretAccessKey: string }) {
    this.client = new S3Client({
      region,
      // Explicit keys: without them the SDK looks for AWS credentials (including a long wait on the AWS metadata address), and on any
      // server that is not on AWS a request would hang until nginx answered 504.
      credentials,
      maxAttempts: 2,
      endpoint: process.env.S3_ENDPOINT || undefined,
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    });
  }

  async getUploadUrl(key: string, contentType: string) {
    const command = new PutObjectCommand({ Bucket: this.bucket, Key: key, ContentType: contentType });
    return { uploadUrl: await getSignedUrl(this.client, command, { expiresIn: 300 }), key };
  }

  async getDownloadUrl(key: string) {
    return getSignedUrl(this.client, new GetObjectCommand({ Bucket: this.bucket, Key: key }), { expiresIn: 300 });
  }

  async getObjectMetadata(key: string) {
    const result = await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));
    return { contentType: result.ContentType, size: result.ContentLength ?? 0 };
  }

  async putObject(key: string, body: Buffer, contentType: string) {
    await this.client.send(new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: body, ContentType: contentType }));
  }

  async getObject(key: string) {
    const result = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
    return Buffer.from(await (result.Body as { transformToByteArray(): Promise<Uint8Array> }).transformToByteArray());
  }

  async deleteObject(key: string) {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}

let instance: StorageService | null = null;

export function getStorageService(): StorageService {
  if (!instance) {
    const bucket = process.env.S3_BUCKET;
    const region = process.env.S3_REGION;
    const accessKeyId = process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
    if (bucket && region && accessKeyId && secretAccessKey) {
      instance = new S3StorageService(bucket, region, { accessKeyId, secretAccessKey });
    } else {
      if (bucket || region) console.warn('[storage] S3_BUCKET/S3_REGION are set but S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY are not, so documents are stored on the server disk instead.');
      instance = new LocalStorageService();
    }
  }
  return instance;
}
