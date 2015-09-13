#!/bin/bash
boot2docker up
eval "$(boot2docker shellinit)"
docker run -p 80:80 -p 8080:8080 -p 5000:5000/udp -v //c/Users/BandePassante/Desktop/sewio-data:/var/lib/mysql -it xseignard/sewio-rtls:latest
