import { Router } from "express";
import { getBanks, resolveAccount } from "./payment.controller";

const router = Router();

router.get("/banks", getBanks);
router.get("/resolve-account", resolveAccount);

export default router;
