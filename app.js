// Dashboard Functionality
document.addEventListener('DOMContentLoaded', function() {
  // Check authentication
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) {
      window.location.href = 'index.html';
      return;
  }

  // Sample BHS Course Catalog
  const bhsCourses = [
      { code: 'BHS101', name: 'Intro to Health Sciences', credits: 3, prerequisites: 'None' },
      { code: 'BHS201', name: 'Medical Terminology', credits: 3, prerequisites: 'BHS101' },
      { code: 'BHS202', name: 'Anatomy & Physiology', credits: 4, prerequisites: 'BHS101' },
      { code: 'BHS301', name: 'Clinical Procedures', credits: 4, prerequisites: 'BHS201, BHS202' },
      { code: 'BHS302', name: 'Healthcare Systems', credits: 3, prerequisites: 'BHS201' },
      { code: 'BHS401', name: 'Capstone Project', credits: 4, prerequisites: 'Completion of 30 credits' }
  ];

  // Initialize student data
  let studentData = JSON.parse(localStorage.getItem('studentData')) || {
      id: currentUser.username,
      name: currentUser.username,
      major: 'Biomedical Health Sciences',
      year: 'Freshman',
      gpa: '0.0',
      grades: [],
      schedule: [],
      completedCourses: []
  };

  // DOM Elements
  const sections = document.querySelectorAll('.section');
  const navLinks = document.querySelectorAll('.sidebar a');
  const studentNameEl = document.getElementById('student-name');
  const studentIdEl = document.getElementById('student-id');
  const studentMajorEl = document.getElementById('student-major');
  const studentYearEl = document.getElementById('student-year');
  const studentGpaEl = document.getElementById('student-gpa');
  const gradesTable = document.getElementById('grades-table').querySelector('tbody');
  const scheduleTable = document.getElementById('schedule-table').querySelector('tbody');
  const catalogTable = document.getElementById('catalog-table').querySelector('tbody');
  const completedCoursesTable = document.getElementById('completed-courses-table').querySelector('tbody');
  const courseSelect = document.getElementById('course-select');
  const gradeForm = document.getElementById('grade-form');
  const modalCourseSelect = document.getElementById('modal-course-select');
  const registerCourseForm = document.getElementById('register-course-form');
  const courseSearch = document.getElementById('course-search');
  const modal = document.getElementById('course-modal');
  const closeBtn = document.querySelector('.close-btn');
  const addGradeBtn = document.getElementById('add-grade-btn');
  const addCourseBtn = document.getElementById('add-course-btn');
  const viewTranscriptBtn = document.getElementById('view-transcript-btn');

  // Initialize dashboard
  function initDashboard() {
      // Display student info
      updateStudentInfo();
      
      // Populate course selects
      populateCourseSelects();
      
      // Load data tables
      loadAllTables();
  }

  // Update student information display
  function updateStudentInfo() {
      studentNameEl.textContent = studentData.name;
      studentIdEl.textContent = studentData.id;
      studentMajorEl.textContent = studentData.major;
      studentYearEl.textContent = studentData.year;
      studentGpaEl.textContent = calculateGPA();
      
      // Display current date
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-US', options);
  }

  // Navigation
  navLinks.forEach(link => {
      link.addEventListener('click', function(e) {
          e.preventDefault();
          if (this.id !== 'logout-btn') {
              const sectionId = this.getAttribute('data-section') + '-section';
              
              // Update active nav link
              navLinks.forEach(nav => nav.classList.remove('active'));
              this.classList.add('active');
              
              // Show selected section
              sections.forEach(section => section.classList.remove('active'));
              document.getElementById(sectionId).classList.add('active');
          }
      });
  });

  // Populate course dropdowns
  function populateCourseSelects() {
      courseSelect.innerHTML = '';
      modalCourseSelect.innerHTML = '';
      
      const availableCourses = bhsCourses.filter(course => 
          !studentData.completedCourses.some(c => c.code === course.code) &&
          !studentData.schedule.some(c => c.code === course.code)
      );
      
      if (availableCourses.length === 0) {
          const option = document.createElement('option');
          option.textContent = 'No courses available';
          option.disabled = true;
          courseSelect.appendChild(option);
          modalCourseSelect.appendChild(option.cloneNode(true));
          return;
      }
      
      availableCourses.forEach(course => {
          const option1 = document.createElement('option');
          option1.value = course.code;
          option1.textContent = `${course.code} - ${course.name}`;
          courseSelect.appendChild(option1);
          
          const option2 = option1.cloneNode(true);
          modalCourseSelect.appendChild(option2);
      });
  }

  // Grade Management
  gradeForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const courseCode = courseSelect.value;
      const grade = document.getElementById('grade-input').value.toUpperCase();
      
      // Validate grade format
      if (!/^[A-F][+-]?$/.test(grade)) {
          alert('Please enter a valid grade (A-F with optional + or -)');
          return;
      }
      
      // Find course details
      const course = bhsCourses.find(c => c.code === courseCode);
      if (!course) return;
      
      // Add to grades
      studentData.grades.push({
          code: courseCode,
          name: course.name,
          grade: grade,
          date: new Date().toISOString()
      });
      
      // Add to completed courses if passing grade
      if (grade !== 'F') {
          studentData.completedCourses.push({
              code: courseCode,
              name: course.name,
              grade: grade,
              date: new Date().toISOString()
          });
          
          // Remove from schedule if exists
          studentData.schedule = studentData.schedule.filter(c => c.code !== courseCode);
      }
      
      saveStudentData();
      loadAllTables();
      updateStudentInfo();
      gradeForm.reset();
  });

  // Course Registration
  addCourseBtn.addEventListener('click', function() {
      modal.style.display = 'block';
  });

  closeBtn.addEventListener('click', function() {
      modal.style.display = 'none';
  });

  window.addEventListener('click', function(e) {
      if (e.target === modal) {
          modal.style.display = 'none';
      }
  });

  registerCourseForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const courseCode = modalCourseSelect.value;
      const time = document.getElementById('course-time').value;
      const days = document.getElementById('course-days').value;
      const room = document.getElementById('course-room').value;
      
      // Validate inputs
      if (!courseCode || !time || !days || !room) {
          alert('Please fill all fields');
          return;
      }
      
      // Find course details
      const course = bhsCourses.find(c => c.code === courseCode);
      if (!course) return;
      
      // Check prerequisites
      if (course.prerequisites !== 'None') {
          const prereqs = course.prerequisites.split(',').map(p => p.trim());
          const missingPrereqs = prereqs.filter(p => 
              !studentData.completedCourses.some(c => c.code === p) &&
              !p.includes('credits')
          );
          
          if (missingPrereqs.length > 0) {
              alert(`Missing prerequisites: ${missingPrereqs.join(', ')}`);
              return;
          }
      }
      
      // Add to schedule
      studentData.schedule.push({
          code: courseCode,
          name: course.name,
          time: time,
          days: days,
          room: room,
          added: new Date().toISOString()
      });
      
      saveStudentData();
      loadAllTables();
      populateCourseSelects();
      registerCourseForm.reset();
      modal.style.display = 'none';
  });

  // View Transcript Button
  viewTranscriptBtn.addEventListener('click', function() {
      // Switch to grades section
      navLinks.forEach(nav => nav.classList.remove('active'));
      document.querySelector('[data-section="grades"]').classList.add('active');
      sections.forEach(section => section.classList.remove('active'));
      document.getElementById('grades-section').classList.add('active');
  });

  // Search functionality
  courseSearch.addEventListener('input', function() {
      loadCatalogTable();
  });

  // Load all data tables
  function loadAllTables() {
      loadGradesTable();
      loadScheduleTable();
      loadCatalogTable();
      loadCompletedCoursesTable();
  }

  function loadGradesTable() {
      gradesTable.innerHTML = '';
      
      if (studentData.grades.length === 0) {
          gradesTable.innerHTML = '<tr><td colspan="3" class="text-center">No grades recorded yet</td></tr>';
          return;
      }
      
      // Sort by date (newest first)
      const sortedGrades = [...studentData.grades].sort((a, b) => 
          new Date(b.date) - new Date(a.date)
      );
      
      sortedGrades.forEach(grade => {
          const row = document.createElement('tr');
          row.innerHTML = `
              <td>${grade.code} - ${grade.name}</td>
              <td>${grade.grade}</td>
              <td>
                  <button class="btn btn-sm btn-danger delete-grade" data-code="${grade.code}">
                      Delete
                  </button>
              </td>
          `;
          gradesTable.appendChild(row);
      });
      
      // Add delete event listeners
      document.querySelectorAll('.delete-grade').forEach(btn => {
          btn.addEventListener('click', function() {
              const code = this.getAttribute('data-code');
              if (confirm('Are you sure you want to delete this grade?')) {
                  studentData.grades = studentData.grades.filter(g => g.code !== code);
                  studentData.completedCourses = studentData.completedCourses.filter(c => c.code !== code);
                  saveStudentData();
                  loadAllTables();
                  updateStudentInfo();
              }
          });
      });
  }

  function loadScheduleTable() {
      scheduleTable.innerHTML = '';
      
      if (studentData.schedule.length === 0) {
          scheduleTable.innerHTML = '<tr><td colspan="4" class="text-center">No courses scheduled</td></tr>';
          return;
      }
      
      studentData.schedule.forEach(course => {
          const row = document.createElement('tr');
          row.innerHTML = `
              <td>${course.code} - ${course.name}</td>
              <td>${course.time}</td>
              <td>${course.days}</td>
              <td>
                  ${course.room}
                  <button class="btn btn-sm btn-danger float-right drop-course" data-code="${course.code}">
                      Drop
                  </button>
              </td>
          `;
          scheduleTable.appendChild(row);
      });
      
      // Add drop event listeners
      document.querySelectorAll('.drop-course').forEach(btn => {
          btn.addEventListener('click', function() {
              const code = this.getAttribute('data-code');
              if (confirm('Are you sure you want to drop this course?')) {
                  studentData.schedule = studentData.schedule.filter(c => c.code !== code);
                  saveStudentData();
                  loadAllTables();
                  populateCourseSelects();
              }
          });
      });
  }

  function loadCatalogTable() {
      catalogTable.innerHTML = '';
      const searchTerm = courseSearch.value.toLowerCase();
      
      const filteredCourses = bhsCourses.filter(course => 
          course.name.toLowerCase().includes(searchTerm) ||
          course.code.toLowerCase().includes(searchTerm)
      );
      
      if (filteredCourses.length === 0) {
          catalogTable.innerHTML = '<tr><td colspan="5" class="text-center">No courses found</td></tr>';
          return;
      }
      
      filteredCourses.forEach(course => {
          const isCompleted = studentData.completedCourses.some(c => c.code === course.code);
          const isRegistered = studentData.schedule.some(c => c.code === course.code);
          
          const row = document.createElement('tr');
          row.innerHTML = `
              <td>${course.code}</td>
              <td>${course.name}</td>
              <td>${course.credits}</td>
              <td>${course.prerequisites}</td>
              <td>
                  ${isCompleted ? 
                      '<span class="badge badge-success">Completed</span>' : 
                    isRegistered ? 
                      '<span class="badge badge-info">Registered</span>' :
                    `<button class="btn btn-sm btn-secondary register-course" data-code="${course.code}">
                      Register
                     </button>`
                  }
              </td>
          `;
          catalogTable.appendChild(row);
      });
      
      // Add register event listeners
      document.querySelectorAll('.register-course').forEach(btn => {
          btn.addEventListener('click', function() {
              const code = this.getAttribute('data-code');
              modalCourseSelect.value = code;
              modal.style.display = 'block';
          });
      });
  }

  function loadCompletedCoursesTable() {
      completedCoursesTable.innerHTML = '';
      
      if (studentData.completedCourses.length === 0) {
          completedCoursesTable.innerHTML = '<tr><td colspan="3" class="text-center">No courses completed yet</td></tr>';
          return;
      }
      
      // Sort by date (newest first)
      const sortedCourses = [...studentData.completedCourses].sort((a, b) => 
          new Date(b.date) - new Date(a.date)
      );
      
      sortedCourses.forEach(course => {
          const row = document.createElement('tr');
          row.innerHTML = `
              <td>${course.code}</td>
              <td>${course.name}</td>
              <td>${course.grade}</td>
          `;
          completedCoursesTable.appendChild(row);
      });
  }

  // Calculate GPA
  function calculateGPA() {
      if (studentData.grades.length === 0) return '0.0';
      
      const gradePoints = {
          'A+': 4.0, 'A': 4.0, 'A-': 3.7,
          'B+': 3.3, 'B': 3.0, 'B-': 2.7,
          'C+': 2.3, 'C': 2.0, 'C-': 1.7,
          'D+': 1.3, 'D': 1.0, 'F': 0.0
      };
      
      let totalPoints = 0;
      let totalCourses = 0;
      
      studentData.grades.forEach(grade => {
          if (gradePoints.hasOwnProperty(grade.grade)) {
              totalPoints += gradePoints[grade.grade];
              totalCourses++;
          }
      });
      
      return (totalPoints / totalCourses).toFixed(2);
  }

  // Save student data
  function saveStudentData() {
      localStorage.setItem('studentData', JSON.stringify(studentData));
  }

  // Logout
  document.getElementById('logout-btn').addEventListener('click', function(e) {
      e.preventDefault();
      localStorage.removeItem('currentUser');
      window.location.href = 'index.html';
  });

  // Initialize
  initDashboard();
  document.getElementById('dashboard-section').classList.add('active');
  document.querySelector('[data-section="dashboard"]').classList.add('active');
});