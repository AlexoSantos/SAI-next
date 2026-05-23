import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import weatherRouter from "./weather";
import forecastRouter from "./forecast";
import fireRouter from "./fire";
import airQualityRouter from "./air-quality";
import alertsRouter from "./alerts";
import analyticsRouter from "./analytics";
import stationsRouter from "./stations";
import adminRouter from "./admin";
import riskAreasRouter from "./risk-areas";
import realtimeRouter from "./realtime";
import riskRouter from "./risk";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(weatherRouter);
router.use(forecastRouter);
router.use(fireRouter);
router.use(airQualityRouter);
router.use(alertsRouter);
router.use(analyticsRouter);
router.use(stationsRouter);
router.use(adminRouter);
router.use(riskAreasRouter);
router.use(realtimeRouter);
router.use(riskRouter);

export default router;
