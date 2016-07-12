# avai-dynamo-tools

## drop-table-restore-schema

Drops Dynamo DB table and restores schema only
Usage:

```
drop-table-restore-schema --table my-table [--key AK...AA] [--secret 7a...IG]
```

key/secret are optional and are otherwise read from ~/.aws/credentials [default]