// script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const themeToggle = document.getElementById('theme-toggle');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');

    // Digital Clock Elements
    const clockHours = document.getElementById('clock-hours');
    const clockMinutes = document.getElementById('clock-minutes');
    const clockSeconds = document.getElementById('clock-seconds');
    const clockDay = document.getElementById('clock-day');
    const clockDate = document.getElementById('clock-date');
    const clockMonth = document.getElementById('clock-month');
    const clockYear = document.getElementById('clock-year');
    const toggle1224HourButton = document.getElementById('toggle-12-24-hour');

    // Stopwatch Elements
    const stopwatchHours = document.getElementById('stopwatch-hours');
    const stopwatchMinutes = document.getElementById('stopwatch-minutes');
    const stopwatchSeconds = document.getElementById('stopwatch-seconds');
    const stopwatchMilliseconds = document.getElementById('stopwatch-milliseconds');
    const stopwatchStartBtn = document.getElementById('stopwatch-start');
    const stopwatchPauseBtn = document.getElementById('stopwatch-pause');
    const stopwatchResetBtn = document.getElementById('stopwatch-reset');
    const stopwatchLapBtn = document.getElementById('stopwatch-lap');
    const stopwatchLapsList = document.getElementById('stopwatch-laps');

    // Countdown Timer Elements
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

    // Pomodoro Timer Elements
    const pomodoroMinutesDisplay = document.getElementById('pomodoro-minutes');
    const pomodoroSecondsDisplay = document.getElementById('pomodoro-seconds');
    const pomodoroSessionType = document.getElementById('pomodoro-session-type');
    const pomodoroSessionCountDisplay = document.getElementById('pomodoro-session-count');
    const pomodoroStartBtn = document.getElementById('pomodoro-start');
    const pomodoroPauseBtn = document.getElementById('pomodoro-pause');
    const pomodoroResetBtn = document.getElementById('pomodoro-reset');
    const workTimeInput = document.getElementById('work-time-input');
    const breakTimeInput = document.getElementById('break-time-input');
    const autoStartToggle = document.getElementById('auto-start-toggle');

    // To-Do List Elements
    const newTaskText = document.getElementById('new-task-text');
    const newTaskDeadline = document.getElementById('new-task-deadline');
    const addTaskButton = document.getElementById('add-task-button');
    const taskList = document.getElementById('task-list');

    // --- Global State Variables ---
    let isDarkMode = false;
    let is12HourFormat = false; // For digital clock
    let activeTab = 'digital-clock';

    // Stopwatch State
    let stopwatchInterval = null;
    let stopwatchTime = 0; // in milliseconds
    let stopwatchLaps = [];

    // Countdown State
    let countdownInterval = null;
    let countdownTime = 0; // in milliseconds, total time set by user
    let countdownCurrentTime = 0; // in milliseconds, remaining time
    const countdownAudio = new Audio('https://www.soundjay.com/buttons/beep-07.mp3'); // Simple beep sound

    // Pomodoro State
    let pomodoroInterval = null;
    let pomodoroWorkDuration = 25 * 60 * 1000; // Default 25 minutes in ms
    let pomodoroBreakDuration = 5 * 60 * 1000; // Default 5 minutes in ms
    let pomodoroCurrentTime = pomodoroWorkDuration; // Current session remaining time
    let pomodoroIsWorkSession = true;
    let pomodoroSessionCount = 0;
    let pomodoroAutoStart = false;
    const pomodoroAudio = new Audio('https://www.soundjay.com/misc/bell-ringing-05.mp3'); // Bell sound for pomodoro

    // To-Do List State
    let tasks = []; // Array of { id, text, deadline, completed }

    // --- Utility Functions ---

    /**
     * Formats milliseconds into HH:MM:SS:MS string.
     * @param {number} ms - Time in milliseconds.
     * @returns {string} Formatted time string.
     */
    function formatTime(ms) {
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const milliseconds = Math.floor((ms % 1000) / 10); // Displaying 2 digits for ms

        return [
            String(hours).padStart(2, '0'),
            String(minutes).padStart(2, '0'),
            String(seconds).padStart(2, '0'),
            String(milliseconds).padStart(2, '0')
        ].join(':');
    }

    /**
     * Formats seconds into HH:MM:SS string.
     * @param {number} totalSeconds - Total seconds.
     * @returns {string} Formatted time string.
     */
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

    /**
     * Plays a given audio element.
     * @param {HTMLAudioElement} audio - The audio element to play.
     */
    function playSound(audio) {
        audio.currentTime = 0; // Rewind to start
        audio.play().catch(e => console.error("Error playing sound:", e));
    }

    // --- LocalStorage Functions ---

    /**
     * Saves app state to LocalStorage.
     */
    function saveState() {
        localStorage.setItem('clockwise_isDarkMode', JSON.stringify(isDarkMode));
        localStorage.setItem('clockwise_activeTab', activeTab);
        localStorage.setItem('clockwise_tasks', JSON.stringify(tasks));
        localStorage.setItem('clockwise_is12HourFormat', JSON.stringify(is12HourFormat));
        localStorage.setItem('clockwise_pomodoroWorkDuration', JSON.stringify(pomodoroWorkDuration));
        localStorage.setItem('clockwise_pomodoroBreakDuration', JSON.stringify(pomodoroBreakDuration));
        localStorage.setItem('clockwise_pomodoroAutoStart', JSON.stringify(pomodoroAutoStart));
        localStorage.setItem('clockwise_pomodoroSessionCount', JSON.stringify(pomodoroSessionCount));
    }

    /**
     * Loads app state from LocalStorage.
     */
    function loadState() {
        // Dark Mode
        const storedDarkMode = localStorage.getItem('clockwise_isDarkMode');
        if (storedDarkMode !== null) {
            isDarkMode = JSON.parse(storedDarkMode);
            document.body.classList.toggle('dark-mode', isDarkMode);
            themeToggle.querySelector('i').className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
        }

        // Active Tab
        const storedActiveTab = localStorage.getItem('clockwise_activeTab');
        if (storedActiveTab) {
            activeTab = storedActiveTab;
            switchTab(activeTab);
        } else {
            // Default to digital-clock if no tab is stored
            switchTab('digital-clock');
        }

        // Tasks
        const storedTasks = localStorage.getItem('clockwise_tasks');
        if (storedTasks) {
            tasks = JSON.parse(storedTasks);
            renderTasks();
        }

        // 12/24 Hour Format
        const stored12HourFormat = localStorage.getItem('clockwise_is12HourFormat');
        if (stored12HourFormat !== null) {
            is12HourFormat = JSON.parse(stored12HourFormat);
        }

        // Pomodoro Settings
        const storedWorkDuration = localStorage.getItem('clockwise_pomodoroWorkDuration');
        if (storedWorkDuration) {
            pomodoroWorkDuration = JSON.parse(storedWorkDuration);
            workTimeInput.value = pomodoroWorkDuration / (60 * 1000);
        }
        const storedBreakDuration = localStorage.getItem('clockwise_pomodoroBreakDuration');
        if (storedBreakDuration) {
            pomodoroBreakDuration = JSON.parse(storedBreakDuration);
            breakTimeInput.value = pomodoroBreakDuration / (60 * 1000);
        }
        const storedAutoStart = localStorage.getItem('clockwise_pomodoroAutoStart');
        if (storedAutoStart !== null) {
            pomodoroAutoStart = JSON.parse(storedAutoStart);
            autoStartToggle.checked = pomodoroAutoStart;
        }
        const storedSessionCount = localStorage.getItem('clockwise_pomodoroSessionCount');
        if (storedSessionCount !== null) {
            pomodoroSessionCount = JSON.parse(storedSessionCount);
            pomodoroSessionCountDisplay.textContent = `(Session ${pomodoroSessionCount})`;
        }
    }

    // --- Theme Toggle ---
    themeToggle.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        document.body.classList.toggle('dark-mode', isDarkMode);
        themeToggle.querySelector('i').className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
        saveState();
    });

    // --- Tab Switching ---
    /**
     * Switches the active tab in the UI.
     * @param {string} tabId - The ID of the tab to activate.
     */
    function switchTab(tabId) {
        // Deactivate current tab
        tabButtons.forEach(button => button.classList.remove('active'));
        tabPanes.forEach(pane => pane.classList.remove('active'));

        // Activate new tab
        document.querySelector(`.tab-button[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(tabId).classList.add('active');
        activeTab = tabId;
        saveState();

        // Stop any running timers when switching tabs
        if (stopwatchInterval) {
            pauseStopwatch();
        }
        if (countdownInterval) {
            pauseCountdown();
        }
        if (pomodoroInterval) {
            pausePomodoro();
        }

        // Reset inputs for relevant tabs when switching
        if (tabId !== 'countdown-timer') {
            countdownHoursInput.value = 0;
            countdownMinutesInput.value = 0;
            countdownSecondsInput.value = 0;
            countdownTime = 0;
            countdownCurrentTime = 0;
            updateCountdownDisplay();
            updateProgressBar(100); // Reset progress bar
            countdownStartBtn.disabled = true;
            countdownPauseBtn.disabled = true;
            countdownResetBtn.disabled = true;
        }

        if (tabId !== 'pomodoro-timer') {
            // Reset pomodoro display to default work time
            pomodoroCurrentTime = pomodoroIsWorkSession ? pomodoroWorkDuration : pomodoroBreakDuration;
            updatePomodoroDisplay();
            pomodoroStartBtn.disabled = false;
            pomodoroPauseBtn.disabled = true;
            pomodoroResetBtn.disabled = true;
        }
    }

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            switchTab(button.dataset.tab);
        });
    });

    // --- Digital Clock Module ---
    /**
     * Updates the digital clock display every second.
     */
    function updateClock() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();

        const day = now.toLocaleString('en-US', { weekday: 'long' });
        const date = now.getDate();
        const month = now.toLocaleString('en-US', { month: 'long' });
        const year = now.getFullYear();

        // Handle 12/24 hour format
        if (is12HourFormat) {
            hours = hours % 12;
            hours = hours ? hours : 12; // The hour '0' should be '12'
            const ampm = hours >= 12 ? 'PM' : 'AM';
            clockHours.textContent = String(hours).padStart(2, '0');
            // Add AM/PM indicator to minutes for simplicity
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

    // Toggle 12/24 hour format
    toggle1224HourButton.addEventListener('click', () => {
        is12HourFormat = !is12HourFormat;
        saveState();
        updateClock(); // Update immediately
    });

    // Start the digital clock
    setInterval(updateClock, 1000);
    updateClock(); // Initial call to display clock immediately

    // --- Stopwatch Module ---
    /**
     * Updates the stopwatch display.
     */
    function updateStopwatchDisplay() {
        const formattedTime = formatTime(stopwatchTime);
        const parts = formattedTime.split(':');
        stopwatchHours.textContent = parts[0];
        stopwatchMinutes.textContent = parts[1];
        stopwatchSeconds.textContent = parts[2];
        stopwatchMilliseconds.textContent = parts[3];
    }

    /**
     * Starts the stopwatch.
     */
    function startStopwatch() {
        if (!stopwatchInterval) {
            const startTime = Date.now() - stopwatchTime;
            stopwatchInterval = setInterval(() => {
                stopwatchTime = Date.now() - startTime;
                updateStopwatchDisplay();
            }, 10); // Update every 10 milliseconds for smooth milliseconds display

            stopwatchStartBtn.disabled = true;
            stopwatchPauseBtn.disabled = false;
            stopwatchResetBtn.disabled = false;
            stopwatchLapBtn.disabled = false;
        }
    }

    /**
     * Pauses the stopwatch.
     */
    function pauseStopwatch() {
        clearInterval(stopwatchInterval);
        stopwatchInterval = null;
        stopwatchStartBtn.disabled = false;
        stopwatchPauseBtn.disabled = true;
        stopwatchLapBtn.disabled = true;
    }

    /**
     * Resets the stopwatch.
     */
    function resetStopwatch() {
        pauseStopwatch();
        stopwatchTime = 0;
        stopwatchLaps = [];
        updateStopwatchDisplay();
        stopwatchLapsList.innerHTML = ''; // Clear laps
        stopwatchResetBtn.disabled = true;
        stopwatchLapBtn.disabled = true;
    }

    /**
     * Records a lap time for the stopwatch.
     */
    function recordLap() {
        const lapNumber = stopwatchLaps.length + 1;
        const lapTime = formatTime(stopwatchTime);
        stopwatchLaps.push({ number: lapNumber, time: lapTime });

        const listItem = document.createElement('li');
        listItem.innerHTML = `<span>Lap ${lapNumber}:</span> <span>${lapTime}</span>`;
        stopwatchLapsList.prepend(listItem); // Add to top of the list
    }

    // Stopwatch Event Listeners
    stopwatchStartBtn.addEventListener('click', startStopwatch);
    stopwatchPauseBtn.addEventListener('click', pauseStopwatch);
    stopwatchResetBtn.addEventListener('click', resetStopwatch);
    stopwatchLapBtn.addEventListener('click', recordLap);

    // --- Countdown Timer Module ---
    /**
     * Updates the countdown timer display.
     */
    function updateCountdownDisplay() {
        const totalSeconds = Math.max(0, Math.floor(countdownCurrentTime / 1000));
        const formattedTime = formatSeconds(totalSeconds);
        const parts = formattedTime.split(':');
        countdownHoursDisplay.textContent = parts[0];
        countdownMinutesDisplay.textContent = parts[1];
        countdownSecondsDisplay.textContent = parts[2];
    }

    /**
     * Updates the countdown progress bar.
     * @param {number} percentage - The percentage of time remaining (0-100).
     */
    function updateProgressBar(percentage) {
        countdownProgressBar.style.width = `${percentage}%`;
    }

    /**
     * Sets the initial countdown time from input fields.
     */
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
        updateProgressBar(100); // Reset progress bar to full
    }

    /**
     * Starts the countdown timer.
     */
    function startCountdown() {
        if (countdownCurrentTime <= 0) {
            setCountdownTime(); // Re-set if timer finished or not set
            if (countdownCurrentTime <= 0) return; // Exit if still no time set
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
                    playSound(countdownAudio);
                    countdownStartBtn.disabled = true;
                    countdownPauseBtn.disabled = true;
                    // Keep reset enabled
                }
            }, 100); // Update every 100 milliseconds for smoother progress bar
        }

        countdownStartBtn.disabled = true;
        countdownPauseBtn.disabled = false;
        countdownResetBtn.disabled = false;
    }

    /**
     * Pauses the countdown timer.
     */
    function pauseCountdown() {
        clearInterval(countdownInterval);
        countdownInterval = null;
        countdownStartBtn.disabled = false;
        countdownPauseBtn.disabled = true;
    }

    /**
     * Resets the countdown timer.
     */
    function resetCountdown() {
        pauseCountdown();
        countdownCurrentTime = countdownTime; // Reset to the initially set time
        updateCountdownDisplay();
        updateProgressBar(100);
        countdownStartBtn.disabled = countdownTime === 0; // Enable start if time was set
        countdownPauseBtn.disabled = true;
        countdownResetBtn.disabled = countdownTime === 0;
    }

    // Countdown Event Listeners
    countdownHoursInput.addEventListener('input', setCountdownTime);
    countdownMinutesInput.addEventListener('input', setCountdownTime);
    countdownSecondsInput.addEventListener('input', setCountdownTime);
    countdownStartBtn.addEventListener('click', startCountdown);
    countdownPauseBtn.addEventListener('click', pauseCountdown);
    countdownResetBtn.addEventListener('click', resetCountdown);

    // --- Pomodoro Timer Module ---
    /**
     * Updates the Pomodoro timer display.
     */
    function updatePomodoroDisplay() {
        const totalSeconds = Math.max(0, Math.floor(pomodoroCurrentTime / 1000));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        pomodoroMinutesDisplay.textContent = String(minutes).padStart(2, '0');
        pomodoroSecondsDisplay.textContent = String(seconds).padStart(2, '0');
        pomodoroSessionType.textContent = pomodoroIsWorkSession ? 'Work Session' : 'Break Session';
        pomodoroSessionCountDisplay.textContent = `(Session ${pomodoroSessionCount})`;
    }

    /**
     * Handles the completion of a Pomodoro session (work or break).
     */
    function handlePomodoroCompletion() {
        playSound(pomodoroAudio); // Play sound notification

        if (pomodoroIsWorkSession) {
            pomodoroSessionCount++;
            pomodoroSessionCountDisplay.textContent = `(Session ${pomodoroSessionCount})`;
            pomodoroIsWorkSession = false; // Switch to break
            pomodoroCurrentTime = pomodoroBreakDuration;
        } else {
            pomodoroIsWorkSession = true; // Switch to work
            pomodoroCurrentTime = pomodoroWorkDuration;
        }
        saveState(); // Save session count and type

        updatePomodoroDisplay();

        if (pomodoroAutoStart) {
            startPomodoro(); // Automatically start the next session
        } else {
            pausePomodoro(); // Pause if auto-start is off
            pomodoroStartBtn.disabled = false; // Allow manual start
        }
    }

    /**
     * Starts the Pomodoro timer.
     */
    function startPomodoro() {
        if (!pomodoroInterval) {
            let lastTickTime = Date.now();
            pomodoroInterval = setInterval(() => {
                const now = Date.now();
                const elapsed = now - lastTickTime;
                lastTickTime = now;

                pomodoroCurrentTime = Math.max(0, pomodoroCurrentTime - elapsed);
                updatePomodoroDisplay();

                if (pomodoroCurrentTime <= 0) {
                    clearInterval(pomodoroInterval);
                    pomodoroInterval = null;
                    handlePomodoroCompletion();
                }
            }, 1000); // Update every second
        }
        pomodoroStartBtn.disabled = true;
        pomodoroPauseBtn.disabled = false;
        pomodoroResetBtn.disabled = false;
    }

    /**
     * Pauses the Pomodoro timer.
     */
    function pausePomodoro() {
        clearInterval(pomodoroInterval);
        pomodoroInterval = null;
        pomodoroStartBtn.disabled = false;
        pomodoroPauseBtn.disabled = true;
    }

    /**
     * Resets the Pomodoro timer.
     */
    function resetPomodoro() {
        pausePomodoro();
        pomodoroIsWorkSession = true;
        pomodoroCurrentTime = pomodoroWorkDuration;
        pomodoroSessionCount = 0;
        updatePomodoroDisplay();
        pomodoroStartBtn.disabled = false;
        pomodoroResetBtn.disabled = true;
        saveState();
    }

    // Pomodoro Event Listeners
    pomodoroStartBtn.addEventListener('click', startPomodoro);
    pomodoroPauseBtn.addEventListener('click', pausePomodoro);
    pomodoroResetBtn.addEventListener('click', resetPomodoro);

    workTimeInput.addEventListener('input', () => {
        pomodoroWorkDuration = parseInt(workTimeInput.value) * 60 * 1000 || 25 * 60 * 1000;
        if (!pomodoroInterval && pomodoroIsWorkSession) { // Only update display if not running and it's a work session
            pomodoroCurrentTime = pomodoroWorkDuration;
            updatePomodoroDisplay();
        }
        saveState();
    });

    breakTimeInput.addEventListener('input', () => {
        pomodoroBreakDuration = parseInt(breakTimeInput.value) * 60 * 1000 || 5 * 60 * 1000;
        if (!pomodoroInterval && !pomodoroIsWorkSession) { // Only update display if not running and it's a break session
            pomodoroCurrentTime = pomodoroBreakDuration;
            updatePomodoroDisplay();
        }
        saveState();
    });

    autoStartToggle.addEventListener('change', () => {
        pomodoroAutoStart = autoStartToggle.checked;
        saveState();
    });

    // Initial Pomodoro display setup
    updatePomodoroDisplay();

    // --- To-Do List Module ---
    /**
     * Renders the tasks from the `tasks` array to the DOM.
     */
    function renderTasks() {
        taskList.innerHTML = ''; // Clear existing tasks
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

            // Event listener for checkbox (mark complete/incomplete)
            listItem.querySelector('.task-checkbox').addEventListener('change', (event) => {
                markTaskComplete(task.id, event.target.checked);
            });

            // Event listener for delete button
            listItem.querySelector('.delete-button').addEventListener('click', () => {
                deleteTask(task.id);
            });

            taskList.appendChild(listItem);
        });
    }

    /**
     * Adds a new task to the list.
     */
    function addTask() {
        const text = newTaskText.value.trim();
        const deadline = newTaskDeadline.value; // This will be an empty string if not set

        if (text) {
            const newTask = {
                id: Date.now().toString(), // Unique ID
                text: text,
                deadline: deadline,
                completed: false
            };
            tasks.push(newTask);
            newTaskText.value = ''; // Clear input
            newTaskDeadline.value = ''; // Clear deadline input
            saveState();
            renderTasks();
        }
    }

    /**
     * Marks a task as complete or incomplete.
     * @param {string} id - The ID of the task.
     * @param {boolean} completed - True if completed, false otherwise.
     */
    function markTaskComplete(id, completed) {
        const taskIndex = tasks.findIndex(task => task.id === id);
        if (taskIndex > -1) {
            tasks[taskIndex].completed = completed;
            saveState();
            renderTasks(); // Re-render to apply strikethrough/opacity
        }
    }

    /**
     * Deletes a task from the list.
     * @param {string} id - The ID of the task to delete.
     */
    function deleteTask(id) {
        tasks = tasks.filter(task => task.id !== id);
        saveState();
        renderTasks();
    }

    // To-Do List Event Listeners
    addTaskButton.addEventListener('click', addTask);
    newTaskText.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addTask();
        }
    });

    // Update deadline countdowns every minute
    setInterval(renderTasks, 60 * 1000); // Re-render tasks to update countdowns

    // --- Initialization ---
    loadState(); // Load saved state when the app starts
});