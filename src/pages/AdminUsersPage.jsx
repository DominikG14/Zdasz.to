import React, { useState, useEffect, useCallback } from 'react';
import AdminNav from '../components/AdminNav.jsx';
import { api } from '../api/restClient.js';
import {
  IconSearch,
  IconChart,
  IconTrash,
  IconCheck,
  IconX,
  IconUser,
} from '../components/Icons.jsx';

export default function AdminUsersPage({ go, onError, onSuccess }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadUsers = useCallback(async (query = '') => {
    try {
      setLoading(true);
      const data = await api.admin.getUsers(query);
      setUsers(data || []);
    } catch (err) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers(search);
    }, 200);
    return () => clearTimeout(timer);
  }, [search, loadUsers]);

  const handleConfirmDelete = async (user) => {
    setIsDeleting(true);
    try {
      await api.admin.deleteUser(user.id);
      setPendingDeleteId(null);
      if (onSuccess) onSuccess(`Użytkownik ${user.username} został usunięty.`);
      loadUsers(search);
    } catch (err) {
      onError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="admin-page-container">
      <AdminNav go={go} active="users" />

      <header className="admin-header-strip">
        <h1 className="admin-title">Zarządzanie użytkownikami</h1>
        <p className="admin-subtitle">
          Wyszukuj konta, analizuj wyniki i postępy poszczególnych uczniów w przygotowaniach.
        </p>
      </header>

      {/* Search Bar */}
      <div className="admin-filter-bar">
        <div className="search-bar-wrapper">
          <IconSearch size={18} className="search-input-icon" />
          <input
            type="text"
            placeholder="Szukaj po nazwie użytkownika lub adresie e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input-modern"
            aria-label="Filtruj użytkowników"
          />
          {search && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearch('')}
            >
              ✕
            </button>
          )}
        </div>
        <div className="admin-counter-pill">
          Znaleziono: <strong>{users.length}</strong>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-responsive-wrapper">
        <table className="table-modern">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>ID</th>
              <th>Użytkownik</th>
              <th>Adres e-mail</th>
              <th style={{ textAlign: 'right' }}>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="table-loading-cell">
                  <div className="table-spinner"></div>
                  <span>Ładowanie listy użytkowników...</span>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="4" className="table-empty-cell">
                  Nie znaleziono użytkowników spełniających kryteria.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <span className="badge-id">#{user.id}</span>
                  </td>
                  <td>
                    <div className="user-table-cell">
                      <div className="user-table-avatar">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="user-table-name">{user.username}</span>
                    </div>
                  </td>
                  <td className="table-email-cell">{user.email}</td>
                  <td className="table-actions-cell" style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn-secondary btn-sm"
                      onClick={() => go(`/admin/users/progress/${user.id}`)}
                      title="Zobacz szczegółowe postępy ucznia"
                    >
                      <IconChart size={14} />
                      <span>Postępy</span>
                    </button>

                    {pendingDeleteId === user.id ? (
                      <div className="confirm-delete-group">
                        <span className="confirm-prompt">Usunąć?</span>
                        <button
                          type="button"
                          className="btn-danger btn-sm"
                          disabled={isDeleting}
                          onClick={() => handleConfirmDelete(user)}
                        >
                          <IconCheck size={14} />
                          <span>Tak</span>
                        </button>
                        <button
                          type="button"
                          className="btn-ghost btn-sm"
                          onClick={() => setPendingDeleteId(null)}
                        >
                          <IconX size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="btn-ghost-danger btn-sm"
                        onClick={() => setPendingDeleteId(user.id)}
                        title="Usuń konto użytkownika"
                      >
                        <IconTrash size={14} />
                        <span>Usuń</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
