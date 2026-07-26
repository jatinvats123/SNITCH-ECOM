import { useEffect, useState } from "react";
import { useProduct } from "./useProduct";

const emptyForm = () => ({
  price: { amount: "", currency: "INR" },
  stock: "",
  images: [],
  attributes: [{ key: "", value: "" }],
});

// All the data + state + handlers for the seller product-detail page. Keeping the
// logic here leaves the page and its presentational components thin.
export function useSellerProductDetail(productId) {
  const {
    handleGetProductById,
    handleCreateVariant,
    handleUpdateVariantStock,
    handleDeleteVariant,
  } = useProduct();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm());
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [stockEdits, setStockEdits] = useState({}); // variantId -> draft stock value
  const [savingStock, setSavingStock] = useState({}); // variantId -> bool

  const fetchProduct = async () => {
    setLoading(true);
    const data = await handleGetProductById(productId);
    setProduct(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const setFormField = (path, value) => {
    setForm((prev) => {
      const next = structuredClone(prev);
      const keys = path.split(".");
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const addAttribute = () =>
    setForm((f) => ({ ...f, attributes: [...f.attributes, { key: "", value: "" }] }));
  const removeAttribute = (i) =>
    setForm((f) => ({ ...f, attributes: f.attributes.filter((_, idx) => idx !== i) }));
  const setAttr = (i, field, val) =>
    setForm((f) => {
      const attrs = [...f.attributes];
      attrs[i] = { ...attrs[i], [field]: val };
      return { ...f, attributes: attrs };
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);

    const attrMap = {};
    form.attributes.forEach(({ key, value }) => {
      if (key.trim()) attrMap[key.trim()] = value.trim();
    });

    const formData = new FormData();
    formData.append("price[amount]", form.price.amount);
    formData.append("price[currency]", form.price.currency);
    formData.append("stock", Number(form.stock) || 0);
    formData.append("attributes", JSON.stringify(attrMap));
    form.images.forEach((file) => formData.append("images", file));

    try {
      await handleCreateVariant(productId, formData);
      setForm(emptyForm());
      setShowForm(false);
      await fetchProduct();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const saveStock = async (variantId) => {
    const val = stockEdits[variantId];
    if (val === undefined || val === "") return;
    setSavingStock((s) => ({ ...s, [variantId]: true }));
    try {
      await handleUpdateVariantStock(productId, variantId, Number(val));
      await fetchProduct();
      setStockEdits((s) => {
        const n = { ...s };
        delete n[variantId];
        return n;
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSavingStock((s) => ({ ...s, [variantId]: false }));
    }
  };

  const removeVariant = async (variantId) => {
    try {
      await handleDeleteVariant(productId, variantId);
      await fetchProduct();
    } catch (err) {
      console.error(err);
    }
  };

  return {
    product,
    loading,
    form,
    creating,
    showForm,
    stockEdits,
    savingStock,
    setShowForm,
    setStockEdits,
    setFormField,
    addAttribute,
    removeAttribute,
    setAttr,
    handleSubmit,
    saveStock,
    removeVariant,
  };
}
