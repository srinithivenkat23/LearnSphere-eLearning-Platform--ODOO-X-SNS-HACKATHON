const fs = require('fs');
const path = require('path');

async function testUpload() {
    const filePath = path.join(__dirname, 'test.txt');
    fs.writeFileSync(filePath, 'Hello LearnSphere!');

    const formData = new FormData();
    const blob = new Blob(['Hello LearnSphere!'], { type: 'text/plain' });
    formData.append('file', blob, 'test.txt');

    try {
        const response = await fetch('http://localhost:5000/api/upload', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        if (response.ok) {
            console.log("Upload Success! URL:", data.url);

            // Verify static serving
            const verifyRes = await fetch(data.url);
            if (verifyRes.ok) {
                console.log("Static serving verified!");
                process.exit(0);
            } else {
                console.error("Static serving failed.");
                process.exit(1);
            }
        } else {
            console.error("Upload failed:", data);
            process.exit(1);
        }
    } catch (err) {
        console.error("Error:", err.message);
        process.exit(1);
    } finally {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
}

testUpload();
