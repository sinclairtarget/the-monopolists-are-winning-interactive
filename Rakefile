require 'rake/clean'

STATIC_FOLDER = 'dist/static'
JSON_DATA_FILE = 'dist/static/data.json'

desc 'Generate JSON data file'
task :convert => JSON_DATA_FILE

file JSON_DATA_FILE => ['sectors.json', 'industries.json', STATIC_FOLDER] do |t|
  sh %{ jq -s '{sectors: .[0], industries: .[1]}' sectors.json industries.json > #{t.name}}
end
CLOBBER.include(JSON_DATA_FILE)

rule(/(sectors|industries).json/) do
  sh 'Rscript convert-data.r'
end
CLEAN.include('sectors.json', 'industries.json')

directory STATIC_FOLDER

desc 'Deploy to sinclairtarget.com'
task :deploy do
  sh 'scp dist/* sinclair@sinclairtarget.com:/srv/www/sinclairtarget.com/concentration'
end
