export const authorizeRoles = (...allowedRoles) =>{
    return (req,res, next) =>{

        console.log("User in role middleware:", req.userId);
        console.log("Required roles:", allowedRoles)
        if(!req.userId){
            return res.status(403).json({
                message: "Unauthorized"
            });
        }
        if(!allowedRoles.includes(req.userId.role)) {
            return res.status(403).json({
                message: "Access denied"
            });
        }
        next();
    };
};
export default authorizeRoles;