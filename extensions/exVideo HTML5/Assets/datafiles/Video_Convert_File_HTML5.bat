@echo off
title Convert Video
cls

:: get filename
for /R %1 %%f in (.) do (
	set CurrentFilename=%%~nf
)

echo Converting webm...

:: webm
ffmpeg -i %1 -loglevel info -c:v libvpx -b:v 1M -c:a libvorbis "%CurrentFilename%.webm"

echo Converting mp4...

:: mp4
ffmpeg -i %1 -codec:v libx264 -profile:v high -preset slow -b:v 500k -maxrate 500k -bufsize 1000k -vf scale=-1:480 -threads 0 -acodec libvo_aacenc -b:a 128k "%CurrentFilename%.mp4"
echo Converting ogv...

:: ogv
ffmpeg -i %1 -acodec libvorbis -vcodec libtheora -ac 2 -ab 96k -ar 44100 -b:v 819200 "%CurrentFilename%.ogv"

echo Complete!