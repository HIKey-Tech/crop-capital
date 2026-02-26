import { Request, Response, NextFunction } from "express";
import { User } from "./user.model";
import { Investment } from "../investments/investment.model";
import { promoteToAdmin, demoteFromAdmin } from "./user.service";

// Get all users (admin only)
export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const tenantId = req.tenant?._id;
    const users = await User.find({
      role: "investor",
      ...(tenantId ? { tenantId } : {}),
    }).select("-password");

    // Get investment stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const investments = await Investment.find({
          investor: user._id,
          status: "completed",
          ...(tenantId ? { tenantId } : {}),
        });

        const totalInvested = investments.reduce(
          (sum, inv) => sum + inv.amount,
          0,
        );
        const activeProjects = investments.filter((inv) => !inv.roiPaid).length;

        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          country: user.country,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
          totalInvested,
          activeProjects,
        };
      }),
    );

    res.status(200).json({
      success: true,
      count: usersWithStats.length,
      users: usersWithStats,
    });
  } catch (error) {
    next(error);
  }
};

// Get single user by ID with investments (admin only)
export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const tenantId = req.tenant?._id;
    const { id } = req.params;
    const user = await User.findOne({
      _id: id,
      ...(tenantId ? { tenantId } : {}),
    }).select("-password");

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // Get user's investments
    const investments = await Investment.find({
      investor: user._id,
      ...(tenantId ? { tenantId } : {}),
    }).populate("farm");

    const totalInvested = investments
      .filter((inv) => inv.status === "completed")
      .reduce((sum, inv) => sum + inv.amount, 0);

    const activeInvestments = investments.filter(
      (inv) => inv.status === "completed" && !inv.roiPaid,
    ).length;

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        country: user.country,
        photo: user.photo,
        isVerified: user.isVerified,
        role: user.role,
        createdAt: user.createdAt,
        totalInvested,
        activeInvestments,
      },
      investments: investments.map((inv) => ({
        _id: inv._id,
        farm: inv.farm,
        amount: inv.amount,
        status: inv.status,
        roi: inv.roi,
        projectedReturn: inv.projectedReturn(),
        durationMonths: inv.durationMonths,
        roiPaid: inv.roiPaid,
        createdAt: inv.createdAt,
        updatedAt: inv.updatedAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// Get user statistics (admin only)
export const getUserStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const tenantId = req.tenant?._id;
    const totalUsers = await User.countDocuments({
      role: "investor",
      ...(tenantId ? { tenantId } : {}),
    });
    const verifiedUsers = await User.countDocuments({
      role: "investor",
      isVerified: true,
      ...(tenantId ? { tenantId } : {}),
    });

    const investments = await Investment.find({
      status: "completed",
      ...(tenantId ? { tenantId } : {}),
    });
    const totalVolume = investments.reduce((sum, inv) => sum + inv.amount, 0);

    // Get unique active investors (those with non-paid ROI investments)
    const activeInvestorIds = await Investment.distinct("investor", {
      status: "completed",
      roiPaid: false,
      ...(tenantId ? { tenantId } : {}),
    });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        verifiedUsers,
        totalVolume,
        activeInvestors: activeInvestorIds.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get investor dashboard stats
export const getMyDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const tenantId = req.tenant?._id;

    // Get all completed investments for this user
    const investments = await Investment.find({
      investor: userId,
      status: "completed",
      ...(tenantId ? { tenantId } : {}),
    });

    // Calculate total invested
    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);

    // Calculate active projects (completed status but ROI not paid yet)
    const activeProjects = investments.filter((inv) => !inv.roiPaid).length;

    // Calculate ROI earned (only from investments where ROI has been paid)
    const roiEarned = investments
      .filter((inv) => inv.roiPaid)
      .reduce((sum, inv) => sum + (inv.projectedReturn() - inv.amount), 0);

    res.status(200).json({
      success: true,
      stats: {
        totalInvested,
        activeProjects,
        roiEarned,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Promote user to admin (admin only)
export const promoteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const tenantId = req.tenant?._id?.toString();
    const user = await promoteToAdmin(id, tenantId);

    res.status(200).json({
      success: true,
      message: "User promoted to admin successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Demote admin to investor (admin only)
export const demoteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const tenantId = req.tenant?._id?.toString();
    const user = await demoteFromAdmin(id, tenantId);

    res.status(200).json({
      success: true,
      message: "User demoted to investor successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Add farm to watchlist
export const addToWatchlist = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { farmId } = req.body;
    const tenantId = req.tenant?._id;

    if (!farmId) {
      res.status(400).json({ success: false, message: "Farm ID is required" });
      return;
    }

    const user = await User.findOne({
      _id: userId,
      ...(tenantId ? { tenantId } : {}),
    });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // Check if already in watchlist
    if (user.watchlist.includes(farmId)) {
      res.status(400).json({
        success: false,
        message: "Farm already in watchlist",
      });
      return;
    }

    user.watchlist.push(farmId);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Farm added to watchlist",
      watchlist: user.watchlist,
    });
  } catch (error) {
    next(error);
  }
};

// Remove farm from watchlist
export const removeFromWatchlist = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { farmId } = req.params;
    const tenantId = req.tenant?._id;

    const user = await User.findOne({
      _id: userId,
      ...(tenantId ? { tenantId } : {}),
    });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    user.watchlist = user.watchlist.filter(
      (id) => id.toString() !== farmId.toString(),
    );
    await user.save();

    res.status(200).json({
      success: true,
      message: "Farm removed from watchlist",
      watchlist: user.watchlist,
    });
  } catch (error) {
    next(error);
  }
};

// Get user's watchlist
export const getWatchlist = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const tenantId = req.tenant?._id;

    const user = await User.findOne({
      _id: userId,
      ...(tenantId ? { tenantId } : {}),
    }).populate("watchlist");
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.status(200).json({
      success: true,
      watchlist: user.watchlist,
    });
  } catch (error) {
    next(error);
  }
};
