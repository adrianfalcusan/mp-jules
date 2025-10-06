require('dotenv').config();
const BunnyCDNService = require('./services/bunnycdn.service');

const service = new BunnyCDNService();
console.log('Pull Zone URL from config:', service.config.pullZoneUrl);
console.log('Should add https:', !service.config.pullZoneUrl.startsWith('http'));

// Test URL generation
const testPath = 'videos/test-video.mp4';
const baseUrl = service.config.pullZoneUrl.startsWith('http') 
  ? service.config.pullZoneUrl 
  : \https://\\;
const cdnUrl = \\/\\;
console.log('Generated URL:', cdnUrl);
