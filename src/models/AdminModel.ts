import { InferSchemaType, model, Schema } from "mongoose";

const adminSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

//ts
type AdminType = InferSchemaType<typeof adminSchema>;

export default model<AdminType>("Admin", adminSchema);