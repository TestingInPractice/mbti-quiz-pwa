/**
 * Storage - работа с localStorage для истории прохождений
 */

const Storage = {
  STORAGE_KEY: 'mbti_quiz_history',
  
  /**
   * Получить всю историю прохождений
   * @returns {Array} массив результатов
   */
  getHistory() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading history:', e);
      return [];
    }
  },
  
  /**
   * Сохранить результат прохождения
   * @param {Object} result - {mbtiType, role, scores, date}
   */
  saveResult(result) {
    try {
      const history = this.getHistory();
      history.unshift({
        ...result,
        date: new Date().toISOString()
      });
      
      // Храним максимум 50 последних результатов
      if (history.length > 50) {
        history.splice(50);
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.error('Error saving result:', e);
    }
  },
  
  /**
   * Очистить всю историю
   */
  clearHistory() {
    localStorage.removeItem(this.STORAGE_KEY);
  },
  
  /**
   * Получить количество прохождений
   * @returns {number}
   */
  getTestCount() {
    return this.getHistory().length;
  }
};
