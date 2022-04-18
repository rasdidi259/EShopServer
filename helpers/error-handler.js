/**
 * author       :Anthony Osei Agyemang
 * date         :30/09/2021
 * description  :Error Handler Script
 */

// /**
//  * Global Error Hanlder Function
//  * @param {*} err 
//  * @param {*} req 
//  * @param {*} res 
//  * @param {*} next 
//  */
function errorHandler(err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        // jwt authentication error
      return   res.status(401).json({message:"The user is not authorized"});
    }
    
    if (err.name === 'ValidationError') {
        //Validation Error
        res.status(401).json({message:err});
    }

    // default to 500 server error
    return res.status(500).json({message:err});
}

module.exports = errorHandler;