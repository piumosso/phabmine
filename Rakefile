redmine = File.join(File.dirname(__FILE__), 'redmine')

task :default => [:test]

desc 'Run tests'
task :test do
  Dir.chdir(redmine) do
    exit false unless system %q{rake test:plugins PLUGIN=redmine_cmi RAILS_ENV=test}
  end
end