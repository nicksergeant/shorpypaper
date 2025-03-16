#!/opt/homebrew/bin/node

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Create a temporary file with timestamp to avoid caching issues
const tmpShorpyPhoto = `/tmp/dailyshorpy${Math.floor(Date.now() / 1000)}.jpg`;

// AppleScript to set the desktop wallpaper
const APPLESCRIPT = `/usr/bin/osascript<<END
    tell application "System Events"
        set desktopCount to count of desktops
        repeat with desktopNumber from 1 to desktopCount
            tell desktop desktopNumber
                set picture to "{}"
            end tell
        end repeat
    end tell
END`;

async function main() {
  try {
    // Load main site
    const root = 'http://www.shorpy.com';
    const { data: mainPage } = await axios.get(root);
    const $ = cheerio.load(mainPage);
    
    // Find first photo link
    const firstPhotoLink = root + $('div.node div.content a').eq(1).attr('href');
    
    // Load the photo page
    const { data: photoPage } = await axios.get(firstPhotoLink);
    const $photo = cheerio.load(photoPage);
    const imageUrl = $photo('img').eq(0).attr('src');
    
    // Reset the desktop to clear any cache
    execSync(APPLESCRIPT.format('/Library/Desktop Pictures/Solid Colors/Solid Gray Light.png'), 
      { shell: true });
    
    // Download the image
    const { data: imageData } = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    
    // Save the image
    fs.writeFileSync(tmpShorpyPhoto, Buffer.from(imageData));
    
    // Set as wallpaper
    execSync(APPLESCRIPT.replace('{}', tmpShorpyPhoto), { shell: true });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Add string replace method similar to Python format
if (!String.prototype.format) {
  String.prototype.format = function(value) {
    return this.replace('{}', value);
  };
}

main();
