#!/bin/bash

python3 -m pylint src
python3 -m pycodestyle --max-line-length=100 src
python3 -m black src
python3 -m mypy src
python3 -m isort -rc src
