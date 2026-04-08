import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUserBankAccount {
  accountName: string;
  bankName: string;
  bankCode?: string;
  accountNumber: string;
}

export interface IUserOnboarding {
  goal?: "income" | "growth" | "balanced";
  experience?: "first-time" | "some-experience" | "advanced";
  termsAccepted?: boolean;
  completedAt?: Date;
}

export interface IUser extends Document {
  tenantId?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: "investor" | "admin" | "super_admin";
  country?: string;
  photo?: string;
  photoPublicId?: string;
  bankAccount?: IUserBankAccount;
  onboarding?: IUserOnboarding;
  isVerified: boolean;
  watchlist: mongoose.Types.ObjectId[];
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  inviteToken?: string;
  inviteTokenExpires?: Date;
  comparePassword(candidate: string): Promise<boolean>;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["investor", "admin", "super_admin"],
      default: "investor",
    },
    country: { type: String },
    photo: { type: String },
    photoPublicId: { type: String },
    bankAccount: {
      _id: false,
      type: {
        accountName: { type: String, trim: true },
        bankName: { type: String, trim: true },
        bankCode: { type: String, trim: true },
        accountNumber: { type: String, trim: true },
      },
      default: undefined,
    },
    onboarding: {
      _id: false,
      type: {
        goal: { type: String, enum: ["income", "growth", "balanced"] },
        experience: {
          type: String,
          enum: ["first-time", "some-experience", "advanced"],
        },
        termsAccepted: { type: Boolean },
        completedAt: { type: Date },
      },
      default: undefined,
    },
    isVerified: { type: Boolean, default: false },
    watchlist: [{ type: Schema.Types.ObjectId, ref: "Farm", default: [] }],
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    inviteToken: { type: String },
    inviteTokenExpires: { type: Date },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

UserSchema.index({ tenantId: 1, email: 1 }, { unique: true, sparse: true });

// ✅ Hash password before save
UserSchema.pre("save", async function (this: IUser) {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ✅ Compare passwords
UserSchema.methods.comparePassword = async function (
  candidate: string,
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model<IUser>("User", UserSchema);
