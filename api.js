const axios = require('axios');

module.exports = async function (context, req) {

    const {data} = await axios.get("https://cat-fact.herokuapp.com/facts")

    const fact = data.all[Math.floor(Math.random()*data.all.length)];
    console.log(fact);

    context.res = {
        body:fact,
        headers:{
            "Content-Type":"application/json"
        }
    }
}
