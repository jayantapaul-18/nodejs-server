const express = require('express');
const app = express();
const os = require('os');
const axios = require('axios');
const bodyParser = require('body-parser');
const helmet = require('helmet')
const api = require('./api');
//app.use(api,api);
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

app.use(helmet())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('*',(req,res,next)=>{
    res.header('supper-server','supper-server');
    res.setHeader('supper-X','supper-X');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next()
})

app.all('/app/healthcheck',(req,res)=>{
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

app.listen(process.env.SERVER_PORT || SERVER_PORT,process.env.IP ||  "0.0.0.0" ,process.env.address || 'localhost', function(){
    console.log('Server Started on http://localhost:'+SERVER_PORT+'/app/healthcheck');
    console.log('Server Started on http://localhost:'+SERVER_PORT+'/app/name');
    logger.log({
        level: 'info',
        message: 'Server Started on http://localhost:'+SERVER_PORT,
        additional: 'properties',
        are: 'passed along'
      });
})
