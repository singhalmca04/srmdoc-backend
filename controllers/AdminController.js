const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Student = mongoose.model('Student');
const Template = mongoose.model('Template');
const xlsx = require('xlsx');
const asyncLoop = require('node-async-loop');
const PDFDocument = require('pdfkit');
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const pdfgen = require('../helpers/pdfgenerator');

const client = new OAuth2Client('11697718537-dqjd46buavim9ufcdipmvpfe3ksvt5lk.apps.googleusercontent.com');

const htmlToPlainText = (html) => {
    return html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<li>/gi, '• ')
        .replace(/<[^>]+>/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
};

const uploadPics = async (req, res) => {
    try {
        res.json({ message: 'Image uploaded successfully!' });
    } catch (error) {
        console.error(error);
        res.status(404).send(error + ' Image not found');
    }
}

const loginUser = async (req, res) => {
    try {
        const { name, password } = req.body;
        // compare password
        let data = await User.findOne({ name }, { password: 1 });
        if (!data) {
            return res.status(400).json({ message: "Invalid name" });
        }
        const isMatch = await bcrypt.compare(password, data.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password" });
        }
        const token = jwt.sign(
            { id: "11111", name: "Abhishek", section: "A", branch: "CSE-DS", semester: "6" },
            "secretKey", // use env variable in production
            { expiresIn: "1h" }
        );
        res.json({ message: "Login successful", token });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Login error" });
    }
}

const signupUser = async (req, res) => {
    try {
        const { name, password } = req.body;
        console.log(req.query.age, " age");
        const hashedPassword = await bcrypt.hash(password, 10);
        let user = new User({ name, password: hashedPassword });
        await user.save();
        res.status(201).json({ data: user, message: "User registered successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error in signup" });
        // $2b$10$daUwhwxhu6R1TBrCvaAOzeODNCqaiEyF855dDik4qBfRlizuT.cPa
    }
}


const getUser = async (req, res) => {
    res.status(200).send({
        message: "Protected data",
        user: req.user
    });
}

const sendMail = async (req, res) => {
    try {
        const transport = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "singhalmca04@gmail.com",
                pass: 'sdwp yrce hiya yojm'
            }
        });
        const info = await transport.sendMail({
            from: "Test Mail from Vinay singhalmca04@gail.com",
            to: 'vinayk@srmist.edu.in',
            subject: 'Subject -- DSA Project Presentation',
            text: "First Batch presetation on 9th April"
        });
        res.status(200).send({ data: info, msg: "Email send" });
    } catch (err) {
        console.log("Error " + err);
        res.status(500).send({ msg: "Internal server error" });
    }
}

const changePassword = async (req, res) => {
    try {
        const { name, newpassword } = req.body;
        const newHashedPassword = await bcrypt.hash(newpassword, 10);
        let data = await User.findOneAndUpdate({ name }, { $set: { password: newHashedPassword } }, { returnDocument: 'after' });
        res.status(200).send({ message: "Password changed", data });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error in signup" });
    }

}

const uploadExcel = async (req, res) => {
    try {
        const file = req.file;
        if (!file) return res.status(400).send('No file uploaded.');

        const workbook = xlsx.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet); // Convert sheet to JSON
        if (data.length) {
            asyncLoop(data, async function (x, next) {
                await Student.insertOne({
                    ie: x.ie?.trim().toUpperCase(),
                    month: x["month"]?.trim(),
                    year: x.year?.toString().trim(),
                    program: x.program?.trim().toUpperCase(),
                    semester: x.semester?.trim().toUpperCase(),
                    specialization: x.specialization?.trim().toUpperCase(),
                    batch: x.batch?.trim(),
                    subcode: x.subcode?.trim().toUpperCase(),
                    subject: x.subject?.trim().toUpperCase(),
                    examdate: x.examdate?.trim(),
                    session: x.session?.trim().toUpperCase()
                });
                next();
            }, async function (err) {
                if (err) {

                } else {
                    return res.json({ success: true, data });
                }
            });
        } else {
            return res.json({ success: true, data: "Not found" });
        }
    } catch (err) {
        console.log(err);
        res.status(401).json({ message: "Google login failed" });
    }
}

