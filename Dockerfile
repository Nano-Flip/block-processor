FROM lsiobase/alpine:3.8
LABEL maintainer="TheLamer"

# Versioning
ARG SHA

RUN \
 echo "**** install runtime packages ****" && \
 apk add --no-cache \
	nodejs-npm \
	curl && \
 echo "**** Add forwarder script from Github ****" && \
 if [ -z ${SHA+x} ]; then \
	SHA=$(curl -sX GET "https://api.github.com/repos/Nano-Flip/block-processor/commits/master" \
	| awk '/sha/{print $4;exit}' FS='[""]'); \
 fi && \
 mkdir -p \
        /block-processor && \
 curl -o \
 /block-processor/app.js -L \
	"https://raw.githubusercontent.com/Nano-Flip/block-processor/${SHA}/app.js"

# copy local files
COPY root/ /

# ports and volumes
EXPOSE 3000
VOLUME /blocks
