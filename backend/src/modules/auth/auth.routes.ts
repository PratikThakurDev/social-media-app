import { Router } from "express";
import { register, login, refreshToken, logout , getProfile } from "./auth.controller";
import { validate } from "../../middleware/validate.middleware";
import { authenticateJWT } from "../../middleware/auth.middleware";
import { registerSchema, loginSchema } from "./auth.validators";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.get("/me", authenticateJWT, getProfile);

export default router;
