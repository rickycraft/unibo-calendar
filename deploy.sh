#!/bin/bash

# Builds the image
docker build -t unibo-calendar:latest . &&
  echo "Image built" &&
  docker container stop unibo-calendar &&
  docker container rm unibo-calendar &&
  echo "Container stopped" &&
  docker run -p 80:80 -d --name unibo-calendar --restart "unless-stopped" unibo-calendar &&
  echo "Container started"
