redmine = File.join(File.dirname(__FILE__), 'redmine')

task :default => [:test]
     
desc 'Run tests'
task :test do
  Dir.chdir(redmine) do
    exit false unless system %q{rake test:plugins PLUGIN=phabmine RAILS_ENV=test}
  end
end


desc 'Drop and recreate the test database'
task :prepare do
  databaseyml = File.join(redmine, "config", "database.yml")
  unless File.exists? databaseyml
    File.open("redmine/config/database.yml", "w") do |f|
      f.write "test:\n  adapter: mysql2\n  database: redmine_test\n  username: root\n  encoding: utf8\n"
    end
  end
end