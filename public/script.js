const selectedStudents = new Map();

function addStudent(id, username) {
  if (!selectedStudents.has(id)) {
    selectedStudents.set(id, username);
    updateStudentItem(id);
    updateHiddenInputs();
  }
}

function removeStudent(id) {
  if (selectedStudents.has(id)) {
    selectedStudents.delete(id);
    updateStudentItem(id);
    updateHiddenInputs();
  }
}

function updateStudentItem(id) {
  const studentDiv = document.getElementById(`student-${id}`);

  if (selectedStudents.has(id)) {
    studentDiv.classList.add('selected');
  } else {
    studentDiv.classList.remove('selected');
  }
}

function updateHiddenInputs() {
  const container = document.getElementById('selected-students-container');
  container.innerHTML = ''; // Clear previous hidden inputs

  selectedStudents.forEach((username, id) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'students[]'; // Important: []
    input.value = id;
    container.appendChild(input);
  });
}
