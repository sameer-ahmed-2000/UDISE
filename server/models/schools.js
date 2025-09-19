
// COMPREHENSIVE SCHEMA OPTIMIZATION FOR ALL USE CASES
const mongoose = require("mongoose");

// FULLY OPTIMIZED SCHEMA
const SchoolSchema = new mongoose.Schema({
    udise_code: { type: String, required: true, unique: true },
    school_name: { type: String, required: true },
    state: { type: String, required: true },
    district: { type: String, required: true },
    block: { type: String, required: true },
    village: { type: String, required: true },
    location: { type: String, enum: ["Rural", "Urban"], required: true },
    management_type: { type: String, required: true },
    school_category: { type: String, required: true },
    school_type: { type: String, enum: ["Co-Ed", "Girls", "Boys"], required: true },
    school_status: { type: String, required: true }
}, { 
    timestamps: true,
    versionKey: false,
});

// CRITICAL INDEXES FOR ALL QUERY PATTERNS

// 1. PRIMARY INDEXES
SchoolSchema.index({ udise_code: 1 }, { unique: true, name: "idx_udise_unique" });

// 2. HIERARCHICAL LOCATION INDEXES (for filtering queries)
SchoolSchema.index(
    { state: 1, district: 1, block: 1, village: 1 }, 
    { name: "idx_location_full" }
);
SchoolSchema.index(
    { state: 1, district: 1, block: 1 }, 
    { name: "idx_location_partial_3" }
);
SchoolSchema.index(
    { state: 1, district: 1 }, 
    { name: "idx_location_partial_2" }
);
SchoolSchema.index(
    { state: 1 }, 
    { name: "idx_state_only" }
);

// 3. DISTRIBUTION QUERY INDEXES (CRITICAL for your distribution endpoint)
// These are the missing indexes that will dramatically improve performance
SchoolSchema.index(
    { state: 1, management_type: 1 }, 
    { name: "idx_state_mgmt_type" }
);
SchoolSchema.index(
    { state: 1, location: 1 }, 
    { name: "idx_state_location" }
);
SchoolSchema.index(
    { state: 1, school_type: 1 }, 
    { name: "idx_state_school_type" }
);

// For district-level distribution queries
SchoolSchema.index(
    { state: 1, district: 1, management_type: 1 }, 
    { name: "idx_state_district_mgmt" }
);
SchoolSchema.index(
    { state: 1, district: 1, location: 1 }, 
    { name: "idx_state_district_location" }
);
SchoolSchema.index(
    { state: 1, district: 1, school_type: 1 }, 
    { name: "idx_state_district_school_type" }
);

// For block-level distribution queries
SchoolSchema.index(
    { state: 1, district: 1, block: 1, management_type: 1 }, 
    { name: "idx_state_district_block_mgmt" }
);
SchoolSchema.index(
    { state: 1, district: 1, block: 1, location: 1 }, 
    { name: "idx_state_district_block_location" }
);
SchoolSchema.index(
    { state: 1, district: 1, block: 1, school_type: 1 }, 
    { name: "idx_state_district_block_school_type" }
);

// For village-level distribution queries
SchoolSchema.index(
    { state: 1, district: 1, block: 1, village: 1, management_type: 1 }, 
    { name: "idx_full_location_mgmt" }
);
SchoolSchema.index(
    { state: 1, district: 1, block: 1, village: 1, location: 1 }, 
    { name: "idx_full_location_type" }
);
SchoolSchema.index(
    { state: 1, district: 1, block: 1, village: 1, school_type: 1 }, 
    { name: "idx_full_location_school_type" }
);

// 4. INDIVIDUAL FIELD INDEXES (for standalone distribution queries)
SchoolSchema.index({ management_type: 1 }, { name: "idx_mgmt_type" });
SchoolSchema.index({ location: 1 }, { name: "idx_location" });
SchoolSchema.index({ school_type: 1 }, { name: "idx_school_type" });
SchoolSchema.index({ school_status: 1 }, { name: "idx_school_status" });

// 5. COMPOSITE INDEXES for common combinations
SchoolSchema.index(
    { management_type: 1, location: 1 }, 
    { name: "idx_mgmt_location" }
);
SchoolSchema.index(
    { school_type: 1, school_status: 1 }, 
    { name: "idx_type_status" }
);

module.exports = mongoose.model("School", SchoolSchema);