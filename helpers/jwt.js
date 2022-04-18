/**
 * author       :Anthony Osei Agyemang
 * date         :27/09/2021
 * description  : JWT Helper Function
 */

const expressJwt = require('express-jwt');

function authJwt() {
  const secret = process.env.SECRET;
  const api = process.env.API_URL;

  const unprotected = [
    '/api/v1/users/login',
    /\/login*/,
    /favicon.ico/
  ];

  return expressJwt({
    secret,
    algorithms: ['HS256'],
    isRevoked:isRevoked,   
  })
  .unless({
    path:[
      {url:/\/public\/uploads(.*)/, methods:['GET', 'OPTIONS']},
      {url:/\/api\/v1\/products(.*)/, methods:['GET', 'OPTIONS']},// public access
      {url:/\/api\/v1\/categories(.*)/, methods:['GET', 'OPTIONS']},
      `${api}/users/login`,
      `${api}/users/register`
    ]
  });
}

/**
 * Function to revoked the rights to delete or add products/ categories etc
 * @param {*} req 
 * @param {*} payload 
 * @param {*} done 
 */
async function isRevoked(req, payload, done) {
  if(!payload.isAdmin) done(null, true);
  done();
}



module.exports = authJwt;
