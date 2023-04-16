import { InferSchemaType, model, Schema, Document, Types } from "mongoose";

interface IPetOwner extends Document {
  email: string;
  firstName: string;
  lastName: string;
  userName: string;
  googleSubId?: string;
  password: string;
  avatar: string;
  phone: string;
  roles: string[];
  isActive: boolean;
  petSitter?: Types.ObjectId;
  pets?: Types.ObjectId[];
  chatMessages?: Types.ObjectId[];
}

const petOwnerSchema = new Schema<IPetOwner>(
  {
    email: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    userName: { type: String },
    googleSubId: { type: String },
    password: {
      type: String,
      required: function (this: IPetOwner) {
        if (this.googleSubId) {
          return false;
        } else {
          return true;
        }
      },
    },
    avatar: {
      type: String,
      default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    phone: { type: String },
    roles: {
      type: [String],
      default: ["PetOwner"],
    },
    isActive: { type: Boolean, default: false },
    petSitter: { type: Schema.Types.ObjectId, ref: "PetSitter" },
    pets: [{ type: Schema.Types.ObjectId, ref: "Pet" }],
    chatMessages: [{ type: Schema.Types.ObjectId, ref: "ChatMessage" }],
  },
  {
    timestamps: true,
  }
);

petOwnerSchema.pre("save", function (next) {
  if (!this.userName) {
    this.userName = this.get("firstName");
  }

  next();
});

export type PetOwnerType = InferSchemaType<typeof petOwnerSchema>;

export default model<PetOwnerType>("PetOwner", petOwnerSchema);
