import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { connectDB } from "./db.js";
import { PORT } from "./config.js";
import userRoute from "./rutas/userRoute.js";
import productRoute from "./rutas/productRoute.js";
import categoryRoute from "./rutas/categoryRoute.js";

const app = express();

// express.json reemplaza a body-parser desde Express 4.16: una dependencia
// menos que instalar y mantener.
app.use(express.json());

await connectDB();

/*
 * La tienda se sirve desde el mismo servidor que la API.
 *
 * Eso no es casualidad ni comodidad: es lo que hace que no exista una sola
 * cabecera de CORS en el proyecto. El navegador prohíbe que una página
 * servida desde un origen lea la respuesta de otro, y la forma barata de
 * saltar esa regla es debilitar la API. La forma correcta es que haya un
 * solo origen.
 */
const aqui = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(aqui, "../../web")));

app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/categories", categoryRoute);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`La tienda esta corriendo en http://localhost:${PORT}`);
});
