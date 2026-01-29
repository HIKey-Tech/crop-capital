import { Request, Response, NextFunction } from "express";
import { User } from "./user.model";
import { Investment } from "../investments/investment.model";

// Get all users (admin only)
export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const users = await User.find({ role: "investor" }).select("-password");

    // Get investment stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const investments = await Investment.find({
          investor: user._id,
          status: "completed",
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

// Get user statistics (admin only)
export const getUserStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments({ role: "investor" });
    const verifiedUsers = await User.countDocuments({
      role: "investor",
      isVerified: true,
    });

    const investments = await Investment.find({ status: "completed" });
    const totalVolume = investments.reduce((sum, inv) => sum + inv.amount, 0);

    // Get unique active investors (those with non-paid ROI investments)
    const activeInvestorIds = await Investment.distinct("investor", {
      status: "completed",
      roiPaid: false,
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
