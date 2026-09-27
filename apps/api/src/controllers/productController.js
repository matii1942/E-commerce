import Product from "../models/productModel.js";

//traemos los productos creados
export const getAll = async (req, res) => {
    try {
        // populate trae la categoría entera en vez de sólo su identificador:
        // el front necesita el nombre para el título y el slug para filtrar.
        const products = await Product.find().populate("category");

        // Una lista vacía no es un 404. "No hay productos" es una respuesta
        // correcta a "dame los productos", y el front sabe dibujarla; un 404
        // lo hace tratar un catálogo vacío como un error de red.
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json ({message: "Error en el Server"})
    }
}
//creacion del producto
export const create = async (req, res) =>{
    try {
        const productData = new Product(req.body);
        const {name} = productData;
        const productExist = await Product.findOne({name})
        if (productExist){
            return res.status(400).json ({ message: `producto ${name} ya existe`})
        }
        const savedProduct = await productData.save();
        res.status(200).json(savedProduct)
            

    } catch (error) {
        res.status(500).json({message: "Error en el Server", error})
    }
};

//Buscamos el producto uno a la vez

export const findOne = async (req, res) => {
    try {
        // Dos errores acá. La condición estaba invertida: si el producto
        // existía devolvía 400 diciendo que no existe, y si no existía
        // devolvía 200 con null. Y leía req.body.name en una ruta GET, que
        // no lleva cuerpo, así que buscaba por undefined.
        const { name } = req.params;
        const product = await Product.findOne({ name }).populate("category");

        if (!product) {
            return res.status(404).json({ message: `El producto ${name} no existe` });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({message:"Error interno en el server",error })
    }
}
// cambiamos el producto

export const update = async (req, res) => {
    try {
        const id = req.params.id;
        const productExist = await Product.findOne({_id:id});
        if (!productExist){
            return res.status(404).json({message: "Usuario no encontrado"})
        }
        const updateProduct = await Product.findByIdAndUpdate({_id:id}, req.body,{new:true});
        res.status(201).json(updateProduct);
    } catch (error) {
        res.status(500).json({message: "Error en el Server"})
    }
}
//Borramos el producto

export const deleteProduct = async (req, res) =>{
    try {
        const id =req.params.id
        const productExist = await Product.findOne({_id:id})
        if (!productExist){
            return res.status (404).json ({ message: " Producto no encontrado"})
        } 
        await Product.findByIdAndDelete(id);
        res.status(201).json({message: "Producto borrado"})
    } catch (error) {
        res.status(500).json({message:"Error interno en el server"})
    }
}