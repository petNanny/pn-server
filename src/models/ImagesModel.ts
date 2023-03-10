import { InferSchemaType, model, Schema } from "mongoose";

const imagesSchema = new Schema(
  {
    url: { type: String, require: true },
    fileName: { type: String, require: true },
    petOwner: { type: Schema.Types.ObjectId, ref: "PetOwner", require: true },
    orderNumber: { type: Number, require: true },
  },
  {
    timestamps: true,
  }
);

//ts
type Attachment = InferSchemaType<typeof imagesSchema>;

export default model<Attachment>("Attachment", imagesSchema);
