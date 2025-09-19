const { z } = require("zod");

const createSchoolSchema = z.object({
    udise_code: z.string().min(1, "Udise code is required"),
    school_name: z.string().min(1, "School name is required"),
    state: z.string().min(1, "State is required"),
    district: z.string().min(1, "District is required"),
    block: z.string().min(1, "Block is required"),
    village: z.string().min(1, "Village is required"),
    location: z.enum(["Rural", "Urban"], "Location must be Rural or Urban"),
    management_type: z.string().min(1, "Management type is required"),
    school_category: z.string().min(1, "School category is required"),
    school_type: z.enum(["Co-Ed", "Girls", "Boys"], "School type must be Co-Ed, Girls, or Boys"),
    school_status: z.string().min(1, "School status is required")
});

const updateSchoolSchema = createSchoolSchema.partial(); // optional fields for update

module.exports = { createSchoolSchema, updateSchoolSchema };
