require 'json'

class PollsHookListener < Redmine::Hook::ViewListener
  def view_issues_show_details_bottom(context={} )
    def get_changesets_statuses(changesets)
      # Ask Phabricator for statuses
      return Hash[
        "93c8bc77d269d52fa8e25bde891532d37315791a" => "accepted",
        "dc169d85d6e93d05386a7ff9a82cf3996d2bf59a" => "raised_concern"
      ].to_json
    end
    issue = Issue.find(context[:issue])
    statuses = get_changesets_statuses(issue.changesets)
    return "<style type=\"text/css\">.accepted{background-color:green;}.raised_concern{background-color:red;}.audit_info{display:inline-block;width:10px;height:10px;border-radius:5px;margin-left:5px;}</style>" + 
           "<script src=\"http://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js\"></script>" + 
           "<script>$(function(){ var el = $(\'#phabricator_audit_info\').data('statuses'); console.log(el['93c8bc77d269d52fa8e25bde891532d37315791a']);" +
           "$.each(el, function(key, value){console.log('!');console.log(\'a[title=\ \"Ревизия \' + key.substring(0,8) + \'\"]\');" +
           "$(\'a[title=\"Ревизия \' + key.substring(0,8) + \'\"]\').before('<span class=\"audit_info ' + value + '\"></span>')})});" + 
	   "</script>" + 
           "<div id=\"phabricator_audit_info\"style=\"display:none\"data-statuses=\'#{statuses}\'></div>"
  end
end
