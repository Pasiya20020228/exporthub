'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');

const buildUrl = (path) => `${API_BASE}${path}`;

const fetcher = async (url) => {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message = payload?.detail || 'Unexpected API error';
    throw new Error(message);
  }
  return response.json();
};

export default function HomePage() {
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    sellerName: '',
  });
  const [orderForm, setOrderForm] = useState({
    productId: '',
    buyerName: '',
    quantity: 1,
  });
  const [statusMessage, setStatusMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: products,
    error: productsError,
    isLoading: productsLoading,
    mutate: refreshProducts,
  } = useSWR(buildUrl('/products/'), fetcher);

  const {
    data: orders,
    error: ordersError,
    isLoading: ordersLoading,
    mutate: refreshOrders,
  } = useSWR(buildUrl('/orders/'), fetcher);

  const productOptions = useMemo(() => {
    return (products || []).map((product) => ({
      value: product.id,
      label: `${product.name} — $${Number(product.price).toFixed(2)}`,
    }));
  }, [products]);

  const productLookup = useMemo(() => {
    const mapping = new Map();
    (products || []).forEach((product) => mapping.set(product.id, product));
    return mapping;
  }, [products]);

  const resetStatus = () => setStatusMessage(null);

  const handleProductSubmit = async (event) => {
    event.preventDefault();
    resetStatus();

    if (!productForm.name || !productForm.description || !productForm.sellerName) {
      setStatusMessage({ type: 'error', message: 'Fill in all product fields before submitting.' });
      return;
    }

    const priceValue = Number(productForm.price);
    if (Number.isNaN(priceValue) || priceValue < 0) {
      setStatusMessage({ type: 'error', message: 'Enter a valid price for the product.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: productForm.name,
        description: productForm.description,
        seller_name: productForm.sellerName,
        price: priceValue.toFixed(2),
      };
      const response = await fetch(buildUrl('/products/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload?.detail || 'Unable to create product.');
      }
      await refreshProducts();
      setProductForm({ name: '', description: '', price: '', sellerName: '' });
      setStatusMessage({ type: 'success', message: 'Product listed successfully!' });
    } catch (error) {
      setStatusMessage({ type: 'error', message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOrderSubmit = async (event) => {
    event.preventDefault();
    resetStatus();

    if (!orderForm.productId) {
      setStatusMessage({ type: 'error', message: 'Select a product to purchase.' });
      return;
    }
    if (!orderForm.buyerName) {
      setStatusMessage({ type: 'error', message: 'Enter the buyer name to place an order.' });
      return;
    }
    const quantityValue = Number(orderForm.quantity);
    if (!Number.isInteger(quantityValue) || quantityValue <= 0) {
      setStatusMessage({ type: 'error', message: 'Order quantity must be at least 1.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        product_id: Number(orderForm.productId),
        buyer_name: orderForm.buyerName,
        quantity: quantityValue,
      };
      const response = await fetch(buildUrl('/orders/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload?.detail || 'Unable to create order.');
      }
      await Promise.all([refreshOrders(), refreshProducts()]);
      setOrderForm({ productId: '', buyerName: '', quantity: 1 });
      setStatusMessage({ type: 'success', message: 'Order placed successfully!' });
    } catch (error) {
      setStatusMessage({ type: 'error', message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main>
      <section className="hero">
        <div className="hero-content">
          <h1>ExportHub Marketplace</h1>
          <p>
            Welcome to ExportHub — a digital trade marketplace where global buyers and sellers
            meet. Discover curated export-ready products or list your own catalogue in minutes.
          </p>
        </div>
        <div className="hero-card">
          <h2>Start trading instantly</h2>
          <p>
            List your products, showcase pricing, and receive purchase requests without leaving the
            platform.
          </p>
          <ul>
            <li>✅ Create product listings with pricing and descriptions</li>
            <li>✅ Accept orders directly from interested buyers</li>
            <li>✅ Manage activity with a lightweight SQLite database</li>
          </ul>
        </div>
      </section>

      {statusMessage && (
        <div
          style={{
            background: statusMessage.type === 'error' ? '#fee2e2' : '#dcfce7',
            color: statusMessage.type === 'error' ? '#b91c1c' : '#166534',
            borderRadius: '0.75rem',
            padding: '1rem 1.5rem',
            marginBottom: '2rem',
          }}
        >
          {statusMessage.message}
        </div>
      )}

      <section className="section">
        <h2>List a product</h2>
        <form onSubmit={handleProductSubmit}>
          <label>
            Product name
            <input
              type="text"
              value={productForm.name}
              onChange={(event) => setProductForm((state) => ({ ...state, name: event.target.value }))}
              placeholder="Premium cotton shirts"
              required
            />
          </label>
          <label>
            Seller name
            <input
              type="text"
              value={productForm.sellerName}
              onChange={(event) =>
                setProductForm((state) => ({ ...state, sellerName: event.target.value }))
              }
              placeholder="Global Textiles Co."
              required
            />
          </label>
          <label>
            Price (USD)
            <input
              type="number"
              min="0"
              step="0.01"
              value={productForm.price}
              onChange={(event) => setProductForm((state) => ({ ...state, price: event.target.value }))}
              placeholder="1200.00"
              required
            />
          </label>
          <label>
            Description
            <textarea
              rows={4}
              value={productForm.description}
              onChange={(event) =>
                setProductForm((state) => ({ ...state, description: event.target.value }))
              }
              placeholder="Detail the product specifications, packaging, and export terms."
              required
            />
          </label>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Publishing…' : 'Publish product'}
          </button>
        </form>
      </section>

      <section className="section">
        <h2>Available products</h2>
        {productsLoading && <p>Loading product catalogue…</p>}
        {productsError && <p>Unable to load products: {productsError.message}</p>}
        {!productsLoading && !productsError && products?.length === 0 && (
          <p>No listings yet. Be the first to publish a product.</p>
        )}
        {!productsLoading && !productsError && products?.length > 0 && (
          <div className="card-grid">
            {products.map((product) => (
              <article key={product.id} className="card">
                <small>Seller: {product.seller_name}</small>
                <strong>{product.name}</strong>
                <p>{product.description}</p>
                <p>
                  <strong>${Number(product.price).toFixed(2)}</strong>
                </p>
                <small>
                  Listing ID: {product.id} • Added {new Date(product.created_at).toLocaleString()}
                </small>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <h2>Place an order</h2>
        <form onSubmit={handleOrderSubmit}>
          <label>
            Product
            <select
              value={orderForm.productId}
              onChange={(event) =>
                setOrderForm((state) => ({ ...state, productId: event.target.value }))
              }
              required
            >
              <option value="">Select a product</option>
              {productOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Buyer name
            <input
              type="text"
              value={orderForm.buyerName}
              onChange={(event) =>
                setOrderForm((state) => ({ ...state, buyerName: event.target.value }))
              }
              placeholder="Import Hub LLC"
              required
            />
          </label>
          <label>
            Quantity
            <input
              type="number"
              min="1"
              value={orderForm.quantity}
              onChange={(event) =>
                setOrderForm((state) => ({ ...state, quantity: event.target.value }))
              }
              required
            />
          </label>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Processing…' : 'Submit order'}
          </button>
        </form>
      </section>

      <section className="section">
        <h2>Recent orders</h2>
        {ordersLoading && <p>Loading buyer activity…</p>}
        {ordersError && <p>Unable to load orders: {ordersError.message}</p>}
        {!ordersLoading && !ordersError && orders?.length === 0 && <p>No orders yet.</p>}
        {!ordersLoading && !ordersError && orders?.length > 0 && (
          <div className="card-grid">
            {orders.map((order) => (
              <article key={order.id} className="card">
                <strong>Order #{order.id}</strong>
                <p>
                  Buyer: {order.buyer_name}
                  <br />Quantity: {order.quantity}
                </p>
                <p>
                  Product:{' '}
                  {productLookup.get(order.product_id)?.name || `#${order.product_id}`}
                </p>
                <p>
                  Total value: <strong>${Number(order.total_price).toFixed(2)}</strong>
                </p>
                <small>Placed {new Date(order.created_at).toLocaleString()}</small>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
