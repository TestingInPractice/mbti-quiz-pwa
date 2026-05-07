/**
 * MBTI Scoring Logic + Descriptions
 * Портировано из Django quiz/views.py
 */

const Scoring = {
  /**
   * Рассчитать баллы по 8 измерениям MBTI
   */
  calculateScores(answers, questions) {
    const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    
    for (const [qidStr, ansStr] of Object.entries(answers)) {
      const qid = parseInt(qidStr.replace('q', ''));
      const question = questions.find(q => q.id === qid);
      if (!question) continue;
      
      const answerVal = parseInt(ansStr);
      if (isNaN(answerVal)) continue;
      
      let weight = (answerVal - 3) * question.weight;
      
      if (question.is_negated) {
        weight = -weight;
      }
      
      const [first, second] = question.category.split('');
      
      if (weight > 0) {
        scores[first] += weight;
      } else {
        scores[second] -= weight;
      }
    }
    
    return scores;
  },
  
  /**
   * Определить тип личности по баллам
   */
  determineType(scores) {
    const pairs = [['E', 'I'], ['S', 'N'], ['T', 'F'], ['J', 'P']];
    return pairs
      .map(([first, second]) => scores[first] >= scores[second] ? first : second)
      .join('');
  },
  
  /**
   * 16 типов MBTI с описаниями
   */
  typeDescriptions: {
    'ISTJ': 'Практичный и ответственный. Ценит традиции и порядок. Надёжен в деталях.',
    'ISFJ': 'Заботливый и внимательный. Помнит мелочи о людях. Ценит гармонию.',
    'INFJ': 'Идеалист и визионер. Глубоко понимает людей. Стремится к смыслу.',
    'INTJ': 'Стратег и аналитик. Независимый мыслитель. Видит систему целиком.',
    'ISTP': 'Практик и экспериментатор. Любит разбираться как всё работает. Гибкий.',
    'ISFP': 'Художник и эстет. Ценит красоту и свободу. Действует здесь и сейчас.',
    'INFP': 'Мечтатель и идеалист. Ищет смысл во всём. Творческий и эмпатичный.',
    'INTP': 'Логик и философ. Любит абстрактные идеи. Аналитический ум.',
    'ESTP': 'Энергичный и практичный. Любит действие и риск. Быстро реагирует.',
    'ESFP': 'Душа компании. Любит жизнь и людей. Спонтанный и весёлый.',
    'ENFP': 'Вдохновитель и энтузиаст. Видит возможности повсюду. Креативный.',
    'ENTP': 'Изобретатель и дебатёр. Любит интеллектуальные вызовы. Новатор.',
    'ESTJ': 'Организатор и администратор. Ценит порядок и правила. Решительный.',
    'ESFJ': 'Заботливый и общительный. Помогает другим. Ценит традиции.',
    'ENFJ': 'Лидер и наставник. Вдохновляет людей. Харизматичный.',
    'ENTJ': 'Командир и стратег. Прирождённый лидер. Целеустремлённый.'
  },
  
  /**
   * Профессии и привязка к MBTI типам (из Django)
   */
  roles: [
    {
      name: 'Тестировщик',
      description: 'Вы внимательны к деталям и системны — хорошая основа для тестировщика.',
      mbti_types: ['ISFJ', 'ISTJ', 'ESTJ'],
      links: [
        { text: '🎓 Бесплатный курс — Тестирование', url: 'https://stepik.org/course/124505/promo' },
        { text: '⭐ Расширенный курс — Тестирование', url: 'https://stepik.org/course/128445/promo' }
      ]
    },
    {
      name: 'Аналитик',
      description: 'Вы любите анализ и стратегию — подходите для аналитика.',
      mbti_types: ['INTJ', 'INTP', 'ENTJ'],
      links: [
        { text: '🎓 Курс — Анализ данных', url: 'https://stepik.org/course/128445/promo' }
      ]
    },
    {
      name: 'Разработчик',
      description: 'Вы творческий и инициативный — отлично для разработчика.',
      mbti_types: ['ENFP', 'ENTP', 'INFP'],
      links: [
        { text: '🎓 Курс — Основы программирования', url: 'https://stepik.org/course/215117/promo' }
      ]
    }
  ],
  
  /**
   * Рекомендовать IT-роль по типу MBTI
   */
  getRecommendedRole(personalityType) {
    for (const role of this.roles) {
      if (role.mbti_types.includes(personalityType)) {
        return { ...role, isUnique: false };
      }
    }
    return {
      name: 'Уникальный тип личности',
      description: 'Исследуйте свои сильные стороны в разных профессиях. Ваш тип редок в IT — это даёт уникальные преимущества!',
      mbti_types: [],
      links: [],
      isUnique: true
    };
  }
};
