const AdminController = require('../controllers/AdminController');
const multer = require('multer');
const { auth } = require('../helpers/auth');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Folder where images will be stored
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });
const excelUpload = multer({ storage: multer.memoryStorage() });

module.exports = (app) => {
    app.put('/create/admin', (req, res) => {
        AdminController.createAdmin(req, res);
    });
    app.get('/get/admin', (req, res) => {
        AdminController.getAdmin(req, res);
    });

    app.post('/uploadpics', upload.array('image'), async (req, res) => {
        AdminController.uploadPics(req, res);
    });

    app.get('/uploads/:name', function (req, res) {
        AdminController.downloadFile(req, res);
    });

    app.post('/google-login', function (req, res) {
        AdminController.googleLogin(req, res);
    });

    app.get('/template', async (req, res) => {
        AdminController.getTemplate(req, res);
    });

    app.post('/uploadstudents', excelUpload.single('file'), (req, res) => {
        AdminController.uploadStudentExcel(req, res);
    });

    app.post('/signup/:age', async (req, res) => {
        AdminController.signupUser(req, res);
    });

    app.get('/login', async (req, res) => {
        AdminController.loginUser(req, res);
    });

    app.get('/send/mail', async (req, res) => {
        AdminController.sendMail(req, res);
    });

    app.patch('/change/password', async (req, res) => {
        AdminController.changePassword(req, res);
    });

    app.get('/profile', auth, (req, res) => {
        AdminController.getUser(req, res);
    });
    app.post('/uploadexcel', upload.single('file'), (req, res) => {
        AdminController.uploadExcel(req, res);
    });
    app.post('/downloadpdf', async (req, res) => {
        AdminController.downloadPDF(req, res);
    });
    app.post('/downloadpdfbulk', async (req, res) => {
        AdminController.downloadBulkPDF(req, res);
    });
    app.get('/', async (req, res) => {
        res.status(200).json({ message: 'Admin route is working!' });
    });
};