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
    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            error: "Method tidak diizinkan"
        });
    }

    try {
        const form = formidable({
            uploadDir: "/tmp",
            keepExtensions: true
        });

        const { fields, files } = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                else resolve({ fields, files });
            });
        });

        const file = Array.isArray(files.file) 
            ? files.file[0] 
            : files.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                error: "File tidak ditemukan"
            });
        }

        const catboxForm = new FormData();
        catboxForm.append("reqtype", "fileupload");
        catboxForm.append(
            "fileToUpload",
            fs.createReadStream(file.filepath),
            file.originalFilename || "upload"
        );

        const response = await axios.post(
            "https://catbox.moe/user/api.php",
            catboxForm,
            {
                headers: catboxForm.getHeaders()
            }
        );

        return res.status(200).json({
            success: true,
            url: response.data
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            error: err.message,
            detail: err.response?.data || null
        });
    }
};
