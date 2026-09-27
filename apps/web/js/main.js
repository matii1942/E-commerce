let productos = [];
const contenedorProductos = document.querySelector("#contenedor-productos");
const botonesCategorias = document.querySelectorAll(".button-categoria");
const tituloPrincipal = document.querySelector("#titulo-principal");
let productoAgregado = document.querySelectorAll(".button-add");
const numero = document.querySelector("#numero");


let productoEnCarrito;
let productoEnCarritoLS = localStorage.getItem("productosEnCarrito");

if (productoEnCarritoLS) {
    productoEnCarrito = JSON.parse(productoEnCarritoLS);
    actualizarNumero();
} else {
    productoEnCarrito = [];
}


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
    const productoAgregado = productos.find(producto => producto.id === idBoton);

    if (productoEnCarrito.some(producto => producto.id === idBoton)) {
        const index = productoEnCarrito.findIndex(producto => producto.id === idBoton);
        productoEnCarrito[index].cantidad++;
    } else {
        // Una copia, no el objeto del catálogo. find devuelve una referencia:
        // escribirle `cantidad` se la escribía al producto del catálogo, y el
        // carrito y la vitrina terminaban compartiendo el mismo objeto.
        productoEnCarrito.push({ ...productoAgregado, cantidad: 1 });
    }
    actualizarNumero();
    localStorage.setItem("productosEnCarrito", JSON.stringify(productoEnCarrito));
}

function actualizarNumero() {
    let nuevoNumero = productoEnCarrito.reduce((acumulador, producto) => acumulador + producto.cantidad, 0);
    numero.innerText = nuevoNumero;
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
