import mongoose from "mongoose";

import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";

/** Tope por linea, para que un numero absurdo no vacie el deposito de un saque. */
const MAX_POR_LINEA = 20;

/**
 * Crea un pedido.
 *
 * LA REGLA DE TODO ESTE ARCHIVO: el navegador manda identificadores y
 * cantidades, nunca precios.
 *
 * Antes el carrito guardaba el producto entero en `localStorage` —nombre,
 * precio, imagen— y el boton "Comprar" no mandaba nada a ningun lado. El paso
 * natural habria sido mandar ese carrito tal cual, y ahi el precio lo habria
 * puesto el cliente: cualquiera con la consola abierta compra a lo que quiera.
 * No llego a pasar porque no habia compra; el diseño si estaba listo para que
 * pasara.
 *
 * Asi que el cuerpo que se acepta es deliberadamente pobre:
 *
 *   { "items": [ { "productId": "...", "quantity": 2 } ] }
 *
 * Cualquier otra cosa que venga se ignora. El precio sale de la base.
 */
export const create = async (req, res) => {
  const pedido = normalizarItems(req.body?.items);

  if (pedido.error) {
    return res.status(400).json({ message: pedido.error });
  }

  const { items } = pedido;

  try {
    const productos = await Product.find({
      _id: { $in: items.map((item) => item.productId) },
    });

    const porId = new Map(productos.map((producto) => [String(producto._id), producto]));

    // Se revisa todo antes de tocar nada. Un pedido se acepta entero o no se
    // acepta: descontar tres productos y fallar en el cuarto deja la tienda
    // peor que rechazar de entrada.
    const lineas = [];

    for (const item of items) {
      const producto = porId.get(item.productId);

      if (!producto) {
        return res.status(404).json({ message: `No existe el producto ${item.productId}` });
      }

      if (producto.status !== "DISPONIBLE") {
        return res.status(409).json({ message: `${producto.name} no esta disponible` });
      }

      const stock = typeof producto.quantity === "number" ? producto.quantity : 0;

      if (stock < item.quantity) {
        return res.status(409).json({
          message: `Stock insuficiente de ${producto.name}: quedan ${stock}`,
        });
      }

      lineas.push({
        product: producto._id,
        name: producto.name,
        unitPrice: producto.price,
        quantity: item.quantity,
        subtotal: enPesos(enCentavos(producto.price) * item.quantity),
      });
    }

    const total = enPesos(
      lineas.reduce((acumulado, linea) => acumulado + enCentavos(linea.subtotal), 0),
    );

    const descontados = await descontarStock(lineas);

    if (!descontados.ok) {
      return res.status(409).json({ message: descontados.message });
    }

    const orden = await Order.create({ user: req.user.userId, items: lineas, total });

    return res.status(201).json(orden);
  } catch (error) {
    console.error("Fallo al crear el pedido:", error);
    return res.status(500).json({ message: "Error interno en el servidor" });
  }
};

/** Los pedidos del usuario que pregunta, y solo los de el. */
export const mine = async (req, res) => {
  try {
    const ordenes = await Order.find({ user: req.user.userId }).sort({ createdAt: -1 });
    return res.status(200).json(ordenes);
  } catch (error) {
    console.error("Fallo al listar los pedidos:", error);
    return res.status(500).json({ message: "Error interno en el servidor" });
  }
};

/**
 * Valida la forma del pedido y junta las lineas repetidas.
 *
 * Que el mismo producto venga dos veces no es un error del que valga la pena
 * quejarse: se suman las cantidades y listo. Rechazarlo obligaria al front a
 * resolver algo que el servidor resuelve en dos lineas.
 */
function normalizarItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return { error: "El pedido tiene que traer al menos un producto" };
  }

  const juntados = new Map();

  for (const item of items) {
    const productId = String(item?.productId ?? "");

    // Sin esto, un identificador con forma rara hace que Mongoose tire al
    // armar la consulta y el pedido termina como un 500 en vez de un 400.
    if (!mongoose.isValidObjectId(productId)) {
      return { error: `Identificador de producto invalido: ${productId}` };
    }

    const cantidad = Number(item?.quantity);

    if (!Number.isInteger(cantidad) || cantidad < 1) {
      return { error: "Las cantidades tienen que ser numeros enteros de 1 o mas" };
    }

    const acumulada = (juntados.get(productId) ?? 0) + cantidad;

    if (acumulada > MAX_POR_LINEA) {
      return { error: `No se pueden pedir mas de ${MAX_POR_LINEA} unidades del mismo producto` };
    }

    juntados.set(productId, acumulada);
  }

  return {
    items: [...juntados].map(([productId, quantity]) => ({ productId, quantity })),
  };
}

/**
 * Descuenta el stock, con vuelta atras si una linea falla.
 *
 * Esto deberia ser una transaccion, y no lo es: MongoDB solo las ofrece sobre
 * un conjunto de replicas, y el docker-compose de este proyecto levanta una
 * instancia suelta. Asi que lo que hay es una compensacion —se descuenta de a
 * uno y, si uno falla, se devuelve lo ya descontado— y eso NO es lo mismo:
 * entre el descuento y la vuelta atras hay un instante en que el stock esta
 * mal, y si el proceso se muere en el medio queda mal para siempre.
 *
 * Se escribe asi y se dice en voz alta en vez de llamarlo transaccion. El
 * arreglo de verdad es levantar Mongo como conjunto de replicas de un nodo y
 * usar una sesion.
 *
 * La condicion `quantity: { $gte: ... }` es la parte que si es atomica: dos
 * compras simultaneas de la ultima unidad no pueden ganar las dos, porque la
 * segunda no encuentra documento que cumpla la condicion.
 */
async function descontarStock(lineas) {
  const hechas = [];

  for (const linea of lineas) {
    const resultado = await Product.updateOne(
      { _id: linea.product, quantity: { $gte: linea.quantity } },
      { $inc: { quantity: -linea.quantity } },
    );

    if (resultado.modifiedCount !== 1) {
      await devolver(hechas);
      return { ok: false, message: `Alguien se adelanto: ya no hay stock de ${linea.name}` };
    }

    hechas.push(linea);
  }

  return { ok: true };
}

async function devolver(lineas) {
  for (const linea of lineas) {
    await Product.updateOne({ _id: linea.product }, { $inc: { quantity: linea.quantity } });
  }
}

/*
 * Los precios se guardan como numeros con coma, asi que sumarlos de a uno
 * arrastra el error del punto flotante: 1299.99 * 3 da 3899.9700000000003. Se
 * cuenta en centavos enteros y se vuelve a pesos al final.
 *
 * Lo correcto de entrada seria guardar el precio en centavos en la base, como
 * el libro de gastos de VitaLink. Eso es una migracion del catalogo y queda
 * anotado en el README.
 */
function enCentavos(pesos) {
  return Math.round(pesos * 100);
}

function enPesos(centavos) {
  return centavos / 100;
}
