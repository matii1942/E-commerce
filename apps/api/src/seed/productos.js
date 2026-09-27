// Catálogo de origen: los 37 productos que la tienda servía desde un
// archivo, antes de que hubiera base de datos. Acá es sólo la semilla.
const productos = [
    {id: "zapatilla-01",
        titulo: "Zapatilla 01",
        img: "./img/zapa1.webp",
        categoria: {
            nombre:"Zapatillas",
            id:"zapatillas"
        },
        precio: 1000
    },
    {id: "zapatilla-02",
        titulo: "Zapatilla 02",
        img: "./img/zapa2.webp",
        categoria: {
            nombre:"Zapatillas",
            id:"zapatillas"
        },
        precio: 1000
    },
    {id: "zapatilla-03",
        titulo: "Zapatilla 03",
        img: "./img/zapa3.webp",
        categoria: {
            nombre:"Zapatillas",
            id:"zapatillas"
        },
        precio: 1000
    },
    {id: "zapatilla-04",
        titulo: "Zapatilla 04",
        img: "./img/zapa4.webp",
        categoria: {
            nombre:"Zapatillas",
            id:"zapatillas"
        },
        precio: 1000
    },
    {id: "zapatilla-05",
        titulo: "Zapatilla 05",
        img: "./img/zapa5.webp",
        categoria: {
            nombre:"Zapatillas",
            id:"zapatillas"
        },
        precio: 1000
    },
    {id: "zapatilla-06",
        titulo: "Zapatilla 06",
        img: "./img/zapa6.webp",
        categoria: {
            nombre:"Zapatillas",
            id:"zapatillas"
        },
        precio: 1000
    },
    {id: "zapatilla-07",
        titulo: "Zapatilla 07",
        img: "./img/zapa7.webp",
        categoria: {
            nombre:"Zapatillas",
            id:"zapatillas"
        },
        precio: 1000
    },
    {id: "zapatilla-08",
        titulo: "Zapatilla 08",
        img: "./img/zapa8.webp",
        categoria: {
            nombre:"Zapatillas",
            id:"zapatillas"
        },
        precio: 1000
    },
    {id: "zapatilla-09",
        titulo: "Zapatilla 09",
        img: "./img/zapa9.jpg",
        categoria: {
            nombre:"Zapatillas",
            id:"zapatillas"
        },
        precio: 1000
    },
    {id: "zapatilla-10",
        titulo: "Zapatilla 10",
        img: "./img/zapa10.jpg",
        categoria: {
            nombre:"Zapatillas",
            id:"zapatillas"
        },
        precio: 1000
    },
    {id: "zapatilla-11",
        titulo: "Zapatilla 11",
        img: "./img/zapa11.jpg",
        categoria: {
            nombre:"Zapatillas",
            id:"zapatillas"
        },
        precio: 1000
    },
    {id: "zapatilla-12",
        titulo: "Zapatilla 12",
        img: "./img/zapa12.jpg",
        categoria: {
            nombre:"Zapatillas",
            id:"zapatillas"
        },
        precio: 1000
    },
    {id: "zapatilla-13",
        titulo: "Zapatilla 13",
        img: "./img/zapa13.jpg",
        categoria: {
            nombre:"Zapatillas",
            id:"zapatillas"
        },
        precio: 1000
    },
    {id: "zapatilla-14",
        titulo: "Zapatilla 14",
        img: "./img/zapa14.webp",
        categoria: {
            nombre:"Zapatillas",
            id:"zapatillas"
        },
        precio: 1000
    },
    {id: "gorra-01",
        titulo: "Gorra 01",
        img: "./img/gorra1.jpg",
        categoria: {
            nombre:"Gorras",
            id:"gorras"
        },
        precio: 1000
    },
    {id: "gorra-02",
        titulo: "Gorra 02",
        img: "./img/gorra2.jpg",
        categoria: {
            nombre:"Gorras",
            id:"gorras"
        },
        precio: 1000
    },
    {id: "gorra-03",
        titulo: "Gorra 03",
        img: "./img/gorra3.jpg",
        categoria: {
            nombre:"Gorras",
            id:"gorras"
        },
        precio: 1000
    },
    {id: "gorra-04",
        titulo: "Gorra 04",
        img: "./img/gorra4.jpg",
        categoria: {
            nombre:"Gorras",
            id:"gorras"
        },
        precio: 1000
    },
    {id: "gorra-05",
        titulo: "Gorra 05",
        img: "./img/gorra5.jpg",
        categoria: {
            nombre:"Gorras",
            id:"gorras"
        },
        precio: 1000
    },
    {id: "gorra-06",
        titulo: "Gorra 06",
        img: "./img/gorra6.jpg",
        categoria: {
            nombre:"Gorras",
            id:"gorras"
        },
        precio: 1000
    },
    {id: "gorra-07",
        titulo: "Gorra 07",
        img: "./img/gorra7.jpg",
        categoria: {
            nombre:"Gorras",
            id:"gorras"
        },
        precio: 1000
    },
    {id: "gorra-08",
        titulo: "Gorra 08",
        img: "./img/gorra8.jpg",
        categoria: {
            nombre:"Gorras",
            id:"gorras"
        },
        precio: 1000
    },
    {id: "gorra-09",
        titulo: "Gorra 09",
        img: "./img/gorra9.jpg",
        categoria: {
            nombre:"Gorras",
            id:"gorras"
        },
        precio: 1000
    },
    {id: "gorra-10",
        titulo: "Gorra 10",
        img: "./img/gorra10.jpg",
        categoria: {
            nombre:"Gorras",
            id:"gorras"
        },
        precio: 1000
    },
    {id: "gorra-11",
        titulo: "Gorra 11",
        img: "./img/gorra11.jpg",
        categoria: {
            nombre:"Gorras",
            id:"gorras"
        },
        precio: 1000
    },
    {id: "remera-01",
        titulo: "Remera 01",
        img: "./img/reme1.jpg",
        categoria: {
            nombre:"Remeras",
            id:"remeras"
        },
        precio: 1000
    },
    {id:"remera-02",
        titulo:"Remera 02",
        img:"./img/reme2.jpg",
        categoria: {
            nombre:"Remeras",
            id:"remeras"
        },
        precio: 1000
    },
    {id:"remera-03",
        titulo:"Remera 03",
        img:"./img/reme3.jpg",
        categoria: {
            nombre:"Remeras",
            id:"remeras"
        },
        precio: 1000
    },
    {id:"remera-04",
        titulo:"Remera 04",
        img:"./img/reme4.jpg",
        categoria: {
            nombre:"Remeras",
            id:"remeras"
        },
        precio: 1000
    },
    {id:"remera-05",
        titulo:"Remera 05",
        img:"./img/reme5.jpg",
        categoria: {
            nombre:"Remeras",
            id:"remeras"
        },
        precio: 1000
    },
    {id:"remera-06",
        titulo:"Remera 06",
        img:"./img/reme6.webp",
        categoria: {
            nombre:"Remeras",
            id:"remeras"
        },
        precio: 1000
    },
    {id:"remera-07",
        titulo:"Remera 07",
        img:"./img/reme7.webp",
        categoria: {
            nombre:"Remeras",
            id:"remeras"
        },
        precio: 1000
    },
    {id:"remera-08",
        titulo:"Remera 08",
        img:"./img/reme8.jpg",
        categoria: {
            nombre:"Remeras",
            id:"remeras"
        },
        precio: 1000
    },
    {id:"remera-09",
        titulo:"Remera 09",
        img:"./img/reme9.jpg",
        categoria: {
            nombre:"Remeras",
            id:"remeras"
        },
        precio: 1000
    },
    {id:"remera-10",
        titulo:"Remera 10",
        img:"./img/reme10.png",
        categoria: {
            nombre:"Remeras",
            id:"remeras"
        },
        precio: 1000
    },
    {id:"remera-11",
        titulo:"Remera 11",
        img:"./img/reme11.webp",
        categoria: {
            nombre:"Remeras",
            id:"remeras"
        },
        precio: 1000
    },
    {id:"remera-12",
        titulo:"Remera 12",
        img:"./img/reme12.jpg",
        categoria: {
            nombre:"Remeras",
            id:"remeras"
        },
        precio: 1000
    },
]

export default productos;
