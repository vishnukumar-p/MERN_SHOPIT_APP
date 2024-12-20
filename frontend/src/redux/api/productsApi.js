import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const productApi = createApi({
    reducerPath: 'productApi',
    baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
    tagTypes: ['Product', 'AdminProduct', 'Reviews'],
    endpoints: (builder) => ({
        getProducts: builder.query({
            query: (params) => ({
                url: "/products",
                params: {
                    page: params?.page,
                    keyword: params?.keyword,
                    "price[gte]": params?.min,
                    "price[lte]": params?.max,
                    category: params?.category,
                    "ratings[gte]": params?.ratings,
                }
            })
        }),
        getProductDetails: builder.query({
            query: (id) => ({
                url: `/products/${id}`,
            }),
            providesTags: ['Product']
        }),
        submitReview: builder.mutation({
            query: (body) => ({
                url: `/reviews`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ['Product']
        }),
        canUserReview: builder.query({
            query: (productId) => ({
                url: `/can_review?productId=${productId}`,
            }),
        }),
        getAdminProducts: builder.query({
            query: () => ({
                url: `/admin/products`,
            }),
            providesTags: ['AdminProduct']
        }),
        createProduct: builder.mutation({
            query: (body) => ({
                url: `/admin/products`,
                method: "POST",
                body,
            }),
            invalidatesTags: ['AdminProduct']
        }),
        updateProduct: builder.mutation({
            query: ({ id, body }) => ({
                url: `/admin/products/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ['Product', 'AdminProduct']
        }),
        uploadProductImages: builder.mutation({
            query: ({ id, body }) => ({
                url: `/admin/products/${id}/upload_images`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ['Product', 'AdminProduct']
        }),
        deleteProductImage: builder.mutation({
            query: ({ id, body }) => ({
                url: `/admin/products/${id}/delete_image`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ['Product', 'AdminProduct']
        }),
        deleteProduct: builder.mutation({
            query: ({ id }) => ({
                url: `/admin/products/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ['AdminProduct']
        }),
        getProductReviews: builder.query({
            query: (productId) => ({
                url: `/reviews?id=${productId}`,
            }),
            providesTags: ['Reviews']
        }),
        deleteReview: builder.mutation({
            query({ productId, id }) {
                return {
                    url: `/admin/reviews?productId=${productId}&id=${id}`,
                    method: "DELETE",
                }
            },
            invalidatesTags: ['Reviews']
        }),
    })
});

export const { useDeleteReviewMutation, useLazyGetProductReviewsQuery, useDeleteProductMutation, useDeleteProductImageMutation, useUploadProductImagesMutation, useUpdateProductMutation, useCreateProductMutation, useGetAdminProductsQuery, useCanUserReviewQuery, useGetProductsQuery, useGetProductDetailsQuery, useSubmitReviewMutation } = productApi;