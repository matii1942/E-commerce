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


const traerProductos = async () => {
    try {
        const response = await fetch("http://localhost:3000/api/productos");
        const data = await response.json();
        console.log("Datos recibidos:", data);
        productos = data;
        cargarProductos(productos);
    } catch (error) {
        console.error("Error al cargar productos:", error);
    }
}

traerProductos();

function cargarProductos(productosElegidos) {
    contenedorProductos.innerHTML = "";

    productosElegidos.forEach(producto => {
        const div = document.createElement("div");
        div.classList.add("product");
        div.innerHTML = `
        <img class="product-img" src="${producto.img}" alt="${producto.titulo}">
        <div class="product-info">
            <h3 class="title-product">${producto.titulo}</h3>
            <p class="price">$${producto.precio}</p>
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
        productoAgregado.cantidad = 1;
        productoEnCarrito.push(productoAgregado);
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
            const categoriaPrincipal = productos.find(producto => producto.categoria.id === e.currentTarget.id);
            if (categoriaPrincipal) {
                tituloPrincipal.innerHTML = categoriaPrincipal.categoria.nombre;
                const productosBoton = productos.filter(producto => producto.categoria.id === e.currentTarget.id);
                cargarProductos(productosBoton);
            }
        } else {
            tituloPrincipal.innerHTML = "Todos los productos";
            cargarProductos(productos);
        }
    });
});
