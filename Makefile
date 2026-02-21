# Convenience Makefile for a few common tasks

# venv: create a virtualenv with the dependencies installed
.PHONY: venv web-test web-regression web-check

venv:
	python -m virtualenv venv
	source venv/bin/activate
	pip install 'poetry==1.1.13'
	python -m poetry install

# web-regression: run deterministic Playwright regression flow for the web port
web-regression:
	./web/scripts/playwright/run_full_floor_regression.sh

# web-test: run unit tests for the web port
web-test:
	npm --prefix web test

# web-check: run compile + unit tests + deterministic regression
web-check:
	npm --prefix web run build
	npm --prefix web test
	./web/scripts/playwright/run_full_floor_regression.sh
