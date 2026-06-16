<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>RX7 Catbox Upload</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        .container {
            background: rgba(255,255,255,0.05);
            backdrop-filter: blur(20px);
            border-radius: 30px;
            padding: 40px 50px;
            max-width: 500px;
            width: 100%;
            border: 2px solid rgba(255,100,150,0.3);
            box-shadow: 0 0 80px rgba(255,50,100,0.2);
            text-align: center;
        }

        .logo {
            font-size: 60px;
            margin-bottom: 10px;
        }

        h1 {
            font-size: 32px;
            font-weight: 700;
            background: linear-gradient(45deg, #ff6b8a, #ff3366);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        p {
            color: #ffb3c6;
            margin: 10px 0 25px;
            font-size: 16px;
        }

        .drop-zone {
            border: 2px dashed rgba(255,100,150,0.4);
            border-radius: 20px;
            padding: 40px 20px;
            cursor: pointer;
            transition: 0.3s;
            color: #aaa;
        }

        .drop-zone:hover {
            border-color: #ff6b8a;
            background: rgba(255,100,150,0.05);
        }

        .drop-zone.dragover {
            border-color: #ff3366;
            background: rgba(255,50,100,0.1);
        }

        .drop-zone input {
            display: none;
        }

        .drop-zone .icon {
            font-size: 50px;
            display: block;
            margin-bottom: 10px;
        }

        #fileInfo {
            color: #ffb3c6;
            font-size: 14px;
            margin-top: 10px;
        }

        .btn {
            background: linear-gradient(45deg, #ff6b8a, #ff3366);
            border: none;
            padding: 14px 40px;
            border-radius: 50px;
            color: white;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            transition: 0.3s;
            margin-top: 20px;
            width: 100%;
            box-shadow: 0 5px 25px rgba(255,50,100,0.4);
        }

        .btn:hover {
            transform: scale(1.02);
            box-shadow: 0 8px 35px rgba(255,50,100,0.6);
        }
        .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }

        .result {
            margin-top: 20px;
            padding: 15px;
            border-radius: 15px;
            background: rgba(255,255,255,0.05);
            word-break: break-all;
            display: none;
        }

        .result.show {
            display: block;
        }

        .result .url {
            color: #ff6b8a;
            font-size: 14px;
            margin-bottom: 10px;
        }

        .result .copy-btn {
            background: rgba(255,255,255,0.1);
            border: 1px solid #ff6b8a;
            padding: 8px 20px;
            border-radius: 10px;
            color: white;
            cursor: pointer;
            transition: 0.3s;
        }

        .result .copy-btn:hover {
            background: rgba(255,100,150,0.2);
        }

        .loading {
            display: none;
            margin-top: 15px;
            color: #ffb3c6;
        }

        .loading.show {
            display: block;
        }

        .spinner {
            display: inline-block;
            width: 30px;
            height: 30px;
            border: 3px solid rgba(255,100,150,0.2);
            border-top: 3px solid #ff6b8a;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .footer {
            margin-top: 25px;
            font-size: 12px;
            color: #666;
        }
        .footer span {
            color: #ff6b8a;
        }

        @media (max-width: 500px) {
            .container {
                padding: 25px 20px;
            }
            h1 {
                font-size: 24px;
            }
            .drop-zone {
                padding: 25px 15px;
            }
        }
    </style>
</head>
<body>

<div class="container">
    <div class="logo">📤</div>
    <h1>RX7 Catbox Upload</h1>
    <p>Upload file langsung ke Catbox.moe</p>

    <div class="drop-zone" id="dropZone">
        <span class="icon">📁</span>
        <p>Klik atau drag & drop file di sini</p>
        <input type="file" id="fileInput" />
        <div id="fileInfo"></div>
    </div>

    <button class="btn" id="uploadBtn" disabled>Upload ke Catbox</button>

    <div class="loading" id="loading">
        <div class="spinner"></div>
        <p style="margin-top:10px;">Uploading...</p>
    </div>

    <div class="result" id="result">
        <p style="color:#aaa;font-size:13px;">✅ Upload Berhasil!</p>
        <div class="url" id="resultUrl"></div>
        <button class="copy-btn" id="copyBtn">📋 Copy URL</button>
    </div>

    <div class="footer">Made with <span>❤️</span> by <span>RANS</span> untuk <span>TUAN</span></div>
</div>

<script>
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');
    const uploadBtn = document.getElementById('uploadBtn');
    const loading = document.getElementById('loading');
    const result = document.getElementById('result');
    const resultUrl = document.getElementById('resultUrl');
    const copyBtn = document.getElementById('copyBtn');

    let selectedFile = null;

    // KLIK ZONE
    dropZone.addEventListener('click', () => fileInput.click());

    // DROP
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    // INPUT CHANGE
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    function handleFile(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            alert('File terlalu besar! Maksimal 10MB.');
            return;
        }
        selectedFile = file;
        fileInfo.textContent = `📎 ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
        uploadBtn.disabled = false;
        result.classList.remove('show');
    }

    // UPLOAD
    uploadBtn.addEventListener('click', async () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('file', selectedFile);

        uploadBtn.disabled = true;
        loading.classList.add('show');
        result.classList.remove('show');

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                resultUrl.textContent = data.url;
                result.classList.add('show');
            } else {
                alert('Upload gagal: ' + data.error);
            }
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            loading.classList.remove('show');
            uploadBtn.disabled = false;
        }
    });

    // COPY
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(resultUrl.textContent).then(() => {
            copyBtn.textContent = '✅ Copied!';
            setTimeout(() => {
                copyBtn.textContent = '📋 Copy URL';
            }, 2000);
        });
    });

    console.log('🔥 RX7 Catbox Upload Loaded!');
    console.log('😈 JANGAN LUPA MAKAN EMPING TUAN!');
</script>

</body>
</html>
