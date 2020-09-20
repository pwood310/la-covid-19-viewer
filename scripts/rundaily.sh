#! /usr/local/bin/zsh
set -x

# get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
echo "running $0 from script-directory = $SCRIPT_DIR"

if [ -z "$SCRIPT_DIR" ];
then
    echo "Exiting - can't find the script directory"
    exit 50
fi

cd "$SCRIPT_DIR" || { echo "Could not change to script directory $SCRIPT_DIR!" ; exit 51; }

GIT_TOP=`git rev-parse --show-toplevel`

if [ -z "$GIT_TOP" ];
then
    echo "Could not find top-level git directory from script directory $SCRIPT_DIR!"
    exit 52
fi

cd ~pwood310/src/GitHub/ScrapeLA
/usr/local/bin/python3 ./lib/retriever.py
myfile=/tmp/la_corona.$$.json
echo myfile=$myfile
/usr/local/bin/python3 ./lib/load_files.py -f -j $myfile ./cachedDailyHTML/LAHealth\ *

cp $myfile "$GIT_TOP/src/data/rawData.json"  || { echo 'rawData copy failed' ; exit 53; }

cd "$GIT_TOP" || { echo "Could not change to top-level web directory $GIT_TOP!" ; exit 54; }

sed -i.$$ 's/confirmedCases/confirmed_cases/' src/data/rawData.json
yarn run build
if [ $? -ne 0  ];
then
    echo "yarn run build failed with error $?"
    exit 55
fi

exit

/usr/local/bin/aws s3 sync build 's3://manylakes.io' --delete
if [ "$?"-ne 0  ];
then
    echo "aws s3 sync failed with error code $?"
    exit 56
fi
git diff --exit-code src/data/rawData.json
#diffcode=$?
