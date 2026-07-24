import {
  createProduct,
  getSellerProducts,
  getAllProducts,
  getProductDetail,
  createVariant,
  updateVariantStock,
  deleteVariant,
  deleteProduct,
} from "../services/product.api";
import { useDispatch } from "react-redux";
import { setSellerProducts, setProducts, appendProducts } from "../state/product.slice";

export const useProduct = () => {
  const dispatch = useDispatch();
  const handleCreateProduct = async (formData) => {
    const data = await createProduct(formData);

    return data;
  };
  const handleGetProducts = async () => {
    const data = await getSellerProducts();
    dispatch(setSellerProducts(data.products));
    return data.products;
  };
  const handleGetAllProducts = async (filters = {}) => {
    const data = await getAllProducts(filters);
    dispatch(setProducts(data.products));
    return data;
  };
  const handleLoadMoreProducts = async (filters = {}) => {
    const data = await getAllProducts(filters);
    dispatch(appendProducts(data.products));
    return data;
  };
  const handleGetProductById = async (productId) => {
    const data = await getProductDetail(productId);
    return data.product;
  };
  const handleCreateVariant = async (productId, variantData) => {
    const data = await createVariant(productId, variantData);
    return data;
  };
  const handleUpdateVariantStock = async (productId, variantId, stock) => {
    const data = await updateVariantStock(productId, variantId, stock);
    return data;
  };
  const handleDeleteVariant = async (productId, variantId) => {
    const data = await deleteVariant(productId, variantId);
    return data;
  };
  const handleDeleteProduct = async (productId) => {
    const data = await deleteProduct(productId);
    return data;
  };
  return {
    handleCreateProduct,
    handleGetProducts,
    handleGetAllProducts,
    handleLoadMoreProducts,
    handleGetProductById,
    handleCreateVariant,
    handleUpdateVariantStock,
    handleDeleteVariant,
    handleDeleteProduct,
  };
};
