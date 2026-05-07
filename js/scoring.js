/**
 * MBTI Scoring Logic
 * Портировано из Django quiz/views.py
 */

const Scoring = {
  /**
   * Рассчитать баллы по 8 измерениям MBTI
   * @param {Object} answers - {questionId: answerValue}
   * @param {Array} questions - массив вопросов
   * @returns {Object} scores {E, I, S, N, T, F, J, P}
   */
  calculateScores(answers, questions) {
    const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    
    for (const [qidStr, ansStr] of Object.entries(answers)) {
      const qid = parseInt(qidStr.replace('q', ''));
      const question = questions.find(q => q.id === qid);
      if (!question) continue;
      
      const answerVal = parseInt(ansStr);
      if (isNaN(answerVal)) continue;
      
      // Вес ответа: (answer - 3) * weight_question
      let weight = (answerVal - 3) * question.weight;
      
      // Если вопрос инвертирован - инвертируем вес
      if (question.is_negated) {
        weight = -weight;
      }
      
      // Распределяем по паре дихотомии
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
   * @param {Object} scores - {E, I, S, N, T, F, J, P}
   * @returns {string} MBTI тип (напр. INTJ)
   */
  determineType(scores) {
    const pairs = [['E', 'I'], ['S', 'N'], ['T', 'F'], ['J', 'P']];
    
    return pairs
      .map(([first, second]) => scores[first] >= scores[second] ? first : second)
      .join('');
  },
  
  /**
   * Рекомендовать IT-роль по типу MBTI
   * @param {string} personalityType - 4-буквенный тип MBTI
   * @param {Array} roles - массив ролей из questions.json
   * @returns {string} название роли
   */
  getRecommendedRole(personalityType, roles) {
    for (const role of roles) {
      if (role.mbti_types.includes(personalityType)) {
        return role;
      }
    }
    return {
      name: 'Уникальный тип личности',
      description: 'Твой тип MBTI редко встречается в IT. Это даёт тебе уникальные преимущества!',
      mbti_types: []
    };
  }
};
