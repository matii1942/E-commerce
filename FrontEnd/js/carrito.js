let productosEnCarrito = JSON.parse(localStorage.getItem("productosEnCarrito"));


const contenedorCarritoVacio = document.querySelector("#carrito-vacio");
const contenedorCarritoProductos = document.querySelector("#carrito-productos");
const contenedorCarritoAcciones = document.querySelector("#carrito-acciones");
const contenedorCarritoComprado = document.querySelector("#carrito-comprado");
const botonesVaciarCarrito = document.querySelector(".carrito-acciones-vaciar");
const botonesComprarCarrito = document.querySelector(".carrito-acciones-comprar"); 
const contenedorCarritoTotal = document.querySelector("#carrito-acciones-total"); 
const carritoTotal = document.querySelector("#total");
let botonesEliminar = document.querySelectorAll(".carrito-producto-eliminar");


function cargarProductosCarrito()   {
    if(productosEnCarrito && productosEnCarrito.length > 0){
    contenedorCarritoVacio.classList.add("disabled");
    contenedorCarritoProductos.innerHTML = "";
    contenedorCarritoProductos.classList.remove("disabled");
    contenedorCarritoAcciones.classList.remove("disabled");
    contenedorCarritoComprado.classList.add("disabled");

    productosEnCarrito.forEach(producto => {    
        const div = document.createElement("div");
        div.classList.add("carrito-producto");
         div.innerHTML = `
                <img class="carrito-producto-imagen" src="${producto.img}" alt="${producto.titulo}">
                <div class="carrito-producto-titulo">
                    <small>Título</small>
                    <h3>${producto.titulo}</h3>
                </div>
                <div class="carrito-producto-cantidad">
                    <small>Cantidad</small>
                    <p>${producto.cantidad}</p>
                </div>
                <div class="carrito-producto-precio">
                    <small>Precio</small>
                    <p>$${producto.precio}</p>
                </div>
                <div class="carrito-producto-subtotal">
                    <small>Subtotal</small>
                    <p>$${producto.precio * producto.cantidad}</p>
                </div>
                <button class="carrito-producto-eliminar" id="${producto.id}"><i class="bi bi-trash-fill"></i></button>
            `;
    
            contenedorCarritoProductos.append(div);
        }); 
} else {
    contenedorCarritoVacio.classList.remove("disabled");
    contenedorCarritoProductos.classList.add("disabled");
    contenedorCarritoAcciones.classList.add("disabled");
    contenedorCarritoComprado.classList.add("disabled");
}  
actualizarBotonesEliminar(); 
actualizarTotal();
}  
cargarProductosCarrito();   
    

function actualizarBotonesEliminar(){
    botonesEliminar = document.querySelectorAll(".carrito-producto-eliminar");
    botonesEliminar.forEach(boton => {
        boton.addEventListener("click", eliminarDelCarrito);
    });
}

function eliminarDelCarrito(e) {
    let idBoton = e.currentTarget.id;
    const index=productosEnCarrito.findIndex(producto => producto.id === idBoton)
    productosEnCarrito.splice(index, 1);
    cargarProductosCarrito(); 
    localStorage.setItem("productosEnCarrito", JSON.stringify(productosEnCarrito));
}

botonesVaciarCarrito.addEventListener("click", vaciarCarrito); 
function vaciarCarrito() {
    productosEnCarrito.length = 0;
    localStorage.setItem("productosEnCarrito", JSON.stringify(productosEnCarrito));
    cargarProductosCarrito();
    actualizarTotal();
}

botonesComprarCarrito.addEventListener("click",comprarCarrito)


function actualizarTotal(){
    const totalCalculado = productosEnCarrito.reduce((acc,producto)=> acc + producto.precio * producto.cantidad,0)
    carritoTotal.innerText = `$${totalCalculado}`;
}
  
function comprarCarrito(){
    productosEnCarrito.length = 0;
    localStorage.setItem("productosEnCarrito", JSON.stringify(productosEnCarrito));
    contenedorCarritoVacio.classList.add("disabled");
    contenedorCarritoProductos.classList.add("disabled");
    contenedorCarritoAcciones.classList.add("disabled");
    contenedorCarritoComprado.classList.remove("disabled");
}



