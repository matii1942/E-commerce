import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";

/** Verifica la firma del token y devuelve su contenido. Lanza si no es válido. */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error("Token invalido");
  }
}
