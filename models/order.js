/**
 * author       :Anthony Osei Agyemang
 * date         :23/09/2021
 * description  :Order Model
 */

const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    orderItems:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'OrderItem',
        required:true
    }],
    shippingAddress1:{
        type:String,
    },
    shippingAddress2:{
        type:String,
    },
    city:{
        type:String,
        required:true,
    },
    zip:{
        type:String,
        required:true,
    },
    country:{
        type:String,
        required:true,
    },
    phone:{
        type:String,
        required:true,
    },
    status:{
        type:String,
        required:true,
        default:'Pending',
    },
    totalPrice:{ // Calculate order totalPrice internally when ordered is craeted
        type:Number,
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    dateOrdered:{ // created automatically when order is created
        type:Date,
        default:Date.now,
    },
})


orderSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

orderSchema.set('toJSON', {
    virtuals:true,
});

exports.Order = mongoose.model('Order', orderSchema);
exports.orderSchema = orderSchema;