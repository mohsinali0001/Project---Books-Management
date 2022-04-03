const express = require('express')
const aws = require('aws-sdk')
const router = express.Router()

const userController = require("../controller/userController")
const bookController = require('../controller/bookController')
const reviewController = require('../controller/reviewController')
const auth = require('../auth/auth')

// user api
router.post('/register',userController.createUser)
router.post('/loginUser',userController.loginUser)

// book api
router.post('/books',auth.authentication,bookController.createBooks)
router.get('/books', auth.authentication,bookController.getBooks)
router.get('/books/:bookId',auth.authentication,bookController.getBooksWithId)
router.put('/books/:bookId',auth.authentication,auth.authorisation, bookController.updateBook)
router.delete('/books/:bookId',auth.authentication,auth.authorisation,bookController.deleteBook)

// review api
router.post('/books/:bookId/review', reviewController.createReview)
router.put('/books/:bookId/review/:reviewId',reviewController.updateReview)
router.delete('/books/:bookId/review/:reviewId',reviewController.deleteReview)




// aws api
aws.config.update(
    {
        accessKeyId: "AKIAY3L35MCRVFM24Q7U",
        secretAccessKey: "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",
        region: "ap-south-1"
    }
)

let uploadFile = async (file) => {
    return new Promise( function(resolve, reject) {
        //this function will upload file to aws and return the link
        let s3 = new aws.S3({ apiVersion: "2006-03-01" }) //we will be using s3 service of aws
        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket", // HERE
            Key: "projectBookManagement/" + file.originalname, // HERE 
            Body: file.buffer
        }

      s3.upload(uploadParams, function (err, data) {
            if (err) { 
                return reject({ "error": err }) 
            }

            console.log(data)
            console.log(" file uploaded succesfully ")
            return resolve(data.Location) // HERE
          }
        )

    // let data= await s3.upload(uploadParams)
    // if (data) return data.Location
    // else return "there is an error"

    }
    )
}

router.post('/write-file-aws', async function(req,res){
    try {
        let files = req.files
        if (files && files.length > 0) {
            //upload to s3 and get the uploaded link
            // res.send the link back to frontend/postman
            let uploadedFileURL = await uploadFile(files[0])
            res.status(201).send({ msg: "file uploaded succesfully", data: uploadedFileURL })
        }
        else {
            res.status(400).send({ msg: "No file found" })
        }
    }
    catch (err) {
        res.status(500).send({ msg: err })
    }
})






module.exports=router