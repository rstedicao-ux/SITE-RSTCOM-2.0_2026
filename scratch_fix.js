const fs = require('fs');
const path = require('path');
const mobFile = '\\\\192.168.50.10\\ti\\site rstcom 2026_D.A.ARTHUR\\SITE RSTCOM 2026_ART\\mobile\\index.html';

let html = fs.readFileSync(mobFile, 'utf8');
html = html.replace(/data-media="([^"]+)"/g, (match, mediaStr) => {
  return 'data-media="' + mediaStr.split(',').join('|') + '"';
});

fs.writeFileSync(mobFile, html, 'utf8');
console.log('Mobile index.html delimiter updated successfully');
