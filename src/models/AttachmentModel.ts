import { InferSchemaType, model, Schema } from "mongoose";

const attachmentSchema = new Schema(
  {
    url: { type: String, require: true },
    fileName: { type: String, require: true },
    petOwner: { type: Schema.Types.ObjectId, ref: "PetOwner", require: true },
  },
  {
    timestamps: true,
  }
);

//ts
type Attachment = InferSchemaType<typeof attachmentSchema>;

export default model<Attachment>("Attachment", attachmentSchema);
