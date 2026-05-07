/**
 * MBTI Quiz PWA - Main Application
 */

const App = {
  questions: [],
  roles: [],
  categories: [],
  currentQuestionIndex: 0,
  answers: {},
  
  // DOM элементы
  screens: {
    start: document.getElementById('start-screen'),
    question: document.getElementById('question-screen'),
    result: document.getElementById('result-screen')
  },
  
  elements: {
    startBtn: document.getElementById('start-btn'),
    questionText: document.getElementById('question-text'),
    questionCounter: document.getElementById('question-counter'),
    progressFill: document.getElementById('progress-fill'),
    prevBtn: document.getElementById('prev-btn'),
    answerBtns: document.querySelectorAll('.answer-btn'),
    mbtiType: document.getElementById('mbti-type'),
    roleName: document.getElementById('role-name'),
    roleDescription: document.getElementById('role-description'),
    scoreBars: document.getElementById('score-bars'),
    retakeBtn: document.getElementById('retake-btn'),
    homeBtn: document.getElementById('home-btn'),
    historySection: document.getElementById('history-section'),
    historyList: document.getElementById('history-list'),
    clearHistory: document.getElementById('clear-history')
  },
  
  /**
   * Инициализация приложения
   */
  async init() {
    // Загружаем вопросы
    await this.loadQuestions();
    
    // Навешиваем обработчики
    this.bindEvents();
    
    // Показываем историю если есть
    this.renderHistory();
  },
  
  /**
   * Загрузить вопросы из JSON
   */
  async loadQuestions() {
    try {
      const response = await fetch('data/questions.json');
      const data = await response.json();
      
      this.questions = data.questions;
      this.roles = data.roles;
      this.categories = data.categories;
      
      console.log(`Loaded ${this.questions.length} questions`);
    } catch (e) {
      console.error('Failed to load questions:', e);
      alert('Не удалось загрузить вопросы. Проверьте подключение к интернету.');
    }
  },
  
  /**
   * Навесить обработчики событий
   */
  bindEvents() {
    // Начать тест
    this.elements.startBtn.addEventListener('click', () => this.startQuiz());
    
    // Ответы
    this.elements.answerBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const value = btn.getAttribute('data-value');
        this.selectAnswer(value);
      });
    });
    
    // Назад
    this.elements.prevBtn.addEventListener('click', () => this.prevQuestion());
    
    // Пройти снова
    this.elements.retakeBtn.addEventListener('click', () => this.startQuiz());
    
    // На главную
    this.elements.homeBtn.addEventListener('click', () => this.showScreen('start'));
    
    // Очистить историю
    this.elements.clearHistory.addEventListener('click', () => {
      Storage.clearHistory();
      this.renderHistory();
    });
    
    // Свайпы для навигации
    this.setupSwipeNavigation();
  },
  
  /**
   * Начать тест
   */
  startQuiz() {
    this.currentQuestionIndex = 0;
    this.answers = {};
    this.showScreen('question');
    this.showQuestion();
  },
  
  /**
   * Показать экран вопроса
   */
  showQuestion() {
    const question = this.questions[this.currentQuestionIndex];
    const total = this.questions.length;
    
    this.elements.questionText.textContent = question.text;
    this.elements.questionCounter.textContent = `${this.currentQuestionIndex + 1} / ${total}`;
    this.elements.progressFill.style.width = `${((this.currentQuestionIndex + 1) / total) * 100}%`;
    
    // Кнопка "Назад"
    this.elements.prevBtn.disabled = this.currentQuestionIndex === 0;
    
    // Выделить текущий ответ если есть
    const qid = question.id;
    const currentAnswer = this.answers[qid];
    
    this.elements.answerBtns.forEach(btn => {
      const value = btn.getAttribute('data-value');
      btn.classList.toggle('selected', value === currentAnswer);
    });
  },
  
  /**
   * Выбрать ответ
   */
  selectAnswer(value) {
    const question = this.questions[this.currentQuestionIndex];
    const qid = question.id;
    
    this.answers[qid] = value;
    
    // Выделить кнопку
    this.elements.answerBtns.forEach(btn => {
      const btnValue = btn.getAttribute('data-value');
      btn.classList.toggle('selected', btnValue === value);
    });
    
    // Перейти к следующему вопросу через 300ms
    setTimeout(() => this.nextQuestion(), 300);
  },
  
  /**
   * Следующий вопрос
   */
  nextQuestion() {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.showQuestion();
    } else {
      // Последний вопрос - показать результат
      this.showResult();
    }
  },
  
  /**
   * Предыдущий вопрос
   */
  prevQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.showQuestion();
    }
  },
  
  /**
   * Показать результат
   */
  showResult() {
    // Рассчитать баллы
    const scores = Scoring.calculateScores(this.answers, this.questions);
    const mbtiType = Scoring.determineType(scores);
    const role = Scoring.getRecommendedRole(mbtiType, this.roles);
    
    // Показать результат
    this.elements.mbtiType.textContent = mbtiType;
    this.elements.roleName.textContent = role.name;
    this.elements.roleDescription.textContent = role.description;
    
    // Показать бары для шкал
    this.renderScoreBars(scores);
    
    // Сохранить в историю
    Storage.saveResult({
      mbtiType,
      role: role.name,
      scores
    });
    
    this.showScreen('result');
  },
  
  /**
   * Отрисовать бары для шкал MBTI
   */
  renderScoreBars(scores) {
    const pairs = [
      ['E', 'I', 'Экстраверсия', 'Интроверсия'],
      ['S', 'N', 'Сенсорика', 'Интуиция'],
      ['T', 'F', 'Логика', 'Этика'],
      ['J', 'P', 'Рациональность', 'Иррациональность']
    ];
    
    this.elements.scoreBars.innerHTML = pairs.map(([first, second, firstLabel, secondLabel]) => {
      const firstScore = scores[first];
      const secondScore = scores[second];
      const total = firstScore + secondScore;
      const firstPercent = total > 0 ? (firstScore / total) * 100 : 50;
      
      return `
        <div class="score-bar-item">
          <div class="score-bar-label">
            <span>${firstLabel} (${first})</span>
            <span>${secondLabel} (${second})</span>
          </div>
          <div class="score-bar">
            <div class="score-bar-fill" style="width: ${firstPercent}%"></div>
          </div>
        </div>
      `;
    }).join('');
  },
  
  /**
   * Показать экран
   */
  showScreen(screenName) {
    Object.values(this.screens).forEach(screen => {
      screen.classList.remove('active');
    });
    this.screens[screenName].classList.add('active');
    
    // Обновить историю на главном экране
    if (screenName === 'start') {
      this.renderHistory();
    }
  },
  
  /**
   * Отрисовать историю прохождений
   */
  renderHistory() {
    const history = Storage.getHistory();
    
    if (history.length === 0) {
      this.elements.historySection.style.display = 'none';
      return;
    }
    
    this.elements.historySection.style.display = 'block';
    
    this.elements.historyList.innerHTML = history.slice(0, 5).map(item => {
      const date = new Date(item.date).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      return `
        <div class="history-item">
          <span class="mbti">${item.mbtiType}</span>
          <span>${item.role}</span>
          <span class="date">${date}</span>
        </div>
      `;
    }).join('');
  },
  
  /**
   * Настроить навигацию свайпами
   */
  setupSwipeNavigation() {
    let startX = 0;
    let startY = 0;
    
    const questionScreen = this.screens.question;
    
    questionScreen.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });
    
    questionScreen.addEventListener('touchend', (e) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      
      const diffX = startX - endX;
      const diffY = startY - endY;
      
      // Горизонтальный свайп > 50px
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) {
          // Свайп влево - следующий вопрос
          const answered = this.answers[this.questions[this.currentQuestionIndex]?.id];
          if (answered) {
            this.nextQuestion();
          }
        } else {
          // Свайп вправо - предыдущий вопрос
          this.prevQuestion();
        }
      }
    }, { passive: true });
  }
};

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => App.init());
