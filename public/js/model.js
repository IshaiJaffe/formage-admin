"use strict";
$(function() {
    //noinspection JSUnresolvedVariable
    var url = root + '/json/model/' + model;

    $('eval').each(function(){
        let elm = $(this);
        let html = eval(elm.attr('value'));
        $('<span>' + html + '</span>').insertAfter(elm);
        elm.remove();
    });
    $('.free_search').click(function() {
        var value = $(this).siblings('input').val();
        location.href = $(this).data('href').replace('__replace__', encodeURIComponent(value));
    });


    // highlight rows
    $('tbody tr').each(function() {
        var tr = $(this);
        $('.select-row', tr).change(function() {
            tr.toggleClass('warning', $(this).prop('checked'));
        });
    });

    $('.select-all-rows').click(function() {
        $(this).closest('table').find('.select-row')
            .prop('checked', $(this).prop('checked'))
            .trigger('change');
    });

    var $actions = $('#actions');
    var shownCount = 0;
    function onUpdateSelected() {
        var selectCount = $('.select-row:checked').length;
        var shownButtons = $('#actions button[data-global="true"]' + selectCount > 0 ? (',#actions button' + (selectCount > 1 ? '[data-multi="true"]' : '')) : '');
        var newShownCount = shownButtons.length;
        if(newShownCount != shownCount){
            if(!shownCount){
                shownButtons.show();
                $('#actions button').not(shownButtons).hide();
                $actions.fadeIn('fast');

            }
            else {
                if(newShownCount){
                    $actions.fadeOut('fast',function(){
                        shownButtons.show();
                        $('#actions button').not(shownButtons).hide();
                        $actions.fadeIn('fast');
                    });
                }
                else
                    $actions.fadeOut('fast');
            }
        }
        shownCount = newShownCount;
    }
    $('.select-row').on('change', onUpdateSelected);
    onUpdateSelected();
    $actions.find('button').click(function(e) {
        e.preventDefault();
        let ids = [];
        $('.select-row:checked').each(function(){
            ids.push($(this).closest('tr').attr('id'));
        });
        actionClicked($(this),ids);
    });

    var btn = $('button#reorder');
    $('tbody.sortable').sortable({
        items: 'tr',
        handle: '.list-drag',
        placeholder: 'sortable-placeholder',
        axis: 'y',
        create: function(e) {
            btn.click(function(){
                btn.button('loading');

                var data = {};
                $('tr', e.target).each(function(index){
                    var id = $(this).attr('id');
                    //noinspection JSUnresolvedVariable
                    data[id] = index + startIndex;
                });

                $.post(
                    url + '/order',
                    data,
                    function() {
                        btn.button('saved')
                            .delay(1000)
                            .fadeOut('slow')
                            .queue(function(next) {
                                btn.button('reset');
                                next();
                            });
                    }
                );
            })
        },
        change: function() {
            btn.fadeIn('fast');
        }
    });

    $('.copy-id').click(function(e) {
        e.preventDefault();
        if (!navigator.clipboard) {
            if (location.protocol === 'http:')
                alert("Works only on https");
            else
                alert("not working on this browser");
            return;
        }
        const $this = $(this);
        const $tr = $this.parents('tr');
        navigator.clipboard.writeText($tr.attr('id'));
        $this.attr('disabled', true);
        $this.text("Copied!");
        setTimeout(() => {
            $this.text("Copy Id");
            $this.attr('disabled', false);
        }, 8000);
    });
});
