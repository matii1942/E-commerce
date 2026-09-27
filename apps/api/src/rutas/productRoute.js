import { Router } from "express";

import {
  create,
  getAll,
  findOne,
  update,
  deleteProduct,
} from "../controllers/productController.js";
import { verifyTokenMiddeleware } from "../middlewares/verifyTokenMiddleware.js";

const productRoute = Router();

/*
 * Rutas REST.
 *
 * Antes eran /create, /getAll, /findOne/:name, /update/:id y /delete/:id —
 * el verbo en la dirección y siempre el mismo método. Eso es RPC con ropa de
 * REST: la dirección nombra un recurso y el método dice qué hacer con él.
 *
 * Leer el catálogo es público. Modificarlo pide token: una tienda donde
 * cualquiera puede crear productos no es una tienda.
 */
productRoute.get("/", getAll);

// Por nombre y no por identificador, porque el nombre es único en este modelo
// y es lo que un cliente tiene a mano. Un id de Mongo no se lo sabe nadie.
productRoute.get("/:name", findOne);

productRoute.post("/", verifyTokenMiddeleware, create);
productRoute.put("/:id", verifyTokenMiddeleware, update);
productRoute.delete("/:id", verifyTokenMiddeleware, deleteProduct);

export default productRoute;
