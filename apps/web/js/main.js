/**
 * La vitrina: catalogo, filtro por categoria y buscador.
 *
 * Los dos filtros son independientes y se aplican juntos. Antes la categoria
 * redibujaba la grilla con su propio `filter` y no habia buscador; si cada
 * uno dibujara por su cuenta, elegir una categoria borraria lo que escribiste
 * y escribir borraria la categoria. Por eso hay un solo estado —`categoria` y
 * `busqueda`— y una sola funcion que dibuja.
 */
let productos = [];

let categoria = "todos";
let busqueda = "";

const contenedorProductos = document.querySelector("#contenedor-productos");
const botonesCategorias = document.querySelectorAll(".button-categoria");
const tituloPrincipal = document.querySelector("#titulo-principal");
const conteo = document.querySelector("#resultado-conteo");
const buscador = document.querySelector("#buscador");

// El carrito guarda `{ id, cantidad }` y nada mas (js/carrito-guardado.js).
let productoEnCarrito = Carrito.leer();

// La API vive en el mismo origen que esta pagina: el servidor de Express
// sirve las dos. Por eso la ruta es absoluta desde la raiz y no hace falta
// ninguna cabecera de CORS en ninguna parte del proyecto.
const traerProductos = async () => {
    try {
        const response = await fetch("/api/products");

        // fetch no lanza por un 500 ni por un 404: solo lanza si la red falla.
        // Sin este control, un error del servidor llega como JSON de error y
        // el catalogo intenta dibujarlo.
        if (!response.ok) {
            throw new Error(`La API respondio ${response.status}`);
        }

        productos = await response.json();
        dibujar();
    } catch (error) {
        console.error("Error al cargar productos:", error);
        contenedorProductos.innerHTML = `
            <p class="grilla-vacia">
                No se pudieron cargar los productos. Reintenta en unos segundos.
            </p>`;
    }
};

traerProductos();

/**
 * Normaliza para comparar: sin mayusculas y sin acentos.
 *
 * Son nombres en castellano y alguien que busca apurado escribe "gorra" por
 * "gorrá" o al reves. NFD separa la letra de su tilde y el rango de marcas
 * combinantes las borra, asi que "zapatilla" encuentra "zapatílla".
 */
function plano(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "");
}

function visibles() {
    const aguja = plano(busqueda.trim());

    return productos.filter((producto) => {
        const deLaCategoria = categoria === "todos" || producto.category?.slug === categoria;
        const coincide = aguja === "" || plano(producto.name).includes(aguja);

        return deLaCategoria && coincide;
    });
}

function dibujar() {
    const elegidos = visibles();

    conteo.textContent =
        elegidos.length === 1 ? "1 resultado" : `${elegidos.length} resultados`;

    if (elegidos.length === 0) {
        contenedorProductos.innerHTML = `
            <p class="grilla-vacia">
                No encontramos nada con esa búsqueda. Probá con otra palabra.
            </p>`;
        return;
    }

    contenedorProductos.innerHTML = "";

    for (const producto of elegidos) {
        const div = document.createElement("div");
        div.classList.add("product");
        div.innerHTML = `
        <img class="product-img" src="${producto.image}" alt="${producto.name}">
        <div class="product-info">
            <h3 class="title-product">${producto.name}</h3>
            <p class="price">${pesos(producto.price)}</p>
            <p class="envio">Envío gratis</p>
            <button class="button-add" id="${producto.id}">Agregar al carrito</button>
        </div>
        `;
        contenedorProductos.append(div);
    }

    for (const boton of document.querySelectorAll(".button-add")) {
        boton.addEventListener("click", agregarAlCarrito);
    }
}

function agregarAlCarrito(e) {
    const idBoton = e.currentTarget.id;
    const yaEsta = productoEnCarrito.find((item) => item.id === idBoton);

    if (yaEsta) {
        yaEsta.cantidad++;
    } else {
        /*
         * Solo el identificador y la cantidad.
         *
         * Antes se guardaba una copia del producto entero para no compartir la
         * referencia con el catalogo, que era un arreglo correcto a otro
         * problema. Pero esa copia se llevaba el precio, y un precio guardado
         * en el navegador es un precio que el visitante puede editar.
         * Guardando el id no hay nada que editar: el precio lo pone el
         * servidor al dibujar y lo vuelve a poner al cobrar.
         */
        productoEnCarrito.push({ id: idBoton, cantidad: 1 });
    }

    Carrito.guardar(productoEnCarrito);
    Carrito.pintarNumero(productoEnCarrito);
}

botonesCategorias.forEach((boton) => {
    boton.addEventListener("click", (e) => {
        botonesCategorias.forEach((otro) => otro.classList.remove("active"));
        e.currentTarget.classList.add("active");

        categoria = e.currentTarget.id;

        // El nombre de la categoria sale de los datos, no del boton: el boton
        // lleva el identificador y el catalogo manda sobre como se escribe.
        // Si no hay ningun producto de esa categoria, se cae al texto del
        // propio boton.
        const ejemplo = productos.find((producto) => producto.category?.slug === categoria);

        tituloPrincipal.textContent =
            categoria === "todos"
                ? "Todos los productos"
                : ejemplo?.category?.name ?? e.currentTarget.textContent;

        dibujar();
    });
});

if (buscador) {
    buscador.addEventListener("input", (e) => {
        busqueda = e.target.value;
        dibujar();
    });
}
