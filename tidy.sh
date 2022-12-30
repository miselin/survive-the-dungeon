#!/bin/bash

python3 -m pylint survive
python3 -m pycodestyle --max-line-length=100 survive
python3 -m black survive
python3 -m mypy survive
python3 -m isort survive
