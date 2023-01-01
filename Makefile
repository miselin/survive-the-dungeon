# Convenience Makefile for a few common tasks

# venv: create a virtualenv with the dependencies installed
venv:
	python -m virtualenv venv
	source venv/bin/activate
	pip install 'poetry==1.1.13'
	python -m poetry install
