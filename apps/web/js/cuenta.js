/**
 * Entrar y crear una cuenta.
 *
 * La API ya tenia las dos rutas —`POST /api/users/create` y
 * `POST /api/users/login`— y no tenia forma de usarlas desde la tienda. Esto
 * es esa forma, y nada mas: no inventa validaciones que el servidor no hace
 * ni repite las que si hace.
 *
 * A donde vuelve despues de entrar: si llegaste aca desde el carrito, al
 * carrito; si no, a la tienda. El `?volver=` lo pone quien te mando.
 */
const mensaje = document.querySelector("#cuenta-mensaje");

function avisar(texto, tipo = "error") {
  mensaje.textContent = texto;
  mensaje.dataset.tipo = tipo;
  mensaje.classList.remove("disabled");
}

function destino() {
  const pedido = new URLSearchParams(location.search).get("volver");

  // Solo nombres de pagina de esta misma tienda. Sin este control, un enlace
  // con `?volver=https://otro-sitio` convierte a la tienda en un trampolin
  // hacia cualquier lado, que es como funciona media estafa por correo.
  return pedido === "carrito" ? "carrito.html" : "index.html";
}

/** Entra y guarda la sesion. Devuelve true si salio bien. */
async function entrar(email, password) {
  const respuesta = await fetch("/api/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const cuerpo = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    avisar(cuerpo.message ?? `La API respondio ${respuesta.status}`);
    return false;
  }

  Sesion.abrir(cuerpo.token, email);
  return true;
}

document.querySelector("#form-login").addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const datos = new FormData(evento.currentTarget);

  if (await entrar(datos.get("email"), datos.get("password"))) {
    location.href = destino();
  }
});

document.querySelector("#form-registro").addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const datos = Object.fromEntries(new FormData(evento.currentTarget));
  datos.edad = Number(datos.edad);

  try {
    const respuesta = await fetch("/api/users/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });

    const cuerpo = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
      avisar(cuerpo.message ?? cuerpo.error ?? `La API respondio ${respuesta.status}`);
      return;
    }

    // El alta no devuelve token, solo el usuario. Entrar enseguida evita
    // pedirle a alguien que escriba la misma contraseña dos veces seguidas.
    avisar("Cuenta creada. Entrando...", "ok");

    if (await entrar(datos.email, datos.password)) {
      location.href = destino();
    }
  } catch (error) {
    avisar("No se pudo contactar al servidor. Reintenta en unos segundos.");
  }
});
