/**
 * Precios, escritos como se leen en Argentina.
 *
 * `$89999` y `$899990` se parecen demasiado de un vistazo, y en una tienda
 * esa confusion cuesta plata. `es-AR` separa los miles con punto, que es lo
 * que un comprador de acá espera leer.
 *
 * Los decimales aparecen solo si existen: el catalogo de hoy trabaja con
 * pesos enteros y un ",00" en cada tarjeta es ruido. El dia que haya
 * centavos, esta es la unica funcion que hay que mirar.
 */
function pesos(monto) {
  return `$${Number(monto).toLocaleString("es-AR", { maximumFractionDigits: 2 })}`;
}
