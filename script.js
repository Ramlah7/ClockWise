document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');

    const clockHours = document.getElementById('clock-hours');
    const clockMinutes = document.getElementById('clock-minutes');
    const clockSeconds = document.getElementById('clock-seconds');
    const clockDay = document.getElementById('clock-day');
    const clockDate = document.getElementById('clock-date');
    const clockMonth = document.getElementById('clock-month');
    const clockYear = document.getElementById('clock-year');
    const toggle1224HourButton = document.getElementById('toggle-12-24-hour');

    const stopwatchHours = document.getElementById('stopwatch-hours');
    const stopwatchMinutes = document.getElementById('stopwatch-minutes');
    const stopwatchSeconds = document.getElementById('stopwatch-seconds');
    const stopwatchMilliseconds = document.getElementById('stopwatch-milliseconds');
    const stopwatchStartBtn = document.getElementById('stopwatch-start');
    const stopwatchPauseBtn = document.getElementById('stopwatch-pause');
    const stopwatchResetBtn = document.getElementById('stopwatch-reset');
    const stopwatchLapBtn = document.getElementById('stopwatch-lap');
    const stopwatchLapsList = document.getElementById('stopwatch-laps');

    const countdownHoursInput = document.getElementById('countdown-hours-input');
    const countdownMinutesInput = document.getElementById('countdown-minutes-input');
    const countdownSecondsInput = document.getElementById('countdown-seconds-input');
    const countdownHoursDisplay = document.getElementById('countdown-hours');
    const countdownMinutesDisplay = document.getElementById('countdown-minutes');
    const countdownSecondsDisplay = document.getElementById('countdown-seconds');
    const countdownStartBtn = document.getElementById('countdown-start');
    const countdownPauseBtn = document.getElementById('countdown-pause');
    const countdownResetBtn = document.getElementById('countdown-reset');
    const countdownProgressBar = document.getElementById('countdown-progress-bar');

    const newTaskText = document.getElementById('new-task-text');
    const newTaskDeadline = document.getElementById('new-task-deadline');
    const addTaskButton = document.getElementById('add-task-button');
    const taskList = document.getElementById('task-list');

    let isDarkMode = false;
    let is12HourFormat = false;
    let activeTab = 'digital-clock';

    let stopwatchInterval = null;
    let stopwatchTime = 0;
    let stopwatchLaps = [];

    let countdownInterval = null;
    let countdownTime = 0;
    let countdownCurrentTime = 0;

    let audioContext = null;
    let countdownBuffer = null;
    const COUNTDOWN_AUDIO_URL = 'alarm.mp3';

    let tasks = [];

    function formatTime(ms) {
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const milliseconds = Math.floor((ms % 1000) / 10);

        return [
            String(hours).padStart(2, '0'),
            String(minutes).padStart(2, '0'),
            String(seconds).padStart(2, '0'),
            String(milliseconds).padStart(2, '0')
        ].join(':');
    }

    function formatSeconds(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return [
            String(hours).padStart(2, '0'),
            String(minutes).padStart(2, '0'),
            String(seconds).padStart(2, '0')
        ].join(':');
    }

    function playCountdownAlarm() {
        if (audioContext && countdownBuffer) {
            const source = audioContext.createBufferSource();
            source.buffer = countdownBuffer;
            source.connect(audioContext.destination);
            source.start(0);
            console.log("Countdown alarm played.");
        } else {
            console.warn("Audio context or buffer not ready. Cannot play sound.");
        }
    }

    async function initAudioContextAndLoadSound() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        if (!countdownBuffer) {
            try {
                const response = await fetch(COUNTDOWN_AUDIO_URL);
                const arrayBuffer = await response.arrayBuffer();
                countdownBuffer = await audioContext.decodeAudioData(arrayBuffer);
                console.log("Countdown sound loaded successfully.");
            } catch (error) {
                console.error("Error loading or decoding countdown sound:", error);
                countdownBuffer = null;
            }
        }
    }

    document.body.addEventListener('click', () => {
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume()
                .then(() => {
                    console.log("AudioContext resumed successfully.");
                })
                .catch(e => console.warn("Error resuming AudioContext:", e));
        }
    }, { once: true });

    function saveState() {
        localStorage.setItem('clockwise_isDarkMode', JSON.stringify(isDarkMode));
        localStorage.setItem('clockwise_activeTab', activeTab);
        localStorage.setItem('clockwise_tasks', JSON.stringify(tasks));
        localStorage.setItem('clockwise_is12HourFormat', JSON.stringify(is12HourFormat));
    }

    function loadState() {
        const storedDarkMode = localStorage.getItem('clockwise_isDarkMode');
        if (storedDarkMode !== null) {
            isDarkMode = JSON.parse(storedDarkMode);
            document.body.classList.toggle('dark-mode', isDarkMode);
            themeToggle.querySelector('i').className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
        }

        const storedActiveTab = localStorage.getItem('clockwise_activeTab');
        if (storedActiveTab) {
            activeTab = storedActiveTab;
            switchTab(activeTab);
        } else {
            switchTab('digital-clock');
        }

        const storedTasks = localStorage.getItem('clockwise_tasks');
        if (storedTasks) {
            tasks = JSON.parse(storedTasks);
            renderTasks();
        }

        const stored12HourFormat = localStorage.getItem('clockwise_is12HourFormat');
        if (stored12HourFormat !== null) {
            is12HourFormat = JSON.parse(stored12HourFormat);
        }
    }

    themeToggle.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        document.body.classList.toggle('dark-mode', isDarkMode);
        themeToggle.querySelector('i').className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
        saveState();
    });

    function switchTab(tabId) {
        tabButtons.forEach(button => button.classList.remove('active'));
        tabPanes.forEach(pane => pane.classList.remove('active'));

        document.querySelector(`.tab-button[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(tabId).classList.add('active');
        activeTab = tabId;
        saveState();

        if (stopwatchInterval) {
            pauseStopwatch();
        }
        if (countdownInterval) {
            pauseCountdown();
        }
        
        if (tabId !== 'countdown-timer') {
            countdownHoursInput.value = 0;
            countdownMinutesInput.value = 0;
            countdownSecondsInput.value = 0;
            countdownTime = 0;
            countdownCurrentTime = 0;
            updateCountdownDisplay();
            updateProgressBar(100);
            countdownStartBtn.disabled = true;
            countdownPauseBtn.disabled = true;
            countdownResetBtn.disabled = true;
        }
    }

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            switchTab(button.dataset.tab);
        });
    });

    function updateClock() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();

        const day = now.toLocaleString('en-US', { weekday: 'long' });
        const date = now.getDate();
        const month = now.toLocaleString('en-US', { month: 'long' });
        const year = now.getFullYear();

        if (is12HourFormat) {
            hours = hours % 12;
            hours = hours ? hours : 12;
            const ampm = hours >= 12 ? 'PM' : 'AM';
            clockHours.textContent = String(hours).padStart(2, '0');
            clockMinutes.textContent = String(minutes).padStart(2, '0') + ampm;
        } else {
            clockHours.textContent = String(hours).padStart(2, '0');
            clockMinutes.textContent = String(minutes).padStart(2, '0');
        }
        clockSeconds.textContent = String(seconds).padStart(2, '0');

        clockDay.textContent = day;
        clockDate.textContent = String(date).padStart(2, '0');
        clockMonth.textContent = month;
        clockYear.textContent = year;
    }

    toggle1224HourButton.addEventListener('click', () => {
        is12HourFormat = !is12HourFormat;
        saveState();
        updateClock();
    });

    setInterval(updateClock, 1000);
    updateClock();

    function updateStopwatchDisplay() {
        const formattedTime = formatTime(stopwatchTime);
        const parts = formattedTime.split(':');
        stopwatchHours.textContent = parts[0];
        stopwatchMinutes.textContent = parts[1];
        stopwatchSeconds.textContent = parts[2];
        stopwatchMilliseconds.textContent = parts[3];
    }

    function startStopwatch() {
        if (!stopwatchInterval) {
            const startTime = Date.now() - stopwatchTime;
            stopwatchInterval = setInterval(() => {
                stopwatchTime = Date.now() - startTime;
                updateStopwatchDisplay();
            }, 10);

            stopwatchStartBtn.disabled = true;
            stopwatchPauseBtn.disabled = false;
            stopwatchResetBtn.disabled = false;
            stopwatchLapBtn.disabled = false;
        }
    }

    function pauseStopwatch() {
        clearInterval(stopwatchInterval);
        stopwatchInterval = null;
        stopwatchStartBtn.disabled = false;
        stopwatchPauseBtn.disabled = true;
        stopwatchLapBtn.disabled = true;
    }

    function resetStopwatch() {
        pauseStopwatch();
        stopwatchTime = 0;
        stopwatchLaps = [];
        updateStopwatchDisplay();
        stopwatchLapsList.innerHTML = '';
        stopwatchResetBtn.disabled = true;
        stopwatchLapBtn.disabled = true;
    }

    function recordLap() {
        const lapNumber = stopwatchLaps.length + 1;
        const lapTime = formatTime(stopwatchTime);
        stopwatchLaps.push({ number: lapNumber, time: lapTime });

        const listItem = document.createElement('li');
        listItem.innerHTML = `<span>Lap ${lapNumber}:</span> <span>${lapTime}</span>`;
        stopwatchLapsList.prepend(listItem);
    }

    stopwatchStartBtn.addEventListener('click', startStopwatch);
    stopwatchPauseBtn.addEventListener('click', pauseStopwatch);
    stopwatchResetBtn.addEventListener('click', resetStopwatch);
    stopwatchLapBtn.addEventListener('click', recordLap);

    function updateCountdownDisplay() {
        const totalSeconds = Math.max(0, Math.floor(countdownCurrentTime / 1000));
        const formattedTime = formatSeconds(totalSeconds);
        const parts = formattedTime.split(':');
        countdownHoursDisplay.textContent = parts[0];
        countdownMinutesDisplay.textContent = parts[1];
        countdownSecondsDisplay.textContent = parts[2];
    }

    function updateProgressBar(percentage) {
        countdownProgressBar.style.width = `${percentage}%`;
    }

    function setCountdownTime() {
        const hours = parseInt(countdownHoursInput.value) || 0;
        const minutes = parseInt(countdownMinutesInput.value) || 0;
        const seconds = parseInt(countdownSecondsInput.value) || 0;

        countdownTime = (hours * 3600 + minutes * 60 + seconds) * 1000;
        countdownCurrentTime = countdownTime;

        if (countdownTime > 0) {
            countdownStartBtn.disabled = false;
            countdownResetBtn.disabled = false;
        } else {
            countdownStartBtn.disabled = true;
            countdownResetBtn.disabled = true;
        }
        updateCountdownDisplay();
        updateProgressBar(100);
    }

    function startCountdown() {
        if (countdownCurrentTime <= 0) {
            setCountdownTime();
            if (countdownCurrentTime <= 0) return;
        }

        if (!countdownInterval) {
            let lastTickTime = Date.now();
            countdownInterval = setInterval(() => {
                const now = Date.now();
                const elapsed = now - lastTickTime;
                lastTickTime = now;

                countdownCurrentTime = Math.max(0, countdownCurrentTime - elapsed);
                updateCountdownDisplay();

                const progress = (countdownCurrentTime / countdownTime) * 100;
                updateProgressBar(progress);

                if (countdownCurrentTime <= 0) {
                    clearInterval(countdownInterval);
                    countdownInterval = null;
                    playCountdownAlarm();
                    countdownStartBtn.disabled = true;
                    countdownPauseBtn.disabled = true;
                }
            }, 100);
        }

        countdownStartBtn.disabled = true;
        countdownPauseBtn.disabled = false;
        countdownResetBtn.disabled = false;
    }

    function pauseCountdown() {
        clearInterval(countdownInterval);
        countdownInterval = null;
        countdownStartBtn.disabled = false;
        countdownPauseBtn.disabled = true;
    }

    function resetCountdown() {
        pauseCountdown();
        countdownCurrentTime = countdownTime;
        updateCountdownDisplay();
        updateProgressBar(100);
        countdownStartBtn.disabled = countdownTime === 0;
        countdownPauseBtn.disabled = true;
        countdownResetBtn.disabled = countdownTime === 0;
    }

    countdownHoursInput.addEventListener('input', setCountdownTime);
    countdownMinutesInput.addEventListener('input', setCountdownTime);
    countdownSecondsInput.addEventListener('input', setCountdownTime);
    countdownStartBtn.addEventListener('click', startCountdown);
    countdownPauseBtn.addEventListener('click', pauseCountdown);
    countdownResetBtn.addEventListener('click', resetCountdown);

    function renderTasks() {
        taskList.innerHTML = '';
        tasks.forEach(task => {
            const listItem = document.createElement('li');
            listItem.classList.add('task-item');
            if (task.completed) {
                listItem.classList.add('completed');
            }
            listItem.dataset.id = task.id;

            const deadlineText = task.deadline ? new Date(task.deadline).toLocaleString() : 'No deadline';
            let countdownHtml = '';
            if (task.deadline && !task.completed) {
                const timeLeft = new Date(task.deadline).getTime() - Date.now();
                if (timeLeft > 0) {
                    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                    countdownHtml = `<span class="countdown-text"> (${days}d ${hours}h ${minutes}m left)</span>`;
                } else {
                    countdownHtml = `<span class="countdown-text overdue"> (Overdue!)</span>`;
                }
            }

            listItem.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <div class="task-content">
                    <span class="task-text">${task.text}</span>
                    <span class="task-deadline">${deadlineText}${countdownHtml}</span>
                </div>
                <div class="task-actions">
                    <button class="icon-button delete-button" aria-label="Delete task">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

            listItem.querySelector('.task-checkbox').addEventListener('change', (event) => {
                markTaskComplete(task.id, event.target.checked);
            });

            listItem.querySelector('.delete-button').addEventListener('click', () => {
                deleteTask(task.id);
            });

            taskList.appendChild(listItem);
        });
    }

    function addTask() {
        const text = newTaskText.value.trim();
        const deadline = newTaskDeadline.value;

        if (text) {
            const newTask = {
                id: Date.now().toString(),
                text: text,
                deadline: deadline,
                completed: false
            };
            tasks.push(newTask);
            newTaskText.value = '';
            newTaskDeadline.value = '';
            saveState();
            renderTasks();
        }
    }

    function markTaskComplete(id, completed) {
        const taskIndex = tasks.findIndex(task => task.id === id);
        if (taskIndex > -1) {
            tasks[taskIndex].completed = completed;
            saveState();
            renderTasks();
        }
    }

    function deleteTask(id) {
        tasks = tasks.filter(task => task.id !== id);
        saveState();
        renderTasks();
    }

    addTaskButton.addEventListener('click', addTask);
    newTaskText.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addTask();
        }
    });

    setInterval(renderTasks, 60 * 1000);

    loadState();

    initAudioContextAndLoadSound();
});