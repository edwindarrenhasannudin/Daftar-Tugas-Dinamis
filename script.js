let tasks = JSON.parse(localStorage.getItem('tasks')) || []; // Ambil daftar tugas dari localStorage atau inisialisasi dengan array kosong jika tidak ada data
let filterStatus = 'all'; // Status filter default adalah 'semua' (menampilkan semua tugas)
let sortMethod = 'none'; // Metode pengurutan default adalah 'tidak ada' (tidak ada pengurutan)
let editIndex = -1; // Indeks tugas yang sedang diedit, -1 berarti tidak ada tugas yang diedit

// Tambahkan event listener untuk form tugas, dropdown pengurutan, dan tombol batal
document.getElementById('taskForm').addEventListener('submit', handleTaskForm);
document.getElementById('sortTasks').addEventListener('change', sortTasks);
document.getElementById('discardButton').addEventListener('click', discardChanges);

// Fungsi untuk menangani pengiriman form tugas
function handleTaskForm(e) {
  e.preventDefault(); // Mencegah pengiriman form default
  const title = document.getElementById('taskTitle').value.trim(); // Mengambil dan membersihkan judul tugas
  const dueDate = document.getElementById('taskDueDate').value; // Mengambil tanggal jatuh tempo tugas
  const priority = document.getElementById('taskPriority').value; // Mengambil prioritas tugas

  if (!title) { // Jika judul kosong, tampilkan peringatan
    alert('Task title cannot be empty');
    return;
  }

  const task = { title, dueDate, priority, completed: false }; // Membuat objek tugas baru dengan status 'belum selesai'

  if (editIndex >= 0) { // Jika sedang dalam mode edit, update tugas yang ada
    tasks[editIndex] = { ...tasks[editIndex], ...task };
    resetEditMode(); // Reset mode edit setelah update
  } else {
    tasks.push(task); // Jika tidak, tambahkan tugas baru ke daftar
  }

  saveTasks(); // Simpan daftar tugas ke localStorage
  displayTasks(); // Tampilkan daftar tugas
  clearForm(); // Kosongkan form setelah pengiriman
}

// Fungsi untuk mengosongkan form
function clearForm() {
  document.getElementById('taskForm').reset(); // Reset elemen form
}

// Fungsi untuk membatalkan perubahan saat dalam mode edit
function discardChanges() {
  clearForm(); // Bersihkan form
  resetEditMode(); // Kembali ke mode tambah
}

// Fungsi untuk mereset mode edit ke mode tambah
function resetEditMode() {
  editIndex = -1; // Set editIndex ke -1
  document.getElementById('submitButton').innerText = 'Tambah Tugas'; // Ubah teks tombol ke 'Tambah Tugas'
  document.getElementById('discardButton').style.display = 'none'; // Sembunyikan tombol batal
}

// Fungsi untuk memulai mode edit pada tugas tertentu
function editTask(index) {
  const task = tasks[index]; // Ambil tugas dari daftar
  document.getElementById('taskTitle').value = task.title; // Isi form dengan data tugas
  document.getElementById('taskDueDate').value = task.dueDate;
  document.getElementById('taskPriority').value = task.priority;

  editIndex = index; // Set editIndex ke indeks tugas yang sedang diedit
  document.getElementById('submitButton').innerText = 'Simpan Perubahan'; // Ubah teks tombol
  document.getElementById('discardButton').style.display = 'inline-block'; // Tampilkan tombol batal
}

// Fungsi untuk mengubah status penyelesaian tugas
function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed; // Toggle status 'completed' dari tugas
  saveTasks(); // Simpan perubahan
  displayTasks(); // Tampilkan daftar tugas
}

// Fungsi untuk menghapus tugas
function deleteTask(index) {
  tasks.splice(index, 1); // Hapus tugas dari daftar
  saveTasks(); // Simpan perubahan
  displayTasks(); // Tampilkan daftar tugas
}

