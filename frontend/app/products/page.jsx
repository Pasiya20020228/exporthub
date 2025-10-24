'use client';

import useSWR from 'swr';
import { useMemo, useState } from 'react';

import StatusBanner from '../components/StatusBanner';
import { apiRequest } from '../lib/api';
import { useSession } from '../providers/SessionProvider';

const fetcher = ([path, token]) => apiRequest(path, token ? { token } : {});

export default function ProductsPage() {
  const { isAuthenticated, token, user } = useSession();
  const [status, setStatus] = useState(null);
  const [orderForm, setOrderForm] = useState({ product_id: '', quantity: 1 });
  const [submitting, setSubmitting] = useState(false);

  const {
    data: products,
    error: productsError,
    isLoading: loadingProducts,
    mutate: refreshProducts,
  } = useSWR(['/products/', token ?? null], fetcher);

  const {
    data: orders,
    error: ordersError,
    isLoading: loadingOrders,
    mutate: refreshOrders,
  } = useSWR(isAuthenticated ? ['/orders/', token] : null, fetcher);

  const productOptions = useMemo(() => {
    if (!products) return [];
    return products.map((product) => ({
      value: product.id,
      label: `${product.name} — $${Number(product.price).toFixed(2)}`,
    }));
  }, [products]);

  const updateField = (field) => (event) => {
    setOrderForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleOrderSubmit = async (event) => {
    event.preventDefault();
    setStatus(null);

    if (!isAuthenticated) {
      setStatus({ type: 'error', message: 'Please log in before placing an order.' });
      return;
    }

    if (!orderForm.product_id) {
      setStatus({ type: 'error', message: 'Select a product to purchase.' });
      return;
    }

    const quantity = Number(orderForm.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      setStatus({ type: 'error', message: 'Enter a valid quantity of at least 1.' });
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest('/orders/', {
        method: 'POST',
        token,
        body: {
          product_id: Number(orderForm.product_id),
          quantity,
        },
      });
      setStatus({ type: 'success', message: 'Your order has been placed!' });
      setOrderForm({ product_id: '', quantity: 1 });
      const refreshes = [refreshProducts()];
      if (refreshOrders) {
        refreshes.push(refreshOrders());
      }
      await Promise.all(refreshes);
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section">
      <div className="section-header">
        <h2>Marketplace</h2>
        <p>Discover export-ready inventory and submit purchase requests instantly.</p>
      </div>

      <StatusBanner status={status} />

      <div className="card-grid" style={{ marginBottom: '3rem' }}>
        {loadingProducts && !products ? (
          <article className="card">Loading product catalogue…</article>
        ) : productsError ? (
          <article className="card">Failed to load products: {productsError.message}</article>
        ) : products && products.length > 0 ? (
          products.map((product) => (
            <article key={product.id} className="card">
              <strong>{product.name}</strong>
              <small>Seller: {product.seller_name}</small>
              <p>{product.description}</p>
              <strong>${Number(product.price).toFixed(2)}</strong>
            </article>
          ))
        ) : (
          <article className="card">No products listed yet. Administrators can add new listings from the dashboard.</article>
        )}
      </div>

      <div className="hero-card" style={{ marginBottom: '3rem' }}>
        <h3>Place an order</h3>
        <p>Orders are tied to your account profile for easy fulfilment tracking.</p>
        <form onSubmit={handleOrderSubmit}>
          <label>
            Select a product
            <select value={orderForm.product_id} onChange={updateField('product_id')} required>
              <option value="">Choose a product</option>
              {productOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Quantity
            <input
              type="number"
              min={1}
              step={1}
              value={orderForm.quantity}
              onChange={updateField('quantity')}
              required
            />
          </label>
          <button type="submit" className="primary" disabled={submitting}>
            {submitting ? 'Submitting order…' : 'Confirm order'}
          </button>
        </form>
      </div>

      <div className="table-card">
        <div className="section-header" style={{ marginBottom: '1rem' }}>
          <h3>Recent orders</h3>
          <p>{user ? `Orders placed by ${user.full_name}` : 'Log in to view your order history.'}</p>
        </div>
        {isAuthenticated ? (
          loadingOrders && !orders ? (
            <p>Loading your recent orders…</p>
          ) : ordersError ? (
            <p className="status-banner error">Unable to load orders: {ordersError.message}</p>
          ) : orders && orders.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Total price</th>
                  <th>Placed on</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const product = products?.find((item) => item.id === order.product_id);
                  return (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{product ? product.name : `Product ${order.product_id}`}</td>
                      <td>{order.quantity}</td>
                      <td>${Number(order.total_price).toFixed(2)}</td>
                      <td>{new Date(order.created_at).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">You have not placed any orders yet.</div>
          )
        ) : (
          <div className="empty-state">Log in or create an account to view your orders.</div>
        )}
      </div>
    </section>
  );
}
