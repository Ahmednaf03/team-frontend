const fs = require('fs');
const lines = fs.readFileSync('src/pages/Prescriptions/Prescriptions.jsx', 'utf8').split(/\r?\n/);
for (let i = 860; i <= 940; i += 1) {
  console.log(`${i}:${lines[i - 1]}`);
}
