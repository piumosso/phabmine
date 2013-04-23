$(function(){
    var el = $('#phabricator_audit_info').data('statuses'),
        reg = /r([A-Z0-9]+)([a-z0-9]{40})/,
        change_url = $('#phabricator_audit_info').data('change-url');
    $.each(el, function(key, value){
        var $rev_url = $('a[href*=\"/revisions/' + key.replace(reg,'$2') + '\"]');
        $rev_url.before('<span class=\"audit_info ' + value['status'] + '\"></span>');
        $rev_url.parent().siblings('.wiki').after('<div class="branches_info"></div>');
        $branches_info = $rev_url.parents('.changeset').find('.branches_info');
        $.each(value['branches'], function(key, value){
            $branches_info.append('<span class="branch">' + value + '</span>')
        })
        if(change_url && value['url']){
            $rev_url.attr('href', value['url']).attr('target', 'blank');
        };
    })
});
