import { InferSchemaType, model, Schema } from "mongoose";

const petsSchema = new Schema(
  {
    petOwner: { type: Schema.Types.ObjectId, ref: "PetOwner", require: true },
    avatar: {
      type: String,
      default:
        "https://icon-library.com/images/2018/7702845_dog-pawprint-plantillas-de-tatuajes-temporal-png-download.png",
    },
    petName: { type: String, require: true },
    species: {
      type: String,
      require: true,
      enum: [
        "Dog",
        "Cat",
        "Ferret",
        "Rabbit",
        "Guinea pig",
        "Bird",
        "Reptile",
        "Farm animal",
        "Horse",
        "Other",
      ],
      default: "Dog",
    },
    breed: { type: String, require: true },
    size: {
      type: String,
      enum: ["Extra small", "Small", "Medium", "Large", "Giant"],
      default: "Medium",
    },
    gender: { type: String, enum: ["Male", "Female"], default: "Male" },
    yearOfBirth: { type: Number, default: new Date().getFullYear() },
    neutered: { type: Boolean, default: false },
    vaccinated: { type: Boolean, default: false },
    chipped: { type: Boolean, default: false },
    houseTrained: { type: Boolean, default: false },
    friendlyWithDogs: { type: Boolean, default: false },
    friendlyWithCats: { type: Boolean, default: false },
    friendlyWithKids: { type: Boolean, default: false },
    friendlyWithAdults: { type: Boolean, default: false },
    description: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

//ts
type PetType = InferSchemaType<typeof petsSchema>;

export default model<PetType>("Pet", petsSchema);
