// ======================
// STUDENT DATA FUNCTIONS
// ======================

function loadStudentData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {
        username: "Student",
        studentId: "STU00000",
        major: "Undeclared",
        year: "Freshman",
        gpa: "0.00",
        grades: [],
        completedCourses: [],
        schedule: []
    };
    
    // Update the display
    document.getElementById('student-name').textContent = currentUser.username;
    document.getElementById('student-id').textContent = currentUser.studentId;
    document.getElementById('student-major').textContent = currentUser.major;
    document.getElementById('student-year').textContent = currentUser.year;
    document.getElementById('student-gpa').textContent = currentUser.gpa;
    
    // Store the user data if it wasn't there before
    if (!localStorage.getItem('currentUser')) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
}

function setupCurrentDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date();
    document.getElementById('current-date').textContent = today.toLocaleDateString('en-US', options);
}

// ======================
// GRADE MANAGEMENT
// ======================

function loadGrades() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const grades = currentUser.grades || [];
    const tbody = document.querySelector('#grades-table tbody');
    tbody.innerHTML = '';
    
    // Populate course select
    const courseSelect = document.getElementById('course-select');
    courseSelect.innerHTML = '<option value="">Select a course</option>';
    
    // Get available courses from catalog
    const courseCatalog = JSON.parse(localStorage.getItem('courseCatalog')) || [];
    courseCatalog.forEach(course => {
        const option = document.createElement('option');
        option.value = course.code;
        option.textContent = `${course.code} - ${course.name}`;
        courseSelect.appendChild(option);
    });
    
    // Populate grades table
    grades.forEach(grade => {
        const row = document.createElement('tr');
        
        const courseCell = document.createElement('td');
        courseCell.textContent = grade.course;
        
        const gradeCell = document.createElement('td');
        gradeCell.textContent = grade.grade;
        
        const actionsCell = document.createElement('td');
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.classList.add('btn-sm');
        editBtn.addEventListener('click', () => editGrade(grade.course));
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.add('btn-sm', 'btn-danger');
        deleteBtn.addEventListener('click', () => deleteGrade(grade.course));
        
        actionsCell.appendChild(editBtn);
        actionsCell.appendChild(deleteBtn);
        
        row.appendChild(courseCell);
        row.appendChild(gradeCell);
        row.appendChild(actionsCell);
        
        tbody.appendChild(row);
    });
}

function addGrade() {
    const courseSelect = document.getElementById('course-select');
    const gradeInput = document.getElementById('grade-input');
    
    if (!courseSelect.value || !gradeInput.value) {
        alert('Please select a course and enter a grade');
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser.grades) {
        currentUser.grades = [];
    }
    
    // Check if grade already exists for this course
    const existingGradeIndex = currentUser.grades.findIndex(g => g.course === courseSelect.value);
    
    if (existingGradeIndex >= 0) {
        // Update existing grade
        currentUser.grades[existingGradeIndex].grade = gradeInput.value;
    } else {
        // Add new grade
        currentUser.grades.push({
            course: courseSelect.value,
            grade: gradeInput.value
        });
    }
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    loadGrades();
    calculateGPA();
    document.getElementById('grade-form').reset();
}

function editGrade(courseCode) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const grade = currentUser.grades.find(g => g.course === courseCode);
    
    if (grade) {
        document.getElementById('course-select').value = grade.course;
        document.getElementById('grade-input').value = grade.grade;
        document.getElementById('grade-form').scrollIntoView({ behavior: 'smooth' });
    }
}

function deleteGrade(courseCode) {
    if (confirm(`Are you sure you want to delete the grade for ${courseCode}?`)) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        currentUser.grades = currentUser.grades.filter(g => g.course !== courseCode);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        loadGrades();
        calculateGPA();
    }
}

