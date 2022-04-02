const bookModel = require('../models/bookModel')
const ObjectId = require('mongoose').Types.ObjectId
const reviewModel = require('../models/reviewModel')

const createReview = async function(req,res){
    try{let bookId = req.params.bookId.trim();
    if(!bookId) return res.status(400).send({status:false,msg:"bookId is not present in the params"})
    if(!ObjectId.isValid(bookId)) return res.status(400).send({status:false,msg:"bookId in params is invalid"})
    let book = await bookModel.findOne({_id:bookId,isDeleted:false})
    if(!book) return res.status(400).send({status:false,msg:"book with specific bookId is not present"})
    
    let reviewData = req.body
    if(Object.keys(reviewData).length == 0) return res.status(400).send({status:false,msg:'enter the review details'})
    if(!reviewData.bookId) return res.status(400).send({status:false,msg:"bookId in body is not present in the body"})
    if(!ObjectId.isValid(reviewData.bookId.trim())) return res.status(400).send({status:false,msg:"bookId in body is invalid"})
    let books = await bookModel.findOne({_id:reviewData.bookId.trim(),isDeleted:false})
    if(!books) return res.status(400).send({status:false,msg:"book with specific bookId is not present"})
    if(bookId != reviewData.bookId.trim()) return res.status(400).send({status:false,msg:'bookId in params and body do not match'})
    
    if(Object.keys(reviewData).includes('reviewedBy')){
        if(reviewData.reviewedBy.trim().length == 0) {
            reviewData.reviewedBy = 'Guest'
        }
    }
    if(Object.keys(reviewData).includes('reviewedAt')){
        if(!(/^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/.test(reviewData.reviewedAt.trim()))){
            return res.status(400).send({status:false,msg:"reviewed Date is not valid"})
        }
    }
    if(!reviewData.rating) return res.status(400).send({status:false,msg:'rating is not present'})
    if(reviewData.rating<1 || reviewData.rating>5) return res.status(400).send({stats:false,msg:'rating must be in the range from 1 to 5'})
    let data = await reviewModel.create(reviewData)
    let review = await reviewModel.find({bookId:bookId,isDeleted:false})
    let bookUpdate = await bookModel.findOneAndUpdate({_id:bookId, isDeleted:false}, {$inc: {review : 1}},{new:true}) 
    bookUpdate = bookUpdate.toObject();
    bookUpdate.reviewsData = review
    return res.status(201).send({status:true,msg:"Book List",data:bookUpdate})
}catch(error){
    return res.status(500).send({status:false,msg:error.message})
}
}

const updateReview = async function(req,res){
    try{if(Object.keys(req.body).length == 0) return res.status(400).send({status:false,msg:"enter the details to update the review"})
    let bookId = req.params.bookId.trim();
    if(!bookId) return res.status(400).send({status:false,msg:"bookId is not present in the params"})
    if(!ObjectId.isValid(bookId)) return res.status(400).send({status:false,msg:"bookId in params is invalid"})
    let book = await bookModel.findOne({_id:bookId,isDeleted:false})
    if(!book) return res.status(400).send({status:false,msg:"book with specific bookId is not present"})
    
    let reviewId = req.params.reviewId.trim();
    if(!reviewId) return res.status(400).send({status:false,msg:"reviewId is not present in the params"})
    if(!ObjectId.isValid(reviewId)) return res.status(400).send({status:false,msg:"reviewId in params is invalid"})
    let review = await reviewModel.findOne({_id:reviewId,isDeleted:false})
    if(!review) return res.status(400).send({status:false,msg:"review with specific reviewId is not present"})
    // Get review details like review, rating, reviewer's name in request body
    let reviewData = req.body
    let reviewCondition = ['rating','review','reviewedBy']
    for(let i=0;i<Object.keys(reviewData);i++){
        if(!reviewCondition.includes(Object.keys(reviewData)[i])) return res.status(400).send({status:false,msg:'wrong update details is present'})
        
    }
    if(Object.keys(reviewData).includes('rating')){
        if(typeof(reviewData.rating) != typeof(1)) return res.status(400).send({stats:false,msg:`rating should be a number`})
        if(reviewData.rating<1 || reviewData.rating>5) return res.status(400).send({status:false,msg:'rating must be in the range of 1 to 5'})
    }
    if(Object.keys(reviewData).includes('reviewedBy')){
        if(reviewData.reviewedBy.trim().length == 0) return res.status(400).send({status:false,msg:'ReviewedBy cannot be empty'})
    }
    book = book.toObject()
    let updated = await reviewModel.findByIdAndUpdate({_id:reviewId,status:false}, {$set:{review:reviewData.review, rating:reviewData.rating,reviewedBy:reviewData.reviewedBy}})
    let allReviews = await reviewModel.find({bookId:bookId,isDeleted:false})
    book.reviewsData = allReviews
    return res.status(200).send({status:true,msg:"Book List",data:book})
}catch(error){
    return res.status(500).send({status:false,msg:error.message})
}
}

const deleteReview = async function(req,res){
    
    try{let reviewId = req.params.reviewId.trim();
    if(!reviewId) return res.status(400).send({status:false,msg:"reviewId is not present in the params"})
    if(!ObjectId.isValid(reviewId)) return res.status(400).send({status:false,msg:"reviewId in params is invalid"})
    let review = await reviewModel.findOne({_id:reviewId,isDeleted:false})
    if(!review) return res.status(400).send({status:false,msg:"review with specific reviewId is not present"})

    let bookId = req.params.bookId.trim();
    if(!bookId) return res.status(400).send({status:false,msg:"bookId is not present in the params"})
    if(!ObjectId.isValid(bookId)) return res.status(400).send({status:false,msg:"bookId in params is invalid"})
    let book = await bookModel.findOne({_id:bookId,isDeleted:false})
    if(!book) return res.status(400).send({status:false,msg:"book with specific bookId is not present"})

    let updated = await reviewModel.findByIdAndUpdate({_id:reviewId,status:false}, {$set:{isDeleted:true}})
    let bookUpdate = await bookModel.findOneAndUpdate({_id:bookId, isDeleted:false}, {$inc: {review : -1}}) 
    return res.status(200).send({status:true,msg:'success'})
}catch(error){
    return res.status(500).send({status:false,msg:error.message})
}
}
module.exports.createReview = createReview;
module.exports.updateReview = updateReview;
module.exports.deleteReview = deleteReview