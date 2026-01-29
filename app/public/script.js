// API Base URL
const API_URL = '/api/tasks';

// DOM Elements
const taskForm = document.getElementById('taskForm');
const tasksList = document.getElementById('tasksList');
const filterStatus = document.getElementById('filterStatus');
const taskCount = document.getElementById('taskCount');
const cancelBtn = document.getElementById('cancelBtn');

// State
let editingTaskId = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    taskForm.addEventListener('submit', handleFormSubmit);
    filterStatus.addEventListener('change', handleFilter);
    cancelBtn.addEventListener('click', resetForm);
}

// Load all tasks
async function loadTasks(status = '') {
    try {
        showLoading();
        const url = status ? `${API_URL}?status=${status}` : API_URL;
        const response = await fetch(url);
        const result = await response.json();

        if (result.success) {
            displayTasks(result.data);
            updateTaskCount(result.count);
        } else {
            showToast('Failed to load tasks', 'error');
            tasksList.innerHTML = '<div class="empty-state"><h3>Failed to load tasks</h3></div>';
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
        showToast('Error loading tasks', 'error');
        tasksList.innerHTML = '<div class="empty-state"><h3>Error loading tasks</h3></div>';
    }
}

// Display tasks
function displayTasks(tasks) {
    if (tasks.length === 0) {
        tasksList.innerHTML = `
            <div class="empty-state">
                <h3>No tasks found</h3>
                <p>Create your first task to get started!</p>
            </div>
        `;
        return;
    }

    tasksList.innerHTML = tasks.map(task => createTaskHTML(task)).join('');
}

// Create task HTML
function createTaskHTML(task) {
    const createdDate = new Date(task.created_at).toLocaleDateString();
    const updatedDate = new Date(task.updated_at).toLocaleDateString();
    const statusClass = task.status.replace(' ', '-');

    return `
        <div class="task-item" data-id="${task.id}">
            <div class="task-header">
                <h3 class="task-title">${escapeHtml(task.title)}</h3>
                <span class="task-status status-${statusClass}">${formatStatus(task.status)}</span>
            </div>
            ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}
            <div class="task-meta">
                <span>📅 Created: ${createdDate}</span>
                <span>🔄 Updated: ${updatedDate}</span>
            </div>
            <div class="task-actions">
                <button class="btn btn-success" onclick="editTask(${task.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteTask(${task.id})">Delete</button>
            </div>
        </div>
    `;
}

// Handle form submit
async function handleFormSubmit(e) {
    e.preventDefault();

    const formData = {
        title: document.getElementById('title').value.trim(),
        description: document.getElementById('description').value.trim(),
        status: document.getElementById('status').value
    };

    if (!formData.title) {
        showToast('Title is required', 'error');
        return;
    }

    try {
        let response;
        if (editingTaskId) {
            // Update existing task
            response = await fetch(`${API_URL}/${editingTaskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
        } else {
            // Create new task
            response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
        }

        const result = await response.json();

        if (result.success) {
            showToast(result.message, 'success');
            resetForm();
            loadTasks(filterStatus.value);
        } else {
            showToast(result.error || 'Operation failed', 'error');
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        showToast('Error submitting form', 'error');
    }
}

// Edit task
async function editTask(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const result = await response.json();

        if (result.success) {
            const task = result.data;
            document.getElementById('title').value = task.title;
            document.getElementById('description').value = task.description || '';
            document.getElementById('status').value = task.status;
            editingTaskId = id;
            cancelBtn.style.display = 'inline-block';
            
            // Scroll to form
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Update button text
            const submitBtn = taskForm.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Update Task';
        } else {
            showToast('Failed to load task', 'error');
        }
    } catch (error) {
        console.error('Error loading task:', error);
        showToast('Error loading task', 'error');
    }
}

// Delete task
async function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            showToast(result.message, 'success');
            loadTasks(filterStatus.value);
        } else {
            showToast(result.error || 'Failed to delete task', 'error');
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        showToast('Error deleting task', 'error');
    }
}

// Handle filter change
function handleFilter(e) {
    loadTasks(e.target.value);
}

// Reset form
function resetForm() {
    taskForm.reset();
    editingTaskId = null;
    cancelBtn.style.display = 'none';
    const submitBtn = taskForm.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Add Task';
}

// Update task count
function updateTaskCount(count) {
    taskCount.textContent = count;
}

// Show loading state
function showLoading() {
    tasksList.innerHTML = '<div class="loading">Loading tasks...</div>';
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    
    // Trigger reflow to restart animation
    void toast.offsetWidth;
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Format status for display
function formatStatus(status) {
    return status.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
