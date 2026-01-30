import cloudinary from "../config/cloudinary";

interface UploadResult {
  url: string;
  publicId: string;
}

/**
 * Upload an image to Cloudinary from a base64 string
 * @param base64Image - Base64 encoded image string (with or without data URI prefix)
 * @param folder - Cloudinary folder to upload to
 * @returns Promise with url and publicId
 */
export async function uploadImage(
  base64Image: string,
  folder: string = "farms",
): Promise<UploadResult> {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder,
      resource_type: "image",
      transformation: [
        { width: 1200, height: 800, crop: "limit" },
        { quality: "auto", fetch_format: "auto" },
      ],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image");
  }
}

/**
 * Delete an image from Cloudinary
 * @param publicId - Cloudinary public_id of the image to delete
 * @returns Promise with deletion result
 */
export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
    });
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw new Error("Failed to delete image");
  }
}
