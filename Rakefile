require 'rake/clean'

JS_SOURCE_FILES = FileList["src/*.js"]

task :default => :build

desc 'Bundle javascript'
task :build => 'dist/main.js'

desc 'Deploy to sinclairtarget.com'
task :deploy => 'dist/main.js' do
  sh 'scp dist/* sinclair@sinclairtarget.com:/srv/www/sinclairtarget.com/concentration'
end

file 'dist/main.js' => JS_SOURCE_FILES do
  sh 'yarn build'
end
CLOBBER.include('dist/main.js')
