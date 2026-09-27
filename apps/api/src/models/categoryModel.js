import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  /** El identificador legible que usa el front para filtrar: "zapatillas". */
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
});

categorySchema.set("toJSON", {
  transform: (document, plain) => {
    plain.id = plain._id;
    delete plain._id;
    delete plain.__v;
    return plain;
  },
});

export default mongoose.model("Category", categorySchema);
