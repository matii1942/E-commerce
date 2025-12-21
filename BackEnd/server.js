const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
const productos = require("./data/productos");

app.use(cors());
app.use(express.json());

const path = require("path");
app.use(express.static(path.join(__dirname, "../FrontEnd")));

app.get("/api/productos", (req, res) => {
    res.json(productos);
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
