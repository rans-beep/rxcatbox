import axios from "axios";
import FormData from "form-data";
import multer from "multer";
import fs from "fs";

const upload = multer({ dest: "/tmp" });

function runMiddleware(req, res, fn) {
    return new Promise((resolve, reject) => {
        fn(req, res, result => {
            if (result instanceof Error) return reject(result);
            resolve(result);
        });
    });
}

export const config = {
    api: {
        bodyParser: false
    }
};

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method tidak diizinkan" });
    }

    try {
        await runMiddleware(req, res, upload.single("file"));

        const form = new FormData();

        form.append("reqtype", "fileupload");
        form.append(
            "fileToUpload",
            fs.createReadStream(req.file.path)
        );

        const response = await axios.post(
            "https://catbox.moe/user/api.php",
            form,
            {
                headers: form.getHeaders()
            }
        );

        fs.unlinkSync(req.file.path);

        return res.status(200).json({
            success: true,
            url: response.data
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
}
