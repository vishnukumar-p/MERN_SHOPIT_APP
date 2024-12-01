import React, { useEffect } from 'react'
import MetaData from './layout/MetaData'
import { useGetProductsQuery } from '../redux/api/productsApi'
import ProductItem from './product/ProductItem.jsx'
import Loader from './layout/Loader.jsx';
import toast from 'react-hot-toast'
import CustomPagination from './layout/CustomPagination.jsx';
import { useSearchParams } from 'react-router-dom';
import Filters from './layout/Filters.jsx';

const Home = () => {

    let [searchParams] = useSearchParams();
    const page = searchParams.get("page") || 1;
    const keyword = searchParams.get("keyword") || "";
    const min = searchParams.get("min");
    const max = searchParams.get("max");
    const category = searchParams.get("category");
    const ratings = searchParams.get("ratings");

    const params = { page, keyword };

    min !== null && (params.min = min);
    max !== null && (params.max = max);
    category !== null && (params.category = category);
    ratings !== null && (params.ratings = ratings);

    console.log(params);
    const { data, isLoading, error, isError } = useGetProductsQuery(params)

    useEffect(() => {
        if (isError) {
            toast.error(error?.data?.message)
        }
    }, [isError])

    const columnSize = keyword?4:3;

    if (isLoading) return <Loader />
    return (
        <>
            <MetaData title={"Buy Best Products Online"} />
            <div class="container">
                <div class="row">
                    {keyword && (
                        <div className="col-6 col-md-3 mt-5">
                            <Filters/>
                        </div>
                    )}
                    <div class={keyword? "col-12 col-sm-6 col-md-9":"col-12 col-sm-6 col-md-12"}>
                        <h1 id="products_heading" class="text-secondary">
                            {keyword ? `${data?.products?.length} Products found with keyword: ${keyword}`:"Latest Products"}
                        </h1>

                        <section id="products" class="mt-5">
                            <div class="row">
                                {data?.products?.map((product) => (
                                    <ProductItem key={product._id} product={product} columnSize={columnSize}/>
                                ))}
                            </div>
                        </section>

                        <CustomPagination resPerPage={data?.resPerPage} filteredProductsCount={data?.filterCount} />
                    </div>
                </div>
            </div>
        </>
    )
}

export default Home