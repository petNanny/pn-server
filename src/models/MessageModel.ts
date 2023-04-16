import { InferSchemaType, model, Schema } from "mongoose";

const Message = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "PetOwner",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "conversation",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

//ts
type MessageType = InferSchemaType<typeof Message>;
export default model<MessageType>("messages", Message);
