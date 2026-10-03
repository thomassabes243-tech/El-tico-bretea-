@echo off
setlocal
set APP_HOME=%~dp0
set WRAPPER_DIR=%APP_HOME%gradle\wrapper
set WRAPPER_JAR=%WRAPPER_DIR%\gradle-wrapper.jar
set WRAPPER_URL=https://services.gradle.org/distributions/gradle-8.13-wrapper.jar
set WRAPPER_SHA256=81a82aaea5abcc8ff68b3dfcb58b3c3c429378efd98e7433460610fecd7ae45f

if not exist "%WRAPPER_JAR%" goto bootstrap
for /f "tokens=*" %%H in ('powershell -NoProfile -Command "(Get-FileHash -Algorithm SHA256 '%WRAPPER_JAR%').Hash.ToLower()"') do set ACTUAL_SHA=%%H
if /I "%ACTUAL_SHA%"=="%WRAPPER_SHA256%" goto run

echo ERROR: Gradle wrapper JAR checksum mismatch. 1>&2
del /q "%WRAPPER_JAR%" 2>nul

:bootstrap
if not exist "%WRAPPER_DIR%" mkdir "%WRAPPER_DIR%"
echo Gradle wrapper JAR not found; downloading verified Gradle 8.13 wrapper... 1>&2
powershell -NoProfile -Command "$ProgressPreference='SilentlyContinue'; Invoke-WebRequest -UseBasicParsing -Uri '%WRAPPER_URL%' -OutFile '%WRAPPER_JAR%'"
if errorlevel 1 goto error
for /f "tokens=*" %%H in ('powershell -NoProfile -Command "(Get-FileHash -Algorithm SHA256 '%WRAPPER_JAR%').Hash.ToLower()"') do set ACTUAL_SHA=%%H
if /I not "%ACTUAL_SHA%"=="%WRAPPER_SHA256%" goto error

:run
java %JAVA_OPTS% -classpath "%WRAPPER_JAR%" org.gradle.wrapper.GradleWrapperMain %*
exit /b %ERRORLEVEL%

:error
del /q "%WRAPPER_JAR%" 2>nul
echo ERROR: Unable to obtain the verified Gradle 8.13 wrapper JAR. 1>&2
exit /b 1
