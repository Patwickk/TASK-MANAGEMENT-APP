document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const themeToggle = document.getElementById('themeToggle');
    const menuToggle = document.getElementById('menuToggle');
    const closeSidebar = document.getElementById('closeSidebar');
    const sidebar = document.getElementById('sidebar');
    const addProjectBtn = document.getElementById('addProjectBtn');
    const projectsContainer = document.getElementById('projectsContainer');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const mobileAddTaskBtn = document.getElementById('mobileAddTaskBtn');
    const mobileAddTask = document.getElementById('mobileAddTask');
    const tasksList = document.getElementById('tasksList');
    const projectModal = document.getElementById('projectModal');
    const taskModal = document.getElementById('taskModal');
    const saveProjectBtn = document.getElementById('saveProject');
    const saveTaskBtn = document.getElementById('saveTask');
    const projectNameInput = document.getElementById('projectName');
    const projectDescriptionInput = document.getElementById('projectDescription');
    const taskTitleInput = document.getElementById('taskTitle');
    const taskDescriptionInput = document.getElementById('taskDescription');
    const taskDueDateInput = document.getElementById('taskDueDate');
    const taskPrioritySelect = document.getElementById('taskPriority');
    const taskProjectSelect = document.getElementById('taskProject');
    const currentProjectTitle = document.getElementById('currentProjectTitle');
    const currentProjectDesc = document.getElementById('currentProjectDesc');
    const totalTasksElement = document.getElementById('totalTasks');
    const completedTasksElement = document.getElementById('completedTasks');
    const pendingTasksElement = document.getElementById('pendingTasks');
    const todayTasksElement = document.getElementById('todayTasks');
    const overviewTotalElement = document.getElementById('overviewTotal');
    const overviewCompletedElement = document.getElementById('overviewCompleted');
    const overviewPendingElement = document.getElementById('overviewPending');
    const overdueTasksElement = document.getElementById('overdueTasks');
    const projectProgress = document.getElementById('projectProgress');
    const progressFill = document.getElementById('progressFill');
    const viewButtons = document.querySelectorAll('.view-btn');
    const addFirstTaskBtn = document.getElementById('addFirstTask');
    const activityList = document.getElementById('activityList');
    const deadlinesList = document.getElementById('deadlinesList');
    const colorOptions = document.querySelectorAll('.color-option');
    const completionRateElement = document.getElementById('completionRate');
    const avgCompletionElement = document.getElementById('avgCompletion');
    const searchInput = document.querySelector('.search-input');
    const sortTasksBtn = document.getElementById('sortTasks');
    const filterTasksBtn = document.getElementById('filterTasks');
    const exportTasksBtn = document.getElementById('exportTasks');
    
    // Chart Variables
    let productivityChart = null;
    
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    taskDueDateInput.min = new Date().toISOString().split('T')[0];
    taskDueDateInput.value = tomorrow.toISOString().split('T')[0];
    
    // App State
    let projects = [];
    let tasks = [];
    let currentProjectId = 'default';
    let selectedColor = '#4361ee';
    let currentView = 'list';
    let searchQuery = '';
    let sortBy = 'dueDate';
    let filterBy = 'all';
    
    // Initialize app
    initApp();
    
    // Initialize the app
    function initApp() {
        loadData();
        renderProjects();
        renderTasks();
        updateStats();
        updateDashboardStats();
        renderDeadlines();
        updateProductivityChart();
        setupEventListeners();
        
        // Add default project if none exists
        if (projects.length === 0) {
            addDefaultProject();
        }
        
        // Update project select dropdown
        updateProjectSelect();
        
        // Initialize mobile sidebar
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('active');
        }
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Theme toggle
        themeToggle.addEventListener('click', toggleTheme);
        
        // Mobile menu toggle
        menuToggle.addEventListener('click', toggleSidebar);
        closeSidebar.addEventListener('click', toggleSidebar);
        
        // Modal open/close
        addProjectBtn.addEventListener('click', () => openModal(projectModal));
        addTaskBtn.addEventListener('click', () => openModal(taskModal));
        addFirstTaskBtn.addEventListener('click', () => openModal(taskModal));
        mobileAddTaskBtn.addEventListener('click', () => openModal(taskModal));
        mobileAddTask.addEventListener('click', () => openModal(taskModal));
        
        // Close modals
        document.querySelectorAll('.close-modal').forEach(button => {
            button.addEventListener('click', closeAllModals);
        });
        
        // Save buttons
        saveProjectBtn.addEventListener('click', saveProject);
        saveTaskBtn.addEventListener('click', saveTask);
        
        // View toggle
        viewButtons.forEach(button => {
            button.addEventListener('click', function() {
                const view = this.getAttribute('data-view');
                switchView(view);
            });
        });
        
        // Color picker
        colorOptions.forEach(option => {
            option.addEventListener('click', function() {
                colorOptions.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                selectedColor = this.getAttribute('data-color');
            });
        });
        
        // Set default color as selected
        colorOptions[0].classList.add('selected');
        
        // Close modal on outside click
        window.addEventListener('click', function(event) {
            if (event.target.classList.contains('modal')) {
                closeAllModals();
            }
        });
        
        // Search functionality
        searchInput.addEventListener('input', function() {
            searchQuery = this.value.toLowerCase();
            renderTasks();
        });
        
        // Sort and filter
        sortTasksBtn.addEventListener('click', toggleSort);
        filterTasksBtn.addEventListener('click', toggleFilter);
        exportTasksBtn.addEventListener('click', exportTasks);
        
        // Resize handler
        window.addEventListener('resize', handleResize);
        
        // Close sidebar when clicking on a link (mobile)
        document.querySelectorAll('.sidebar a').forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('active');
                }
            });
        });
    }
    
    // Handle window resize
    function handleResize() {
        if (window.innerWidth > 768) {
            sidebar.classList.add('active');
        } else {
            sidebar.classList.remove('active');
        }
        updateProductivityChart();
    }
    
    // Toggle sidebar (mobile)
    function toggleSidebar() {
        sidebar.classList.toggle('active');
    }
    
    // Load data from localStorage
    function loadData() {
        const savedProjects = localStorage.getItem('taskManagerProjects');
        const savedTasks = localStorage.getItem('taskManagerTasks');
        
        if (savedProjects) {
            projects = JSON.parse(savedProjects);
        }
        
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
        }
    }
    
    // Save data to localStorage
    function saveData() {
        localStorage.setItem('taskManagerProjects', JSON.stringify(projects));
        localStorage.setItem('taskManagerTasks', JSON.stringify(tasks));
    }
    
    // Add default project
    function addDefaultProject() {
        const defaultProject = {
            id: 'default',
            name: 'My Tasks',
            description: 'Manage all your tasks in one place',
            color: '#4361ee',
            createdAt: new Date().toISOString()
        };
        
        projects.push(defaultProject);
        currentProjectId = 'default';
        saveData();
    }
    
    // Render projects in sidebar
    function renderProjects() {
        projectsContainer.innerHTML = '';
        
        projects.forEach(project => {
            const projectTasks = tasks.filter(task => task.projectId === project.id);
            const completedCount = projectTasks.filter(task => task.completed).length;
            const totalCount = projectTasks.length;
            const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
            
            const projectElement = document.createElement('li');
            projectElement.className = `project-item ${project.id === currentProjectId ? 'active' : ''}`;
            projectElement.setAttribute('data-id', project.id);
            projectElement.style.borderLeftColor = project.color;
            
            projectElement.innerHTML = `
                <div class="project-info">
                    <h4>${project.name}</h4>
                    <p>${project.description}</p>
                </div>
                <div class="project-stats">
                    <span>${progress}%</span>
                </div>
            `;
            
            projectElement.addEventListener('click', function() {
                switchProject(project.id);
            });
            
            projectsContainer.appendChild(projectElement);
        });
    }
    
    // Render tasks
    function renderTasks() {
        let filteredTasks = tasks.filter(task => task.projectId === currentProjectId);
        
        // Apply search filter
        if (searchQuery) {
            filteredTasks = filteredTasks.filter(task => 
                task.title.toLowerCase().includes(searchQuery) || 
                task.description.toLowerCase().includes(searchQuery)
            );
        }
        
        // Apply status filter
        if (filterBy === 'completed') {
            filteredTasks = filteredTasks.filter(task => task.completed);
        } else if (filterBy === 'pending') {
            filteredTasks = filteredTasks.filter(task => !task.completed);
        } else if (filterBy === 'overdue') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            filteredTasks = filteredTasks.filter(task => {
                const dueDate = new Date(task.dueDate);
                return dueDate < today && !task.completed;
            });
        } else if (filterBy === 'today') {
            const today = new Date().toISOString().split('T')[0];
            filteredTasks = filteredTasks.filter(task => task.dueDate === today);
        }
        
        // Apply sorting
        filteredTasks.sort((a, b) => {
            if (sortBy === 'dueDate') {
                return new Date(a.dueDate) - new Date(b.dueDate);
            } else if (sortBy === 'priority') {
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            } else if (sortBy === 'title') {
                return a.title.localeCompare(b.title);
            }
            return 0;
        });
        
        if (filteredTasks.length === 0) {
            tasksList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <h4>No tasks found</h4>
                    <p>${searchQuery ? 'Try a different search term' : 'Add your first task to get started!'}</p>
                    <button class="btn-primary" id="addFirstTask">Add New Task</button>
                </div>
            `;
            
            // Re-attach event listener to the new button
            document.getElementById('addFirstTask').addEventListener('click', () => openModal(taskModal));
            return;
        }
        
        tasksList.innerHTML = '';
        
        if (currentView === 'calendar') {
            renderCalendarView(filteredTasks);
        } else {
            filteredTasks.forEach(task => {
                const taskElement = createTaskElement(task);
                tasksList.appendChild(taskElement);
            });
        }
        
        // Update view class
        tasksList.className = `tasks-list ${currentView}-view`;
    }
    
    // Create task element
    function createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        taskElement.setAttribute('data-id', task.id);
        
        // Format date
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isOverdue = dueDate < today && !task.completed;
        const formattedDate = dueDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: dueDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
        
        // Priority class
        const priorityClass = `priority-${task.priority}`;
        
        taskElement.innerHTML = `
            <div class="task-checkbox">
                <input type="checkbox" ${task.completed ? 'checked' : ''}>
            </div>
            <div class="task-content">
                <div class="task-header">
                    <h3 class="task-title ${task.completed ? 'completed' : ''}">${task.title}</h3>
                    <span class="task-priority ${priorityClass}">${task.priority}</span>
                </div>
                <p class="task-description">${task.description}</p>
                <div class="task-footer">
                    <div class="task-due-date ${isOverdue ? 'overdue' : ''}">
                        <i class="fas fa-calendar"></i>
                        <span>${formattedDate}</span>
                    </div>
                    <div class="task-actions">
                        <button class="task-action-btn edit-task" title="Edit Task">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="task-action-btn delete-task" title="Delete Task">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners to task buttons
        const checkbox = taskElement.querySelector('input[type="checkbox"]');
        const editBtn = taskElement.querySelector('.edit-task');
        const deleteBtn = taskElement.querySelector('.delete-task');
        
        checkbox.addEventListener('change', function() {
            toggleTaskComplete(task.id, this.checked);
        });
        
        editBtn.addEventListener('click', function() {
            editTask(task.id);
        });
        
        deleteBtn.addEventListener('click', function() {
            deleteTask(task.id);
        });
        
        return taskElement;
    }
    
    // Render calendar view
    function renderCalendarView(tasks) {
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay()); // Start from Sunday
        
        tasksList.innerHTML = '';
        
        // Create day headers
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        days.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            tasksList.appendChild(dayHeader);
        });
        
        // Create calendar cells for the week
        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            const dateString = currentDate.toISOString().split('T')[0];
            
            const dayCell = document.createElement('div');
            dayCell.className = 'calendar-day';
            
            if (currentDate.toDateString() === today.toDateString()) {
                dayCell.classList.add('today');
            }
            
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-number';
            dayHeader.textContent = currentDate.getDate();
            dayCell.appendChild(dayHeader);
            
            const dayTasks = tasks.filter(task => task.dueDate === dateString);
            
            if (dayTasks.length > 0) {
                const tasksContainer = document.createElement('div');
                tasksContainer.className = 'calendar-tasks';
                
                dayTasks.slice(0, 2).forEach(task => { // Limit to 2 tasks per day for mobile
                    const taskItem = document.createElement('div');
                    taskItem.className = `calendar-task ${task.completed ? 'completed' : ''} ${task.priority}`;
                    taskItem.textContent = task.title;
                    taskItem.title = task.title;
                    tasksContainer.appendChild(taskItem);
                });
                
                if (dayTasks.length > 2) {
                    const moreTasks = document.createElement('div');
                    moreTasks.className = 'calendar-more';
                    moreTasks.textContent = `+${dayTasks.length - 2} more`;
                    tasksContainer.appendChild(moreTasks);
                }
                
                dayCell.appendChild(tasksContainer);
            }
            
            tasksList.appendChild(dayCell);
        }
    }
    
    // Update project select dropdown
    function updateProjectSelect() {
        taskProjectSelect.innerHTML = '';
        
        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            option.selected = project.id === currentProjectId;
            taskProjectSelect.appendChild(option);
        });
    }
    
    // Update statistics
    function updateStats() {
        const allTasks = tasks;
        const totalTasks = allTasks.length;
        const completedTasks = allTasks.filter(task => task.completed).length;
        const pendingTasks = totalTasks - completedTasks;
        
        totalTasksElement.textContent = totalTasks;
        completedTasksElement.textContent = completedTasks;
        pendingTasksElement.textContent = pendingTasks;
        
        // Update project progress
        const currentProjectTasks = tasks.filter(task => task.projectId === currentProjectId);
        const currentTotal = currentProjectTasks.length;
        const currentCompleted = currentProjectTasks.filter(task => task.completed).length;
        const progress = currentTotal > 0 ? Math.round((currentCompleted / currentTotal) * 100) : 0;
        
        projectProgress.textContent = `${progress}%`;
        progressFill.style.width = `${progress}%`;
        
        // Update current project info
        const currentProject = projects.find(p => p.id === currentProjectId);
        if (currentProject) {
            currentProjectTitle.textContent = currentProject.name;
            currentProjectDesc.textContent = currentProject.description;
        }
    }
    
    // Update dashboard statistics
    function updateDashboardStats() {
        const today = new Date().toISOString().split('T')[0];
        const allTasks = tasks;
        
        const totalTasks = allTasks.length;
        const completedTasks = allTasks.filter(task => task.completed).length;
        const pendingTasks = totalTasks - completedTasks;
        const todayTasks = allTasks.filter(task => task.dueDate === today && !task.completed).length;
        
        // Calculate overdue tasks
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        const overdueTasks = allTasks.filter(task => {
            const dueDate = new Date(task.dueDate);
            return dueDate < todayDate && !task.completed;
        }).length;
        
        overviewTotalElement.textContent = totalTasks;
        overviewCompletedElement.textContent = completedTasks;
        overviewPendingElement.textContent = pendingTasks;
        overdueTasksElement.textContent = overdueTasks;
        todayTasksElement.textContent = todayTasks;
        
        // Calculate completion rate
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        completionRateElement.textContent = `${completionRate}%`;
        
        // Calculate average completion time (simplified)
        const completedTaskTimes = allTasks
            .filter(task => task.completed && task.completedAt && task.createdAt)
            .map(task => {
                const created = new Date(task.createdAt);
                const completed = new Date(task.completedAt);
                return Math.round((completed - created) / (1000 * 60 * 60 * 24));
            });
        
        const avgCompletion = completedTaskTimes.length > 0 
            ? Math.round(completedTaskTimes.reduce((a, b) => a + b, 0) / completedTaskTimes.length)
            : 0;
        
        avgCompletionElement.textContent = `${avgCompletion} days`;
    }
    
    // Update productivity chart
    function updateProductivityChart() {
        const ctx = document.getElementById('productivityChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (productivityChart) {
            productivityChart.destroy();
        }
        
        // Get last 7 days
        const days = [];
        const completedData = [];
        const createdData = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            
            days.push(dayName);
            
            // Count tasks completed on this day
            const completedCount = tasks.filter(task => 
                task.completed && task.completedAt && 
                task.completedAt.startsWith(dateString)
            ).length;
            
            // Count tasks created on this day
            const createdCount = tasks.filter(task => 
                task.createdAt && task.createdAt.startsWith(dateString)
            ).length;
            
            completedData.push(completedCount);
            createdData.push(createdCount);
        }
        
        productivityChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: days,
                datasets: [
                    {
                        label: 'Tasks Created',
                        data: createdData,
                        borderColor: '#4361ee',
                        backgroundColor: 'rgba(67, 97, 238, 0.1)',
                        tension: 0.3,
                        fill: true
                    },
                    {
                        label: 'Tasks Completed',
                        data: completedData,
                        borderColor: '#4CAF50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        tension: 0.3,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: window.innerWidth > 400,
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
    
    // Render upcoming deadlines
    function renderDeadlines() {
        deadlinesList.innerHTML = '';
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Get next 5 days
        const upcomingDays = [];
        for (let i = 0; i < 5; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            upcomingDays.push(date.toISOString().split('T')[0]);
        }
        
        let hasDeadlines = false;
        
        upcomingDays.forEach(dateString => {
            const date = new Date(dateString);
            const dayTasks = tasks.filter(task => 
                task.dueDate === dateString && 
                !task.completed &&
                task.projectId === currentProjectId
            );
            
            if (dayTasks.length > 0) {
                hasDeadlines = true;
                const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short' });
                const dayNum = date.getDate();
                
                const deadlineItem = document.createElement('div');
                deadlineItem.className = 'deadline-item';
                deadlineItem.innerHTML = `
                    <div class="deadline-date">
                        <span class="day">${dayName}</span>
                        <span class="date">${dayNum}</span>
                    </div>
                    <div class="deadline-content">
                        <p>${dayTasks.length} task${dayTasks.length > 1 ? 's' : ''} due</p>
                    </div>
                `;
                
                deadlinesList.appendChild(deadlineItem);
            }
        });
        
        if (!hasDeadlines) {
            deadlinesList.innerHTML = `
                <div class="deadline-item">
                    <div class="deadline-date">
                        <span class="day">Today</span>
                    </div>
                    <div class="deadline-content">
                        <p>No deadlines today</p>
                    </div>
                </div>
            `;
        }
    }
    
    // Add activity log
    function addActivityLog(message) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <div class="activity-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <div class="activity-content">
                <p>${message}</p>
                <span class="activity-time">${timeString}</span>
            </div>
        `;
        
        
        activityList.insertBefore(activityItem, activityList.firstChild);
        
    
        if (activityList.children.length > 5) {
            activityList.removeChild(activityList.lastChild);
        }
    }

    function switchProject(projectId) {
        currentProjectId = projectId;
        renderProjects();
        renderTasks();
        updateStats();
        updateDashboardStats();
        renderDeadlines();
        
        const project = projects.find(p => p.id === projectId);
        addActivityLog(`Switched to project: ${project.name}`);
        
    
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('active');
        }
    }
    
    
    function switchView(view) {
        currentView = view;
        
        
        viewButtons.forEach(button => {
            if (button.getAttribute('data-view') === view) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        
        renderTasks();
    }
    

    function toggleSort() {
        const sortOptions = ['dueDate', 'priority', 'title'];
        const currentIndex = sortOptions.indexOf(sortBy);
        sortBy = sortOptions[(currentIndex + 1) % sortOptions.length];
        
        
        const sortText = {
            'dueDate': 'Sort by Due Date',
            'priority': 'Sort by Priority',
            'title': 'Sort by Title'
        };
        
        sortTasksBtn.innerHTML = `<i class="fas fa-sort-amount-down"></i> <span>${sortText[sortBy]}</span>`;
        renderTasks();
        addActivityLog(`Sorted tasks by ${sortText[sortBy]}`);
    }
    
    
    function toggleFilter() {
        const filterOptions = ['all', 'pending', 'completed', 'overdue', 'today'];
        const currentIndex = filterOptions.indexOf(filterBy);
        filterBy = filterOptions[(currentIndex + 1) % filterOptions.length];
        
        
        const filterText = {
            'all': 'All Tasks',
            'pending': 'Pending Only',
            'completed': 'Completed Only',
            'overdue': 'Overdue Only',
            'today': 'Due Today'
        };
        
        filterTasksBtn.innerHTML = `<i class="fas fa-filter"></i> <span>${filterText[filterBy]}</span>`;
        renderTasks();
        addActivityLog(`Filtered tasks: ${filterText[filterBy]}`);
    }
    
    
    function exportTasks() {
        const currentProjectTasks = tasks.filter(task => task.projectId === currentProjectId);
        const project = projects.find(p => p.id === currentProjectId);
        
        const exportData = {
            project: project.name,
            exportDate: new Date().toISOString(),
            tasks: currentProjectTasks
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `${project.name.replace(/\s+/g, '_')}_tasks.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        addActivityLog(`Exported tasks from ${project.name}`);
    }
    

    function toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const icon = themeToggle.querySelector('i');
        
        if (document.body.classList.contains('dark-mode')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            addActivityLog('Switched to dark mode');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
            addActivityLog('Switched to light mode');
        }
        
        
        updateProductivityChart();
    }
    
    
    function openModal(modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('active');
        }
    }
    
    
    function closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = 'auto';
        clearModalInputs();
    }
    
    
    function clearModalInputs() {
        projectNameInput.value = '';
        projectDescriptionInput.value = '';
        taskTitleInput.value = '';
        taskDescriptionInput.value = '';
        
        
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        taskDueDateInput.value = tomorrow.toISOString().split('T')[0];
        taskPrioritySelect.value = 'medium';
        
        
        colorOptions.forEach(opt => opt.classList.remove('selected'));
        colorOptions[0].classList.add('selected');
        selectedColor = '#4361ee';
        
        
        saveTaskBtn.textContent = 'Save Task';
        saveTaskBtn.onclick = saveTask;
    }
    

    function saveProject() {
        const name = projectNameInput.value.trim();
        const description = projectDescriptionInput.value.trim();
        
        if (!name) {
            alert('Please enter a project name');
            return;
        }
        
        const newProject = {
            id: 'project-' + Date.now(),
            name: name,
            description: description || 'No description',
            color: selectedColor,
            createdAt: new Date().toISOString()
        };
        
        projects.push(newProject);
        saveData();
        renderProjects();
        updateProjectSelect();
        closeAllModals();
        
        addActivityLog(`Created project: ${name}`);
    }
    
    
    function saveTask() {
        const title = taskTitleInput.value.trim();
        const description = taskDescriptionInput.value.trim();
        const dueDate = taskDueDateInput.value;
        const priority = taskPrioritySelect.value;
        const projectId = taskProjectSelect.value;
        
        if (!title) {
            alert('Please enter a task title');
            return;
        }
        
        const newTask = {
            id: 'task-' + Date.now(),
            title: title,
            description: description || 'No description',
            dueDate: dueDate,
            priority: priority,
            projectId: projectId,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        tasks.push(newTask);
        saveData();
        renderTasks();
        updateStats();
        updateDashboardStats();
        renderDeadlines();
        updateProductivityChart();
        closeAllModals();
        
        const project = projects.find(p => p.id === projectId);
        addActivityLog(`Added task "${title}" to ${project.name}`);
    }
    
    
    function toggleTaskComplete(taskId, completed) {
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        
        if (taskIndex !== -1) {
            tasks[taskIndex].completed = completed;
            tasks[taskIndex].completedAt = completed ? new Date().toISOString() : null;
            saveData();
            renderTasks();
            updateStats();
            updateDashboardStats();
            renderDeadlines();
            updateProductivityChart();
            
            const task = tasks[taskIndex];
            addActivityLog(`${completed ? 'Completed' : 'Marked as incomplete'}: ${task.title}`);
        }
    }
    
    
    function editTask(taskId) {
        const task = tasks.find(t => t.id === taskId);
        
        if (task) {
            taskTitleInput.value = task.title;
            taskDescriptionInput.value = task.description;
            taskDueDateInput.value = task.dueDate;
            taskPrioritySelect.value = task.priority;
            taskProjectSelect.value = task.projectId;
            
            
            openModal(taskModal);
            
        
            saveTaskBtn.textContent = 'Update Task';
            saveTaskBtn.onclick = function() {
                updateTask(taskId);
            };
        }
    }
    
    // Update task
    function updateTask(taskId) {
        const title = taskTitleInput.value.trim();
        const description = taskDescriptionInput.value.trim();
        const dueDate = taskDueDateInput.value;
        const priority = taskPrioritySelect.value;
        const projectId = taskProjectSelect.value;
        
        if (!title) {
            alert('Please enter a task title');
            return;
        }
        
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        
        if (taskIndex !== -1) {
            tasks[taskIndex].title = title;
            tasks[taskIndex].description = description || 'No description';
            tasks[taskIndex].dueDate = dueDate;
            tasks[taskIndex].priority = priority;
            tasks[taskIndex].projectId = projectId;
            
            saveData();
            renderTasks();
            updateStats();
            updateDashboardStats();
            renderDeadlines();
            closeAllModals();
            
            // Reset save button
            saveTaskBtn.textContent = 'Save Task';
            saveTaskBtn.onclick = saveTask;
            
            addActivityLog(`Updated task: ${title}`);
        }
    }
    
    // Delete task
    function deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            const taskIndex = tasks.findIndex(task => task.id === taskId);
            
            if (taskIndex !== -1) {
                const taskTitle = tasks[taskIndex].title;
                tasks.splice(taskIndex, 1);
                saveData();
                renderTasks();
                updateStats();
                updateDashboardStats();
                renderDeadlines();
                updateProductivityChart();
                
                addActivityLog(`Deleted task: ${taskTitle}`);
            }
        }
    }
});