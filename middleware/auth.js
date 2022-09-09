import  jwt  from "jsonwebtoken";


//customised middleware=
export const auth = (request,response,next)=>{
    try{
        const token =request.header("x_auth_token");
        console.log(token);
       jwt.verify(token,process.env.SECRET_KEY);
        next();
    }catch(err){
        response.status(401).send({error:err.message});
    }
    
 }