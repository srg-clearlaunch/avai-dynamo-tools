
var jsonfile = require('jsonfile');
var async = require('async');

module.exports.getschema = function(dynamo, tablename, cb){
async.waterfall([
    //get the table description
    function(callback){
        var params = {
            TableName: tablename
        }
        console.log('getting table description');
        dynamo.describeTable(params, function(err, results){
            if(err || !results.Table){
                if (err){
                    console.log(err);
                }
                return callback('table not found');
            }
            return callback(err, results.Table);
        });
    },
    function(table, callback){
        jsonfile.writeFile(process.cwd() + '/'+tablename+'.json', table, {spaces: 2}, function (err) {
            if (err) {
                console.log(err);
            }
            return callback(err, table);
        });
    },
], function(err, table){
    return cb(err, tablename+'.json');
});
}

