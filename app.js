const logger = require('log4js').getLogger('app'),
    express = require('express'),
    multer = require('multer'),
    path = require('path'),
    app = express();

const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            switch (req.path) {
                case '/profile':
                    cb(null, 'public/avatars');
                    break;
                case '/topics':
                    cb(null, 'public/topics');
                    break;
                default:
                    logger.debug('this path has no operation');
            }
        },
        filename: (req, file, cb) => {
            cb(null, `${file.originalname}`);
        }
    }),
    fileFilter = (req, file, cb) => {
        if (file.mimetype == 'image/jpeg') cb(null, true);
        else cb(new Error('unallowed file type'), false);
    },
    limits = { fileSize: 1024 * 1000, parts: 9 },
 
    upload = multer({
        storage: storage,
        fileFilter: fileFilter,
        limits: limits
    });

const PORT = 1339;

app.use(express.static(__dirname + '/public'));

const uploadAvatar = upload.single('avatar');
app.post('/profile', function(req, res) {
    uploadAvatar(req, res, (err) => {
        if (err) {
            logger.error(err.message);
            res.status(500).send({ code: 500, status: 'ERROR', message: err.message });
            return;
        }

        res.send({ code: 200, status: 'SUCCESS', url: `http://${req.hostname}:${PORT}/avatars/${req.file.filename}` });
    });
});

app.listen(PORT, () => {
    logger.info(`app server listening on port ${PORT}`);
});