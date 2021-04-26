---
name: API Issue card
about: API document code adder
title: 'API: some API Features'
labels: server
assignees: ''

---

### TODO
1. [ ] login API
2. [ ] signup  API

### Estimated Time: `2h`

## login API
- Endpoint: `https://localhost:4000/user/login`
- header : `null`
- request body
```json
{
    "email": "string",
    "password": "string"
}
```

- response body
```json
{
    "accessTokne": "Token",
    "refreshToken":"Token"
}
```

## signup API
- Endpoint: `https://localhost:4000/user/signup`
- header: `null`
- request body
 ```json
{
    "email": "string",
    "password": "string",
    "userName":"string",
    "profileimg?":"buffer as string"
}
```
- response body
```json
{
    "message": "ok"
}
```
