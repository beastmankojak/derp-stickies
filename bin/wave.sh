#!/bin/sh

baseDir="$1"
baseFile="$(basename $baseDir).png"
wave="$2"
offset="$3"
extension="$4"

ls "$wave" | xargs -I {} composite "$wave/{}" \( "$baseDir/$baseFile" -resize 45% \) -gravity south -geometry +$offset+0 -resize 320x320 "$baseDir/{}"
if [ "$extension" = "gif" ]; then
  #ffmpeg -y -f image2 -framerate 8 -i "$baseDir/wave-%02d.png" "$baseDir/wave.gif"
  ffmpeg -y -f image2 -i "$baseDir/wave-%02d.png" -vf palettegen "$baseDir/palette.png"
  ffmpeg -y -f image2 -framerate 8 -thread_queue_size 16 -i "$baseDir/wave-%02d.png" -i "$baseDir/palette.png" -filter_complex "paletteuse=dither=none" "$baseDir/wave.gif"
else
  ffmpeg -y -f image2 -framerate 8 -i "$baseDir/wave-%02d.png" -f apng -plays 0 "$baseDir/wave.apng"
fi
rm "$baseDir"/wave-*.png "$baseDir"/palette.png