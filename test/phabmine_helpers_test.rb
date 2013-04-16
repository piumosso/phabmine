require_relative 'phabmine/test/test_helper.rb'
require_relative '../lib/phabricator_audits_hook_listener.rb'

class PollsControllerTest < ActionController::TestCase
  def test_settings_has_defaults
    settings = get_plugin_settings
    assert_equal settings['roles_to_hide_phabricator_url'], []
    assert_equal settings['redmine_phabricator_project_mapping'], {}
  end

  def test_that_fails
    assert_equal 1, 2
  end
end
