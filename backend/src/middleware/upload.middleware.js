import multer from "multer";
import { AppError } from "../utils/AppError.js";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB per file
const MAX_FILES = 7; // count cap

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

// First-pass filter on the client-declared MIME type. This is spoofable, so it is
// only a fast reject — the authoritative check is the magic-byte sniff below.
function fileFilter(_req, file, cb) {
  if (ALLOWED_MIME.has(file.mimetype)) return cb(null, true);
  cb(new AppError(`Unsupported file type: ${file.mimetype}`, 400, "INVALID_FILE_TYPE"));
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_BYTES, files: MAX_FILES },
  fileFilter,
});

// Accept up to MAX_FILES images under the "images" field.
export const uploadImages = upload.array("images", MAX_FILES);

// Magic-byte signatures for the image types we accept. Checking the actual file
// content (not the extension or the client-declared MIME) prevents a non-image
// being streamed to the CDN under an image content-type.
const SIGNATURES = [
  { type: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { type: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { type: "image/gif", bytes: [0x47, 0x49, 0x46, 0x38] }, // "GIF8"
];

function sniffImageType(buffer) {
  if (!buffer || buffer.length < 12) return null;
  for (const { type, bytes } of SIGNATURES) {
    if (bytes.every((b, i) => buffer[i] === b)) return type;
  }
  // WEBP: bytes 0-3 = "RIFF", bytes 8-11 = "WEBP".
  if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
    return "image/webp";
  }
  return null;
}

// Runs after multer: confirm every uploaded buffer really is one of the allowed
// image types by sniffing its magic bytes. Express 5 forwards a thrown error to
// the central error handler.
export function validateImageFiles(req, _res, next) {
  for (const file of req.files || []) {
    if (!sniffImageType(file.buffer)) {
      throw new AppError(
        `Uploaded file "${file.originalname}" is not a valid image`,
        400,
        "INVALID_FILE_TYPE",
      );
    }
  }
  next();
}
