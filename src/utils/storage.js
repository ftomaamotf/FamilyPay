const STORAGE_KEYS = {
  TRANSACTIONS: 'bait_finance_transactions',
  CATEGORIES_EXPENSE: 'bait_finance_categories_expense',
  CATEGORIES_INCOME: 'bait_finance_categories_income',
  BUDGETS: 'bait_finance_budgets',
  DEBTS: 'bait_finance_debts',
  SAVINGS: 'bait_finance_savings',
  SETTINGS: 'bait_finance_settings',
  MEMBERS: 'bait_finance_members',
};

export const loadFromStorage = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (error) {
    console.error(`Error reading ${key} from storage:`, error);
    return fallback;
  }
};

export const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
};

export const exportAllDataBackup = (allData) => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allData, null, 2));
  const downloadAnchor = document.createElement('a');
  const date = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `نسخة_احتياطية_مصاريف_بيتي_${date}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

export const readBackupFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        resolve(json);
      } catch (err) {
        reject(new Error('الملف غير صالح أو ليس بتنسيق JSON صحيح'));
      }
    };
    reader.onerror = () => reject(new Error('حدث خطأ أثناء قراءة الملف'));
    reader.readAsText(file);
  });
};

export { STORAGE_KEYS };
