@echo off

pyinstaller --onefile --windowed -n survive --add-data 'ui;ui' --add-data 'fonts/*.ttf;fonts' --add-data 'tiles/*.png;tiles' --add-data 'themes;themes' --add-data 'words;words' -i survive.ico .\survive\main.py
