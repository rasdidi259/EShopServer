
/**
 * author       :Anthony Osei Agyemang
 * date         :23/09/2021
 * description  :Category Routes
 */

const {Category} = require('../models/category');
const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();

// Get Endpoint
router.get(`/` , async (req , res)=>{
    const categoryList = await Category.find();
    if (!categoryList) {
        res.status(500).json({success:false})
    }
   res.status(200).send(categoryList)
})
 
// Get Endpoint (Get a Category by id)
router.get('/:id' , async (req , res)=>{
    const category = await Category.findById(req.params.id);
    if (!category) {
        return res.send(500).json({maessage:'The category with the given Id was not found.'})
    }
   res.status(200).send(category);
})

// Post Endpoint(Add New Category)
router.post('/' ,  async (req , res)=>{
    let category = new Category({
        name:req.body.name,
        icon:req.body.icon,
        color:req.body.color
    })
    category = await category.save();

    if (!category) {
        return res.status(404).send('the category cannot be created!')
    }
   res.send(category);
})

// Update Endpoint(Update an existing Category by id)
router.put('/:id' , async (req , res)=>{
    let category = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name:req.body.name,
            icon:req.body.icon,
            color:req.body.color
        },
        {new:true}
    )

    if (!category) {
        return res.status(400).send('the category cannot be created!');
    }

   res.send(category);
})

//Delete Endpoint (Delete an existing Category)
router.delete('/:id' , (req , res)=>{
    Category.findByIdAndRemove(req.params.id)
    .then(category=>{
        if (category) {
            return res.status(200).json({success:true, message:'The category is deleted'})
        }
        else{
            return res.status(404).json({success:false, message:'The category was not found'})
        }
    })
    .catch((err)=>{
        return res.status(400).json({success:false, error:err})
    });
})

module.exports =router;