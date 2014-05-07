# Aggie API Documentation

## Log in
`GET /login`

### Parameters
Name | Type | Description
--- | --- | ---
username | String | Username
password | String | Password

### Response
```json
{
  "data": {
    "_id": "12345abcdef",
    "username": "admin",
    "provider": "aggie"
  }
}
```
