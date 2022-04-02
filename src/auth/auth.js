const jwt = require('jsonwebtoken')
const bookModel = require('../models/bookModel')
const ObjectId = require('mongoose').Types.ObjectId

const authentication = async function(req,res,next){
    try{
        let token = req.headers["x-api-key"]
        if(!token) return res.status(400).send({status:false,msg:'enter the token in header'})
        let decodedToken = jwt.verify(token, "secret-key", {ignoreExpiration: true})
        let exp = decodedToken.exp
        let iatNow = Math.floor(Date.now() / 1000)
        if(exp<iatNow) return res.status(401).send({status:false,msg:'Token is expired now'})
        next()
    }catch(error){
        return res.status(500).send({status:false, msg:error.message})
    }
}


const authorisation = async function(req,res,next){
    try{let bookId = req.params.bookId;
    if(!bookId) return res.status(400).send({status:false,msg:"bookId is not present in the params"})
    if(!ObjectId.isValid(bookId)) return res.status(401).send({status:false,msg:"BookId is not valid"})
    let book = await bookModel.findById(bookId)
    if(!book) return res.status(400).send({status:false,msg:"book with specific bookId"})
    let token = req.headers["x-api-key"]
    let decodedToken = jwt.verify(token, "secret-key", {ignoreExpiration: true})
    if(book.userId != decodedToken.userId) return res.status(401).send({status:false, msg:'You are not authorized to make the changes'})
    next()
}catch(error){
    return res.status(500).send({status:false,msg:error.message})
}

}


module.exports.authentication = authentication;
module.exports.authorisation = authorisation;
