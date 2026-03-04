import { Router } from "express";
import { syncUser } from "../controllers/userController";
import { requireAuth } from "@clerk/express";

const router = Router();

// /api/users/sync - POST => Sync the clerk user to DB (PROTECTED)
router.post("/sync", requireAuth(), syncUser)

export default router;