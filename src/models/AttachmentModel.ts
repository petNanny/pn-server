import { InferSchemaType, model, Schema } from "mongoose";

const attachmentSchema = new Schema(
  {
    url: { type: String, require: true },
    fileName: { type: String, require: true },
    petSitterId: { type: Schema.Types.ObjectId, ref: "PetSitter", require: true },
  },
  {
    timestamps: true,
  }
);

//ts
type Attachment = InferSchemaType<typeof attachmentSchema>;

export default model<Attachment>("Attachment", attachmentSchema);
