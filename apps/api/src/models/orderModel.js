import mongoose from "mongoose";

/**
 * Una linea del pedido, con el precio congelado.
 *
 * El nombre y el precio se guardan acá copiados, no se leen del producto al
 * mostrar el pedido. Parece redundante y no lo es: el catálogo cambia. Si
 * mañana sube el precio de una zapatilla, un pedido que apunte al producto
 * mostraría de golpe un total distinto del que el cliente aceptó. Un pedido
 * es un hecho del pasado y tiene que seguir diciendo lo mismo para siempre.
 *
 * La referencia al producto queda igual, para poder saber qué se vendió.
 */
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },
    name: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
    index: true,
  },

  items: {
    type: [orderItemSchema],
    required: true,
    validate: {
      validator: (items) => Array.isArray(items) && items.length > 0,
      message: "Un pedido sin lineas no es un pedido",
    },
  },

  /*
   * Calculado por el servidor, nunca recibido del navegador. Se guarda en vez
   * de calcularse al leer por la misma razón que los precios de arriba: es lo
   * que el cliente aceptó pagar.
   */
  total: { type: Number, required: true, min: 0 },

  createdAt: { type: Date, default: Date.now },
});

orderSchema.set("toJSON", {
  virtuals: true,
  transform: (document, plain) => {
    plain.id = plain._id;
    delete plain._id;
    delete plain.__v;
    return plain;
  },
});

export default mongoose.model("order", orderSchema);
