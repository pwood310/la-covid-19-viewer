#! /usr/local/bin/zsh
set -x
cd ~pwood310/src/GitHub/ScrapeLA
/usr/local/bin/python3 ./lib/retriever.py
myfile=/tmp/la_corona.$$.json
echo myfile=$myfile
/usr/local/bin/python3 ./lib/load_files.py -f -j $myfile ./cachedDailyHTML/LAHealth\ *
cp $myfile ~pwood310/src/GitHub/scrape-la-web/src/data/rawData.json
cd ~pwood310/src/GitHub/scrape-la-web/
#/Users/pwood310/.nvm/versions/node/v12.13.1/bin/npm run build
npm run build
/usr/local/bin/aws s3 sync build 's3://manylakes.io' --delete
git diff --exit-code src/data/rawData.json
#diffcode=$?
