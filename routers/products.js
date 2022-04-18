
/**
 * author       :Anthony Osei Agyemang
 * date         :23/09/2021
 * description  :Product Routes
 */

const {Product} = require('../models/product');
const express = require('express');
const { Category } = require('../models/category');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const { response } = require('express');

const FILE_TYPE_MAP ={
    'image/png':'png',
    'image/jpeg':'jpeg',
    'image/jpg':'jpg'
}

// Upload file(s)
const storage = multer.diskStorage({
    destination:function(req, file, cb) {
        const isValid =  FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');
        if(isValid) uploadError = null;
        cb(uploadError, 'public/uploads')        
    },
    filename:function(req, file, cb) {
       const fileName = file.originalname.replace(' ', '-');
        //const fileName = file.originalname.split(' ').join('-'); // split by space and rejoin by dash -
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`)
    }
});

const uploadOptions =  multer({storage:storage});



// Get Endpoint (Getting All the products)
router.get(`/` ,  async (req , res)=>{
  let filter = {};
  if (req.query.categories) 
  {
    filter = { category: req.query.categories.split(',') }
  }

  // if filter is nothing then return all products
  // const productList = await Product.find().select( 'name description rating image -_id'); //Returns specified fields
  const productList = await Product.find(filter);//.populate('category'); // use await and aysnc (Promise - then /catch)
  if (!productList) return res.status(500).json({ success: false });
  
  res.send(productList);
})

// Get Endpoint (Get a Product by id)
router.get(`/:id` , async(req , res)=>{
    //const product = await Product.findById(req.params.id).populate('category')
    const product = await Product.findById(req.params.id).populate('category');  //get the category details using populate
    if (!product) return res.status(500).json({ success: false });
    
    res.send(product)
})


// Put Endpoint (Update an existing Product)
router.put(`/:id` , async (req , res)=>{
    // Check if id valid
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send('Invalid  Product Id');
    }

    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category')  // Check if category valid

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name:req.body.name,
            description:req.body.description,
            richDescription:req.body.richDescription,        
            image:req.body.image,
            brand:req.body.brand,
            price:req.body.price,
            category:req.body.category,        
            countInStock:req.body.countInStock,
            rating:req.body.rating,
            reviews:req.body.reviews,
            numReview:req.body.numReview,
            isFeature:req.body.isFeature, 
        },
        {new:true}
    )
    if (!product) return res.status(500).send('the product cannot be updated');
    
   res.send(product);
}) 

// Post Endpoint (Add a new Product)
router.post(`/` , uploadOptions.single('image'), async(req , res)=>{
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category');

    // Check if image exist before submitting the request
    const file = req.file;
    if(!file) return res.status(400).send('No image in the request');

    const fileName = req.file.filename;
    const basePath =`${req.protocol}://${req.get('host')}/public/uploads/`; // "http://localhost:3000/public/uploads/image-04102021"

    let product = new Product({
        name:req.body.name,
        description:req.body.description,
        richDescription:req.body.richDescription,        
        image:`${basePath}${fileName}`,
        brand:req.body.brand,
        price:req.body.price,
        category:req.body.category,        
        countInStock:req.body.countInStock,
        rating:req.body.rating,
        numReviews:req.body.numReviews,
        isFeatured:req.body.isFeatured,
    });
    
    // save the new product
    product = await product.save();

    if (!product) {
        res.status(400).send('The product cannot be created');
    }

    return res.send(product); // All good
})

// Delete Endpoint (Removes an existing Procust by id)
router.delete(`/:id` ,  async(req , res)=>{
    const product = Product.findByIdAndRemove(req.params.id)
    .then(product=>{
        if (product) {
            return res.status(200).json({success:true, message:'the product was deleted'});
        } else {
            return res.status(404).json({success:false, message:'the product was not found'});
        }
    })
    .catch((err)=>{
        return res.status(500).json({success:false, error:err});
    });

})

// Get Count (Returns the total count of Product)
router.get(`/get/count`, async(req,res)=>{
    let productCount = await Product.countDocuments()
    if (productCount == 0 || productCount == null) {
      return  res.status(500).json({success:false});
    }
    res.send({productCount:productCount})
})


// Get Featured Products( Also restrict it by a number)
router.get(`/get/featured`, async(req,res )=>{
    const productFeatured = await Product.find({isFeatured:true})  // filter results by isFeatured true
     if (!productFeatured) {
        return res.status(500).json({success:false})
    }

    res.send(productFeatured);
})


// Get Featured Products( Also restrict it by a number)
router.get(`/get/featured/:count`, async(req,res )=>{
    const count = req.params.count ? req.params.count : 0;    
    const productFeatured = await Product.find({isFeatured:true}).limit(+count)  // filter results by isFeatured true
     if (!productFeatured) {
        return res.status(500).json({success:false})
    }

    res.send(productFeatured);
});


// Upload Gallery Images via Update (PUT method)
router.put(
  `/gallery-images/:id`,
  uploadOptions.array('images', 10),
  async (req, res) => {

    // Check if product id is valid
    if(!mongoose.isValidObjectId(req.params.id)) return res.status(400).send('Invalid product Id');
    let imagesPaths = [];
    const files = req.files;
    const basePath =  `${req.protocol}://${req.get('host')}/public/uploads/`; // "http://localhost:3000/public/uploads/image-04102021"

    if (files) {
        files.map(file =>{
            imagesPaths.push(`${basePath}${file.filename}`); // add each file with the basePath to the imagePath
        })
    }

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            images:imagesPaths
        },
        {new:true}
    );

    if(!product) return res.status(500).send('The product cannot be updated.');
    res.send(product);
  }
);


module.exports = router;