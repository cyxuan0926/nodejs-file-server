const logger = require('log4js').getLogger('app'),
    express  = require('express'),
    multer   = require('multer'),
    path     = require('path'),
    app      = express();

const Storage = multer.diskStorage({
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
});

// Acceput jpeg file only
const FileFilter = (req, file, cb) => {
  if (file.mimetype == 'image/jpeg') 
    cb(null, true);
  else 
    cb(new Error('Invalid file type'), false);
};

// The image file lower than 1024K
const Limits = { fileSize: 1024 * 1000, parts: 9 };
const Upload = multer({
  storage: Storage,
  fileFilter: FileFilter,
  limits: Limits
});

const UploadAvatar     = Upload.single('avatar');
const UploadTopicImage = Upload.single('topic');
const router           = express.Router();
const PORT             = 1339;
const HASH             = '523b87c4419da5f9186dbe8aa90f37a3876b95e448fe2abf5bf7e4753d5aa25fe88caa7ed96d4a2e89c01f839891b74362bb2450d352f1e4c3d4f7d8d51f5c65';

app.use('/*', (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || auth != HASH) {
    res.status(401).send({ code: 401, status: 'ERROR', message: 'Authorization Required'});
  } else {
    next();
  }
});

app.use(express.static(path.join(__dirname, '../public')));
// upload avatar
app.post('/profile', function(req, res) {
  UploadAvatar(req, res, (err) => {
    if (err) {
      logger.error(err.message);
      res.status(200).send({ code: 500, status: 'ERROR', message: err.message });
      return;
    }

    res.send({ code: 200, status: 'SUCCESS', url: `http://${req.hostname}:${PORT}/avatars/${req.file.filename}` });
  });
});

// // upload topic image
app.post('/topics', function(req, res) {
  UploadTopicImage(req, res, (err) => {
    if (err) {
      logger.error(err.message);
      res.status(200).send({ code: 500, status: 'ERROR', message: err.message });
      return;
    }

    res.send({ code: 200, status: 'SUCCESS', url: `http://${req.hostname}:${PORT}/topics/${req.file.filename}` });
  });
});

app.listen(PORT, () => {
  logger.info(`app server listening on port ${PORT}`);
});