function calculateGPA() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser.grades || currentUser.grades.length === 0) {
        currentUser.gpa = '0.00';
        document.getElementById('student-gpa').textContent = '0.00';
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        return;
    }
    
    const gradePoints = {
        'A+': 4.0, 'A': 4.0, 'A-': 3.7,
        'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7,
        'D+': 1.3, 'D': 1.0, 'F': 0.0
    };
    
    let totalPoints = 0;
    let validGrades = 0;
    
    currentUser.grades.forEach(grade => {
        if (gradePoints[grade.grade] !== undefined) {
            totalPoints += gradePoints[grade.grade];
            validGrades++;
        }
    });
    
    const gpa = validGrades > 0 ? (totalPoints / validGrades).toFixed(2) : '0.00';
    currentUser.gpa = gpa;
    document.getElementById('student-gpa').textContent = gpa;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

// ======================
// COURSE MANAGEMENT
// ======================

function loadCourseCatalog() {
    const tbody = document.querySelector('#catalog-table tbody');
    tbody.innerHTML = '';
    
    const courses = JSON.parse(localStorage.getItem('courseCatalog')) || [];
    
    courses.forEach(course => {
        const row = document.createElement('tr');
        
        const codeCell = document.createElement('td');
        const codeLink = document.createElement('a');
        codeLink.href = '#';
        codeLink.textContent = course.code;
        codeLink.addEventListener('click', (e) => {
            e.preventDefault();
            openCourseDetailModal(course);
        });
        codeCell.appendChild(codeLink);
        
        const nameCell = document.createElement('td');
        const nameLink = document.createElement('a');
        nameLink.href = '#';
        nameLink.textContent = course.name;
        nameLink.addEventListener('click', (e) => {
            e.preventDefault();
            openCourseDetailModal(course);
        });
        nameCell.appendChild(nameLink);
        
        const creditsCell = document.createElement('td');
        creditsCell.textContent = course.credits;
        
        const prereqCell = document.createElement('td');
        prereqCell.textContent = course.prerequisites || 'None';
        
        const actionsCell = document.createElement('td');
        actionsCell.classList.add('action-buttons');
        
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.classList.add('btn-sm');
        editBtn.addEventListener('click', () => openCourseDetailModal(course));
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.add('btn-sm', 'btn-danger');
        deleteBtn.addEventListener('click', () => deleteCourse(course.code));
        
        actionsCell.appendChild(editBtn);
        actionsCell.appendChild(deleteBtn);
        
        row.appendChild(codeCell);
        row.appendChild(nameCell);
        row.appendChild(creditsCell);
        row.appendChild(prereqCell);
        row.appendChild(actionsCell);
        
        tbody.appendChild(row);
    });
}

function addNewCourse() {
    const courseCode = prompt('Enter course code (e.g., MATH101):');
    if (!courseCode) return;
    
    const courseName = prompt('Enter course name:');
    if (!courseName) return;
    
    const credits = prompt('Enter number of credits:');
    if (!credits) return;
    
    const prerequisites = prompt('Enter prerequisites (comma separated, leave empty if none):') || 'None';
    const description = prompt('Enter course description (optional):') || '';
    
    const courses = JSON.parse(localStorage.getItem('courseCatalog')) || [];
    
    if (courses.some(c => c.code === courseCode)) {
        alert('Course with this code already exists!');
        return;
    }
    
    courses.push({
        code: courseCode,
        name: courseName,
        credits: credits,
        prerequisites: prerequisites,
        description: description
    });
    
    localStorage.setItem('courseCatalog', JSON.stringify(courses));
    loadCourseCatalog();
}

function openCourseDetailModal(course) {
    const modal = document.getElementById('course-detail-modal');
    
    // Populate the modal with course details
    document.getElementById('detail-course-title').textContent = course.name;
    document.getElementById('detail-course-code').textContent = course.code;
    document.getElementById('detail-course-name').textContent = course.name;
    document.getElementById('detail-course-credits').textContent = course.credits;
    document.getElementById('detail-course-prereqs').textContent = course.prerequisites || 'None';
    document.getElementById('detail-course-description').textContent = course.description || 'No description available';
    
    // Set up edit button
    document.getElementById('edit-course-btn').onclick = function() {
        openEditCourseForm(course);
    };
    
    // Set up close button
    document.getElementById('close-detail-btn').onclick = function() {
        modal.style.display = 'none';
    };
    
    // Show the modal
    modal.style.display = 'block';
}

