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
            return res.status(400).json({ 
                success: false, 
                error: "File tidak ditemukan.",
                detail: "Pastikan file sudah dipilih dan coba lagi."
            });
        }

        // CEK FILE SIZE
        const fileBuffer = fs.readFileSync(file.filepath);
        const filename = file.originalFilename || "upload";
        const fileSize = fileBuffer.length;
        
        if (fileSize === 0) {
            return res.status(400).json({
                success: false,
                error: "File kosong!",
                detail: "File tidak boleh 0 byte."
            });
        }

        console.log(`📤 File: ${filename} (${fileSize} bytes)`);

        let url = null;
        let uploader = null;
        let errors = [];

        // ========== TOP 1: FILE.IO ==========
        try {
            console.log("⏳ Mencoba File.io...");
            const f = new FormData();
            f.append("file", fileBuffer, filename);
            const response = await axios.post("https://file.io/", f, {
                headers: { ...f.getHeaders(), "User-Agent": "Mozilla/5.0" },
                timeout: 30000
            });
            
            if (response.data?.link) {
                url = response.data.link;
                uploader = "File.io";
                console.log("✅ File.io berhasil!");
            } else {
                const msg = response.data?.message || "No link returned";
                errors.push(`File.io: ${msg}`);
                console.log("⚠️ File.io gagal:", msg);
            }
        } catch (e) {
            const msg = e.response?.data?.message || e.message || "Unknown error";
            errors.push(`File.io: ${msg}`);
            console.log("❌ File.io error:", msg);
        }

        // ========== TOP 2: 0X0.ST ==========
        if (!url) {
            try {
                console.log("⏳ Mencoba 0x0.st...");
                const f = new FormData();
                f.append("file", fileBuffer, filename);
                const response = await axios.post("https://0x0.st", f, {
                    headers: { ...f.getHeaders(), "User-Agent": "Mozilla/5.0" },
                    timeout: 30000
                });
                
                if (response.data && response.data.trim() && !response.data.includes("error")) {
                    url = response.data.trim();
                    uploader = "0x0.st";
                    console.log("✅ 0x0.st berhasil!");
                } else {
                    const msg = response.data || "No response";
                    errors.push(`0x0.st: ${msg.slice(0, 100)}`);
                    console.log("⚠️ 0x0.st gagal:", msg.slice(0, 100));
                }
            } catch (e) {
                const msg = e.message || "Unknown error";
                errors.push(`0x0.st: ${msg}`);
                console.log("❌ 0x0.st error:", msg);
            }
        }

        // ========== TOP 3: POMF ==========
        if (!url) {
            try {
                console.log("⏳ Mencoba Pomf...");
                const f = new FormData();
                f.append("files[]", fileBuffer, filename);
                const response = await axios.post("https://pomf.lain.la/upload", f, {
                    headers: { ...f.getHeaders(), "User-Agent": "Mozilla/5.0" },
                    timeout: 30000
                });
                
                if (response.data?.files?.[0]?.url) {
                    url = "https://pomf.lain.la/" + response.data.files[0].url;
                    uploader = "Pomf.lain.la";
                    console.log("✅ Pomf berhasil!");
                } else {
                    const msg = response.data?.message || "No file url";
                    errors.push(`Pomf: ${msg}`);
                    console.log("⚠️ Pomf gagal:", msg);
                }
            } catch (e) {
                const msg = e.message || "Unknown error";
                errors.push(`Pomf: ${msg}`);
                console.log("❌ Pomf error:", msg);
            }
        }

        // ========== TOP 4: UPLOAD.EE ==========
        if (!url) {
            try {
                console.log("⏳ Mencoba Upload.ee...");
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
                    console.log("✅ Upload.ee berhasil!");
                } else {
                    errors.push(`Upload.ee: No link found in response`);
                    console.log("⚠️ Upload.ee gagal: No link found");
                }
            } catch (e) {
                const msg = e.message || "Unknown error";
                errors.push(`Upload.ee: ${msg}`);
                console.log("❌ Upload.ee error:", msg);
            }
        }

        // ========== HASIL ==========
        if (!url) {
            return res.status(400).json({
                success: false,
                error: "Semua uploader gagal.",
                detail: errors.join(" | "),
                errors: errors
            });
        }

        return res.status(200).json({
            success: true,
            url: url,
            filename: filename,
            size: fileSize,
            uploader: uploader
        });

    } catch (err) {
        console.error("❌ Handler error:", err.message, err.stack);
        return res.status(500).json({
            success: false,
            error: "Internal server error",
            detail: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};
