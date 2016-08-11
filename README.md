# avai-dynamo-tools

Saves schema, drops Dynamo DB table and restores schema

Usage:

```
dynamo-tools --table my-table [--key AK...AA] [--secret 7a...IG]
```

key/secret are optional and are otherwise read from ~/.aws/credentials [default]