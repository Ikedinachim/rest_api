const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const path = require('path')
const multer = require('multer')
const helmet = require('helmet')
const compression = require('compression')
const morgan = require('morgan')
const fs  = require('fs')

const feedRoutes = require('./routes/feed')
const authRoutes = require('./routes/auth')
const app = express();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
    //   cb(null,  path.join( __dirname + '/images'))
      cb(null,  './images')
    },
    filename: (req, file, cb) =>{
      cb(null, Date.now() + file.originalname)
    }
  })

const filter = (req, file, cb) => {
    if (file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg' || file.mimetype =='image/png') {
        cb(null, true)
        }else{
        cb(null, false)}    
}
const accessStreamLog = fs.createWriteStream
(path.join(__dirname, 'access.log'), {
  flags: 'a'
})

app.use(multer({storage: storage,  fileFilter: filter }).single('image'))
app.use( express.static(path.join(__dirname)))
app.use(helmet())
app.use(compression())

app.use(morgan('combined', {stream: accessStreamLog}))
app.use(bodyParser.json())
app.use((req, res,next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, PUT, GET, PATCH');
    next();
})



app.use('/feed',feedRoutes)
app.use('/auth', authRoutes)





app.use((error, req, res, next) => {
    console.log('errer', error)
    const status = error.statusCode || 500;
    const message = error.message;
    res.status(status).json({
        messsage: message,
        error: error
        })
})

mongoose.connect(`mongodb+srv://${process.env.MONGO_ID}:${process.env.MONGO_PASSWORD}@cluster0.nzswbzm.mongodb.net/${process.env.MONGO_DATABASE_NAME}?retryWrites=true&w=majority`)
.then(result => {
  const server =  app.listen(process.env.PORT || 8080);
  const io = require('socket.io')(server);
  io.on('connection', socket => {
    console.log('Client Connected');
  })

}).catch(err => console.log(err))

