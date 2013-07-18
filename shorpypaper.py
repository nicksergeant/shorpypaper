#!/usr/bin/python
from pyquery import PyQuery as pq
import requests
import subprocess

APPLESCRIPT = """/usr/bin/osascript<<END
set path_to_shorpy to POSIX file "%s"
tell application "Finder"
  tell application "System Events"
    set theDesktops to a reference to every desktop
    set picture of item 1 of the theDesktops to file path_to_shorpy
    set picture of item 2 of the theDesktops to file path_to_shorpy
    set picture of item 3 of the theDesktops to file path_to_shorpy
  end tell
  set desktop picture to file path_to_shorpy
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

    with open('/tmp/dailyshorpy.jpg', 'wb') as handle:

        # To reset the cached dailyshorpy.jpg.
        subprocess.Popen(APPLESCRIPT % '/Library/Desktop Pictures/Solid Colors/Solid Gray Light.png', shell=True)
        request = requests.get(image, stream=True)

        for block in request.iter_content(1024):
            if not block:
                break
            handle.write(block)

        subprocess.Popen(APPLESCRIPT % '/tmp/dailyshorpy.jpg', shell=True)


if __name__ == '__main__':
    main()
