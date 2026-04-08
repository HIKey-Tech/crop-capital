import { Router } from "express";
import { getBanks, getCountries, resolveAccount } from "./payment.controller";

const router = Router();

router.get("/countries", getCountries);
router.get("/banks", getBanks);
router.get("/resolve-account", resolveAccount);

export default router;
