import React, { useEffect, useState } from 'react';

const API_BASE = '/api/items';

const EMPTY_FORM = { name: '', sku: '', quantity: '', price: '' };

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      quantity: Number(form.quantity),
      price: Number(form.price),
    };

    try {
      const url = editingId ? `${API_BASE}/${editingId}` : API_BASE;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.errors?.join(', ') || `Request failed: ${res.status}`);
      }

      await fetchItems();
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      sku: item.sku,
      quantity: String(item.quantity),
      price: String(item.price),
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      await fetchItems();
      if (editingId === id) resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  const totalValue = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>InventoryHub</h1>
        <p style={styles.subtitle}>Full-stack inventory management demo</p>
      </header>

      <section style={styles.summary}>
        <div style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Items</span>
          <span style={styles.summaryValue}>{items.length}</span>
        </div>
        <div style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Total units</span>
          <span style={styles.summaryValue}>
            {items.reduce((sum, item) => sum + item.quantity, 0)}
          </span>
        </div>
        <div style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Inventory value</span>
          <span style={styles.summaryValue}>${totalValue.toFixed(2)}</span>
        </div>
      </section>

      <section style={styles.formCard}>
        <h2 style={styles.sectionTitle}>{editingId ? 'Edit item' : 'Add new item'}</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            style={styles.input}
            name="sku"
            placeholder="SKU"
            value={form.sku}
            onChange={handleChange}
            required
          />
          <input
            style={styles.input}
            name="quantity"
            type="number"
            min="0"
            placeholder="Quantity"
            value={form.quantity}
            onChange={handleChange}
            required
          />
          <input
            style={styles.input}
            name="price"
            type="number"
            min="0"
            step="0.01"
            placeholder="Price"
            value={form.price}
            onChange={handleChange}
            required
          />
          <div style={styles.formButtons}>
            <button type="submit" style={styles.primaryButton} disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Update item' : 'Add item'}
            </button>
            {editingId && (
              <button type="button" style={styles.secondaryButton} onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {error && <div style={styles.error}>⚠ {error}</div>}

      <section style={styles.tableCard}>
        <h2 style={styles.sectionTitle}>Items</h2>
        {loading ? (
          <p>Loading…</p>
        ) : items.length === 0 ? (
          <p>No inventory items yet. Add one above.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>SKU</th>
                <th style={styles.th}>Quantity</th>
                <th style={styles.th}>Price</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td style={styles.td}>{item.name}</td>
                  <td style={styles.td}>{item.sku}</td>
                  <td style={styles.td}>{item.quantity}</td>
                  <td style={styles.td}>${item.price.toFixed(2)}</td>
                  <td style={styles.td}>${(item.quantity * item.price).toFixed(2)}</td>
                  <td style={styles.tdActions}>
                    <button style={styles.linkButton} onClick={() => handleEdit(item)}>
                      Edit
                    </button>
                    <button
                      style={{ ...styles.linkButton, color: '#c0392b' }}
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

const styles = {
  page: {
    fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
    maxWidth: 960,
    margin: '0 auto',
    padding: '32px 20px',
    color: '#1f2933',
  },
  header: { marginBottom: 24 },
  title: { margin: 0, fontSize: 32 },
  subtitle: { margin: '4px 0 0', color: '#616e7c' },
  summary: { display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' },
  summaryCard: {
    flex: '1 1 160px',
    background: '#f4f6f8',
    borderRadius: 10,
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  summaryLabel: { fontSize: 13, color: '#616e7c' },
  summaryValue: { fontSize: 24, fontWeight: 600 },
  formCard: {
    background: '#fff',
    border: '1px solid #e4e7eb',
    borderRadius: 10,
    padding: 20,
    marginBottom: 24,
  },
  sectionTitle: { margin: '0 0 12px', fontSize: 18 },
  form: { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' },
  input: {
    flex: '1 1 160px',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #cbd2d9',
    fontSize: 14,
  },
  formButtons: { display: 'flex', gap: 8 },
  primaryButton: {
    padding: '10px 18px',
    background: '#2f6feb',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
  },
  secondaryButton: {
    padding: '10px 18px',
    background: '#f4f6f8',
    color: '#1f2933',
    border: '1px solid #cbd2d9',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
  },
  error: {
    background: '#fdecea',
    color: '#c0392b',
    padding: '10px 14px',
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 14,
  },
  tableCard: {
    background: '#fff',
    border: '1px solid #e4e7eb',
    borderRadius: 10,
    padding: 20,
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left',
    padding: '8px 10px',
    borderBottom: '2px solid #e4e7eb',
    fontSize: 13,
    color: '#616e7c',
  },
  td: { padding: '10px', borderBottom: '1px solid #f0f2f5', fontSize: 14 },
  tdActions: { padding: '10px', borderBottom: '1px solid #f0f2f5', whiteSpace: 'nowrap' },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#2f6feb',
    cursor: 'pointer',
    fontSize: 13,
    marginRight: 12,
    padding: 0,
  },
};

export default App;
