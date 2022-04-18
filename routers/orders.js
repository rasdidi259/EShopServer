/**
 * author       :Anthony Osei Agyemang
 * date         :23/09/2021
 * description  :Order Routes
 */

const { Order } = require("../models/order");
const {OrderItem} = require('../models/order-item');
const express = require("express");
const { Promise } = require("mongoose");
const router = express.Router();

// GET (Return a list of all Orders)
router.get(`/`, async (req, res) => {
  const orderList = await Order.find().populate('user', 'name').sort({'dateOrdered':-1}); // sort from newest to oldest date
  if (!orderList) return res.status(500).json({ success: false });
  res.send(orderList);
});

// GET (Return One Order by Id)
router.get(`/:id`, async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name")
    .populate({
      path: "orderItems",
      populate: { path: "product", populate: "category" },
    });  // get the details of array of orderItems-> products -> categories
  if (!order) return res.status(500).json({ success: false });
  res.send(order);
});


// POST (Create a new Order)
router.post(`/`, async(req, res)=>{
  
  const orderItemsIds = Promise.all(req.body.orderItems.map(async orderItem =>{
    let newOrderItem = new OrderItem({
        quantity: orderItem.quantity,
        product:orderItem.product
    });

    newOrderItem = await newOrderItem.save(); // Save new newOrderItem to the database

    return newOrderItem._id;  // Return the new newOrderItem Id
  }));  // Returns All the new newOrderItem Ids
  
  const orderItemsIdsResolved  = await orderItemsIds;

  // calculate the total price(s)
  const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemsId)=>{
    const orderItem = await OrderItem.findById(orderItemsId).populate('product', 'price');
    const totalPrice = orderItem.product.price * orderItem.quantity;
    return totalPrice;
  } ));

  //Sumarize the total order price
  const totalPrice = totalPrices.reduce((a,b)=> a + b, 0);

  let order = new Order({
    orderItems: orderItemsIdsResolved, // get newOrderItems Ids
    shippingAddress1:req.body.shippingAddress1,
    shippingAddress2:req.body.shippingAddress2,
    city:req.body.city,
    zip:req.body.zip,
    country:req.body.country,
    phone: req.body.phone,
    totalPrice: totalPrice,
    user:req.body.user
  });
  
  order = await order.save(); // Save new Order to the database

  if(!order) return res.status(400).send('the order cannot be created');

  res.send(order);  
});

// Update Endpoint(Update an existing Order by id)
router.put("/:id", async (req, res) => {
  let order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
    },
    { new: true }
  );

  if (!order) return res.status(400).send("the order cannot be created!");
  res.send(order);
});

//Delete Endpoint (Delete an existing Order) For Admin Use
router.delete('/:id' , (req , res)=>{
  Order.findByIdAndRemove(req.params.id)
  .then(async order=>{
      if (order) {

          await order.orderItems.map(async orderItem =>{ // loop through orderItem and remove all attached to this order
            await OrderItem.findByIdAndRemove(orderItem); // remove each orderItem  (can catch and throw error)
          });

          return res.status(200).json({success:true, message:'The order is deleted'})
      }
      else{
          return res.status(404).json({success:false, message:'The order was not found'})
      }
  })
  .catch((err)=>{
      return res.status(400).json({success:false, error:err})
  });
})

// Get the total Sales
router.get(`/get/totalsales`, async(req,res)=>{
  const totalSales = await Order.aggregate([
    {$group:{_id:null, totalSales:{$sum:'$totalPrice'}}}
  ])

  if(!totalSales) return res.status(400).send('The order sales cannot be generated');
  res.send({totalSales:totalSales.pop().totalSales});
});

// Counte the total number of Orders placed in the shop
router.get(`/get/count`, async(req,res)=>{
  const orderCount = await Order.countDocuments();

  if(!orderCount) return res.status(400).send({success:false});
  res.send({orderCount:orderCount});
})

// GET UserOrderList (User Order History)
router.get('/get/userorders/:userid', async(req, res)=>{
  const userOrderList = await Order.find({
    user: req.params.userid,
  }).populate({path:'orderItems', populate:{
    path:'product', populate:'category'}
  }).sort({'dateOrdered':-1});

  if(!userOrderList) return res.status(500).json({success:false});
  res.send(userOrderList);
});

module.exports = router;
