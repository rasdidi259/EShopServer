
/**
 * author       :Anthony Osei Agyemang
 * date         :23/09/2021
 * description  :Product Model
 */

const mongoose = require('mongoose');

//Model(s) Schema
// const productSchema = mongoose.Schema({
//     name:{
//         type:String,
//         required:true    
//     },
//     description:{
//         type:String,
//         required:true
//     },
//     richDescription:{
//         type:String,
//         default:''
//     },
//     image:{
//         type:String,
//         default:''
//     },     
//     images:[{
//         type:String
//     }],
//     brand:{
//         type:String,
//     },
//     price:{
//         type:Number,
//         default:0
//     },
//     category:{
//         type:mongoose.Schema.Types.ObjectId,
//         ref:'Category',
//         required:true
//     },
//     rating:{
//         type:Number,
//         default:0
//     },
//     countInStock:{
//             type:Number,
//             required:true,
//             min:0,
//             max:255
//     },
//     numReviews:{
//         type:Number,
//         default:0,
//     },
//     isFeatured:{
//         type:Boolean,
//         default:false,
//     },
//     dateCreated:{
//         type:Date,
//         default:Date.now
//     },
// });


const productSchema = mongoose.Schema({    
    image:{
        type:String,
        default:''
    }, 
    brand:{
        type:String,
    },
    price:{
        type:Number,
        default:0
    },
    rating:{
        type:Number,
        default:0
    },
    numReviews:{
        type:Number,
        default:0,
    },
    isFeatured:{
        type:Boolean,
        default:false,
    },
    name:{
        type:String,
        required:true    
    },
    description:{
        type:String,
        required:true
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category',
        required:true
    },
    // reviews:[{
    //     type:String
    // }],

    reviews:[{
        avatar:{type:String},
        name:{type:String},
        review:{type:String},
    }],
    countInStock:{
            type:Number,
            required:true,
            min:0,
            max:255
    },
    richDescription:{
        type:String,
        default:''
    },
    images:[{
        type:String
    }],
    dateCreated:{
        type:Date,
        default:Date.now
    },
});



productSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

productSchema.set('toJSON', {
    virtuals:true,
});

exports.Product = mongoose.model('Product', productSchema); //Model(s)
exports.productSchema = productSchema;