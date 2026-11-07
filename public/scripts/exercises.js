document.addEventListener('DOMContentLoaded', function() {
    /**
     * @typedef {Object} QuizConfig
     * @property {number} currentFieldId - Field identifier for the current quiz.
     * @property {number} currentTaskCount - Requested task count from the previous screen.
     * @property {boolean} isLoggedIn - Whether progress can be saved immediately.
     * @property {boolean} justLoggedIn - Whether the user returned from auth during this quiz.
     */

    /**
     * @typedef {Object} ReviewItem
     * @property {boolean} isCorrect - Whether the selected answer was correct.
     * @property {string} userAnswer - Answer selected by the user.
     * @property {string} correctAnswer - Correct answer stored on the card.
     * @property {string} imgSrc - Exercise image source.
     */

    /** @type {QuizConfig} */
    const config = window.QuizConfig || {
        currentFieldId: 0,
        currentTaskCount: 0,
        isLoggedIn: false,
        justLoggedIn: false
    };

    let currentIdx = 0;
    let isChangingQuestion = false;
    const cards = document.querySelectorAll('.exercise-card');
    const totalCount = cards.length;

    const finishQuizModal = document.getElementById('finish-quiz-modal');
    const finishQuizModalClose = document.getElementById('finish-quiz-modal-close');
    const finishQuizModalCancel = document.getElementById('finish-quiz-modal-cancel');
    const finishQuizModalConfirm = document.getElementById('finish-quiz-modal-confirm');
    const earlyFinishButtons = document.querySelectorAll('#btn-early-finish');

    updateProgress();
    checkIfJustLoggedIn();

    cards.forEach((card) => {
        const optionButtons = card.querySelectorAll('.btn-option');
        optionButtons.forEach((btn) => {
            btn.addEventListener('click', function() {
                const answerValue = this.getAttribute('data-answer');
                handleAnswerClick(this, answerValue);
            });
        });
    });

    earlyFinishButtons.forEach((btn) => {
        btn.addEventListener('click', finishQuizEarly);
    });

    // Exit modal
    if (finishQuizModalClose) finishQuizModalClose.addEventListener('click', closeFinishQuizModal);
    if (finishQuizModalCancel) finishQuizModalCancel.addEventListener('click', closeFinishQuizModal);
    if (finishQuizModalConfirm) {
        finishQuizModalConfirm.addEventListener('click', function() {
            closeFinishQuizModal();
            checkQuiz(true);
        });
    }

    window.addEventListener('click', function(event) {
        if (event.target === finishQuizModal) {
            closeFinishQuizModal();
        }
    });

    /**
     * Build an internal URL that lets auth return to the same exercise set.
     *
     * @returns {string} Internal return URL for login/register redirects.
     */
    function buildReturnUrl() {
        let url = '/exercises/field/' + config.currentFieldId;
        if (config.currentTaskCount > 0) {
            url += '?limit=' + config.currentTaskCount;
        }
        return url;
    }

    /**
     * Restore a stored quiz summary after the user logs in mid-flow.
     *
     * @returns {void}
     */
    function checkIfJustLoggedIn() {
        if (config.justLoggedIn) {
            const quizResultKey = 'quiz_result_' + config.currentFieldId;
            const savedResult = sessionStorage.getItem(quizResultKey);
            if (savedResult) {
                try {
                    const result = JSON.parse(savedResult);
                    displaySummaryAfterLogin(result);
                } catch (e) {
                    console.log('Error parsing saved quiz result:', e);
                }
            }
        }
    }

    /**
     * Display a saved anonymous result after authentication and persist it.
     *
     * @param {{score:number,total:number,reviews:ReviewItem[]}} result - Stored quiz result.
     * @returns {void}
     */
    function displaySummaryAfterLogin(result) {
        document.getElementById('quiz-section').style.display = 'none';
        document.getElementById('score-rating').innerText = result.score + ' / ' + result.total;
        
        const reviewContainer = document.getElementById('review-container');
        reviewContainer.innerHTML = '';
        
        if (result.reviews && result.reviews.length > 0) {
            result.reviews.forEach(function(review, idx) {
                const reviewItem = document.createElement('div');
                reviewItem.className = 'review-item ' + (review.isCorrect ? 'correct' : 'wrong');
                reviewItem.innerHTML = '<strong>Zadanie ' + (idx + 1) + ':</strong> ' + (review.isCorrect ? '✅ Poprawnie' : '❌ Błąd') + '<br>' +
                    'Twoja odpowiedź: <strong>' + (review.userAnswer || 'Brak') + '</strong> | Poprawna: <strong>' + review.correctAnswer + '</strong>' +
                    '<img src="' + review.imgSrc + '" alt="Zadanie ' + (idx + 1) + '">';
                reviewContainer.appendChild(reviewItem);
            });
        }
        
        document.getElementById('review-section').style.display = 'block';
        document.getElementById('anonymous-box').style.display = 'none';
        document.getElementById('save-status').innerText = 'Zapisywanie postępów w bazie danych...';
        
        if (config.currentFieldId > 0 && result.total > 0) {
            fetch('/exercises/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    field_id: config.currentFieldId,
                    score: result.score,
                    total: result.total
                })
            })
            .then(function(res) { return res.json(); })
            .then(function(data) {
                if (data.success) {
                    document.getElementById('save-status').innerText = '✅ Twój postęp został automatycznie zapisany!';
                    document.getElementById('save-status').style.color = '#28a745';
                } else {
                    document.getElementById('save-status').innerText = '⚠️ Nie udało się zapisać postępu.';
                    document.getElementById('save-status').style.color = '#dc3545';
                }
                sessionStorage.removeItem('quiz_result_' + config.currentFieldId);
            })
            .catch(function() {
                document.getElementById('save-status').innerText = '🔴 Błąd połączenia. Wynik nie został zapisany.';
            });
        }
        
        document.getElementById('summary-section').style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * Record an answer, lock the current card, and advance to the next question.
     *
     * @param {HTMLButtonElement} button - Button clicked by the user.
     * @param {string} val - Answer value from the clicked button.
     * @returns {void}
     */
    function handleAnswerClick(button, val) {
        if (isChangingQuestion) return;

        const currentCard = cards[currentIdx];
        if (!currentCard || currentCard.hasAttribute('data-user-answer')) return;

        isChangingQuestion = true;
        currentCard.setAttribute('data-user-answer', val);

        button.style.background = "#0056b3";
        button.style.color = "white";
        currentCard.querySelectorAll('.btn-option').forEach((optionButton) => {
            optionButton.disabled = true;
        });

        setTimeout(() => {
            cards.forEach((card) => card.classList.remove('active'));
            currentIdx++;

            if (currentIdx >= totalCount) {
                checkQuiz();
            } else {
                cards[currentIdx].classList.add('active');
                updateProgress();
                isChangingQuestion = false;
            }
        }, 200);
    }

    /**
     * Update the visible quiz progress counter.
     *
     * @returns {void}
     */
    function updateProgress() {
        const progressText = document.getElementById('quiz-progress');
        if (progressText && totalCount > 0) {
            progressText.innerText = `Zadanie ${currentIdx + 1} z ${totalCount}`;
        }
    }

    /**
     * Hide the early-finish confirmation modal.
     *
     * @returns {void}
     */
    function closeFinishQuizModal() {
        finishQuizModal.classList.remove('active');
    }

    /**
     * Show the early-finish confirmation modal.
     *
     * @returns {void}
     */
    function openFinishQuizModal() {
        finishQuizModal.classList.add('active');
    }

    /**
     * Start the early-finish confirmation flow.
     *
     * @returns {void}
     */
    function finishQuizEarly() {
        if (isChangingQuestion) return;
        openFinishQuizModal();
    }

    /**
     * Score the quiz, render the summary, and save progress when possible.
     *
     * @param {boolean} [onlyAnswered=false] Whether to score only answered cards.
     * @returns {void}
     */
    function checkQuiz(onlyAnswered = false) {
        let correctCount = 0;
        const reviewContainer = document.getElementById('review-container');
        reviewContainer.innerHTML = ''; 
        
        const checkedCards = onlyAnswered
            ? Array.from(cards).filter((card) => card.hasAttribute('data-user-answer'))
            : Array.from(cards);
        const checkedTotal = checkedCards.length;

        checkedCards.forEach((card, index) => {
            const correctAnswer = card.getAttribute('data-correct').trim().toUpperCase();
            const userAnswer = (card.getAttribute('data-user-answer') || '').trim().toUpperCase();
            const imgSrc = card.getAttribute('data-img');
            
            const isCorrect = (userAnswer === correctAnswer);
            if (isCorrect) correctCount++;

            if (config.isLoggedIn) {
                const reviewItem = document.createElement('div');
                reviewItem.className = `review-item ${isCorrect ? 'correct' : 'wrong'}`;
                reviewItem.innerHTML = `
                    <strong>Zadanie ${index + 1}:</strong> ${isCorrect ? '✅ Poprawnie' : '❌ Błąd'}<br>
                    Twoja odpowiedź: <strong>${userAnswer || 'Brak'}</strong> | Poprawna: <strong>${correctAnswer}</strong>
                    <img src="${imgSrc}" alt="Zadanie ${index + 1}">
                `;
                reviewContainer.appendChild(reviewItem);
            }
        });

        const quizResultKey = 'quiz_result_' + config.currentFieldId;
        const reviews = [];
        checkedCards.forEach((card) => {
            const correctAnswer = card.getAttribute('data-correct').trim().toUpperCase();
            const userAnswer = (card.getAttribute('data-user-answer') || '').trim().toUpperCase();
            const imgSrc = card.getAttribute('data-img');
            reviews.push({
                isCorrect: userAnswer === correctAnswer,
                userAnswer: userAnswer,
                correctAnswer: correctAnswer,
                imgSrc: imgSrc
            });
        });
        sessionStorage.setItem(quizResultKey, JSON.stringify({ score: correctCount, total: checkedTotal, reviews: reviews }));

        document.getElementById('quiz-section').style.display = 'none';
        document.getElementById('score-rating').innerText = `${correctCount} / ${checkedTotal}`;

        if (config.isLoggedIn) {
            document.getElementById('review-section').style.display = 'block';
            document.getElementById('save-status').innerText = "Zapisywanie postępów w bazie danych...";
            
            if (config.currentFieldId > 0 && checkedTotal > 0) {
                fetch('/exercises/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        field_id: config.currentFieldId,
                        score: correctCount,
                        total: checkedTotal
                    })
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        document.getElementById('save-status').innerText = "✅ Twój postęp został automatycznie zapisany!";
                        document.getElementById('save-status').style.color = "#28a745";
                    } else {
                        document.getElementById('save-status').innerText = "⚠️ Nie udało się zapisać postępu.";
                        document.getElementById('save-status').style.color = "#dc3545";
                    }
                })
                .catch(() => {
                    document.getElementById('save-status').innerText = "🔴 Błąd połączenia. Wynik nie został zapisany.";
                });
            } else if (checkedTotal === 0) {
                document.getElementById('save-status').innerText = "Nie zapisano postępu, bo nie udzielono żadnej odpowiedzi.";
                document.getElementById('save-status').style.color = "#dc3545";
            }
        } else {
            document.getElementById('review-section').style.display = 'none';
            document.getElementById('anonymous-box').style.display = 'block';
        }

        document.getElementById('summary-section').style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Save progress after login/registering
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');

    if (loginLink) {
        loginLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/login?returnUrl=' + encodeURIComponent(buildReturnUrl());
        });
    }
    if (registerLink) {
        registerLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/register?returnUrl=' + encodeURIComponent(buildReturnUrl());
        });
    }
});
