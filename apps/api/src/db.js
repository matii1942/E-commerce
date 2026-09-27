import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGOURI = process.env.MONGODB_URI;

//Conexion a base de datos
export const connectDB = async () => {
  try {
    await mongoose.connect(MONGOURI);
    console.log("Base de datos conectada");
  } catch (error) {
    console.error("Error al conectarse a la base de datos:", error);
    process.exit(1);
  }
};