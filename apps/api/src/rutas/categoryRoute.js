import { Router } from "express";

import { create, getAll } from "../controllers/categoryController.js";
import { verifyTokenMiddeleware } from "../middlewares/verifyTokenMiddleware.js";

const categoryRoute = Router();

categoryRoute.get("/", getAll);
categoryRoute.post("/", verifyTokenMiddeleware, create);

export default categoryRoute;
