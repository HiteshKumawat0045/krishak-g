import mongoose, { Schema, Document, Model } from "mongoose";

export interface IConversationLog extends Document {
  deviceId: string;
  conversationId: string;
  transcribedText: string;
  detectedLanguage: string;
  responseText: string;
  responseLanguage: string;
  createdAt: Date;
}

const ConversationLogSchema = new Schema<IConversationLog>({
  deviceId: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  conversationId: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  transcribedText: {
    type: String,
    required: true
  },
  detectedLanguage: {
    type: String,
    required: true
  },
  responseText: {
    type: String,
    required: true
  },
  responseLanguage: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const ConversationLog: Model<IConversationLog> =
  mongoose.models.ConversationLog ||
  mongoose.model<IConversationLog>("ConversationLog", ConversationLogSchema);
