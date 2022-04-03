const bookModel = require('../models/bookModel');
const reviewModel = require('../models/reviewModel');
const ObjectId = require('mongoose').Types.ObjectId
const userModel = require('../models/userModel')
const jwt = require('jsonwebtoken')
const  upload= require('../upload/upload')

const createBooks = async function(req,res){
    try{
    let bookData = req.body;
    if(Object.keys(bookData).length == 0) return res.status(400).send({status : false, msg : "Pleasse enter the details of the book"})

    // Validation of title
    if(!bookData.title) return res.status(400).send({status:false,msg:"enter the title of the book"})
    if(typeof(bookData.title) != typeof(' ')) return res.status(400).send({status:false,msg:`enter title in the proper format`})
    if(bookData.title.trim().length == 0) return res.status(400).send({status:false,msg:`enter title in the proper format`})
    let dupTitle = await bookModel.findOne({title:bookData.title.trim()})
    if(dupTitle) return res.status(400).send({status:false,msg:"Book with this title is already present"})

    // validation of excerpt
    if(!bookData.excerpt) return res.status(400).send({status:false,msg:"enter the excerpt of the book"})
    if(typeof(bookData.excerpt) != typeof(' ')) return res.status(400).send({status:false,msg:`enter excerpt in the proper format`})
    if(bookData.excerpt.trim().length == 0) return res.status(400).send({status:false,msg:'excerpt is not in the proper format'})
    // Validation of userId
    if(!bookData.userId) return res.status(400).send({status:false,msg:'enter the userId of the book'})
    if(!ObjectId.isValid(bookData.userId.trim())) return res.status(400).send({status:false,msg:'userId is not valid'})
    
    // authorization
    let token = req.headers["x-api-key"]
    let decodedToken = jwt.verify(token, "secret-key", {ignoreExpiration: true})
    if(bookData.userId.trim() != decodedToken.userId) return res.status(401).send({status:false, msg:'You are not authorized to make the changes'})
    let user = await userModel.findOne({_id:bookData.userId.trim()})
    if(!user) return res.status(400).send({status : false, msg: 'user with this userId doesnot exist'})

    // Validation of ISBN
    if(!bookData.ISBN) return res.status(400).send({status:false,msg:'enter the ISBN of the book'})
    if(typeof(bookData.ISBN) != typeof(' ')) return res.status(400).send({status:false,msg:`enter ISBN in the proper format`})
    if(bookData.ISBN.trim().length == 0) return res.status(400).send({status:false,msg:"enter the ISBN in proper format"})
    let dupISBN = await bookModel.findOne({ISBN : bookData.ISBN.trim()})
    if(dupISBN) return res.status(400).send({status : false, msg: 'book with this ISBN already exist'})

    // Validation of category
    if(!bookData.category) return res.status(400).send({status : false, msg: 'enter the category of the book'})
    if(typeof(bookData.category) != typeof(' ')) return res.status(400).send({status:false,msg:`enter category in the proper format`})
    if(bookData.category.trim().length == 0) return res.status(400).send({status:false, msg:"enter the category in proper format"})

    // validation of subcategory
    if(!bookData.subcategory) return res.status(400).send({status : false, msg: 'enter the subcategory of the book'})
    if(typeof(bookData.subcategory) != typeof(' ')) return res.status(400).send({status:false,msg:`enter subcategory in the proper format`})
    if(bookData.subcategory.trim().length == 0) return res.status(400).send({status:false, msg:"enter the subcategory in proper format"})

    // format of regx == "YYYY-MM-DD"
    if(!bookData.releasedAt) return res.status(400).send({status:false,msg:'enter the released date of the book'})
    if(!(/^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/.test(bookData.releasedAt.trim()))){
        return res.status(400).send({status:false,msg:"released Date is not valid"})
    }
    let files = req.files
    if (files && files.length > 0) {
            //upload to s3 and get the uploaded link
            // res.send the link back to frontend/postman
        var uploadedFileURL = await upload.uploadFile(files[0]) // used var to declare uploadedFileURl in global scope
    }
    else {
         res.status(400).send({ msg: "No file found" })
    }
    bookData.bookCover = uploadedFileURL;

    
    let data = await bookModel.create(bookData)

    return res.status(201).send({status:true,msg:'success',data : data})
}catch(error){
    return res.status(500).send({status:false,msg:error.message})
}
}


