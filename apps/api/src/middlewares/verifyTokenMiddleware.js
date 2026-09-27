import { verifyToken } from "../utils/verifyToken.js";

/**
 * Exige un token válido y deja su contenido en `req.user`.
 *
 * Antes hacía `req.res = decoded`, que tiene dos problemas: el contenido del
 * token nunca llegaba a los controladores, y `req.res` es el objeto de
 * respuesta real de Express, así que lo pisaba.
 *
 * El encabezado llega como "Bearer <token>". Antes se pasaba entero a
 * jwt.verify, que lo rechazaba.
 */
export const verifyTokenMiddeleware = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ message: "token de acceso no proporcionado" });
  }

  const token = header.startsWith("Bearer ") ? header.slice(7) : header;

  try {
    req.user = verifyToken(token);
    next();
  } catch (error) {
    return res.status(401).json({ message: "token de acceso invalido" });
  }
};
