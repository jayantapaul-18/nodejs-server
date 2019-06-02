const express = require('express');
const server = express();
const api = require('./api');
//server.use(api,api);
server.use('*',function(request,response,next){
    response.header('supper-server','supper-server');
    response.setHeader('supper-X','supper-X');
    next()
})
server.get('/app/healthcheck',function(request,response){
    response.send({"Status":"Server Up & running"});
})

server.all('/app/name',function(request,response){
    const Body = {
        "id": "12345",
        "name":"yourname"
    }
    response.send(Body);
})

server.listen(process.env.PORT || 3005,process.env.IP ||  "0.0.0.0" ,process.env.address || 'localhost', function(){
    console.log('Server Started on http://localhost:3005');
})
