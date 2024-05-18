const fetch = require('node-fetch');

const ReportError = async(err) => {
    if(process.env.DISCORD_WEBHOOK_URL){
        console.log(process.env.DISCORD_WEBHOOK_URL);
        const MSG = `Error Message:${err.message} /nError Stack:${err.stack}`;
        const data = {content: MSG};
        
        return await fetch(process.env.DISCORD_WEBHOOK_URL, {
            method: 'POST',
            body: JSON.stringify(data),
            headers:{
                'Content-Type': 'application/json'
            }
        })
    }
}   


module.exports = ReportError;