import jwt from "jsonwebtoken";

export const genToken =  async(id, userName, email, role) =>{
    return await jwt.sign({id: id.toString(), userName, email, role},
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );
};