$(document).ready(function() {
    /**
     * @typedef {Object} AdminConfig
     * @property {number|string} currentUserId - ID of the currently logged-in admin.
     */

    /**
     * @typedef {Object} AdminUser
     * @property {number|string} id - User identifier.
     * @property {string} username - Public username.
     * @property {string} email - User email address.
     */

    /** @type {AdminConfig} */
    const config = JSON.parse(document.getElementById('admin-config').textContent);
    const currentUserId = config.currentUserId;
    const deleteModal = document.getElementById('delete-user-modal');
    const deleteModalText = document.getElementById('delete-user-modal-text');
    const deleteModalConfirm = document.getElementById('delete-user-modal-confirm');
    const deleteModalClose = document.getElementById('delete-user-modal-close');
    const deleteModalCancel = document.getElementById('delete-user-modal-cancel');

    /**
     * Open the custom delete confirmation modal.
     *
     * @param {string} deleteUrl - URL that performs the delete action.
     * @param {string} username - Username shown in the confirmation text.
     * @returns {void}
     */
    function openDeleteModal(deleteUrl, username) {
        deleteModalConfirm.href = deleteUrl;
        deleteModalText.textContent = username
            ? `Czy na pewno chcesz usunąć konto użytkownika "${username}"? Tej operacji nie można cofnąć.`
            : 'Czy na pewno chcesz usunąć tego użytkownika? Tej operacji nie można cofnąć.';
        deleteModal.hidden = false;
        deleteModal.classList.add('active');
    }

    /**
     * Close the delete confirmation modal and reset the action URL.
     *
     * @returns {void}
     */
    function closeDeleteModal() {
        deleteModal.classList.remove('active');
        deleteModal.hidden = true;
        deleteModalConfirm.href = '#';
    }

    $(document).on('click', '.btn-delete', function(event) {
        event.preventDefault();
        openDeleteModal(this.href, this.dataset.username || '');
        return false;
    });

    deleteModalClose.addEventListener('click', closeDeleteModal);
    deleteModalCancel.addEventListener('click', closeDeleteModal);
    deleteModal.addEventListener('click', function(event) {
        if (event.target === deleteModal) {
            closeDeleteModal();
        }
    });

    $('#search-input').on('input', function() {
        const searchValue = $(this).val();

        $.ajax({
            url: '/admin/users/search',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ search: searchValue }),
            dataType: 'json',
            /**
             * Render users returned from the admin search endpoint.
             *
             * @param {AdminUser[]} users - Search results.
             * @returns {void}
             */
            success: function(users) {
                const $tableBody = $('#users-table-body');
                $tableBody.empty();

                if (users.length === 0) {
                    $tableBody.append('<tr><td colspan="4" style="text-align:center; color: #666; font-style: italic; padding: 20px;">Nie znaleziono dopasowań.</td></tr>');
                    return;
                }

                users.forEach(function(user) {
                    const safeUsername = $('<div>').text(user.username).html();
                    let actionButton = (parseInt(user.id) === parseInt(currentUserId)) 
                        ? '<span class="badge-self">To Ty</span>' 
                        : `<a href="/admin/users/delete/${user.id}" class="btn-delete" data-username="${safeUsername}"><i class="fa-solid fa-trash"></i> Usuń konto</a>`;

                    const row = `
                        <tr>
                            <td>${user.id}</td>
                            <td><strong>${safeUsername}</strong></td>
                            <td>${$('<div>').text(user.email).html()}</td>
                            <td>
                                <a href="/admin/users/progress/${user.id}" class="btn-progress"><i class="fa-solid fa-eye"></i> Postępy</a>
                                ${actionButton}
                            </td>
                        </tr>
                    `;
                    $tableBody.append(row);
                });
            }
        });
    });
});
