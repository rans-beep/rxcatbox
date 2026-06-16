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
        const fileSize = fileBuffer.length;
        
        let url = null;
        let uploader = null;
        let results = [];

        // ========== TOP 1: FILE.IO ==========
        try {
            const f = new FormData();
            f.append("file", fileBuffer, filename);
            const response = await axios.post("https://file.io/", f, {
                headers: { ...f.getHeaders(), "User-Agent": "Mozilla/5.0" },
                timeout: 30000
            });
            if (response.data?.link) {
                url = response.data.link;
                uploader = "File.io";
                results.push({ uploader: "File.io", success: true, url: url });
            }
        } catch (e) {
            results.push({ uploader: "File.io", success: false, error: e.message });
        }

        // ========== TOP 2: 0X0.ST ==========
        if (!url) {
            try {
                const f = new FormData();
                f.append("file", fileBuffer, filename);
                const response = await axios.post("https://0x0.st", f, {
                    headers: { ...f.getHeaders(), "User-Agent": "Mozilla/5.0" },
                    timeout: 30000
                });
                if (response.data && response.data.trim()) {
                    url = response.data.trim();
                    uploader = "0x0.st";
                    results.push({ uploader: "0x0.st", success: true, url: url });
                }
            } catch (e) {
                results.push({ uploader: "0x0.st", success: false, error: e.message });
            }
        }

        // ========== TOP 3: POMF ==========
        if (!url) {
            try {
                const f = new FormData();
                f.append("files[]", fileBuffer, filename);
                const response = await axios.post("https://pomf.lain.la/upload", f, {
                    headers: { ...f.getHeaders(), "User-Agent": "Mozilla/5.0" },
                    timeout: 30000
                });
                if (response.data?.files?.[0]?.url) {
                    url = "https://pomf.lain.la/" + response.data.files[0].url;
                    uploader = "Pomf.lain.la";
                    results.push({ uploader: "Pomf.lain.la", success: true, url: url });
                }
            } catch (e) {
                results.push({ uploader: "Pomf.lain.la", success: false, error: e.message });
            }
        }

        // ========== TOP 4: UPLOAD.EE ==========
        if (!url) {
            try {
                const f = new FormData();
                f.append("file", fileBuffer, filename);
                f.append("upload", "upload");
                const response = await axios.post("https://upload.ee/", f, {
                    headers: { ...f.getHeaders(), "User-Agent": "Mozilla/5.0" },
                    timeout: 30000
                });
                const match = response.data?.match(/https:\/\/upload\.ee\/files\/[^"']+/);
                if (match) {
                    url = match[0];
                    uploader = "Upload.ee";
                    results.push({ uploader: "Upload.ee", success: true, url: url });
                }
            } catch (e) {
                results.push({ uploader: "Upload.ee", success: false, error: e.message });
            }
        }

        if (!url) {
            return res.status(400).json({
                success: false,
                error: "Semua uploader gagal.",
                results: results
            });
        }

        return res.status(200).json({
            success: true,
            url: url,
            filename: filename,
            size: fileSize,
            uploader: uploader,
            results: results
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
};
