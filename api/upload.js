const axios = require("axios");
const FormData = require("form-data");
const formidable = require("formidable");
const fs = require("fs");
const path = require("path");

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

        const fileSize = fs.statSync(file.filepath).size;
        if (fileSize === 0) {
            return res.status(400).json({
                success: false,
                error: "File kosong!"
            });
        }

        const fileBuffer = fs.readFileSync(file.filepath);
        const filename = file.originalFilename || "upload";
        const ext = path.extname(filename).toLowerCase();

        let url = null;
        let uploader = null;

        // ========== 1. COBA CATBOX ==========
        try {
            const catboxForm = new FormData();
            catboxForm.append("reqtype", "fileupload");
            catboxForm.append("fileToUpload", fileBuffer, filename);

            const response = await axios.post(
                "https://catbox.moe/user/api.php",
                catboxForm,
                {
                    headers: {
                        ...catboxForm.getHeaders(),
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                    },
                    timeout: 15000
                }
            );

            const result = response.data.trim();
            if (result && !result.includes("error") && !result.includes("Invalid") && !result.includes("failed")) {
                url = result;
                uploader = "Catbox";
            }
        } catch (e) {
            console.log("⚠️ Catbox gagal:", e.message);
        }

        // ========== 2. COBA FILE.IO ==========
        if (!url) {
            try {
                const fileIoForm = new FormData();
                fileIoForm.append("file", fileBuffer, filename);

                const response = await axios.post(
                    "https://file.io/",
                    fileIoForm,
                    {
                        headers: {
                            ...fileIoForm.getHeaders(),
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                        },
                        timeout: 15000
                    }
                );

                if (response.data && response.data.link) {
                    url = response.data.link;
                    uploader = "File.io";
                }
            } catch (e) {
                console.log("⚠️ File.io gagal:", e.message);
            }
        }

        // ========== 3. COBA TELEGRAPH (BUAT GAMBAR) ==========
        if (!url && ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(ext)) {
            try {
                const base64 = fileBuffer.toString('base64');
                const response = await axios.post(
                    "https://telegra.ph/upload",
                    { file: base64 },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                        },
                        timeout: 15000
                    }
                );

                if (response.data && response.data[0] && response.data[0].src) {
                    url = "https://telegra.ph" + response.data[0].src;
                    uploader = "Telegraph";
                }
            } catch (e) {
                console.log("⚠️ Telegraph gagal:", e.message);
            }
        }

        // ========== 4. COBA 0x0.ST ==========
        if (!url) {
            try {
                const zeroForm = new FormData();
                zeroForm.append("file", fileBuffer, filename);

                const response = await axios.post(
                    "https://0x0.st",
                    zeroForm,
                    {
                        headers: {
                            ...zeroForm.getHeaders(),
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                        },
                        timeout: 15000
                    }
                );

                if (response.data && response.data.trim()) {
                    url = response.data.trim();
                    uploader = "0x0.st";
                }
            } catch (e) {
                console.log("⚠️ 0x0.st gagal:", e.message);
            }
        }

        // ========== 5. COBA GOOLE DRIVE SIMULASI (PAKE GITHUB) ==========
        if (!url) {
            try {
                // Pake gist.github.com (cuma buat text)
                if (['.txt', '.json', '.js', '.html', '.css', '.xml', '.csv'].includes(ext)) {
                    const content = fileBuffer.toString('utf8');
                    const response = await axios.post(
                        "https://api.github.com/gists",
                        {
                            files: {
                                [filename]: { content: content }
                            },
                            public: true,
                            description: "Upload from RX7"
                        },
                        {
                            headers: {
                                "Authorization": "Bearer YOUR_GITHUB_TOKEN", // TUAN ISI TOKEN
                                "User-Agent": "RX7-Uploader"
                            },
                            timeout: 15000
                        }
                    );

                    if (response.data && response.data.html_url) {
                        url = response.data.html_url;
                        uploader = "GitHub Gist";
                    }
                }
            } catch (e) {
                console.log("⚠️ GitHub Gist gagal:", e.message);
            }
        }

        // ========== HASIL ==========
        if (!url) {
            return res.status(400).json({
                success: false,
                error: "Semua uploader gagal. Coba file lain."
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
        console.error("Error:", err.message);

        return res.status(500).json({
            success: false,
            error: err.message,
            detail: err.response?.data || null
        });
    }
};
