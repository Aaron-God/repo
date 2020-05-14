#!/bin/sh
find . -name '*.DS_Store' -type f -delete
dpkg-deb -b a/ /Users/aaron/Desktop/github/repo/debs/
rm -r -f /Users/aaron/Desktop/github/repo/deb/a.deb





