require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const { formatWhatsAppNumber, sendWhatsAppMessage, sendWelcomeWhatsApp, getWhatsAppStatus } = require('./server/services/whatsappService');

console.log('1. Configuration Status:');
console.log(getWhatsAppStatus());

console.log('\n2. Phone Number Sanitization Tests:');
const samplePhones = [
  '+971 58 168 5389',
  '0581685389',
  '581685389',
  '+971-58-168-5389',
  '00971581685389',
  '+91 9876543210'
];
samplePhones.forEach(p => console.log(`  "${p}" => "${formatWhatsAppNumber(p)}"`));

console.log('\n3. Dry Run Send Welcome WhatsApp:');
sendWelcomeWhatsApp('+971 58 168 5389').then(res => {
  console.log('Result without live key:', res);
});

