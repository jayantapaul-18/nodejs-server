const express = require('express');
const server = express();
server.all('/name',function(request,response){
    const Body = {
        "id": "12345",
        "name":"yourname"
    }
    response.send(Body);
})
server.listen(process.env.PORT || 3005,process.env.IP ||  "0.0.0.0" ,process.env.address || 'localhost', function(){
    console.log('Server Started on http://localhost:3005');
})
