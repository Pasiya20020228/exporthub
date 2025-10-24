'use client';

import useSWR from 'swr';
import { useMemo, useState } from 'react';

import StatusBanner from '../components/StatusBanner';
import { apiRequest } from '../lib/api';
import { useSession } from '../providers/SessionProvider';

const fetcher = ([path, token]) => apiRequest(path, token ? { token } : {});

const emptyForm = {
  id: null,
  name: '',
  description: '',
  price: '',
  seller_name: '',
};

export default function DashboardPage() {
  const { isAuthenticated, token, user } = useSession();
  const isAdmin = user?.role === 'admin';
  const [status, setStatus] = useState(null);
  const [productForm, setProductForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const {
    data: products,
    error: productsError,
    isLoading: loadingProducts,
    mutate: refreshProducts,
  } = useSWR(['/products/', token ?? null], fetcher);

  const {
    data: orders,
    mutate: refreshOrders,
  } = useSWR(isAuthenticated ? ['/orders/', token] : null, fetcher);

  const orderCounts = useMemo(() => {
    if (!orders) return new Map();
    const counts = new Map();
    orders.forEach((order) => {
      counts.set(order.product_id, (counts.get(order.product_id) || 0) + order.quantity);
    });
    return counts;
  }, [orders]);

  const handleEdit = (product) => {
    setStatus(null);
    setProductForm({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      seller_name: product.seller_name,
    });
  };

  const resetForm = () => {
    setProductForm(emptyForm);
  };

  const handleDelete = async (productId) => {
    if (!isAdmin) {
      setStatus({ type: 'error', message: 'Only administrators can manage products.' });
      return;
    }
    try {
      await apiRequest(`/products/${productId}`, { method: 'DELETE', token });
      setStatus({ type: 'success', message: 'Product removed from catalogue.' });
      await refreshProducts();
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus(null);

    if (!isAdmin) {
      setStatus({ type: 'error', message: 'Only administrators can manage products.' });
      return;
    }

    if (!productForm.name.trim() || !productForm.description.trim() || !productForm.seller_name.trim()) {
      setStatus({ type: 'error', message: 'Provide name, description, and seller information.' });
      return;
    }

    const priceValue = Number(productForm.price);
    if (Number.isNaN(priceValue) || priceValue <= 0) {
      setStatus({ type: 'error', message: 'Enter a valid price greater than zero.' });
      return;
    }

    setSubmitting(true);
    try {
      if (productForm.id) {
        await apiRequest(`/products/${productForm.id}`, {
          method: 'PUT',
          token,
          body: {
            name: productForm.name.trim(),
            description: productForm.description.trim(),
            price: priceValue,
            seller_name: productForm.seller_name.trim(),
          },
        });
        setStatus({ type: 'success', message: 'Product updated successfully.' });
      } else {
        await apiRequest('/products/', {
          method: 'POST',
          token,
          body: {
            name: productForm.name.trim(),
            description: productForm.description.trim(),
            price: priceValue,
            seller_name: productForm.seller_name.trim(),
          },
        });
        setStatus({ type: 'success', message: 'New product published to the marketplace.' });
      }

      resetForm();
      const refreshCalls = [refreshProducts()];
      if (typeof refreshOrders === 'function') {
        refreshCalls.push(refreshOrders());
      }
      await Promise.all(refreshCalls);
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="section">
        <div className="section-header">
          <h2>Admin dashboard</h2>
        </div>
        <StatusBanner status={{ type: 'info', message: 'Log in as an administrator to manage ExportHub.' }} />
      </section>
    );
  }

  if (!isAdmin) {
    return (
      <section className="section">
        <div className="section-header">
          <h2>Admin dashboard</h2>
        </div>
        <StatusBanner status={{ type: 'error', message: 'You need administrator privileges to access this area.' }} />
      </section>
    );
  }

  return (
    <section className="section">
      <div className="section-header">
        <h2>Product management</h2>
        <button type="button" className="ghost" onClick={() => refreshProducts()}>
          Refresh catalogue
        </button>
      </div>

      <StatusBanner status={status} />

      <div className="hero-card" style={{ marginBottom: '2.5rem' }}>
        <h3>{productForm.id ? 'Update listing' : 'Create new listing'}</h3>
        <form onSubmit={handleSubmit}>
          <label>
            Product name
            <input
              type="text"
              value={productForm.name}
              onChange={(event) => setProductForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
          </label>
          <label>
            Description
            <textarea
              rows={4}
              value={productForm.description}
              onChange={(event) => setProductForm((prev) => ({ ...prev, description: event.target.value }))}
              required
            />
          </label>
          <label>
            Price (USD)
            <input
              type="number"
              min={0}
              step="0.01"
              value={productForm.price}
              onChange={(event) => setProductForm((prev) => ({ ...prev, price: event.target.value }))}
              required
            />
          </label>
          <label>
            Seller name
            <input
              type="text"
              value={productForm.seller_name}
              onChange={(event) =>
                setProductForm((prev) => ({ ...prev, seller_name: event.target.value }))
              }
              required
            />
          </label>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button type="submit" className="primary" disabled={submitting}>
              {submitting
                ? productForm.id
                  ? 'Saving changes…'
                  : 'Publishing product…'
                : productForm.id
                ? 'Update product'
                : 'Create product'}
            </button>
            {productForm.id ? (
              <button
                type="button"
                className="ghost"
                onClick={resetForm}
                disabled={submitting}
              >
                Cancel edit
              </button>
            ) : null}
          </div>
        </form>
      </div>

      <div className="table-card">
        <div className="section-header" style={{ marginBottom: '1rem' }}>
          <h3>Catalogue overview</h3>
          <p>{orders ? `${orders.length} orders placed` : 'Orders update automatically in real time.'}</p>
        </div>
        {loadingProducts && !products ? (
          <p>Loading catalogue…</p>
        ) : productsError ? (
          <p className="status-banner error">Failed to load products: {productsError.message}</p>
        ) : products && products.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Seller</th>
                <th>Price</th>
                <th>Orders</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.name}</td>
                  <td>{product.seller_name}</td>
                  <td>${Number(product.price).toFixed(2)}</td>
                  <td>{orderCounts.get(product.id) || 0}</td>
                  <td>
                    <div className="table-actions">
                      <button type="button" className="ghost" onClick={() => handleEdit(product)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="ghost"
                        onClick={() => handleDelete(product.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">No products published yet. Use the form above to add your first listing.</div>
        )}
      </div>
    </section>
  );
}
