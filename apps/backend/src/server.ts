import app from "@/app";

import { connectDB } from "@/config/db";
import { PORT } from "@/config/env";
import {
  Commodity,
  CommodityOrder,
} from "@/modules/commodities/commodity.model";
import cron from "node-cron";

// Release stock that has been held for pending orders whose payment window has expired.
// Paystack authorization URLs expire after 20 minutes; we wait 30 minutes before reclaiming.
const PENDING_ORDER_TTL_MS = 30 * 60 * 1000;

const expireStaleOrders = async () => {
  const cutoff = new Date(Date.now() - PENDING_ORDER_TTL_MS);

  // Atomically claim each stale order by flipping status in the same query.
  // This prevents a race where a concurrent webhook already set the order to
  // "completed" — findOneAndUpdate will return null for those and we skip them.
  let cancelled = 0;
  while (true) {
    const order = await CommodityOrder.findOneAndUpdate(
      { status: "pending", createdAt: { $lte: cutoff } },
      {
        status: "cancelled",
        statusNote: "Automatically cancelled — payment window expired",
      },
      { new: false }, // we need the old items list
    );

    if (!order) break;

    await Promise.all(
      order.items.map((item) =>
        Commodity.findByIdAndUpdate(item.commodity, {
          $inc: {
            availableQuantity: item.quantity,
            soldQuantity: -item.quantity,
          },
        }),
      ),
    );

    cancelled++;
    console.log(
      `[expireStaleOrders] Cancelled stale order ${order._id.toString()} and restocked ${order.items.length} item(s)`,
    );
  }

  if (cancelled > 0) {
    console.log(`[expireStaleOrders] Cancelled ${cancelled} stale order(s)`);
  }
};

const startServer = async () => {
  await connectDB();

  // Run every 5 minutes
  cron.schedule("*/5 * * * *", () => {
    expireStaleOrders().catch((err) =>
      console.error("[expireStaleOrders] Error:", err),
    );
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
