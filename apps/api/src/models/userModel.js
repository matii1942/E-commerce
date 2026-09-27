import mongoose from "mongoose";
import { isGoodPassword } from "../utils/validators.js";
import bcrypt from "bcryptjs";


const userSchema = new mongoose.Schema({

    nombre: {
        // Era `require`, que Mongoose ignora en silencio: el campo decía ser
        // obligatorio y no lo era.
        type: String,
        required: true,
    },

    apellido: {
        type: String,
        required: true,

    },

    carrera: {
        type: String,
        required: true,
    },
    edad: {
        type: Number,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    
    password: {
        type: String,
        validate: {
          validator: function (value) {
            return isGoodPassword(value);
          },
          message:
            "La contraseña debe tener entre 6 y 12 caracteres, un digito numerico, una letra minuscula, una letra mayuscula",
        },
    },
});

/**
 * Hashea la contraseña, pero solo cuando cambió.
 *
 * Sin la guarda, cualquier guardado vuelve a hashear un hash. El día que se
 * actualiza otro campo del usuario —el email, la edad— la contraseña queda
 * hasheada dos veces y ese usuario no puede entrar nunca más.
 */
userSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();

  this.password = bcrypt.hashSync(this.password, 10);
  next();
});

/**
 * La contraseña no sale nunca en una respuesta.
 *
 * Los controladores devolvían el documento entero, hash incluido. Un hash no
 * es una contraseña, pero es material para atacar sin conexión y no tiene
 * ninguna razón para cruzar la red. Quitarlo acá lo quita en todas las rutas
 * de una vez, en lugar de confiar en que cada controlador se acuerde.
 */
userSchema.set("toJSON", {
  transform: (document, plain) => {
    delete plain.password;
    delete plain.__v;
    return plain;
  },
});

export default mongoose.model("user", userSchema);