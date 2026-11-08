document.addEventListener('DOMContentLoaded', () => {
    const addExerciseModal = document.getElementById('add-exercise-modal');
    const addExerciseOpen = document.getElementById('open-add-exercise-modal');
    const addExerciseClose = document.getElementById('add-exercise-modal-close');
    const addExerciseCancel = document.getElementById('add-exercise-modal-cancel');
    
    const filterField = document.getElementById('filter-field');
    const exerciseRows = document.querySelectorAll('tbody tr[data-field-id]');
    
    const previewModal = document.getElementById('image-preview-modal');
    const previewImage = document.getElementById('preview-image');
    const previewClose = document.getElementById('image-preview-modal-close');
    const exerciseThumbs = document.querySelectorAll('.exercise-thumb');

    /**
     * Close the add-exercise modal.
     *
     * @returns {void}
     */
    const closeModalFn = () => addExerciseModal.classList.remove('active');

    /**
     * Close the image preview modal and clear the preview source.
     *
     * @returns {void}
     */
    const closePreviewFn = () => {
        previewModal.classList.remove('active');
        previewImage.src = '';
    };

    // Add exercise modal
    if (addExerciseOpen) {
        addExerciseOpen.addEventListener('click', () => {
            addExerciseModal.classList.add('active');
        });
    }

    if (addExerciseClose) addExerciseClose.addEventListener('click', closeModalFn);
    if (addExerciseCancel) addExerciseCancel.addEventListener('click', closeModalFn);

    // Dynamic search
    if (filterField) {
        filterField.addEventListener('change', function() {
            const value = this.value;
            exerciseRows.forEach((row) => {
                const rowFieldId = row.getAttribute('data-field-id');
                row.style.display = (value === 'all' || rowFieldId === value) ? '' : 'none';
            });
        });
    }

    // Photo zoom
    exerciseThumbs.forEach((thumb) => {
        thumb.addEventListener('click', function() {
            previewImage.src = this.dataset.fullSrc;
            previewModal.classList.add('active');
        });
    });
    
    if (previewClose) previewClose.addEventListener('click', closePreviewFn);
    
    if (previewModal) {
        previewModal.addEventListener('click', (event) => {
            if (event.target === previewModal) {
                closePreviewFn();
            }
        });
    }
});
