// URL Google Apps Script
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxAshlcDI_sVJvD3PiX5qfadFZpXr1Ssg-57aHdq89QRSz8y_0GUudLzx7XOSz39GVoDg/exec';

// Загрузка ответов при открытии страницы
document.addEventListener('DOMContentLoaded', function() {
    loadAnswers();
    // Автоматическое обновление каждые 5 секунд
    setInterval(loadAnswers, 5000);
});

// Загрузить все ответы из localStorage и Google Sheets
async function loadAnswers() {
    // Загружаем из Google Sheets
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL);
        const googleResponses = await response.json();

        // Объединяем с локальными данными
        const localResponses = JSON.parse(localStorage.getItem('dateResponses') || '[]');

        // Используем Google Sheets как основной источник, дополняем локальными
        const allResponses = [...googleResponses];

        // Добавляем локальные ответы, которых нет в Google Sheets
        localResponses.forEach(local => {
            const exists = allResponses.find(r =>
                r.timestamp === local.timestamp &&
                r.meetingPlace === local.meetingPlace
            );
            if (!exists) {
                allResponses.push(local);
            }
        });

        displayAnswers(allResponses);
    } catch (error) {
        console.error('Ошибка загрузки из Google Sheets:', error);
        // Если ошибка - показываем локальные данные
        const responses = JSON.parse(localStorage.getItem('dateResponses') || '[]');
        displayAnswers(responses);
    }
}

// Отобразить ответы
function displayAnswers(responses) {
    const container = document.getElementById('answersContainer');

    // Обновляем статистику
    updateStats(responses);

    if (responses.length === 0) {
        container.innerHTML = `
            <div class="no-answers">
                <div class="empty-icon">📭</div>
                <p>Пока нет ответов</p>
                <p class="hint">Ответы будут появляться здесь автоматически</p>
            </div>
        `;
        return;
    }

    // Сортируем ответы по времени (новые сначала)
    responses.reverse();

    // Генерируем HTML для каждого ответа
    container.innerHTML = responses.map((response, index) => `
        <div class="answer-card">
            <div class="answer-header">
                <span class="answer-status yes">✅ ${response.answer}</span>
                <div>
                    <span class="answer-time">⏰ ${response.timestamp}</span>
                    <button class="delete-btn" onclick="deleteAnswer(${responses.length - 1 - index})">🗑️ Удалить</button>
                </div>
            </div>
            <div class="answer-details">
                <div class="answer-row">
                    <span class="answer-label">🌳 Тип прогулки:</span>
                    <span class="answer-value">${response.walkType}</span>
                </div>
                <div class="answer-row">
                    <span class="answer-label">📅 Дата и время:</span>
                    <span class="answer-value">${response.dateTime}</span>
                </div>
                <div class="answer-row">
                    <span class="answer-label">📍 Место встречи:</span>
                    <span class="answer-value">${response.meetingPlace}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Обновить статистику
function updateStats(responses) {
    const totalAnswers = responses.length;
    const yesAnswers = responses.filter(r => r.answer === 'Да').length;
    const lastAnswerTime = totalAnswers > 0 ? responses[responses.length - 1].timestamp : '—';

    document.getElementById('totalAnswers').textContent = totalAnswers;
    document.getElementById('yesAnswers').textContent = yesAnswers;
    document.getElementById('lastAnswer').textContent = lastAnswerTime;
}

// Обновить ответы вручную
function refreshAnswers() {
    loadAnswers();

    // Показываем уведомление
    const btn = document.querySelector('.btn-refresh');
    const originalText = btn.textContent;
    btn.textContent = '✓ Обновлено!';
    btn.style.background = 'linear-gradient(135deg, #38ef7d 0%, #11998e 100%)';

    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
    }, 1500);
}

// Удалить конкретный ответ
function deleteAnswer(index) {
    if (!confirm('Удалить этот ответ?')) {
        return;
    }

    let responses = JSON.parse(localStorage.getItem('dateResponses') || '[]');
    responses.splice(index, 1);
    localStorage.setItem('dateResponses', JSON.stringify(responses));

    loadAnswers();
}

// Очистить все ответы
function clearAllAnswers() {
    if (!confirm('Удалить все ответы? Это действие нельзя отменить!')) {
        return;
    }

    localStorage.removeItem('dateResponses');
    loadAnswers();

    alert('✅ Все ответы удалены!');
}

// Экспорт ответов в текстовый файл
function exportAnswers() {
    const responses = JSON.parse(localStorage.getItem('dateResponses') || '[]');

    if (responses.length === 0) {
        alert('Нет ответов для экспорта!');
        return;
    }

    let text = '=== ОТВЕТЫ НА ПРИГЛАШЕНИЕ ===\n\n';

    responses.forEach((response, index) => {
        text += `Ответ #${index + 1}\n`;
        text += `Время: ${response.timestamp}\n`;
        text += `Email: ${response.userEmail}\n`;
        text += `Ответ: ${response.answer}\n`;
        text += `Тип прогулки: ${response.walkType}\n`;
        text += `Дата и время: ${response.dateTime}\n`;
        text += `Место встречи: ${response.meetingPlace}\n`;
        text += `\n${'='.repeat(50)}\n\n`;
    });

    // Создаем файл для скачивания
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `answers_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Добавляем возможность вызова функций через консоль
window.exportAnswers = exportAnswers;

console.log('%c📊 Панель администратора загружена', 'color: #667eea; font-size: 16px; font-weight: bold;');
console.log('%cДля экспорта ответов в файл введите: exportAnswers()', 'color: #764ba2; font-size: 12px;');
