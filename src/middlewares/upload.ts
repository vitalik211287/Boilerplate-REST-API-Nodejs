import multer from "multer";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";

const destination = resolve("uploads");

const storage = multer.diskStorage({
  destination,
  filename: (req, file, cb) => {
    const newFilename = `${randomUUID()}_${file.originalname}`;
    cb(null, newFilename);
  },
});

const limits = {
  fileSize: 5 * 1024 * 1024, // 5MB
};

const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed"));
  }

  cb(null, true);
};

const upload = multer({
  storage,
  limits: limits,
  fileFilter,
});

export default upload;
