# unibo-calendar
Application to add google calendar unibo lessons

## Use with docker

Example of a docker-compose file with environment variables to compile
```yaml
---
version: "3"
services:
  unibocalendar:
    container_name: "unibocalendar"
    image: "ghcr.io/rickycraft/unibo-calendar:main"
    ports:
      - "80:80"
    environment:
      DATABASE_URL: "mysql://"
      NEXT_PUBLIC_ADMIN_TOKEN: ""
```
