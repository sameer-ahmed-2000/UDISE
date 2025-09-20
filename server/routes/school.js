const express = require("express");
const router = express.Router();
const School = require("../models/schools");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { createSchoolSchema, updateSchoolSchema } = require("../validation/schoolValidation");

const validateDistributionParams = (req, res, next) => {
    const { state, district, block, village } = req.query;

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

router.post("/", protect, validate(createSchoolSchema), async (req, res) => {
    try {
        const school = new School(req.body);
        await school.save();
        res.status(201).json(school);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get("/", protect, async (req, res) => {
    try {
        let { state, district, block, village, page = 1, limit = 20 } = req.query;

        page = Math.max(1, parseInt(page) || 1);
        limit = Math.min(100, Math.max(1, parseInt(limit) || 20));

        console.time('Schools Query');

        const query = {};

        if (state) query.state = state.trim();
        if (district) query.district = district.trim();
        if (block) query.block = block.trim();
        if (village) query.village = village.trim();

        const pipeline = [
            { $match: query },
            {
                $facet: {
                    schools: [
                        { $skip: (page - 1) * limit },
                        { $limit: limit },
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


router.get("/filter", protect, async (req, res) => {
    try {
        let { state, district, block, sort = "asc" } = req.query;
        state = state?.trim();
        district = district?.trim();
        block = block?.trim();

        console.time('Filter Query');

        if (!state && !district && !block) {
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

router.put("/:id", protect, validate(updateSchoolSchema), async (req, res) => {
    try {
        const updatedSchool = await School.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedSchool) return res.status(404).json({ message: "School not found" });
        res.json(updatedSchool);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete("/:id", protect, async (req, res) => {
    try {
        const school = await School.findByIdAndDelete(req.params.id);
        if (!school) return res.status(404).json({ message: "School not found" });
        res.json({ message: "School deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
router.get("/distribution", validateDistributionParams, protect, async (req, res) => {
    try {
        let { state, district, block, village } = req.query;

        if (state === "Andaman " || state === "Andaman") {
            state = "Andaman & Nicobar Islands";
        }
        const match = {};

        if (state) match.state = state.trim();
        if (district && state) match.district = district.trim();
        if (block && district && state) match.block = block.trim();
        if (village && block && district && state) match.village = village.trim();

        console.time('Distribution Query');

        const [managementTypeDistribution, locationDistribution, schoolTypeDistribution] = await Promise.all([
            School.aggregate([
                { $match: match },
                {
                    $group: {
                        _id: "$management_type",
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 20 }
            ]),

            School.aggregate([
                { $match: match },
                {
                    $group: {
                        _id: "$location",
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 20 }
            ]),

            School.aggregate([
                { $match: match },
                {
                    $group: {
                        _id: "$school_type",
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 20 }
            ])
        ]);

        console.timeEnd('Distribution Query');

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
