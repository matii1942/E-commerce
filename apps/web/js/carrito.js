/**
 * El carrito: lo que elegiste, con los precios del servidor, y la compra.
 *
 * DOS COSAS CAMBIARON RESPECTO DE LA VERSION ANTERIOR.
 *
 * Una: el carrito guardado trae `{ id, cantidad }`, asi que el nombre, la
 * imagen y el precio hay que ir a buscarlos. Se piden a `/api/products` una
 * sola vez y se cruzan por identificador. Es un viaje mas al servidor a
 * cambio de que el precio que ves sea el precio que hay.
 *
 * Dos: "Comprar ahora" compra. Antes vaciaba el arreglo, guardaba el carrito
 * vacio y mostraba el cartel de gracias —sin mandar nada a ningun lado, sin
 * crear ningun pedido y sin descontar ningun stock—. Ahora manda
 * `POST /api/orders` con identificadores y cantidades, y el servidor calcula
 * el total con sus propios precios. Si el servidor dice que no, el carrito
 * se queda como estaba y se explica por que.
 */
const contenedorCarritoVacio = document.querySelector("#carrito-vacio");
const contenedorCarritoProductos = document.querySelector("#carrito-productos");
const contenedorCarritoAcciones = document.querySelector("#carrito-acciones");
const contenedorCarritoComprado = document.querySelector("#carrito-comprado");
const botonVaciarCarrito = document.querySelector(".carrito-acciones-vaciar");
const botonComprarCarrito = document.querySelector(".carrito-acciones-comprar");
const carritoTotal = document.querySelector("#total");
const carritoAviso = document.querySelector("#carrito-aviso");

/** Lo elegido: `{ id, cantidad }`. */
let elegido = Carrito.leer();

/** El catalogo, por identificador. Se llena una vez al abrir la pagina. */
let catalogo = new Map();

function avisar(texto, tipo = "error") {
  if (!carritoAviso) return;

  if (!texto) {
    carritoAviso.classList.add("disabled");
    return;
  }

  carritoAviso.textContent = texto;
  carritoAviso.dataset.tipo = tipo;
  carritoAviso.classList.remove("disabled");
}

function mostrar(estado) {
  contenedorCarritoVacio.classList.toggle("disabled", estado !== "vacio");
  contenedorCarritoProductos.classList.toggle("disabled", estado !== "lleno");
  contenedorCarritoAcciones.classList.toggle("disabled", estado !== "lleno");
  contenedorCarritoComprado.classList.toggle("disabled", estado !== "comprado");
}

async function traerCatalogo() {
  const respuesta = await fetch("/api/products");

  if (!respuesta.ok) {
    throw new Error(`La API respondio ${respuesta.status}`);
  }

  const productos = await respuesta.json();
  catalogo = new Map(productos.map((producto) => [producto.id, producto]));
}

/**
 * Las lineas dibujables: lo elegido cruzado con el catalogo.
 *
 * Un producto que ya no esta en el catalogo se cae del carrito. Pasa cuando
 * lo borraron mientras estaba guardado en tu navegador, y dejarlo seria
 * mostrar un renglon sin precio que al comprar da error.
 */
function lineas() {
  return elegido
    .filter((item) => catalogo.has(item.id))
    .map((item) => {
      const producto = catalogo.get(item.id);

      return {
        id: item.id,
        cantidad: item.cantidad,
        name: producto.name,
        image: producto.image,
        price: producto.price,
        subtotal: producto.price * item.cantidad,
      };
    });
}

