import { Router } from "express";

import { create, mine } from "../controllers/orderController.js";
import { verifyTokenMiddeleware } from "../middlewares/verifyTokenMiddleware.js";

const orderRoute = Router();

/*
 * Las dos piden token, y por razones distintas.
 *
 * Crear: un pedido es de alguien. Sin token no hay a quien atribuirlo, y una
 * ruta abierta que escribe en la base es una invitacion a llenarla de basura.
 *
 * Listar: son los pedidos del que pregunta. El identificador del usuario sale
 * del token, nunca de la direccion ni del cuerpo —si saliera de ahi, cambiar
 * un numero en la URL mostraria las compras de otro.
 */
orderRoute.post("/", verifyTokenMiddeleware, create);
orderRoute.get("/", verifyTokenMiddeleware, mine);

export default orderRoute;
