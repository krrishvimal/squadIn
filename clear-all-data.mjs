import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mfkmnfjagykywumkxhty.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ma21uZmphZ3lreXd1bWt4aHR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3NzU5MDYsImV4cCI6MjEwNjM1MTkwNn0.HAlZHeB3WcBkTxiF6e23_FIZVcBS3I0gKB0jxM0RYlI'
);

const tables = ['messages', 'plan_requests', 'plans', 'profiles'];

async function clearAll() {
  console.log('🗑️  Clearing all SquadIn data from Supabase...\n');

  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).delete().neq('id', '___impossible___');
      if (error) {
        console.log(`  ⚠️  ${table}: ${error.message}`);
      } else {
        console.log(`  ✅  ${table}: cleared`);
      }
    } catch (e) {
      console.log(`  ❌  ${table}: ${e.message}`);
    }
  }

  console.log('\n✅ All Supabase tables cleared!');
  console.log('📱 Now clear localStorage on BOTH devices:');
  console.log('   → Open Console (F12) on each device and run:');
  console.log('   → localStorage.clear(); location.reload();');
}

clearAll();
