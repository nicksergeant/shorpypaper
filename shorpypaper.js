#!/opt/homebrew/bin/node

const fs = require('fs');
const { execSync } = require('child_process');

const tmpShorpyPhoto = `/tmp/dailyshorpy${Math.floor(Date.now() / 1000)}.jpg`;

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
    const root = 'http://www.shorpy.com';
    const mainPage = await fetch(root).then(r => r.text());

    // Find photo page links (div.node div.content a hrefs)
    const photoLinks = [...mainPage.matchAll(/div class="node"[\s\S]*?div class="content"[\s\S]*?<a href="([^"]+)"/g)];
    if (!photoLinks.length) throw new Error('No photo links found');
    const href = photoLinks[0][1];
    const firstPhotoLink = href.startsWith('http') ? href : root + href;

    // Load photo page, find the main photo (in /files/images/)
    const photoPage = await fetch(firstPhotoLink).then(r => r.text());
    const imgMatch = photoPage.match(/src="([^"]+\/files\/images\/[^"]+)"/);
    if (!imgMatch) throw new Error('No image found');
    // Get full-size by removing .preview from filename
    const imageUrl = imgMatch[1].replace('.preview', '');

    // Reset desktop
    execSync(APPLESCRIPT.replace('{}', '/Library/Desktop Pictures/Solid Colors/Solid Gray Light.png'),
      { shell: true });

    // Download and set wallpaper
    const imageData = await fetch(imageUrl).then(r => r.arrayBuffer());
    fs.writeFileSync(tmpShorpyPhoto, Buffer.from(imageData));
    execSync(APPLESCRIPT.replace('{}', tmpShorpyPhoto), { shell: true });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
