// script.js

// Tab switching
function showTab(tabId) {
  const tabs = document.querySelectorAll('.tab-content');
  tabs.forEach(tab => tab.style.display = 'none');
  document.getElementById(tabId).style.display = 'block';
}

// ======= CLOCK =======
function updateClock() {
  const clock = document.getElementById('digitalClock');
  const now = new Date();
  const hrs = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');
  const secs = String(now.getSeconds()).padStart(2, '0');
  clock.textContent = `${hrs}:${mins}:${secs}`;
}
setInterval(updateClock, 1000);
updateClock(); // Call once immediately

// ======= STOPWATCH =======
let swInterval;
let swSeconds = 0;

function formatStopwatch(sec) {
  const h = String(Math.floor(sec / 3600)).padStart(2, '0');
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function updateStopwatchDisplay() {
  document.getElementById('stopwatchDisplay').textContent = formatStopwatch(swSeconds);
}

function startStopwatch() {
  if (!swInterval) {
    swInterval = setInterval(() => {
      swSeconds++;
      updateStopwatchDisplay();
    }, 1000);
  }
}

function pauseStopwatch() {
  clearInterval(swInterval);
  swInterval = null;
}

function resetStopwatch() {
  pauseStopwatch();
  swSeconds = 0;
  updateStopwatchDisplay();
}

// ======= TIMER =======
let timerInterval;
let timerRemaining = 0;

function formatTimer(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function updateTimerDisplay() {
  document.getElementById('timerDisplay').textContent = formatTimer(timerRemaining);
}

function startTimer() {
  const minsInput = document.getElementById('minutesInput').value;
  timerRemaining = parseInt(minsInput) * 60;
  if (isNaN(timerRemaining) || timerRemaining <= 0) return;

  updateTimerDisplay();
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (timerRemaining > 0) {
      timerRemaining--;
      updateTimerDisplay();
    } else {
      clearInterval(timerInterval);
      alert("⏰ Time's up!");
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timerInterval);
  timerRemaining = 0;
  updateTimerDisplay();
}
