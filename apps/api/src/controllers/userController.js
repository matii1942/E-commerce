import User from "../models/userModel.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config.js";

// Creamos el usuario
export const create = async (req, res) => {
    try { 
        //tomamos los datos del body
        const userData = new User(req.body);
        
        //busco si existe el usuario con destructuracion
        const {email} = userData;
        const userExist = await User.findOne({email: email});
        if (userExist) {
            return res.status(400).json({message: `User ${email} already exist`})
        }
        //valido si existe el usuario
        //guardo el usuario
        const saveUser = await userData.save();
       
        //muestro informacion del usuario
        res.status(200).json(saveUser);

    } catch (error) {
        res.status(500).json ({error: "No se puede encontrar los usuarios"});
        
    }
};
//Buscamos el usuario por metodo getAll
export const get = async (req, res) => {
    try {
        const users = await User.find();
        if (users.length === 0) {
            return res.status(404).json({message : "no hay usuarios"});
        }
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({error:  "Error interno en el servidor"})
    }
}
// Cambiamos datos del usuario
export const update = async (req, res) => {
    try {
        const id = req.params.id
        const userExist= await User.findOne({_id: id});
        if (!userExist) {
            return res.status(404).json ({message:"Usuario no encontrado"});
        }
        const updateUser = await User.findByIdAndUpdate({_id:id}, req.body, {
            new:true});
            res.status(201).json(updateUser);
        
    } catch (error) {
        res.status(500).json
({error: "Error interno en el servidor"})        
    }
}
//Borramos el usuario
export const destroyed = async (req, res) => {
    try {
        const _id = req.params.id
        // Era `findeone`: lanzaba un TypeError que caía en el catch, así que
        // borrar un usuario devolvía 500 siempre, incluso cuando existía.
        const userExist = await User.findOne({_id});
    if (!userExist) {
        return res.status(404).json ({message: "El usuario no a sido encontrado"});
    }
    await User.findByIdAndDelete(_id)
    res.status(201).json({message: "El usuario fue borrado exitosamente"})
    } catch (error) {
        res.status(500).json ({message: "Error interno en el server"})
    }
};
export const validate = async (req, res) => {
    try {
      const userFound = await User.findOne({ email: req.body.email });
      if (!userFound) {
        // Sin este return seguía de largo hasta compareSync(..., null.password),
        // lanzaba un TypeError y trataba de responder por segunda vez.
        return res
          .status(400)
          .json({ message: "El email y/o la contraseña son incorrectos" });
      }
      //Encriptamos y la comparamos con la guardada
      if (bcrypt.compareSync(req.body.password, userFound.password)) {
        //Para firmar el token hacemos el payload, con secreto y tiempo de expiracion
        const payload = {
          userId: userFound._id,
          userEmail: userFound.email,
        };
        //Firmamos el token
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        res.status(200).json({ token });
      } else {
        res
          .status(400)
          .json({ message: "El email y/o contraseña son incorrectos" });
        return;
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  };