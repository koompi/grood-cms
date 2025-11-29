import sharp from "sharp";
import path from "path";
import { writeFile, mkdir } from "fs/promises";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const THUMBNAIL_DIR = path.join(
  process.cwd(),
  "public",
  "uploads",
  "thumbnails"
);

// Image optimization settings
const OPTIMIZATION_SETTINGS = {
  // Maximum dimensions for uploaded images
  maxWidth: 2400,
  maxHeight: 2400,

  // Thumbnail dimensions
  thumbnailWidth: 400,
  thumbnailHeight: 400,

  // Quality settings (1-100)
  quality: {
    jpeg: 85,
    webp: 80,
    png: 85,
  },
};

export interface OptimizedImage {
  filename: string;
  url: string;
  width: number;
  height: number;
  size: number;
  thumbnailUrl?: string;
  blurDataUrl?: string;
}

/**
 * Ensure directories exist
 */
async function ensureDirectories(): Promise<void> {
  await mkdir(UPLOAD_DIR, { recursive: true });
  await mkdir(THUMBNAIL_DIR, { recursive: true });
}

/**
 * Generate a unique filename
 */
function generateFilename(originalName: string, suffix?: string): string {
  const ext = path.extname(originalName);
  const baseName = path.basename(originalName, ext);
  const sanitized = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const suffixPart = suffix ? `-${suffix}` : "";
  return `${sanitized}-${timestamp}-${random}${suffixPart}${ext.toLowerCase()}`;
}

/**
 * Generate a blur placeholder (tiny base64 image)
 */
async function generateBlurDataUrl(buffer: Buffer): Promise<string> {
  try {
    const blurBuffer = await sharp(buffer)
      .resize(10, 10, { fit: "inside" })
      .blur(5)
      .toBuffer();

    return `data:image/jpeg;base64,${blurBuffer.toString("base64")}`;
  } catch {
    return "";
  }
}

/**
 * Optimize and resize an image
 */
export async function optimizeImage(
  file: File,
  options?: {
    generateThumbnail?: boolean;
    generateBlur?: boolean;
  }
): Promise<OptimizedImage> {
  await ensureDirectories();

  const { generateThumbnail = true, generateBlur = true } = options || {};

  // Read file buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Get image metadata
  const metadata = await sharp(buffer).metadata();
  const mimeType = file.type;

  // Determine output format
  let outputFormat: "jpeg" | "png" | "webp" = "jpeg";
  if (mimeType === "image/png") outputFormat = "png";
  if (mimeType === "image/webp") outputFormat = "webp";

  // Calculate new dimensions (maintain aspect ratio)
  let targetWidth = metadata.width || OPTIMIZATION_SETTINGS.maxWidth;
  let targetHeight = metadata.height || OPTIMIZATION_SETTINGS.maxHeight;

  if (
    targetWidth > OPTIMIZATION_SETTINGS.maxWidth ||
    targetHeight > OPTIMIZATION_SETTINGS.maxHeight
  ) {
    const ratio = Math.min(
      OPTIMIZATION_SETTINGS.maxWidth / targetWidth,
      OPTIMIZATION_SETTINGS.maxHeight / targetHeight
    );
    targetWidth = Math.round(targetWidth * ratio);
    targetHeight = Math.round(targetHeight * ratio);
  }

  // Process the main image
  let pipeline = sharp(buffer).resize(targetWidth, targetHeight, {
    fit: "inside",
    withoutEnlargement: true,
  });

  // Apply format-specific optimizations
  if (outputFormat === "jpeg") {
    pipeline = pipeline.jpeg({
      quality: OPTIMIZATION_SETTINGS.quality.jpeg,
      progressive: true,
    });
  } else if (outputFormat === "png") {
    pipeline = pipeline.png({
      quality: OPTIMIZATION_SETTINGS.quality.png,
      compressionLevel: 8,
    });
  } else if (outputFormat === "webp") {
    pipeline = pipeline.webp({
      quality: OPTIMIZATION_SETTINGS.quality.webp,
    });
  }

  // Get the optimized buffer
  const optimizedBuffer = await pipeline.toBuffer();
  const optimizedMetadata = await sharp(optimizedBuffer).metadata();

  // Generate filename and save
  const filename = generateFilename(file.name);
  const filepath = path.join(UPLOAD_DIR, filename);
  await writeFile(filepath, optimizedBuffer);

  const result: OptimizedImage = {
    filename,
    url: `/uploads/${filename}`,
    width: optimizedMetadata.width || targetWidth,
    height: optimizedMetadata.height || targetHeight,
    size: optimizedBuffer.length,
  };

  // Generate thumbnail
  if (generateThumbnail) {
    try {
      const thumbnailFilename = generateFilename(file.name, "thumb");
      const thumbnailBuffer = await sharp(buffer)
        .resize(
          OPTIMIZATION_SETTINGS.thumbnailWidth,
          OPTIMIZATION_SETTINGS.thumbnailHeight,
          {
            fit: "cover",
            position: "center",
          }
        )
        .jpeg({ quality: 75 })
        .toBuffer();

      await writeFile(
        path.join(THUMBNAIL_DIR, thumbnailFilename),
        thumbnailBuffer
      );
      result.thumbnailUrl = `/uploads/thumbnails/${thumbnailFilename}`;
    } catch (error) {
      console.error("Thumbnail generation failed:", error);
    }
  }

  // Generate blur placeholder
  if (generateBlur) {
    result.blurDataUrl = await generateBlurDataUrl(buffer);
  }

  return result;
}

/**
 * Check if a file is an image that can be optimized
 */
export function isOptimizableImage(mimeType: string): boolean {
  return ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
    mimeType
  );
}

/**
 * Get image dimensions from a buffer
 */
export async function getImageDimensions(
  buffer: Buffer
): Promise<{ width: number; height: number } | null> {
  try {
    const metadata = await sharp(buffer).metadata();
    if (metadata.width && metadata.height) {
      return { width: metadata.width, height: metadata.height };
    }
    return null;
  } catch {
    return null;
  }
}
