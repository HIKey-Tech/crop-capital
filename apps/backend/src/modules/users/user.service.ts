import { User } from "./user.model";

export const promoteToAdmin = async (userId: string, tenantId?: string) => {
  const user = await User.findOne({
    _id: userId,
    ...(tenantId ? { tenantId } : {}),
  });
  if (!user) throw new Error("User not found");

  if (user.role === "admin") {
    throw new Error("User is already an admin");
  }

  user.role = "admin";
  await user.save();
  return user;
};

export const demoteFromAdmin = async (userId: string, tenantId?: string) => {
  const user = await User.findOne({
    _id: userId,
    ...(tenantId ? { tenantId } : {}),
  });
  if (!user) throw new Error("User not found");

  if (user.role === "investor") {
    throw new Error("User is already an investor");
  }

  user.role = "investor";
  await user.save();
  return user;
};
