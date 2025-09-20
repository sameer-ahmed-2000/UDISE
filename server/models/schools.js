const mongoose = require("mongoose");

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
    minimize: false,
    strict: true,
    collection: 'schools'
});

SchoolSchema.index({
    state: 1,
    district: 1,
    block: 1,
    village: 1
});
SchoolSchema.index({ state: 1, district: 1, block: 1 });
SchoolSchema.index({ state: 1, district: 1 });
module.exports = mongoose.model("School", SchoolSchema);
