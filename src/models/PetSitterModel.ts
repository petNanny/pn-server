import { InferSchemaType, model, Schema } from "mongoose";

const petSitterSchema = new Schema(
  {
    petOwner: { type: Schema.Types.ObjectId, ref: "PetOwner" },
    address: {
      street_number: { type: String },
      street: { type: String },
      city: { type: String },
      postcode: { type: String },
      council: { type: String },
      state: { type: String, enum: ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"] },
      country: { type: String },
      // latitude: { type: String },
      // longitude: { type: String },
    },
    geoCode: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: [],
    },
    images: [{ type: Schema.Types.ObjectId, ref: "Attachment" }],
    languages: [String],
    introduction: { type: String, default: "" },
    description: { type: String, default: "" },
    service: [
      {
        service: {
          type: String,
          enum: ["Dog boarding", "Doggy day care", "Dog walking", "Home visits", "House sitting"],
        }, // service name
        serviceDesc: { type: String },
        Rate: { type: Number }, // service price
        isActive: { type: Boolean },
      },
    ],
    additionalService: [
      {
        service: { type: String },
        isActive: { type: Boolean },
      },
    ],
    policy: {
      type: String,
      enum: ["Flexible", "Moderate"],
      default: "Flexible",
    }, // refund policy
    preference: {
      age: {
        type: [String],
        enum: ["Puppies", "Young", "Adult", "Senior"],
        // if pet sitter does not select any age, set all ages as default
        // default: ["Puppies", "Young", "Adult", "Senior"]
      }, // dogs ages
      size: {
        type: [String],
        enum: ["Small", "Medium", "Large", "Giant"],
        // if pet sitter does not select any size, set all sizes as default
        // default: ["Small", "Medium", "Large", "Giant"]
      }, // dogs sizes
      petTypes: {
        type: [String],
        enum: ["Dogs", "Cats", "Ferret", "Small animals"],
        // if pet sitter does not select any pet type, set all pet types as default
        // default: ["Dogs", "Cats", "Ferret", "Small animals"]
      },
    },
    home: {
      propertyType: { type: String, enum: ["House", "Apartment", "Farm"], default: "House" },
      outDoorArea: { type: String, enum: ["None", "Small", "Medium", "Large"], default: "Medium" },
      fenced: { type: Boolean, default: false },
      kids: {
        type: String,
        enum: ["None", "Younger than 3", "Younger than 10", "Older than 10"],
        default: "None",
      },
    },
    walkingAreas: [String], // Urban, Beach, City part, Country side, Forest, Nearby off-leash area
    experiences: [
      {
        title: { types: String }, //what types of experience
        years: { types: Number },
      },
    ],
    experienceDesc: { type: String }, //an overall desc for experience
    completedCheck: [
      {
        title: { type: String }, // different blocks of documents, e.g. intro part, image part, home part ...
        isFinished: { type: Boolean, default: false },
      },
    ],
    bankAccount: [
      {
        bsb: { type: String },
        accountNumber: { type: String },
      },
    ],
    abn: { type: String, default: "" },
    isActivePetSitter: { type: Boolean, default: false },
    notAvailableDates: [Date],
  },
  {
    timestamps: true,
  }
);

petSitterSchema.index({ geoCode: "2dsphere" });

export type PetSitterType = InferSchemaType<typeof petSitterSchema>;

export default model<PetSitterType>("PetSitter", petSitterSchema);
