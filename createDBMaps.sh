#!/bin/bash
firstPage=$(curl -s "https://stratus.network/maps/all")
lastPageNumber=$(echo -n $firstPage | pup 'ul.pagination:nth-child(1) > li:nth-child(7) > a:nth-child(1) attr{href}' | pcregrep -o1 "^\/maps\/all\?page=([\w]+)")
incrementMapNumber=0
cp db.template.json db.json
for (( i=1; i<=$lastPageNumber; i++ ))
do
    pageHTML=$(curl -s "https://stratus.network/maps/all?page=$i")
    mapNames=$(echo -n $pageHTML | pup '.map.thumbnail > div:nth-child(2) > h3:nth-child(1) > a:nth-child(1) text{}')
    mapLinks=$(echo -n $pageHTML | pup '.map.thumbnail > div:nth-child(1) > a:nth-child(2) > img:nth-child(1) attr{src}')
    numberOfMaps=$(echo -n "$mapNames" | wc -l)
    for (( j=1; j<=$numberOfMaps; j++ ))
    do
        mapName=$(echo -n "$mapNames" | sed -n "$j p")
        mapURLImage=$(echo -n "$mapLinks" | sed -n "$j p")
        cat db.json | jq --arg mapName "$mapName" --arg incrementMapNumber "$incrementMapNumber" '.maps.maps[$incrementMapNumber | tonumber].id = $incrementMapNumber' > temp_db.json && mv temp_db.json db.json
        cat db.json | jq --arg mapName "$mapName" --arg incrementMapNumber "$incrementMapNumber" '.maps.maps[$incrementMapNumber | tonumber].name = $mapName' > temp_db.json && mv temp_db.json db.json
        incrementMapNumber=$((incrementMapNumber+1))
    done
done