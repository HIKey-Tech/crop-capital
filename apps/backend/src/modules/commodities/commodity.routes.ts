import { Router } from "express";
import { protect } from "@/middlewares/auth.middleware";
import { restrictTo } from "@/middlewares/role.middleware";
import {
  requireAnyTenantFeature,
  requireTenantFeature,
} from "@/middlewares/feature.middleware";
import { commodityImagesUpload } from "@/middlewares/upload.middleware";
import {
  createCommodity,
  createCommodityOrder,
  deleteCommodity,
  getCommodity,
  getCommodities,
  listMyCommodityOrders,
  listCommodityOrders,
  updateCommodity,
  updateCommodityOrderStatus,
} from "./commodity.controller";

const router = Router();

router.get(
  "/",
  protect,
  restrictTo("investor", "admin"),
  requireAnyTenantFeature(["marketplace", "adminMarketplace"]),
  getCommodities,
);

router.get(
  "/orders/me",
  protect,
  restrictTo("investor", "admin"),
  requireAnyTenantFeature(["marketplace", "adminMarketplace"]),
  listMyCommodityOrders,
);

router.get(
  "/orders",
  protect,
  restrictTo("admin"),
  requireTenantFeature("adminMarketplace"),
  listCommodityOrders,
);

router.post(
  "/orders",
  protect,
  restrictTo("investor", "admin"),
  requireAnyTenantFeature(["marketplace", "adminMarketplace"]),
  createCommodityOrder,
);

router.patch(
  "/orders/:id",
  protect,
  restrictTo("admin"),
  requireTenantFeature("adminMarketplace"),
  updateCommodityOrderStatus,
);

router.get(
  "/:id",
  protect,
  restrictTo("investor", "admin"),
  requireAnyTenantFeature(["marketplace", "adminMarketplace"]),
  getCommodity,
);

router.post(
  "/",
  protect,
  restrictTo("admin"),
  requireTenantFeature("adminMarketplace"),
  commodityImagesUpload,
  createCommodity,
);

router.patch(
  "/:id",
  protect,
  restrictTo("admin"),
  requireTenantFeature("adminMarketplace"),
  commodityImagesUpload,
  updateCommodity,
);

router.delete(
  "/:id",
  protect,
  restrictTo("admin"),
  requireTenantFeature("adminMarketplace"),
  deleteCommodity,
);

export default router;
