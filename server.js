const express = require('express');
const app = express();
const os = require('os');
const axios = require('axios');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const level = require('level');
const api = require('./api');
//app.use(api,api);
const fs = require('fs');
const { StillCamera } = require("pi-camera-connect");
const stillCamera = new StillCamera();
const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;
const listDevice = [];
const SERVER_PORT = 3005;
const winston = require('winston');
const logger = winston.createLogger({
    level: 'info',
    format:winston.format.combine(
           winston.format.timestamp({
           format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
      ),
    defaultMeta: { service: 'Node' },
    transports: [
      new winston.transports.File({ filename: 'error.log', level: 'error' }),
      new winston.transports.File({ filename: 'combined.log' })
    ]
  });
  if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
      format: winston.format.simple()
    }));
  }

var routes = require("./routes").routes;
app.use(helmet())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('*',(req,res,next)=>{
    res.header('supper-server','supper-server');
    res.setHeader('supper-X','supper-X');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next()
})

app.use(function(err, req, res, next) {
	var data = {};
	var statusCode = err.statusCode || 500;
	data.message = err.message || 'Internal Server Error';
	if (process.env.NODE_ENV === 'development' && err.stack) {
		data.stack = err.stack;
	}
	if (parseInt(data.statusCode) >= 500) {
		console.error(err);
	}
	res.status(statusCode).json(data);
});

function listPorts() {
    SerialPort.list().then(
     ports => {
      ports.forEach(port => {
       console.log(`${port.path}`);
       listDevice.push(port.path);
      })
     },
     err => {
      console.error('Error listing ports', err)
     }
    )
   }

   listPorts()
   const DevicesConnected = []
   let listDevicesConnected = () => SerialPort.list().then(ports => ports.forEach(port => DevicesConnected.push(port.path) )) 
   listDevicesConnected();

app.get('/app/listDevices', (req , res ) => {
    res.send(listDevice);   
    res.end(); 
})

const device = '/dev/ttyACM0';  // ls -lha /dev/tty*
const serialPort = new SerialPort(device, function (err) {
    if (err) {
      return console.log(err.message)
    }
    else{
        console.log('Serial communication is ON with ',device);
    }
    baudRate: 57600
  })
  
const parser = new Readline()
serialPort.pipe(parser)
const lineStream = serialPort.pipe(new Readline())

app.get('/', (req , res ) => {
    res.sendFile(path.join(__dirname, 'index.html'));
})

app.get('/app/imag/:id', (req , res ) => {
stillCamera.takeImage().then(image => {
    fs.writeFileSync("1.jpg", image);
});
res.writeHead(200,{'content-type':'image/jpg'});
fs.createReadStream('./1.jpg').pipe(res);
})

app.get('/app/test', (req , res ) => {
        var serialData = JSON.stringify(lineStream._readableState.buffer.head.data);
        console.log(JSON.stringify(lineStream._readableState.buffer.head.data));
        console.log({"text":serialData});
        res.send(serialData);   
        res.end(); 
})

app.get('/dev/:deviceid', (req , res ) => {
    var deviceid = req.params.deviceid;
    var serialPort = new SerialPort(deviceid, function (err) {
        if (err) {
          return console.log(err.message)
        }
        else{
            console.log('Serial communication is ON with ',deviceid);
        }
        baudRate: 57600
      })
      var parser = new Readline()
      serialPort.pipe(parser)
      var lineStream = serialPort.pipe(new Readline())
      var serialData = JSON.stringify(lineStream._readableState.buffer.head.data);
    res.send(serialData);   
    res.end(); 
})

app.all(routes.hc,(req,res)=>{
    var health = {
        "status":"up",
        "uptime":process.uptime(),
        "cpu":os.cpus()[0],
        "platform":os.platform(),
        "freemem":os.freemem(),
        "networkInterfaces":os.networkInterfaces()
    }
    res.send(health);
})

app.all('/app/name',(req,res)=>{
    var hostName =os.hostname();
    const Body = {
        "server": process.versions.node,
        "device":"RaspberryPi3B+",
        "hostName":hostName,
        "osType":os.type()
    }
    res.send(Body);
})

app.get('/app/process',(req,res)=>{
    var data = {
        system_info: { hostname: os.hostname(),
                       uptime: os.uptime()
                     },
        monit: { loadavg: os.loadavg(),
                 total_mem: os.totalmem(),
                 free_mem: os.freemem(),
                 cpu: os.cpus(),
                 interfaces: os.networkInterfaces()
               }
      };
      res.send(data);
})


const db = level('my-db')

db.put('name', 'Level', function (err) {
  if (err) return console.log('Ooops!', err)
 
  db.get('name', function (err, value) {
    if (err) return console.log('Ooops!', err) 
    console.log('name=' + value)
  })
})

process.on('SIGINT', function() {
    console.log("Exit from Server");
    process.exit();
  })
  
process.on('SIGTERM', function() {
    console.log("Exit from Server");
    process.exit();
  })

app.listen(process.env.SERVER_PORT || SERVER_PORT,process.env.IP ||  "0.0.0.0" ,process.env.address || 'localhost', function(){
    console.log('Nodejs V: '+process.versions.node+' Server Started on http://localhost:'+SERVER_PORT+'/app/healthcheck');
    console.log('Server Started on http://localhost:'+SERVER_PORT+'/app/name');
    logger.log({
        level: 'info',
        message: 'Server Started on http://localhost:'+SERVER_PORT,
        additional: 'properties',
        are: 'passed along'
      });
})
