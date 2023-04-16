import { InferSchemaType, model, Schema } from "mongoose";

const Conversation = new Schema(
  {
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "PetOwner",
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// const Conversation = new Schema(
//   {
//     sender: {
//       type: Schema.Types.ObjectId,
//       ref: "PetOwner",
//       required: true,
//     },
//     receiver: {
//       type: Schema.Types.ObjectId,
//       ref: "PetSitter",
//       required: true,
//     }
//   },
//   {
//     timestamps: true,
//   }
// );

//ts
type ConversationType = InferSchemaType<typeof Conversation>;
export default model<ConversationType>("conversation", Conversation);
