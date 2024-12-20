import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncErrors from "./catchAsyncErrors.js";
import jwt from "jsonwebtoken"
import User from "../models/user.js"

//checks if user is authenticated or not
export const isAuthenticatedUser = catchAsyncErrors(async (req,res,next)=>{
    const {token} = req.cookies;

    if(!token){
        return next(new ErrorHandler("Login First to access this resource", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
})

//authorize user roles
export const authorizeRoles = (...roles) => {
    return (req,res,next) => {
        if(!roles.includes(req.user.role)){
            return next(new ErrorHandler(`Role ${req.user.role} is not allowed to access this resource`, 403));
        }
        next();
    };
};