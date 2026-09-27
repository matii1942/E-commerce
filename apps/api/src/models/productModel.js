import mongoose from "mongoose";

const statusEnum = ["DISPONIBLE", "VENDIDO", "RECHAZADO"];

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Nombre de producto requerido"],
    minLength: 3,
    unique: true,
    lowercase: true,
    trim: true,
  },
  price: {
    type: Number,
    required: [true, "Precio de producto requerido"],
    min: [0, "Precio del producto debe tener numero"],
  },

  description: String,
  quantity: Number,
  status: {
    type: String,
    validate: {
      validator: function (v) {
        return statusEnum.includes(v);
      },
      message: props => `${props.value} no es un estado valido`,
    },
  },
  // La referencia decía "category" y el modelo se registra como "Category".
  // Mongoose distingue mayúsculas: un populate lanzaba MissingSchemaError.
  // No se notaba porque no había un solo populate en el proyecto.
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },

  /** Ruta de la imagen, relativa al front. Sin esto la tienda no se puede dibujar. */
  image: { type: String },
  destacado: Boolean,
});

/**
 * Lo que la API muestra hacia afuera.
 *
 * `_id` y `__v` son detalles de Mongo, no del dominio. Un cliente que los
 * conoce queda atado a la base de datos que hay hoy detrás.
 */
productSchema.set("toJSON", {
  virtuals: true,
  transform: (document, plain) => {
    plain.id = plain._id;
    delete plain._id;
    delete plain.__v;
    return plain;
  },
});
export default mongoose.model("product", productSchema);