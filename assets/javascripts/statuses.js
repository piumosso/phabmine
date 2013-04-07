$(function(){
    var el = $('#phabricator_audit_info').data('statuses'),
        reg = /r([A-Z0-9]+)([a-z0-9]{40})/,
        change_url = $('#phabricator_audit_info').data('change-url');
    $.each(el, function(key, value){
        var $rev_url = $('a[href*=\"/revisions/' + key.replace(reg,'$2') + '\"]');
        $rev_url.before('<span class=\"audit_info ' + value['status'] + '\"></span>');
        if(change_url && value['url']){
            $rev_url.attr('href', value['url']).attr('target', 'blank');
        };
    })
});
