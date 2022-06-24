#!/bin/bash
color="$1"

convert -size 900x750 canvas:transparent \( "Hand 1 - $color.png" -gravity south -geometry +43+0 \) -composite wave-01.png
convert -size 900x750 canvas:transparent \( "Hand 2 - $color.png" -gravity south -geometry +26+0 \) -composite wave-02.png
convert -size 900x750 canvas:transparent \( "Hand 3 - $color.png" -gravity south -geometry +25+0 \) -composite wave-03.png
convert -size 900x750 canvas:transparent \( "Hand 4 - $color.png" -gravity south -geometry +39+0 \) -composite wave-04.png
convert -size 900x750 canvas:transparent \( "Hand 5 - $color.png" -gravity south -geometry +56+0 \) -composite wave-05.png
convert -size 900x750 canvas:transparent \( "Hand 6 - $color.png" -gravity south -geometry +77+0 \) -composite wave-06.png

cp wave-05.png wave-07.png
cp wave-04.png wave-08.png
cp wave-03.png wave-09.png
cp wave-04.png wave-10.png
cp wave-05.png wave-11.png
cp wave-06.png wave-12.png
cp wave-05.png wave-13.png
cp wave-04.png wave-14.png
