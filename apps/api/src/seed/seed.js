/**
 * Siembra el catálogo en MongoDB.
 *
 * Se puede correr todas las veces que quieras: cada categoría y cada producto
 * se insertan por `updateOne` con `upsert`, buscando por un campo único. Es la
 * misma idea de idempotencia que usé en VitaLink — sembrar dos veces deja la
 * base igual que sembrar una.
 *
 *   npm run seed
 */
import mongoose from "mongoose";

import { connectDB } from "../db.js";
import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js";
import productos from "./productos.js";

/** El catálogo de origen trae la categoría adentro de cada producto. */
function categoriasDe(origen) {
  const porSlug = new Map();

  for (const producto of origen) {
    porSlug.set(producto.categoria.id, producto.categoria.nombre);
  }

  return [...porSlug].map(([slug, name]) => ({ slug, name }));
}

async function sembrar() {
  await connectDB();

  const categorias = categoriasDe(productos);
  const idPorSlug = new Map();

  for (const categoria of categorias) {
    const guardada = await Category.findOneAndUpdate(
      { slug: categoria.slug },
      { $set: categoria },
      { upsert: true, new: true },
    );

    idPorSlug.set(categoria.slug, guardada._id);
  }

  let insertados = 0;
  let actualizados = 0;

  for (const producto of productos) {
    // El nombre se guarda en minúsculas por el esquema, así que buscar por
    // el nombre tal cual encontraría el mismo documento igual.
    const resultado = await Product.updateOne(
      { name: producto.titulo.toLowerCase() },
      {
        $set: {
          name: producto.titulo,
          price: producto.precio,
          image: producto.img,
          category: idPorSlug.get(producto.categoria.id),
          status: "DISPONIBLE",
        },
      },
      { upsert: true },
    );

    if (resultado.upsertedCount > 0) insertados += 1;
    else if (resultado.modifiedCount > 0) actualizados += 1;
  }

  console.log(`categorias: ${categorias.length} (${categorias.map((c) => c.name).join(", ")})`);
  console.log(`productos:  ${insertados} insertados, ${actualizados} actualizados`);
  console.log(`en la base: ${await Product.countDocuments()} productos`);

  await mongoose.disconnect();
}

sembrar().catch((error) => {
  console.error("Fallo el sembrado:", error);
  process.exit(1);
});
