import { InferSchemaType, model, Schema } from "mongoose";

const legalDocSchema = new Schema(
  {
    url: { type: String, require: true },
    fileName: { type: String, require: true },
    petSitter: { type: Schema.Types.ObjectId, ref: "PetSitter", require: true },
  },
  {
    timestamps: true,
  }
);

//ts
type LegalDocsType = InferSchemaType<typeof legalDocSchema>;
export default model<LegalDocsType>("LegalDocs", legalDocSchema);
