'use client';

import useSWR from 'swr';

import StatusBanner from '../components/StatusBanner';
import { apiRequest } from '../lib/api';
import { useSession } from '../providers/SessionProvider';

const fetcher = ([path, token]) => apiRequest(path, token ? { token } : {});

export default function OrdersPage() {
  const { isAuthenticated, token, user } = useSession();
  const {
    data: orders,
    error: ordersError,
    isLoading: loadingOrders,
    mutate: refreshOrders,
  } = useSWR(isAuthenticated ? ['/orders/', token] : null, fetcher);
  const { data: products } = useSWR(['/products/', token ?? null], fetcher);

  if (!isAuthenticated) {
    return (
      <section className="section">
        <div className="section-header">
          <h2>Your orders</h2>
        </div>
        <StatusBanner status={{ type: 'info', message: 'Log in to review and manage your orders.' }} />
      </section>
    );
  }

  return (
    <section className="section">
      <div className="section-header">
        <h2>{user?.role === 'admin' ? 'All orders' : 'Your recent orders'}</h2>
        <button type="button" className="ghost" onClick={() => refreshOrders()}>
          Refresh
        </button>
      </div>
      {user?.role === 'admin' ? (
        <p className="status-banner info">Administrators can see every order placed across the marketplace.</p>
      ) : null}

      {loadingOrders && !orders ? (
        <p>Loading orders…</p>
      ) : ordersError ? (
        <StatusBanner status={{ type: 'error', message: ordersError.message }} />
      ) : orders && orders.length > 0 ? (
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Buyer</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Placed</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const product = products?.find((item) => item.id === order.product_id);
                return (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.buyer_name}</td>
                    <td>{product ? product.name : `Product ${order.product_id}`}</td>
                    <td>{order.quantity}</td>
                    <td>${Number(order.total_price).toFixed(2)}</td>
                    <td>{new Date(order.created_at).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">No orders found yet.</div>
      )}
    </section>
  );
}
