import { Router, type IRouter } from "express";
import healthRouter from "./health";
import phrRouter from "./phr";

const router: IRouter = Router();

router.use(healthRouter);
router.use(phrRouter);

export default router;
