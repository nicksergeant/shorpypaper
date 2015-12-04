#!/usr/local/bin/python3
from pyquery import PyQuery as pq
import requests
import subprocess
import time

tmpShorpyPhoto = '/tmp/dailyshorpy{}.jpg'.format(int(time.time()))

APPLESCRIPT = """/usr/bin/osascript<<END
    tell application "System Events"
        set desktopCount to count of desktops
        repeat with desktopNumber from 1 to desktopCount
            tell desktop desktopNumber
                set picture to "{}"
            end tell
        end repeat
    end tell
END"""


def main():

    # Load main site.
    root = 'http://www.shorpy.com'
    r = requests.get(root)
    j = pq(r.content)

    # Load first photo.
    first_photo = root + j('div.node div.content a').eq(1).attr('href')
    r = requests.get(first_photo)
    j = pq(r.content)
    image = j('img').eq(0).attr('src')

    # To reset the cached dailyshorpy.jpg.
    subprocess.Popen(APPLESCRIPT.format(
        '/Library/Desktop Pictures/Solid Colors/Solid Gray Light.png'),
        shell=True)

    with open(tmpShorpyPhoto, 'wb') as handle:
        request = requests.get(image, stream=True)
        for block in request.iter_content(1024):
            if not block:
                break
            handle.write(block)
        subprocess.Popen(APPLESCRIPT.format(tmpShorpyPhoto),
                         shell=True)


if __name__ == '__main__':
    main()
