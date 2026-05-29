const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

module.exports = {
  getBase64Image: (filePath) => {
    const imagePath = path.join(__dirname, filePath); // Adjust if needed
    const image = fs.readFileSync(imagePath);
    const ext = path.extname(filePath).substring(1); // e.g., 'jpg'
    return `data:image/${ext};base64,${image.toString('base64')}`;
  }
}