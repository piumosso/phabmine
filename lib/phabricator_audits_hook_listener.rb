# encoding: utf-8
require 'json'
require_relative '../ruby-phabricator/shortcuts.rb'


def get_changesets_statuses changesets, project_sid
  # Ask Phabricator for statuses
  if changesets.empty?
    return {}
  else
    arcrc_path = ENV['PHABMINE_ARCRC_PATH'] || File.expand_path('./plugins/phabmine/.arcrc')
    data = get_commit_status project_sid, changesets, arcrc_path

    # uncomment for debug
#        data = {'b84305a4' => {'status'=> 'accepted', 'url'=> 'example.com'}}
  end
  return data.to_json.html_safe
end


def get_phabricator_project_slug(redmine_phabricator_project_mapping, redmine_slug)
  if redmine_phabricator_project_mapping.include? redmine_slug
    return redmine_phabricator_project_mapping[redmine_slug]
  else
    return redmine_slug.upcase
  end
end

def parse_parameter(raw_param_value, default='')
  begin
    return JSON.parse raw_param_value
  rescue TypeError, JSON::ParserError
    return default
  end
end

def get_plugin_settings
  settings_info = [
    {'name'=> 'roles_to_hide_phabricator_url', 'default'=> [], 'is_json' => true},
    {'name'=> 'redmine_phabricator_project_mapping', 'default'=> {}, 'is_json' => true},
    {'name'=> 'phabricator_login', 'default'=> '', 'is_json' => false},
    {'name'=> 'phabricator_auth_cookie', 'default'=> '', 'is_json' => false},
    {'name'=> 'is_gitflow_project', 'default'=> '', 'is_json' => false},
    {'name'=> 'gitflow_instance_project_mapping', 'default'=> {}, 'is_json' => true},
    {'name'=> 'show_tickets_branches', 'default'=> '', 'is_json' => false},
    {'name'=> 'show_commits_branches', 'default'=> '', 'is_json' => false},
  ]
  settings = {}
  settings_info.each{|param_info|
    raw_param_value = Setting.plugin_phabmine[param_info['name']]
    if raw_param_value.nil?
      raw_param_value = ''
    end
    if param_info['is_json']
      param_value = parse_parameter raw_param_value, param_info['default']
    else
      if raw_param_value.empty?
        param_value = param_info['default']
      else
        param_value = raw_param_value
      end
    end
    settings[param_info['name']] = param_value
  }
  settings.default = ''
  return settings
end


class PollsHookListener < Redmine::Hook::ViewListener
  def view_issues_show_details_bottom(context={} )
    settings = get_plugin_settings
    roles_to_hide_phabricator_url = settings['roles_to_hide_phabricator_url']
    redmine_phabricator_project_mapping = settings['redmine_phabricator_project_mapping']

    issue = Issue.find(context[:issue])
    user_roles = User.current.roles_for_project(context[:project]).map{|e| e.id}
    show_phabricator_url = (user_roles & roles_to_hide_phabricator_url).empty?
    project_sid = get_phabricator_project_slug(redmine_phabricator_project_mapping, issue.project.identifier)
    commits_data = get_changesets_statuses(issue.changesets.map{|c| c.revision}, project_sid)
    context[:controller].send(:render_to_string, {
      :partial => "/phabmine/statuses",
      :locals => {
        :statuses => commits_data,
        :show_phabricator_url => show_phabricator_url,
        :project_sid => project_sid,
        :show_tickets_branches => settings['show_tickets_branches'] == '1',
        :show_commits_branches => settings['show_commits_branches'] == '1',
      }
    })
  end
end
