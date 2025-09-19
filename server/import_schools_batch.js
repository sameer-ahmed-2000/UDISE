// import_schools_batch.js
const fs = require("fs");
const csv = require("csv-parser");
const mongoose = require("mongoose");
const School = require("./models/schools"); // your schema

const MONGO_URI = "mongodb+srv://sameerahmedsdev_db_user:8K1n9oSkRfrcynza@cluster0.z4hspni.mongodb.net/kuki?retryWrites=true&w=majority&appName=Cluster0";
const CSV_FILE_PATH = "./cleaned_schools_datas.csv"; // path to your CSV
const MAX_ROWS = 800000;
const BATCH_SIZE = 5000;

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));

let batch = [];
let count = 0;

const stream = fs.createReadStream(CSV_FILE_PATH)
    .pipe(csv())
    .on("data", (row) => {
        if (count >= MAX_ROWS) {
            stream.destroy(); // stop reading further
            return;
        }

        batch.push({
            updateOne: {
                filter: { udise_code: row["udise_code"] },
                update: {
                    $set: {
                        school_name: row["school_name"],
                        state: row["state"],
                        district: row["district"],
                        block: row["block"],
                        village: row["village"],
                        location: row["location"],
                        management_type: row["management type"],
                        school_category: row["school_category"],
                        school_type: row["school_type"],
                        school_status: row["school_status"]
                    }
                },
                upsert: true
            }
        });

        count++;

        if (batch.length >= BATCH_SIZE) {
            stream.pause();
            School.bulkWrite(batch)
                .then(() => {
                    console.log(`${count} rows processed`);
                    batch = [];
                    stream.resume();
                })
                .catch((err) => console.error("Bulk insert error:", err));
        }
    })
    .on("end", () => {
        if (batch.length > 0) {
            School.bulkWrite(batch)
                .then(() => {
                    console.log(`CSV import completed. Total rows processed: ${count}`);
                    mongoose.disconnect();
                })
                .catch((err) => {
                    console.error("Final bulk insert error:", err);
                    mongoose.disconnect();
                });
        } else {
            console.log(`CSV import completed. Total rows processed: ${count}`);
            mongoose.disconnect();
        }
    })
    .on("error", (err) => {
        console.error("CSV stream error:", err);
        mongoose.disconnect();
    });
