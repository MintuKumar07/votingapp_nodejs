const jwt=require('jsonwebtoken');

const jwtAuthMiddleware=(req,res,next)=>{

    //Check if the request contains the authorization header
    const authorization=req.headers.authorization
    if(!authorization) return res.status(401).json({error: 'Token not found'});



    //Extract the jwt token from the request headers
    const token=req.headers.authorization.split(' ')[1];
    if(!token) return res.status(401).json({error: 'Unothorized'});

    try{
        //Verify the token
        const decoded=jwt.verify(token,process.env.JWT_SECRET);

        //Attach the user info to the request object 
        req.user=decoded;
        next();
    }
    catch(err){
        console.log(err);
        res.status(401).json({error: 'Invalid token'});
    }
}

//Function to generate the JWT token
const generateToken=(userData)=>{
    //Generate a new JWT token using the user data
    return jwt.sign(userData,process.env.JWT_SECRET,{expiresIn: 30000});
}

module.exports={jwtAuthMiddleware,generateToken};