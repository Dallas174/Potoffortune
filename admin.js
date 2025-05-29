import { supabase } from './supabase.js';

const poolList = document.getElementById('pool-list');
const winnerList = document.getElementById('winner-list');

// Load all pools
async function loadPools() {
  const { data: pools } = await supabase.from('pools').select('*');
  if (pools) {
    poolList.innerHTML = '';
    for (const pool of pools) {
      const players = pool.players || [];

      const poolEl = document.createElement('div');
      poolEl.className = 'border p-4 m-2 rounded shadow';

      poolEl.innerHTML = `
        <h2 class="text-xl font-bold mb-2">Pool: $${pool.amount}</h2>
        <p><strong>Players (${players.length}):</strong> ${players.join(', ') || 'None'}</p>
        <button class="mt-2 bg-green-600 text-white px-4 py-1 rounded" onclick="spinPool(${pool.id}, ${pool.amount})">
          Spin Now
        </button>
      `;

      poolList.appendChild(poolEl);
    }
  }
}

// Spin a pool: pick random winners & update wallets
window.spinPool = async function(poolId, amount) {
  const { data: pool } = await supabase.from('pools').select('*').eq('id', poolId).single();
  const players = pool?.players || [];

  if (players.length === 0) return alert('No players in this pool');

  const winnerCount = Math.max(1, Math.floor(players.length * 0.3)); // 30% winners
  const shuffled = [...players].sort(() => Math.random() - 0.5);
  const winners = shuffled.slice(0, winnerCount);

  const prizePerWinner = (players.length * amount * 0.9) / winners.length; // 90% pool split

  for (const userId of winners) {
    await supabase.from('winners').insert({
      user_id: userId,
      amount: prizePerWinner,
      pool_id: poolId
    });

    // Update wallet
    const { data: userData } = await supabase.from('users').select('wallet').eq('id', userId).single();
    await supabase
      .from('users')
      .update({ wallet: userData.wallet + prizePerWinner })
      .eq('id', userId);
  }

  // Reset pool players
  await supabase.from('pools').update({ players: [] }).eq('id', poolId);

  alert(`Spun Pool $${amount}, Winners: ${winners.length}`);
  loadPools();
  loadWinners();
};

// Show past winners
async function loadWinners() {
  const { data: wins } = await supabase
    .from('winners')
    .select('*, users(username)')
    .order('timestamp', { ascending: false })
    .limit(10);

  if (wins) {
    winnerList.innerHTML = '';
    wins.forEach(win => {
      const el = document.createElement('div');
      el.className = 'border p-2 my-2 rounded';
      el.innerHTML = `
        🏆 User ${win.user_id} won $${win.amount.toFixed(2)} in Pool $${win.pool_id}
        <small class="block text-gray-500">${new Date(win.timestamp).toLocaleString()}</small>
      `;
      winnerList.appendChild(el);
    });
  }
}

// Real-time updates
supabase
  .channel('pools-watch')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'pools' }, payload => {
    loadPools();
  })
  .subscribe();

// Initial load
loadPools();
loadWinners();
