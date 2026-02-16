import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupThemes() {
  console.log('🚀 Setting up themes table...\n');

  try {
    const sqlFile = fs.readFileSync(path.join(__dirname, 'create_themes_system.sql'), 'utf8');

    const statements = sqlFile
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('/*') && !s.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';

      if (statement.includes('CREATE TABLE')) {
        console.log('📋 Creating themes table...');
      } else if (statement.includes('ALTER TABLE page_templates')) {
        console.log('🔧 Adding theme_id column to page_templates...');
      } else if (statement.includes('ENABLE ROW LEVEL SECURITY')) {
        console.log('🔒 Enabling Row Level Security...');
      } else if (statement.includes('CREATE POLICY')) {
        console.log('🛡️  Creating security policy...');
      } else if (statement.includes('DROP POLICY')) {
        console.log('🗑️  Cleaning up old policies...');
      } else if (statement.includes('INSERT INTO themes')) {
        console.log('🎨 Inserting default themes...');
      }

      const { error } = await supabase.rpc('exec_sql', { sql_query: statement });

      if (error && !error.message.includes('already exists')) {
        console.error(`❌ Error executing statement ${i + 1}:`, error.message);
      }
    }

    const { data: themes, error: fetchError } = await supabase
      .from('themes')
      .select('name')
      .eq('is_default', true);

    if (fetchError) {
      console.error('\n❌ Error fetching themes:', fetchError.message);
      console.log('\n⚠️  The table was created but verification failed.');
      console.log('Please check your Supabase dashboard manually.\n');
      return;
    }

    console.log('\n✅ Setup completed successfully!');
    console.log(`\n📊 Found ${themes?.length || 0} default themes:`);
    themes?.forEach(theme => console.log(`   - ${theme.name}`));
    console.log('\n🎉 You can now use the Theme Manager in your application!\n');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.log('\n📝 Please run the SQL script manually:');
    console.log('   1. Open Supabase Dashboard');
    console.log('   2. Go to SQL Editor');
    console.log('   3. Copy and paste content from create_themes_system.sql');
    console.log('   4. Execute the script\n');
    process.exit(1);
  }
}

setupThemes();
