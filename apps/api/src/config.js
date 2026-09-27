import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT || 3001;

/**
 * El secreto con el que se firman y verifican los tokens.
 *
 * Estaba escrito en el código como la cadena "secreto", en dos archivos
 * distintos. Un secreto en el repositorio no es un secreto: cualquiera que
 * lea el código puede firmar un token válido y hacerse pasar por cualquier
 * usuario.
 *
 * Si falta, el servidor no arranca. La alternativa —un valor por defecto—
 * es peor: la aplicación levanta y parece andar, con la puerta abierta.
 */
export const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Falta JWT_SECRET en el entorno. Ver .env.example.");
}

/** Cuánto vive un token de sesión. */
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
