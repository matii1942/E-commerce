let productos = [];
const contenedorProductos = document.querySelector("#contenedor-productos");
const botonesCategorias = document.querySelectorAll(".button-categoria");
const tituloPrincipal = document.querySelector("#titulo-principal");
let productoAgregado = document.querySelectorAll(".button-add");
const numero = document.querySelector("#numero");


// El carrito vive en Carrito (js/carrito-guardado.js): `{ id, cantidad }` y
// nada mas. El precio no se guarda nunca de este lado.
let productoEnCarrito = Carrito.leer();
actualizarNumero();


// La API vive en el mismo origen que esta página: el servidor de Express
// sirve los dos. Por eso la ruta es absoluta desde la raíz y no hace falta
// ninguna cabecera de CORS en ninguna parte del proyecto.
const traerProductos = async () => {
    try {
        const response = await fetch("/api/products");

        // fetch no lanza por un 500 ni por un 404: sólo lanza si la red falla.
        // Sin este control, un error del servidor llega como JSON de error y
        // el catálogo intenta dibujarlo.
        if (!response.ok) {
            throw new Error(`La API respondio ${response.status}`);
        }

        productos = await response.json();
        cargarProductos(productos);
    } catch (error) {
        console.error("Error al cargar productos:", error);
        contenedorProductos.innerHTML = `
            <p class="error-carga">
                No se pudieron cargar los productos. Reintentá en unos segundos.
            </p>`;
    }
}

traerProductos();

function cargarProductos(productosElegidos) {
    contenedorProductos.innerHTML = "";

    productosElegidos.forEach(producto => {
        const div = document.createElement("div");
        div.classList.add("product");
        div.innerHTML = `
        <img class="product-img" src="${producto.image}" alt="${producto.name}">
        <div class="product-info">
            <h3 class="title-product">${producto.name}</h3>
            <p class="price">$${producto.price}</p>
            <button class="button-add" id="${producto.id}">Agregar</button>
        </div>
        `;
        contenedorProductos.append(div);
    });

    actualizarBotonesAgregar();
}

function actualizarBotonesAgregar() {
    productoAgregado = document.querySelectorAll(".button-add");
    productoAgregado.forEach(boton => {
        boton.addEventListener("click", agregarAlCarrito);
    });
}

function agregarAlCarrito(e) {
    const idBoton = e.currentTarget.id;
    const yaEsta = productoEnCarrito.find(item => item.id === idBoton);

    if (yaEsta) {
        yaEsta.cantidad++;
    } else {
        /*
         * Solo el identificador y la cantidad.
         *
         * Antes se guardaba una copia del producto entero —`{ ...productoAgregado }`—
         * para no compartir la referencia con el catalogo, que era un arreglo
         * correcto a otro problema. Pero esa copia se llevaba el precio, y un
         * precio guardado en el navegador es un precio que el visitante puede
         * editar. Guardando el id no hay nada que editar: el precio lo pone el
         * servidor al dibujar y lo vuelve a poner al cobrar.
         */
        productoEnCarrito.push({ id: idBoton, cantidad: 1 });
    }

    actualizarNumero();
    Carrito.guardar(productoEnCarrito);
}

function actualizarNumero() {
    numero.innerText = Carrito.unidades(productoEnCarrito);
}


botonesCategorias.forEach(boton => {
    boton.addEventListener("click", (e) => {
        botonesCategorias.forEach(boton => boton.classList.remove("active"));
        e.currentTarget.classList.add("active");

        if (e.currentTarget.id != "todos") {
            const categoriaPrincipal = productos.find(producto => producto.category?.slug === e.currentTarget.id);
            if (categoriaPrincipal) {
                tituloPrincipal.innerHTML = categoriaPrincipal.category.name;
                const productosBoton = productos.filter(producto => producto.category?.slug === e.currentTarget.id);
                cargarProductos(productosBoton);
            }
        } else {
            tituloPrincipal.innerHTML = "Todos los productos";
            cargarProductos(productos);
        }
    });
});
