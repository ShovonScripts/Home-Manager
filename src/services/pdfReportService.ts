import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import { getDatabase } from '../storage/database';
import { formatCurrency } from '../utils/currency';

export const PdfReportService = {
  async generateMonthlyReport(): Promise<void> {
    try {
      const db = await getDatabase();

      const household = await db.getFirstAsync<any>('SELECT * FROM households LIMIT 1');
      const currency = household?.currency || '৳';
      const householdName = household?.name || 'My Household';

      const now = new Date();
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const currentMonthName = monthNames[now.getMonth()];
      const currentYear = now.getFullYear();

      const currentMonthIndex = now.getMonth();
      const expenses = await db.getAllAsync<any>('SELECT * FROM expenses ORDER BY date DESC');
      const categories = await db.getAllAsync<any>('SELECT * FROM expense_categories');
      const bills = await db.getAllAsync<any>('SELECT * FROM bills');
      const tasks = await db.getAllAsync<any>('SELECT * FROM tasks');

      // Filter current month expenses
      const monthExpenses = expenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonthIndex && d.getFullYear() === currentYear;
      });

      const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
      const unpaidBills = bills.filter(b => !b.isPaid);
      const totalUnpaidBills = unpaidBills.reduce((sum, b) => sum + b.amount, 0);
      const completedTasks = tasks.filter(t => t.isCompleted).length;
      const totalTasks = tasks.length;

      // Category breakdown
      const breakdown = categories.map(cat => {
        const catExp = monthExpenses.filter(e => e.categoryId === cat.id);
        const catTotal = catExp.reduce((sum, e) => sum + e.amount, 0);
        return {
          name: cat.name,
          total: catTotal,
          percentage: totalSpent > 0 ? (catTotal / totalSpent) * 100 : 0,
          color: cat.color || '#42A5F5',
        };
      }).filter(b => b.total > 0).sort((a, b) => b.total - a.total);

      // Build HTML template with professional styling
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Monthly Household Report</title>
            <style>
              body {
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                color: #333333;
                background-color: #FFFFFF;
                margin: 0;
                padding: 40px;
              }
              .header {
                border-bottom: 2px solid #4F46E5;
                padding-bottom: 20px;
                margin-bottom: 30px;
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
              }
              .title {
                font-size: 28px;
                font-weight: 800;
                color: #1F2937;
                margin: 0 0 5px 0;
              }
              .subtitle {
                font-size: 14px;
                color: #6B7280;
                margin: 0;
              }
              .badge {
                background-color: #EEF2FF;
                color: #4F46E5;
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 700;
                text-transform: uppercase;
              }
              .metrics-grid {
                display: flex;
                gap: 20px;
                margin-bottom: 35px;
              }
              .metric-card {
                flex: 1;
                background: #F9FAFB;
                border: 1px solid #E5E7EB;
                border-radius: 12px;
                padding: 20px;
              }
              .metric-label {
                font-size: 12px;
                font-weight: 600;
                color: #6B7280;
                text-transform: uppercase;
                margin-bottom: 8px;
              }
              .metric-value {
                font-size: 24px;
                font-weight: 700;
                color: #111827;
                margin: 0;
              }
              .section-title {
                font-size: 18px;
                font-weight: 700;
                color: #1F2937;
                margin-bottom: 15px;
                border-left: 4px solid #4F46E5;
                padding-left: 10px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 35px;
              }
              th {
                background-color: #F9FAFB;
                color: #374151;
                font-size: 12px;
                font-weight: 700;
                text-transform: uppercase;
                text-align: left;
                padding: 12px;
                border-bottom: 2px solid #E5E7EB;
              }
              td {
                padding: 12px;
                font-size: 14px;
                color: #4B5563;
                border-bottom: 1px solid #F3F4F6;
              }
              .footer {
                margin-top: 50px;
                border-top: 1px solid #E5E7EB;
                padding-top: 20px;
                text-align: center;
                font-size: 12px;
                color: #9CA3AF;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <h1 class="title">${householdName}</h1>
                <p class="subtitle">Monthly Summary Report • Generated on ${new Date().toLocaleDateString()}</p>
              </div>
              <div>
                <span class="badge">${currentMonthName} ${currentYear}</span>
              </div>
            </div>

            <div class="metrics-grid">
              <div class="metric-card">
                <div class="metric-label">Total Monthly Spending</div>
                <div class="metric-value">${formatCurrency(totalSpent, currency)}</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Unpaid Bills</div>
                <div class="metric-value" style="color: #DC2626;">${formatCurrency(totalUnpaidBills, currency)}</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Tasks Completed</div>
                <div class="metric-value" style="color: #059669;">${completedTaskCountDisplay(completedTasks, totalTasks)}</div>
              </div>
            </div>

            <div class="section-title">Spending by Category</div>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Share</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${breakdown.length > 0 ? breakdown.map(b => `
                  <tr>
                    <td><strong>${b.name}</strong></td>
                    <td>${b.percentage.toFixed(1)}%</td>
                    <td style="text-align: right; font-weight: 600;">${formatCurrency(b.total, currency)}</td>
                  </tr>
                `).join('') : `<tr><td colspan="3" style="text-align: center; color: #9CA3AF;">No expenses recorded for this month.</td></tr>`}
              </tbody>
            </table>

            <div class="section-title">Recent Expenses (${currentMonthName})</div>
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Paid By</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${monthExpenses.length > 0 ? monthExpenses.slice(0, 10).map(e => `
                  <tr>
                    <td><strong>${e.title}</strong>${e.notes ? `<br><small style="color: #9CA3AF;">${e.notes}</small>` : ''}</td>
                    <td>${new Date(e.date).toLocaleDateString()}</td>
                    <td>${e.paidBy}</td>
                    <td style="text-align: right; font-weight: 600;">${formatCurrency(e.amount, currency)}</td>
                  </tr>
                `).join('') : `<tr><td colspan="4" style="text-align: center; color: #9CA3AF;">No expenses found.</td></tr>`}
              </tbody>
            </table>

            <div class="footer">
              Home Manager App • Powered by Offline SQLite • Developed by Shovon
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Error', 'Sharing is not available on this device.');
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `${currentMonthName}_${currentYear}_Report.pdf`,
        UTI: 'com.adobe.pdf',
      });
    } catch (error: any) {
      console.error('PDF generation error:', error);
      Alert.alert('Export Failed', error?.message || 'Could not generate PDF report.');
    }
  },
};

function completedTaskCountDisplay(completed: number, total: number) {
  return `${completed} / ${total}`;
}
