/**
 * Lo que el navegador guarda del carrito, que es lo minimo posible.
 *
 * ANTES guardaba el producto entero: nombre, imagen y PRECIO. El total se
 * calculaba con esos numeros, asi que el total era lo que el visitante
 * quisiera —abrir la consola y escribir otro precio alcanzaba—. No llego a
 * ser un agujero porque el boton "Comprar" no mandaba nada a ningun lado;
 * era un agujero esperando que alguien conectara la compra.
 *
 * AHORA guarda `{ id, cantidad }` y nada mas. El nombre y el precio se piden
 * a la API cada vez que se dibuja el carrito, y el total del pedido lo
 * calcula el servidor de nuevo con sus propios precios. El navegador MUESTRA
 * precios; no los tiene.
 *
 * El efecto secundario que se gana gratis: si el precio de algo cambia
 * mientras estaba en tu carrito, ves el precio nuevo, no el de ayer.
 */
const Carrito = {
  CLAVE: "productosEnCarrito",

  /**
   * Lee el carrito, migrando los que quedaron con la forma vieja.
   *
   * Los carritos que ya estan en los navegadores de la gente traen el objeto
   * completo. Se los mapea a `{ id, cantidad }` en lugar de vaciarlos: nadie
   * pierde lo que tenia elegido, y a partir del primer guardado queda con la
   * forma nueva.
   */
  leer() {
    let guardado;

    try {
      guardado = JSON.parse(localStorage.getItem(this.CLAVE));
    } catch (error) {
      // JSON roto, o localStorage bloqueado. Un carrito vacio es mejor que
      // una tienda que no abre.
      return [];
    }

    if (!Array.isArray(guardado)) return [];

    return guardado
      .filter((item) => item && item.id)
      .map((item) => ({
        id: String(item.id),
        cantidad: Math.max(1, Math.trunc(Number(item.cantidad)) || 1),
      }));
  },

  guardar(items) {
    try {
      localStorage.setItem(this.CLAVE, JSON.stringify(items));
    } catch (error) {
      console.error("No se pudo guardar el carrito:", error);
    }
  },

  vaciar() {
    this.guardar([]);
  },

  /** Cuantas unidades hay en total, para el numerito del menu. */
  unidades(items = this.leer()) {
    return items.reduce((total, item) => total + item.cantidad, 0);
  },

  /**
   * Escribe la cantidad en el globito del carrito.
   *
   * Vive aca y no en la vitrina porque la barra superior esta en las tres
   * paginas: antes el numero solo se actualizaba donde corria main.js, asi
   * que el carrito mostraba cero mientras tenia cosas adentro.
   */
  pintarNumero(items = this.leer()) {
    const globo = document.querySelector("#numero");

    if (!globo) return;

    const total = this.unidades(items);
    globo.textContent = total;
    globo.classList.toggle("disabled", total === 0);
  },
};

document.addEventListener("DOMContentLoaded", () => Carrito.pintarNumero());
