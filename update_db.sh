#!/usr/bin/bash

repo_list="core cross_tools extra extra32 games gnome kde layers pentest perl proprietary python server xfce"

cd repos
for q in ${repo_list}
do
	wget https://files.martinvlba.eu/evolinx/$q/packages/$q.db.tar.gz
	wget https://files.martinvlba.eu/evolinx/$q/packages/$q.files.tar.gz
done
cd ..

for i in ${repo_list}
do
	# Update DB
	./manage.py reporead x86_64 repos/$i.db.tar.gz

	# Update Files
	./manage.py reporead --filesonly x86_64 repos/$i.files.tar.gz
done
rm -rf repos/*