const getBooks = async function(req,res){
    try{if(Object.keys(req.query).length == 0){
        let data = await bookModel.find({isDeleted:false}).collation({locale: "en" }).sort({title:1}).select({title:1,excerpt:1,userId:1,category:1,releasedAt:1,review:1})
        if(!data) return res.status(404).send({status:false,msg:"no book found"})
        return res.status(200).send({status:true,msg:"Books list",data:data})
    }

    let filterCondition = req.query;
    let filter = ['userId','category','subcategory']
    for(let i=0;i<Object.keys(filterCondition).length;i++){
        if(!filter.includes(Object.keys(filterCondition)[i])){
            return res.status(400).send({status:false,msg:'wrong filter condition present'})
        }
    }
   if(Object.keys(filterCondition).includes('userId')){ if(!ObjectId.isValid(filterCondition.userId)) return res.status(400).send({status:false,msg:'userId is not valid'})}
    //  userId validatiion
    filterCondition.isDeleted = false;
    let data = await bookModel.find(filterCondition).collation({locale: "en" }).sort({title:1}).select({title:1,excerpt:1,userId:1,category:1,releasedAt:1,review:1})
    if(data.length == 0) return res.status(404).send({status:false,msg:"no book found"})
    return res.status(200).send({status:true,msg:"Book List",data:data})
}catch(error){
    return res.status(500).send({status:false,msg:error.message})
}
}

const getBooksWithId = async function(req,res){
    try{let bookId = req.params.bookId;                                                     
    if(!bookId) return res.status(400).send({status:false,msg:'enter the book id to find'})
    if(!ObjectId.isValid(bookId.trim())) return res.status(400).send({status:false,msg:'bookId is not valid'})
    let data = await bookModel.findOne({_id:bookId.trim(),isDeleted:false})
    if(!data) return res.status(400).send({status:false,msg:'book with bookId was not found'})
    let review = await reviewModel.find({bookId:bookId.trim(),isDeleted:false})
    data = data.toObject() // mongoDB gave us a bison type of Object
    data.reviewsData = review
    //let book = {...data,reviesData:review}
    return res.status(200).send({status:true,msg:"Book List",data:data})
}catch(error){
    return res.status(500).send({status:false,msg:error.message})
}

}
// - title
//   - excerpt
//   - release date
//   - ISBN
const updateBook = async function(req,res){
    try{let bookId = req.params.bookId.trim();
    if(!bookId) return res.status(400).send({status:false,msg:'enter the book id to find'})
    if(!ObjectId.isValid(bookId)) return res.status(400).send({status:false,msg:'bookId is not valid'})
    let data = await bookModel.findOne({_id:bookId,isDeleted:false})
    if(!data) return res.status(400).send({status:false,msg:'book with bookId was not found'})
    
    let updateDetails = req.body;
    if(Object.keys(updateDetails).length == 0) return res.status(400).send({staus:false, msg:"enter the details to update"})
    if(Object.keys(updateDetails).includes('title')){
        if(updateDetails.title.trim().length == 0) return res.status(400).send({status:false,msg:"unable to assign blank value to title"})
        let dupTitle = await bookModel.findOne({title:updateDetails.title.trim()})
        if(dupTitle) return res.status(400).send({status:false,msg:`book with (${updateDetails.title}) title is already present.`})
    }

    if(Object.keys(updateDetails).includes('ISBN')){
        if(updateDetails.ISBN.trim().length == 0) return res.status(400).send({status:false,msg:"unable to assign blank value to ISBN"})
        let dupISBN = await bookModel.findOne({ISBN:updateDetails.ISBN.trim()})
        if(dupISBN) return res.status(400).send({status:false,msg:`book with (${updateDetails.ISBN}) isbn is already present.`})
    }
    if(Object.keys(updateDetails).includes('releasedAt')){
        if(!(/^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/.test(updateDetails.releasedAt.trim()))){
            return res.status(400).send({status:false,msg:"released Date is not valid"})
        }
    }
    let updatedBook = await bookModel.findOneAndUpdate({_id:bookId,isDeleted:false}, {$set:{title:updateDetails.title, excerpt:updateDetails.excerpt,releasedAt:updateDetails.releasedAt,ISBN:updateDetails.ISBN}},{new:true})
    let review = await reviewModel.find({bookId:bookId,isDeleted:false})
    updatedBook = updatedBook.toObject()
    updatedBook.reviesData = review
    //let book = {...data,reviesData:review}
    return res.status(200).send({status:true,msg:"Book List",data:updatedBook})
}catch(error) {
    return res.status(500).send({status:false,msg:error.message})
}
}

const deleteBook = async function(req,res){
    try{let bookId = req.params.bookId.trim();
    if(!bookId) return res.status(400).send({status:false,msg:'enter the book id to find'})
    if(!ObjectId.isValid(bookId)) return res.status(400).send({status:false,msg:'bookId is not valid'})
    let book = await bookModel.findOne({_id:bookId, isDeleted:false})
    if(!book) return res.status(400).send({status:false,msg:'unable to find book with given bookId'})
    let bookDel = await bookModel.findOneAndUpdate({_id:bookId, isDeleted:false},{isDeleted:true,deletedAt:new Date})
    return res.status(200).send({status:true,msg:'success'})
}catch(error){
    return res.status(500).send({status:false,msg:error.message})
}
}

module.exports.createBooks = createBooks
module.exports.getBooks = getBooks
module.exports.getBooksWithId = getBooksWithId
module.exports.updateBook = updateBook
module.exports.deleteBook = deleteBook
