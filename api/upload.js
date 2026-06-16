const axios = require("axios");
const FormData = require("form-data");
const formidable = require("formidable");
const fs = require("fs");

module.exports.config = {
    api: {
        bodyParser: false
    }
};

module.exports = async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            error: "Method tidak diizinkan. Gunakan POST."
        });
    }

    try {
        const form = formidable({
            uploadDir: "/tmp",
            keepExtensions: true,
            maxFileSize: 10 * 1024 * 1024
        });

        const { fields, files } = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                else resolve({ fields, files });
            });
        });

        const file = Array.isArray(files.file) ? files.file[0] : files.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                error: "File tidak ditemukan."
            });
        }

        const catboxForm = new FormData();
        catboxForm.append("reqtype", "fileupload");
        catboxForm.append(
            "fileToUpload",
            fs.createReadStream(file.filepath),
            file.originalFilename || "upload"
        );

        // ========== FIX 412: TAMBAH HEADER ==========
        const response = await axios.post(
            "https://catbox.moe/user/api.php",
            catboxForm,
            {
                headers: {
                    ...catboxForm.getHeaders(),
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept": "*/*",
                    "Accept-Encoding": "gzip, deflate, br",
                    "Connection": "keep-alive",
                    "Origin": "https://catbox.moe",
                    "Referer": "https://catbox.moe/"
                },
                timeout: 30000,
                maxRedirects: 5
            }
        );

        return res.status(200).json({
            success: true,
            url: response.data.trim(),
            filename: file.originalFilename,
            size: file.size
        });

    } catch (err) {
        console.error("Error:", err.message);
        console.error("Response:", err.response?.data);

        return res.status(500).json({
            success: false,
            error: err.message,
            detail: err.response?.data || null
        });
    }
};
