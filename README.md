# garbagefire
Convert a firebase json dump into mongoimport compatible json

```shell
for i in `ls *.json`; do mongoimport -c `basename $i .json` -d graphql -h 127.0.0.1:27017 --file $i --type json; done
```
