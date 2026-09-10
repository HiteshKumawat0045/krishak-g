import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFarmerProfile extends Document {
  deviceId: string;
  name?: string;
  location: string;
  country?: string;
  state?: string;
  district?: string;
  preferredLanguage: "en" | "hi";
  mainCrop?: string;
  landSizeAcres?: number;
  previousCrop?: string;
  createdAt: Date;
}

const FarmerProfileSchema = new Schema<IFarmerProfile>({
  deviceId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  district: {
    type: String,
    trim: true
  },
  preferredLanguage: {
    type: String,
    default: "en"
  },

  mainCrop: {
    type: String,
    trim: true
  },
  landSizeAcres: {
    type: Number
  },
  previousCrop: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const FarmerProfile: Model<IFarmerProfile> =
  mongoose.models.FarmerProfile ||
  mongoose.model<IFarmerProfile>("FarmerProfile", FarmerProfileSchema);
