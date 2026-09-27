
import Category from "../models/categoryModel.js"

export const create = async (req, res) => {
    try {
      const categoryExist = await Category.findOne({ name: req.body.name });
      if (categoryExist) {
        res.status(400).json({ message: "La categoria ya existe" });
      } else {
        const newCategory = new Category({ name: req.body.name });
        const response = await newCategory.save();
        res.status(201).json(response);
      }
    } catch (error) {
      res.status(500).json({ message: "Error en el servidor", error });
    }
  };

export const getAll = async (req, res) => {
    try {
      const categories = await Category.find();
      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ message: "Error en el servidor", error });
    }
  };