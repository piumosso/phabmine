redmine = File.join(File.dirname(__FILE__), 'redmine')

task :default => [:test]
     
desc 'Run tests'
task :test do
    exit false unless system %q{rake redmine:plugins:test PLUGIN=phabmine RAILS_ENV=test}
end


desc 'Drop and recreate the test database'
task :prepare do
  databaseyml = File.join(redmine, "config", "database.yml")
  unless File.exists? databaseyml
    File.open("redmine/config/database.yml", "w") do |f|
      f.write "test:\n  adapter: sqlite3\n  database: redmine_test\n  username: root\n  encoding: utf8\n"
    end
  end

  Dir.chdir(redmine) do
    exit false unless system %q{rake db:create db:migrate db:migrate_plugins RAILS_ENV=test}
    exit false unless system %q{rake redmine:load_default_data REDMINE_LANG=en RAILS_ENV=test}
  end
end
