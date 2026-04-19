// app.js
// Pengujian sederhana fungsi save task menggunakan console.assert
// Mensimulasikan localStorage di Node.js (tidak tersedia secara native)

const store = {};
const localStorage = {
  getItem: (key) => store[key] ?? null,
  setItem: (key, value) => { store[key] = value; },
  removeItem: (key) => { delete store[key]; },
};

const STORAGE_KEY = 'todolist-app-todos';

// --- Implementasi fungsi yang diuji ---

function isValidTodoItem(item) {
  if (!item || typeof item !== 'object') return false;
  return (
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    item.title.length > 0 &&
    typeof item.description === 'string' &&
    typeof item.completed === 'boolean' &&
    typeof item.createdAt === 'string'
  );
}

function save(todos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidTodoItem);
  } catch {
    return [];
  }
}

// --- Data bantu ---

function makeTodo(overrides = {}) {
  return {
    id: 'uuid-001',
    title: 'Belajar JavaScript',
    description: 'Pelajari dasar-dasar JS',
    completed: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// ============================================================
// INPUT NORMAL
// ============================================================

// 1. Menyimpan satu task valid dan memuatnya kembali
{
  const todos = [makeTodo()];
  save(todos);
  const result = load();
  console.assert(result.length === 1, 'GAGAL: harus ada 1 task setelah disimpan');
  console.assert(result[0].title === 'Belajar JavaScript', 'GAGAL: judul task tidak sesuai');
  console.log('✅ [Normal 1] Simpan dan muat 1 task valid — OK');
}

// 2. Menyimpan beberapa task sekaligus
{
  const todos = [
    makeTodo({ id: 'uuid-001', title: 'Task A' }),
    makeTodo({ id: 'uuid-002', title: 'Task B', completed: true }),
  ];
  save(todos);
  const result = load();
  console.assert(result.length === 2, 'GAGAL: harus ada 2 task');
  console.assert(result[1].completed === true, 'GAGAL: task kedua harus completed');
  console.log('✅ [Normal 2] Simpan dan muat beberapa task — OK');
}

// 3. Menimpa data lama dengan data baru
{
  save([makeTodo({ id: 'uuid-001', title: 'Task Lama' })]);
  save([makeTodo({ id: 'uuid-002', title: 'Task Baru' })]);
  const result = load();
  console.assert(result.length === 1, 'GAGAL: harus ada 1 task setelah ditimpa');
  console.assert(result[0].title === 'Task Baru', 'GAGAL: data lama seharusnya tertimpa');
  console.log('✅ [Normal 3] Timpa data lama dengan data baru — OK');
}

// 4. Menyimpan array kosong (hapus semua task)
{
  save([makeTodo()]);
  save([]);
  const result = load();
  console.assert(result.length === 0, 'GAGAL: harus kosong setelah disimpan array kosong');
  console.log('✅ [Normal 4] Simpan array kosong — OK');
}

// ============================================================
// INPUT NEGATIF
// ============================================================

// 5. Task dengan title kosong harus difilter saat dimuat
{
  const invalid = { id: 'uuid-bad', title: '', description: 'desc', completed: false, createdAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([invalid]));
  const result = load();
  console.assert(result.length === 0, 'GAGAL: task dengan title kosong harus dibuang');
  console.log('✅ [Negatif 1] Task dengan title kosong difilter — OK');
}

// 6. Data di localStorage bukan array (misal: objek tunggal)
{
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: 'uuid-001', title: 'Bukan array' }));
  const result = load();
  console.assert(result.length === 0, 'GAGAL: data bukan array harus menghasilkan []');
  console.log('✅ [Negatif 2] Data bukan array menghasilkan [] — OK');
}

// 7. Data di localStorage adalah JSON tidak valid
{
  localStorage.setItem(STORAGE_KEY, 'INI BUKAN JSON {{{');
  const result = load();
  console.assert(result.length === 0, 'GAGAL: JSON rusak harus menghasilkan []');
  console.log('✅ [Negatif 3] JSON rusak menghasilkan [] — OK');
}

// 8. Task dengan field yang hilang (tidak ada `completed`) harus difilter
{
  const incomplete = { id: 'uuid-x', title: 'Task tanpa completed', description: 'desc', createdAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([incomplete]));
  const result = load();
  console.assert(result.length === 0, 'GAGAL: task dengan field hilang harus dibuang');
  console.log('✅ [Negatif 4] Task dengan field hilang difilter — OK');
}

// 9. localStorage kosong harus mengembalikan array kosong
{
  localStorage.removeItem(STORAGE_KEY);
  const result = load();
  console.assert(Array.isArray(result), 'GAGAL: harus mengembalikan array');
  console.assert(result.length === 0, 'GAGAL: harus kosong jika localStorage kosong');
  console.log('✅ [Negatif 5] localStorage kosong mengembalikan [] — OK');
}

console.log('\n✅ Semua pengujian selesai.');
