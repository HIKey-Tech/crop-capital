import mongoose, { Document, Schema } from "mongoose";
import {
  FarmCurrency,
  SUPPORTED_FARM_CURRENCIES,
} from "@/modules/farms/farm.model";

export type CommodityOrderStatus =
  | "pending"
  | "confirmed"
  | "fulfilled"
  | "cancelled";

export interface ICommodity extends Document {
  tenantId?: mongoose.Types.ObjectId;
  sellerId?: mongoose.Types.ObjectId;
  name: string;
  category: string;
  description?: string;
  location: string;
  currency: FarmCurrency;
  price: number;
  unit: string;
  availableQuantity: number;
  minimumOrderQuantity: number;
  images: string[];
  imagePublicIds: string[];
  isFeatured: boolean;
  isPublished: boolean;
  soldQuantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommodityOrderItem {
  commodity: mongoose.Types.ObjectId;
  name: string;
  unit: string;
  image?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface ICommodityOrder extends Document {
  tenantId?: mongoose.Types.ObjectId;
  buyer: mongoose.Types.ObjectId;
  buyerName: string;
  buyerEmail: string;
  contactPhone?: string;
  deliveryAddress?: string;
  customerNote?: string;
  currency: FarmCurrency;
  items: ICommodityOrderItem[];
  subtotal: number;
  status: CommodityOrderStatus;
  statusNote?: string;
  paystackReference?: string;
  paystackAccessCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommoditySchema = new Schema<ICommodity>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", index: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    location: { type: String, required: true, trim: true },
    currency: {
      type: String,
      enum: SUPPORTED_FARM_CURRENCIES,
      default: "NGN",
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, trim: true },
    availableQuantity: { type: Number, required: true, min: 0 },
    minimumOrderQuantity: { type: Number, required: true, min: 1 },
    images: { type: [String], required: true },
    imagePublicIds: { type: [String], required: true },
    isFeatured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    soldQuantity: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

CommoditySchema.index({ tenantId: 1, createdAt: -1 });
CommoditySchema.index({ tenantId: 1, isPublished: 1, isFeatured: -1 });
CommoditySchema.index({ tenantId: 1, category: 1 });

const CommodityOrderItemSchema = new Schema<ICommodityOrderItem>(
  {
    commodity: {
      type: Schema.Types.ObjectId,
      ref: "Commodity",
      required: true,
    },
    name: { type: String, required: true },
    unit: { type: String, required: true },
    image: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const CommodityOrderSchema = new Schema<ICommodityOrder>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", index: true },
    buyer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    buyerName: { type: String, required: true },
    buyerEmail: { type: String, required: true },
    contactPhone: { type: String },
    deliveryAddress: { type: String },
    customerNote: { type: String },
    currency: {
      type: String,
      enum: SUPPORTED_FARM_CURRENCIES,
      default: "NGN",
      required: true,
    },
    items: { type: [CommodityOrderItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "fulfilled", "cancelled"],
      default: "pending",
      required: true,
    },
    statusNote: { type: String },
    paystackReference: { type: String },
    paystackAccessCode: { type: String },
  },
  { timestamps: true },
);

CommodityOrderSchema.index({ tenantId: 1, createdAt: -1 });
CommodityOrderSchema.index({ tenantId: 1, status: 1, createdAt: -1 });

export const Commodity = mongoose.model<ICommodity>(
  "Commodity",
  CommoditySchema,
);

export const CommodityOrder = mongoose.model<ICommodityOrder>(
  "CommodityOrder",
  CommodityOrderSchema,
);
