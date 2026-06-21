// Хранение данных ответа
let responseData = {};

// URL Google Apps Script
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxAshlcDI_sVJvD3PiX5qfadFZpXr1Ssg-57aHdq89QRSz8y_0GUudLzx7XOSz39GVoDg/exec';

// Обработка отправки формы
document.getElementById('dateForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const walkType = document.getElementById('walkType').value;
    const dateTime = document.getElementById('dateTime').value;
    const meetingPlace = document.getElementById('meetingPlace').value;

    // Форматируем дату и время
    const formattedDateTime = formatDateTime(dateTime);

    // Сохраняем данные
    responseData = {
        walkType: getWalkTypeName(walkType),
        dateTime: formattedDateTime,
        meetingPlace: meetingPlace,
        answer: 'Да'
    };

    // Показываем ответ
    showResponse(responseData);
});

// Обработка кнопки "Нет"
function handleNo() {
    // Показываем сообщение "Неверный вариант"
    alert('❌ Неверный вариант!');
}

// Форматирование даты и времени
function formatDateTime(dateTimeString) {
    if (!dateTimeString) return '';

    const date = new Date(dateTimeString);
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };

    return date.toLocaleString('ru-RU', options);
}

// Показать экран с ответом
function showResponse(data) {
    document.querySelector('.question-section').style.display = 'none';
    document.getElementById('responseSection').style.display = 'block';

    const responseTitle = document.getElementById('responseTitle');
    const responseDetails = document.getElementById('responseDetails');

    responseTitle.textContent = '✅ Правильный вариант!';
    responseTitle.style.color = '#11998e';

    responseDetails.innerHTML = `
        <p><strong>Ответ:</strong> ${data.answer}</p>
        <p><strong>Тип прогулки:</strong> ${data.walkType}</p>
        <p><strong>Время:</strong> ${data.dateTime}</p>
        <p><strong>Место встречи:</strong> ${data.meetingPlace}</p>
    `;

    // Автоматически сохраняем ответ
    saveAnswer(data);
}

// Сохранить ответ в localStorage и Google Sheets
function saveAnswer(data) {
    const timestamp = new Date().toLocaleString('ru-RU');
    data.timestamp = timestamp;

    // Сохраняем в localStorage
    let responses = JSON.parse(localStorage.getItem('dateResponses') || '[]');
    responses.push(data);
    localStorage.setItem('dateResponses', JSON.stringify(responses));

    // Отправляем в Google Sheets
    sendToGoogleSheets(data);

    console.log('✅ Ответ сохранен!', data);

    // Показываем подтверждение через 2 секунды
    setTimeout(() => {
        document.getElementById('responseSection').style.display = 'none';
        document.getElementById('confirmSection').style.display = 'block';
    }, 2000);
}

// Отправить данные в Google Sheets
async function sendToGoogleSheets(data) {
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        console.log('✅ Данные отправлены в Google Sheets');
    } catch (error) {
        console.error('❌ Ошибка отправки в Google Sheets:', error);
    }
}

// Вернуться к форме
function resetForm() {
    document.getElementById('responseSection').style.display = 'none';
    document.getElementById('confirmSection').style.display = 'none';
    document.querySelector('.question-section').style.display = 'block';

    // Очищаем форму
    document.getElementById('dateForm').reset();
}

// Получить название типа прогулки
function getWalkTypeName(value) {
    const types = {
        'park': '🌳 Прогулка в парке',
        'city': '🏙️ По городу',
        'cafe': '☕ Кафе с прогулкой',
        'river': '🌊 Набережная',
        'sunset': '🌅 Встретить закат'
    };
    return types[value] || value;
}

// Показать все полученные ответы (для автора приглашения)
function showAllResponses() {
    const responses = JSON.parse(localStorage.getItem('dateResponses') || '[]');

    if (responses.length > 0) {
        console.log('=== ВСЕ ПОЛУЧЕННЫЕ ОТВЕТЫ ===');
        responses.forEach((resp, index) => {
            console.log(`\nОтвет #${index + 1}:`);
            console.log(`Время: ${resp.timestamp}`);
            console.log(`Решение: ${resp.answer}`);
            console.log(`Прогулка: ${resp.walkType}`);
            console.log(`Когда: ${resp.dateTime}`);
            console.log(`Место: ${resp.meetingPlace}`);
        });
        console.log('\n======================');
    }
}

// Добавляем возможность просмотра всех ответов через консоль
// Просто введите в консоли: viewResponses()
window.viewResponses = showAllResponses;

// Добавляем возможность очистки ответов
// Введите в консоли: clearResponses()
window.clearResponses = function() {
    localStorage.removeItem('dateResponses');
    console.log('Все ответы удалены');
};

// Показываем инструкцию для автора в консоли
console.log('%c💖 Мини-приложение для приглашения на свидание 💖', 'color: #667eea; font-size: 16px; font-weight: bold;');
console.log('%cДля просмотра всех ответов введите: viewResponses()', 'color: #764ba2; font-size: 12px;');
console.log('%cДля очистки ответов введите: clearResponses()', 'color: #999; font-size: 12px;');
