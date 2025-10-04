

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
      type: Date,
      default: Date.now,
    },
    deadline: {
      type: Date,
      required: false,
    },
    location: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    workplace: {
      type: String,
      required: true,
    },
    paymentType: {
      type: String,
      enum: ["paid", "unpaid"],
      required: true,
    },
    salary: {
      type: String,
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
    urgent: {
      type: Boolean,
      default: false,
    },
    experience: {
      type: String,
      required: true,
    },
    education: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    requirements: [{
      type: String,
    }],
    responsibilities: [{
      type: String,
    }],
    benefits: [{
      type: String,
    }],
    companyInfo: {
      name: {
        type: String,
        required: true,
      },
      website: {
        type: String,
        required: false,
      },
      phone: {
        type: String,
        required: false,
      },
      email: {
        type: String,
        required: false,
      },
      employees: {
        type: String,
        required: false,
      },
      industry: {
        type: String,
        required: false,
      },
      founded: {
        type: String,
        required: false,
      },
      about: {
        type: String,
        required: false,
      },
    },
    tags: [{
      type: String,
    }],
    
    // SEO və metadata
    slug: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
    },
    metaDescription: {
      type: String,
      maxlength: 160,
    },
    
    // Status və moderasiya
    status: {
      type: String,
      enum: ["active", "inactive", "expired", "draft"],
      default: "active",
    },
    isApproved: {
      type: Boolean,
      default: null,
    },
    
    // Statistika
    clickCount: {
      type: Number,
      default: 0,
    },
    shareCount: {
      type: Number,
      default: 0,
    },
    bookmarkCount: {
      type: Number,
      default: 0,
    },
    
    // Müraciət parametrləri
    applicationMethod: {
      type: String,
      enum: ["internal", "external", "email"],
      default: "internal",
    },
    externalApplicationUrl: {
      type: String,
    },
    applicationEmail: {
      type: String,
    },
    
    // ⚠️ DÜZƏLDILMIŞ: ObjectId istifadə edirik
    createdBy: {
      type: mongoose.Schema.Types.ObjectId, // ✅ ObjectId
      ref: "User", // ✅ User model-inə reference
      required: false,
    },
    
    relatedJobs: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Vacancy" 
    }],

    // Lokasiya coordinates
    coordinates: {
      latitude: {
        type: Number,
      },
      longitude: {
        type: Number,
      },
    },
    
    // Dil seçimləri
    languages: [{
      language: {
        type: String,
      },
      level: {
        type: String,
      }
    }],
    
    // İş müqaviləsi növü
    contractType: {
      type: String,
      required: false,
    },
    eventType: {
      type: String,
      enum: ["internship", "volunteering", "job", "event", "webinar"],
      required: false,
    },
    // Yaş məhdudiyyəti
    ageRange: {
      min: {
        type: Number,
      },
      max: {
        type: Number,
      }
    },
  },
  { 
    timestamps: true,
  }
);

// Virtual field - postedTime-dan neçə gün keçdiyini hesablayır
VacancySchema.virtual('daysAgo').get(function() {
  return Math.floor((Date.now() - this.postedTime) / (1000 * 60 * 60 * 24));
});

// Slug yaradıcı middleware
VacancySchema.pre('save', function(next) {
  if (this.isNew || this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/ç/g, 'c')
      .replace(/ğ/g, 'g')
      .replace(/ı/g, 'i')
      .replace(/ş/g, 's')
      .replace(/ü/g, 'u')
      .replace(/ö/g, 'o')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    this.slug += `-${Date.now()}`;
  }
  next();
});

// Instance methods
VacancySchema.methods.incrementViews = function() {
  this.views += 1;
  this.clickCount += 1;
  return this.save();
};

VacancySchema.methods.incrementApplications = function() {
  this.applicants += 1;
  return this.save();
};

// Static methods
VacancySchema.statics.findActive = function() {
  return this.find({
    status: 'active',
    isApproved: true,
    $or: [
      { deadline: { $gte: new Date() } },
      { deadline: null }
    ]
  });
};

// Index-lər
VacancySchema.index({ category: 1, type: 1 });
VacancySchema.index({ location: 1 });
VacancySchema.index({ featured: -1, createdAt: -1 });
VacancySchema.index({ deadline: 1 });
VacancySchema.index({ status: 1, isApproved: 1 });
VacancySchema.index({ createdBy: 1 }); // ✅ yeni index

export default mongoose.model("Vacancy", VacancySchema);