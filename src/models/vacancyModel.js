import mongoose from "mongoose";

const VacancySchema = new mongoose.Schema(
  {
    logo: {
      type: String, 
      required: false,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    org: {
      type: String,
      required: true,
    },
    postedTime: {
      type: Date, // tarix backend-dən gələcək
      default: Date.now,
    },
    deadline:{
      type: Date,
      required: false,

    },
    location: {
      type: String,
      required: true,
    },
    category: {
      type: String, // Proqramlasdirma, Könüllü, Təcrübə
      required: true,
    },
    type: {
      type: String, // Tam vaxt, Yarım vaxt, Təcrübə
      required: true,
    },
    workplace: {
      type: String, // Uzaqdan, Hibrid, Yerində, Online
      required: true,
    },
    paymentType: {
      type: String,
      enum: ["paid", "unpaid"],
      required: true,
    },
    salary: {
      type: String, // məsələn: "500-800₼"
      default: null,
    },
    views: {
      type: Number,
      default: 0,
    },
    applicants: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Vacancy", VacancySchema);
