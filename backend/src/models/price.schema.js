import mongoose from "mongoose";

'

const priceSchema = new mongoose.Schems({
    amount:{
        type:Number,
        required:true
    },
    currency:{
        type:String,
        enum:["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY", "SEK", "NZD", "MXN", "SGD", "HKD", "NOK", "KRW", "TRY", "RUB", "INR", "BRL", "ZAR"],
        required:true,
        default:"INR"
    }   
    }, _id: false ,
_versionKey: false
});

export default priceSchema