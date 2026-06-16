const axios = require("axios");
const FormData = require("form-data");
const formidable = require("formidable");
const fs = require("fs");

module.exports.config = {
    api: { bodyParser: false }
};

module.exports = async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") {
        return res.status(405).json({ success: false, error: "Method tidak diizinkan." });
    }

    try {
        const form = formidable({
            uploadDir: "/tmp",
            keepExtensions: true,
            maxFileSize: 50 * 1024 * 1024
        });

        const { fields, files } = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                else resolve({ fields, files });
            });
        });

        const file = Array.isArray(files.file) ? files.file[0] : files.file;
        if (!file) {
            return res.status(400).json({ success: false, error: "File tidak ditemukan." });
        }

        const fileBuffer = fs.readFileSync(file.filepath);
        const filename = file.originalFilename || "upload";

        // ========== UPLOAD KE FILE.IO ==========
        const f = new FormData();
        f.append("file", fileBuffer, filename);

        const response = await axios.post("https://file.io/", f, {
            headers: { ...f.getHeaders(), "User-Agent": "Mozilla/5.0" },
            timeout: 30000
        });

        if (!response.data?.link) {
            return res.status(400).json({
                success: false,
                error: "File.io gagal",
                detail: response.data
            });
        }

        return res.status(200).json({
            success: true,
            url: response.data.link,
            filename: filename,
            size: fileBuffer.length,
            uploader: "File.io"
        });

    } catch (err) {
        console.error("❌ Error:", err.message);
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
};