const getTemplate = async (req, res) => {
    try {
        const foundTemplate = await Template.findOne({ status: 'active' }).lean();
        if (foundTemplate) {
            return res.json({ success: true, template: foundTemplate });
        }

        return res.status(404).json({ success: false, message: 'No active template found' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, err, message: 'Unable to load template' });
    }
}

const uploadStudentExcel = async (req, res) => {
    try {
        const file = req.file;
        if (!file) return res.status(400).json({ success: false, message: 'No file uploaded.' });

        const workbook = xlsx.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        const students = data.map((row) => ({
            name: row.name || row.Name || row['Student Name'] || '',
            address: row.address || row.Address || row['Student Address'] || ''
        })).filter((item) => item.name || item.address);

        res.json({ success: true, students });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Excel processing failed' });
    }
}

function formatDate(date = new Date()) {
    const months = [
        'January', 'February', 'March', 'April',
        'May', 'June', 'July', 'August',
        'September', 'October', 'November', 'December'
    ];

    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function getBase64Image(filePath) {
    const imagePath = path.join(__dirname, filePath); // Adjust if needed
    const image = fs.readFileSync(imagePath);
    const ext = path.extname(filePath).substring(1); // e.g., 'jpg'
    return `data:image/${ext};base64,${image.toString('base64')}`;
}

const downloadPDF = async (req, res) => {
    try {
        const {
            name,
            address,
            reference_no,
            students = []
        } = req.body || {};

        const studentData =
            students.length > 0
                ? students[0]
                : {
                    name,
                    address
                };

        const template = await Template.findOne({
            status: 'active'
        }).lean();

        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }

        const leftLogo = getBase64Image('../uploads/left-logo.png');
        const rightLogo = getBase64Image('../uploads/srm-logo.png');
        const footerImage1 = getBase64Image('../uploads/footer1.PNG');
        const footerImage2 = getBase64Image('../uploads/footer2.PNG');
        const referenceNo =
            `SRMIST/NCR/A&O/2026/WLC-${reference_no}`;
        const compiled = Handlebars.compile(
            template.html_content
        );
        const filledTemplate = compiled({
            student_name: studentData.name,
            student_address: studentData.address,
            reference_no: referenceNo,
            date: formatDate(),
            header_left_logo: leftLogo,
            header_right_logo: rightLogo,
            footer_page1: footerImage1,
            footer_page2: footerImage2,
            signatory_name: 'Head, Admissions & Outreach',
            designation: 'SRM IST, Delhi-NCR Campus, Ghaziabad'
        });
        const htmlDocument = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                ${template.css_content}
            </style>
        </head>
        <body>
            ${filledTemplate}
        </body>
        </html>
        `;
        const pdfBuffer = await pdfgen.generatePDF({
            html: htmlDocument
        });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            'attachment; filename="welcome-letter.pdf"'
        );
        res.send(pdfBuffer);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: 'Could not generate PDF'
        });
    }
};
// const downloadPDF = async (req, res) => {
//     try {
//         const { name, address, students = [], template: clientTemplate, showHtmlAsCode } = req.body || {};
//         const studentData = students && students.length > 0
//             ? { name: students[0].name || '', address: students[0].address || '' }
//             : { name: name || '', address: address || '' };

//         if (!studentData.name && !studentData.address) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Provide student name and address or upload an Excel file with at least one row.'
//             });
//         }

//         const foundTemplate = await Template.findOne({ status: 'active' }).lean();
//         if (!foundTemplate && !clientTemplate) {
//             return res.status(404).json({ success: false, message: 'No template available for PDF generation' });
//         }
//         const headerImage = getBase64Image('../uploads/srm-logo.jpeg');
//         // const footerImage = getBase64Image('../uploads/footer.png');

//         const templateHtml = clientTemplate || foundTemplate.html_content;
//         const filledTemplate = templateHtml
//             .replace(/{{\s*student_name\s*}}/gi, studentData.name)
//             .replace(/{{\s*student_address\s*}}/gi, studentData.address)
//             .replace(/{{\s*reference_no\s*}}/gi, `SRMIST/NCR/A&O/2026/WLC-${Math.floor(1000 + Math.random() * 9000)}`)
//             .replace(/{{\s*header_left_logo\s*}}/gi, headerImage)
//             // .replace(/{{\s*footer_image\s*}}/gi, footerImage)
//             .replace(/{{\s*date\s*}}/gi, formatDate());

//         if (showHtmlAsCode) {
//             const doc = new PDFDocument({ size: 'A4', margin: 10 });
//             const chunks = [];

//             doc.on('data', (chunk) => chunks.push(chunk));
//             doc.on('end', () => {
//                 const pdfBuffer = Buffer.concat(chunks);
//                 res.setHeader('Content-Type', 'application/pdf');
//                 res.setHeader('Content-Disposition', 'attachment; filename="student-letter.pdf"');
//                 res.send(pdfBuffer);
//             });

//             doc.font('Courier').fontSize(10).text(filledTemplate, { align: 'left', lineGap: 4 });
//             doc.end();
//         } else {
//             const htmlDocument = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{color: #333; font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.5; margin: 0; padding: 0;} .page{box-sizing: border-box; min-height: 297mm; padding: 25mm 20mm 35mm 20mm; page-break-after: always;} h1,h2,h3,h4,h5,h6{margin:0 0 10px;} p{margin:0 0 10px;} strong,b{font-weight:bold;} em,i{font-style:italic;} ul,ol{margin:0 0 10px 20px;} li{margin-bottom:5px;}</style></head><body>${filledTemplate}</body></html>`;
//             const fs = require('fs');
//             fs.writeFileSync('test.html', htmlDocument);
//             console.log("HTML generated");
//             const browser = await puppeteer.launch({
//                 args: ['--no-sandbox', '--disable-setuid-sandbox'],
//             });
//             const page = await browser.newPage();
//             await page.setContent(htmlDocument, { waitUntil: 'networkidle0' });
//             const pdfBuffer = await page.pdf({
//                 format: 'A4',
//                 printBackground: true,
//                 margin: { top: '2mm', bottom: '2mm', left: '2mm', right: '2mm' },
//             });
//             await browser.close();
//             res.setHeader('Content-Type', 'application/pdf');
//             res.setHeader('Content-Disposition', 'attachment; filename="student-letter.pdf"');
//             res.send(pdfBuffer);
//         }
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({ success: false, message: 'Could not generate PDF' });
//     }
// };
const googleLogin = async (req, res) => {
    try {
        const { token } = req.body;

        // Verify token with Google
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        console.log(token, 'token');
        const payload = ticket.getPayload();

        const { sub, email, name, picture } = payload;

        // Check if user exists
        let user = await User.findOne({ email });

        if (!user) {
            user = new User({
                name,
                email,
                googleId: sub,
                image: picture
            });

            await user.save();
        }

        // Generate JWT iejb ibvn ehid qhiu
        const appToken = jwt.sign(
            { id: user._id },
            "secretkey",
            { expiresIn: "1h" }
        );

        res.json({
            message: "Login successful",
            token: appToken,
            user
        });

    } catch (err) {
        console.log(err);
        res.status(401).json({ message: "Google login failed" });
    }
};

module.exports = {
    uploadPics,
    loginUser,
    signupUser,
    getUser,
    getTemplate,
    uploadExcel,
    uploadStudentExcel,
    downloadPDF,
    googleLogin,
    changePassword,
    sendMail
};