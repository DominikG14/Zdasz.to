document.addEventListener('DOMContentLoaded', function() {
    /**
     * Copy the returnUrl query parameter into the hidden auth form input.
     *
     * @returns {void}
     */
    function hydrateReturnUrlInput() {
        const params = new URLSearchParams(window.location.search);
        const returnUrl = params.get('returnUrl');

        if (returnUrl) {
            const returnUrlInput = document.getElementById('returnUrl');
            if (returnUrlInput) {
                returnUrlInput.value = returnUrl;
            }
        }
    }

    hydrateReturnUrlInput();
});
