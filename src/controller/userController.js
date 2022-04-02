const userModel = require('../models/userModel')
const jwt = require('jsonwebtoken')


const createUser = async function(req,res){
    // Check req.body is empty or not
    try{if(Object.keys(req.body).length == 0) return res.status(400).send({status : false, msg : "please enter the details of the user"})
    
    const userData = req.body
    //check title
    if(!userData.title) return res.status(400).send({status:false,msg:`title of the user is not present`})
    if(userData.title.trim().length == 0) return res.status(400).send({status:false,msg:"enter the title in proper format"})
    // if title is present should be from ["Mr", "Mrs", "Miss"]
    let title = ["Mr", "Mrs", "Miss"] 
    if(!title.includes(userData.title.trim())) return res.status(400).send({status: false, msg : "title should be from [Mr, Mrs, Miss]"})
    //check name
    if(!userData.name) return res.status(400).send({status:false,msg:"name of the user is not present"})
    if(userData.name.trim().length == 0) return res.status(400).send({status:false,msg:"enter the name in proper format"})
    //check phone number
    if(!userData.phone) return res.status(400).send({status:false,msg:"phone no. of the user is not present"})
    // validation of phone number
    if(!(/^([+]\d{2})?\d{10}$/.test(userData.phone.trim()))){
        return res.status(400).send({status:false,msg:"phone no. is not valid"})
    }
    //check phone no. is already registered or not 
    let dupPhone = await userModel.findOne({phone : userData.phone.trim()})
    if(dupPhone) return res.status(400).send({status: false, msg: `${userData.phone} is already registered`})
    //check email
    if(!userData.email) return res.status(400).send({status:false,msg:"email of the user is not present"})
    // validation of email
    if(!(/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/.test(userData.email.trim()))) return res.status(400).send({status:false,msg:"email ID is not valid"})
    //check email is already registered or not
    let dupEmail = await userModel.findOne({email : userData.email.trim()})
    if(dupEmail) return res.status(400).send({status: false, msg: `${userData.email} is already registered`})
    // check password
    if(!userData.password) return res.status(400).send({status:false,msg:"password of the user is not present"})
    // validation of password
    let validPass = userData.password.trim().length >=8 && userData.password.trim().length <=15
    if(!validPass) return res.status(400).send({status:false, msg:"Password length should be between 8 to 15"})
    
    if(Object.keys(userData).includes('address')){
     if(Object.keys(userData.address).includes('pincode')){
       if(userData.address.pincode.trim().length !=6) return res.status(400).send({status:false,msg:'pincode length should be 6 digits'})
     }
    } 

    let data = await userModel.create(userData);
    return res.status(201).send({status : true, msg: "success",  data : data})
}catch(error) {
    return res.status(500).send({status:false, msg: error.message})
}
}

const loginUser = async function(req,res){
    try{
        let userName = req.body.email;
        let password = req.body.password;
        if(!userName || !password) return res.status(400).send({status:false, msg: "username or password is not present"})
        let user = await userModel.findOne({ email:userName.trim(), password: password.trim() });
        if (!user)
          return res.status(400).send({status: false,msg: " EmailId or the password is not correct"});
        let token = jwt.sign(
          { exp: Math.floor(Date.now() / 1000) + (60*30),
          userId: user._id.toString()
          },
          "secret-key"
        );
        res.setHeader("x-api-key", token);
        res.status(200).send({ status: true, data: token });
      }catch(err){
        res.status(500).send({status:false ,Error:err.message});
      }
}



module.exports.createUser = createUser
module.exports.loginUser = loginUser
