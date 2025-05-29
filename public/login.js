import { supabase } from './supabase.js';

const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginStatus = document.getElementById('login-status');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    loginStatus.textContent = 'Username and password are required.';
    return;
  }

  // Try to find the user
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .eq('password', password);

  if (error) {
    loginStatus.textContent = 'Error checking user.';
    console.error(error);
    return;
  }

  if (users.length === 1) {
    // Success — store user in localStorage
    localStorage.setItem('pot_user', JSON.stringify(users[0]));
    window.location.href = 'user.html';
  } else {
    loginStatus.textContent = 'Invalid username or password.';
  }
});

// Optional: create a user manually (for first-time testing)
document.getElementById('create-user-btn').addEventListener('click', async () => {
  const username = prompt('Enter new username:');
  const password = prompt('Enter password:');
  if (!username || !password) return;

  const { data, error } = await supabase
    .from('users')
    .insert([{ username, password, wallet: 1000 }]);

  if (error) {
    alert('Error creating user: ' + error.message);
  } else {
    alert('User created! You can now log in.');
  }
});
