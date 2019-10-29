# 5.1 change: FROM node:10 as build
FROM node:12 as build
WORKDIR /build

COPY . /build

# 5.1 change: RUN cd client && npm install && npm run build && cd /build && npm install && npm run build && npm install pm2 --global
# no longer needs pm2
RUN cd /build && npm install && npm run build

# SWITCH BETWEEN CLIENT DEV MODE OR PROD
RUN cd /build/client && npm install && npm run build 
# RUN cd /build/client && npm install && npm run build_dev 

# Prep for running: Create directory for config with appropriate permissions 
# (It should be mounted in as a volume - no write permissions from inside)
# Also give node the capabilities to listen on low ports as a non-root user
RUN mkdir -m 0500 /etc/iotnxt /etc/certs 
RUN chown nobody:nogroup /etc/iotnxt /etc/certs

# Update alpine packages
RUN apt-get update && apt-get dist-upgrade -y && apt-get autoremove -y && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set capabilities to allow low port numbers to be used as non-root users
RUN apt-get update && apt-get install -y libcap2-bin && apt-get clean && rm -rf /var/lib/apt/lists/* && setcap cap_net_bind_service=+ep /usr/local/bin/node

# Hack to get the config usable in a reasonable place
# 5.0 OLD: RUN ln -sf /etc/iotnxt/prototype.json /iotconfig.json
# Now iotconfig.json file is in root of package.
RUN ln -sf /etc/iotnxt/prototype.json /build/iotconfig.json

# Interface documentation
VOLUME /etc/iotnxt
VOLUME /etc/certs
EXPOSE 443/tcp 8883/tcp

# Startup script
#COPY container_start.sh /build/build
#RUN chmod +x /build/build/container_start.sh

# Run as a limited user
USER nobody
WORKDIR /build/build

######## Plain node.js startup
ENTRYPOINT ["/usr/local/bin/node","/build/build/server/main.js"]
######## PM2 startup
# Set the HOME varaible to somewhere that PM2 can write
#ENV HOME=/tmp
#ENTRYPOINT ["/bin/bash","/build/build/container_start.sh"]
#######################################################################
