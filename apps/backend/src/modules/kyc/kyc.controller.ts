import { Request, Response, NextFunction } from "express";
import { AppError } from "@/utils/AppError";
import { KycDocument } from "./kyc.model";
import { User } from "@/modules/users/user.model";
import { uploadImageBuffer, deleteImage } from "@/utils/cloudinary";
import { sendEmail } from "@/utils/email";
import { logActivity } from "@/modules/activities/activity.service";

const getKycImageFile = (
  req: Request,
  fieldName: "documentImage" | "selfieImage",
): Express.Multer.File | undefined => {
  if (!req.files || Array.isArray(req.files)) {
    return undefined;
  }

  const files = req.files[fieldName];
  return Array.isArray(files) ? files[0] : undefined;
};

// Investor: submit KYC documents
export const submitKyc = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?._id;
    const tenantId = req.tenant?._id;
    const { documentType } = req.body;
    const documentImage = getKycImageFile(req, "documentImage");
    const selfieImage = getKycImageFile(req, "selfieImage");

    if (!documentType || !documentImage) {
      return next(
        new AppError("Document type and document image are required", 400),
      );
    }

    // Check for existing pending or approved KYC
    const existing = await KycDocument.findOne({
      user: userId,
      status: { $in: ["pending", "approved"] },
      ...(tenantId ? { tenantId } : {}),
    });

    if (existing?.status === "approved") {
      return next(new AppError("Your KYC is already approved", 400));
    }

    if (existing?.status === "pending") {
      return next(
        new AppError(
          "You already have a pending KYC submission. Please wait for review.",
          400,
        ),
      );
    }

    // Upload document image to Cloudinary
    const { url: docUrl, publicId: docPublicId } = await uploadImageBuffer(
      documentImage.buffer,
      "kyc-documents",
    );

    const kycData: Record<string, unknown> = {
      user: userId,
      ...(tenantId ? { tenantId } : {}),
      documentType,
      documentImage: docUrl,
      documentImagePublicId: docPublicId,
      status: "pending",
    };

    // Upload selfie if provided
    if (selfieImage) {
      const { url: selfieUrl, publicId: selfiePublicId } =
        await uploadImageBuffer(selfieImage.buffer, "kyc-selfies");
      kycData.selfieImage = selfieUrl;
      kycData.selfieImagePublicId = selfiePublicId;
    }

    const kycDoc = await KycDocument.create(kycData);

    logActivity({
      type: "kyc_submitted",
      title: "KYC Submitted",
      description: `${req.user?.name ?? "A user"} submitted KYC documents`,
      actor: userId,
      resourceId: kycDoc._id,
      resourceType: "KycDocument",
      metadata: { documentType },
      tenantId: tenantId?.toString(),
    });

    res.status(201).json({
      success: true,
      message: "KYC documents submitted successfully. Review is pending.",
      kyc: {
        _id: kycDoc._id,
        documentType: kycDoc.documentType,
        status: kycDoc.status,
        createdAt: kycDoc.createdAt,
      },
    });
  } catch (err: any) {
    next(new AppError(err.message, 400));
  }
};

// Investor: get own KYC status
export const getMyKyc = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?._id;
    const tenantId = req.tenant?._id;

    const kyc = await KycDocument.findOne({
      user: userId,
      ...(tenantId ? { tenantId } : {}),
    })
      .sort({ createdAt: -1 })
      .select("-documentImagePublicId -selfieImagePublicId");

    res.json({
      success: true,
      kyc: kyc
        ? {
            _id: kyc._id,
            documentType: kyc.documentType,
            documentImage: kyc.documentImage,
            selfieImage: kyc.selfieImage,
            status: kyc.status,
            rejectionReason: kyc.rejectionReason,
            createdAt: kyc.createdAt,
            reviewedAt: kyc.reviewedAt,
          }
        : null,
    });
  } catch (err: any) {
    next(new AppError(err.message, 400));
  }
};

// Investor: resubmit KYC after rejection
export const resubmitKyc = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?._id;
    const tenantId = req.tenant?._id;
    const { documentType } = req.body;
    const documentImage = getKycImageFile(req, "documentImage");
    const selfieImage = getKycImageFile(req, "selfieImage");

    if (!documentType || !documentImage) {
      return next(
        new AppError("Document type and document image are required", 400),
      );
    }

    // Find the rejected KYC
    const rejected = await KycDocument.findOne({
      user: userId,
      status: "rejected",
      ...(tenantId ? { tenantId } : {}),
    }).sort({ createdAt: -1 });

    if (!rejected) {
      return next(
        new AppError("No rejected KYC submission found to resubmit", 400),
      );
    }

    // Delete old images from Cloudinary
    if (rejected.documentImagePublicId) {
      await deleteImage(rejected.documentImagePublicId);
    }
    if (rejected.selfieImagePublicId) {
      await deleteImage(rejected.selfieImagePublicId);
    }

    // Upload new document image
    const { url: docUrl, publicId: docPublicId } = await uploadImageBuffer(
      documentImage.buffer,
      "kyc-documents",
    );

    rejected.documentType = documentType;
    rejected.documentImage = docUrl;
    rejected.documentImagePublicId = docPublicId;
    rejected.status = "pending";
    rejected.rejectionReason = undefined;
    rejected.reviewedBy = undefined;
    rejected.reviewedAt = undefined;

    // Upload new selfie if provided
    if (selfieImage) {
      const { url: selfieUrl, publicId: selfiePublicId } =
        await uploadImageBuffer(selfieImage.buffer, "kyc-selfies");
      rejected.selfieImage = selfieUrl;
      rejected.selfieImagePublicId = selfiePublicId;
    } else {
      rejected.selfieImage = undefined;
      rejected.selfieImagePublicId = undefined;
    }

    await rejected.save();

    res.json({
      success: true,
      message: "KYC documents resubmitted successfully.",
      kyc: {
        _id: rejected._id,
        documentType: rejected.documentType,
        status: rejected.status,
        createdAt: rejected.createdAt,
      },
    });
  } catch (err: any) {
    next(new AppError(err.message, 400));
  }
};

