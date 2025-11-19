(function () {
  let zakatModal = null;

  function openZakatCalculator() {
    if (!zakatModal) createZakatCalculatorModal();
    zakatModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeZakatCalculator() {
    if (zakatModal) {
      zakatModal.classList.remove('active');
      document.body.style.overflow = '';
      resetZakatCalculator();
    }
  }

  function createZakatCalculatorModal() {
    zakatModal = document.createElement('div');
    zakatModal.className = 'zakat-modal';
    zakatModal.innerHTML = `
      <div class="modal-overlay" onclick="closeZakatCalculator()"></div>
      <div class="modal-content zakat-modal-content">
        <button class="modal-close" onclick="closeZakatCalculator()" aria-label="Close">&times;</button>
        <div class="modal-header">
          <h2>🕌 Zakat Calculator</h2>
          <p>Calculate your Zakat obligation with ease</p>
        </div>
        <div class="modal-body zakat-calculator-body">
          <div class="nisab-reference">
            <h3>Current Nisab Value</h3>
            <div class="nisab-values">
              <div class="nisab-item"><span class="nisab-label">Gold (87.48g)</span><span class="nisab-value" id="nisabGold">$11,427.70</span></div>
              <div class="nisab-item"><span class="nisab-label">Silver (612.36g)</span><span class="nisab-value" id="nisabSilver">$990.66</span></div>
            </div>
            <p class="nisab-note">Zakat is 2.5% of wealth above Nisab threshold</p>
          </div>
          <form id="zakatCalculatorForm" class="zakat-form">
            <div class="zakat-section">
              <h3>💰 Cash & Bank Balances</h3>
              <div class="form-group"><label>Cash at home</label><input type="number" class="zakat-input" id="cashHome" min="0" step="0.01" placeholder="0.00"></div>
              <div class="form-group"><label>Bank accounts (checking/savings)</label><input type="number" class="zakat-input" id="bankAccounts" min="0" step="0.01" placeholder="0.00"></div>
            </div>
            <div class="zakat-section">
              <h3>✨ Gold & Silver</h3>
              <div class="form-row">
                <div class="form-group"><label>Gold (grams)</label><input type="number" class="zakat-input" id="goldWeight" min="0" step="0.01" placeholder="0.00"></div>
                <div class="form-group"><label>Gold value ($)</label><input type="number" class="zakat-input" id="goldValue" min="0" step="0.01" placeholder="0.00" readonly></div>
              </div>
              <div class="form-row">
                <div class="form-group"><label>Silver (grams)</label><input type="number" class="zakat-input" id="silverWeight" min="0" step="0.01" placeholder="0.00"></div>
                <div class="form-group"><label>Silver value ($)</label><input type="number" class="zakat-input" id="silverValue" min="0" step="0.01" placeholder="0.00" readonly></div>
              </div>
              <div class="form-group"><label>Other precious metals/jewelry value</label><input type="number" class="zakat-input" id="otherPreciousMetals" min="0" step="0.01" placeholder="0.00"></div>
            </div>
            <div class="zakat-section">
              <h3>📈 Investments</h3>
              <div class="form-group"><label>Stocks & shares</label><input type="number" class="zakat-input" id="stocks" min="0" step="0.01" placeholder="0.00"></div>
              <div class="form-group"><label>Business inventory & assets</label><input type="number" class="zakat-input" id="businessAssets" min="0" step="0.01" placeholder="0.00"></div>
              <div class="form-group"><label>Investment properties (rental income value)</label><input type="number" class="zakat-input" id="investmentProperties" min="0" step="0.01" placeholder="0.00"></div>
              <div class="form-group"><label>Retirement funds (401k, IRA, etc.)</label><input type="number" class="zakat-input" id="retirementFunds" min="0" step="0.01" placeholder="0.00"></div>
            </div>
            <div class="zakat-section">
              <h3>💵 Money Owed to You</h3>
              <div class="form-group"><label>Loans given to others (expected to be repaid)</label><input type="number" class="zakat-input" id="loansGiven" min="0" step="0.01" placeholder="0.00"></div>
            </div>
            <div class="zakat-section">
              <h3>📋 Liabilities (Deduct from total)</h3>
              <div class="form-group"><label>Debts due within the year</label><input type="number" class="zakat-input" id="debts" min="0" step="0.01" placeholder="0.00"></div>
              <div class="form-group"><label>Unpaid bills & expenses</label><input type="number" class="zakat-input" id="unpaidBills" min="0" step="0.01" placeholder="0.00"></div>
            </div>
            <button type="button" class="calculate-btn" onclick="calculateZakat()">Calculate My Zakat</button>
          </form>
          <div id="zakatResults" class="zakat-results" style="display: none;">
            <h3>📊 Your Zakat Calculation</h3>
            <div class="result-summary">
              <div class="result-item"><span class="result-label">Total Zakatable Wealth:</span><span class="result-value" id="totalWealth">$0.00</span></div>
              <div class="result-item"><span class="result-label">Less Liabilities:</span><span class="result-value" id="totalLiabilities">$0.00</span></div>
              <div class="result-item net-wealth"><span class="result-label">Net Zakatable Wealth:</span><span class="result-value" id="netWealth">$0.00</span></div>
              <div class="result-item zakat-due"><span class="result-label">Zakat Due (2.5%):</span><span class="result-value zakat-amount" id="zakatDue">$0.00</span></div>
            </div>
            <div id="zakatStatus" class="zakat-status"></div>
            <div class="result-actions">
              <button class="pay-zakat-btn" onclick="payZakat()">Pay Zakat Now</button>
              <button class="print-btn" onclick="printZakatReport()">Print Report</button>
              <button class="reset-btn" onclick="resetZakatCalculator()">Reset Calculator</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(zakatModal);
    setupZakatCalculatorListeners();
  }

  function setupZakatCalculatorListeners() {
    const goldPricePerGram = 57.0;
    const silverPricePerGram = 0.57;

    const goldWeightInput = document.getElementById('goldWeight');
    const goldValueInput = document.getElementById('goldValue');
    const silverWeightInput = document.getElementById('silverWeight');
    const silverValueInput = document.getElementById('silverValue');

    const zakatInputs = document.querySelectorAll('.zakat-input');
    zakatInputs.forEach(input => {
      input.addEventListener('keydown', function (e) {
        if (e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault();
      });
      input.addEventListener('input', function () { if (this.value < 0) this.value = 0; });
      input.addEventListener('blur', function () { if (this.value < 0 || this.value === '') this.value = 0; });
    });

    if (goldWeightInput) {
      goldWeightInput.addEventListener('input', function () {
        const weight = parseFloat(this.value) || 0;
        goldValueInput.value = (Math.max(0, weight) * goldPricePerGram).toFixed(2);
      });
    }
    if (silverWeightInput) {
      silverWeightInput.addEventListener('input', function () {
        const weight = parseFloat(this.value) || 0;
        silverValueInput.value = (Math.max(0, weight) * silverPricePerGram).toFixed(2);
      });
    }
  }

  function calculateZakat() {
    const getPositiveValue = (id) => {
      const value = parseFloat(document.getElementById(id).value) || 0;
      return value < 0 ? 0 : value;
    };

    const cashHome = getPositiveValue('cashHome');
    const bankAccounts = getPositiveValue('bankAccounts');
    const goldValue = getPositiveValue('goldValue');
    const silverValue = getPositiveValue('silverValue');
    const otherPreciousMetals = getPositiveValue('otherPreciousMetals');
    const stocks = getPositiveValue('stocks');
    const businessAssets = getPositiveValue('businessAssets');
    const investmentProperties = getPositiveValue('investmentProperties');
    const retirementFunds = getPositiveValue('retirementFunds');
    const loansGiven = getPositiveValue('loansGiven');
    const debts = getPositiveValue('debts');
    const unpaidBills = getPositiveValue('unpaidBills');

    const totalAssets = cashHome + bankAccounts + goldValue + silverValue + otherPreciousMetals + stocks + businessAssets + investmentProperties + retirementFunds + loansGiven;
    const totalLiabilities = debts + unpaidBills;
    const netWealth = Math.max(0, totalAssets - totalLiabilities);
    const zakatDue = netWealth * 0.025;

    const nisabThreshold = 350;

    document.getElementById('totalWealth').textContent = '$' + totalAssets.toFixed(2);
    document.getElementById('totalLiabilities').textContent = '$' + totalLiabilities.toFixed(2);
    document.getElementById('netWealth').textContent = '$' + netWealth.toFixed(2);
    document.getElementById('zakatDue').textContent = '$' + zakatDue.toFixed(2);

    const statusDiv = document.getElementById('zakatStatus');
    if (netWealth >= nisabThreshold) {
      statusDiv.innerHTML = `
        <div class="status-success">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <p>Your wealth is above the Nisab threshold. Zakat is due: <strong>$${zakatDue.toFixed(2)}</strong></p>
        </div>`;
    } else {
      statusDiv.innerHTML = `
        <div class="status-info">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <p>Your wealth is below the Nisab threshold. Zakat is not obligatory at this time.</p>
        </div>`;
    }

    document.getElementById('zakatResults').style.display = 'block';
    document.getElementById('zakatResults').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function payZakat() {
    const zakatAmount = parseFloat(document.getElementById('zakatDue').textContent.replace('$', ''));
    if (zakatAmount <= 0) {
      alert('No Zakat amount to pay');
      return;
    }
    closeZakatCalculator();
    setTimeout(() => {
      window.openDonateModal('zakat');
      const modalAmount = document.getElementById('modalAmount');
      if (modalAmount) modalAmount.value = zakatAmount.toFixed(2);
    }, 300);
  }

  function printZakatReport() {
    const totalWealth = document.getElementById('totalWealth').textContent;
    const totalLiabilities = document.getElementById('totalLiabilities').textContent;
    const netWealth = document.getElementById('netWealth').textContent;
    const zakatDue = document.getElementById('zakatDue').textContent;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html><head><title>Zakat Calculation Report</title>
      <style>
        body{font-family:Arial,sans-serif;padding:40px;max-width:800px;margin:0 auto;}
        h1{color:#1a5245;text-align:center;margin-bottom:30px;}
        .report-date{text-align:right;color:#666;margin-bottom:30px;}
        table{width:100%;border-collapse:collapse;margin:20px 0;}
        th,td{padding:12px;text-align:left;border-bottom:1px solid #ddd;}
        th{background:#f5f5f5;font-weight:bold;}
        .total-row{font-weight:bold;background:#f9f9f9;}
        .zakat-due{background:#1a5245;color:#fff;font-size:1.2em;}
        .footer{margin-top:40px;padding-top:20px;border-top:2px solid #1a5245;text-align:center;color:#666;}
      </style></head>
      <body>
        <h1>🕌 Zakat Calculation Report</h1>
        <div class="report-date">Date: ${new Date().toLocaleDateString()}</div>
        <table>
          <tr><th>Description</th><th>Amount</th></tr>
          <tr class="total-row"><td>Total Zakatable Wealth</td><td>${totalWealth}</td></tr>
          <tr><td>Less: Liabilities</td><td>${totalLiabilities}</td></tr>
          <tr class="total-row"><td>Net Zakatable Wealth</td><td>${netWealth}</td></tr>
          <tr class="zakat-due"><td>Zakat Due (2.5%)</td><td>${zakatDue}</td></tr>
        </table>
        <div class="footer">
          <p>Humanity First Foundation</p>
          <p>This is a computer-generated report for your personal records.</p>
        </div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  }

  function resetZakatCalculator() {
    const form = document.getElementById('zakatCalculatorForm');
    if (form) form.reset();
    const results = document.getElementById('zakatResults');
    if (results) results.style.display = 'none';
  }

  window.openZakatCalculator = openZakatCalculator;
  window.closeZakatCalculator = closeZakatCalculator;
  window.calculateZakat = calculateZakat;
  window.payZakat = payZakat;
  window.printZakatReport = printZakatReport;
  window.resetZakatCalculator = resetZakatCalculator;
})();
