import { InferSchemaType, model, Schema } from "mongoose";

const petSitterSchema = new Schema(
  {
    petOwner: { type: Schema.Types.ObjectId, ref: "PetOwner" },
    address: {
      street_number: { type: String, default: "" },
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      postcode: { type: String, default: "" },
      council: { type: String, default: "" },
      state: {
        type: String,
        enum: ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA", ""],
        default: "",
      },
      country: { type: String, default: "" },
      latitude: { type: String, default: "" },
      longitude: { type: String, default: "" },
    },
    geoCode: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: [],
    },
    images: [{ type: Schema.Types.ObjectId, ref: "Attachment" }],
    legalDocs: [{ type: Schema.Types.ObjectId, ref: "LegalDocs" }],
    languages: [String],
    introduction: { type: String, default: "" }, // one headline
    description: { type: String, default: "" }, // rich text from editor
    service: [
      {
        // service name
        service: {
          type: String,
          // enum: ["Dog boarding", "Doggy day care", "Dog walking", "Home visits", "House sitting"],
        },
        serviceDesc: { type: String },
        Rate: { type: Number }, // service price
        RateForAddition: { type: Number }, // some services have second price, e.g. one addition pet charge 50 dollars
        isActive: { type: Boolean }, // isActive is for save Rate and RateForAddition, e.g. if one
      },
    ],
    additionalService: [String],
    policy: {
      type: String,
      enum: ["Flexible", "Moderate"],
      default: "Flexible",
    }, // refund policy
    preference: {
      // dogs ages
      age: {
        type: [String],
        enum: ["Puppies", "Young", "Adult", "Senior"],
        // if pet sitter does not select any age, set all ages as default
        // default: ["Puppies", "Young", "Adult", "Senior"]
      },
      // dogs sizes
      size: {
        type: [String],
        enum: ["Small", "Medium", "Large", "Giant"],
        // if pet sitter does not select any size, set all sizes as default
        // default: ["Small", "Medium", "Large", "Giant"]
      },
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
    //TODO: will delete experiences, because we have a 'experience' to replace it
    experiences: [
      {
        title: { types: String }, //what types of experience
        years: { types: Number },
      },
    ],
    // please use this experience as newest
    experience: {
      years: {
        type: String,
        enum: ["Less than one", "Less than 5", "More than 5", "More than 10", "More than 20"],
        default: "Less than one",
      },
      expAsVolunteer: { type: Boolean, default: false },
      expWithBehavioralProblems: { type: Boolean, default: false },
      expWithRescuePets: { type: Boolean, default: false },
      familiarWithDogTrainingTechs: { type: Boolean, default: false },
      skillsDescription: { type: String, default: "" },
    },
    experienceDesc: { type: String }, //an overall desc for experience
    completedCheck: [
      {
        title: { type: String }, // different blocks of documents, e.g. intro part, image part, home part ...
        isFinished: { type: Boolean, default: false },
      },
    ],
    bankAccount: { bsb: { type: String }, accountNumber: { type: String } },

    abn: { type: String, default: "" },
    isActivePetSitter: { type: Boolean, default: false },
    // use format: "YYYY-MM-DD" would be easy to compare date, because we do not need consider time zone
    notAvailableDates: [String],
    lastUpdateCalendarTime: { type: Date },
  },
  {
    timestamps: true,
  }
);

petSitterSchema.index({ geoCode: "2dsphere" });

export type PetSitterType = InferSchemaType<typeof petSitterSchema>;

export default model<PetSitterType>("PetSitter", petSitterSchema);
