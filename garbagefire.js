const crypto = require('crypto');

// put yer file here
const json = fs.readFileSync('fb-staging.json', {encoding: 'utf8'});
const data = JSON.parse(json);
const keys = new Set(Object.keys(data));
const keysSingular = new Set(Object.keys(data).map(s => s.substring(0, s.length - 1)));

var PUSH_CHARS = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz";
function decode(id) {
  id = id.substring(0,8);
  var timestamp = 0;
  for (var i=0; i < id.length; i++) {
    var c = id.charAt(i);
    timestamp = timestamp * 64 + PUSH_CHARS.indexOf(c);
  }
  return timestamp;
}

function wrapId(id){
    return { '$oid': Math.floor(decode(id)/1000).toString(16) + crypto.randomBytes(8).toString('hex') };
}

exports.process = function(){
    Object.keys(data).map(type => {
        const transformed = Object.keys(data[type]).map((k) => {
            const val = data[type][k];
            const id = wrapId(k);
            var fields = {};
            for(let[field, fieldValue] of Object.entries(val)){
                if(keys.has(field)){
                    // multi ref
                    fields[field] = Object.keys(fieldValue).map(id => wrapId(id));
                } else if(keysSingular.has(field)){
                    // single ref
                    fields[field] = wrapId(fieldValue);
                } else {
                    fields[field] = fieldValue;
                }
            }

            return {
                '__v': 0,
               '_id': id,
               ...fields
            };
        });
        const joined = transformed.map(o => JSON.stringify(o)).join('\n');
        fs.writeFileSync(type + '.json', joined, {encoding: 'utf8'});
    });
}
