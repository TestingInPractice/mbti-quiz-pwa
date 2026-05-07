/**
 * MBTI Quiz PWA - Main Application
 * Полная версия: история, типы MBTI, баллы, профессии
 */

const App = {
  questions: [],
  currentQuestionIndex: 0,
  answers: {},
  
  screens: {
    start: document.getElementById('start-screen'),
    question: document.getElementById('question-screen'),
    result: document.getElementById('result-screen'),
    history: document.getElementById('history-screen'),
    types: document.getElementById('types-screen'),
    detail: document.getElementById('detail-screen')
  },
  
  elements: {
    startBtn: document.getElementById('start-btn'),
    historyBtn: document.getElementById('history-btn'),
    typesBtn: document.getElementById('types-btn'),
    questionText: document.getElementById('question-text'),
    questionCounter: document.getElementById('question-counter'),
    progressFill: document.getElementById('progress-fill'),
    prevBtn: document.getElementById('prev-btn'),
    finishBtn: document.getElementById('finish-btn'),
    answerBtns: document.querySelectorAll('.answer-btn'),
    mbtiType: document.getElementById('mbti-type'),
    mbtiDescription: document.getElementById('mbti-description'),
    roleName: document.getElementById('role-name'),
    roleDescription: document.getElementById('role-description'),
    roleLinks: document.getElementById('role-links'),
    scoreBars: document.getElementById('score-bars'),
    retakeBtn: document.getElementById('retake-btn'),
    homeBtn: document.getElementById('home-btn'),
    historyList: document.getElementById('history-list'),
    clearHistory: document.getElementById('clear-history'),
    historyBack: document.getElementById('history-back'),
    typesGrid: document.getElementById('types-grid'),
    typeDetail: document.getElementById('type-detail'),
    typeDetailCode: document.getElementById('type-detail-code'),
    typeDetailDesc: document.getElementById('type-detail-desc'),
    typesBack: document.getElementById('types-back'),
    detailContent: document.getElementById('detail-content'),
    detailBack: document.getElementById('detail-back')
  },
  
  async init() {
    await this.loadQuestions();
    this.bindEvents();
    this.renderTypesGrid();
  },
  
  async loadQuestions() {
    try {
      const response = await fetch('data/questions.json');
      const data = await response.json();
      this.questions = data.questions;
      console.log(`Loaded ${this.questions.length} questions`);
    } catch (e) {
      console.error('Failed to load questions:', e);
      alert('Не удалось загрузить вопросы. Проверьте подключение к интернету.');
    }
  },
  
  bindEvents() {
    this.elements.startBtn.addEventListener('click', () => this.startQuiz());
    this.elements.historyBtn.addEventListener('click', () => this.showHistory());
    this.elements.typesBtn.addEventListener('click', () => this.showTypes());
    
    this.elements.answerBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectAnswer(btn.getAttribute('data-value'));
      });
    });
    
    this.elements.prevBtn.addEventListener('click', () => this.prevQuestion());
    
    this.elements.finishBtn.addEventListener('click', () => {
      if (Object.keys(this.answers).length === 0) {
        alert('Ответь хотя бы на один вопрос');
        return;
      }
      this.showResult();
    });
    
    this.elements.retakeBtn.addEventListener('click', () => this.startQuiz());
    this.elements.homeBtn.addEventListener('click', () => this.showScreen('start'));
    
    this.elements.clearHistory.addEventListener('click', () => {
      Storage.clearHistory();
      this.showHistory();
    });
    
    this.elements.historyBack.addEventListener('click', () => this.showScreen('start'));
    this.elements.typesBack.addEventListener('click', () => this.showScreen('start'));
    this.elements.detailBack.addEventListener('click', () => this.showHistory());
    
    this.setupSwipeNavigation();
  },
  
  startQuiz() {
    this.currentQuestionIndex = 0;
    this.answers = {};
    this.showScreen('question');
    this.showQuestion();
  },
  
  showQuestion() {
    const question = this.questions[this.currentQuestionIndex];
    const total = this.questions.length;
    
    this.elements.questionText.textContent = question.text;
    this.elements.questionCounter.textContent = `${this.currentQuestionIndex + 1} / ${total}`;
    this.elements.progressFill.style.width = `${((this.currentQuestionIndex + 1) / total) * 100}%`;
    
    this.elements.prevBtn.disabled = this.currentQuestionIndex === 0;
    
    const answered = Object.keys(this.answers).length;
    this.elements.finishBtn.style.display = answered > 0 ? 'block' : 'none';
    
    const qid = question.id;
    const currentAnswer = this.answers[qid];
    
    this.elements.answerBtns.forEach(btn => {
      const value = btn.getAttribute('data-value');
      btn.classList.toggle('selected', value === currentAnswer);
    });
  },
  
  selectAnswer(value) {
    const question = this.questions[this.currentQuestionIndex];
    this.answers[question.id] = value;
    
    this.elements.answerBtns.forEach(btn => {
      btn.classList.toggle('selected', btn.getAttribute('data-value') === value);
    });
    
    // Показать кнопку "Завершить"
    this.elements.finishBtn.style.display = 'block';
    
    setTimeout(() => this.nextQuestion(), 300);
  },
  
  nextQuestion() {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.showQuestion();
    } else {
      this.showResult();
    }
  },
  
  prevQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.showQuestion();
    }
  },
  
  showResult() {
    const scores = Scoring.calculateScores(this.answers, this.questions);
    const mbtiType = Scoring.determineType(scores);
    const role = Scoring.getRecommendedRole(mbtiType);
    const description = Scoring.typeDescriptions[mbtiType] || '';
    
    this.elements.mbtiType.textContent = mbtiType;
    this.elements.mbtiDescription.textContent = description;
    this.elements.roleName.textContent = role.name;
    this.elements.roleDescription.textContent = role.description;
    
    // Карточка роли
    const roleCard = document.getElementById('role-card');
    roleCard.style.borderLeftColor = role.isUnique ? 'var(--warning)' : 'var(--success)';
    
    // Ссылки на курсы
    if (role.links && role.links.length > 0) {
      this.elements.roleLinks.innerHTML = role.links.map(l => 
        `<a href="${l.url}" target="_blank" class="role-link">${l.text}</a>`
      ).join('');
    } else {
      this.elements.roleLinks.innerHTML = '';
    }
    
    // Баллы по шкалам
    this.renderScoreBars(scores);
    
    // Сохранить в историю
    Storage.saveResult({
      mbtiType,
      role: role.name,
      description,
      scores,
      isUnique: role.isUnique
    });
    
    this.showScreen('result');
  },
  
  renderScoreBars(scores) {
    const pairs = [
      ['E', 'I', 'Экстраверсия (E)', 'Интроверсия (I)'],
      ['S', 'N', 'Сенсорика (S)', 'Интуиция (N)'],
      ['T', 'F', 'Логика (T)', 'Этика (F)'],
      ['J', 'P', 'Рациональность (J)', 'Иррациональность (P)']
    ];
    
    this.elements.scoreBars.innerHTML = pairs.map(([first, second, firstLabel, secondLabel]) => {
      const firstScore = scores[first];
      const secondScore = scores[second];
      const total = firstScore + secondScore;
      const firstPercent = total > 0 ? (firstScore / total) * 100 : 50;
      
      return `
        <div class="score-bar-item">
          <div class="score-bar-label">
            <span class="${firstScore >= secondScore ? 'dominant' : ''}">${firstLabel}: ${firstScore}</span>
            <span class="${secondScore > firstScore ? 'dominant' : ''}">${secondLabel}: ${secondScore}</span>
          </div>
          <div class="score-bar">
            <div class="score-bar-fill" style="width: ${firstPercent}%"></div>
          </div>
        </div>
      `;
    }).join('');
  },
  
  showHistory() {
    const history = Storage.getHistory();
    
    if (history.length === 0) {
      this.elements.historyList.innerHTML = '<p style="color: var(--text-light); margin: 24px 0;">Пока нет прохождений</p>';
      this.elements.clearHistory.style.display = 'none';
    } else {
      this.elements.historyList.innerHTML = history.map((item, index) => {
        const date = new Date(item.date).toLocaleDateString('ru-RU', {
          day: 'numeric', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        });
        const scorePreview = `E:${item.scores.E} I:${item.scores.I} S:${item.scores.S} N:${item.scores.N}`;
        
        return `
          <div class="history-item" onclick="App.showDetail(${index})">
            <div class="mbti">${item.mbtiType}</div>
            <div class="role">${item.role}</div>
            <div class="scores-preview">${scorePreview}</div>
            <div class="date">${date}</div>
          </div>
        `;
      }).join('');
      this.elements.clearHistory.style.display = 'block';
    }
    
    this.showScreen('history');
  },
  
  showDetail(index) {
    const item = Storage.getHistory()[index];
    if (!item) return;
    
    const scores = item.scores;
    const date = new Date(item.date).toLocaleDateString('ru-RU', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
    
    this.elements.detailContent.innerHTML = `
      <div class="detail-card">
        <h3>🧠 ${item.mbtiType}</h3>
        <p>${item.description || Scoring.typeDescriptions[item.mbtiType] || ''}</p>
        <p style="color: var(--text-light); font-size: 0.9rem; margin-top: 8px;">${date}</p>
      </div>
      
      <div class="detail-card">
        <h3>💼 ${item.role}</h3>
        <p>${item.isUnique ? 'Исследуйте свои сильные стороны в разных профессиях.' : ''}</p>
      </div>
      
      <div class="detail-card">
        <h3>📊 Баллы по шкалам</h3>
        <div class="detail-scores">
          <div class="detail-score-row">
            <span>Экстраверсия (E)</span>
            <strong style="color: ${scores.E >= scores.I ? 'var(--primary)' : 'var(--text)'}">${scores.E}</strong>
          </div>
          <div class="detail-score-row">
            <span>Интроверсия (I)</span>
            <strong style="color: ${scores.I > scores.E ? 'var(--primary)' : 'var(--text)'}">${scores.I}</strong>
          </div>
          <div class="detail-score-row">
            <span>Сенсорика (S)</span>
            <strong style="color: ${scores.S >= scores.N ? 'var(--primary)' : 'var(--text)'}">${scores.S}</strong>
          </div>
          <div class="detail-score-row">
            <span>Интуиция (N)</span>
            <strong style="color: ${scores.N > scores.S ? 'var(--primary)' : 'var(--text)'}">${scores.N}</strong>
          </div>
          <div class="detail-score-row">
            <span>Логика (T)</span>
            <strong style="color: ${scores.T >= scores.F ? 'var(--primary)' : 'var(--text)'}">${scores.T}</strong>
          </div>
          <div class="detail-score-row">
            <span>Этика (F)</span>
            <strong style="color: ${scores.F > scores.T ? 'var(--primary)' : 'var(--text)'}">${scores.F}</strong>
          </div>
          <div class="detail-score-row">
            <span>Рациональность (J)</span>
            <strong style="color: ${scores.J >= scores.P ? 'var(--primary)' : 'var(--text)'}">${scores.J}</strong>
          </div>
          <div class="detail-score-row">
            <span>Иррациональность (P)</span>
            <strong style="color: ${scores.P > scores.J ? 'var(--primary)' : 'var(--text)'}">${scores.P}</strong>
          </div>
        </div>
      </div>
    `;
    
    this.showScreen('detail');
  },
  
  showTypes() {
    this.elements.typeDetail.style.display = 'none';
    this.showScreen('types');
  },
  
  renderTypesGrid() {
    const types = Object.keys(Scoring.typeDescriptions);
    this.elements.typesGrid.innerHTML = types.map(type => 
      `<button class="type-btn" onclick="App.showTypeDetail('${type}')">${type}</button>`
    ).join('');
  },
  
  showTypeDetail(typeCode) {
    this.elements.typeDetailCode.textContent = typeCode;
    this.elements.typeDetailDesc.textContent = Scoring.typeDescriptions[typeCode] || '';
    this.elements.typeDetail.style.display = 'block';
    
    // Подсветить выбранный тип
    document.querySelectorAll('.type-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.textContent === typeCode);
    });
  },
  
  showScreen(screenName) {
    Object.values(this.screens).forEach(screen => {
      screen.classList.remove('active');
    });
    this.screens[screenName].classList.add('active');
  },
  
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
      
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) {
          const answered = this.answers[this.questions[this.currentQuestionIndex]?.id];
          if (answered) this.nextQuestion();
        } else {
          this.prevQuestion();
        }
      }
    }, { passive: true });
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
