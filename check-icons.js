const icons = require('lucide-react');
console.log('Keys:', Object.keys(icons).slice(0, 10));
const testIcon = icons['Rocket'] || icons['rocket'];
console.log('Rocket icon found:', !!testIcon);
