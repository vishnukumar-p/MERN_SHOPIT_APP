import catchAsyncErrors from '../middlewares/catchAsyncErrors.js';
import Product from '../models/product.js'
import Order from '../models/order.js'
import APIFilters from '../utils/apiFilters.js';
import ErrorHandler from '../utils/errorHandler.js';
import { delete_file, upload_file } from '../utils/cloudinary.js';
//Create new Product => /api/v1/products
export const getProducts = catchAsyncErrors(async (req,res,next) => {
    const resPerPage = 4;
    const apiFilters = new APIFilters(Product,req.query).search().filter();
    let products = await apiFilters.query;
    let filterCount = products.length;
    apiFilters.pagination(resPerPage);
    products = await apiFilters.query.clone();
    res.status(200).json({
        resPerPage,
        filterCount,
        products,
    });
});

//Create new Product => /api/v1/admin/products
export const newProduct = catchAsyncErrors(async (req,res,next) => {
    req.body.user = req.user._id;
    const product = await Product.create(req.body)
    res.status(200).json({
        product,
    })
});

//Get single Product => /api/v1/products/:id
export const getProductDetails = catchAsyncErrors(async (req,res,next) => {
    const product = await Product.findById(req?.params?.id).populate('reviews.user');

    if(!product){
       return next(new ErrorHandler("Product not found",400));
    }

    res.status(200).json({
        product,
    })
});

//Update product details => /api/v1/admin/products/:id

export const updateProduct = catchAsyncErrors(async (req,res,next) => {
    let product = await Product.findById(req?.params?.id);

    if(!product){
        return next(new ErrorHandler("Product not found",400)); 
    }

    product = await Product.findByIdAndUpdate(req?.params?.id, req.body, {new: true})

    res.status(200).json({
        product,
    })
});

//Delete product details => /api/v1/products/:id

export const deleteProduct = catchAsyncErrors(async (req,res) => {
    const product = await Product.findById(req?.params?.id);

    if(!product){
        return next(new ErrorHandler("Product not found",400)); 
    }

    for(let i = 0;i<product?.images?.length;i++){
        await delete_file(product?.images[i]?.public_id);
    }

    await product.deleteOne();

    res.status(200).json({
        message: "Product deleted",
    })
});

//Create/Update Product Review => /api/v1/reviews/

export const createProductReview = catchAsyncErrors(async (req,res,next) => {
    const {rating,comment,productId} = req.body

    const review = {
        user: req?.user?._id,
        rating:Number(rating),
        comment,
    }

    const product = await Product.findById(productId);

    if(!product){
        return next(new ErrorHandler("Product not found",400)); 
    }

    const isReviewed = product?.reviews?.find((r) => r.user.toString() === req?.user?._id.toString());

    if(isReviewed){
        product.reviews.forEach((review) => {
            if(review?.user?.toString() === req?.user?._id.toString()){
                review.comment = comment;
                review.rating = rating;
            }
        })
    }else{
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    product.ratings = product.reviews.reduce((acc,item) => item.rating + acc, 0)/product.reviews.length;
    await product.save({validateBeforeSave:false});

    res.status(200).json({
        success:true,
    })
})

//Get All reviews of a product => /api/v1/reviews

export const getProductReviews = catchAsyncErrors(async (req,res,next) => {
    const product = await Product.findById(req.query.id).populate("reviews.user");
    
    if(!product){
        return next(new ErrorHandler("Product not found",404)); 
    }

    res.status(200).json({
        reviews: product.reviews,
    })
})


//Delete Product Review => /api/v1/admin/reviews/

export const deleteReview = catchAsyncErrors(async (req,res,next) => {
    

    let product = await Product.findById(req.query.productId);
    console.log("/////////////////////////");
    console.log(product)

    if(!product){
        return next(new ErrorHandler("Product not found",400)); 
    }

    const reviews = product?.reviews?.filter((r) => r._id.toString() !== req?.query?.id.toString());


    const numOfReviews = reviews.length;

    const ratings = numOfReviews === 0 ? 0:reviews.reduce((acc,item) => item.rating + acc,0)/numOfReviews;
    
    product = await Product.findByIdAndUpdate(req.query.productId, {reviews,numOfReviews,ratings},{new:true});

    res.status(200).json({
        success:true,
        product,
    })
})

//Can user review => /api/v1/can_review

export const canUserReview = catchAsyncErrors(async (req,res,next) => {
    
    const orders = await Order.find({
        user: req?.user?._id,
        "orderItems.product":req?.query?.productId,
    });

    if(orders.length === 0){
        return res.status(200).json({
            canReview: false
        })
    }
    res.status(200).json({
        canReview: true,
    })
});

//Get Products -Admin => /api/v1/admin/products
export const getAdminProducts = catchAsyncErrors(async (req,res,next) => {
    const products = await Product.find();

    res.status(200).json({
        products,
    })
});

//Upload product Images => /api/v1/admin/products/:id/upload_images

export const uploadProductImages = catchAsyncErrors(async (req,res,next) => {
    let product = await Product.findById(req?.params?.id);

    if(!product){
        return next(new ErrorHandler("Product not found",404));
    }

    const uploader = async (image) => upload_file(image,"shopit/products");
    const urls = await Promise.all((req?.body?.images).map(uploader));
    product?.images?.push(...urls)
    await product?.save()
    
    res.status(200).json({
        product,
    })
    
})

//delete product Images => /api/v1/admin/products/:id/delete_image

export const deleteProductImage = catchAsyncErrors(async (req,res) => {
    let product = await Product.findById(req?.params?.id);

    if(!product){
        return next(new ErrorHandler("Product not found",404));
    }

    const isDeleted = await delete_file(req?.body?.imgId);

    if(isDeleted){
        product.images = product?.images?.filter((img) => img.public_id !== req?.body?.imgId);
        await product?.save()
    }
    
    res.status(200).json({
        product,
    })
    
})

