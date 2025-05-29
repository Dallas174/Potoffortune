import { supabase } from './supabase.js';

let currentUser = JSON.parse(localStorage.getItem('pot_user'));
if (!currentUser) {
  window.location.href = 'login.html';
}

const walletDisplay = document.getElementById('wallet');
const poolList = document.getElementById('pool-list');
const message = document.getElementById('message');

// Load wallet
async function loadWallet() {
  const { data, error } = await supabase
    .from('users')
    .select('wallet')
    .eq('id', currentUser.id)
    .single();

  if (data) {
    currentUser.wallet = data.wallet;
    localStorage.setItem('pot_user', JSON.stringify(currentUser));
    walletDisplay.textContent = `$${currentUser.wallet}`;
  }
}

// Load pools
async function loadPools() {
  const { data: pools, error } = await supabase
    .from('pools')
    .select('*');

  if (pools) {
    poolList.innerHTML = '';
    pools.forEach(pool => {
      const el = document.createElement('div');
      el.className = 'border p-2 m-2 rounded shadow';
      el.innerHTML = `
        <h3 class="font-bold">Pool $${pool.amount}</h3>
        <p>Players: ${pool.players ? pool.players.length : 0}</p>
        <button class="bg-blue-500 text-white px-2 py-1 rounded" onclick="joinPool(${pool.id}, ${pool.amount})">Join</button>
      `;
      poolList.appendChild(el);
    });
  }
}

// Join pool
window.joinPool = async function(poolId, amount) {
  if (currentUser.wallet < amount) {
    alert('Not enough funds');
    return;
  }

  // Add user to pool
  const { data: poolData, error } = await supabase
    .from('pools')
    .update({
      players: supabase.rpc('array_append_unique', {
        array: 'players',
        value: currentUser.id
      })
    })
    .eq('id', poolId)
    .select();

  if (!error) {
    // Deduct wallet
    await supabase
      .from('users')
      .update({ wallet: currentUser.wallet - amount })
      .eq('id', currentUser.id);

    await loadWallet();
    await loadPools();
    alert(`Joined $${amount} pool!`);
  } else {
    console.error(error);
    alert('Failed to join pool');
  }
}

// Listen for spin results
supabase
  .channel('winners-channel')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'winners' }, payload => {
    const winner = payload.new;
    if (winner.user_id === currentUser.id) {
      message.textContent = `🎉 You won $${winner.amount}!`;
      loadWallet();
    }
  })
  .subscribe();

// Initial load
loadWallet();
loadPools();
