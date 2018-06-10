FROM alpine

RUN apk update && \
	apk upgrade && \
	apk add git

EXPOSE 8080:8080