function openEditCourseForm(course) {
    const modal = document.getElementById('course-detail-modal');
    
    modal.querySelector('.course-detail-content').innerHTML = `
        <form id="edit-course-form">
            <div class="form-group">
                <label for="edit-course-code">Course Code:</label>
                <input type="text" id="edit-course-code" value="${course.code}" required 
                       data-old-code="${course.code}">
            </div>
            <div class="form-group">
                <label for="edit-course-name">Course Name:</label>
                <input type="text" id="edit-course-name" value="${course.name}" required>
            </div>
            <div class="form-group">
                <label for="edit-course-credits">Credits:</label>
                <input type="number" id="edit-course-credits" min="1" max="6" 
                       value="${course.credits}" required>
            </div>
            <div class="form-group">
                <label for="edit-course-prereqs">Prerequisites:</label>
                <input type="text" id="edit-course-prereqs" value="${course.prerequisites || ''}">
            </div>
            <div class="form-group">
                <label for="edit-course-description">Description:</label>
                <textarea id="edit-course-description" rows="4">${course.description || ''}</textarea>
            </div>
        </form>
    `;
    
    modal.querySelector('.modal-actions').innerHTML = `
        <button id="save-course-btn" class="btn">Save Changes</button>
        <button id="cancel-edit-btn" class="btn btn-secondary">Cancel</button>
    `;
    
    // Set up save button
    document.getElementById('save-course-btn').onclick = function() {
        saveCourseChanges(course.code);
    };
    
    // Set up cancel button
    document.getElementById('cancel-edit-btn').onclick = function() {
        openCourseDetailModal(course);
    };
}

function saveCourseChanges(oldCode) {
    const newCode = document.getElementById('edit-course-code').value;
    const name = document.getElementById('edit-course-name').value;
    const credits = document.getElementById('edit-course-credits').value;
    const prerequisites = document.getElementById('edit-course-prereqs').value;
    const description = document.getElementById('edit-course-description').value;
    
    if (!newCode || !name || !credits) {
        alert('Please fill in all required fields');
        return;
    }
    
    const courses = JSON.parse(localStorage.getItem('courseCatalog'));
    const courseIndex = courses.findIndex(c => c.code === oldCode);
    
    if (courseIndex >= 0) {
        // Check if new code conflicts with another course
        if (newCode !== oldCode && courses.some(c => c.code === newCode)) {
            alert('A course with this code already exists!');
            return;
        }
        
        // Update the course
        courses[courseIndex] = {
            code: newCode,
            name: name,
            credits: credits,
            prerequisites: prerequisites || 'None',
            description: description || ''
        };
        
        localStorage.setItem('courseCatalog', JSON.stringify(courses));
        loadCourseCatalog();
        
        // Close the modal
        document.getElementById('course-detail-modal').style.display = 'none';
    }
}

function deleteCourse(courseCode) {
    if (confirm(`Are you sure you want to delete course ${courseCode}?`)) {
        const courses = JSON.parse(localStorage.getItem('courseCatalog'));
        const updatedCourses = courses.filter(c => c.code !== courseCode);
        localStorage.setItem('courseCatalog', JSON.stringify(updatedCourses));
        loadCourseCatalog();
    }
}

// ======================
// SCHEDULE MANAGEMENT
// ======================

function loadSchedule() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const schedule = currentUser.schedule || [];
    const tbody = document.querySelector('#schedule-table tbody');
    tbody.innerHTML = '';
    
    schedule.forEach(item => {
        const row = document.createElement('tr');
        
        const courseCell = document.createElement('td');
        courseCell.textContent = item.course;
        
        const timeCell = document.createElement('td');
        timeCell.textContent = item.time;
        
        const daysCell = document.createElement('td');
        daysCell.textContent = item.days;
        
        const roomCell = document.createElement('td');
        roomCell.textContent = item.room;
        
        row.appendChild(courseCell);
        row.appendChild(timeCell);
        row.appendChild(daysCell);
        row.appendChild(roomCell);
        
        tbody.appendChild(row);
    });
}

