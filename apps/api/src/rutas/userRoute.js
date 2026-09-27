import express from "express";

import {
  create,
  get,
  update,
  destroyed,
  validate,
} from "../controllers/userController.js";
import { verifyTokenMiddeleware } from "../middlewares/verifyTokenMiddleware.js";

const userRoute = express.Router();

// Públicas: registrarse e iniciar sesión.
userRoute.post("/create", create);

// `validate` firma el token y existía sin estar enlazada a ninguna ruta, así
// que la API tenía autenticación pero no tenía forma de autenticarse. Por eso
// el resto del flujo de token nunca se había ejercitado.
userRoute.post("/login", validate);

// Con token. update y destroyed no lo pedían: cualquiera que supiera un id
// podía modificar o borrar a cualquier usuario sin identificarse.
userRoute.get("/getAll", verifyTokenMiddeleware, get);
userRoute.put("/update/:id", verifyTokenMiddeleware, update);
userRoute.delete("/destroyed/:id", verifyTokenMiddeleware, destroyed);

export default userRoute;