// Fungsi untuk menyaring tugas berdasarkan status (semua, aktif, selesai)
function filterTasks(status) {
  filterStatus = status; // Set filterStatus sesuai input
  displayTasks(); // Tampilkan tugas sesuai filter
}

// Fungsi untuk mengurutkan tugas berdasarkan metode yang dipilih
function sortTasks() {
  sortMethod = document.getElementById('sortTasks').value; // Set metode pengurutan
  displayTasks(); // Tampilkan tugas yang sudah diurutkan
}

// Fungsi untuk memeriksa dan memberi peringatan tanggal jatuh tempo
function checkDueDates() {
    const today = new Date().toISOString().split('T')[0]; // Mendapatkan tanggal hari ini dalam format 'YYYY-MM-DD'
    tasks.forEach((task, index) => {
      if (task.dueDate && task.dueDate < today && !task.completed) {
        alert(`Tugas "${task.title}" telah melewati tanggal jatuh tempo!`);
      } else if (task.dueDate === today && !task.completed) {
        alert(`Tugas "${task.title}" jatuh tempo hari ini!`);
      }
    });
}  

// Fungsi untuk menampilkan tugas sesuai filter dan pengurutan
function displayTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
  
    const today = new Date().toISOString().split('T')[0]; // Mendapatkan tanggal hari ini
  
    // Filter dan urutkan tugas seperti sebelumnya
    const filteredTasks = tasks.filter(task => {
      if (filterStatus === 'active') return !task.completed;
      if (filterStatus === 'completed') return task.completed;
      return true;
    });
  
    filteredTasks.sort((a, b) => {
      if (sortMethod === 'priority') {
        const priorities = { high: 1, medium: 2, low: 3 };
        return priorities[a.priority] - priorities[b.priority];
      } else if (sortMethod === 'dueDate') {
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      return 0;
    });
  
    filteredTasks.forEach((task, index) => {
      const taskItem = document.createElement('li');
      taskItem.className = 'task-item';
  
      // Tambahkan kelas warna jika tugas jatuh tempo hari ini atau telah lewat
      if (task.dueDate && task.dueDate < today && !task.completed) {
        taskItem.style.backgroundColor = '#ffcccc'; // Warna merah untuk tugas yang telah lewat
      } else if (task.dueDate === today && !task.completed) {
        taskItem.style.backgroundColor = '#fff3cd'; // Warna kuning untuk tugas jatuh tempo hari ini
      }
  
      const taskText = `<span class="${task.completed ? 'completed-text' : ''}">
        ${task.title} - ${task.dueDate || 'Tidak ada tanggal'} (${task.priority})
      </span>`;
  
      const editButton = (filterStatus === 'all' && sortMethod === 'none')
        ? `<button class="btn-edit" onclick="editTask(${index})">Edit</button>`
        : '';
  
      const completeButton = (filterStatus === 'all' && sortMethod === 'none')  
        ? `<button class="btn-complete" onclick="toggleTask(${index})">${task.completed ? 'Batal' : 'Selesai'}</button>`
        : '';
  
      taskItem.innerHTML = `
        ${taskText}
        <div class="task-actions">
          ${completeButton}
          ${editButton}
          <button class="btn-delete" onclick="deleteTask(${index})">Hapus</button>
        </div>
      `;
      taskList.appendChild(taskItem);
    });
  
    updateStats();
}
  
// Fungsi untuk menyimpan daftar tugas ke localStorage
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Fungsi untuk memperbarui statistik tugas
function updateStats() {
  const completedTasks = tasks.filter(task => task.completed).length;
  document.getElementById('taskStats').innerText = `Tugas Selesai: ${completedTasks} / Total Tugas: ${tasks.length}`;
}

// Tampilkan tugas saat halaman selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
    displayTasks();
    checkDueDates(); // Periksa tanggal jatuh tempo saat halaman dimuat
});
