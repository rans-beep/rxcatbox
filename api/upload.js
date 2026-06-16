import axios from "axios";
import FormData from "form-data";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method tidak diizinkan",
    });
  }

  try {
    const form = formidable({
      uploadDir: "/tmp",
      keepExtensions: true,
    });

    const { files } = await new Promise((resolve, reject) => {
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
        error: "File tidak ditemukan",
      });
    }

    const catboxForm = new FormData();

    catboxForm.append("reqtype", "fileupload");

    catboxForm.append(
      "fileToUpload",
      fs.createReadStream(file.filepath),
      file.originalFilename
    );

    const response = await axios.post(
      "https://catbox.moe/user/api.php",
      catboxForm,
      {
        headers: catboxForm.getHeaders(),
      }
    );

    return res.status(200).json({
      success: true,
      url: response.data,
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      error: err.message,
      detail: err.response?.data || null,
    });
  }
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
                headers: catboxForm.getHeaders(),
                maxBodyLength: Infinity,
                maxContentLength: Infinity
            }
        );

        try {
            fs.unlinkSync(file.filepath);
        } catch {}

        return res.status(200).json({
            success: true,
            url: response.data
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.response?.data || err.message
        });
    }
}        );

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