function dibujar() {
  const visibles = lineas();
  const perdidos = elegido.length - visibles.length;

  if (perdidos > 0) {
    // Se limpia lo que ya no existe, para no volver a avisar en cada dibujo.
    elegido = elegido.filter((item) => catalogo.has(item.id));
    Carrito.guardar(elegido);
    avisar(
      perdidos === 1
        ? "Sacamos un producto del carrito porque ya no esta en la tienda."
        : `Sacamos ${perdidos} productos del carrito porque ya no estan en la tienda.`,
      "aviso",
    );
  }

  if (visibles.length === 0) {
    mostrar("vacio");
    return;
  }

  contenedorCarritoProductos.innerHTML = "";

  for (const linea of visibles) {
    const div = document.createElement("div");
    div.classList.add("carrito-producto");
    div.innerHTML = `
      <img class="carrito-producto-imagen" src="${linea.image}" alt="${linea.name}">
      <div class="carrito-producto-titulo">
          <small>Título</small>
          <h3>${linea.name}</h3>
      </div>
      <div class="carrito-producto-cantidad">
          <small>Cantidad</small>
          <p>${linea.cantidad}</p>
      </div>
      <div class="carrito-producto-precio">
          <small>Precio</small>
          <p>${pesos(linea.price)}</p>
      </div>
      <div class="carrito-producto-subtotal">
          <small>Subtotal</small>
          <p>${pesos(linea.subtotal)}</p>
      </div>
      <button class="carrito-producto-eliminar" id="${linea.id}"><i class="bi bi-trash-fill"></i></button>
    `;

    contenedorCarritoProductos.append(div);
  }

  for (const boton of document.querySelectorAll(".carrito-producto-eliminar")) {
    boton.addEventListener("click", eliminarDelCarrito);
  }

  /*
   * El total que se muestra se calcula con los precios que vinieron del
   * servidor hace un momento. No es el total que se cobra: ese lo vuelve a
   * calcular la API al crear el pedido, con los precios que tenga en ese
   * instante. Si los dos no coinciden, manda el del servidor.
   */
  carritoTotal.innerText = pesos(visibles.reduce((suma, linea) => suma + linea.subtotal, 0));

  mostrar("lleno");
}

function eliminarDelCarrito(evento) {
  const id = evento.currentTarget.id;

  elegido = elegido.filter((item) => item.id !== id);
  Carrito.guardar(elegido);
  Carrito.pintarNumero(elegido);
  avisar("");
  dibujar();
}

botonVaciarCarrito.addEventListener("click", () => {
  elegido = [];
  Carrito.vaciar();
  Carrito.pintarNumero(elegido);
  avisar("");
  dibujar();
});

botonComprarCarrito.addEventListener("click", comprar);

async function comprar() {
  // Un pedido es de alguien. Si no hay sesion, se manda a entrar y se vuelve
  // al carrito —de ahi el `?volver=carrito`—, con el carrito intacto.
  if (!Sesion.activa()) {
    location.href = "cuenta.html?volver=carrito";
    return;
  }

  botonComprarCarrito.disabled = true;
  avisar("");

  try {
    const respuesta = await fetch("/api/orders", {
      method: "POST",
      headers: Sesion.cabeceras(),
      // Identificadores y cantidades. Ni un precio.
      body: JSON.stringify({
        items: elegido.map((item) => ({ productId: item.id, quantity: item.cantidad })),
      }),
    });

    const cuerpo = await respuesta.json().catch(() => ({}));

    if (respuesta.status === 401) {
      // El token vencio mientras mirabas. Se cierra la sesion para que el
      // menu no siga diciendo que estas adentro.
      Sesion.cerrar();
      location.href = "cuenta.html?volver=carrito";
      return;
    }

    if (!respuesta.ok) {
      // Sin stock, producto que dejo de estar disponible, cantidad invalida.
      // El carrito NO se vacia: lo que pediste sigue ahi para corregirlo.
      avisar(cuerpo.message ?? `La API respondio ${respuesta.status}`);
      return;
    }

    elegido = [];
    Carrito.vaciar();
    Carrito.pintarNumero(elegido);
    contenedorCarritoComprado.innerHTML =
      `<i class="bi bi-bag-check"></i>Gracias por tu compra. Total: ${pesos(cuerpo.total)}`;
    mostrar("comprado");
  } catch (error) {
    avisar("No se pudo contactar al servidor. Reintenta en unos segundos.");
  } finally {
    botonComprarCarrito.disabled = false;
  }
}

async function arrancar() {
  if (elegido.length === 0) {
    mostrar("vacio");
    return;
  }

  try {
    await traerCatalogo();
    dibujar();
  } catch (error) {
    console.error("Error al cargar el carrito:", error);
    mostrar("vacio");
    avisar("No se pudieron cargar los precios. Reintenta en unos segundos.");
  }
}

arrancar();
