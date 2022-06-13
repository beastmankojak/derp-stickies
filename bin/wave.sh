#!/bin/sh

baseDir="$1"
baseFile="$(basename $baseDir).png"
wave="$2"
offset="$3"

ls "$wave" | xargs -I {} composite "$wave/{}" \( "$baseDir/$baseFile" -resize 45% \) -gravity south -geometry +$offset+0 -resize 320x320 "$baseDir/{}"
ffmpeg -y -f image2 -framerate 8 -i "$baseDir/wave-%02d.png" -f apng -plays 0 "$baseDir/$(basename $baseDir)-wave.apng"
rm "$baseDir"/wave-*.png