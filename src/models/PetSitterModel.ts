import { InferSchemaType, model, Schema } from "mongoose";

const petSitterSchema = new Schema(
  {
    address: {
      street: { type: String },
      streetNumber: { type: String },
      city: { type: String },
      postcode: { type: String },
      state: { type: String, enum: ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"] },
      country: { type: String },
    },
    images: [String],
    introduction: { type: String },
    description: { type: String },
    service: [
      {
        service: { type: String },
        serviceDesc: { type: String },
        Rate: { type: Number },
        isActive: { type: Boolean },
      },
    ],
    additionalService: [
      {
        service: { type: String },
        isActive: { type: Boolean },
      },
    ],
    policy: { type: String, enum: ["Flexible", "Moderate"], default: "Flexible" },
    preference: {
      age: { type: String, enum: ["Puppies", "Young", "Adult", "Senior"] },
      size: { type: String, enum: ["Small", "Medium", "Large", "Giant"] },
      petTypes: { type: String, enum: ["Cats", "Ferret", "Small animals"] },
    },
    home: {
      propertyType: { type: String },
      OutdoorArea: { type: String },
      fenced: { type: Boolean },
      kids: { type: String },
    },
    walkingAreas: [String],
    experiences: {
      years: { types: Number },
      desc: { types: String },
    },
    completedCheck: [
      {
        title: { type: String },
        done: { type: Boolean },
      },
    ],
    bankAccount: [
      {
        bsb: { type: String },
        accountNumber: { type: String },
      },
    ],
    abn: { type: String },
    status: { type: String, enum: ["active", "not active"], default: "not active" },
  },
  {
    timestamps: true,
  }
);

export type PetSitterType = InferSchemaType<typeof petSitterSchema>;

export default model<PetSitterType>("PetSitter", petSitterSchema);
