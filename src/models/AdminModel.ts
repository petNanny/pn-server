import { InferSchemaType, model, Schema } from "mongoose";

const adminSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userName: { type: String },
  avatar: {
    type: String,
    default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
  },
});

//ts
type AdminType = InferSchemaType<typeof adminSchema>;

export default model<AdminType>("Admin", adminSchema);