// Admin: get all KYC submissions
export const getAllKyc = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tenantId = req.tenant?._id;
    const { status } = req.query;

    const filter: Record<string, unknown> = tenantId ? { tenantId } : {};
    if (
      status &&
      ["pending", "approved", "rejected"].includes(status as string)
    ) {
      filter.status = status;
    }

    const submissions = await KycDocument.find(filter)
      .populate("user", "name email country photo")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 });

    // Count by status
    const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
      KycDocument.countDocuments({
        status: "pending",
        ...(tenantId ? { tenantId } : {}),
      }),
      KycDocument.countDocuments({
        status: "approved",
        ...(tenantId ? { tenantId } : {}),
      }),
      KycDocument.countDocuments({
        status: "rejected",
        ...(tenantId ? { tenantId } : {}),
      }),
    ]);

    res.json({
      success: true,
      stats: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        total: pendingCount + approvedCount + rejectedCount,
      },
      submissions,
    });
  } catch (err: any) {
    next(new AppError(err.message, 400));
  }
};

// Admin: get single KYC submission
export const getKycById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tenantId = req.tenant?._id;
    const kyc = await KycDocument.findOne({
      _id: req.params.id,
      ...(tenantId ? { tenantId } : {}),
    })
      .populate("user", "name email country photo createdAt")
      .populate("reviewedBy", "name email");

    if (!kyc) return next(new AppError("KYC submission not found", 404));

    res.json({ success: true, kyc });
  } catch (err: any) {
    next(new AppError(err.message, 400));
  }
};

// Admin: approve KYC
export const approveKyc = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tenantId = req.tenant?._id;
    const kyc = await KycDocument.findOne({
      _id: req.params.id,
      ...(tenantId ? { tenantId } : {}),
    }).populate("user", "name email");
    if (!kyc) return next(new AppError("KYC submission not found", 404));

    if (kyc.status === "approved") {
      return next(new AppError("KYC is already approved", 400));
    }

    kyc.status = "approved";
    kyc.reviewedBy = req.user?._id;
    kyc.reviewedAt = new Date();
    kyc.rejectionReason = undefined;
    await kyc.save();

    // Mark user as verified
    await User.findOneAndUpdate(
      {
        _id: kyc.user._id,
        ...(tenantId ? { tenantId } : {}),
      },
      { isVerified: true },
    );

    logActivity({
      type: "kyc_approved",
      title: "KYC Approved",
      description: `${(kyc.user as any).name}'s identity was verified`,
      actor: req.user?._id,
      resourceId: kyc._id,
      resourceType: "KycDocument",
      tenantId: tenantId?.toString(),
    });

    // Send approval email
    const user = kyc.user as any;
    try {
      await sendEmail(
        user.email,
        "KYC Verification Approved - CropCapital",
        `
        <h2>Identity Verified!</h2>
        <p>Dear ${user.name},</p>
        <p>Your identity verification has been approved. You now have full access to all investment opportunities on CropCapital.</p>
        <p>Thank you for completing the verification process.</p>
        <br/>
        <p>Best regards,<br/>CropCapital Team</p>
        `,
      );
    } catch {
      console.error("Failed to send KYC approval email");
    }

    res.json({
      success: true,
      message: "KYC approved successfully",
      kyc: {
        _id: kyc._id,
        status: kyc.status,
        reviewedAt: kyc.reviewedAt,
      },
    });
  } catch (err: any) {
    next(new AppError(err.message, 400));
  }
};

// Admin: reject KYC
export const rejectKyc = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tenantId = req.tenant?._id;
    const { reason } = req.body;

    if (!reason) {
      return next(new AppError("Rejection reason is required", 400));
    }

    const kyc = await KycDocument.findOne({
      _id: req.params.id,
      ...(tenantId ? { tenantId } : {}),
    }).populate("user", "name email");
    if (!kyc) return next(new AppError("KYC submission not found", 404));

    if (kyc.status === "rejected") {
      return next(new AppError("KYC is already rejected", 400));
    }

    kyc.status = "rejected";
    kyc.rejectionReason = reason;
    kyc.reviewedBy = req.user?._id;
    kyc.reviewedAt = new Date();
    await kyc.save();

    logActivity({
      type: "kyc_rejected",
      title: "KYC Rejected",
      description: `${(kyc.user as any).name}'s KYC was rejected`,
      actor: req.user?._id,
      resourceId: kyc._id,
      resourceType: "KycDocument",
      metadata: { reason },
      tenantId: tenantId?.toString(),
    });

    // Send rejection email
    const user = kyc.user as any;
    try {
      await sendEmail(
        user.email,
        "KYC Verification Update - CropCapital",
        `
        <h2>Verification Update</h2>
        <p>Dear ${user.name},</p>
        <p>Unfortunately, your identity verification could not be approved at this time.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>Please log in to your account and resubmit your documents with the corrections noted above.</p>
        <br/>
        <p>Best regards,<br/>CropCapital Team</p>
        `,
      );
    } catch {
      console.error("Failed to send KYC rejection email");
    }

    res.json({
      success: true,
      message: "KYC rejected",
      kyc: {
        _id: kyc._id,
        status: kyc.status,
        rejectionReason: kyc.rejectionReason,
        reviewedAt: kyc.reviewedAt,
      },
    });
  } catch (err: any) {
    next(new AppError(err.message, 400));
  }
};
