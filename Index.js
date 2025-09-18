document.addEventListener('DOMContentLoaded', () => {
    const currentDateEl = document.getElementById('current-date');
    const scheduleForm = document.getElementById('schedule-form');
    const activityTimeInput = document.getElementById('activity-time');
    const activityNameInput = document.getElementById('activity-name');
    const scheduleList = document.getElementById('schedule-list');
    const waterTracker = document.getElementById('water-tracker');
    const waterCountEl = document.getElementById('water-count');
    const mealInputs = document.querySelectorAll('.meal-input');

    // --- Set current date ---
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateEl.textContent = today.toLocaleDateString('en-US', options);

    const storageKey = `plannerData_${today.toISOString().split('T')[0]}`;

    // --- Load data from Local Storage ---
    let plannerData = JSON.parse(localStorage.getItem(storageKey)) || {
        schedule: [],
        water: 0,
        meals: { breakfast: '', lunch: '', dinner: '' }
    };

    const saveData = () => {
        localStorage.setItem(storageKey, JSON.stringify(plannerData));
    };
    
    // --- Schedule Functions ---
    const renderSchedule = () => {
        scheduleList.innerHTML = '';
        if (plannerData.schedule.length === 0) {
             scheduleList.innerHTML = `<p class="text-gray-400 text-center py-4">Your schedule is empty. Add an activity to get started!</p>`;
             return;
        }

        const sortedSchedule = plannerData.schedule.sort((a, b) => a.time.localeCompare(b.time));

        sortedSchedule.forEach((activity, index) => {
            const activityEl = document.createElement('div');
            activityEl.className = 'flex items-center justify-between bg-gray-50 p-3 rounded-lg';
            
            // A unique ID based on time and name to make lookups stable
            const activityId = `${activity.time}-${activity.name.replace(/\s+/g, '-')}-${index}`;

            activityEl.innerHTML = `
                <div class="flex items-center gap-4">
                    <input type="checkbox" id="task-${activityId}" class="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" ${activity.completed ? 'checked' : ''}>
                    <div>
                        <span class="font-mono text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">${formatTime(activity.time)}</span>
                        <label for="task-${activityId}" class="ml-2 font-medium text-gray-800 ${activity.completed ? 'completed' : ''}">${activity.name}</label>
                    </div>
                </div>
                <button class="btn btn-danger btn-sm text-xs" data-id="${activityId}">Delete</button>
            `;

            // Find original index to modify correct item
            const originalIndex = plannerData.schedule.findIndex(item => item.time === activity.time && item.name === activity.name);

            // Checkbox event listener
            activityEl.querySelector('input[type="checkbox"]').addEventListener('change', (e) => {
                if(originalIndex !== -1) {
                    plannerData.schedule[originalIndex].completed = e.target.checked;
                    saveData();
                    renderSchedule(); // Re-render to apply style
                }
            });

            // Delete button event listener
            activityEl.querySelector('button').addEventListener('click', () => {
                 if(originalIndex !== -1) {
                    plannerData.schedule.splice(originalIndex, 1);
                    saveData();
                    renderSchedule();
                }
            });

            scheduleList.appendChild(activityEl);
        });
    };
    
    const formatTime = (time) => {
        let [hours, minutes] = time.split(':');
        let ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        return `${hours}:${minutes} ${ampm}`;
    };

    scheduleForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const time = activityTimeInput.value;
        const name = activityNameInput.value;
        if (time && name) {
            plannerData.schedule.push({ time, name, completed: false });
            saveData();
            renderSchedule();
            activityTimeInput.value = '';
            activityNameInput.value = '';
        }
    });

    // --- Water Tracker Functions ---
    const renderWaterTracker = () => {
        waterTracker.innerHTML = '';
        for (let i = 1; i <= 8; i++) {
            const glassEl = document.createElement('span');
            glassEl.innerHTML = '💧'; // Using an emoji for the glass
            glassEl.className = 'water-glass cursor-pointer';
            if (i <= plannerData.water) {
                glassEl.classList.add('filled');
            }
            glassEl.addEventListener('click', () => {
                if (i === plannerData.water) {
                    plannerData.water--; // If click the last filled glass, unfill it
                } else {
                    plannerData.water = i;
                }
                saveData();
                renderWaterTracker();
            });
            waterTracker.appendChild(glassEl);
        }
        waterCountEl.textContent = plannerData.water;
    };

    // --- Meal Planner Functions ---
    const renderMeals = () => {
        mealInputs.forEach(input => {
            input.value = plannerData.meals[input.id];
        });
    };

    mealInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            plannerData.meals[e.target.id] = e.target.value;
            saveData();
        });
    });

    // --- Initial Render ---
    renderSchedule();
    renderWaterTracker();
    renderMeals();
});
