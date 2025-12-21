const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;
const productos = require("./data/productos");

app.use(cors());
app.use(express.json());

app.get("/api/productos", (req, res) => {
    res.json(productos);
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
