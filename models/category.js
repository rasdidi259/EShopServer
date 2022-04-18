
/**
 * author       :Anthony Osei Agyemang
 * date         :23/09/2021
 * description  :Category Model
 */


const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
    },       
    icon:{ // icon name (e.g. Google Material Icons)
        type:String,        
    },
    color:{ // '#ffffff'
        type:String,        
    },
});

categorySchema.virtual('id').get(function() {
    return this._id.toHexString();
});

categorySchema.set('toJSON', {
    virtuals:true,
});

exports.Category = mongoose.model('Category', categorySchema);
exports.categorySchema = categorySchema;