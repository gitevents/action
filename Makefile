#!make
MAKEFLAGS += --silent
include .env
export $(shell sed 's/=.*//' .env)

dev:
		act --env GITHUB_REPOSITORY -s GITHUB_TOKEN workflow_dispatch --container-architecture linux/amd64

.PHONY: dev
