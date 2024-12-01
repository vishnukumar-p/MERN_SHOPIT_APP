import ErrorHandler from "../utils/errorHandler.js";

export default (err,req,res,next) => {
    let error = {
        statusCode :err?.statusCode || 500,
        message: err?.message || 'Internal Server Error',
    };

    //Handle Invalid Mongoose ID Error
    if(err.name === 'CastError'){
        const message = `Resoure not found. Invalid: ${err?.path}`;
        error = new ErrorHandler(message,404);
    }

    //Handle wrong JWT error
    if(err.name === "JsonWebTokenError"){
        const message = `Json web token is invalid. Try again!`;
        error = new ErrorHandler(message,400);
    }
    if(err.name === "TokenExpiredError"){
        const message = `Json web token is expired. Try again!`;
        error = new ErrorHandler(message,400);
    }

    //Handle  Mongoose duplicate key Error
    if(err.code === 11000){
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        error = new ErrorHandler(message,404);
    }

    //Handle Validation Error
    if(err.name === 'ValidationError'){
        const message = Object.values(err.errors).map((value)=> value.message);
        error = new ErrorHandler(message,400);
    }

    if(process.env.NODE_ENV === 'DEVELOPMENT'){
        res.status(error.statusCode).json({
            message: error.message,
            error: err,
            stack: err?.stack,
        })
    }

    if(process.env.NODE_ENV === 'PRODUCTION'){
        res.status(error.statusCode).json({
            message: error.message,
        })
    }
}