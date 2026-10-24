/**
 * La sesion del visitante, en un solo lugar.
 *
 * La API entrega un token al iniciar sesion y lo pide de vuelta en cada
 * pedido. Este archivo es lo unico que sabe donde se guarda ese token, asi
 * que el dia que se cambie de lugar se cambia aca y en ningun otro lado.
 *
 * DONDE SE GUARDA, Y QUE TIENE DE MALO. Va en `localStorage`, que es lo mas
 * simple y no es lo mas seguro: cualquier script que logre correr en esta
 * pagina puede leerlo. Lo correcto seria que el servidor lo mandara en una
 * cookie `httpOnly`, que el JavaScript no puede leer. Eso es cambiar como la
 * API entrega el token, no solo como lo guarda el navegador, asi que queda
 * anotado en las limitaciones del README en vez de quedar sin decir.
 */
const Sesion = {
  /** El token, o null si no hay sesion. */
  token() {
    try {
      return localStorage.getItem("token");
    } catch (error) {
      // En una ventana privada o con los datos de sitio bloqueados, leer
      // localStorage tira. Sin sesion se puede mirar la tienda igual.
      return null;
    }
  },

  /** El correo con el que se entro, solo para saludar. */
  email() {
    try {
      return localStorage.getItem("email");
    } catch (error) {
      return null;
    }
  },

  activa() {
    return Boolean(this.token());
  },

  abrir(token, email) {
    try {
      localStorage.setItem("token", token);
      localStorage.setItem("email", email);
    } catch (error) {
      console.error("No se pudo guardar la sesion:", error);
    }
  },

  cerrar() {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("email");
    } catch (error) {
      console.error("No se pudo cerrar la sesion:", error);
    }
  },

  /** Las cabeceras de una peticion autenticada. */
  cabeceras() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.token()}`,
    };
  },
};

/**
 * Dibuja el estado de la sesion en el menu.
 *
 * Las dos paginas tienen el mismo hueco `#sesion` en la barra lateral y las
 * dos llaman a esto, para que no haya dos versiones del saludo que se puedan
 * contradecir.
 */
function pintarSesion() {
  const hueco = document.querySelector("#sesion");

  if (!hueco) return;

  if (!Sesion.activa()) {
    hueco.innerHTML = `
      <a class="boton-sesion" href="cuenta.html">Ingresá</a>`;
    return;
  }

  hueco.innerHTML = `
    <span class="sesion-activa" title="${Sesion.email() ?? ""}">${Sesion.email() ?? "Mi cuenta"}</span>
    <button type="button" id="cerrar-sesion" class="boton-sesion">Salir</button>`;

  document.querySelector("#cerrar-sesion").addEventListener("click", () => {
    Sesion.cerrar();
    pintarSesion();
  });
}

document.addEventListener("DOMContentLoaded", pintarSesion);
