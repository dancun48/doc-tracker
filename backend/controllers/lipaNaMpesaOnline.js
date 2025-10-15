const lipaNaMpesaOnline = async (req, res) => {
    let token = req.token;
        let auth = `Bearer ${token}`;       
        //getting the timestamp
        let timestamp = require('../middleware/timestamp').timestamp;
        let url = process.env.lipa_na_mpesa_url;
        let bs_short_code = process.env.lipa_na_mpesa_shortcode;
        let passkey = process.env.lipa_na_mpesa_passkey;
        let password = new Buffer.from(`${bs_short_code}${passkey}${timestamp}`).toString('base64');
        let transcation_type = "CustomerPayBillOnline";
        let amount = "1"; //you can enter any amount
        let partyA = "party-sending-funds"; //should follow the format:2547xxxxxxxx
        let partyB = process.env.lipa_na_mpesa_shortcode;
        let phoneNumber = "party-sending-funds"; //should follow the format:2547xxxxxxxx
        let callBackUrl = "your-ngrok-url/mpesa/lipa-na-mpesa-callback";
        let accountReference = "lipa-na-mpesa-tutorial";
        let transaction_desc = "Testing lipa na mpesa functionality";
        try {
            let {data} = await axios.post(url,{
                "BusinessShortCode":bs_short_code,
                "Password":password,
                "Timestamp":timestamp,
                "TransactionType":transcation_type,
                "Amount":amount,
                "PartyA":partyA,
                "PartyB":partyB,
                "PhoneNumber":phoneNumber,
                "CallBackURL":callBackUrl,
                "AccountReference":accountReference,
                "TransactionDesc":transaction_desc
            },{
                "headers":{
                    "Authorization":auth
                }
            }).catch(console.log);
            return res.send({
                success:true,
                message:data
            });
        }catch(err){
            return res.send({
                success:false,
                message:err['response']['statusText']
            });
        };
}

export default lipaNaMpesaOnline;