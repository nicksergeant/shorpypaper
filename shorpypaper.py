#!/usr/bin/python
from pyquery import PyQuery as pq
import requests
import subprocess

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

    with open('/tmp/dailyshorpy.jpg', 'wb') as handle:
        request = requests.get(image, stream=True)

        for block in request.iter_content(1024):
            if not block:
                break
            handle.write(block)

        applescript = """/usr/bin/osascript<<END
tell application "Finder"
set desktop picture to POSIX file "%s"
end tell
END"""
        subprocess.Popen(applescript % '/tmp/dailyshorpy.jpg', shell=True)


if __name__ == '__main__':
    main()