// ======================
// TRANSCRIPT MANAGEMENT
// ======================

function viewFullTranscript() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const grades = currentUser.grades || [];
    const completedCourses = currentUser.completedCourses || [];
    
    let transcriptText = "=== OFFICIAL TRANSCRIPT ===\n";
    transcriptText += `Student: ${currentUser.username}\n`;
    transcriptText += `ID: ${currentUser.studentId}\n`;
    transcriptText += `GPA: ${currentUser.gpa || '0.00'}\n\n`;
    transcriptText += "=== COURSES & GRADES ===\n";
    
    if (grades.length === 0 && completedCourses.length === 0) {
        transcriptText += "No courses completed.\n";
    } else {
        // Combine current grades and completed courses
        const allCourses = [...grades];
        completedCourses.forEach(cc => {
            if (!allCourses.some(g => g.course === cc.code)) {
                allCourses.push({
                    course: cc.code,
                    grade: cc.grade || 'N/A'
                });
            }
        });
        
        allCourses.forEach(course => {
            transcriptText += `${course.course}: ${course.grade}\n`;
        });
    }
    
    // Open transcript modal
    const modal = document.getElementById('transcript-modal');
    document.getElementById('transcript-text').textContent = transcriptText;
    modal.style.display = 'block';
    
    // Set up print button
    document.getElementById('print-transcript-btn').onclick = function() {
        window.print();
    };
    
    // Set up close button
    modal.querySelector('.close-btn').onclick = function() {
        modal.style.display = 'none';
    };
}

// ======================
// INITIALIZATION
// ======================

function initModals() {
    // Course registration form
    document.getElementById('register-course-form').addEventListener('submit', function(e) {
        e.preventDefault();
        registerForCourse();
    });
    
    // Close buttons for all modals
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
}

function showSection(sectionName) {
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(`${sectionName}-section`).style.display = 'block';
    
    document.querySelectorAll('.sidebar a').forEach(a => {
        a.classList.remove('active');
    });
    document.querySelector(`a[data-section="${sectionName}"]`).classList.add('active');
    
    // Load section data if needed
    if (sectionName === 'grades') {
        loadGrades();
    } else if (sectionName === 'courses') {
        loadCourseCatalog();
        loadCompletedCourses();
    } else if (sectionName === 'schedule') {
        loadSchedule();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize student data first
    loadStudentData();
    setupCurrentDate();
    
    // Navigation handling
    document.querySelectorAll('.sidebar a[data-section]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showSection(this.getAttribute('data-section'));
        });
    });
    
    // Quick action buttons
    document.getElementById('add-grade-btn').addEventListener('click', function() {
        showSection('grades');
    });
    
    document.getElementById('add-course-btn').addEventListener('click', function() {
        showSection('courses');
    });
    
    document.getElementById('view-transcript-btn').addEventListener('click', function() {
        viewFullTranscript();
    });
    
    // Grade form submission
    document.getElementById('grade-form').addEventListener('submit', function(e) {
        e.preventDefault();
        addGrade();
    });
    
    // Logout button
    document.getElementById('logout-btn').addEventListener('click', function() {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });
    
    // Initialize course catalog button
    const addCourseBtn = document.createElement('button');
    addCourseBtn.textContent = 'Add New Course';
    addCourseBtn.classList.add('btn');
    addCourseBtn.id = 'add-new-course-btn';
    addCourseBtn.addEventListener('click', addNewCourse);
    
    const coursesCard = document.querySelector('#courses-section .card');
    if (coursesCard && !document.getElementById('add-new-course-btn')) {
        coursesCard.querySelector('h2').insertAdjacentElement('afterend', addCourseBtn);
    }
    
    // Initialize modals
    initModals();
    
    // Show dashboard by default
    showSection('dashboard');
});