# encoding: utf-8
require 'json'
require_relative '../ruby-phabricator/shortcuts.rb'


class PollsHookListener < Redmine::Hook::ViewListener
  def view_issues_show_details_bottom(context={} )
    def get_changesets_statuses(changesets)
      # Ask Phabricator for statuses
	print 'chs', changesets, changesets.empty?, changesets.nil?
      if changesets.empty?
	return {}
      else
        data = get_commit_status 'PAT', changesets, '/home/redmine/redmine_app/plugins/redmine_phabricator_audits/.arcrc'
      end
#      data = changesets
      return data.to_json
    end
    issue = Issue.find(context[:issue])
    print issue
    statuses = get_changesets_statuses(issue.changesets.map{|c| c.revision})
    return "<style type=\"text/css\">.in_progress{background-color:gray;}.accepted{background-color:green;}.conserned{background-color:red;}.audit_info{display:inline-block;width:10px;height:10px;border-radius:5px;margin-left:2px;margin-right:5px;}</style>" + 
#           "<script src=\"http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js\"></script>" + 
           "<script>$(function(){ var el = $('#phabricator_audit_info').data('statuses');" +
           "$.each(el, function(key, value){" +
           "$('a[title=\"Ревизия ' + key.substring(4,12) + '\"]').before('<span class=\"audit_info ' + value + '\"></span>')})});" + 
	   "</script>" + 
           "<div id=\"phabricator_audit_info\"style=\"display:none\"data-statuses='#{statuses}'></div>"
  end
end
