import { InferSchemaType, model, Schema } from "mongoose";

const attachmentSchema = new Schema(
  {
    url: { type: String, require: true },
    name: { type: String },
  },
  {
    timestamps: true,
  }
);

//ts
type Attachment = InferSchemaType<typeof attachmentSchema>;

export default model<Attachment>("Attachment", attachmentSchema);