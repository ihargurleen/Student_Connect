import jwt from "jsonwebtoken";

export const protect = async (req, res, next) =>{
    try{
    

        const token = req.cookies?.token;
        if(!token){
            return res.status(401).json({
                message: "Unauthorized"
            });
        }
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.userId = decoded;
        next();
    }catch(err){
        console.log("JWT error", err.message);
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};