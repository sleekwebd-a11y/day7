// app.js
let bankroll = 0;
let history = [];
let wins = 0;
let losses = 0;

const bankrollInput = document.getElementById('bankroll');
const currentBankrollEl = document.getElementById('current-bankroll');
const winsEl = document.getElementById('total-wins');
const lossesEl = document.getElementById('total-losses');
const historyList = document.getElementById('history-list');
const slotDisplay = document.getElementById('slot-display');
const spinningNumbers = document.getElementById('spinning-numbers');
const riskShow = document.getElementById('risk-show');

function loadData() {
  const saved = localStorage.getItem('fb_bankroll');
  if (saved) {
    bankroll = parseFloat(saved);
    bankrollInput.value = bankroll;
    currentBankrollEl.textContent = formatMoney(bankroll);
  }
  const savedHist = localStorage.getItem('fb_history');
  if (savedHist) {
    history = JSON.parse(savedHist);
    wins = history.filter(h => h.type === 'win').length;
    losses = history.filter(h => h.type === 'loss').length;
    updateStats();
    renderHistory();
  }
}

function saveData() {
  localStorage.setItem('fb_bankroll', bankroll);
  localStorage.setItem('fb_history', JSON.stringify(history));
}

function formatMoney(num) {
  return '$' + Math.abs(num).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0});
}

function spinFate() {
  bankroll = parseFloat(bankrollInput.value) || 0;
  if (bankroll <= 0) {
    showToast("Need money to let fate ruin it 😈");
    return;
  }

  saveData();
  currentBankrollEl.textContent = formatMoney(bankroll);

  // Chaos mode: fate picks 1–100%
  const riskPercent = Math.floor(Math.random() * 100) + 1;
  const stake = Math.round((bankroll * riskPercent) / 100);

  // Slot animation
  slotDisplay.classList.add('spinning');
  spinningNumbers.classList.remove('opacity-0');
  spinningNumbers.textContent = formatMoney(Math.floor(Math.random() * bankroll * 2)); // random during spin

  setTimeout(() => {
    spinningNumbers.textContent = formatMoney(stake);
    riskShow.textContent = `(${riskPercent}% — fate has spoken)`;
    slotDisplay.classList.remove('spinning');
    showToast(`Fate chose $${stake} (${riskPercent}%) — good luck idiot`);
  }, 2800);
}

function logResult(type) {
  const amountStr = document.getElementById('amount-log').value.trim();
  if (!amountStr || parseFloat(amountStr) <= 0) {
    showToast("Enter valid amount > $0");
    return;
  }

  const amount = parseFloat(amountStr);
  const note = document.getElementById('note').value.trim() || 'No note';

  if (type === 'win') {
    bankroll += amount;
    wins++;
  } else {
    bankroll -= amount;
    losses++;
  }
  bankroll = Math.max(0, bankroll);

  history.unshift({
    date: new Date().toLocaleString('en-US', {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'}),
    type,
    amount,
    note,
    newBankroll: bankroll
  });

  saveData();
  bankrollInput.value = Math.round(bankroll);
  currentBankrollEl.textContent = formatMoney(bankroll);
  updateStats();
  renderHistory();

  showToast(type === 'win' ? `+$${amount} — you beat fate?!` : `-$${amount} — told you`);

  document.getElementById('amount-log').value = '';
  document.getElementById('note').value = '';
}

function renderHistory() {
  historyList.innerHTML = '';
  if (history.length === 0) {
    historyList.innerHTML = '<p class="text-center text-neutral-600 py-6">No chaos logged yet</p>';
    return;
  }
  history.forEach(h => {
    const div = document.createElement('div');
    div.className = `flex justify-between items-center bg-neutral-800 rounded-2xl px-5 py-4 ${h.type === 'win' ? 'border-l-4 border-emerald-600' : 'border-l-4 border-rose-600'}`;
    div.innerHTML = `
      <div>
        <p class="font-medium">${h.date}</p>
        <p class="text-sm text-neutral-500">${h.note}</p>
      </div>
      <div class="text-right">
        <p class="${h.type === 'win' ? 'text-emerald-400' : 'text-rose-400'} font-bold text-xl">
          ${h.type === 'win' ? '+' : '-'}${formatMoney(h.amount)}
        </p>
        <p class="text-xs text-neutral-600">→ ${formatMoney(h.newBankroll)}</p>
      </div>
    `;
    historyList.appendChild(div);
  });
}

function updateStats() {
  winsEl.textContent = wins;
  lossesEl.textContent = losses;
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toast-text').textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 2400);
}

// Init
loadData();
renderHistory();
updateStats();

console.log('%cFateBet loaded — blame fate, not the app 🎰', 'color:#ef4444; font-weight:bold');
