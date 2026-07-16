import { spawn } from 'child_process';

const args = process.argv.slice(2);
const cleanedArgs = [];

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--host') {
    cleanedArgs.push('--hostname');
  } else {
    cleanedArgs.push(args[i]);
  }
}

if (!cleanedArgs.includes('--port') && !cleanedArgs.includes('-p')) {
  cleanedArgs.push('--port', '3000');
}

if (!cleanedArgs.includes('--hostname') && !cleanedArgs.includes('-H')) {
  cleanedArgs.push('--hostname', '0.0.0.0');
}

console.log('Running: npx next start', cleanedArgs.join(' '));

const child = spawn('npx', ['next', 'start', ...cleanedArgs], {
  stdio: 'inherit',
  shell: true
});

child.on('close', (code) => {
  process.exit(code || 0);
});
