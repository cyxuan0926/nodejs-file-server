const logger = require('log4js').getLogger('app'),
    express  = require('express'),
    async    = require('async'),
    multer   = require('multer'),
    cors     = require('cors'),
    path     = require('path'),
    fs       = require('fs'),
    app      = express(),
    md5      = require('md5');
    https    = require('https');
    http     = require('http');
    bodyParser = require('body-parser');
const avatarsPath = '/image-server/avatars'; // 图片存储地址
const uuidsPath = '/image-server/uuids'; // 身份证存储地址
const videosPath = '/video-server/videos' //视频存储地址
const audiosPath = '/audio-server/audios' //音频存储地址

const Storage = multer.diskStorage({
  destination: (req, file, cb) => {
    switch (req.path) {
      case uuidsPath:
        // cb(null, '../public/image-server/uuids');
        cb(null, './public/image-server/uuids'); // 线上的图片存储地址
        break;
      case avatarsPath:
        // cb(null, '../public/image-server/avatars');
        cb(null, './public/image-server/avatars'); // 线上的图片存储地址
        break;
        case videosPath:
            cb(null,'./public/video-server/videos');  //线上的视频的存储地址
            break;
        case audiosPath:
            cb(null,'./public/audio-server/audios'); //线上的音频的存储地址
            break;
      default:
        logger.debug('this path has no operation');
    }
  },
  filename: (req, file, cb) => {
    // const fileArr = file.originalname.split('.');
    // const format = fileArr[1];
    // const fileName = fileArr[0];
    const format =  file.originalname.substring(file.originalname.lastIndexOf('.')+1)
    const fileName =  file.originalname.substring(0,file.originalname.lastIndexOf('.'))
    const now = new Date();
    const name = md5( fileName + now )
    cb(null, `${name}.${format}`);
    // cb(null, `${file.originalname}`);
  }
});
// https :https://${req.hostname}${avatarsPath}/${req.file.filename}
// Acceput jpeg file only
const FileFilter = (req, file, cb) => {
  if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png')
    cb(null, true);
  else 
    cb(new Error('Invalid file type'), false);
};

// The image file lower than 1024K
const Limits = { fileSize: 1024 * 1000, parts: 9 };
const Upload = multer({
  storage: Storage,
  // fileFilter: FileFilter,
  limits: Limits
});
const UploadVideo = multer({
    storage:Storage,
})
const UploadAudio = multer({
    storage:Storage,
})
const UploadUUID        = Upload.single('uuid');
const UploadAvatar      = Upload.single('avatar');
const UploadUserVideos  = UploadVideo.single('video');
const UploadAudios      = UploadAudio.single('audio');
const router            = express.Router();
const PORT              = 1339;
const HASH              = '523b87c4419da5f9186dbe8aa90f37a3876b95e448fe2a';

//cors
app.use(cors({
  "origin": true,
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  "preflightContinue": false,
  "credentials":true,
  "optionsSuccessStatus": 200
}));
app.use(bodyParser.text());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/*', (req, res, next) => {  
  const auth = req.headers.authorization || req.query.token;
  if (!auth || auth != HASH) {
    res.status(401).send({ code: 401, status: 'ERROR', message: 'Authorization Required'});
  } else {
    next();
  }
});

app.use(express.static(path.join(__dirname, '../public')));

// upload audio
app.post(audiosPath,function (req,res) {
    UploadAudios(req,res,(err) => {
        if (err) {
            logger.error(err.message);
            res.status(200).send({ code: 500, status: 'ERROR', message: err.message });
            return;
        } else {
            logger.info(`[SAVE AUDIOS]: #${req.file.filename}`);
            res.send({ code: 200, status: 'SUCCESS', url: `http://${req.headers.host}${audiosPath}/${req.file.filename}` });
        }
    })
})
//upload video
app.post(videosPath, function (req, res) {
    UploadUserVideos(req, res, (err) => {
        if (err) {
            logger.error(err.message);
            res.status(200).send({ code: 500, status: 'ERROR', message: err.message });
            return;
        }else {
            logger.info(`[SAVE VIDEO]: #${req.file.filename}`);
            res.send({ code: 200, status: 'SUCCESS', url: `http://${req.headers.host}${videosPath}/${req.file.filename}` });
        }
    })
})
// upload avatar
app.post(avatarsPath, function(req, res) {
  UploadAvatar(req, res, (err) => {
    if (err) {
      logger.error(err.message);
      res.status(200).send({ code: 500, status: 'ERROR', message: err.message });
      return;
    } else {
      logger.info(`[SAVE AVATAR]: #${req.file.filename}`);
      res.send({ code: 200, status: 'SUCCESS', url: `http://${req.headers.host}${avatarsPath}/${req.file.filename}` });
    }
  });
});

// upload uuid image
app.post(uuidsPath, function(req, res) {
  UploadUUID(req, res, (err) => {
    if (err) {
      logger.error(err.message);
      res.status(200).send({ code: 500, status: 'ERROR', message: err.message });
      return;
    } else {
      logger.info(`[SAVE UUID]: #${req.file.filename}`);
      res.send({ code: 200, status: 'SUCCESS', url: `http://${req.headers.host}${uuidsPath}/${req.file.filename}` });
    }
  });
});

/**
 删除资源
 */
// fs模块:https://segmentfault.com/a/1190000011343017 https://segmentfault.com/q/1010000008827322
// https: /image-server/delete/resources
app.delete('/delete/resources', function (req, res) { 
    async.mapSeries(req.body.urls, function (keyVal, callback) {
        if(typeof keyVal === "string") {
        let middleKeyVal = keyVal.substring(0,keyVal.lastIndexOf('/'))
        let lastKeyVal = middleKeyVal.substring(0,middleKeyVal.lastIndexOf('/'))
        let fileName = keyVal.substring(keyVal.lastIndexOf('/')+1)
        let type = middleKeyVal.substring(middleKeyVal.lastIndexOf('/')+1)
        let serverType = lastKeyVal.substring(lastKeyVal.lastIndexOf('/')+1)
        let filePath = path.join(__dirname,`../public/${serverType}/${type}/${fileName}`)
        fs.exists(filePath, exists => {
            if (exists) {
                fs.unlink(path.join(filePath), err => {
                    if (err) {
                        if (err.code === 'ENOENT') callback(null,'')
                        else callback(null,keyVal)
                        logger.error(err)
                    } else {
                        callback(null, '')
                        logger.info(`[DELETE ${`${type}`.toUpperCase()}]: #${fileName}`)
                    }
                })
            } else {
                callback(null,'')
                logger.info(`${filePath}:该目录/文件不存在`)
            }
        })
        } else {
            callback(null, '')
            logger.error(`${keyVal}: 传入了错误参数`)
    }
    }, function (err, result) {
        let count = 0
        let msg = result
        for (let [index, val] of result.entries()) {
            if (val !== '') {
                count++
            } else {
                msg.splice(index,1)
            }
        }
        if (count!==0) return res.send({ code: 500, msg: 'ERROR', data: {urls:msg} })
        else return res.send({ code: 200, msg: '成功' })
    })
})

// app.listen(PORT, () => {
//   logger.info(`app server listening on port ${PORT}`);
// });

var httpServer = http.createServer(app);

httpServer.listen(PORT,() => {
  console.log('http server is running on ' + PORT);
});