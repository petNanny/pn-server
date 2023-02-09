import { InferSchemaType, model, Schema } from "mongoose";

const userSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

//ts
type User = InferSchemaType<typeof userSchema>;

export default model<User>("User", userSchema);
