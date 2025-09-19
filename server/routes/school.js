const express = require("express");
const router = express.Router();
const School = require("../models/schools");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { createSchoolSchema, updateSchoolSchema } = require("../validation/schoolValidation");

const validateDistributionParams = (req, res, next) => {
    const { state, district, block, village } = req.query;

    // Validate hierarchical requirements
    if (district && !state) {
        return res.status(400).json({
            message: 'District filter requires state parameter'
        });
    }

    if (block && (!district || !state)) {
        return res.status(400).json({
            message: 'Block filter requires both state and district parameters'
        });
    }

    if (village && (!block || !district || !state)) {
        return res.status(400).json({
            message: 'Village filter requires state, district, and block parameters'
        });
    }

    next();
};

// Create a new school
router.post("/", protect, validate(createSchoolSchema), async (req, res) => {
    try {
        const school = new School(req.body);
        await school.save();
        res.status(201).json(school);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get schools with filters & pagination
router.get("/", protect, async (req, res) => {
    try {
        let { state, district, block, village, page = 1, limit = 20 } = req.query;

        // Validate and normalize inputs
        page = Math.max(1, parseInt(page) || 1);
        limit = Math.min(100, Math.max(1, parseInt(limit) || 20));

        console.time('Schools Query');

        const query = {};

        // Use exact string matching for better performance with your existing indexes
        if (state) query.state = state.trim();
        if (district) query.district = district.trim();
        if (block) query.block = block.trim();
        if (village) query.village = village.trim();

        console.log('Query filters:', query);

        // Use aggregation pipeline for better performance with counting
        const pipeline = [
            { $match: query },
            {
                $facet: {
                    schools: [
                        { $skip: (page - 1) * limit },
                        { $limit: limit },
                        // Project only the fields from your schema that you need
                        {
                            $project: {
                                udise_code: 1,
                                school_name: 1,
                                state: 1,
                                district: 1,
                                block: 1,
                                village: 1,
                                location: 1,
                                management_type: 1,
                                school_category: 1,
                                school_type: 1,
                                school_status: 1
                            }
                        }
                    ],
                    totalCount: [
                        { $count: "count" }
                    ]
                }
            }
        ];

        const [result] = await School.aggregate(pipeline);
        const schools = result.schools;
        const total = result.totalCount[0]?.count || 0;

        console.timeEnd('Schools Query');
        console.log(`Found ${total} schools, returning page ${page} (${schools.length} schools)`);

        // Calculate pagination info
        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        res.json({
            total,
            page,
            limit,
            totalPages,
            hasNextPage,
            hasPrevPage,
            schools
        });

    } catch (err) {
        console.error('Error in schools route:', err);
        res.status(500).json({
            message: 'Error fetching schools data',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// Helper function to escape regex special characters (if you need regex)
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

router.get("/filter", protect, async (req, res) => {
    try {
        let { state, district, block, sort = "asc" } = req.query;
        
        // Normalize inputs
        state = state?.trim();
        district = district?.trim();
        block = block?.trim();
        
        console.time('Filter Query');
        
        if (!state && !district && !block) {
            // 1️⃣ First load → return States
            const states = await School.distinct("state");
            const sortedStates = sort === "desc" ? states.sort().reverse() : states.sort();
            
            console.timeEnd('Filter Query');
            return res.json({ 
                level: "state", 
                data: sortedStates,
                count: sortedStates.length,
                next: "district"
            });
        }
        
        if (state && !district && !block) {
            // 2️⃣ State selected → return Districts
            const districts = await School.distinct("district", { state });
            const sortedDistricts = sort === "desc" ? districts.sort().reverse() : districts.sort();
            
            console.timeEnd('Filter Query');
            return res.json({ 
                level: "district", 
                data: sortedDistricts,
                count: sortedDistricts.length,
                parent: { state },
                next: "block"
            });
        }
        
        if (state && district && !block) {
            // 3️⃣ District selected → return Blocks
            const blocks = await School.distinct("block", { state, district });
            const sortedBlocks = sort === "desc" ? blocks.sort().reverse() : blocks.sort();
            
            console.timeEnd('Filter Query');
            return res.json({ 
                level: "block", 
                data: sortedBlocks,
                count: sortedBlocks.length,
                parent: { state, district },
                next: "village"
            });
        }
        
        if (state && district && block) {
            // 4️⃣ Block selected → return Villages
            const villages = await School.distinct("village", { state, district, block });
            const sortedVillages = sort === "desc" ? villages.sort().reverse() : villages.sort();
            
            console.timeEnd('Filter Query');
            return res.json({ 
                level: "village", 
                data: sortedVillages,
                count: sortedVillages.length,
                parent: { state, district, block },
                next: null
            });
        }
        
        // Invalid combination
        res.status(400).json({ 
            message: "Invalid filter combination",
            validPatterns: [
                "No parameters (returns states)",
                "state only (returns districts)",
                "state + district (returns blocks)", 
                "state + district + block (returns villages)"
            ]
        });
        
    } catch (error) {
        console.error("Error in /filter route:", error);
        res.status(500).json({ 
            message: "Server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Update school by ID
router.put("/:id", protect, validate(updateSchoolSchema), async (req, res) => {
    try {
        const updatedSchool = await School.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedSchool) return res.status(404).json({ message: "School not found" });
        res.json(updatedSchool);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete school by ID
router.delete("/:id", protect, async (req, res) => {
    try {
        const school = await School.findByIdAndDelete(req.params.id);
        if (!school) return res.status(404).json({ message: "School not found" });
        res.json({ message: "School deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// Distribution endpoint
router.get("/distribution", validateDistributionParams, protect, async (req, res) => {
    try {
        let { state, district, block, village } = req.query;

        // Handle URL encoding issues
        if (state === "Andaman " || state === "Andaman") {
            state = "Andaman & Nicobar Islands";
        }

        const match = {};

        // Use exact matching instead of regex for better performance
        if (state) match.state = state.trim();
        if (district && state) match.district = district.trim();
        if (block && district && state) match.block = block.trim();
        if (village && block && district && state) match.village = village.trim();

        console.time('Distribution Query');

        // Optimized parallel queries with better pipeline structure
        const [managementTypeDistribution, locationDistribution, schoolTypeDistribution] = await Promise.all([
            // Management Type Distribution
            School.aggregate([
                { $match: match },
                {
                    $group: {
                        _id: "$management_type", // Remove $toLower for better performance
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 20 } // Limit results if you have too many categories
            ]),

            // Location Distribution
            School.aggregate([
                { $match: match },
                {
                    $group: {
                        _id: "$location", // Remove $toLower for better performance
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 20 }
            ]),

            // School Type Distribution
            School.aggregate([
                { $match: match },
                {
                    $group: {
                        _id: "$school_type", // Remove $toLower for better performance
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 20 }
            ])
        ]);

        console.timeEnd('Distribution Query');

        // Helper function to format labels properly
        const formatLabel = (str) => {
            if (!str) return 'Unknown';

            const labelMap = {
                'government': 'Government',
                'Government': 'Government',
                'private unaided': 'Private Unaided',
                'Private Unaided': 'Private Unaided',
                'aided': 'Aided',
                'Aided': 'Aided',
                'private aided': 'Aided',
                'Private Aided': 'Aided',
                'rural': 'Rural',
                'Rural': 'Rural',
                'urban': 'Urban',
                'Urban': 'Urban',
                'co-ed': 'Co-Ed',
                'Co-ed': 'Co-Ed',
                'coed': 'Co-Ed',
                'girls': 'Girls',
                'Girls': 'Girls',
                'boys': 'Boys',
                'Boys': 'Boys',
                'mixed': 'Co-Ed',
                'Mixed': 'Co-Ed'
            };

            return labelMap[str] || str;
        };

        // Format response
        const response = {
            managementTypeDistribution: managementTypeDistribution.map(d => ({
                label: formatLabel(d._id),
                count: d.count
            })),
            locationDistribution: locationDistribution.map(d => ({
                label: formatLabel(d._id),
                count: d.count
            })),
            schoolTypeDistribution: schoolTypeDistribution.map(d => ({
                label: formatLabel(d._id),
                count: d.count
            }))
        };

        res.json(response);

    } catch (error) {
        console.error('Error in distribution endpoint:', error);
        res.status(500).json({
            message: 'Internal server error while fetching distribution data',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;
