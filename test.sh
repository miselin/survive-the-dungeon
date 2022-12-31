#!/bin/bash

python -m coverage run -m unittest discover -s survive
python -m coverage html