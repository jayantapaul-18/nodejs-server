const express = require('express');
const server = express();
const os = require('os');
const api = require('./api');
//server.use(api,api);
server.use('*',function(request,response,next){
    response.header('supper-server','supper-server');
    response.setHeader('supper-X','supper-X');
    next()
})
server.get('/app/healthcheck',function(request,response){
    var health = {
        "status":"up",
        "uptime":process.uptime(),
        "cpu":os.cpus()[0],
        "platform":os.platform(),
        "freemem":os.freemem(),
        "networkInterfaces":os.networkInterfaces()
    }
    response.send(health);
})

server.all('/app/name',function(request,response){
    var hostName =os.hostname();
    const Body = {
        "server": process.versions.node,
        "device":"RaspberryPi3B+",
        "hostName":hostName,
        "osType":os.type()
    }
    response.send(Body);
})

server.listen(process.env.PORT || 3005,process.env.IP ||  "0.0.0.0" ,process.env.address || 'localhost', function(){
    console.log('Server Started on http://localhost:3005');
})
