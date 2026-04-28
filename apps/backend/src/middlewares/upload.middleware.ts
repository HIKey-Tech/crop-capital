import multer from "multer";
import { AppError } from "@/utils/AppError";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_IMAGE_SIZE_BYTES,
    files: 5,
  },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      callback(new AppError("Only image uploads are allowed", 400));
      return;
    }

    callback(null, true);
  },
});

export const farmImagesUpload = imageUpload.array("images", 5);
export const commodityImagesUpload = imageUpload.array("images", 5);
export const farmUpdateImageUpload = imageUpload.single("image");
export const profilePhotoUpload = imageUpload.single("photo");
export const kycImagesUpload = imageUpload.fields([
  { name: "documentImage", maxCount: 1 },
  { name: "selfieImage", maxCount: 1 },
]);
