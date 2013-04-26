$(function(){
    var el = $('#phabricator_audit_info').data('statuses'),
        reg = /r([A-Z0-9]+)([a-z0-9]{40})/,
        change_url = $('#phabricator_audit_info').data('change-url'),
        project_sid = $('#phabricator_audit_info').data('project-sid');
    $.each(el, function(key, value){
        var commit_id = key.replace(reg,'$2'),
            $rev_url = $('a[href*=\"/revisions/' + commit_id + '\"]');
        $rev_url.before('<span class=\"audit_info ' + value['status'] + '\"></span>');
        get_and_fill_commit_branches(project_sid, commit_id, $rev_url);

        if(change_url && value['url']){
            $rev_url.attr('href', value['url']).attr('target', 'blank');
        };
    })
});


function get_and_fill_commit_branches(project_sid, commit_id, $rev_url){
    $.ajax({
        url: '/phabmine/'+ project_sid + '/commit/' + commit_id + '/branches/',
        success: function(data){
            fill_branches($rev_url, $.parseJSON(data));
        }
    })
}


function fill_branches($rev_url, branches)
{
    $rev_url.parent().siblings('.wiki').after('<div class="branches_info"></div>');    
    var $branches_info = $rev_url.parents('.changeset').find('.branches_info');
    if(branches){
      $.each(branches, function(key, value){
          $branches_info.append('<span class="branch">' + value + '</span>')
      })
    }
}